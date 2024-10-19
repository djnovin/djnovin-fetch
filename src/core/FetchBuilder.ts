import {
  RequestConfig,
  RequestInterceptor,
  ResponseInterceptor,
} from "../shared/types";
import { ConfigManager } from "./ConfigManager";
import { ErrorHandler } from "./ErrorHandler";

export interface FetchBuilder<T> {
  setBody(body: RequestConfig<T>["body"]): this;
  setHeaders(headers: RequestConfig<T>["headers"]): this;
  setMaxRetries(maxRetries: number): this;
  setMethod(method: RequestConfig<T>["method"]): this;
  setMinRetries(minRetries: number): this;
  setResponseType(responseType: RequestConfig<T>["responseType"]): this;
  setRetryDelay(retryDelay: number): this;
  setUrl(url: string): this;
}

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
class FetchBuilder<T> implements FetchBuilder<T> {
  private config: RequestConfig<T> = {
    url: "",
    method: "GET",
    headers: {},
    responseType: "json",
    maxRetries: 3,
    retryDelay: 1000,
  };

  private requestInterceptors: RequestInterceptor<T>[] = [];
  private responseInterceptors: ResponseInterceptor<any>[] = [];

  private getEffectiveConfig(): RequestConfig<T> {
    const globalConfig = ConfigManager.getInstance().getGlobalConfig();
    return {
      ...globalConfig,
      ...this.config,
      headers: {
        ...globalConfig?.headers,
        ...this.config.headers,
      } as RequestConfig<T>["headers"],
    };
  }

  addRequestInterceptor(interceptor: RequestInterceptor<T>): this {
    this.requestInterceptors.push(interceptor);
    return this;
  }

  addResponseInterceptor<R>(interceptor: ResponseInterceptor<R>): this {
    this.responseInterceptors.push(interceptor);
    return this;
  }

  setUrl(url: string): this {
    this.config.url = url;
    return this;
  }

  setMethod(method: RequestConfig<T>["method"]): this {
    this.config.method = method;
    return this;
  }

  setHeaders(headers: RequestConfig<T>["headers"]): this {
    this.config.headers = headers;
    return this;
  }

  setBody(body: RequestConfig<T>["body"]): this {
    this.config.body = body;
    return this;
  }

  setMaxRetries(maxRetries: number): this {
    this.config.maxRetries = maxRetries;
    return this;
  }

  setRetryDelay(retryDelay: number): this {
    this.config.retryDelay = retryDelay;
    return this;
  }

  private async backoff(retryCount: number): Promise<void> {
    const delay = (this.config.retryDelay || 1000) * Math.pow(2, retryCount);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  private async parseResponse(response: Response): Promise<any> {
    switch (this.config.responseType) {
      case "json":
        return response.json();
      case "text":
        return response.text();
      case "blob":
        return response.blob();
      case "arrayBuffer":
        return response.arrayBuffer();
    }
  }

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

        const options: RequestInit = {
          method: config.method,
          headers: config.headers,
          body: config.body ? JSON.stringify(config.body) : undefined,
          signal,
        };

        const response = await fetch(config.url, options);

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.statusText}`);
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
