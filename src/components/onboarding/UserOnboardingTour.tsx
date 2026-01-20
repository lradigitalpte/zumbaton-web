"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetchJson } from '@/lib/api-fetch';

interface OnboardingStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    type: 'navigate' | 'click' | 'highlight';
    value?: string;
  };
}

const USER_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    target: 'body',
    title: 'Welcome to Zumbaton! 🎉',
    content: 'Let\'s take a quick tour to help you get started. You\'ll learn how to browse classes, book sessions, and manage your fitness journey.',
    position: 'center',
  },
  {
    id: 'dashboard',
    target: '[data-onboarding="user-dashboard-menu"]',
    title: 'Dashboard 📊',
    content: 'Your dashboard shows your token balance, upcoming classes, quick stats, and quick actions. This is your fitness command center!',
    position: 'right',
    action: {
      type: 'navigate',
      value: '/dashboard',
    },
  },
  {
    id: 'browse-classes',
    target: '[data-onboarding="user-browse-classes-menu"]',
    title: 'Browse Classes 🏋️',
    content: 'Explore all available fitness classes. Filter by type, instructor, or time. Find the perfect class for your schedule!',
    position: 'right',
    action: {
      type: 'navigate',
      value: '/book-classes',
    },
  },
  {
    id: 'my-bookings',
    target: '[data-onboarding="user-my-bookings-menu"]',
    title: 'My Bookings 📅',
    content: 'View all your upcoming and past class bookings. Manage cancellations and see your class history.',
    position: 'right',
    action: {
      type: 'navigate',
      value: '/my-bookings',
    },
  },
  {
    id: 'buy-tokens',
    target: '[data-onboarding="user-buy-tokens-menu"]',
    title: 'Buy Tokens 💰',
    content: 'Purchase token packages to book classes. Tokens never expire and can be used for any class. Choose the package that fits your fitness goals!',
    position: 'right',
    action: {
      type: 'navigate',
      value: '/packages',
    },
  },
  {
    id: 'my-packages',
    target: '[data-onboarding="user-my-packages-menu"]',
    title: 'My Packages 📦',
    content: 'View your purchased token packages, track usage, and see expiration dates. Manage your token inventory here.',
    position: 'right',
    action: {
      type: 'navigate',
      value: '/my-packages',
    },
  },
  {
    id: 'token-history',
    target: '[data-onboarding="user-token-history-menu"]',
    title: 'Token History 📜',
    content: 'See a complete history of your token transactions - purchases, bookings, refunds, and adjustments.',
    position: 'right',
    action: {
      type: 'navigate',
      value: '/tokens',
    },
  },
  {
    id: 'profile',
    target: '[data-onboarding="user-profile-menu"]',
    title: 'Profile & Settings ⚙️',
    content: 'Manage your profile information, update preferences, and configure your account settings.',
    position: 'right',
    action: {
      type: 'navigate',
      value: '/profile',
    },
  },
  {
    id: 'complete',
    target: 'body',
    title: 'You\'re All Set! 🚀',
    content: 'You now know your way around Zumbaton! Start browsing classes and book your first session. Let\'s get moving!',
    position: 'center',
  },
];

