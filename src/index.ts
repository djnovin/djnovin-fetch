// src/index.ts

type RequestInterceptor<T> = (config: RequestConfig<T>) => RequestConfig<T>;
type ResponseInterceptor<R> = (response: R) => R;

interface RequestConfig<T> {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: T;
  maxRetries?: number;
  retryDelay?: number;
  responseType: "json" | "text" | "blob";
}

interface FetchBuilder<T> {
  setBody(body: RequestConfig<T>["body"]): this;
  setHeaders(headers: RequestConfig<T>["headers"]): this;
  setMaxRetries(maxRetries: number): this;
  setMethod(method: RequestConfig<T>["method"]): this;
  setMinRetries(minRetries: number): this;
  setResponseType(responseType: RequestConfig<T>["responseType"]): this;
  setRetryDelay(retryDelay: number): this;
  setUrl(url: string): this;
}

class ConfigManager {
  private static instance: ConfigManager;
  private globalConfig: Partial<RequestConfig<any>> = {};

  private constructor() {}

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  setGlobalConfig(config: Partial<RequestConfig<any>>): void {
    this.globalConfig = { ...this.globalConfig, ...config };
  }

  getGlobalConfig(): Partial<RequestConfig<any>> {
    return this.globalConfig;
  }

  resetGlobalConfig() {
    this.globalConfig = {};
  }
}

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
    }
  }

  async execute<R = any>(): Promise<[Error | null, R | null]> {
    let attempts = 0;
    let config = this.getEffectiveConfig();

    for (const interceptor of this.requestInterceptors) {
      config = interceptor(config);
    }

    const maxRetries = this.config.maxRetries || 0;

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

        const response = await fetch(this.config.url, options);

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.statusText}`);
        }

        let parsedResponse = (await this.parseResponse(response)) as R;

        for (const interceptor of this.responseInterceptors) {
          parsedResponse = interceptor(parsedResponse);
        }

        return [null, parsedResponse];
      } catch (error) {
        if (attempts >= maxRetries || (error as Error).name === "AbortError") {
          return [error as Error, null];
        }
        attempts++;
        await this.backoff(attempts);
      }
    }

    return [new Error("Unknown error"), null];
  }
}

export { FetchBuilder, ConfigManager, RequestConfig };
