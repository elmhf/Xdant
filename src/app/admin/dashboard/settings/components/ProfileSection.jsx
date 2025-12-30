"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { adminService } from '@/services/adminService';
import { toast } from 'sonner';

export default function ProfileSection() {
    const [loading, setLoading] = useState(false);

    // Profile State
    const [profileData, setProfileData] = useState({
        first_name: '',
        last_name: '',
        email: ''
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await adminService.getAdminProfile();
            if (res.user) {
                setProfileData({
                    first_name: res.user.first_name || '',
                    last_name: res.user.last_name || '',
                    email: res.user.email || ''
                });
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
            toast.error("Failed to load profile data");
        }
    };

    const handleProfileChange = (e) => {
        const { id, value } = e.target;
        // Map input IDs to state keys
        const keyMap = {
            'firstName': 'first_name',
            'lastName': 'last_name',
            'email': 'email'
        };
        const key = keyMap[id] || id;
        setProfileData(prev => ({ ...prev, [key]: value }));
    };

    const handlePasswordChange = (e) => {
        const { id, value } = e.target;
        // Map IDs: new -> newPassword, confirm -> confirmPassword
        const keyMap = {
            'current': 'currentPassword',
            'new': 'newPassword',
            'confirm': 'confirmPassword'
        };
        setPasswordData(prev => ({ ...prev, [keyMap[id]]: value }));
    };

    const onSaveProfile = async () => {
        setLoading(true);
        try {
            await adminService.updateAdminProfile(profileData);
            toast.success("Profile updated successfully");
            // Notify layout to refresh sidebar info
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('admin-profile-updated'));
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const onUpdatePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await adminService.updateAdminPassword({
                newPassword: passwordData.newPassword
            });
            toast.success("Password updated successfully");
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="space-y-10 animate-in fade-in duration-500">
            {/* Personal Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-gray-100">
                <div className="md:col-span-1 space-y-1">
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                    <p className="text-sm text-gray-500">Update your photo and personal details here.</p>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-gray-700 font-medium">First name</Label>
                            <Input
                                id="firstName"
                                value={profileData.first_name}
                                onChange={handleProfileChange}
                                placeholder="First Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-gray-700 font-medium">Last name</Label>
                            <Input
                                id="lastName"
                                value={profileData.last_name}
                                onChange={handleProfileChange}
                                placeholder="Last Name"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 font-medium">Email address</Label>
                        <div className="flex gap-4">
                            <Input
                                id="email"
                                type="email"
                                value={profileData.email}
                                onChange={handleProfileChange}
                                placeholder="admin@example.com"
                                className="flex-1"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button onClick={onSaveProfile} disabled={loading} className="min-w-[120px]">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Password Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-1">
                    <h3 className="text-lg font-semibold text-gray-900">Secure Your Account</h3>
                    <p className="text-sm text-gray-500">Ensure your account is using a long, random password to stay secure.</p>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="current" className="text-gray-700 font-medium">Current Password</Label>
                        <Input
                            id="current"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="new" className="text-gray-700 font-medium">New Password</Label>
                            <Input
                                id="new"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm" className="text-gray-700 font-medium">Confirm Password</Label>
                            <Input
                                id="confirm"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button variant="outline" onClick={onUpdatePassword} disabled={loading}>
                            {loading ? 'Updating...' : 'Update Password'}
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
