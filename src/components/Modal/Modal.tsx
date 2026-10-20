"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMobileOverlayLock } from "@/context/MobileOverlayContext";
import { Z_OVERLAY } from "@/lib/layering";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  footer?: React.ReactNode;
  showCloseButton?: boolean;
}

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  footer,
  showCloseButton = true,
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const overlayKey = useId();
  useMobileOverlayLock(isOpen, `modal-${overlayKey}`);

  // Ensure component is mounted before rendering portal
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
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && isOpen) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  if (!isOpen || !isMounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{ position: "fixed", zIndex: Z_OVERLAY }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal - Mobile Bottom Sheet / Desktop Centered */}
      <div
        ref={modalRef}
        className={`relative w-full ${sizeClasses[size]} flex max-h-[90vh] transform flex-col rounded-t-3xl bg-white shadow-xl transition-all duration-300 sm:max-h-[85vh] sm:rounded-2xl dark:bg-zinc-900 ${
          isOpen ? "translate-y-0" : "translate-y-full sm:translate-y-0"
        }`}
      >
        {/* Mobile Drag Handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-zinc-200 px-4 pb-4 pt-2 dark:border-zinc-800 sm:px-6 sm:pb-6 sm:pt-6">
          <div className="flex-1">
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white sm:text-xl">
              {title}
            </h2>
            {description && (
              <p className="mt-1 line-clamp-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200 sm:font-normal sm:text-body-color">
                {description}
              </p>
            )}
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="ml-4 p-2 rounded-lg text-body-color hover:text-dark dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Content - Scrollable */}
        <div className="px-4 sm:px-6 py-4 sm:py-6 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 border-t border-zinc-200 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-zinc-800 sm:px-6 sm:py-6 sm:pb-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  // Render modal at root level using portal
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
};

export default Modal;

