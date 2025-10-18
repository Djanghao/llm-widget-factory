/**
 * @file PlaywrightRenderer.js
 * @description Playwright-based headless widget renderer.
 * Launches headless browser, executes rendering, and captures screenshots.
 * @author Houston Zhang
 * @date 2025-10-17
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class PlaywrightRenderer {
  constructor(options = {}) {
    this.options = {
      headless: true,
      devServerUrl: 'http://localhost:5173',
      timeout: 30000,
      viewportSize: { width: 1920, height: 1080 },
      ...options
    };
    this.browser = null;
  }

  async initialize() {
    console.log('[PlaywrightRenderer] Launching browser...');
    this.browser = await chromium.launch({
      headless: this.options.headless,
      args: ['--font-render-hinting=none']
    });
    console.log('[PlaywrightRenderer] Browser launched');
  }

  async renderWidget(spec, options = {}) {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    const {
      enableAutoResize = true,
      captureOptions = {},
      presetId = 'custom'
    } = options;

    const context = await this.browser.newContext({
      viewport: this.options.viewportSize
    });

    const page = await context.newPage();

    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error') {
        console.error('[Browser Error]', msg.text());
      } else if (type === 'warning') {
        console.warn('[Browser Warning]', msg.text());
      } else if (this.options.verbose) {
        console.log('[Browser]', msg.text());
      }
    });

    page.on('pageerror', error => {
      console.error('[Browser Page Error]', error.message);
    });

    try {
      const headlessUrl = `${this.options.devServerUrl}/headless.html`;
      console.log(`[PlaywrightRenderer] Navigating to ${headlessUrl}...`);

      await page.goto(headlessUrl, {
        waitUntil: 'networkidle',
        timeout: this.options.timeout
      });

      console.log('[PlaywrightRenderer] Waiting for headless API to be ready...');
      await page.waitForFunction(() => window.__headlessReady === true, {
        timeout: this.options.timeout
      });

      console.log('[PlaywrightRenderer] Rendering widget...');
      const result = await page.evaluate(async ({ spec, enableAutoResize, captureOptions }) => {
        try {
          return await window.renderWidget(spec, {
            enableAutoResize,
            captureOptions
          });
        } catch (error) {
          return {
            success: false,
            error: error.message,
            stack: error.stack
          };
        }
      }, { spec, enableAutoResize, captureOptions });

      if (!result.success) {
        throw new Error(`Rendering failed: ${result.error}`);
      }

      console.log('[PlaywrightRenderer] Widget rendered successfully');
      console.log('[PlaywrightRenderer] Validation:', result.validation.valid ? '✓ PASSED' : '✗ FAILED');

      if (!result.validation.valid) {
        console.warn('[PlaywrightRenderer] Validation issues:', result.validation.issues);
      }

      if (result.validation.warnings.length > 0) {
        console.warn('[PlaywrightRenderer] Validation warnings:', result.validation.warnings);
      }

      console.log('[PlaywrightRenderer] Metadata:', result.metadata);

      const base64Data = result.imageData.split(',')[1];
      const imageBuffer = Buffer.from(base64Data, 'base64');

      await context.close();

      return {
        success: true,
        validation: result.validation,
        metadata: result.metadata,
        naturalSize: result.naturalSize,
        finalSize: result.finalSize,
        spec: result.spec,
        imageBuffer,
        presetId
      };

    } catch (error) {
      console.error('[PlaywrightRenderer] Error:', error.message);
      await context.close();

      return {
        success: false,
        error: error.message,
        stack: error.stack,
        presetId
      };
    }
  }

  async close() {
    if (this.browser) {
      console.log('[PlaywrightRenderer] Closing browser...');
      await this.browser.close();
      this.browser = null;
      console.log('[PlaywrightRenderer] Browser closed');
    }
  }

  static async saveImage(imageBuffer, outputPath) {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, imageBuffer);
    console.log(`[PlaywrightRenderer] Image saved to ${outputPath}`);
  }

  static generateFilename(presetId, metadata) {
    const { width, height, aspectRatio } = metadata;
    const arFormatted = aspectRatio.toFixed(4).replace('.', '-');
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${presetId}_${width}x${height}_ar${arFormatted}_${timestamp}_${random}.png`;
  }
}
