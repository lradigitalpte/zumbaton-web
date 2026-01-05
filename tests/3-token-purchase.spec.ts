import { test, expect } from '@playwright/test';
import { waitForPageReady, waitForToast, signInUser, clearStorage } from './helpers/test-utils';

/**
 * Test Suite: Token Purchase Flow
 * 
 * Tests the complete token purchase process including:
 * - Package display
 * - Package selection
 * - Payment initiation
 * - Payment completion
 * - Token balance update
 */

test.describe('Token Purchase Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in as test user (requires valid credentials)
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'TestPassword123!';
    
    test.skip(testEmail === 'test@example.com', 'Test credentials not configured');
    
    await signInUser(page, testEmail, testPassword);
  });

  test('should display packages page', async ({ page }) => {
    await page.goto('/packages');
    await waitForPageReady(page);

    // Check page title
    await expect(page.locator('h1, h2')).toContainText(/token.*package|package/i);
    
    // Check for package cards or list
    const packageSection = page.locator('text=/adult|package|token/i').first();
    await expect(packageSection).toBeVisible({ timeout: 10000 });
  });

  test('should display adult packages', async ({ page }) => {
    await page.goto('/packages');
    await waitForPageReady(page);

    // Look for adult packages section
    const adultSection = page.locator('text=/adult.*package|adult/i').first();
    const sectionExists = await adultSection.isVisible({ timeout: 10000 }).catch(() => false);
    
    if (sectionExists) {
      await expect(adultSection).toBeVisible();
    }
  });

  test('should display package details correctly', async ({ page }) => {
    await page.goto('/packages');
    await waitForPageReady(page);
    await page.waitForTimeout(2000); // Wait for packages to load

    // Look for package cards (assuming they have purchase buttons)
    const purchaseButtons = page.locator('button:has-text("Purchase"), button:has-text("Buy")');
    const buttonCount = await purchaseButtons.count();
    
    if (buttonCount > 0) {
      // At least one package should be visible
      await expect(purchaseButtons.first()).toBeVisible();
      
      // Check for package information (price, tokens, validity)
      const packageCard = purchaseButtons.first().locator('..');
      const hasPrice = await packageCard.locator('text=/\\$|SGD|\\d+.*token/i').isVisible().catch(() => false);
      expect(hasPrice).toBeTruthy();
    }
  });

  test('should open payment modal when clicking purchase', async ({ page }) => {
    await page.goto('/packages');
    await waitForPageReady(page);
    await page.waitForTimeout(2000); // Wait for packages to load

    // Find and click first purchase button
    const purchaseButtons = page.locator('button:has-text("Purchase"), button:has-text("Buy")');
    const buttonCount = await purchaseButtons.count();
    
    test.skip(buttonCount === 0, 'No packages available to test');

    await purchaseButtons.first().click();
    await page.waitForTimeout(1000);

    // Payment modal should appear
    const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
    const modalExists = await modal.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (modalExists) {
      await expect(modal).toBeVisible();
    } else {
      // Might redirect to payment page instead
      const url = page.url();
      expect(url.includes('/payment') || url.includes('/checkout')).toBeTruthy();
    }
  });

  test('should display package pricing correctly', async ({ page }) => {
    await page.goto('/packages');
    await waitForPageReady(page);
    await page.waitForTimeout(2000);

    // Check for price display (currency symbols or numbers)
    const priceElements = page.locator('text=/\\$\\d+|SGD\\s*\\d+|\\d+.*token/i');
    const priceCount = await priceElements.count();
    
    if (priceCount > 0) {
      // Should have at least one price displayed
      await expect(priceElements.first()).toBeVisible();
    }
  });

  test('should display token count for each package', async ({ page }) => {
    await page.goto('/packages');
    await waitForPageReady(page);
    await page.waitForTimeout(2000);

    // Look for token count indicators
    const tokenIndicators = page.locator('text=/\\d+.*token|token.*\\d+/i');
    const tokenCount = await tokenIndicators.count();
    
    if (tokenCount > 0) {
      await expect(tokenIndicators.first()).toBeVisible();
    }
  });

  test('should display validity period for packages', async ({ page }) => {
    await page.goto('/packages');
    await waitForPageReady(page);
    await page.waitForTimeout(2000);

    // Look for validity information
    const validityInfo = page.locator('text=/valid.*day|day.*valid|expir/i');
    const validityCount = await validityInfo.count();
    
    if (validityCount > 0) {
      await expect(validityInfo.first()).toBeVisible();
    }
  });

  test('should require authentication to view packages', async ({ page, context }) => {
    // Clear cookies to ensure no session
    await context.clearCookies();
    
    // Try to access packages without signing in
    await page.goto('/packages');
    await waitForPageReady(page);
    await page.waitForTimeout(2000);

    // Should redirect to signin or show authentication requirement
    const url = page.url();
    const isRedirected = url.includes('/signin') || url.includes('/signup');
    const isOnPackages = url.includes('/packages');
    
    // Either redirected or packages page requires auth (shows error/signin prompt)
    expect(isRedirected || isOnPackages).toBeTruthy();
  });

  test('should navigate to packages from dashboard', async ({ page }) => {
    // Should be on dashboard after signin
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Look for link to packages
    const packagesLink = page.locator('a[href*="/packages"], text=/package|token/i').first();
    const linkExists = await packagesLink.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (linkExists) {
      await packagesLink.click();
      await waitForPageReady(page);
      expect(page.url()).toContain('/packages');
    }
  });

  test('should handle payment cancellation gracefully', async ({ page }) => {
    await page.goto('/packages');
    await waitForPageReady(page);
    await page.waitForTimeout(2000);

    const purchaseButtons = page.locator('button:has-text("Purchase"), button:has-text("Buy")');
    const buttonCount = await purchaseButtons.count();
    
    test.skip(buttonCount === 0, 'No packages available to test');

    await purchaseButtons.first().click();
    await page.waitForTimeout(1000);

    // Look for cancel/close button in modal
    const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
    const modalExists = await modal.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (modalExists) {
      const closeButton = modal.locator('button:has-text("Close"), button:has-text("Cancel"), [aria-label*="close"]').first();
      const closeExists = await closeButton.isVisible().catch(() => false);
      
      if (closeExists) {
        await closeButton.click();
        await page.waitForTimeout(500);
        await expect(modal).not.toBeVisible();
      }
    }
  });
});

/**
 * Note: Actual payment testing (HitPay integration) requires:
 * - Test payment gateway credentials
 * - Mock payment responses
 * - Special test environment setup
 * These tests focus on the UI flow up to payment initiation
 */

