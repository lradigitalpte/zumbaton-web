# Zumbaton Web Test Suite

This directory contains end-to-end tests for the Zumbaton web application using Playwright.

## Test Structure

The test suite is organized into the following test files, covering the complete user journey:

1. **1-signup.spec.ts** - User registration flow
   - Form validation
   - Successful signup
   - Error handling
   - Terms acceptance

2. **2-signin.spec.ts** - User authentication flow
   - Form validation
   - Successful signin
   - Error handling
   - Session management

3. **3-token-purchase.spec.ts** - Token purchase flow
   - Package display
   - Package selection
   - Payment initiation

4. **4-class-booking.spec.ts** - Class booking flow
   - Class listing
   - Class details
   - Booking process
   - Token validation

5. **5-end-to-end.spec.ts** - Complete user journey
   - Signup to booking flow
   - Navigation flow
   - Authentication flow

## Setup

### Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

### Configuration

1. Set up test environment variables (optional, in `.env.local`):
```env
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
```

2. Ensure your development server is running or configure the webServer in `playwright.config.ts`.

## Running Tests

### Run all tests
```bash
npx playwright test
```

### Run specific test file
```bash
npx playwright test tests/1-signup.spec.ts
```

### Run tests in headed mode (see browser)
```bash
npx playwright test --headed
```

### Run tests in specific browser
```bash
npx playwright test --project=chromium
```

### Run tests with UI mode
```bash
npx playwright test --ui
```

### Run tests in debug mode
```bash
npx playwright test --debug
```

## Test Environment

### Test Data

Tests use dynamic test data generation to avoid conflicts:
- Test emails are generated with timestamps: `test-{timestamp}-{random}@test.com`
- Test names are generated with timestamps: `Test User {timestamp}`

### Test Credentials

Some tests require a valid test user account. Set these environment variables:
- `TEST_USER_EMAIL` - Email of test user account
- `TEST_USER_PASSWORD` - Password of test user account

If these are not set, certain tests will be skipped.

## Test Coverage

### Sign Up Flow
- Form field validation
- Password requirements
- Terms acceptance
- Email format validation
- Duplicate email handling
- Successful registration

### Sign In Flow
- Form validation
- Invalid credentials handling
- Successful authentication
- Session persistence
- Redirect behavior

### Token Purchase Flow
- Package listing
- Package details display
- Purchase initiation
- Payment modal/page
- Authentication requirements

### Class Booking Flow
- Class listing
- Class filtering and search
- Class details
- Booking process
- Token validation
- Booking confirmation

### End-to-End Flow
- Complete user journey from signup to booking
- Navigation flow
- Authentication flow
- Protected route access

## Limitations and Notes

1. **Payment Testing**: Actual payment gateway integration (HitPay) requires test credentials and special setup. Tests currently verify the UI flow up to payment initiation.

2. **Email Confirmation**: Depending on Supabase configuration, signup tests may need adjustment for email confirmation requirements.

3. **Test Data**: Tests are designed to be independent and use unique test data. Some cleanup may be needed between test runs.

4. **Browser Compatibility**: Tests run on Chromium, Firefox, and WebKit. Some tests may behave differently across browsers.

5. **Timing**: Some tests include wait times for async operations. These may need adjustment based on your network speed and server performance.

## Debugging

### View test report
```bash
npx playwright show-report
```

### Screenshots and Videos
Failed tests automatically capture:
- Screenshots on failure
- Videos on retry
- Traces on first retry

These are saved in the `test-results/` directory.

### Common Issues

1. **Tests timing out**: Increase timeout values in test or config
2. **Element not found**: Check selectors and wait times
3. **Authentication failures**: Verify test credentials and auth flow
4. **Network errors**: Check server is running and accessible

## Best Practices

1. Tests should be independent and not rely on other tests
2. Use unique test data to avoid conflicts
3. Clear browser storage between tests when needed
4. Use appropriate wait strategies (waitForSelector, waitForURL, etc.)
5. Verify both positive and negative cases
6. Test on multiple browsers for compatibility

## Continuous Integration

To run tests in CI:

```bash
# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install --with-deps

# Run tests
npx playwright test
```

## Maintenance

- Update selectors if UI changes
- Update test data requirements if features change
- Add new tests as features are added
- Review and update skipped tests regularly
- Keep Playwright version updated

