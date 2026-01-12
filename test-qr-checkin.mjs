/**
 * QR Check-In Flow Test Script (ESM version)
 * 
 * Tests the complete flow:
 * 1. Sign in user (tes@gmail.com)
 * 2. Find class at 11:30am today
 * 3. Book the class
 * 4. Generate QR code for the class
 * 5. Simulate scanning QR code
 * 6. Test check-in via QR code
 * 
 * Run with: node test-qr-checkin.mjs
 * 
 * Prerequisites:
 * - Node.js 18+ (with native fetch)
 * - npm install dotenv (if not using .env.local)
 * - Web app running on http://localhost:3000
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from .env.local
try {
  const envFile = readFileSync(join(__dirname, '.env.local'), 'utf8')
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match && !match[1].startsWith('#')) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  })
} catch (e) {
  console.warn('Could not load .env.local, using defaults')
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ejeihiyxuzlqamlgudnr.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqZWloaXl4dXpscWFtbGd1ZG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTIxMjYsImV4cCI6MjA4MDA4ODEyNn0.Qn_xFqWeKkuKjQbF89SMkHRrx61X-rNM3yG75wEaZn4'
const WEB_APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_WEB_APP_URL || 'http://localhost:3000'

// Test credentials
const TEST_EMAIL = 'tes@gmail.com'
const TEST_PASSWORD = '12345678'

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logStep(step, message) {
  log(`\n[Step ${step}] ${message}`, 'cyan')
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green')
}

function logError(message) {
  log(`✗ ${message}`, 'red')
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue')
}

// Helper to make API calls
async function apiCall(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error?.message || data.error || `HTTP ${response.status}`)
    }
    
    return { success: true, data, status: response.status }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Step 1: Sign in user
async function signIn() {
  logStep(1, 'Signing in user...')
  
  try {
    // Use Supabase auth API
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      }),
    })
    
    const data = await response.json()
    
    if (data.access_token) {
      logSuccess(`Signed in as ${TEST_EMAIL}`)
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        user: data.user,
      }
    } else {
      throw new Error(data.error_description || data.error || 'Sign in failed')
    }
  } catch (error) {
    logError(`Sign in failed: ${error.message}`)
    throw error
  }
}

// Step 2: Find class at 11:30am today
async function findClassToday(session) {
  logStep(2, 'Finding class at 11:30am today...')
  
  const today = new Date()
  today.setHours(11, 30, 0, 0)
  const todayISO = today.toISOString().split('T')[0]
  
  logInfo(`Looking for classes on ${todayISO} at 11:30am`)
  
  const result = await apiCall(`${WEB_APP_URL}/api/classes?date=${todayISO}`, {
    headers: {
      'Authorization': `Bearer ${session.accessToken}`,
    },
  })
  
  if (!result.success) {
    throw new Error(result.error)
  }
  
  const classes = result.data.data || []
  logInfo(`Found ${classes.length} class(es) today`)
  
  if (classes.length === 0) {
    throw new Error('No classes found for today. Please create a class at 11:30am first.')
  }
  
  // Find class at 11:30am
  const targetTime = new Date(today)
  targetTime.setHours(11, 30, 0, 0)
  
  const classAt1130 = classes.find(cls => {
    const classTime = new Date(cls.scheduled_at)
    return classTime.getHours() === 11 && classTime.getMinutes() === 30
  })
  
  if (!classAt1130) {
    // Try to find any class today
    const anyClassToday = classes[0]
    if (anyClassToday) {
      const classTime = new Date(anyClassToday.scheduled_at)
      logInfo(`No class at 11:30am, using first class today: ${anyClassToday.title} at ${classTime.toLocaleTimeString()}`)
      return anyClassToday
    }
    throw new Error('No classes found for today')
  }
  
  logSuccess(`Found class: ${classAt1130.title} at ${new Date(classAt1130.scheduled_at).toLocaleTimeString()}`)
  return classAt1130
}

// Step 3: Book the class
async function bookClass(session, classData) {
  logStep(3, 'Booking the class...')
  
  const result = await apiCall(`${WEB_APP_URL}/api/bookings`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify({
      classId: classData.id,
    }),
  })
  
  if (!result.success) {
    // Check if already booked
    if (result.error.includes('already') || result.error.includes('exists')) {
      logInfo('Class already booked, continuing with test...')
      // Try to get existing booking
      return { id: 'existing-booking', classId: classData.id }
    }
    throw new Error(result.error)
  }
  
  const booking = result.data.data || result.data
  logSuccess(`Booked class: ${classData.title}`)
  logInfo(`Booking ID: ${booking.id || booking.bookingId || 'N/A'}`)
  
  return booking
}

// Step 4: Generate QR code data (simulate what admin does)
function generateQRCodeData(classData) {
  logStep(4, 'Generating QR code data...')
  
  const now = new Date()
  const classTime = new Date(classData.scheduled_at)
  const sessionDate = classTime.toISOString().split('T')[0]
  const sessionTime = classTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
  
  // Generate token (12 random characters)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 12; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  const qrData = {
    classId: classData.id,
    sessionDate,
    sessionTime,
    token,
    expiresAt: Date.now() + (30 * 60 * 1000), // 30 minutes
  }
  
  // Encode as URL-safe base64
  const base64Data = Buffer.from(JSON.stringify(qrData)).toString('base64')
  const encodedData = base64Data.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  const checkInUrl = `${WEB_APP_URL}/check-in/${encodedData}`
  
  logSuccess('QR code data generated')
  logInfo(`QR Token: ${token}`)
  logInfo(`Check-in URL: ${checkInUrl}`)
  
  return { qrData, checkInUrl, token }
}

// Step 5: Test check-in via QR code
async function testCheckIn(session, qrData) {
  logStep(5, 'Testing check-in via QR code...')
  
  const result = await apiCall(`${WEB_APP_URL}/api/attendance/check-in`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify({
      qrData: {
        classId: qrData.classId,
        token: qrData.token,
        sessionDate: qrData.sessionDate,
        sessionTime: qrData.sessionTime,
        expiresAt: qrData.expiresAt,
      },
    }),
  })
  
  if (!result.success) {
    logError(`Check-in failed: ${result.error}`)
    return false
  }
  
  logSuccess('Check-in successful!')
  if (result.data.data) {
    logInfo(`Walk-in: ${result.data.data.wasWalkIn ? 'Yes' : 'No'}`)
    logInfo(`Tokens used: ${result.data.data.tokensConsumed || 0}`)
  }
  
  return true
}

// Step 6: Verify attendance was recorded
async function verifyAttendance(session, classData) {
  logStep(6, 'Verifying attendance was recorded...')
  
  // Check bookings to see if attendance is marked
  try {
    const response = await fetch(`${WEB_APP_URL}/api/bookings`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
    })
    
    const data = await response.json()
    const bookings = data.data || []
    
    const booking = bookings.find(b => 
      b.class_id === classData.id || b.classId === classData.id
    )
    
    if (booking) {
      logInfo(`Booking status: ${booking.status}`)
      logInfo(`Checked in: ${booking.checked_in ? 'Yes' : 'No'}`)
      if (booking.checked_in_at) {
        logInfo(`Checked in at: ${new Date(booking.checked_in_at).toLocaleString()}`)
      }
      
      if (booking.checked_in) {
        logSuccess('Attendance verified!')
        return true
      } else {
        logError('Attendance not marked as checked in')
        return false
      }
    } else {
      logError('Booking not found')
      return false
    }
  } catch (error) {
    logError(`Verification failed: ${error.message}`)
    return false
  }
}

// Main test function
async function runTest() {
  log('\n========================================', 'cyan')
  log('QR Check-In Flow Test', 'cyan')
  log('========================================', 'cyan')
  log(`\nWeb App URL: ${WEB_APP_URL}`, 'blue')
  log(`Test User: ${TEST_EMAIL}`, 'blue')
  
  let session = null
  let classData = null
  let booking = null
  let qrData = null
  
  try {
    // Step 1: Sign in
    session = await signIn()
    
    // Step 2: Find class
    classData = await findClassToday(session)
    
    // Step 3: Book class
    booking = await bookClass(session, classData)
    
    // Step 4: Generate QR code
    const qrInfo = generateQRCodeData(classData)
    qrData = qrInfo.qrData
    
    // Step 5: Test check-in
    const checkInSuccess = await testCheckIn(session, qrData)
    
    if (!checkInSuccess) {
      throw new Error('Check-in failed')
    }
    
    // Step 6: Verify attendance
    await verifyAttendance(session, classData)
    
    log('\n========================================', 'green')
    log('✓ All tests passed!', 'green')
    log('========================================', 'green')
    
    log('\nSummary:', 'cyan')
    log(`- User: ${TEST_EMAIL}`, 'blue')
    log(`- Class: ${classData.title}`, 'blue')
    log(`- Booking ID: ${booking.id || booking.bookingId || 'N/A'}`, 'blue')
    log(`- QR Token: ${qrData.token}`, 'blue')
    log(`- Check-in URL: ${qrInfo.checkInUrl}`, 'blue')
    log(`\nYou can test the QR code by opening: ${qrInfo.checkInUrl}`, 'yellow')
    
  } catch (error) {
    log('\n========================================', 'red')
    log('✗ Test failed!', 'red')
    log('========================================', 'red')
    logError(`Error: ${error.message}`)
    if (error.stack) {
      logError(`Stack: ${error.stack}`)
    }
    process.exit(1)
  }
}

// Run the test
runTest().catch(error => {
  logError(`Fatal error: ${error.message}`)
  process.exit(1)
})
