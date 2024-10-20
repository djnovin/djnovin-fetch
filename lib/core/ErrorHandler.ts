import { AbortError, HTTPError, NetworkError, TimeoutError } from './Error';

/**
 * @todo
 */
export class ErrorHandler {
  static isRetryable(error: Error): boolean {
    if (error instanceof NetworkError) {
      return true;
    }
    if (error instanceof HTTPError) {
      return error.statusCode >= 500 && error.statusCode < 600;
    }
    return false;
  }

  static createError(response: Response): HTTPError {
    return new HTTPError(`HTTP error: ${response.statusText}`, response.status);
  }

  static createNetworkError(): NetworkError {
    return new NetworkError(
      'A network error occurred. Please check your connection.'
    );
  }

  static createTimeoutError(): TimeoutError {
    return new TimeoutError('The request timed out.');
  }

  static createAbortError(): AbortError {
    return new AbortError('The request was aborted.');
  }

  static handleError(error: Error): Error {
    if (error.name === 'AbortError') {
      return this.createAbortError();
    }
    if (error.message.includes('network')) {
      return this.createNetworkError();
    }
    return error;
  }
}
