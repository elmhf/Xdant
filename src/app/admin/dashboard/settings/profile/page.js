"use client";
import React from 'react';
import ProfileSection from '../components/ProfileSection';

export default function ProfileSettingsPage() {
    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 pb-10">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Profile & Account</h1>
                <p className="text-gray-500">Manage your personal information and security settings.</p>
            </div>
            <ProfileSection />
        </div>
    );
}
