import * as path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

export const UI_BASE_URL = process.env.UI_BASE_URL ?? 'https://www.saucedemo.com';
export const API_BASE_URL = process.env.API_BASE_URL ?? 'https://restful-booker.herokuapp.com';
// Sesión de standard_user generada por tests/setup/auth.setup.ts (ignorada en git).
export const STORAGE_STATE = path.join(__dirname, 'playwright/.auth/standard-user.json');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  globalSetup: require.resolve('./global-setup'),
  expect: {
    timeout: 7_000,
  },
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  projects: [
    {
      // Login único compartido por todos los proyectos de UI: la cookie de
      // sesión no depende del navegador, así que basta generarla una vez.
      name: 'ui-setup',
      testDir: './tests/setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: UI_BASE_URL },
    },
    {
      name: 'ui-chromium',
      testDir: './tests/ui',
      dependencies: ['ui-setup'],
      use: { ...devices['Desktop Chrome'], baseURL: UI_BASE_URL },
    },
    {
      name: 'ui-firefox',
      testDir: './tests/ui',
      dependencies: ['ui-setup'],
      use: { ...devices['Desktop Firefox'], baseURL: UI_BASE_URL },
    },
    {
      name: 'ui-webkit',
      testDir: './tests/ui',
      dependencies: ['ui-setup'],
      use: { ...devices['Desktop Safari'], baseURL: UI_BASE_URL },
    },
    {
      // Viewport mobile real (Pixel 5). Se limita a @smoke para no triplicar
      // el tiempo de la suite completa en un form factor secundario.
      name: 'ui-mobile',
      testDir: './tests/ui',
      dependencies: ['ui-setup'],
      grep: /@smoke/,
      use: { ...devices['Pixel 5'], baseURL: UI_BASE_URL },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: API_BASE_URL },
    },
  ],
});
