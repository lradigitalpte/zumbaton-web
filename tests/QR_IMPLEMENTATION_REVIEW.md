# QR Code Check-in Implementation Review

## Overview

This document provides a comprehensive review of the QR code check-in implementation, including the flow, potential issues, and recommendations for testing and fixes.

## QR Code Generation Flow (Admin Side)

### Location
- `zumbaton-admin/src/components/attendance/QRCodeDisplay.tsx`
- `zumbaton-admin/src/components/attendance/QRAttendanceModal.tsx`

### Process
1. Creates QR data object:
   ```typescript
   {
     classId: string (UUID),
     sessionDate: string (ISO date),
     sessionTime: string,
     token: string (random token),
     expiresAt: number (timestamp)
   }
   ```

2. Encodes data as base64:
   ```typescript
   const encodedData = btoa(JSON.stringify(qrDataObject));
   ```

3. Creates URL:
   ```typescript
   const checkInUrl = `${webAppUrl}/check-in/${encodedData}`;
   ```

4. Generates QR code image containing the URL

### Key Points
- QR code contains a URL, not raw JSON
- Base64 encoding uses standard `btoa()` (may contain `+`, `/`, `=` characters)
- URL format: `{webAppUrl}/check-in/{base64-encoded-data}`

## Phone Camera Scanning Flow

### Location
- `zumbaton-web/src/app/(public)/check-in/[token]/page.tsx`

### Process
1. Phone camera detects URL and opens it in browser
2. Next.js routes to `/check-in/[token]` where `[token]` is the base64 string
3. Page component receives token from URL params
4. Decoding logic:
   ```typescript
   // Try base64 decode first
   try {
     decoded = JSON.parse(atob(token));
   } catch {
     // Fallback to direct JSON parse
     decoded = JSON.parse(token);
   }
   ```

5. Validates required fields (`classId` and `token`)
6. Auto-checks-in if user is authenticated
7. POSTs to `/api/attendance/check-in` with `qrData` in body

### Potential Issues

1. **URL Encoding**: Base64 strings may contain characters (`+`, `/`, `=`) that need URL encoding. If Next.js doesn't handle this automatically, the token in the URL might be corrupted.

2. **Decoding Fallback**: The fallback to `JSON.parse(token)` assumes the token might be unencoded JSON, but it's always base64-encoded, so this fallback will always fail.

3. **Error Handling**: Errors are caught but may not provide clear feedback to the user.

## In-App Scanner Flow

### Location
- `zumbaton-web/src/components/QRScanner/index.tsx`

### Process
1. Scanner detects QR code and gets decoded text
2. Checks if text is a URL:
   ```typescript
   if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
     // Extract token from URL path
     const url = new URL(decodedText);
     const pathParts = url.pathname.split('/');
     const tokenIndex = pathParts.indexOf('check-in');
     const encodedData = pathParts[tokenIndex + 1];
     decoded = JSON.parse(atob(encodedData));
   } else {
     // Try direct JSON parse (legacy format)
     data = JSON.parse(decodedText);
   }
   ```

3. Validates required fields
4. Calls `handleCheckIn(data)` which POSTs to `/api/attendance/check-in`

### Potential Issues

1. **URL Parsing**: The token extraction logic splits the pathname and looks for `'check-in'` in the array. If the URL format changes or has trailing slashes, this could fail.

2. **Base64 Decoding**: Only tries `atob()` for URLs, doesn't have a fallback. If the base64 string is URL-encoded, `atob()` will fail.

3. **Error Messages**: Errors are logged to console but user may only see "Invalid QR format, keep scanning..." which isn't helpful.

## API Route Flow

### Location
- `zumbaton-web/src/app/api/attendance/check-in/route.ts`

### Process
1. Validates authentication
2. Validates request body schema (expects `qrData` object)
3. If `qrData` is present, forwards to admin API:
   ```typescript
   fetch(`${adminApiUrl}/attendance/qr-check-in`, {
     method: 'POST',
     body: JSON.stringify({ qrData, userId })
   })
   ```

4. Returns admin API response

### Admin API Route
- Location: `zumbaton-admin/src/app/api/attendance/qr-check-in/route.ts`
- Validates QR token expiration
- Checks if class exists
- Validates check-in time window
- Handles booked users, waitlist users, and walk-ins
- Calls attendance service to mark attendance

## Identified Issues

### Issue 1: Base64 URL Encoding
**Problem**: Base64 strings contain `+`, `/`, and `=` characters which may need URL encoding when used in URL paths.

**Impact**: Phone camera scanning may fail if the token in the URL is corrupted due to unencoded special characters.

**Current Code**:
```typescript
const encodedData = btoa(JSON.stringify(qrDataObject));
const checkInUrl = `${webAppUrl}/check-in/${encodedData}`;
```

