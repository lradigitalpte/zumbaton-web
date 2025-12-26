# Zumbaton Image Replacement Guide

This document lists all locations where Unsplash/gym images need to be replaced with real Zumbaton images.

## Recommended Image Structure

Place your Zumbaton images in: `zumbaton-web/public/images/zumbaton/`

Suggested naming:
- `hero-slide-1.jpg` - Hero section slide 1
- `hero-slide-2.jpg` - Hero section slide 2
- `hero-slide-3.jpg` - Hero section slide 3
- `about-section-1.jpg` - About section image 1
- `about-section-2.jpg` - About section image 2
- `about-section-3.jpg` - About section image 3
- `about-section-4.jpg` - About section image 4
- `community-bg.jpg` - Community highlights background
- `pricing-bg.jpg` - Pricing section background
- `schedule-bg.jpg` - Schedule hero background
- `classes-bg.jpg` - Classes hero background
- `contact-bg.jpg` - Contact CTA background
- `mission-vision-bg.jpg` - Mission/Vision background
- `video-thumbnail.jpg` - Video section thumbnail
- `about-hero-bg.jpg` - About page hero background

## Images to Replace

### 1. Hero Section (`src/components/Hero/index.tsx`)
**Location:** Lines 11, 20, 29
- **Slide 1:** `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070`
  - Replace with: `/images/zumbaton/hero-slide-1.jpg`
- **Slide 2:** `https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2070`
  - Replace with: `/images/zumbaton/hero-slide-2.jpg`
- **Slide 3:** `https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?q=80&w=2070`
  - Replace with: `/images/zumbaton/hero-slide-3.jpg`

### 2. About Section One (`src/components/About/AboutSectionOne.tsx`)
**Location:** Lines 84, 102
- **Image 1:** `https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200`
  - Replace with: `/images/zumbaton/about-section-1.jpg`
- **Image 2:** `https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200`
  - Replace with: `/images/zumbaton/about-section-2.jpg`

### 3. About Section Two (`src/components/About/AboutSectionTwo.tsx`)
**Location:** Lines 41, 82, 101
- **Background:** `https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2070`
  - Replace with: `/images/zumbaton/about-section-bg.jpg`
- **Image 1:** `https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200`
  - Replace with: `/images/zumbaton/about-section-3.jpg`
- **Image 2:** `https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=800`
  - Replace with: `/images/zumbaton/about-section-4.jpg`

### 4. About Hero (`src/components/About/AboutHero.tsx`)
**Location:** Line 33
- **Background:** `https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070`
  - Replace with: `/images/zumbaton/about-hero-bg.jpg`

### 5. Mission/Vision (`src/components/About/MissionVision.tsx`)
**Location:** Line 35
- **Background:** `https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070`
  - Replace with: `/images/zumbaton/mission-vision-bg.jpg`

### 6. Video Section (`src/components/Video/index.tsx`)
**Location:** Line 36
- **Thumbnail:** `https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1600`
  - Replace with: `/images/zumbaton/video-thumbnail.jpg`

### 7. Community Highlights (`src/components/Community/CommunityHighlights.tsx`)
**Location:** Line 55
- **Background:** `https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2070`
  - Replace with: `/images/zumbaton/community-bg.jpg`

### 8. Pricing Section (`src/components/Pricing/index.tsx`)
**Location:** Line 54
- **Background:** `https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070`
  - Replace with: `/images/zumbaton/pricing-bg.jpg`

### 9. Pricing Hero (`src/components/Pricing/PricingHero.tsx`)
**Location:** Line 32
- **Background:** `https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2070`
  - Replace with: `/images/zumbaton/pricing-bg.jpg`

### 10. Schedule Hero (`src/components/Schedule/ScheduleHero.tsx`)
**Location:** Line 32
- **Background:** `https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2070`
  - Replace with: `/images/zumbaton/schedule-bg.jpg`

### 11. Classes Hero (`src/components/Classes/ClassesHero.tsx`)
**Location:** Line 43
- **Background:** `https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?q=80&w=2070`
  - Replace with: `/images/zumbaton/classes-bg.jpg`

### 12. Contact CTA (`src/components/Contact/ContactCTA.tsx`)
**Location:** Line 30
- **Background:** `https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?q=80&w=2070`
  - Replace with: `/images/zumbaton/contact-bg.jpg`

### 13. Page Hero (Common Component) (`src/components/Common/PageHero.tsx`)
**Location:** Line 16 (default)
- **Default Background:** `https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070`
  - Replace with: `/images/zumbaton/default-page-bg.jpg`

## Image Requirements

### Recommended Dimensions:
- **Hero slides:** 2070x1380px (3:2 ratio) or larger
- **About section images:** 1200x1200px (square) or 1200x800px (4:3)
- **Background images:** 2070x1380px or larger
- **Video thumbnail:** 1600x900px (16:9 ratio)

### Format:
- Use JPG for photos (smaller file size)
- Use WebP for better compression (optional)
- Ensure images are optimized (compressed) before adding

## Quick Replacement Steps

1. **Add images to:** `zumbaton-web/public/images/zumbaton/`
2. **Update each file** listed above with the new image paths
3. **Test** that all images load correctly
4. **Optimize** images if file sizes are too large

## Notes

- All image paths should start with `/images/` (not `https://`)
- Next.js Image component will automatically optimize images
- Keep original high-resolution images for future use
- Consider using Next.js Image optimization for better performance

