import { Page, expect } from '@playwright/test';

/**
 * Test utilities and helper functions
 */

export const TEST_USER = {
  email: 'testuser@example.com',
  password: 'TestPassword123!',
  name: 'Test User',
};

export const TEST_ADMIN = {
  email: 'admin@zumbaton.com',
  password: 'AdminPassword123!',
};

/**
 * Wait for page to be ready
 */
export async function waitForPageReady(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // Additional wait for React hydration
}

/**
 * Generate unique test email
 */
export function generateTestEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}-${timestamp}-${random}@test.com`;
}

/**
 * Generate unique test name
 */
export function generateTestName(prefix: string = 'Test'): string {
  const timestamp = Date.now();
  return `${prefix} User ${timestamp}`;
}

/**
 * Sign up a new user
 */
export async function signUpUser(
  page: Page,
  email: string,
  password: string,
  name: string,
  acceptTerms: boolean = true
) {
  await page.goto('/signup');
  await waitForPageReady(page);

  // Fill signup form
  await page.fill('input[name="name"]', name);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirmPassword"]', password);

  if (acceptTerms) {
    // Click the label instead of the hidden checkbox
    await page.locator('label[for="checkboxLabel"]').click();
  }

  // Submit form
  await page.click('button[type="submit"]');
}

/**
 * Sign in a user
 */
export async function signInUser(
  page: Page,
  email: string,
  password: string
) {
  await page.goto('/signin');
  await waitForPageReady(page);

  // Fill signin form
  await page.fill('input[name="email"], input[type="email"]', email);
  await page.fill('input[name="password"], input[type="password"]', password);

  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  await waitForPageReady(page);
}

/**
 * Sign out user
 */
export async function signOutUser(page: Page) {
  // Navigate to settings or find sign out button
  const signOutButton = page.locator('text=/sign out|logout/i').first();
  if (await signOutButton.isVisible()) {
    await signOutButton.click();
    await page.waitForURL(/\/signin/, { timeout: 5000 });
  }
}

/**
 * Wait for toast notification
 */
export async function waitForToast(page: Page, message?: string, timeout: number = 5000) {
  // Wait for toast to appear - filter out devtools indicator and route announcer
  const toastSelector = 'div[role="alert"]:not(#devtools-indicator):not(#__next-route-announcer__)';
  
  if (message) {
    // Wait for toast with specific message
    await page.waitForSelector(toastSelector, { timeout });
    const toast = page.locator(toastSelector).filter({ hasText: new RegExp(message, 'i') });
    await expect(toast.first()).toBeVisible({ timeout });
  } else {
    // Just wait for any toast
    await page.waitForSelector(toastSelector, { timeout });
  }
}

/**
 * Clear browser storage
 * Must be called after navigating to a page
 */
export async function clearStorage(page: Page) {
  try {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  } catch (error) {
    // Ignore errors if page doesn't have localStorage access yet
  }
  await page.context().clearCookies();
}

/**
 * Wait for API request to complete
 */
export async function waitForApiResponse(page: Page, urlPattern: string | RegExp, method: string = 'GET') {
  return page.waitForResponse(
    (response) => {
      const url = response.url();
      const matchesPattern = typeof urlPattern === 'string' 
        ? url.includes(urlPattern) 
        : urlPattern.test(url);
      return matchesPattern && response.request().method() === method.toUpperCase();
    },
    { timeout: 30000 }
  );
}

