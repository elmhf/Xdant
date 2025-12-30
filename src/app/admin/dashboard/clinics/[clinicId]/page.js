"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminService } from '@/services/adminService';
import { ArrowLeft, MapPin, Phone, Activity, ShieldCheck, Mail, Globe, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function ClinicDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [clinic, setClinic] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.clinicId) {
            fetchClinic(params.clinicId);
        }
    }, [params.clinicId]);

    const fetchClinic = async (id) => {
        try {
            setLoading(true);
            const data = await adminService.getClinicById(id);
            console.log("Clinic Detail API Response:", data);

            let clinicData = data;
            if (data?.data) clinicData = data.data;
            else if (data?.clinic) clinicData = data.clinic;

            setClinic(clinicData);
        } catch (error) {
            console.error('Failed to fetch clinic details:', error);
            toast.error('Failed to load clinic details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading clinic details...</div>;
    }

    if (!clinic) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">Clinic not found</p>
                <button
                    onClick={() => router.back()}
                    className="text-blue-600 hover:underline"
                >
                    Go back
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft size={20} />
                Back to Clinics
            </button>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="relative h-32 bg-gradient-to-r from-blue-500 to-indigo-600">
                    <div className="absolute -bottom-10 left-6">
                        <div className="w-20 h-20 rounded-xl bg-white p-1 shadow-md">
                            <div className="w-full h-full rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                                {clinic.name?.charAt(0) || 'C'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-12 px-6 pb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{clinic.name}</h1>
                            <div className="flex items-center gap-2 text-gray-500 mt-1">
                                <MapPin size={16} />
                                {clinic.location || 'No location provided'}
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${clinic.verified ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {clinic.verified ? 'Verified Clinic' : 'Pending Verification'}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Contact Info</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Phone className="text-gray-400" size={18} />
                                    <span>{clinic.contact || 'No phone number'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Mail className="text-gray-400" size={18} />
                                    <span>{clinic.email || 'No email provided'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Globe className="text-gray-400" size={18} />
                                    <span>{clinic.website || 'No website'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Stats</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Activity className="text-gray-400" size={18} />
                                    <span>{clinic.patients || 0} Patients</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <ShieldCheck className="text-gray-400" size={18} />
                                    <span>{clinic.doctors || 0} Doctors</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Clock className="text-gray-400" size={18} />
                                    <span>Registered {new Date(clinic.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Raw Data</h3>
                            <pre className="bg-gray-50 text-gray-600 p-3 rounded-lg text-xs overflow-x-auto max-h-40 overflow-y-auto">
                                {JSON.stringify(clinic, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
