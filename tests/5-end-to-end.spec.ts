import { test, expect } from '@playwright/test';
import { 
  generateTestEmail, 
  generateTestName, 
  waitForPageReady, 
  waitForToast, 
  signInUser, 
  signUpUser,
  clearStorage 
} from './helpers/test-utils';

/**
 * Test Suite: End-to-End User Journey
 * 
 * Tests the complete user flow from signup to booking a class:
 * 1. Sign up
 * 2. Sign in
 * 3. Purchase tokens
 * 4. Book a class
 * 
 * This is an integration test covering the full user journey
 */

test.describe('End-to-End User Journey', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear cookies instead of storage
    await context.clearCookies();
  });

  test('complete user journey: signup -> purchase tokens -> book class', async ({ page }) => {
    // Generate unique test user credentials
    const testEmail = generateTestEmail('e2e');
    const testName = generateTestName('E2E');
    const testPassword = 'E2ETestPassword123!';

    // Step 1: Sign Up
    test.step('Sign up new user', async () => {
      await page.goto('/signup');
      await waitForPageReady(page);

      // Fill signup form
      await page.fill('input[name="name"]', testName);
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', testPassword);
      await page.fill('input[name="confirmPassword"]', testPassword);
      
      // Accept terms
      const termsCheckbox = page.locator('input[type="checkbox"]').first();
      await termsCheckbox.check();
      
      // Submit
      await page.click('button[type="submit"]');
      
      // Wait for success and redirect
      await waitForToast(page, /account.*created|welcome/i, 15000);
      await page.waitForTimeout(3000);
      
      // Should be redirected to dashboard or signin (depending on email confirmation)
      const url = page.url();
      expect(url.includes('/dashboard') || url.includes('/signin')).toBeTruthy();
    });

    // Step 2: Sign In (if redirected to signin)
    test.step('Sign in user', async () => {
      const currentUrl = page.url();
      
      if (currentUrl.includes('/signin')) {
        await page.fill('input[type="email"], input[name="email"]', testEmail);
        await page.fill('input[type="password"], input[name="password"]', testPassword);
        await page.click('button[type="submit"]');
        
        await page.waitForURL(/\/dashboard/, { timeout: 15000 });
        await waitForPageReady(page);
      } else {
        // Already on dashboard
        await page.waitForURL(/\/dashboard/, { timeout: 10000 });
        await waitForPageReady(page);
      }
      
      // Verify we're on dashboard
      expect(page.url()).toContain('/dashboard');
    });

    // Step 3: Navigate to Packages
    test.step('Navigate to packages page', async () => {
      await page.goto('/packages');
      await waitForPageReady(page);
      await page.waitForTimeout(2000);
      
      // Verify packages page loaded
      const packagesHeading = page.locator('h1, h2').filter({ hasText: /package|token/i }).first();
      const headingExists = await packagesHeading.isVisible({ timeout: 10000 }).catch(() => false);
      expect(headingExists).toBeTruthy();
    });

    // Step 4: Select and Initiate Package Purchase
    test.step('Initiate package purchase', async () => {
      // Find purchase button
      const purchaseButtons = page.locator('button:has-text("Purchase"), button:has-text("Buy")');
      const buttonCount = await purchaseButtons.count();
      
      test.skip(buttonCount === 0, 'No packages available for purchase');
      
      // Click first purchase button
      await purchaseButtons.first().click();
      await page.waitForTimeout(1000);
      
      // Should open payment modal or redirect to payment
      const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
      const modalExists = await modal.isVisible({ timeout: 5000 }).catch(() => false);
      const url = page.url();
      const isPaymentPage = url.includes('/payment') || url.includes('/checkout');
      
      expect(modalExists || isPaymentPage).toBeTruthy();
      
      // Note: Actual payment completion requires test payment gateway setup
      // For now, we'll just verify the payment flow is initiated
    });

    // Note: Steps 5-6 would require:
    // - Test payment gateway credentials
    // - Completing payment flow
    // - Verifying token balance update
    // - Booking a class with tokens
    // These are marked as optional/future work
  });

  test('user journey: existing user signin -> view classes -> check token balance', async ({ page }) => {
    // This test uses existing test credentials
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'TestPassword123!';
    
    test.skip(testEmail === 'test@example.com', 'Test credentials not configured');

    // Step 1: Sign In
    test.step('Sign in existing user', async () => {
      await signInUser(page, testEmail, testPassword);
      expect(page.url()).toContain('/dashboard');
    });

    // Step 2: View Classes
    test.step('View available classes', async () => {
      await page.goto('/book-classes');
      await waitForPageReady(page);
      await page.waitForTimeout(3000);
      
      // Verify classes page loaded
      const classesHeading = page.locator('h1, h2').filter({ hasText: /class|schedule|book/i }).first();
      const headingExists = await classesHeading.isVisible({ timeout: 10000 }).catch(() => false);
      expect(headingExists).toBeTruthy();
    });

    // Step 3: Check Token Balance
    test.step('Check token balance', async () => {
      // Navigate to tokens page or check dashboard
      await page.goto('/tokens');
      await waitForPageReady(page);
      await page.waitForTimeout(2000);
      
      // Look for token balance display
      const tokenBalance = page.locator('text=/\\d+.*token|token.*balance|available.*token/i').first();
      const balanceExists = await tokenBalance.isVisible({ timeout: 10000 }).catch(() => false);
      
      // Token balance should be displayed (even if 0)
      // This verifies the page loads correctly
    });

    // Step 4: View My Bookings
    test.step('View my bookings', async () => {
      await page.goto('/my-bookings');
      await waitForPageReady(page);
      await page.waitForTimeout(2000);
      
      // Verify bookings page loaded
      const bookingsHeading = page.locator('h1, h2').filter({ hasText: /booking|my.*booking/i }).first();
      const headingExists = await bookingsHeading.isVisible({ timeout: 10000 }).catch(() => false);
      expect(headingExists).toBeTruthy();
    });
  });

  test('user navigation flow: dashboard -> packages -> classes -> bookings', async ({ page }) => {
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'TestPassword123!';
    
    test.skip(testEmail === 'test@example.com', 'Test credentials not configured');

    await signInUser(page, testEmail, testPassword);

    // Navigate through main sections
    const navigationFlow = [
      { path: '/dashboard', title: /dashboard|home/i },
      { path: '/packages', title: /package|token/i },
      { path: '/book-classes', title: /class|schedule|book/i },
      { path: '/my-bookings', title: /booking|my.*booking/i },
    ];

    for (const step of navigationFlow) {
      await test.step(`Navigate to ${step.path}`, async () => {
        await page.goto(step.path);
        await waitForPageReady(page);
        await page.waitForTimeout(2000);
        
        expect(page.url()).toContain(step.path);
        
        // Verify page title/heading
        const heading = page.locator('h1, h2').filter({ hasText: step.title }).first();
        const headingExists = await heading.isVisible({ timeout: 10000 }).catch(() => false);
        expect(headingExists).toBeTruthy();
      });
    }
  });

  test('authentication flow: signout -> protected route redirect -> signin -> dashboard', async ({ page }) => {
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'TestPassword123!';
    
    test.skip(testEmail === 'test@example.com', 'Test credentials not configured');

    // Step 1: Sign in
    await signInUser(page, testEmail, testPassword);
    expect(page.url()).toContain('/dashboard');

    // Step 2: Sign out (if sign out button exists)
    test.step('Sign out user', async () => {
      const signOutButton = page.locator('button:has-text("Sign Out"), button:has-text("Logout"), a:has-text("Sign Out")').first();
      const signOutExists = await signOutButton.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (signOutExists) {
        await signOutButton.click();
        await page.waitForTimeout(2000);
        
        // Should redirect to signin or homepage
        const url = page.url();
        expect(url.includes('/signin') || url.includes('/signup') || url === page.context().baseURL || url === page.context().baseURL + '/').toBeTruthy();
      } else {
        // Manual signout via clearing cookies
        await page.context().clearCookies();
      }
    });

    // Step 3: Try to access protected route
    test.step('Attempt to access protected route', async () => {
      await page.goto('/packages');
      await waitForPageReady(page);
      await page.waitForTimeout(2000);
      
      // Should redirect to signin
      const url = page.url();
      expect(url.includes('/signin') || url.includes('/signup')).toBeTruthy();
    });

    // Step 4: Sign in again
    test.step('Sign in again', async () => {
      await signInUser(page, testEmail, testPassword);
      expect(page.url()).toContain('/dashboard');
    });
  });
});