**Potential Fix**: Use URL-safe base64 encoding or URL-encode the token:
```typescript
// Option 1: URL-safe base64 (replace + with -, / with _, remove =)
const urlSafeBtoa = (str: string) => {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

// Option 2: URL encode the base64 string
const encodedData = encodeURIComponent(btoa(JSON.stringify(qrDataObject)));
```

### Issue 2: Token Extraction Logic
**Problem**: The in-app scanner extracts the token by splitting the pathname and finding the index of 'check-in'. This is fragile.

**Current Code**:
```typescript
const pathParts = url.pathname.split('/');
const tokenIndex = pathParts.indexOf('check-in');
const encodedData = pathParts[tokenIndex + 1];
```

**Potential Fix**: Use a more robust extraction method:
```typescript
const match = url.pathname.match(/\/check-in\/(.+)$/);
const encodedData = match ? match[1] : null;
```

### Issue 3: Error Handling
**Problem**: Errors are caught but don't provide specific feedback. "Invalid QR format" is too generic.

**Current Code**:
```typescript
catch {
  console.log("Failed to decode URL token, keep scanning...");
  return;
}
```

**Potential Fix**: Provide more specific error messages and handle different error types:
```typescript
catch (error) {
  console.error("QR decode error:", error);
  if (error instanceof SyntaxError) {
    setError("Invalid QR code format - unable to decode");
  } else {
    setError("Failed to process QR code - please try again");
  }
  return;
}
```

### Issue 4: Decoding Fallback Logic
**Problem**: The phone camera route tries `JSON.parse(token)` as a fallback, but the token is always base64-encoded, so this will always fail.

**Current Code**:
```typescript
try {
  decoded = JSON.parse(atob(token));
} catch {
  decoded = JSON.parse(token); // This will always fail
}
```

**Potential Fix**: Handle URL-encoded tokens:
```typescript
try {
  // Try base64 decode
  decoded = JSON.parse(atob(token));
} catch {
  try {
    // Try URL-decode then base64 decode
    decoded = JSON.parse(atob(decodeURIComponent(token)));
  } catch {
    setErrorMessage("Invalid QR code format");
    setCheckInStatus("error");
  }
}
```

## Testing Recommendations

### Test Case 1: Phone Camera Scanning (Happy Path)
1. Generate QR code in admin
2. Scan with phone camera
3. Verify URL opens correctly
4. Verify token is decoded correctly
5. Verify check-in succeeds

### Test Case 2: Phone Camera Scanning (URL Encoding)
1. Generate QR code with base64 string containing `+`, `/`, or `=`
2. Scan with phone camera
3. Verify token is correctly extracted from URL
4. Verify decoding works

### Test Case 3: In-App Scanner (Happy Path)
1. Generate QR code in admin
2. Open in-app scanner
3. Scan QR code
4. Verify URL is detected
5. Verify token is extracted and decoded
6. Verify check-in succeeds

### Test Case 4: In-App Scanner (Direct JSON - Legacy)
1. Create QR code with raw JSON (if this format still exists)
2. Scan with in-app scanner
3. Verify direct JSON parsing works

### Test Case 5: Error Handling
1. Scan invalid QR code (wrong format)
2. Scan expired QR code
3. Scan QR code for non-existent class
4. Verify appropriate error messages are shown

## Recommended Fixes

### Priority 1: URL Encoding for Base64 Tokens
- Use URL-safe base64 encoding or URL-encode the token when generating the QR code URL
- Update decoding logic to handle URL-encoded tokens

### Priority 2: Improve Error Handling
- Add specific error messages for different failure scenarios
- Show errors to users instead of just logging to console

### Priority 3: Robust Token Extraction
- Use regex or more robust method to extract token from URL
- Handle edge cases (trailing slashes, query parameters, etc.)

### Priority 4: Remove Unused Fallback
- Remove the `JSON.parse(token)` fallback if tokens are always base64-encoded
- Or implement proper URL decoding before base64 decoding

## Environment Variables

Ensure these are set correctly:
- `NEXT_PUBLIC_WEB_URL`: Web app URL (used in QR code generation)
- `NEXT_PUBLIC_API_URL`: Admin API URL (used in check-in route)

## Related Files

### Admin Side
- `zumbaton-admin/src/components/attendance/QRCodeDisplay.tsx` - QR code generation
- `zumbaton-admin/src/components/attendance/QRAttendanceModal.tsx` - QR code modal
- `zumbaton-admin/src/app/api/attendance/qr-check-in/route.ts` - QR check-in API

### Web App Side
- `zumbaton-web/src/components/QRScanner/index.tsx` - In-app scanner
- `zumbaton-web/src/app/(public)/check-in/[token]/page.tsx` - Phone camera route
- `zumbaton-web/src/app/api/attendance/check-in/route.ts` - Check-in API proxy

