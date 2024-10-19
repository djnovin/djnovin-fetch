import {
  RequestConfig,
  RequestInterceptor,
  ResponseInterceptor,
} from "../shared/types";
import { ConfigManager } from "./ConfigManager";
import { ErrorHandler } from "./ErrorHandler";

interface RequestInit {}

/**
 * FetchBuilder is a class that helps to build and execute fetch requests.
 * @template T The type of the request body.
 * @template R The type of the response body.
 * @class FetchBuilder
 * @implements {FetchBuilder<T>}
 * @example const [error, data] = await new FetchBuilder()
 *   .setUrl("https://api.example.com"):
 *   .setMethod("GET")
 *   .setHeaders({ "Content-Type": "application/json" })
 *   .execute();
 */
class FetchBuilder<T> {
  private config: RequestConfig<T> = {
    url: "",
    method: "GET",
    headers: {},
    responseType: "json",
    body: undefined,
    timeout: undefined,
    maxRetries: 3,
    retryDelay: 1000,
  };

  private requestInterceptors: RequestInterceptor<T>[] = [];
  private responseInterceptors: ResponseInterceptor<any>[] = [];

  /**
   * Prepares the request options for the fetch call.
   * @param config The request configuration.
   * @returns {RequestInit} The fetch options.
   */
  private getRequestOptions(config: RequestConfig<T>): RequestInit {
    return {
      method: config.method,
      headers: config.headers,
      body: this.getRequestBody(),
      signal: new AbortController().signal,
    };
  }

  /**
   * Merges global and local configurations.
   * @returns {RequestConfig<T>} The effective merged configuration.
   */
  private getEffectiveConfig(): RequestConfig<T> {
    const globalConfig = ConfigManager.getInstance().getGlobalConfig();
    const mergedConfig = {
      ...globalConfig,
      ...this.config,
      headers: {
        ...globalConfig?.headers,
        ...this.config.headers,
      } as RequestConfig<T>["headers"],
    };

    if (
      typeof mergedConfig.body === "object" &&
      !(mergedConfig.body instanceof FormData) &&
      !(mergedConfig.body instanceof Blob)
    ) {
      if (mergedConfig.headers) {
        mergedConfig.headers["Content-Type"] =
          mergedConfig.headers["Content-Type"] || "application/json";
      }
    }

    return mergedConfig;
  }

  /**
   * Updates the configuration with the provided key-value pair.
   * @param key The key of the configuration to update.
   * @param value The value to set.
   * @returns {this} The current instance to allow chaining.
   */
  private updateConfig<K extends keyof RequestConfig<T>>(
    key: K,
    value: RequestConfig<T>[K],
  ): this {
    this.config[key] = value;
    return this;
  }

  /**
   * Adds a response interceptor.
   * @param interceptor The response interceptor to add.
   * @returns {this} The current instance to allow chaining.
   */
  addRequestInterceptor(interceptor: RequestInterceptor<T>): this {
    this.requestInterceptors.push(interceptor);
    return this;
  }

  /**
   * Adds a response interceptor.
   * @param interceptor The response interceptor to add.
   * @returns {this} The current instance to allow chaining.
   */
  addResponseInterceptor<R>(interceptor: ResponseInterceptor<R>): this {
    this.responseInterceptors.push(interceptor);
    return this;
  }

  /**
   * Sets the request URL.
   * @param url The URL to set.
   * @returns {this} The current instance to allow chaining.
   */
  setUrl(url: string): this {
    return this.updateConfig("url", url);
  }

  /**
   * Sets the request method.
   * @param method The HTTP method to set.
   * @returns {this} The current instance to allow chaining.
   */
  setMethod(method: RequestConfig<T>["method"]): this {
    return this.updateConfig("method", method);
  }

  /**
   * Sets the request headers.
   * @param headers The headers to set.
   * @returns {this} The current instance to allow chaining.
   */
  setHeaders(headers: RequestConfig<T>["headers"]): this {
    return this.updateConfig("headers", headers);
  }

