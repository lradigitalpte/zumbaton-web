"use client";



import { useState, useEffect } from "react";

import Link from "next/link";

import { useAuth } from "@/context/AuthContext";

import { useToast } from "@/components/Toast";

import { apiFetch } from "@/lib/api-fetch";

import { useRouter } from "next/navigation";

import MemberMobilePageShell from "@/components/Dashboard/MemberMobilePageShell";



const inputClass =

  "mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/25 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white";



function Toggle({

  checked,

  onChange,

  disabled,

  label,

}: {

  checked: boolean;

  onChange: () => void;

  disabled?: boolean;

  label: string;

}) {

  return (

    <button

      type="button"

      role="switch"

      aria-checked={checked}

      aria-label={label}

      disabled={disabled}

      onClick={onChange}

      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${

        checked ? "bg-lime-400" : "bg-zinc-300 dark:bg-zinc-600"

      }`}

    >

      <span

        className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${

          checked ? "translate-x-5" : ""

        }`}

      />

    </button>

  );

}



const SettingsPage = () => {

  const { signOut } = useAuth();

  const toast = useToast();

  const router = useRouter();



  const [notifications, setNotifications] = useState({

    classReminders: true,

    bookingConfirmations: true,

  });

  const [isLoading, setIsLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({

    currentPassword: "",

    newPassword: "",

    confirmPassword: "",

  });

  const [passwordError, setPasswordError] = useState("");



  useEffect(() => {

    loadSettings();

  }, []);



  const loadSettings = async () => {

    try {

      setIsLoading(true);

      const notificationsResponse = await apiFetch("/api/settings/notifications");

      if (notificationsResponse.ok) {

        const notificationsData = await notificationsResponse.json();

        if (notificationsData.success) {

          setNotifications({

            classReminders: notificationsData.data.classReminders,

            bookingConfirmations: notificationsData.data.bookingConfirmations,

          });

        }

      }

    } catch (error) {

      console.error("Error loading settings:", error);

      toast.error("Error", "Failed to load settings");

    } finally {

      setIsLoading(false);

    }

  };



  const handleNotificationChange = async (key: keyof typeof notifications) => {

    const previous = notifications;

    const updatedNotifications = { ...notifications, [key]: !notifications[key] };

    setNotifications(updatedNotifications);



    try {

      setIsSaving(true);

      const response = await apiFetch("/api/settings/notifications", {

        method: "PUT",

        body: JSON.stringify(updatedNotifications),

      });



      if (!response.ok) {

        const errorData = await response.json();

        setNotifications(previous);

        toast.error("Error", errorData.error?.message || "Failed to update notification preferences");

        return;

      }



      toast.success("Saved", "Notification preference updated.");

    } catch (error) {

      setNotifications(previous);

      console.error("Error updating notifications:", error);

      toast.error("Error", "Failed to update notification preferences");

    } finally {

      setIsSaving(false);

    }

  };



  const handlePasswordChange = async () => {

    setPasswordError("");



    if (passwordForm.newPassword !== passwordForm.confirmPassword) {

      const message = "New passwords do not match.";

      setPasswordError(message);

      toast.error("Password mismatch", message);

      return;

    }



    if (passwordForm.newPassword.length < 8) {

      const message = "Password must be at least 8 characters.";

      setPasswordError(message);

      toast.error("Invalid password", message);

      return;

    }



    try {

      setIsSaving(true);

      const response = await apiFetch("/api/settings/password", {

        method: "POST",

        body: JSON.stringify({

          currentPassword: passwordForm.currentPassword,

          newPassword: passwordForm.newPassword,

        }),

      });



      if (!response.ok) {

        const errorData = await response.json();

        const message = errorData?.error?.message || "Failed to change password";

        setPasswordError(message);

        toast.error("Error", message);

        return;

      }



      toast.success("Password changed", "Your password has been updated.");

      setPasswordError("");

      setIsChangingPassword(false);

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });

    } catch (error) {

      console.error("Error changing password:", error);

      setPasswordError("Failed to change password");

      toast.error("Error", "Failed to change password");

    } finally {

      setIsSaving(false);

    }

  };



  const handleDeleteAccount = async () => {

    const confirmed = confirm(

      "Are you sure you want to delete your account? This cannot be undone."

    );

    if (!confirmed) return;



    const doubleConfirmed = confirm(

      "Final confirmation: permanently delete your account and all data?"

    );

    if (!doubleConfirmed) return;



    try {

      setIsSaving(true);

      const response = await apiFetch("/api/settings/delete-account", {

        method: "POST",

        body: JSON.stringify({ confirm: true }),

      });



      if (!response.ok) {

        const errorData = await response.json();

        toast.error("Error", errorData.error?.message || "Failed to delete account");

        return;

      }



      toast.success("Account deleted", "Your account has been permanently deleted.");

      await signOut();

      router.push("/");

    } catch (error) {

      console.error("Error deleting account:", error);

      toast.error("Error", "Failed to delete account");

    } finally {

      setIsSaving(false);

    }

  };



  if (isLoading) {

    return (

      <MemberMobilePageShell eyebrow="Account" title="Settings" maxWidthClass="md:max-w-2xl">

        <div className="flex justify-center py-20">

          <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-lime-400" />

        </div>

      </MemberMobilePageShell>

    );

  }



  return (

    <MemberMobilePageShell eyebrow="Account" title="Settings" maxWidthClass="md:max-w-2xl">

      <article className="overflow-hidden rounded-[1.35rem] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:bg-zinc-900 dark:shadow-none dark:ring-1 dark:ring-zinc-800">

        <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">

          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Notifications</h2>

          <p className="mt-0.5 text-xs text-zinc-500">Email preferences for your bookings</p>

        </div>



        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">

          <div className="flex items-center justify-between gap-4 px-5 py-4">

            <div className="min-w-0">

              <p className="text-sm font-medium text-zinc-900 dark:text-white">Class reminders</p>

              <p className="text-xs text-zinc-500">Before booked classes</p>

            </div>

            <Toggle

              label="Class reminders"

              checked={notifications.classReminders}

              onChange={() => handleNotificationChange("classReminders")}

              disabled={isSaving}

            />

          </div>

          <div className="flex items-center justify-between gap-4 px-5 py-4">

            <div className="min-w-0">

              <p className="text-sm font-medium text-zinc-900 dark:text-white">Booking confirmations</p>

              <p className="text-xs text-zinc-500">When you book a class</p>

            </div>

            <Toggle

              label="Booking confirmations"

              checked={notifications.bookingConfirmations}

              onChange={() => handleNotificationChange("bookingConfirmations")}

              disabled={isSaving}

            />

          </div>

        </div>



        <div className="border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">

          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Password</h2>

          {!isChangingPassword ? (

            <button

              type="button"

              onClick={() => setIsChangingPassword(true)}

              className="mt-3 w-full rounded-full border border-zinc-200 py-3 text-sm font-bold text-zinc-900 active:scale-[0.99] dark:border-zinc-700 dark:text-white"

            >

              Change password

            </button>

          ) : (

            <div className="mt-3 space-y-3">

              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">

                Current password

                <input

                  type="password"

                  value={passwordForm.currentPassword}

                  onChange={(e) => {

                    setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }));

                    if (passwordError) setPasswordError("");

                  }}

                  className={inputClass}

                  autoComplete="current-password"

                />

              </label>

              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">

                New password

                <input

                  type="password"

                  value={passwordForm.newPassword}

                  onChange={(e) => {

                    setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }));

                    if (passwordError) setPasswordError("");

                  }}

                  className={inputClass}

                  autoComplete="new-password"

                />

              </label>

              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">

                Confirm new password

                <input

                  type="password"

                  value={passwordForm.confirmPassword}

                  onChange={(e) => {

                    setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }));

                    if (passwordError) setPasswordError("");

                  }}

                  className={inputClass}

                  autoComplete="new-password"

                />

              </label>

              {passwordError && (

                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">

                  {passwordError}

                </p>

              )}

              <div className="flex gap-2 pt-1">

                <button

                  type="button"

                  onClick={() => {

                    setIsChangingPassword(false);

                    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });

                    setPasswordError("");

                  }}

                  className="flex-1 rounded-full border border-zinc-200 py-3 text-sm font-bold text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"

                >

                  Cancel

                </button>

                <button

                  type="button"

                  onClick={handlePasswordChange}

                  disabled={isSaving}

                  className="flex-1 rounded-full bg-zinc-900 py-3 text-sm font-bold text-white disabled:opacity-50 dark:bg-lime-400 dark:text-zinc-900"

                >

                  {isSaving ? "Updating…" : "Update"}

                </button>

              </div>

            </div>

          )}

        </div>



        <div className="border-t border-red-100 bg-red-50/50 px-5 py-4 dark:border-red-900/40 dark:bg-red-950/20">

          <h2 className="text-sm font-bold text-red-700 dark:text-red-400">Delete account</h2>

          <p className="mt-1 text-xs text-red-600/90 dark:text-red-300/90">

            Permanently removes your account and data. This cannot be undone.

          </p>

          <button

            type="button"

            onClick={handleDeleteAccount}

            disabled={isSaving}

            className="mt-3 w-full rounded-full border border-red-300 py-3 text-sm font-bold text-red-700 disabled:opacity-50 dark:border-red-800 dark:text-red-400"

          >

            {isSaving ? "Please wait…" : "Delete my account"}

          </button>

        </div>

      </article>



      <Link

        href="/profile"

        className="mt-4 block text-center text-sm font-medium text-zinc-500 underline-offset-2 hover:underline"

      >

        Back to profile

      </Link>

    </MemberMobilePageShell>

  );

};



export default SettingsPage;


