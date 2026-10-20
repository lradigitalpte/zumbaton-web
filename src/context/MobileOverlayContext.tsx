"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type MobileOverlayContextValue = {
  overlayOpen: boolean;
  setOverlayOpen: (key: string, open: boolean) => void;
};

const MobileOverlayContext = createContext<MobileOverlayContextValue | null>(null);

export function MobileOverlayProvider({ children }: { children: ReactNode }) {
  const [openKeys, setOpenKeys] = useState<Set<string>>(() => new Set());

  const setOverlayOpen = useCallback((key: string, open: boolean) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (open) next.add(key);
      else next.delete(key);
      if (next.size === prev.size && [...next].every((k) => prev.has(k))) return prev;
      return next;
    });
  }, []);

  const overlayOpen = openKeys.size > 0;

  const value = useMemo(
    () => ({ overlayOpen, setOverlayOpen }),
    [overlayOpen, setOverlayOpen],
  );

  return <MobileOverlayContext.Provider value={value}>{children}</MobileOverlayContext.Provider>;
}

/** Hide mobile bottom nav while `isOpen` (stack-safe for nested overlays). */
export function useMobileOverlayLock(isOpen: boolean, key: string) {
  const ctx = useContext(MobileOverlayContext);

  useEffect(() => {
    if (!ctx || !isOpen) return;
    ctx.setOverlayOpen(key, true);
    return () => ctx.setOverlayOpen(key, false);
  }, [ctx, isOpen, key]);
}

export function useMobileOverlayOpen() {
  return useContext(MobileOverlayContext)?.overlayOpen ?? false;
}
