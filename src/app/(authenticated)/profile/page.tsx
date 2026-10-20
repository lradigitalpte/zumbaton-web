"use client";



import { useState, useEffect, useRef } from "react";

import Link from "next/link";

import { useAuth } from "@/context/AuthContext";

import { useToast } from "@/components/Toast";

import { apiFetch } from "@/lib/api-fetch";

import { useQueryClient } from "@tanstack/react-query";

import MemberMobilePageShell from "@/components/Dashboard/MemberMobilePageShell";



interface ProfileData {

  id: string;

  name: string;

  email: string;

  phone: string | null;

  avatarUrl: string | null;

  dateOfBirth: string | null;

  emergencyContactName: string | null;

  emergencyContactPhone: string | null;

  bio: string | null;

  createdAt: string;

  updatedAt: string;

}



const inputClass =

  "mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/25 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white";



const ProfilePage = () => {

  const { user, setUser } = useAuth();

  const toast = useToast();

  const queryClient = useQueryClient();

  const fileInputRef = useRef<HTMLInputElement>(null);



  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [formData, setFormData] = useState({

    name: "",

    email: "",

    phone: "",

    emergencyContact: "",

    emergencyPhone: "",

    dateOfBirth: "",

    bio: "",

  });



  useEffect(() => {

    loadProfile();

  }, []);



  const loadProfile = async () => {

    try {

      setIsLoading(true);

      const response = await apiFetch("/api/profile");



      if (!response.ok) {

        const errorData = await response.json();

        toast.error("Error", errorData.error?.message || "Failed to load profile");

        return;

      }



      const data = await response.json();

      if (data.success && data.data) {

        const profile = data.data;

        setProfileData(profile);

        setFormData({

          name: profile.name || "",

          email: profile.email || "",

          phone: profile.phone || "",

          emergencyContact: profile.emergencyContactName || "",

          emergencyPhone: profile.emergencyContactPhone || "",

          dateOfBirth: profile.dateOfBirth || "",

          bio: profile.bio || "",

        });

      }

    } catch (error) {

      console.error("Error loading profile:", error);

      toast.error("Error", "Failed to load profile");

    } finally {

      setIsLoading(false);

    }

  };



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

  };



  const handleAvatarClick = () => {

    fileInputRef.current?.click();

  };



  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];

    if (!file) return;



    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (!allowedTypes.includes(file.type)) {

      toast.error("Invalid file type", "Please upload a JPEG, PNG, WebP, or GIF image.");

      return;

    }



    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {

      toast.error("File too large", "Maximum file size is 5MB.");

      return;

    }



    try {

      setIsUploadingAvatar(true);

      const uploadData = new FormData();

      uploadData.append("file", file);



      const { getSupabaseClient } = await import("@/lib/supabase");

      const supabase = getSupabaseClient();

      const {

        data: { session },

      } = await supabase.auth.getSession();



      if (!session?.access_token) {

        toast.error("Error", "Please sign in to upload avatar");

        return;

      }



      const response = await fetch("/api/profile/upload-avatar", {

        method: "POST",

        headers: { Authorization: `Bearer ${session.access_token}` },

        body: uploadData,

      });



      if (!response.ok) {

        const errorData = await response.json();

        toast.error("Upload failed", errorData.error?.message || "Failed to upload avatar");

        return;

      }



      const data = await response.json();

      if (data.success) {

        queryClient.invalidateQueries({ queryKey: ["profile"] });

        await loadProfile();

        toast.success("Photo updated", "Your profile picture has been saved.");

      }

    } catch (error) {

      console.error("Error uploading avatar:", error);

      toast.error("Error", "Failed to upload avatar");

    } finally {

      setIsUploadingAvatar(false);

      if (fileInputRef.current) fileInputRef.current.value = "";

    }

  };



  const handleSave = async () => {

    try {

      setIsSaving(true);



      const response = await apiFetch("/api/profile", {

        method: "PUT",

        body: JSON.stringify({

          name: formData.name,

          phone: formData.phone || null,

          dateOfBirth: formData.dateOfBirth || null,

          emergencyContactName: formData.emergencyContact || null,

          emergencyContactPhone: formData.emergencyPhone || null,

          bio: formData.bio || null,

        }),

      });



      if (!response.ok) {

        const errorData = await response.json();

        toast.error("Error", errorData.error?.message || "Failed to update profile");

        return;

      }



      const data = await response.json();

      if (data.success) {

        queryClient.invalidateQueries({ queryKey: ["profile"] });

        setProfileData(data.data);

        if (setUser && data.data) {

          setUser({ ...user!, name: data.data.name });

        }

        toast.success("Saved", "Your profile has been updated.");

        setIsEditing(false);

      }

    } catch (error) {

      console.error("Error saving profile:", error);

      toast.error("Error", "Failed to update profile");

    } finally {

      setIsSaving(false);

    }

  };



  const handleCancel = () => {

    if (profileData) {

      setFormData({

        name: profileData.name || "",

        email: profileData.email || "",

        phone: profileData.phone || "",

        emergencyContact: profileData.emergencyContactName || "",

        emergencyPhone: profileData.emergencyContactPhone || "",

        dateOfBirth: profileData.dateOfBirth || "",

        bio: profileData.bio || "",

      });

    }

    setIsEditing(false);

  };



  const memberSinceYear = profileData

    ? new Date(profileData.createdAt).getFullYear()

    : null;



  if (isLoading) {

    return (

      <MemberMobilePageShell eyebrow="Account" title="Profile" maxWidthClass="md:max-w-2xl">

        <div className="flex justify-center py-20">

          <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-lime-400" />

        </div>

      </MemberMobilePageShell>

    );

  }



  if (!profileData) {

    return (

      <MemberMobilePageShell eyebrow="Account" title="Profile" maxWidthClass="md:max-w-2xl">

        <p className="text-center text-sm text-zinc-500">Could not load your profile.</p>

      </MemberMobilePageShell>

    );

  }



  const displayName = formData.name || "Member";

  const initial = displayName.charAt(0).toUpperCase();



  const ViewRow = ({ label, value }: { label: string; value: string }) => (

    <div className="flex items-start justify-between gap-4 border-b border-zinc-100 py-3.5 last:border-0 dark:border-zinc-800">

      <span className="shrink-0 text-sm text-zinc-500">{label}</span>

      <span className="text-right text-sm font-medium text-zinc-900 dark:text-white">

        {value || "—"}

      </span>

    </div>

  );



  const EditField = ({

    label,

    name,

    type = "text",

    placeholder,

  }: {

    label: string;

    name: keyof typeof formData;

    type?: string;

    placeholder?: string;

  }) => (

    <label className="block border-b border-zinc-100 py-3.5 last:border-0 dark:border-zinc-800">

      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>

      <input

        type={type}

        name={name}

        value={formData[name]}

        onChange={handleChange}

        placeholder={placeholder}

        className={inputClass}

      />

    </label>

  );



  return (

    <MemberMobilePageShell eyebrow="Account" title="Profile" maxWidthClass="md:max-w-2xl">

      <article className="overflow-hidden rounded-[1.35rem] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:bg-zinc-900 dark:shadow-none dark:ring-1 dark:ring-zinc-800">

        {/* Identity */}

        <div className="flex items-center gap-4 border-b border-zinc-100 p-5 dark:border-zinc-800">

          <div className="relative shrink-0">

            <button

              type="button"

              onClick={handleAvatarClick}

              className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-zinc-100 text-2xl font-bold text-zinc-700 ring-2 ring-lime-400/50 dark:bg-zinc-800 dark:text-white"

            >

              {profileData.avatarUrl ? (

                <img src={profileData.avatarUrl} alt="" className="h-full w-full object-cover" />

              ) : (

                initial

              )}

            </button>

            <input

              ref={fileInputRef}

              type="file"

              accept="image/jpeg,image/png,image/webp,image/gif"

              onChange={handleAvatarChange}

              className="hidden"

            />

            {isUploadingAvatar && (

              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">

                <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" />

              </span>

            )}

          </div>

          <div className="min-w-0 flex-1">

            <p className="truncate text-lg font-bold text-zinc-900 dark:text-white">{displayName}</p>

            <p className="truncate text-sm text-zinc-500">{formData.email}</p>

            {memberSinceYear && (

              <p className="mt-1 text-xs text-zinc-400">Member since {memberSinceYear}</p>

            )}

          </div>

        </div>



        {/* Fields */}

        <div className="px-5 pb-2 pt-1">

          {isEditing ? (

            <>

              <EditField label="Full name" name="name" />

              <div className="border-b border-zinc-100 py-3.5 dark:border-zinc-800">

                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</span>

                <p className="mt-1.5 text-sm text-zinc-500">{formData.email} (cannot change here)</p>

              </div>

              <EditField label="Phone" name="phone" type="tel" placeholder="+65 …" />

              <EditField label="Date of birth" name="dateOfBirth" type="date" />

              <EditField label="Emergency contact name" name="emergencyContact" />

              <EditField label="Emergency contact phone" name="emergencyPhone" type="tel" />

              <label className="block py-3.5">

                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Bio</span>

                <textarea

                  name="bio"

                  value={formData.bio}

                  onChange={handleChange}

                  rows={3}

                  placeholder="Optional"

                  className={`${inputClass} resize-none`}

                />

              </label>

            </>

          ) : (

            <>

              <ViewRow label="Phone" value={formData.phone} />

              <ViewRow label="Date of birth" value={formData.dateOfBirth} />

              <ViewRow label="Emergency name" value={formData.emergencyContact} />

              <ViewRow label="Emergency phone" value={formData.emergencyPhone} />

              <ViewRow label="Bio" value={formData.bio} />

            </>

          )}

        </div>



        {/* Actions */}

        <div className="space-y-3 border-t border-zinc-100 p-5 dark:border-zinc-800">

          {isEditing ? (

            <div className="flex gap-2">

              <button

                type="button"

                onClick={handleCancel}

                disabled={isSaving || isUploadingAvatar}

                className="flex-1 rounded-full border border-zinc-200 py-3 text-sm font-bold text-zinc-700 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300"

              >

                Cancel

              </button>

              <button

                type="button"

                onClick={handleSave}

                disabled={isSaving || isUploadingAvatar}

                className="flex-1 rounded-full bg-zinc-900 py-3 text-sm font-bold text-white disabled:opacity-50 dark:bg-lime-400 dark:text-zinc-900"

              >

                {isSaving ? "Saving…" : "Save changes"}

              </button>

            </div>

          ) : (

            <button

              type="button"

              onClick={() => setIsEditing(true)}

              className="w-full rounded-full bg-zinc-900 py-3.5 text-sm font-bold text-white active:scale-[0.99] dark:bg-lime-400 dark:text-zinc-900"

            >

              Edit profile

            </button>

          )}

          <Link

            href="/settings"

            className="block text-center text-sm font-medium text-zinc-500 underline-offset-2 hover:text-zinc-800 hover:underline dark:hover:text-zinc-300"

          >

            Password & notification settings

          </Link>

        </div>

      </article>



      {!isEditing && (

        <p className="mt-4 text-center text-xs text-zinc-400">Tap your photo to change it anytime.</p>

      )}

    </MemberMobilePageShell>

  );

};



export default ProfilePage;


