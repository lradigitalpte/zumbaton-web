# Quick Start Guide - Test Suite

## Quick Setup (3 Steps)

1. **Install dependencies** (already done if you've run npm install)
```bash
npm install
```

2. **Install Playwright browsers**
```bash
npx playwright install chromium
```

3. **Run tests**
```bash
npm test
```

## Test Files Overview

| File | Purpose | Coverage |
|------|---------|----------|
| `1-signup.spec.ts` | User registration | Form validation, signup flow |
| `2-signin.spec.ts` | User authentication | Login, session management |
| `3-token-purchase.spec.ts` | Token packages | Package display, purchase flow |
| `4-class-booking.spec.ts` | Class booking | Class listing, booking process |
| `5-end-to-end.spec.ts` | Complete journey | Full user workflow |

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run specific test file
npx playwright test tests/1-signup.spec.ts

# Run tests with UI (recommended for first run)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug
```

### Filter Tests

```bash
# Run tests matching a pattern
npx playwright test --grep "signup"

# Run tests in specific browser
npx playwright test --project=chromium

# Run tests in specific file
npx playwright test tests/1-signup.spec.ts
```

## Test Configuration

### Optional: Set Test Credentials

Create `.env.local` in the project root:

```env
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
```

**Note:** If credentials are not set, tests that require them will be skipped automatically.

### Default Behavior

- Tests automatically start your dev server (if not running)
- Tests use `http://localhost:3000` as base URL
- Tests run on Chromium, Firefox, and WebKit
- Screenshots saved on failure
- Videos saved on retry

## Understanding Test Results

### Successful Test
- Green checkmark
- Test passes without errors

### Skipped Test
- Yellow icon
- Test skipped (usually due to missing credentials or prerequisites)
- Not a failure

### Failed Test
- Red X
- Test failed
- Check error message and screenshot in `test-results/`

### View Test Report
```bash
npx playwright show-report
```

## Common Issues

### Issue: Tests timeout
**Solution:** Increase timeout in `playwright.config.ts` or individual test

### Issue: Element not found
**Solution:** Check selectors, add wait times, verify page loaded

### Issue: Authentication failures
**Solution:** Verify test credentials in `.env.local` or create test user

### Issue: Server not starting
**Solution:** Check if port 3000 is available, or set `PLAYWRIGHT_TEST_BASE_URL`

## Test Structure

```
tests/
├── helpers/
│   └── test-utils.ts          # Shared utilities
├── 1-signup.spec.ts           # Sign up tests
├── 2-signin.spec.ts           # Sign in tests
├── 3-token-purchase.spec.ts   # Token purchase tests
├── 4-class-booking.spec.ts    # Class booking tests
├── 5-end-to-end.spec.ts       # End-to-end tests
└── README.md                  # Full documentation
```

## Next Steps

1. **First Run:** Run `npm run test:ui` to see tests in action
2. **Review Results:** Check the HTML report after running tests
3. **Configure Credentials:** Set up test user credentials for full coverage
4. **Customize:** Adjust selectors and timeouts as needed
5. **Extend:** Add more tests as features are added

## Getting Help

- See `README.md` for detailed documentation
- See `TEST_SUITE_SUMMARY.md` for test coverage overview
- Check Playwright docs: https://playwright.dev/docs/intro

