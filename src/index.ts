interface RequestConfig<T> {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: T;

  maxRetries?: number; // Max retry attempts
  retryDelay?: number; // Delay between retries
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

class FetchBuilder<T> implements FetchBuilder<T> {
  private config: RequestConfig<T> = {
    url: "",
    method: "GET",
    headers: {},
    responseType: "json",
    maxRetries: 3,
    retryDelay: 1000,
  };

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

  setMinRetries(minRetries: number): this {
    return this;
  }

  setMaxRetries(maxRetries: number): this {
    return this;
  }

  setRetryDelay(retryDelay: number): this {
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
    const maxRetries = this.config.maxRetries || 0;

    while (attempts <= maxRetries) {
      try {
        const options: RequestInit = {
          method: this.config.method,
          headers: this.config.headers,
          body: this.config.body ? JSON.stringify(this.config.body) : undefined,
        };

        const response = await fetch(this.config.url, options);

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.statusText}`);
        }

        const parsedResponse = await this.parseResponse(response);
        return [null, parsedResponse as R];
      } catch (error) {
        if (attempts >= maxRetries) {
          return [error as Error, null]; // Max retries reached, return error
        }
        attempts++;
        await this.backoff(attempts); // Apply backoff before retrying
      }
    }

    return [new Error("Unknown error"), null];
  }
}

const fetchBuilder = new FetchBuilder<{ name: string }>();

fetchBuilder
  .setUrl("https://jsonplaceholder.typicode.com/posts")
  .setMethod("POST")
  .setHeaders({ "Content-Type": "application/json" })
  .setBody({ name: "John Doe" })
  .setMaxRetries(3)
  .setRetryDelay(1000)
  .execute<{ id: number; name: string }>()
  .then(([error, response]) => {
    if (error) {
      console.error(error);
    } else {
      console.log(response);
    }
  });
