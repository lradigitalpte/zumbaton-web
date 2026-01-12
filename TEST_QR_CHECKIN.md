# QR Check-In Flow Test

This test script validates the complete QR code check-in flow for the Zumbaton app.

## Prerequisites

1. **Node.js 18+** (with native fetch support)
2. **Web app running** on `http://localhost:3000` (or update `WEB_APP_URL` in the script)
3. **Test user account**:
   - Email: `tes@gmail.com`
   - Password: `12345678`
4. **A class scheduled for today at 11:30am** (or the script will use the first available class today)

## What the Test Does

The test script performs the following steps:

1. **Sign In**: Authenticates the test user (`tes@gmail.com`)
2. **Find Class**: Searches for a class at 11:30am today (or uses first available)
3. **Book Class**: Creates a booking for the class
4. **Generate QR Code**: Creates QR code data (simulating what the admin/instructor does)
5. **Test Check-In**: Attempts to check in using the QR code
6. **Verify Attendance**: Confirms that attendance was recorded in the database

## Running the Test

### Option 1: Using npm script (recommended)

```bash
npm run test:qr-checkin
```

### Option 2: Direct execution

```bash
node test-qr-checkin.mjs
```

## Expected Output

If successful, you should see:

```
========================================
QR Check-In Flow Test
========================================

[Step 1] Signing in user...
✓ Signed in as tes@gmail.com

[Step 2] Finding class at 11:30am today...
ℹ Looking for classes on 2026-01-10 at 11:30am
ℹ Found 1 class(es) today
✓ Found class: ZUMBATON at 11:30:00 AM

[Step 3] Booking the class...
✓ Booked class: ZUMBATON
ℹ Booking ID: abc-123-def-456

[Step 4] Generating QR code data...
✓ QR code data generated
ℹ QR Token: AbCdEf123456
ℹ Check-in URL: http://localhost:3000/check-in/...

[Step 5] Testing check-in via QR code...
✓ Check-in successful!
ℹ Walk-in: No
ℹ Tokens used: 1

[Step 6] Verifying attendance was recorded...
ℹ Booking status: confirmed
ℹ Checked in: Yes
ℹ Checked in at: 1/10/2026, 11:30:00 AM
✓ Attendance verified!

========================================
✓ All tests passed!
========================================
```

## Troubleshooting

### "Sign in failed"
- Verify the test user exists: `tes@gmail.com` / `12345678`
- Check that the Supabase URL and keys are correct in `.env.local`

### "No classes found for today"
- Create a class scheduled for today at 11:30am in the admin dashboard
- Or the script will use the first available class today

### "Check-in failed"
- Ensure the class is scheduled for today
- Check that the booking was created successfully
- Verify the check-in window (30 min before to 2 hours after class start)

### "Web app not running"
- Start the web app: `npm run dev`
- Ensure it's running on `http://localhost:3000`
- Or update `WEB_APP_URL` in the script

## Manual Testing

After running the automated test, you can also manually test by:

1. Opening the check-in URL from the test output in a browser
2. If not signed in, you'll see the sign-in form
3. After signing in, the check-in should complete automatically
4. You should see a success message and redirect to the dashboard

## Notes

- The test uses the actual API endpoints, so it requires the web app to be running
- The QR code token is randomly generated for each test run
- The test handles cases where the class is already booked
- The script will use any available class today if no class exists at exactly 11:30am
