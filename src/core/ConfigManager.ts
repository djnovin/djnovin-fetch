import { RequestConfig } from "../shared/types";

export class ConfigManager {
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
