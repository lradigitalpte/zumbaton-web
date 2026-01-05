# Test Fixes Applied

## Summary

Fixed selector and test logic issues in the test suite to make tests compatible with the actual UI implementation.

## Issues Fixed

### 1. Checkbox Selection Issue
**Problem:** Tests were trying to click on a hidden checkbox element (`class="sr-only"`) which caused timeout errors.

**Solution:** Changed from `page.check('input[type="checkbox"]')` to `page.locator('label[for="checkboxLabel"]').click()` to click on the visible label element instead.

**Files Changed:**
- `tests/helpers/test-utils.ts`
- `tests/1-signup.spec.ts` (multiple occurrences)

### 2. Toast Selector Issue
**Problem:** Multiple elements matched the toast selector (devtools indicator, route announcer, actual toast), causing test failures.

**Solution:** Updated `waitForToast` function to filter out non-toast elements and use more specific selectors:
- Changed selector to exclude devtools and route announcer
- Added filtering by message text for more precise matching

**Files Changed:**
- `tests/helpers/test-utils.ts`

### 3. Password Field Selection
**Problem:** Tests used ambiguous selectors like `input[type="password"]:nth-of-type(2)` which didn't work reliably.

**Solution:** Changed to use name attributes:
- `input[name="password"]` for password field
- `input[name="confirmPassword"]` for confirm password field

**Files Changed:**
- `tests/helpers/test-utils.ts`
- `tests/1-signup.spec.ts` (all password field references)

### 4. Password Validation Test
**Problem:** The password field has `minLength={8}` HTML5 attribute, which prevents form submission before client-side validation runs.

**Solution:** Updated test to check for HTML5 validation first, then fall back to checking for toast if HTML5 validation doesn't apply.

**Files Changed:**
- `tests/1-signup.spec.ts`

### 5. Link Navigation
**Problem:** Sign-in link click wasn't navigating properly.

**Solution:** 
- Changed selector to use exact href match: `a[href="/signin"]`
- Added `force: true` option and proper navigation waiting

**Files Changed:**
- `tests/1-signup.spec.ts`

### 6. Storage Clearing
**Problem:** `clearStorage` was being called before navigating to pages, causing security errors.

**Solution:** 
- Moved `clearStorage` calls to after page navigation
- Changed to use `context.clearCookies()` in some cases
- Added try-catch for localStorage access errors

**Files Changed:**
- `tests/helpers/test-utils.ts`
- `tests/2-signin.spec.ts`
- `tests/3-token-purchase.spec.ts`
- `tests/4-class-booking.spec.ts`
- `tests/5-end-to-end.spec.ts`

### 7. Toast Message Patterns
**Problem:** Some toast message patterns didn't match actual toast messages.

**Solution:** Updated regex patterns to match actual toast messages (e.g., "Terms Required" instead of "term.*condition").

**Files Changed:**
- `tests/1-signup.spec.ts`

### 8. Form Field Selectors
**Problem:** Mixed selectors like `input[type="text"], input[name="name"]` caused strict mode violations.

**Solution:** Changed to use specific name attributes for all form fields.

**Files Changed:**
- `tests/1-signup.spec.ts`
- `tests/helpers/test-utils.ts`

## Test Results

After fixes, all 8 signup tests pass successfully:
- should display signup form with all required fields
- should show validation error when passwords do not match
- should show validation error when password is too short
- should show validation error when terms are not accepted
- should show error when email already exists
- should successfully sign up with valid credentials
- should have link to sign in page
- should validate email format

## Remaining Test Files

Other test files (2-signin, 3-token-purchase, 4-class-booking, 5-end-to-end) still need similar fixes applied for checkbox and selector issues. The patterns established in signup tests can be applied to these files.

## Best Practices Applied

1. Use specific attribute selectors (name, id) instead of type selectors
2. Click on labels instead of hidden checkbox inputs
3. Wait for navigation after link clicks
4. Handle HTML5 validation appropriately
5. Use more specific toast selectors with filtering
6. Clear storage after navigation, not before