  setTimeout(timeout: number): FetchBuilder<T> {
    this.config.timeout = timeout;
    return this;
  }

  /**
   * Sets the request body.
   * @param body The body to set.
   * @returns {this} The current instance to allow chaining.
   */
  setBody(body: RequestConfig<T>["body"]): this {
    return this.updateConfig("body", body);
  }

  /**
   * Sets the maximum number of retries for the request.
   * @param maxRetries The maximum number of retries.
   * @returns {this} The current instance to allow chaining.
   */
  setMaxRetries(maxRetries: number): this {
    return this.updateConfig("maxRetries", maxRetries);
  }

  /**
   * Sets the delay between retries.
   * @param retryDelay The delay in milliseconds.
   * @returns {this} The current instance to allow chaining.
   */
  setRetryDelay(retryDelay: number): this {
    return this.updateConfig("retryDelay", retryDelay);
  }

  /**
   * Sets the response type.
   * @param responseType The response type to set.
   * @returns {this} The current instance to allow chaining.
   */
  setResponseType(responseType: any): this {
    return this.updateConfig("responseType", responseType);
  }

  /**
   * Implements exponential backoff for retries.
   * @param retryCount The current retry count.
   */
  private async backoff(retryCount: number): Promise<void> {
    const delay = (this.config.retryDelay || 1000) * Math.pow(2, retryCount);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Parses the response based on the configured response type.
   * For large JSON responses, it uses streaming to avoid loading the entire response into memory at once.
   * @param response The fetch response.
   * @returns {Promise<any>} The parsed response.
   */
  private async parseResponse(response: Response): Promise<any> {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    switch (this.config.responseType) {
      case "json":
        // Stream the JSON response if it's large
        if (response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let jsonString = "";
          let result = await reader.read();

          while (!result.done) {
            jsonString += decoder.decode(result.value, { stream: true });
            result = await reader.read();
          }

          return JSON.parse(jsonString);
        } else {
          // Fallback if streaming is not supported
          return response.json();
        }
      case "text":
        return response.text();
      case "blob":
        return response.blob();
      case "arrayBuffer":
        return response.arrayBuffer();
      default:
        throw new Error("Unsupported response type");
    }
  }

  /**
   * Returns the appropriate request body based on the configuration.
   * @returns {BodyInit | null} The request body.
   */
  private getRequestBody(): BodyInit | null {
    const { body } = this.config;

    if (!body) {
      return null;
    }

    if (
      body instanceof FormData ||
      body instanceof Blob ||
      typeof body === "string"
    ) {
      return body;
    }
    return JSON.stringify(body);
  }

  /**
   * Executes the request with retry logic.
   * @returns {Promise<[Error | null, R | null]>} The result of the request.
   */
  async execute<R = any>(): Promise<[Error | null, R | null]> {
    let attempts = 0;
    let config = this.getEffectiveConfig();
    const maxRetries = this.config.maxRetries || 0;

    for (const interceptor of this.requestInterceptors) {
      config = interceptor(config);
    }

    while (attempts <= maxRetries) {
      try {
        const controller = new AbortController();
        const signal = controller.signal;

        const options = this.getRequestOptions(config);
        const response = await fetch(config.url, options);

        if (!response.ok) {
          throw ErrorHandler.createError(response);
        }

        let parsedResponse = (await this.parseResponse(response)) as R;

        for (const interceptor of this.responseInterceptors) {
          parsedResponse = interceptor(parsedResponse);
        }

        return [null, parsedResponse];
      } catch (error) {
        const handledError = ErrorHandler.handleError(error as Error);

        if (attempts >= maxRetries || !ErrorHandler.isRetryable(handledError)) {
          return [handledError, null];
        }

        attempts++;
        await this.backoff(attempts);
      }
    }

    return [new Error("Unknown error"), null];
  }
}

export { FetchBuilder };
