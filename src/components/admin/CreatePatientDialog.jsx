import React, { useState, useEffect } from 'react';
import { useNotification } from '@/components/shared/jsFiles/NotificationProvider';
import { adminService } from '@/services/adminService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CreatePatientDialog({ open, onOpenChange, onPatientCreated }) {
    const { t } = useTranslation('patient');
    const { pushNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [clinics, setClinics] = useState([]);
    const [loadingClinics, setLoadingClinics] = useState(false);

    const initialFormState = {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        clinic_id: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (open) {
            setFormData(initialFormState);
            fetchClinics();
        }
    }, [open]);

    const fetchClinics = async () => {
        setLoadingClinics(true);
        try {
            const data = await adminService.getAllClinics(0, 100);

            let clinicsArray = [];
            if (Array.isArray(data)) {
                clinicsArray = data;
            } else if (data?.data && Array.isArray(data.data)) {
                clinicsArray = data.data;
            } else if (data?.clinics && Array.isArray(data.clinics)) {
                clinicsArray = data.clinics;
            }
            setClinics(clinicsArray);

        } catch (error) {
            console.error("Failed to fetch clinics", error);
            pushNotification('error', t('addPatient.fetchClinicsError'));
        } finally {
            setLoadingClinics(false);
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.clinic_id) {
            pushNotification('error', t('addPatient.clinicRequired'));
            setLoading(false);
            return;
        }

        try {
            await adminService.createPatient(formData);
            pushNotification('success', t('addPatient.success'));
            onPatientCreated();
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to create patient:', error);
            pushNotification('error', t('addPatient.error'));
        } finally {
            setLoading(false);
        }
    };

    const inputClassName = "flex border-1 border-gray-300 py-3 bg-white hover:border-[#7564ed] hover:border-2 focus:border-[#7564ed] focus:border-2 focus:outline-none focus:ring-0 transition-colors duration-200 h-12 text-base max-w-sm rounded-2xl px-3 w-full text-gray-900";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-[40vw] max-w-3xl bg-white p-0 overflow-hidden border-0 rounded-2xl">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex-shrink-0 flex justify-between items-center">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-bold text-gray-900">{t('addPatient.title')}</DialogTitle>
                    </DialogHeader>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto max-h-[80vh] p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Clinic Selection (Important) */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">{t('addPatient.assignClinic')} <span className="text-red-500">*</span></label>
                            <Select
                                value={formData.clinic_id}
                                onValueChange={(val) => handleSelectChange('clinic_id', val)}
                                disabled={loadingClinics}
                            >
                                <SelectTrigger className={inputClassName}>
                                    <SelectValue placeholder={loadingClinics ? t('addPatient.loadingClinics') : t('addPatient.selectClinic')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {clinics.map(clinic => (
                                        <SelectItem key={clinic.id} value={clinic.id}>
                                            {clinic.clinic_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">{t('addPatient.firstName')} <span className="text-red-500">*</span></label>
                                <Input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className={inputClassName}
                                    placeholder={t('addPatient.firstNamePlaceholder')}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">{t('addPatient.lastName')} <span className="text-red-500">*</span></label>
                                <Input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className={inputClassName}
                                    placeholder={t('addPatient.lastNamePlaceholder')}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">{t('addPatient.email')} <span className="text-red-500">*</span></label>
                                <Input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={inputClassName}
                                    placeholder={t('addPatient.emailPlaceholder')}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">{t('addPatient.phone')}</label>
                                <Input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={inputClassName}
                                    placeholder={t('addPatient.phonePlaceholder')}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">{t('addPatient.dateOfBirth')}</label>
                                <Input
                                    type="date"
                                    name="date_of_birth"
                                    value={formData.date_of_birth}
                                    onChange={handleChange}
                                    className={inputClassName}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">{t('addPatient.gender')}</label>
                                <Select
                                    value={formData.gender}
                                    onValueChange={(val) => handleSelectChange('gender', val)}
                                >
                                    <SelectTrigger className={inputClassName}>
                                        <SelectValue placeholder={t('addPatient.selectGender')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">{t('addPatient.male')}</SelectItem>
                                        <SelectItem value="Female">{t('addPatient.female')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-end gap-3 pt-8 mt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                className="px-6 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                            >
                                {t('addPatient.cancel')}
                            </button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="text-lg font-bold bg-[#EBE8FC] text-[#7564ed] hover:outline-[#7564ed] hover:outline-4 transition-all duration-150 px-3 py-2 rounded-2xl flex items-center min-w-[6vw]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {t('addPatient.creating')}
                                    </>
                                ) : t('addPatient.create')}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
