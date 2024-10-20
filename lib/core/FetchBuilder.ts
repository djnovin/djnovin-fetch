// src/utils/FetchBuilder.ts

import {
  RequestConfig,
  RequestInterceptor,
  ResponseInterceptor,
} from '../shared/types';
import { ConfigManager } from './ConfigManager';
import { ErrorHandler } from './ErrorHandler';

/**
 * FetchBuilder is a class that helps to build and execute fetch requests.
 * @template T The type of the request body.
 * @template R The type of the response body.
 */
export class FetchBuilder<T = undefined, R = any> {
  private config: RequestConfig<T> = {
    url: '',
    method: 'GET',
    headers: {},
    responseType: 'json',
    body: undefined,
    timeout: undefined,
    maxRetries: 3,
    retryDelay: 1000,
  };

  private readonly requestInterceptors: RequestInterceptor<T>[] = [];
  private readonly responseInterceptors: ResponseInterceptor<R>[] = [];

  /**
   * Merges global and local configurations.
   * @returns {RequestConfig<T>} The effective merged configuration.
   */
  private getEffectiveConfig(): RequestConfig<T> {
    const globalConfig = ConfigManager.getInstance().getGlobalConfig();
    const mergedConfig: RequestConfig<T> = {
      ...globalConfig,
      ...this.config,
      headers: {
        ...(globalConfig?.headers || {}),
        ...(this.config.headers || {}),
      },
    };

    if (
      typeof mergedConfig.body === 'object' &&
      !(mergedConfig.body instanceof FormData) &&
      !(mergedConfig.body instanceof Blob)
    ) {
      if (!mergedConfig.headers) {
        mergedConfig.headers = {};
      }

      mergedConfig.headers['Content-Type'] =
        mergedConfig.headers['Content-Type'] || 'application/json';
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
    value: RequestConfig<T>[K]
  ): this {
    this.config[key] = value;
    return this;
  }

  /**
   * Adds a request interceptor.
   * @param interceptor The request interceptor to add.
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
  addResponseInterceptor(interceptor: ResponseInterceptor<R>): this {
    this.responseInterceptors.push(interceptor);
    return this;
  }

  /**
   * Sets the request URL.
   * @param url The URL to set.
   * @returns {this} The current instance to allow chaining.
   */
  setUrl(url: string): this {
    return this.updateConfig('url', url);
  }

  /**
   * Sets the request method.
   * @param method The HTTP method to set.
   * @returns {this} The current instance to allow chaining.
   */
  setMethod(method: RequestConfig<T>['method']): this {
    return this.updateConfig('method', method);
  }

  /**
   * Sets the request headers.
   * @param headers The headers to set.
   * @returns {this} The current instance to allow chaining.
   */
  setHeaders(headers: RequestConfig<T>['headers']): this {
    return this.updateConfig('headers', { ...this.config.headers, ...headers });
  }

  /**
   * Sets the custom timeout for the request.
   * @param ms Timeout in milliseconds.
   * @returns {this} The current instance for chaining.
   */
  setTimeout(ms: number): this {
    return this.updateConfig('timeout', ms);
  }

  /**
   * Sets the request body.
   * @param body The body to set.
   * @returns {this} The current instance to allow chaining.
   */
  setBody(body: T): this {
    return this.updateConfig('body', body);
  }

  /**
   * Sets additional fetch options.
   * @param options Additional RequestInit options to set.
   * @returns {this} The current instance to allow chaining.
   */
  setFetchOptions(options: Omit<RequestInit, 'body'>): this {
    return this.updateConfig('fetchOptions', options);
  }

  /**
   * Sets the maximum number of retries for the request.
   * @param maxRetries The maximum number of retries.
   * @returns {this} The current instance to allow chaining.
   */
  setMaxRetries(maxRetries: number): this {
    return this.updateConfig('maxRetries', maxRetries);
  }

  /**
   * Sets the delay between retries.
   * @param retryDelay The delay in milliseconds.
   * @returns {this} The current instance to allow chaining.
   */
  setRetryDelay(retryDelay: number): this {
    return this.updateConfig('retryDelay', retryDelay);
  }

  /**
   * Specifies that the response should be parsed as JSON.
   * @returns {this} The current instance to allow chaining.
   */
  json(): this {
    this.config.responseType = 'json';
    this.setHeaders({ Accept: 'application/json' });
    return this;
  }

  /**
   * Specifies that the response should be parsed as text.
   * @returns {this} The current instance to allow chaining.
   */
  text(): this {
    this.config.responseType = 'text';
    this.setHeaders({ Accept: 'text/plain' });
    return this;
  }

  /**
   * Specifies that the response should be parsed as a Blob.
   * @returns {this} The current instance to allow chaining.
   */
  blob(): this {
    this.config.responseType = 'blob';
    this.setHeaders({ Accept: 'application/octet-stream' });
    return this;
  }

  /**
   * Specifies that the response should be parsed as an ArrayBuffer.
   * @returns {this} The current instance to allow chaining.
   */
  arrayBuffer(): this {
    this.config.responseType = 'arrayBuffer';
    this.setHeaders({ Accept: 'application/octet-stream' });
    return this;
  }

  /**
   * Convenience method for GET requests.
   * @param url The URL to request.
   * @returns {FetchBuilder<undefined, R>} A new FetchBuilder instance.
   */
  static get<R = any>(url: string): FetchBuilder<undefined, R> {
    return new FetchBuilder<undefined, R>().setUrl(url).setMethod('GET');
  }

  /**
   * Convenience method for POST requests.
   * @param url The URL to request.
   * @param body The request body.
   * @returns {FetchBuilder<T, R>} A new FetchBuilder instance.
   */
  static post<T, R = any>(url: string, body: T): FetchBuilder<T, R> {
    return new FetchBuilder<T, R>().setUrl(url).setMethod('POST').setBody(body);
  }

  /**
   * Convenience method for PUT requests.
   * @param url The URL to request.
   * @param body The request body.
   * @returns {FetchBuilder<T, R>} A new FetchBuilder instance.
   */
  static put<T, R = any>(url: string, body: T): FetchBuilder<T, R> {
    return new FetchBuilder<T, R>().setUrl(url).setMethod('PUT').setBody(body);
  }

  /**
   * Convenience method for DELETE requests.
   * @param url The URL to request.
   * @returns {FetchBuilder<undefined, R>} A new FetchBuilder instance.
   */
  static delete<R = any>(url: string): FetchBuilder<undefined, R> {
    return new FetchBuilder<undefined, R>().setUrl(url).setMethod('DELETE');
  }

  /**
   * Convenience method for PATCH requests.
   * @param url The URL to request.
   * @param body The request body.
   * @returns {FetchBuilder<T, R>} A new FetchBuilder instance.
   */
  static patch<T, R = any>(url: string, body: T): FetchBuilder<T, R> {
    return new FetchBuilder<T, R>()
      .setUrl(url)
      .setMethod('PATCH')
      .setBody(body);
  }

  /**
   * Prepares the request options for the fetch call, including timeout handling.
   * @param config The request configuration.
   * @returns {RequestInit} The fetch options.
   */
  private getRequestOptions(config: RequestConfig<T>): RequestInit {
    const controller = new AbortController();
    const timeoutId = config.timeout
      ? setTimeout(() => controller.abort(), config.timeout)
      : null;

    const body = this.getRequestBody();

    return {
      method: config.method,
      headers: config.headers,
      body: body as BodyInit, // Type assertion based on T
      signal: controller.signal,
      ...config.fetchOptions, // Merge additional fetch options
    };
  }

  /**
   * Implements exponential backoff for retries.
   * @param retryCount The current retry count.
   */
  private async backoff(retryCount: number): Promise<void> {
    const delay = (this.config.retryDelay ?? 1000) * Math.pow(2, retryCount);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Parses the response based on the configured response type.
   * @param response The fetch response.
   * @returns {Promise<R>} The parsed response.
   */
  private async parseResponse(response: Response): Promise<R> {
    if (!response.ok) {
      throw ErrorHandler.createError(response);
    }

    switch (this.config.responseType) {
      case 'json':
        return response.json() as Promise<R>;
      case 'text':
        return response.text() as unknown as R;
      case 'blob':
        return response.blob() as unknown as R;
      case 'arrayBuffer':
        return response.arrayBuffer() as unknown as R;
      default:
        throw new Error('Unsupported response type');
    }
  }

  /**
   * Returns the appropriate request body based on the configuration.
   * @returns {BodyInit | null} The request body.
   */
  private getRequestBody(): BodyInit | null {
    const { body } = this.config;

    if (body === undefined || body === null) {
      return null;
    }

    if (
      body instanceof FormData ||
      body instanceof Blob ||
      typeof body === 'string'
    ) {
      return body;
    }

    // For JSON serializable objects
    return JSON.stringify(body);
  }

  /**
   * Executes the request with retry logic.
   * @returns {Promise<R>} The result of the request.
   */
  async send(): Promise<R> {
    let attempts = 0;
    let config = this.getEffectiveConfig();
    const maxRetries = this.config.maxRetries ?? 0;

    // Apply request interceptors sequentially
    for (const interceptor of this.requestInterceptors) {
      config = await interceptor(config);
    }

    while (attempts <= maxRetries) {
      try {
        const options = this.getRequestOptions(config);
        const response = await fetch(config.url, options);

        let parsedResponse = await this.parseResponse(response);

        // Apply response interceptors sequentially
        for (const interceptor of this.responseInterceptors) {
          parsedResponse = await interceptor(parsedResponse);
        }

        return parsedResponse;
      } catch (error) {
        const handledError = ErrorHandler.handleError(error as Error);

        if (attempts >= maxRetries || !ErrorHandler.isRetryable(handledError)) {
          throw handledError;
        }

        attempts++;
        await this.backoff(attempts);
      }
    }

    throw new Error('Unknown error occurred during the fetch operation.');
  }
}
