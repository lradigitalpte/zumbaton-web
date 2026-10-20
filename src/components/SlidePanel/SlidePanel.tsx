"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMobileOverlayLock } from "@/context/MobileOverlayContext";
import { Z_OVERLAY } from "@/lib/layering";

interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  position?: "right" | "left";
  showOverlay?: boolean;
  footer?: React.ReactNode;
}

const SlidePanel = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "lg",
  position = "right",
  showOverlay = true,
  footer,
}: SlidePanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const overlayKey = useId();
  useMobileOverlayLock(isOpen, `slide-panel-${overlayKey}`);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) && isOpen) {
        onClose();
      }
    };

    if (showOverlay) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose, showOverlay]);

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  const positionClasses = {
    right: {
      panel: "right-0",
      translate: isOpen ? "translate-x-0" : "translate-x-full",
    },
    left: {
      panel: "left-0",
      translate: isOpen ? "translate-x-0" : "-translate-x-full",
    },
  };

  if (!isOpen || !isMounted) return null;

  const panelContent = (
    <div className="fixed inset-0" style={{ zIndex: Z_OVERLAY }}>
      {/* Overlay */}
      {showOverlay && (
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Panel — bottom sheet on mobile, side drawer on md+ */}
      <div
        ref={panelRef}
        className={`absolute flex w-full flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out dark:bg-zinc-900
          inset-x-0 bottom-0 top-auto max-h-[92dvh] rounded-t-[1.35rem] md:max-h-none md:rounded-none
          md:top-0 md:h-full ${sizeClasses[size]} ${positionClasses[position].panel}
          max-md:translate-x-0 ${isOpen ? "max-md:translate-y-0 md:translate-y-0" : "max-md:translate-y-full md:translate-y-0"}
          md:transform ${positionClasses[position].translate}`}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="shrink-0 border-b border-zinc-200 px-4 pb-4 pt-3 dark:border-zinc-800 md:p-6">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-600 md:hidden" aria-hidden />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="line-clamp-2 text-lg font-bold tracking-tight text-zinc-900 dark:text-white md:text-xl md:font-semibold">
                  {title}
                </h2>
                {description && (
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 md:normal-case md:tracking-normal md:text-sm md:text-body-color">
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="ml-4 rounded-lg p-2 text-body-color transition-colors hover:bg-gray-100 hover:text-dark dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                aria-label="Close panel"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:p-6">{children}</div>

          {footer && (
            <div className="shrink-0 border-t border-zinc-200 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-zinc-800 md:p-6 md:pb-6">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof window !== "undefined") {
    return createPortal(panelContent, document.body);
  }

  return null;
};

export default SlidePanel;
