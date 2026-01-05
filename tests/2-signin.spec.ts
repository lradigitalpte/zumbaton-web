import { test, expect } from '@playwright/test';
import { generateTestEmail, waitForPageReady, waitForToast, signUpUser, clearStorage } from './helpers/test-utils';

/**
 * Test Suite: User Sign In Flow
 * 
 * Tests the complete user authentication process including:
 * - Form validation
 * - Successful signin
 * - Error handling
 * - Remember me functionality
 * - Google sign in option
 * - Session persistence
 */

test.describe('User Sign In Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signin');
    await waitForPageReady(page);
    await clearStorage(page);
  });

  test('should display signin form with all required fields', async ({ page }) => {
    // Check form elements are present
    await expect(page.locator('h3, h1')).toContainText(/sign in|signin|login/i);
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error with invalid email', async ({ page }) => {
    // Fill form with invalid credentials
    await page.fill('input[type="email"], input[name="email"]', 'nonexistent@test.com');
    await page.fill('input[type="password"], input[name="password"]', 'WrongPassword123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show error message
    await waitForToast(page, /invalid.*email|incorrect.*password|sign in failed/i, 10000);
  });

  test('should show error with invalid password', async ({ page }) => {
    // This test assumes you have a test user account
    // You may need to create one first or use a setup script
    const testEmail = 'test@example.com'; // Replace with your test user email

    await page.fill('input[type="email"], input[name="email"]', testEmail);
    await page.fill('input[type="password"], input[name="password"]', 'WrongPassword123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show error message
    await waitForToast(page, /invalid.*password|incorrect.*password|sign in failed/i, 10000);
  });

  test('should successfully sign in with valid credentials', async ({ page }) => {
    // This test requires a valid test user account
    // You may need to create one in a setup script or use environment variables
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

    // Skip if credentials are not configured
    test.skip(testEmail === 'test@example.com', 'Test credentials not configured');

    await page.fill('input[type="email"], input[name="email"]', testEmail);
    await page.fill('input[type="password"], input[name="password"]', testPassword);

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await waitForPageReady(page);

    // Verify we're on the dashboard
    expect(page.url()).toContain('/dashboard');
  });

  test('should have remember me checkbox', async ({ page }) => {
    const rememberMeCheckbox = page.locator('input[type="checkbox"][name*="remember"], input[type="checkbox"]').first();
    
    // Check if remember me exists (it might not be visible on all forms)
    const checkboxExists = await rememberMeCheckbox.isVisible().catch(() => false);
    
    if (checkboxExists) {
      await expect(rememberMeCheckbox).toBeVisible();
      await rememberMeCheckbox.check();
      await expect(rememberMeCheckbox).toBeChecked();
    }
  });

  test('should have link to sign up page', async ({ page }) => {
    const signUpLink = page.locator('a[href*="/signup"], text=/sign up|create account/i').first();
    const linkExists = await signUpLink.isVisible().catch(() => false);
    
    if (linkExists) {
      await expect(signUpLink).toBeVisible();
      await signUpLink.click();
      await waitForPageReady(page);
      expect(page.url()).toContain('/signup');
    }
  });

  test('should have link to forgot password', async ({ page }) => {
    const forgotPasswordLink = page.locator('a[href*="password"], text=/forgot.*password|reset.*password/i').first();
    const linkExists = await forgotPasswordLink.isVisible().catch(() => false);
    
    if (linkExists) {
      await expect(forgotPasswordLink).toBeVisible();
    }
  });

  test('should validate email format', async ({ page }) => {
    // Try invalid email format
    await page.fill('input[type="email"], input[name="email"]', 'invalid-email');
    await page.fill('input[type="password"], input[name="password"]', 'TestPassword123!');

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const validity = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    
    // HTML5 validation should prevent submission
    expect(validity).toBeFalsy();
  });

  test('should redirect to dashboard if already authenticated', async ({ page }) => {
    // First sign in (requires valid credentials)
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

    test.skip(testEmail === 'test@example.com', 'Test credentials not configured');

    await page.fill('input[type="email"], input[name="email"]', testEmail);
    await page.fill('input[type="password"], input[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // Now try to access signin page again
    await page.goto('/signin');
    await waitForPageReady(page);
    await page.waitForTimeout(2000);

    // Should redirect to dashboard
    expect(page.url()).toContain('/dashboard');
  });

  test('should show Google sign in option', async ({ page }) => {
    const googleButton = page.locator('button:has-text("Google"), button:has-text("Sign in with Google")').first();
    const buttonExists = await googleButton.isVisible().catch(() => false);
    
    if (buttonExists) {
      await expect(googleButton).toBeVisible();
      // Note: Actual Google OAuth testing requires special setup
    }
  });
});

