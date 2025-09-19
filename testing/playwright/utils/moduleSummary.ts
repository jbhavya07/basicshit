import { TestCase, TestResult, FullResult, FullConfig, Reporter } from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';

interface ModuleSummaryReporterOptions {
  outputFile: string;
}

class ModuleSummaryReporter implements Reporter {
  private results: {
    testSuite: string;
    testName: string;
    status: string;
    duration: number;
    errorMessage?: string;
    screenshotPath?: string;
  }[] = [];
  private outputFile: string;

  constructor(options: ModuleSummaryReporterOptions) {
    this.outputFile = options.outputFile;
  }

  onBegin(config: FullConfig, suite: any) {
    // Ensure the output directory exists
    const outputDir = path.dirname(this.outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const testSuiteName = test.parent.titlePath().slice(1, -1).join(' > '); // Get suite name
    this.results.push({
      testSuite: testSuiteName,
      testName: test.title,
      status: result.status,
      duration: result.duration,
      errorMessage: result.status === 'failed' && result.errors.length > 0 ? result.errors[0].message : undefined,
      screenshotPath: result.attachments.filter(a => a.name === 'screenshot' && a.path)[0]?.path
    });
  }

  onEnd(result: FullResult) {
    const header = 'TestSuite,TestName,Status,Duration (ms),Error Message,Screenshot Path\n';
    const rows = this.results.map(r =>
      `${this.csvEscape(r.testSuite)},${this.csvEscape(r.testName)},${r.status},${r.duration},${this.csvEscape(r.errorMessage || '')},${this.csvEscape(r.screenshotPath || '')}`
    ).join('\n');

    fs.writeFileSync(this.outputFile, header + rows);
    console.log(`\nModule Summary Report saved to: ${this.outputFile}`);
  }

  private csvEscape(value: string): string {
    if (!value) return '';
    // If the value contains a comma, double quote, or newline, enclose it in double quotes
    // and escape any existing double quotes by doubling them.
    if (value.indexOf(',') !== -1 || value.indexOf('"') !== -1 || value.indexOf('\n') !== -1) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}

export default ModuleSummaryReporter;
