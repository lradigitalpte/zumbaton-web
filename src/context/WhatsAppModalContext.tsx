"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import WhatsAppLeadModal from "@/components/WhatsApp/WhatsAppLeadModal";

interface WhatsAppModalContextType {
  openWhatsAppModal: () => void;
  closeWhatsAppModal: () => void;
}

const WhatsAppModalContext = createContext<WhatsAppModalContextType | null>(null);

export function WhatsAppModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openWhatsAppModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeWhatsAppModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <WhatsAppModalContext.Provider value={{ openWhatsAppModal, closeWhatsAppModal }}>
      {children}
      <WhatsAppLeadModal isOpen={isOpen} onClose={closeWhatsAppModal} />
    </WhatsAppModalContext.Provider>
  );
}

export function useWhatsAppModal() {
  const ctx = useContext(WhatsAppModalContext);
  if (!ctx) {
    throw new Error("useWhatsAppModal must be used within WhatsAppModalProvider");
  }
  return ctx;
}
