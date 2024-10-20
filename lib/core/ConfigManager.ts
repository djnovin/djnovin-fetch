import { RequestConfig } from '../shared/types';

/**
 * ConfigManager is a singleton that manages global configurations for FetchBuilder.
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private globalConfig: Partial<RequestConfig> = {};

  private constructor() {}

  /**
   * Retrieves the singleton instance of ConfigManager.
   * @returns {ConfigManager} The ConfigManager instance.
   */
  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Sets global configurations.
   * @param config Partial global request configuration.
   */
  setGlobalConfig(config: Partial<RequestConfig>): void {
    this.globalConfig = { ...this.globalConfig, ...config };
  }

  /**
   * Retrieves the current global configurations.
   * @returns {Partial<RequestConfig>} The global request configuration.
   */
  getGlobalConfig(): Partial<RequestConfig> {
    return this.globalConfig;
  }
}
