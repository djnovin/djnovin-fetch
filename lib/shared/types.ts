// src/shared/types.ts

export type HTTPMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'OPTIONS'
  | 'HEAD';

export interface RequestConfig<T = any> extends Omit<RequestInit, 'body'> {
  url: string;
  method: HTTPMethod;
  headers?: Record<string, string>;
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer';
  body?: T;
  timeout?: number; // in milliseconds
  maxRetries?: number;
  retryDelay?: number; // in milliseconds
  fetchOptions?: Omit<RequestInit, 'body' | 'method' | 'headers' | 'signal'>; // Exclude already handled properties
}

export type RequestInterceptor<T = any> = (
  config: RequestConfig<T>
) => Promise<RequestConfig<T>> | RequestConfig<T>;

export type ResponseInterceptor<R = any> = (response: R) => Promise<R> | R;
