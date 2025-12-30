"use client";
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services/adminService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function AddUserModal({ open, onOpenChange, onUserAdded }) {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        role: 'user'
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation (Basic)
            if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
                toast.error("Please fill in all required fields");
                return;
            }

            await adminService.createUser(formData);
            toast.success('User created successfully');
            if (onUserAdded) onUserAdded();
            onOpenChange(false);
            // Reset form optionally here if needed, but component might unmount/remount
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                password: '',
                role: 'user'
            });
        } catch (error) {
            console.error('Failed to create user:', error);
        } finally {
            setLoading(false);
        }
    };

    const inputClassName = "flex border-1 border-gray-300 py-3 bg-white hover:border-[#7564ed] hover:border-2 focus:border-[#7564ed] focus:border-2 focus:outline-none focus:ring-0 transition-colors duration-200 h-12 text-base rounded-2xl px-3 w-full text-gray-900";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden border-0 rounded-2xl">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex-shrink-0">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-bold text-gray-900">Add New User</DialogTitle>
                    </DialogHeader>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-8 max-h-[70vh]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">First Name <span className="text-red-500">*</span></label>
                                <Input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className={inputClassName}
                                    placeholder="Enter first name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Last Name <span className="text-red-500">*</span></label>
                                <Input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className={inputClassName}
                                    placeholder="Enter last name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Email Address <span className="text-red-500">*</span></label>
                            <Input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={inputClassName}
                                placeholder="Enter email address"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Password <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`${inputClassName} pr-10`}
                                    placeholder="Enter password"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                            <Input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={inputClassName}
                                placeholder="Enter phone number"
                            />
                        </div>


                        {/* Footer Actions */}
                        <div className="flex items-center justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                className="px-6 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="text-lg font-bold bg-[#EBE8FC] text-[#7564ed] hover:outline-[#7564ed] hover:outline-4 transition-all duration-150 px-6 py-2.5 rounded-2xl flex items-center"
                            >
                                {loading ? "Creating..." : "Create User"}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
