"use client";
import React from 'react';
import SystemSettingsSection from '../components/SystemSettingsSection';

export default function SystemSettingsPage() {
    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 pb-10">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Configuration</h1>
                <p className="text-gray-500">Manage global system settings and environment variables.</p>
            </div>
            <SystemSettingsSection />
        </div>
    );
}
