"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { apiFetch } from "@/lib/api-fetch";
import { useQueryClient } from "@tanstack/react-query";

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

  // Load profile data on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await apiFetch('/api/profile');
      
      if (!response.ok) {
        const errorData = await response.json();
        toast.error('Error', errorData.error?.message || 'Failed to load profile');
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
      console.error('Error loading profile:', error);
      toast.error('Error', 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    // Allow avatar upload even when not in edit mode
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type', 'Please upload a JPEG, PNG, WebP, or GIF image.');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File too large', 'Maximum file size is 5MB.');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Get auth token for upload
      const { getSupabaseClient } = await import('@/lib/supabase');
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Error', 'Please sign in to upload avatar');
        return;
      }

      const response = await fetch('/api/profile/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error('Upload failed', errorData.error?.message || 'Failed to upload avatar');
        return;
      }

      const data = await response.json();
      if (data.success) {
        // Invalidate profile cache to refresh avatar in navbar/sidebar
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        // Reload profile to get updated avatar URL
        await loadProfile();
        toast.success('Avatar updated', 'Your profile picture has been updated successfully.');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Error', 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const response = await apiFetch('/api/profile', {
        method: 'PUT',
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
        toast.error('Error', errorData.error?.message || 'Failed to update profile');
        return;
      }

      const data = await response.json();
      if (data.success) {
        // Invalidate profile cache to refresh in navbar/sidebar
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        // Update profile data
        setProfileData(data.data);
        
        // Update user context with new name
        if (setUser && data.data) {
          setUser({
            ...user!,
            name: data.data.name,
          });
        }

        toast.success("Profile updated", "Your changes have been saved successfully.");
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Error', 'Failed to update profile');
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

  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    return date.getFullYear().toString();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-dark dark:text-white mb-1">
            My Profile
          </h1>
          <p className="text-body-color dark:text-gray-400">
            Manage your personal information and preferences
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-dark dark:text-white mb-1">
            My Profile
          </h1>
        </div>
        <div className="bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          <p className="text-gray-600 dark:text-gray-400">Failed to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark dark:text-white mb-1">
          My Profile
        </h1>
        <p className="text-body-color dark:text-gray-400">
          Manage your personal information and preferences
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-linear-to-br from-primary/80 to-primary p-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div 
                className="w-24 h-24 rounded-full overflow-hidden bg-white/20 flex items-center justify-center text-white text-3xl font-bold border-4 border-white/30 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={handleAvatarClick}
                title="Click to change profile picture"
              >
                {profileData.avatarUrl ? (
                  <img
                    src={profileData.avatarUrl}
                    alt={profileData.name || "Profile"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('span')) {
                        const span = document.createElement('span');
                        span.textContent = profileData.name?.charAt(0)?.toUpperCase() || "U";
                        parent.appendChild(span);
                      }
                    }}
                  />
                ) : (
                  <span>{profileData.name?.charAt(0)?.toUpperCase() || "U"}</span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 shadow-lg pointer-events-none">
                {isUploadingAvatar ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </div>
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">{profileData.name || "User"}</h2>
              <p className="opacity-80">{profileData.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">
                Member since {formatMemberSince(profileData.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-dark dark:text-white">
              Personal Information
            </h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  disabled={isSaving || isUploadingAvatar}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || isUploadingAvatar}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-dark dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
              ) : (
                <p className="px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-dark dark:text-white">
                  {formData.name || "Not set"}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                Email Address
              </label>
              <p className="px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-dark dark:text-white">
                {formData.email}
                <span className="ml-2 text-xs text-green-500">(Verified)</span>
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-dark dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
              ) : (
                <p className="px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-dark dark:text-white">
                  {formData.phone || "Not set"}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                Date of Birth
              </label>
              {isEditing ? (
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-dark dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
              ) : (
                <p className="px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-dark dark:text-white">
                  {formData.dateOfBirth || "Not set"}
                </p>
              )}
            </div>

            {/* Emergency Contact */}
            <div>
              <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                Emergency Contact Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="Emergency contact name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-dark dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
              ) : (
                <p className="px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-dark dark:text-white">
                  {formData.emergencyContact || "Not set"}
                </p>
              )}
            </div>

            {/* Emergency Phone */}
            <div>
              <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                Emergency Contact Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  placeholder="Emergency contact phone"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-dark dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
              ) : (
                <p className="px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-dark dark:text-white">
                  {formData.emergencyPhone || "Not set"}
                </p>
              )}
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell us a little about yourself..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-dark dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
                />
              ) : (
                <p className="px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-dark dark:text-white min-h-[100px]">
                  {formData.bio || "No bio added yet"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
