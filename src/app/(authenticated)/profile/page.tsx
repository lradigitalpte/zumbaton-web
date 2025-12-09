"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";

const ProfilePage = () => {
  const { user } = useAuth();
  const toast = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    emergencyContact: "",
    emergencyPhone: "",
    dateOfBirth: "",
    bio: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast.success("Profile updated", "Your changes have been saved successfully.");
    setIsEditing(false);
    setIsSaving(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: "",
      emergencyContact: "",
      emergencyPhone: "",
      dateOfBirth: "",
      bio: "",
    });
    setIsEditing(false);
  };

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
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">{user?.name || "User"}</h2>
              <p className="opacity-80">{user?.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">
                Member since 2024
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
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
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

      {/* Stats Card */}
      <div className="mt-6 bg-white dark:bg-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-dark dark:text-white mb-4">
          Your Stats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-3xl font-bold text-primary">24</p>
            <p className="text-sm text-body-color dark:text-gray-400">Classes Attended</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-3xl font-bold text-green-500">8</p>
            <p className="text-sm text-body-color dark:text-gray-400">Tokens Available</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-3xl font-bold text-orange-500">5</p>
            <p className="text-sm text-body-color dark:text-gray-400">Day Streak</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-3xl font-bold text-purple-500">3</p>
            <p className="text-sm text-body-color dark:text-gray-400">Favorite Classes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
