"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { apiFetch } from "@/lib/api-fetch";
import { useRouter } from "next/navigation";

const SettingsPage = () => {
  const { signOut, user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  
  const [notifications, setNotifications] = useState({
    classReminders: true,
    bookingConfirmations: true,
    promotions: false,
    newClasses: true,
  });
  
  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showStats: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      // Load notification preferences
      const notificationsResponse = await apiFetch('/api/settings/notifications');
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        if (notificationsData.success) {
          setNotifications({
            classReminders: notificationsData.data.classReminders,
            bookingConfirmations: notificationsData.data.bookingConfirmations,
            promotions: notificationsData.data.promotions,
            newClasses: notificationsData.data.newClasses,
          });
        }
      }

      // Load privacy preferences
      const privacyResponse = await apiFetch('/api/settings/privacy');
      if (privacyResponse.ok) {
        const privacyData = await privacyResponse.json();
        if (privacyData.success) {
          setPrivacy({
            showProfile: privacyData.data.showProfile,
            showStats: privacyData.data.showStats,
          });
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Error', 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationChange = async (key: keyof typeof notifications) => {
    const updatedNotifications = { ...notifications, [key]: !notifications[key] };
    setNotifications(updatedNotifications);
    
    try {
      setIsSaving(true);
      const response = await apiFetch('/api/settings/notifications', {
        method: 'PUT',
        body: JSON.stringify(updatedNotifications),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Revert on error
        setNotifications(notifications);
        toast.error('Error', errorData.error?.message || 'Failed to update notification preferences');
        return;
      }

      toast.success("Settings updated", "Your notification preferences have been saved.");
    } catch (error) {
      // Revert on error
      setNotifications(notifications);
      console.error('Error updating notifications:', error);
      toast.error('Error', 'Failed to update notification preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrivacyChange = async (key: keyof typeof privacy) => {
    const updatedPrivacy = { ...privacy, [key]: !privacy[key] };
    setPrivacy(updatedPrivacy);
    
    try {
      setIsSaving(true);
      const response = await apiFetch('/api/settings/privacy', {
        method: 'PUT',
        body: JSON.stringify(updatedPrivacy),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Revert on error
        setPrivacy(privacy);
        toast.error('Error', errorData.error?.message || 'Failed to update privacy settings');
        return;
      }

      toast.success("Settings updated", "Your privacy settings have been saved.");
    } catch (error) {
      // Revert on error
      setPrivacy(privacy);
      console.error('Error updating privacy:', error);
      toast.error('Error', 'Failed to update privacy settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Password mismatch", "New passwords do not match.");
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      toast.error("Invalid password", "Password must be at least 8 characters.");
      return;
    }

    try {
      setIsSaving(true);
      const response = await apiFetch('/api/settings/password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error('Error', errorData.error?.message || 'Failed to change password');
        return;
      }
      
      toast.success("Password changed", "Your password has been updated successfully.");
      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Error', 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm("Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently deleted.");
    
    if (!confirmed) {
      return;
    }

    // Double confirmation
    const doubleConfirmed = confirm("This is your final warning. Your account and all data will be permanently deleted. Are you absolutely sure?");
    
    if (!doubleConfirmed) {
      return;
    }

    try {
      setIsSaving(true);
      const response = await apiFetch('/api/settings/delete-account', {
        method: 'POST',
        body: JSON.stringify({ confirm: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error('Error', errorData.error?.message || 'Failed to delete account');
        return;
      }

      toast.success("Account deleted", "Your account has been permanently deleted.");
      
      // Sign out and redirect to home
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Error', 'Failed to delete account');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-dark dark:text-white mb-1">
            Settings
          </h1>
          <p className="text-body-color dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark dark:text-white mb-1">
          Settings
        </h1>
        <p className="text-body-color dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Notification Settings */}
        <div className="bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-dark dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notifications
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <p className="font-medium text-dark dark:text-white">Class Reminders</p>
                <p className="text-sm text-body-color dark:text-gray-400">Get reminded before your booked classes</p>
              </div>
              <button
                onClick={() => handleNotificationChange("classReminders")}
                disabled={isSaving}
                className={`relative w-12 h-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  notifications.classReminders ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notifications.classReminders ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <p className="font-medium text-dark dark:text-white">Booking Confirmations</p>
                <p className="text-sm text-body-color dark:text-gray-400">Receive confirmation emails for bookings</p>
              </div>
              <button
                onClick={() => handleNotificationChange("bookingConfirmations")}
                disabled={isSaving}
                className={`relative w-12 h-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  notifications.bookingConfirmations ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notifications.bookingConfirmations ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <p className="font-medium text-dark dark:text-white">New Classes</p>
                <p className="text-sm text-body-color dark:text-gray-400">Be notified when new classes are added</p>
              </div>
              <button
                onClick={() => handleNotificationChange("newClasses")}
                disabled={isSaving}
                className={`relative w-12 h-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  notifications.newClasses ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notifications.newClasses ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-dark dark:text-white">Promotions</p>
                <p className="text-sm text-body-color dark:text-gray-400">Receive promotional offers and discounts</p>
              </div>
              <button
                onClick={() => handleNotificationChange("promotions")}
                disabled={isSaving}
                className={`relative w-12 h-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  notifications.promotions ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notifications.promotions ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-dark dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Privacy
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <p className="font-medium text-dark dark:text-white">Show Profile</p>
                <p className="text-sm text-body-color dark:text-gray-400">Allow other members to see your profile</p>
              </div>
              <button
                onClick={() => handlePrivacyChange("showProfile")}
                disabled={isSaving}
                className={`relative w-12 h-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  privacy.showProfile ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    privacy.showProfile ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-dark dark:text-white">Show Stats</p>
                <p className="text-sm text-body-color dark:text-gray-400">Display your attendance stats publicly</p>
              </div>
              <button
                onClick={() => handlePrivacyChange("showStats")}
                disabled={isSaving}
                className={`relative w-12 h-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  privacy.showStats ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    privacy.showStats ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-dark dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Security
          </h3>
          
          {!isChangingPassword ? (
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-dark dark:text-white">Password</p>
                <p className="text-sm text-body-color dark:text-gray-400">Last changed 3 months ago</p>
              </div>
              <button
                onClick={() => setIsChangingPassword(true)}
                className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                Change Password
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-dark dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-dark dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-dark dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              <button
                onClick={handlePasswordChange}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Updating..." : "Update Password"}
              </button>
              </div>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-dark rounded-xl shadow-sm border border-red-200 dark:border-red-900/50 p-6">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Danger Zone
          </h3>
          
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-dark dark:text-white">Delete Account</p>
              <p className="text-sm text-body-color dark:text-gray-400">Permanently delete your account and all data</p>
            </div>
            <button
              onClick={handleDeleteAccount}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
