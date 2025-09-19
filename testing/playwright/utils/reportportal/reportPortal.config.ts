// This file should contain your Report Portal configuration details.
// Example structure:
export const RPConfig = {
    apiKey: process.env.REPORT_PORTAL_API_TOKEN,
    endpoint: process.env.REPORT_PORTAL_ENDPOINT || 'http://localhost:8080/api/v1',
    project: process.env.REPORT_PORTAL_PROJECT_NAME || 'default_project',
    launch: process.env.REPORT_PORTAL_LAUNCH_NAME || 'Playwright Test Launch',
    attributes: [], // Array of attributes to add to the launch
    description: 'Playwright E2E tests for OrangeHRM',
    // Other options like agent, skippedIssue, etc.
    // See Report Portal Playwright agent documentation for full options.
  };