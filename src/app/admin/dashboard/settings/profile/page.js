"use client";
import React from 'react';
import ProfileSection from '../components/ProfileSection';

export default function ProfileSettingsPage() {
    return (
        <div className="w-full bg-white p-4 rounded-3xl overflow-hidden  mx-auto space-y-8 pb-10">
            <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900 tracking-tight">Profile & Account</p>
                <p className="text-lg text-gray-500">Manage your personal information and security settings.</p>
            </div>
            <ProfileSection />
        </div>
    );
}
