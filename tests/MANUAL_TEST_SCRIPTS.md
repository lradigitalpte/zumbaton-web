# Manual Test Scripts - Zumbaton Web Application

This document contains step-by-step manual test scripts for testing the Zumbaton web application user flows. These scripts are designed for manual QA testing and can be used by testers to verify functionality.

## Test Environment Setup

Before starting manual testing, ensure you have:
- Access to the application URL (typically http://localhost:3000 for development)
- A test email account (or multiple test accounts for different scenarios)
- Browser with developer tools enabled (Chrome, Firefox, or Safari)
- Clear browser cache or use incognito/private browsing mode

## Test Coverage

This guide covers the following test flows:
1. User Sign Up Flow
2. User Sign In Flow
3. Token Purchase Flow
4. Class Booking Flow
5. End-to-End User Journey

---

## Test Script 1: User Sign Up Flow

### Test Case 1.1: Successful User Registration

**Objective:** Verify that a new user can successfully create an account.

**Prerequisites:** None (start with fresh session)

**Steps:**
1. Navigate to the application home page
2. Click on "Sign Up" or navigate to `/signup` page
3. Verify the signup form is displayed with the following fields:
   - Full Name field
   - Email field
   - Password field
   - Confirm Password field
   - Terms and Conditions checkbox
   - Sign Up button
4. Fill in the form with valid test data:
   - Full Name: Enter a test name (e.g., "Test User")
   - Email: Enter a unique test email (e.g., "testuser[timestamp]@test.com")
   - Password: Enter a password with at least 8 characters (e.g., "TestPassword123!")
   - Confirm Password: Enter the same password
5. Check the "Terms and Conditions" checkbox
6. Click the "Sign Up" button
7. Wait for the response

**Expected Results:**
- Success message appears (e.g., "Account created!" or "Welcome to Zumbaton")
- User is redirected to dashboard or sign-in page (depending on email confirmation settings)
- If redirected to sign-in page, user receives a confirmation message about checking email

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 1.2: Password Mismatch Validation

**Objective:** Verify that the system shows an error when passwords do not match.

**Prerequisites:** None

**Steps:**
1. Navigate to the signup page
2. Fill in the form with test data:
   - Full Name: Enter any name
   - Email: Enter a valid email format
   - Password: Enter "TestPassword123!"
   - Confirm Password: Enter "DifferentPassword123!"
3. Check the "Terms and Conditions" checkbox
4. Click the "Sign Up" button

**Expected Results:**
- Error message appears indicating passwords do not match
- User remains on the signup page
- Form fields retain entered values

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 1.3: Password Length Validation

**Objective:** Verify that the system validates minimum password length.

**Prerequisites:** None

**Steps:**
1. Navigate to the signup page
2. Fill in the form with test data:
   - Full Name: Enter any name
   - Email: Enter a valid email format
   - Password: Enter a password with less than 8 characters (e.g., "Short1!")
   - Confirm Password: Enter the same short password
3. Check the "Terms and Conditions" checkbox
4. Attempt to click the "Sign Up" button

**Expected Results:**
- Browser shows HTML5 validation error for password field, OR
- Error message appears after clicking submit indicating password must be at least 8 characters
- User remains on the signup page

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 1.4: Terms and Conditions Validation

**Objective:** Verify that users must accept terms before signing up.

**Prerequisites:** None

**Steps:**
1. Navigate to the signup page
2. Fill in the form with valid test data:
   - Full Name: Enter any name
   - Email: Enter a valid email format
   - Password: Enter a valid password (at least 8 characters)
   - Confirm Password: Enter the same password
3. Do NOT check the "Terms and Conditions" checkbox
4. Click the "Sign Up" button

**Expected Results:**
- Warning or error message appears (e.g., "Terms Required" or "Please accept the Terms and Conditions")
- User remains on the signup page
- Account is not created

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 1.5: Duplicate Email Validation

**Objective:** Verify that the system prevents duplicate email registrations.

**Prerequisites:** 
- An existing user account with a known email address

**Steps:**
1. Navigate to the signup page
2. Fill in the form with test data:
   - Full Name: Enter any name
   - Email: Enter an email that already exists in the system
   - Password: Enter a valid password
   - Confirm Password: Enter the same password
3. Check the "Terms and Conditions" checkbox
4. Click the "Sign Up" button

**Expected Results:**
- Error message appears indicating email already exists or is already registered
- User remains on the signup page
- Account is not created

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 1.6: Email Format Validation

**Objective:** Verify that the system validates email format.

**Prerequisites:** None

**Steps:**
1. Navigate to the signup page
2. Fill in the form with test data:
   - Full Name: Enter any name
   - Email: Enter an invalid email format (e.g., "invalid-email" or "test@")
   - Password: Enter a valid password
   - Confirm Password: Enter the same password
3. Check the "Terms and Conditions" checkbox
4. Attempt to click the "Sign Up" button or submit the form

**Expected Results:**
- Browser shows HTML5 validation error for email field indicating invalid format
- Form does not submit
- User remains on the signup page

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 1.7: Sign In Link Navigation

**Objective:** Verify that users can navigate to the sign-in page from the signup page.

**Prerequisites:** None

**Steps:**
1. Navigate to the signup page
2. Locate the "Sign In" link or "Already have an account?" link
3. Click on the link

**Expected Results:**
- User is redirected to the sign-in page
- URL changes to include `/signin`
- Sign-in form is displayed

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

## Test Script 2: User Sign In Flow

### Test Case 2.1: Successful Sign In

**Objective:** Verify that existing users can successfully sign in.

**Prerequisites:**
- A valid user account with known email and password

**Steps:**
1. Navigate to the sign-in page
2. Verify the sign-in form is displayed with:
   - Email field
   - Password field
   - Sign In button
   - Link to sign-up page
   - Link to forgot password (if available)
3. Enter valid credentials:
   - Email: Enter the registered email address
   - Password: Enter the correct password
4. Click the "Sign In" button
5. Wait for the response

**Expected Results:**
- Success message appears (e.g., "Welcome back!")
- User is redirected to the dashboard
- User is authenticated and can access protected pages

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 2.2: Invalid Email Sign In

**Objective:** Verify that the system rejects sign-in attempts with invalid email.

**Prerequisites:** None

**Steps:**
1. Navigate to the sign-in page
2. Enter credentials:
   - Email: Enter an email that does not exist (e.g., "nonexistent@test.com")
   - Password: Enter any password
3. Click the "Sign In" button

**Expected Results:**
- Error message appears (e.g., "Invalid email or password" or "Sign in failed")
- User remains on the sign-in page
- User is not authenticated

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 2.3: Invalid Password Sign In

**Objective:** Verify that the system rejects sign-in attempts with incorrect password.

**Prerequisites:**
- A valid user account with known email

**Steps:**
1. Navigate to the sign-in page
2. Enter credentials:
   - Email: Enter a valid registered email
   - Password: Enter an incorrect password
3. Click the "Sign In" button

**Expected Results:**
- Error message appears (e.g., "Invalid email or password" or "Incorrect password")
- User remains on the sign-in page
- User is not authenticated

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 2.4: Sign Up Link Navigation

**Objective:** Verify that users can navigate to the sign-up page from the sign-in page.

**Prerequisites:** None

**Steps:**
1. Navigate to the sign-in page
2. Locate the "Sign Up" or "Create Account" link
3. Click on the link

**Expected Results:**
- User is redirected to the sign-up page
- URL changes to include `/signup`
- Sign-up form is displayed

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 2.5: Remember Me Functionality

**Objective:** Verify that "Remember Me" checkbox works (if available).

**Prerequisites:**
- A valid user account

**Steps:**
1. Navigate to the sign-in page
2. Locate the "Remember Me" checkbox (if available)
3. Check the "Remember Me" checkbox
4. Enter valid credentials and sign in
5. Close the browser completely
6. Reopen the browser and navigate to the application
7. Check if user is still signed in

**Expected Results:**
- User session persists after closing browser (if Remember Me was checked)
- User is still authenticated and can access protected pages

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 2.6: Already Authenticated Redirect

**Objective:** Verify that authenticated users are redirected away from sign-in page.

**Prerequisites:**
- User must be signed in

**Steps:**
1. Sign in to the application successfully
2. Navigate to the sign-in page directly via URL
3. Observe the behavior

**Expected Results:**
- User is automatically redirected to the dashboard
- Sign-in form is not displayed

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

## Test Script 3: Token Purchase Flow

### Test Case 3.1: View Packages Page

**Objective:** Verify that users can view available token packages.

**Prerequisites:**
- User must be signed in

**Steps:**
1. Sign in to the application
2. Navigate to the Packages page (click on "Packages" or navigate to `/packages`)
3. Verify the page loads correctly

**Expected Results:**
- Packages page displays correctly
- Package options are visible with:
  - Package name
  - Token count
  - Price
  - Validity period
  - Purchase button
- Both adult and kids packages are displayed (if applicable)

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 3.2: Package Details Display

**Objective:** Verify that package details are displayed correctly.

**Prerequisites:**
- User must be signed in
- Packages page must be accessible

**Steps:**
1. Navigate to the Packages page
2. Examine each package card or listing
3. Verify the following information is displayed:
   - Package name
   - Number of tokens included
   - Price in correct currency format
   - Validity period (number of days)
   - Package description or features
   - Purchase button

**Expected Results:**
- All package information is clearly displayed
- Pricing is formatted correctly (e.g., currency symbol, decimal places)
- Token counts are accurate
- Validity periods are clearly stated

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 3.3: Initiate Package Purchase

**Objective:** Verify that users can initiate a package purchase.

**Prerequisites:**
- User must be signed in
- Packages page must be accessible

**Steps:**
1. Navigate to the Packages page
2. Select a package to purchase
3. Click the "Purchase" button on the selected package
4. Observe the behavior

**Expected Results:**
- Payment modal or payment page opens
- Package details are shown in the payment interface
- User can proceed with payment or cancel

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

**Note:** Actual payment testing requires test payment gateway credentials and should be done in a test environment.

---

### Test Case 3.4: Authentication Required for Packages

**Objective:** Verify that unauthenticated users cannot access packages page.

**Prerequisites:**
- User must NOT be signed in (sign out if currently signed in)

**Steps:**
1. Ensure you are signed out
2. Navigate to `/packages` directly via URL
3. Observe the behavior

**Expected Results:**
- User is redirected to sign-in page, OR
- Access denied message is displayed, OR
- Sign-in prompt is shown

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 3.5: Navigate to Packages from Dashboard

**Objective:** Verify navigation to packages from dashboard.

**Prerequisites:**
- User must be signed in

**Steps:**
1. Sign in to the application
2. Verify you are on the dashboard
3. Locate and click on "Packages" link or button in navigation
4. Verify navigation

**Expected Results:**
- User is navigated to the Packages page
- Packages are displayed correctly

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

## Test Script 4: Class Booking Flow

### Test Case 4.1: View Available Classes

**Objective:** Verify that users can view available classes.

**Prerequisites:**
- User must be signed in

**Steps:**
1. Sign in to the application
2. Navigate to the Classes page (click on "Book Classes" or navigate to `/book-classes`)
3. Verify the page loads correctly

**Expected Results:**
- Classes page displays correctly
- List of available classes is shown
- Each class displays relevant information:
  - Class name
  - Date and time
  - Instructor name
  - Location
  - Available spots or capacity
  - Token cost

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 4.2: Filter Classes by Type

**Objective:** Verify that users can filter classes by type.

**Prerequisites:**
- User must be signed in
- Classes page must have classes available

**Steps:**
1. Navigate to the Classes page
2. Locate the filter options (if available)
3. Select a filter (e.g., "Adults", "Kids", or specific class type)
4. Observe the class list

**Expected Results:**
- Class list updates to show only filtered classes
- Filtered results match the selected criteria
- Clear indication of active filter is shown

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 4.3: Search for Classes

**Objective:** Verify that users can search for classes.

**Prerequisites:**
- User must be signed in
- Classes page must have classes available

**Steps:**
1. Navigate to the Classes page
2. Locate the search box
3. Enter a search term (e.g., class name, instructor name, or location)
4. Observe the results

**Expected Results:**
- Class list updates in real-time or after search submission
- Search results match the search term
- No results message appears if no matches found

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 4.4: View Class Details

**Objective:** Verify that users can view detailed information about a class.

**Prerequisites:**
- User must be signed in
- Classes page must have classes available

**Steps:**
1. Navigate to the Classes page
2. Click on a class card or class name
3. Observe the class details

**Expected Results:**
- Class details panel, modal, or page opens
- Detailed information is displayed:
  - Full class description
  - Date and time
  - Duration
  - Instructor information
  - Location details
  - Token cost
  - Capacity information
  - Book button

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 4.5: Book Class with Sufficient Tokens

**Objective:** Verify that users with sufficient tokens can book a class.

**Prerequisites:**
- User must be signed in
- User must have sufficient tokens in their account
- An available class must exist

**Steps:**
1. Verify your token balance (check dashboard or tokens page)
2. Navigate to the Classes page
3. Select an available class
4. Click "Book" or "Book Class" button
5. Confirm the booking if prompted

**Expected Results:**
- Booking confirmation message appears
- Class is added to "My Bookings"
- Token balance is reduced by the class token cost
- Booking confirmation details are shown

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 4.6: Book Class with Insufficient Tokens

**Objective:** Verify that users without sufficient tokens cannot book a class.

**Prerequisites:**
- User must be signed in
- User must have zero or insufficient tokens
- An available class must exist

**Steps:**
1. Verify your token balance is zero or insufficient
2. Navigate to the Classes page
3. Select an available class
4. Attempt to click "Book" or "Book Class" button
5. Observe the behavior

**Expected Results:**
- Error message appears indicating insufficient tokens
- User is prompted to purchase tokens, OR
- Booking is prevented with appropriate error message
- No booking is created

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 4.7: Authentication Required for Classes

**Objective:** Verify that unauthenticated users cannot access classes page.

**Prerequisites:**
- User must NOT be signed in

**Steps:**
1. Ensure you are signed out
2. Navigate to `/book-classes` directly via URL
3. Observe the behavior

**Expected Results:**
- User is redirected to sign-in page, OR
- Access denied message is displayed, OR
- Sign-in prompt is shown

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 4.8: Navigate to Classes from Dashboard

**Objective:** Verify navigation to classes from dashboard.

**Prerequisites:**
- User must be signed in

**Steps:**
1. Sign in to the application
2. Verify you are on the dashboard
3. Locate and click on "Book Classes" or "Classes" link in navigation
4. Verify navigation

**Expected Results:**
- User is navigated to the Classes page
- Classes are displayed correctly

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

## Test Script 5: End-to-End User Journey

### Test Case 5.1: Complete User Journey - New User

**Objective:** Verify the complete flow from signup to booking a class.

**Prerequisites:**
- Fresh browser session
- Test email account

**Steps:**
1. Navigate to the application home page
2. Click "Sign Up" and create a new account:
   - Enter valid name, email, and password
   - Accept terms and conditions
   - Complete signup
3. If redirected to sign-in, sign in with the new account credentials
4. Verify you are on the dashboard
5. Navigate to the Packages page
6. Select a package and initiate purchase (do not complete payment if using real payment gateway)
7. Navigate to the Classes page
8. Browse available classes
9. View class details for a specific class
10. Verify token balance (should be zero if purchase was not completed)
11. Navigate back to Packages if needed
12. Verify all navigation links work correctly

**Expected Results:**
- User can successfully sign up
- User can sign in with new account
- Dashboard is accessible
- Packages page displays correctly
- Classes page displays correctly
- Navigation between pages works smoothly
- Token balance is accurate

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 5.2: Existing User Navigation Flow

**Objective:** Verify navigation flow for existing users.

**Prerequisites:**
- Existing user account with valid credentials

**Steps:**
1. Sign in to the application
2. Verify dashboard loads correctly
3. Navigate to Packages page
4. Navigate to Classes page
5. Navigate to My Bookings page
6. Navigate to Profile or Settings page
7. Navigate to Tokens page
8. Navigate back to Dashboard
9. Verify all pages load correctly

**Expected Results:**
- All pages are accessible
- Navigation is smooth and responsive
- No errors occur during navigation
- User remains authenticated throughout

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 5.3: Sign Out and Protected Route Access

**Objective:** Verify that sign-out works and protected routes require authentication.

**Prerequisites:**
- User must be signed in

**Steps:**
1. Sign in to the application
2. Verify you are on a protected page (e.g., dashboard)
3. Locate and click "Sign Out" or "Logout" button
4. Verify sign-out completes
5. Attempt to navigate to a protected route (e.g., `/packages`, `/book-classes`, `/dashboard`)
6. Observe the behavior

**Expected Results:**
- User is successfully signed out
- User is redirected to home page or sign-in page
- Attempting to access protected routes redirects to sign-in page
- User must sign in again to access protected pages

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

## Test Reporting Template

For each test case, document the following:

- **Test Case ID:** [e.g., TC-1.1]
- **Test Case Name:** [Name of the test case]
- **Test Date:** [Date test was performed]
- **Tester Name:** [Name of the tester]
- **Environment:** [Development/Staging/Production]
- **Browser/Version:** [e.g., Chrome 120, Firefox 115]
- **Actual Results:** [Detailed description of what happened]
- **Status:** [Pass/Fail/Blocked]
- **Notes/Comments:** [Any additional observations or issues]
- **Screenshots:** [Reference to attached screenshots if available]
- **Bug ID:** [If test failed, reference to bug ticket]

---

## Notes for Testers

1. Always use test accounts, not production user accounts
2. Clear browser cache or use incognito mode when testing authentication flows
3. Document any unexpected behavior or errors
4. Take screenshots of errors or unexpected behavior
5. Note browser and version when reporting issues
6. Test on multiple browsers if possible (Chrome, Firefox, Safari)
7. Test on different screen sizes (desktop, tablet, mobile) if applicable
8. Pay attention to error messages and validation feedback
9. Verify that data persists correctly (e.g., bookings, token balances)
10. Test edge cases and boundary conditions

---

## Known Limitations

- Payment gateway testing requires test credentials and should be performed in a dedicated test environment
- Email confirmation flow testing depends on email delivery configuration
- Some features may require specific data setup (e.g., classes must exist in the system)
- Token expiration testing requires time-based testing or system configuration changes

---

## Test Script 6: QR Code Check-In Flow

### Test Case 6.1: In-Application QR Code Scanner - Successful Check-In

**Objective:** Verify that users can successfully check in using the in-application QR scanner.

**Prerequisites:**
- User must be signed in
- User must have a confirmed booking for a class
- Class must be within check-in window (30 minutes before to 2 hours after class start)
- Instructor must be displaying a QR code for the class

**Steps:**
1. Sign in to the application
2. Navigate to the Check-In page (click "Check-In" in navigation or go to `/check-in`)
3. Verify the check-in page is displayed
4. Click "Open Scanner" button
5. Grant camera permission when prompted by the browser
6. Verify the camera scanner interface opens
7. Point the camera at the QR code displayed by the instructor
8. Keep the camera steady and centered on the QR code
9. Wait for the QR code to be detected and scanned
10. Observe the check-in process

**Expected Results:**
- Camera scanner opens successfully
- QR code is detected and scanned
- "Checking in..." message appears
- Success message appears: "Check-in Successful!"
- Token is deducted from user's balance
- Booking status changes to "attended"
- User is checked in to the class
- Scanner closes automatically after 3 seconds

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

**Notes:** Document any issues with:
- Camera permission errors
- Difficulty scanning the QR code
- Scanner not detecting the QR code
- Time taken to scan successfully

---

### Test Case 6.2: In-Application QR Code Scanner - Invalid QR Code

**Objective:** Verify that the scanner handles invalid QR codes gracefully.

**Prerequisites:**
- User must be signed in
- Scanner must be open

**Steps:**
1. Sign in to the application
2. Navigate to the Check-In page
3. Click "Open Scanner" button
4. Grant camera permission
5. Point the camera at an invalid QR code (e.g., QR code from another system, damaged QR code, or test QR code not related to classes)
6. Wait for the scanner to attempt to read it
7. Observe the behavior

**Expected Results:**
- Scanner continues scanning and does not process invalid QR codes
- No error messages appear for invalid codes
- Scanner remains active and continues looking for valid QR codes
- User can close scanner and try again

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 6.3: Phone Camera QR Code Scan - Successful Check-In

**Objective:** Verify that users can check in by scanning QR code with phone's native camera app.

**Prerequisites:**
- User must have a mobile device with a camera
- User must have a confirmed booking for a class
- Class must be within check-in window
- Instructor must be displaying a QR code

**Steps:**
1. Sign in to the application on your mobile device
2. Ensure you have a confirmed booking for a class
3. Open your phone's native camera app (not the in-app scanner)
4. Point the camera at the QR code displayed by the instructor
5. Wait for the phone to detect the QR code
6. Tap the notification/link that appears when QR code is detected
7. Observe what happens when the link opens
8. Verify the check-in process completes

**Expected Results:**
- Phone camera detects the QR code
- Link notification appears (e.g., "Open in Zumbaton")
- Tapping the link opens the application or browser
- User is taken to check-in page or check-in is processed
- Success message appears
- Token is deducted from user's balance
- Booking status changes to "attended"
- Check-in is recorded correctly

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

**Notes:** Document any issues with:
- Difficulty scanning the QR code with phone camera
- Link not appearing when QR code is detected
- Error messages when opening the link
- "Invalid token format" errors
- Token not being deducted
- Check-in not completing properly

---

### Test Case 6.4: Phone Camera QR Code Scan - Token Format Error

**Objective:** Verify behavior when phone camera scan results in token format errors.

**Prerequisites:**
- User must have a mobile device with camera
- QR code must be available for scanning

**Steps:**
1. Sign in to the application on your mobile device
2. Open your phone's native camera app
3. Point the camera at the QR code displayed by the instructor
4. Tap the notification/link that appears
5. Observe any error messages
6. Note the exact error message displayed

**Expected Results (if error occurs):**
- Link opens the application
- Error message is displayed clearly (not just "invalid token format")
- Error message provides guidance on what to do next
- User can retry the check-in process
- Alternative check-in method is suggested

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

**Specific Issues to Document:**
- Exact error message text
- Where the error appears (which page)
- Whether the error prevents check-in completely
- Whether token deduction happens despite the error
- Whether the user is redirected to a useful page

---

### Test Case 6.5: QR Code Scan - No Booking

**Objective:** Verify error handling when scanning QR code without a booking.

**Prerequisites:**
- User must be signed in
- User must NOT have a booking for the class in the QR code
- QR code must be available

**Steps:**
1. Sign in to the application
2. Ensure you do NOT have a booking for the class in the QR code
3. Open the QR scanner (in-app or phone camera)
4. Scan the QR code for a class you haven't booked
5. Observe the error message

**Expected Results:**
- Error message appears: "You are not registered for this class"
- Option to book the class is provided (if class allows booking)
- User is not checked in
- No tokens are deducted

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 6.6: QR Code Scan - Check-In Window Validation

**Objective:** Verify that check-in is only allowed within the valid time window.

**Prerequisites:**
- User must be signed in
- User must have a confirmed booking
- QR code must be for a class outside the check-in window (more than 30 minutes before class or more than 2 hours after class start)

**Steps:**
1. Sign in to the application
2. Have a confirmed booking for a class
3. Attempt to scan QR code when:
   - More than 30 minutes before class start time, OR
   - More than 2 hours after class start time
4. Observe the error message

**Expected Results:**
- Error message appears indicating check-in window is closed
- Message explains the valid check-in window (30 minutes before to 2 hours after)
- User is not checked in
- No tokens are deducted

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 6.7: QR Code Scan - Already Checked In

**Objective:** Verify that users cannot check in twice for the same class.

**Prerequisites:**
- User must be signed in
- User must have already checked in to the class (booking status is "attended")

**Steps:**
1. Sign in to the application
2. Verify you have already checked in to a class (check "My Bookings" to confirm status is "attended")
3. Open the QR scanner
4. Scan the QR code for the class you already checked into
5. Observe the error message

**Expected Results:**
- Error message appears: "You have already checked in to this class"
- User is not checked in again
- No additional tokens are deducted
- Original check-in record remains unchanged

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 6.8: QR Code Scan - Insufficient Tokens

**Objective:** Verify error handling when user has insufficient tokens.

**Prerequisites:**
- User must be signed in
- User must have a confirmed booking
- User must have zero tokens or insufficient tokens for the class

**Steps:**
1. Sign in to the application
2. Verify your token balance is zero or insufficient (check dashboard or tokens page)
3. Have a confirmed booking for a class
4. Open the QR scanner
5. Scan the QR code for the class
6. Observe the error message

**Expected Results:**
- Error message appears indicating insufficient tokens
- Option to purchase tokens is provided
- User is not checked in
- No tokens are deducted (as user doesn't have enough)

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 6.9: QR Code Scan - Camera Permission Denied

**Objective:** Verify behavior when camera permission is denied.

**Prerequisites:**
- User must be signed in
- Camera permission should be denied in browser settings

**Steps:**
1. Sign in to the application
2. Deny camera permission in browser settings (or ensure it's already denied)
3. Navigate to Check-In page
4. Click "Open Scanner" button
5. Observe the error message

**Expected Results:**
- Clear error message appears: "Camera access denied"
- Instructions provided on how to enable camera permission
- Scanner interface shows permission denied state
- User can close scanner and enable permissions in browser settings

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 6.10: QR Code Scan - Expired QR Code

**Objective:** Verify that expired QR codes are rejected.

**Prerequisites:**
- User must be signed in
- User must have a confirmed booking
- QR code must be expired (if QR codes have expiration times)

**Steps:**
1. Sign in to the application
2. Have a confirmed booking for a class
3. Scan an old/expired QR code (if available, or wait for QR code to expire)
4. Observe the error message

**Expected Results:**
- Error message appears: "QR code has expired" or similar
- Message instructs user to scan the new code displayed on screen
- User is not checked in
- No tokens are deducted

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 6.11: QR Code Scan - Token Deduction Verification

**Objective:** Verify that tokens are correctly deducted after successful check-in.

**Prerequisites:**
- User must be signed in
- User must have a confirmed booking
- User must know their current token balance
- QR code must be available

**Steps:**
1. Sign in to the application
2. Navigate to Dashboard or Tokens page
3. Note your current token balance
4. Navigate to Check-In page
5. Open the QR scanner
6. Scan a valid QR code for a class you have booked
7. Wait for check-in to complete successfully
8. Navigate back to Dashboard or Tokens page
9. Verify your new token balance

**Expected Results:**
- Token balance decreases by the class token cost (typically 1 token)
- Balance update is reflected immediately
- Transaction record shows token deduction
- Balance displayed is accurate

**Actual Results:** [Document actual results here]

**Previous Token Balance:** [Enter balance here]
**Expected New Balance:** [Enter expected balance here]
**Actual New Balance:** [Enter actual balance here]
**Tokens Deducted:** [Enter number deducted here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 6.12: Comparison - In-App Scanner vs Phone Camera Scan

**Objective:** Compare the two scanning methods to identify differences and issues.

**Prerequisites:**
- User must be signed in
- User must have a confirmed booking
- Same QR code must be scanned using both methods

**Steps:**
1. Sign in to the application
2. Have a confirmed booking for a class
3. Test Method 1 - In-App Scanner:
   - Navigate to Check-In page
   - Click "Open Scanner"
   - Grant camera permission
   - Scan the QR code using in-app scanner
   - Document the result (success/failure, time taken, any issues)
4. Test Method 2 - Phone Camera:
   - Open phone's native camera app
   - Scan the same QR code
   - Tap the notification/link
   - Document the result (success/failure, time taken, any issues)
5. Compare the results

**Expected Results:**
- Both methods should successfully check in the user
- Both methods should deduct tokens correctly
- Both methods should update booking status to "attended"
- Process should be similar in both cases

**Actual Results:**

**In-App Scanner:**
- Success: [ ] Yes [ ] No
- Time to scan: [Enter time here]
- Issues encountered: [Document issues here]
- Error messages: [Document any errors here]

**Phone Camera Scan:**
- Success: [ ] Yes [ ] No
- Time to scan: [Enter time here]
- Issues encountered: [Document issues here]
- Error messages: [Document any errors here]
- Did it route to app: [ ] Yes [ ] No
- Did token deduction work: [ ] Yes [ ] No
- Any "invalid token format" errors: [ ] Yes [ ] No (If yes, document exact error)

**Comparison Notes:**
- Which method is easier to use: [Document here]
- Which method is more reliable: [Document here]
- Which method works faster: [Document here]
- Recommendations for improvement: [Document here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### Test Case 6.13: QR Code Scan - Walk-In Attendance (If Supported)

**Objective:** Verify that walk-in users (without booking) can check in if class allows drop-ins.

**Prerequisites:**
- User must be signed in
- User must NOT have a booking for the class
- Class must allow drop-in/walk-in attendance
- User must have sufficient tokens
- QR code must be available

**Steps:**
1. Sign in to the application
2. Verify you do NOT have a booking for the class
3. Verify the class allows walk-in attendance
4. Verify you have sufficient tokens
5. Open the QR scanner
6. Scan the QR code for the walk-in class
7. Observe the check-in process

**Expected Results:**
- Walk-in check-in is processed successfully
- Booking is created automatically
- Token is deducted
- User is checked in to the class
- Success message indicates walk-in check-in

**Actual Results:** [Document actual results here]

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

## QR Code Scanning - Known Issues to Test

When testing QR code scanning, pay special attention to:

1. **Phone Camera Scan Issues:**
   - Does the scanned URL route correctly to the application?
   - Is the token format correctly decoded from the URL?
   - Does token deduction work when scanning with phone camera?
   - Are there "invalid token format" errors?
   - How difficult is it to scan with phone camera?

2. **Token Deduction Verification:**
   - Verify tokens are deducted after check-in
   - Check that token balance updates correctly
   - Verify transaction records are created

3. **Error Handling:**
   - Are error messages clear and helpful?
   - Do errors prevent duplicate check-ins?
   - Are validation errors handled gracefully?

4. **Scanning Reliability:**
   - How many attempts are needed to scan successfully?
   - Is one method more reliable than the other?
   - Are there lighting or distance issues?

---

## Support and Issues

If you encounter issues during testing:
1. Document the issue clearly with steps to reproduce
2. Take screenshots of errors
3. Note the browser version and environment
4. Document exact error messages (especially "invalid token format" errors)
5. Note which scanning method was used (in-app or phone camera)
6. Report to the development team with detailed information
7. Reference this test script and the specific test case ID

---

**Document Version:** 1.1  
**Last Updated:** [Date]  
**Maintained By:** QA Team

