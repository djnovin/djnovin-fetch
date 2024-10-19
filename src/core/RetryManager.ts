export class RetryManager {
  constructor(
    private maxRetries: number,
    private retryDelay: number,
  ) {}

  /**
   * @todo
   */
  async executeWithRetry<T>(task: () => Promise<T>): Promise<T> {
    let attempts = 0;
    while (attempts <= this.maxRetries) {
      try {
        return await task();
      } catch (error) {
        if (attempts >= this.maxRetries) throw error;
        await this.backoff(++attempts);
      }
    }
    throw new Error("Max retries exceeded");
  }

  private async backoff(retryCount: number): Promise<void> {
    const delay = this.retryDelay * Math.pow(2, retryCount);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}
