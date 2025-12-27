/**
 * Avatar Upload API Route
 * POST /api/profile/upload-avatar - Upload user avatar image
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Initialize Supabase client for auth
const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: false,
    },
  }
)

// Initialize Supabase admin client for storage
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

/**
 * Get authenticated user from Authorization header
 */
async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return null
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabaseAuth.auth.getUser(token)
  
  if (error || !user) {
    return null
  }

  return {
    id: user.id,
    email: user.email || '',
  }
}

/**
 * POST /api/profile/upload-avatar - Upload avatar image
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    // Get the file from form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No file provided',
        },
      }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.',
        },
      }, { status: 400 })
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'File size too large. Maximum size is 5MB.',
        },
      }, { status: 400 })
    }

    // Generate unique filename: userId-timestamp.ext
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = fileName // Just the filename, not the folder path since we're uploading to the avatars bucket

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('avatars')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false, // Don't overwrite existing files
      })

    if (uploadError) {
      console.error('[API /profile/upload-avatar] Upload error:', uploadError)
      return NextResponse.json({
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: 'Failed to upload image',
        },
      }, { status: 500 })
    }

    // Get public URL for the uploaded file
    // Since the bucket is public, we can use getPublicUrl
    const { data: urlData } = supabaseAdmin.storage
      .from('avatars')
      .getPublicUrl(filePath)

    const publicUrl = urlData.publicUrl
    
    // If bucket is not public, use signed URL instead (valid for 1 year)
    // const { data: signedUrlData } = supabaseAdmin.storage
    //   .from('avatars')
    //   .createSignedUrl(filePath, 31536000) // 1 year in seconds
    // const publicUrl = signedUrlData?.signedUrl || urlData.publicUrl

    // Update user profile with new avatar URL
    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({ 
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('[API /profile/upload-avatar] Update error:', updateError)
      // Try to delete the uploaded file if profile update fails
      await supabaseAdmin.storage.from('avatars').remove([filePath])
      
      return NextResponse.json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update profile with avatar URL',
        },
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        avatarUrl: publicUrl,
        message: 'Avatar uploaded successfully',
      },
    })
  } catch (error) {
    console.error('[API /profile/upload-avatar]', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    }, { status: 500 })
  }
}

