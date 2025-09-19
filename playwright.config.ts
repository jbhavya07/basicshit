import { defineConfig, devices } from '@playwright/test';

// Assuming you will create this file:
import { RPConfig } from './testing/playwright/utils/reportportal/reportPortal.config';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const chromeDesktop = {
    ...devices['Desktop Chrome'],
    deviceScaleFactor: undefined, // Let Playwright determine based on browser, or set explicitly
    viewport: { width: 1920, height: 1080 } // Standard desktop viewport
};

// Base output path for all generated artifacts (reports, screenshots, videos)
const baseOutputPath = process.env.PLAYWRIGHT_OUTPUT_DIR || './testing/playwright/results';

export default defineConfig({
    // Test directory where Playwright will look for test files
    testDir: './testing/playwright/tests',
    // Directory for test artifacts (like traces, snapshots)
    outputDir: `${baseOutputPath}/data`,

    // Run tests in files in parallel (set to false as per your request)
    fullyParallel: false,

    // Fail the build on CI if you accidentally left test.only in the source code.
    forbidOnly: !!process.env.CI,

    // Retry on CI only (set to 2 retries)
    retries: process.env.CI ? 2 : 0,

    // Configure workers. On CI, run tests sequentially (1 worker). Locally, use 2 workers.
    workers: process.env.CI ? 1 : 2, // Changed to 1 worker for CI to reduce contention based on common CI practices for stability. You can change it to 2 if needed.

    // Report slow tests
    reportSlowTests: { threshold: 60000, max: 10 }, // Report tests slower than 60 seconds

    // Maximum time one test can run for.
    timeout: process.env.CI ? 75000 : 45000, // 75 seconds on CI, 45 seconds locally

    // Expect configuration
    expect: {
        // Maximum time expect() should wait for the condition to be met.
        timeout: process.env.CI ? 45000 : 30000 // 45 seconds on CI, 30 seconds locally
    },

    // Configure reporters
    reporter: [
        // GitHub Actions reporter (for better integration with GitHub PRs)
        process.env.CI ? ['github'] : ['list', { printSteps: false }],
        // HTML Reporter
        ['html', { outputFolder: `${baseOutputPath}/report`, open: 'never' }],
        // JSON Reporter
        ['json', { outputFile: `${baseOutputPath}/result.json` }],
        // JUnit XML Reporter
        ['junit', { outputFile: `${baseOutputPath}/result.xml` }],
        // Custom Module Summary CSV Reporter (ensure './testing/playwright/utils/moduleSummary.ts' exists)
        ['./testing/playwright/utils/moduleSummary.ts', { outputFile: `${baseOutputPath}/module_report.csv` }],
        // Report Portal Integration (conditionally added if REPORT_PORTAL_API_TOKEN is set)
        ...(process.env.REPORT_PORTAL_API_TOKEN ? [['@reportportal/agent-js-playwright', RPConfig]] : [])
    ] as any, // Using 'any' to bypass TypeScript type checking for the reporter array for now.
              // A better way would be to define a type for reporter entries if multiple custom reporters are used.

    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        // Base URL to use in actions like `await page.goto('/')`.
        // This will be read directly from the environment variable.
        baseURL: process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com/web/index.php',

        // See https://playwright.dev/docs/test-use-options#recording-options
        trace: 'retain-on-failure', // Record trace for failed tests
        video: 'retain-on-failure', // Record video for failed tests
        screenshot: 'only-on-failure', // Capture screenshot only on test failure

        // Maximum time for navigation actions (page.goto, page.goBack, page.reload).
        navigationTimeout: process.env.CI ? 45 * 1000 : 30 * 1000, // 45 seconds on CI, 30 seconds locally

        // Define a custom option for login credentials, which can be overridden by projects
        // This is a common pattern for framework-level shared data
        orangeHrmUsername: process.env.ORANGE_HRM_USERNAME || 'Admin',
        orangeHrmPassword: process.env.ORANGE_HRM_PASSWORD || 'admin123'
    },

    /* Configure projects for major browsers and test types */
    projects: [
        {
            name: 'Smoke',
            use: { ...chromeDesktop },
            // Only run tests with the @smoke tag
            grep: /@smoke/,
            // Invert grep to exclude other specific tags if needed, but for 'Smoke' we typically only include.
            // Keeping it simple for now, as `@smoke` should be specific enough.
            // If a test has both @smoke and @regression, it will run in Smoke project.
            // If you want strict separation, you might need to combine grep and grepInvert carefully.
            // For now, let's assume tests are tagged only with @smoke OR @regression OR neither.
            grepInvert: /@regression/ // Explicitly exclude regression tests from smoke run
        },
        {
            name: 'Regression',
            use: { ...chromeDesktop },
            // Run all tests that are NOT tagged as @smoke
            // This means tests without any tag, or with other tags, will run here,
            // effectively making it the full suite minus smoke.
            grepInvert: /@smoke/
        }
    ]
});