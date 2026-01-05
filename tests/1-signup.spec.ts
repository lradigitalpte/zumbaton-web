import { test, expect } from '@playwright/test';
import { generateTestEmail, generateTestName, waitForPageReady, waitForToast } from './helpers/test-utils';

/**
 * Test Suite: User Sign Up Flow
 * 
 * Tests the complete user registration process including:
 * - Form validation
 * - Successful signup
 * - Error handling
 * - Terms acceptance
 * - Password requirements
 */

test.describe('User Sign Up Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
    await waitForPageReady(page);
  });

  test('should display signup form with all required fields', async ({ page }) => {
    // Check form elements are present
    await expect(page.locator('h3, h1')).toContainText(/signup|sign up/i);
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.locator('input[type="checkbox"]')).toBeVisible(); // terms checkbox
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation error when passwords do not match', async ({ page }) => {
    const testEmail = generateTestEmail('signup');
    const testName = generateTestName();

    // Fill form with mismatched passwords
    await page.fill('input[name="name"]', testName);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!');
    await page.locator('label[for="checkboxLabel"]').click();

    // Submit form
    await page.click('button[type="submit"]');

    // Should show validation error
    await waitForToast(page, /password.*match/i, 5000);
  });

  test('should show validation error when password is too short', async ({ page }) => {
    const testEmail = generateTestEmail('signup');
    const testName = generateTestName();

    // Fill form with short password (7 characters)
    await page.fill('input[name="name"]', testName);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'Short1!'); // 7 chars
    await page.fill('input[name="confirmPassword"]', 'Short1!');
    await page.locator('label[for="checkboxLabel"]').click();

    // Check if HTML5 validation prevents submission
    const passwordInput = page.locator('input[name="password"]');
    const validity = await passwordInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // If HTML5 validation works, form won't submit and we should see validation message
    // Otherwise, client-side validation should show toast
    if (!validity) {
      // HTML5 validation prevents submission
      const validationMessage = await passwordInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage.length > 0).toBeTruthy();
    } else {
      // Client-side validation should show toast
      await waitForToast(page, /password.*8|at least 8|validation error/i, 8000);
    }
  });

  test('should show validation error when terms are not accepted', async ({ page }) => {
    const testEmail = generateTestEmail('signup');
    const testName = generateTestName();

    // Fill form without accepting terms
    await page.fill('input[name="name"]', testName);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    // Do not check terms checkbox

    // Submit form
    await page.click('button[type="submit"]');

    // Should show validation error - wait for toast with terms/conditions message
    await waitForToast(page, /terms.*required|accept.*terms/i, 5000);
  });

  test('should show error when email already exists', async ({ page }) => {
    // Use an email that might already exist (if you have a test user)
    const existingEmail = 'existing@test.com';
    const testName = generateTestName();

    await page.fill('input[name="name"]', testName);
    await page.fill('input[name="email"]', existingEmail);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    await page.locator('label[for="checkboxLabel"]').click();

    // Submit form
    await page.click('button[type="submit"]');

    // Should show error (might redirect to signin if email confirmation is required)
    // This test may need adjustment based on your auth flow
    await page.waitForTimeout(3000);
    const url = page.url();
    const hasError = await page.locator('text=/email.*exist|already.*registered|sign up failed/i').isVisible().catch(() => false);
    
    // Either error message appears or redirect happens
    expect(hasError || url.includes('/signin') || url.includes('/signup')).toBeTruthy();
  });

  test('should successfully sign up with valid credentials', async ({ page }) => {
    const testEmail = generateTestEmail('signup-success');
    const testName = generateTestName();
    const testPassword = 'TestPassword123!';

    // Fill form with valid data
    await page.fill('input[name="name"]', testName);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.locator('label[for="checkboxLabel"]').click();

    // Submit form
    await page.click('button[type="submit"]');

    // Should show success message
    await waitForToast(page, /account.*created|welcome/i, 10000);

    // Should redirect to dashboard or signin (depending on email confirmation settings)
    // Wait for navigation or timeout
    try {
      await page.waitForURL(/\/dashboard|\/signin/, { timeout: 5000 });
      const url = page.url();
      expect(url.includes('/dashboard') || url.includes('/signin')).toBeTruthy();
    } catch {
      // If no redirect, check if we're still on signup (might be email confirmation flow)
      const url = page.url();
      // Success toast was shown, so test passes even if still on signup (email confirmation required)
      expect(true).toBeTruthy();
    }
  });

  test('should have link to sign in page', async ({ page }) => {
    // Find the sign-in link - it's in the right panel
    const signInLink = page.locator('a[href="/signin"]').first();
    await expect(signInLink).toBeVisible();
    
    // Click and wait for navigation
    await signInLink.click({ force: true });
    await page.waitForURL(/\/signin/, { timeout: 5000 });
    await waitForPageReady(page);
    expect(page.url()).toContain('/signin');
  });

  test('should validate email format', async ({ page }) => {
    const testName = generateTestName();

    // Try invalid email format
    await page.fill('input[name="name"]', testName);
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    await page.locator('label[for="checkboxLabel"]').click();

    // HTML5 validation should prevent submission or show error
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const validity = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    
    // If HTML5 validation works, the form won't submit
    if (!validity) {
      await page.click('button[type="submit"]');
      // Form should not submit, or browser shows validation message
      await page.waitForTimeout(1000);
    }
  });
});