export default function UserOnboardingTour() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({});
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
  const [arrowPosition, setArrowPosition] = useState<'top' | 'bottom' | 'left' | 'right' | 'none'>('none');
  const router = useRouter();
  const pathname = usePathname();
  const targetRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only check/show onboarding if user is authenticated and we haven't checked yet
    if (typeof window === 'undefined') return;
    if (isLoading) return; // Wait for auth to load
    if (!isAuthenticated || !user?.id) return; // Only show for authenticated users
    if (hasChecked) return; // Only check once
    
    setHasChecked(true);
    
    // Check onboarding status from database
    const checkOnboardingStatus = async () => {
      try {
        const response = await apiFetchJson<{ success: boolean; data?: { completed: boolean } }>(
          '/api/onboarding',
          { method: 'GET', requireAuth: true }
        );
        
        const completed = response.success && response.data?.completed;
        
        if (!completed) {
          // Start onboarding after a short delay
          const timer = setTimeout(() => {
            setIsActive(true);
            // Wait a bit more for DOM to be ready
            setTimeout(() => {
              updateStepPosition(0);
            }, 500);
          }, 1000);
          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error('[Onboarding] Error checking status:', error);
        // On error, don't show onboarding (fail silently)
      }
    };
    
    checkOnboardingStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id, isLoading, hasChecked]);

  const updateStepPosition = useCallback((stepIndex: number) => {
    const step = USER_ONBOARDING_STEPS[stepIndex];
    if (!step) return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // On mobile: Always show centered modal, don't try to link to sidebar elements
    // Sidebar is collapsed on mobile, so linking is useless
    if (isMobile || step.target === 'body' || step.position === 'center') {
      // Center overlay for mobile or welcome/complete steps
      setOverlayStyle({
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(2px)',
        zIndex: 9998,
      });
      // Mobile: Smaller, compact modal (max 320px width)
      // Desktop: Max 420px
      const modalWidth = isMobile 
        ? Math.min(window.innerWidth - 32, 320)  // Smaller on mobile, max 320px
        : Math.min(420, window.innerWidth - 40);
      setTooltipStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        maxWidth: `${modalWidth}px`,
        width: `${modalWidth}px`,
        maxHeight: isMobile ? '85vh' : 'auto',
        overflowY: 'auto',
      });
      setHighlightStyle({});
      setArrowPosition('none');
      return;
    }

    // Find target element - retry if not found (element might load after navigation)
    const targetElement = document.querySelector(step.target) as HTMLElement;
    
    if (!targetElement) {
      // Retry finding element (for elements that load after navigation)
      let retries = 0;
      const maxRetries = 10;
      const retryInterval = 400;
      
      const retryFind = () => {
        retries++;
        const element = document.querySelector(step.target) as HTMLElement;
        if (element && element.getBoundingClientRect().width > 0) {
          // Found it! Recursively call updateStepPosition to position it correctly
          // Use requestAnimationFrame to ensure DOM is ready
          requestAnimationFrame(() => {
            updateStepPosition(stepIndex);
          });
        } else if (retries < maxRetries) {
          // Keep retrying
          setTimeout(retryFind, retryInterval);
        } else {
          // Max retries reached - show centered tooltip without highlight
          // But don't auto-skip - let user manually proceed
          const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
          const modalWidth = isMobile 
            ? Math.min(window.innerWidth - 32, 320)  // Smaller on mobile
            : Math.min(420, window.innerWidth - 40);
          setHighlightStyle({});
          setOverlayStyle({
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(2px)',
            zIndex: 9996,
          });
          setTooltipStyle({
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
            maxWidth: `${modalWidth}px`,
            width: `${modalWidth}px`,
            maxHeight: isMobile ? '85vh' : 'auto',
            overflowY: 'auto',
          });
          setArrowPosition('none');
        }
      };
      
      // Start retrying immediately
      setTimeout(retryFind, retryInterval);
      return; // Exit early, retry will handle positioning when found
    }

    // Desktop only - mobile is handled above with early return
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Safety check: if somehow on mobile, show centered modal
    if (viewportWidth < 768) {
      const modalWidth = Math.min(window.innerWidth - 32, 320);
      setHighlightStyle({});
      setOverlayStyle({
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(2px)',
        zIndex: 9996,
      });
      setTooltipStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        maxWidth: `${modalWidth}px`,
        width: `${modalWidth}px`,
        maxHeight: '85vh',
        overflowY: 'auto',
      });
      setArrowPosition('none');
      return;
    }

    targetRef.current = targetElement;
    const rect = targetElement.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    // Add pulsing highlight effect to target element
    const highlightRect = {
      top: rect.top + scrollY,
      left: rect.left + scrollX,
      width: rect.width,
      height: rect.height,
    };

    // Only set highlight if element exists and has valid dimensions
    if (rect.width > 0 && rect.height > 0) {
      setHighlightStyle({
        position: 'absolute',
        top: `${highlightRect.top}px`,
        left: `${highlightRect.left}px`,
        width: `${highlightRect.width}px`,
        height: `${highlightRect.height}px`,
        borderRadius: '8px',
        border: '3px solid #3b82f6',
        boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)',
        zIndex: 9997,
        pointerEvents: 'none',
        animation: 'pulse-highlight 2s ease-in-out infinite',
      });
    } else {
      setHighlightStyle({});
    }

    // Create spotlight overlay
    setOverlayStyle({
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      backdropFilter: 'blur(2px)',
      zIndex: 9996,
      clipPath: `polygon(
        0% 0%,
        0% 100%,
        ${rect.left - 8}px 100%,
        ${rect.left - 8}px ${rect.top - 8}px,
        ${rect.right + 8}px ${rect.top - 8}px,
        ${rect.right + 8}px ${rect.bottom + 8}px,
        ${rect.left - 8}px ${rect.bottom + 8}px,
        ${rect.left - 8}px 100%,
        100% 100%,
        100% 0%
      )`,
    });

    // Position tooltip - mobile responsive
    let tooltipTop = rect.top + scrollY;
    let tooltipLeft = rect.left + scrollX;
    let arrowPos: 'top' | 'bottom' | 'left' | 'right' = 'right';
    
    // Desktop only (mobile is handled above)
    const tooltipWidth = Math.min(380, viewportWidth - 40);
    const tooltipHeight = 250;
    const spacing = 16;

    const spaceRight = viewportWidth - rect.right;
    const spaceLeft = rect.left;
    const spaceTop = rect.top;
    const spaceBottom = viewportHeight - rect.bottom;

    // Desktop positioning logic
    {
      // Desktop: Use preferred position
      if (step.position === 'right' && spaceRight >= tooltipWidth + spacing) {
        tooltipLeft = rect.right + scrollX + spacing;
        tooltipTop = rect.top + scrollY + rect.height / 2;
        arrowPos = 'left';
      } else if (step.position === 'left' && spaceLeft >= tooltipWidth + spacing) {
        tooltipLeft = rect.left + scrollX - tooltipWidth - spacing;
        tooltipTop = rect.top + scrollY + rect.height / 2;
        arrowPos = 'right';
      } else if (step.position === 'bottom' && spaceBottom >= tooltipHeight + spacing) {
        tooltipTop = rect.bottom + scrollY + spacing;
        tooltipLeft = rect.left + scrollX + rect.width / 2;
        arrowPos = 'top';
      } else if (step.position === 'top' && spaceTop >= tooltipHeight + spacing) {
        tooltipTop = rect.top + scrollY - tooltipHeight - spacing;
        tooltipLeft = rect.left + scrollX + rect.width / 2;
        arrowPos = 'bottom';
      } else {
        // Fallback positioning
        if (spaceRight >= tooltipWidth) {
          tooltipLeft = rect.right + scrollX + spacing;
          tooltipTop = rect.top + scrollY + rect.height / 2;
          arrowPos = 'left';
        } else if (spaceLeft >= tooltipWidth) {
          tooltipLeft = rect.left + scrollX - tooltipWidth - spacing;
          tooltipTop = rect.top + scrollY + rect.height / 2;
          arrowPos = 'right';
        } else if (spaceBottom >= tooltipHeight) {
          tooltipTop = rect.bottom + scrollY + spacing;
          tooltipLeft = rect.left + scrollX + rect.width / 2;
          arrowPos = 'top';
        } else {
          tooltipTop = rect.top + scrollY - tooltipHeight - spacing;
          tooltipLeft = rect.left + scrollX + rect.width / 2;
          arrowPos = 'bottom';
        }
      }
    }

    // Ensure tooltip stays within viewport (desktop only)
    tooltipTop = Math.max(20, Math.min(tooltipTop, viewportHeight - tooltipHeight - 20));
    tooltipLeft = Math.max(20, Math.min(tooltipLeft, viewportWidth - tooltipWidth - 20));

    setTooltipStyle({
      position: 'fixed',
      top: `${tooltipTop}px`,
      left: `${tooltipLeft}px`,
      zIndex: 9999,
      maxWidth: `${tooltipWidth}px`,
      width: `${tooltipWidth}px`,
      maxHeight: 'auto',
      overflowY: 'auto',
      transform: arrowPos === 'left' || arrowPos === 'right' 
        ? 'translateY(-50%)' 
        : 'translateX(-50%)',
    });

    // Calculate arrow position
    let arrowTop: string | number = 0;
    let arrowLeft: string | number = 0;
    
    if (arrowPos === 'left') {
      arrowTop = '50%';
      arrowLeft = '-12px';
    } else if (arrowPos === 'right') {
      arrowTop = '50%';
      arrowLeft = '100%';
    } else if (arrowPos === 'top') {
      arrowTop = '-12px';
      arrowLeft = '50%';
    } else if (arrowPos === 'bottom') {
      arrowTop = '100%';
      arrowLeft = '50%';
    }

    setArrowStyle({
      position: 'absolute',
      top: arrowTop,
      left: arrowLeft,
      transform: arrowPos === 'left' || arrowPos === 'right' 
        ? 'translateY(-50%)' 
        : 'translateX(-50%)',
    });

    setArrowPosition(arrowPos);

    // Scroll into view if needed - only if element is not already visible
    const elementTop = rect.top;
    const elementBottom = rect.bottom;
    const viewportTop = 0;
    const viewportBottom = viewportHeight;
    
    if (elementTop < viewportTop || elementBottom > viewportBottom) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }
  }, []);

  useEffect(() => {
    if (isActive && currentStep < USER_ONBOARDING_STEPS.length && typeof window !== 'undefined') {
      // Clear previous highlights first
      setHighlightStyle({});
      setOverlayStyle({});
      
      // Wait for navigation to complete and DOM to be ready
      // Use a longer delay to ensure page has fully loaded
      const timer = setTimeout(() => {
        updateStepPosition(currentStep);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isActive, pathname, updateStepPosition]);

  const handleNext = () => {
    const step = USER_ONBOARDING_STEPS[currentStep];
    const nextStepIndex = currentStep + 1;
    
    // Check if NEXT step has navigation action - navigate BEFORE showing that step
    if (nextStepIndex < USER_ONBOARDING_STEPS.length) {
      const nextStep = USER_ONBOARDING_STEPS[nextStepIndex];
      if (nextStep.action && nextStep.action.type === 'navigate' && nextStep.action.value) {
        // Navigate to the next step's target page first
        router.push(nextStep.action.value);
        // Wait longer for navigation to complete before showing next step
        setTimeout(() => {
          setCurrentStep(nextStepIndex);
        }, 800);
        return;
      }
    }
    
    // Handle current step action if specified (for non-navigation actions)
    if (step.action) {
      if (step.action.type === 'click' && step.action.value) {
        const element = document.querySelector(step.action.value) as HTMLElement;
        element?.click();
      }
    }

    // Move to next step normally (no navigation needed)
    if (nextStepIndex < USER_ONBOARDING_STEPS.length) {
      setCurrentStep(nextStepIndex);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    setIsActive(false);
    if (!user?.id) return;
    
    // Mark onboarding as completed in database
    try {
      await apiFetchJson('/api/onboarding', {
        method: 'PUT',
        body: JSON.stringify({ completed: true }),
        requireAuth: true,
      });
    } catch (error) {
      console.error('[Onboarding] Error marking as completed:', error);
      // Continue even if API call fails
    }
  };

  if (!isActive || currentStep >= USER_ONBOARDING_STEPS.length) {
    return null;
  }

  const step = USER_ONBOARDING_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === USER_ONBOARDING_STEPS.length - 1;

  return (
    <>
      <style jsx>{`
        @keyframes pulse-highlight {
          0%, 100% {
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3), 0 0 15px rgba(59, 130, 246, 0.5), 0 0 30px rgba(59, 130, 246, 0.3);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 0 5px rgba(59, 130, 246, 0.4), 0 0 25px rgba(59, 130, 246, 0.6), 0 0 50px rgba(59, 130, 246, 0.4);
            transform: scale(1.01);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .onboarding-tooltip {
          animation: slideIn 0.25s ease-out;
        }

        @media (max-width: 767px) {
          .onboarding-tooltip {
            max-height: calc(100vh - 24px);
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            padding: 0 16px;
          }
          
          .onboarding-tooltip-content {
            padding: 20px !important;
          }
          
          .onboarding-title {
            font-size: 20px !important;
            line-height: 1.3 !important;
            margin-bottom: 10px !important;
          }
          
          .onboarding-content {
            font-size: 14px !important;
            line-height: 1.5 !important;
            margin-bottom: 18px !important;
          }
          
          .onboarding-buttons {
            flex-direction: column-reverse !important;
            gap: 10px !important;
          }
          
          .onboarding-button {
            width: 100% !important;
            padding: 12px 18px !important;
            font-size: 15px !important;
          }
          
          .onboarding-step-indicator {
            font-size: 11px !important;
            margin-bottom: 8px !important;
          }
          
          .onboarding-progress-bar {
            height: 2px !important;
          }
          
          .onboarding-skip-button {
            font-size: 13px !important;
            padding: 6px 12px !important;
          }
        }

        .touch-manipulation {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>

      <div
        style={overlayStyle}
        className="fixed inset-0 z-[9996] transition-all duration-300"
        onClick={isFirstStep ? undefined : handleNext}
      />

      {highlightStyle.top && (
        <div
          style={highlightStyle}
          className="pointer-events-none"
        />
      )}

      <div
        ref={tooltipRef}
        style={tooltipStyle}
        className="onboarding-tooltip z-[9999]"
        role="dialog"
        aria-labelledby="user-onboarding-title"
        aria-describedby="user-onboarding-content"
      >
        <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-2xl border-2 border-gray-900 dark:border-gray-700 p-4 sm:p-6 relative mx-auto onboarding-tooltip-content">
          {arrowPosition !== 'none' && (
            <div
              style={arrowStyle}
              className={`absolute w-0 h-0 ${
                arrowPosition === 'left' 
                  ? 'border-t-[12px] border-b-[12px] border-r-[12px] border-t-transparent border-b-transparent border-r-gray-900 dark:border-r-gray-700'
                  : arrowPosition === 'right'
                  ? 'border-t-[12px] border-b-[12px] border-l-[12px] border-t-transparent border-b-transparent border-l-gray-900 dark:border-l-gray-700'
                  : arrowPosition === 'top'
                  ? 'border-l-[12px] border-r-[12px] border-b-[12px] border-l-transparent border-r-transparent border-b-gray-900 dark:border-b-gray-700'
                  : 'border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent border-t-gray-900 dark:border-t-gray-700'
              }`}
            />
          )}

          <div className="mb-3 sm:mb-4 onboarding-step-indicator">
            <div className="flex items-center justify-between text-xs sm:text-sm font-medium mb-2 sm:mb-3">
              <span className="text-gray-600 dark:text-gray-400">
                Step {currentStep + 1} of {USER_ONBOARDING_STEPS.length}
              </span>
              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors font-medium text-xs sm:text-sm px-2 py-1 -mr-2 onboarding-skip-button"
                aria-label="Skip tour"
              >
                Skip
              </button>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 sm:h-2 overflow-hidden onboarding-progress-bar">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 sm:h-2 rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${((currentStep + 1) / USER_ONBOARDING_STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          <h3 
            id="user-onboarding-title"
            className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 leading-tight onboarding-title"
          >
            {step.title}
          </h3>
          <p 
            id="user-onboarding-content"
            className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed onboarding-content"
          >
            {step.content}
          </p>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700 onboarding-buttons">
            <button
              onClick={handleNext}
              className="px-5 sm:px-6 py-3 sm:py-2.5 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto touch-manipulation onboarding-button"
              aria-label={isLastStep ? 'Complete tour' : 'Next step'}
            >
              {isLastStep ? 'Get Started! 🚀' : 'Next →'}
            </button>
            {!isFirstStep && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 sm:px-5 py-3 sm:py-2.5 text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 rounded-lg transition-all duration-200 border border-gray-300 dark:border-gray-600 w-full sm:w-auto touch-manipulation onboarding-button"
                aria-label="Previous step"
              >
                ← Back
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export function useUserOnboarding() {
  const { user } = useAuth();
  const [isCompleted, setIsCompleted] = useState<boolean>(true);
  
  useEffect(() => {
    if (!user?.id) {
      setIsCompleted(true);
      return;
    }
    
    // Check onboarding status from database
    const checkStatus = async () => {
      try {
        const response = await apiFetchJson<{ success: boolean; data?: { completed: boolean } }>(
          '/api/onboarding',
          { method: 'GET', requireAuth: true }
        );
        setIsCompleted(response.success && response.data?.completed || false);
      } catch (error) {
        console.error('[useUserOnboarding] Error checking status:', error);
        setIsCompleted(true); // Default to completed on error
      }
    };
    
    checkStatus();
  }, [user?.id]);
  
  const handleRestart = async () => {
    if (!user?.id) return;
    
    try {
      // Reset onboarding status in database
      await apiFetchJson('/api/onboarding', {
        method: 'PUT',
        body: JSON.stringify({ completed: false }),
        requireAuth: true,
      });
      window.location.reload();
    } catch (error) {
      console.error('[useUserOnboarding] Error restarting:', error);
    }
  };

  return {
    restart: handleRestart,
    isCompleted,
  };
}
