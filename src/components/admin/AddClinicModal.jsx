"use client";
import React, { useState } from 'react';
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

export default function AddClinicModal({ open, onOpenChange, onClinicAdded }) {
    const [formData, setFormData] = useState({
        clinic_name: '',
        email: '',
        phone: '',
        website: '',
        street_address: '',
        neighbourhood: '',
        city: '',
        postal_code: '',
        country: '',
    });
    const [loading, setLoading] = useState(false);

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
            await adminService.createClinic(formData);
            toast.success('Clinic added successfully');
            setFormData({
                clinic_name: '',
                email: '',
                phone: '',
                website: '',
                street_address: '',
                neighbourhood: '',
                city: '',
                postal_code: '',
                country: '',
            });
            onClinicAdded();
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to add clinic:', error);
            toast.error('Failed to add clinic');
        } finally {
            setLoading(false);
        }
    };

    const inputClassName = "flex border-1 border-gray-300 py-3 bg-white hover:border-[#7564ed] hover:border-2 focus:border-[#7564ed] focus:border-2 focus:outline-none focus:ring-0 transition-colors duration-200 h-12 text-base max-w-sm rounded-2xl px-3 w-full text-gray-900";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-[40vw] max-w-3xl bg-white p-0 overflow-hidden border-0 rounded-2xl">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex-shrink-0">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-bold text-gray-900">Add New Clinic</DialogTitle>
                    </DialogHeader>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto max-h-[80vh] p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Clinic Name <span className="text-red-500">*</span></label>
                                <Input
                                    type="text"
                                    name="clinic_name"
                                    value={formData.clinic_name}
                                    onChange={handleChange}
                                    className={inputClassName}
                                    placeholder="Enter clinic name"
                                    required
                                />
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Website</label>
                                <Input
                                    type="text"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    className={inputClassName}
                                    placeholder="Enter website URL"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Street Address</label>
                            <Input
                                type="text"
                                name="street_address"
                                value={formData.street_address}
                                onChange={handleChange}
                                className={inputClassName}
                                placeholder="Enter street address"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Neighbourhood</label>
                                <Input
                                    type="text"
                                    name="neighbourhood"
                                    value={formData.neighbourhood}
                                    onChange={handleChange}
                                    className={inputClassName}
                                    placeholder="Enter neighbourhood"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">City</label>
                                <Input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className={inputClassName}
                                    placeholder="Enter city"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Postal Code</label>
                                <Input
                                    type="text"
                                    name="postal_code"
                                    value={formData.postal_code}
                                    onChange={handleChange}
                                    className={inputClassName}
                                    placeholder="Enter postal code"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Country</label>
                                <Input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className={inputClassName}
                                    placeholder="Enter country"
                                />
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-end gap-3 pt-8 mt-4 border-t border-gray-100">
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
                                className="text-lg font-bold bg-[#EBE8FC] text-[#7564ed] hover:outline-[#7564ed] hover:outline-4 transition-all duration-150 px-3 py-2 rounded-2xl flex items-center min-w-[6vw]"
                            >
                                {loading ? "Adding..." : "Add Clinic"}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
