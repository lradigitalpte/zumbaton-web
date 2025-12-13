"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Modal from "@/components/Modal/Modal";

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const Sidebar = ({ isMobileOpen = false, onMobileClose }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
    // Dispatch storage event for other components to listen
    window.dispatchEvent(new Event("storage"));
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // Redirect to signin page after logout
      router.push("/signin");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: "Browse Classes",
      href: "/book-classes",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      name: "My Bookings",
      href: "/my-bookings",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: "Buy Tokens",
      href: "/packages",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: "Token History",
      href: "/tokens",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
  ];

  const bottomMenuItems = [
    {
      name: "Profile",
      href: "/profile",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      name: "Settings",
      href: "/settings",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobileOpen && onMobileClose) {
      onMobileClose();
    }
  }, [pathname]); // Only depend on pathname, not onMobileClose

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[45] lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-[50] h-screen flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        } bg-gray-900 border-r border-gray-800 shadow-lg lg:shadow-none ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
      {/* Logo & Toggle */}
      <div className="relative flex items-center h-16 px-4 border-b border-gray-800 shrink-0">
        {/* Logo - centered when collapsed, left-aligned when expanded */}
        <div className={`flex-1 flex items-center ${isCollapsed ? "justify-center" : ""}`}>
          {!isCollapsed ? (
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/logo/zumbaton logo (solid bg).png"
                alt="Zumbaton Logo"
                width={200}
                height={67}
                className="h-10 w-auto"
                priority
              />
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center justify-center">
              <Image
                src="/logo/logo fav.png"
                alt="Zumbaton"
                width={40}
                height={40}
                className="h-10 w-10 rounded-xl"
                priority
              />
            </Link>
          )}
        </div>
        
        {/* Mobile Close Button - absolute positioned */}
        <button
          onClick={onMobileClose}
          className="absolute right-2 lg:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
          aria-label="Close menu"
        >
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Desktop Collapse Toggle - absolute positioned */}
        <button
          onClick={toggleCollapse}
          className="absolute right-2 hidden lg:block p-2 rounded-lg hover:bg-gray-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg
            className={`w-5 h-5 text-gray-300 transition-transform ${
              isCollapsed ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* User Info */}
      <div className={`p-4 border-b border-gray-800 shrink-0 ${isCollapsed ? "text-center" : ""}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-lime-500/20 flex items-center justify-center shrink-0">
            <span className="text-lime-400 font-semibold">
              {user?.name?.charAt(0) || "U"}
            </span>
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="font-medium text-white truncate">
                {user?.name || "User"}
              </p>
              <p className="text-sm text-gray-400 truncate">
                {user?.email || ""}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Wrapper - Same as Admin */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-lime-500 text-gray-900 font-semibold"
                      : "text-gray-300 hover:bg-gray-800 hover:text-lime-400"
                  } ${isCollapsed ? "justify-center" : ""}`}
                  title={isCollapsed ? item.name : undefined}
                >
                  {item.icon}
                  {!isCollapsed && <span className="font-medium">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Fixed Bottom Section - Never Scrolls */}
        <div className="pt-4 pb-5 border-t border-gray-800">
          {/* Bottom Navigation */}
          <div className="px-4 space-y-2 mb-4">
            {bottomMenuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-lime-500 text-gray-900 font-semibold"
                      : "text-gray-300 hover:bg-gray-800 hover:text-lime-400"
                  } ${isCollapsed ? "justify-center" : ""}`}
                  title={isCollapsed ? item.name : undefined}
                >
                  {item.icon}
                  {!isCollapsed && <span className="font-medium">{item.name}</span>}
                </Link>
              );
            })}
          </div>

          {/* Logout Button - Always at Bottom */}
          <div className="px-4">
        <button
          onClick={() => setShowLogoutModal(true)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-900/30 transition-colors ${
            isCollapsed ? "justify-center" : ""
          }`}
          title={isCollapsed ? "Logout" : undefined}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Logout"
        description="Are you sure you want to logout? You'll need to sign in again to access your account."
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-body-color dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        }
      >
        <div className="space-y-2">
          <p className="text-body-color dark:text-gray-400">
            You will be signed out of your account and redirected to the sign in page.
          </p>
        </div>
      </Modal>
      </aside>
    </>
  );
};

export default Sidebar;
