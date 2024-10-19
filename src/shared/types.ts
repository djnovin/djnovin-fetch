export type RequestInterceptor<T> = (
  config: RequestConfig<T>,
) => RequestConfig<T>;
export type ResponseInterceptor<R> = (response: R) => R;

export type HTTPMethods =
  | "DELETE"
  | "GET"
  | "HEAD"
  | "OPTIONS"
  | "PATCH"
  | "POST"
  | "PUT";

export type ResponseType =
  | "arrayBuffer"
  | "blob"
  | "formData"
  | "json"
  | "text";

export interface RequestConfig<T> {
  body?: T | FormData | Blob | ArrayBuffer | string;
  headers?: Record<string, string>;
  maxRetries?: number;
  method: "DELETE" | "GET" | "HEAD" | "OPTIONS" | "PATCH" | "POST" | "PUT";
  responseType: ResponseType;
  retryDelay?: number;
  url: string;
}
