import { PlaywrightTestConfig, PlaywrightTestOptions } from '@playwright/test';

declare module '@playwright/test' {
  export interface PlaywrightTestOptions {
    orangeHrmUsername?: string;
    orangeHrmPassword?: string;
  }
}