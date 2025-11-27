import React from 'react';
import { Bell, UserPlus, Users, Calendar, FileText } from 'lucide-react';
import { InvitationTemplate } from './templates/InvitationTemplate';
import { NewPatientTemplate } from './templates/NewPatientTemplate';
import { PatientUpdateTemplate } from './templates/PatientUpdateTemplate';
import { AppointmentTemplate } from './templates/AppointmentTemplate';
import { ReportUpdateTemplate } from './templates/ReportUpdateTemplate';
import { DefaultTemplate } from './templates/DefaultTemplate';

/**
 * Get icon component based on notification type
 */
const getNotificationIcon = (type) => {
    const iconMap = {
        invitation: Bell,
        new_patient: UserPlus,
        patient_update: Users,
        appointment: Calendar,
        report_update: FileText,
        default: Bell,
    };

    return iconMap[type] || iconMap.default;
};

/**
 * Get icon background color based on notification type
 */
const getIconBgColor = (type) => {
    const colorMap = {
        invitation: 'bg-[#7564ED]/10 text-[#7564ED]',
        new_patient: 'bg-green-500/10 text-green-600',
        patient_update: 'bg-blue-500/10 text-blue-600',
        appointment: 'bg-orange-500/10 text-orange-600',
        report_update: 'bg-purple-500/10 text-purple-600',
        default: 'bg-gray-500/10 text-gray-600',
    };

    return colorMap[type] || colorMap.default;
};

/**
 * Main function to render notification content based on type
 */
export const renderNotificationContent = (notification) => {
    const templates = {
        invitation: InvitationTemplate,
        new_patient: NewPatientTemplate,
        patient_update: PatientUpdateTemplate,
        appointment: AppointmentTemplate,
        report_update: ReportUpdateTemplate,
    };

    const Template = templates[notification.type] || DefaultTemplate;
    return <Template notification={notification} />;
};

/**
 * Render notification icon
 */
export const renderNotificationIcon = (notification) => {
    const clinicLogo = notification.meta_data?.logo_url;

    if (clinicLogo) {
        return (
            <img
                src={clinicLogo}
                alt="clinic"
                className="w-10 h-10 rounded-xl object-cover border border-gray-100 flex-shrink-0 shadow-sm"
            />
        );
    }

    const Icon = getNotificationIcon(notification.type);
    const bgColor = getIconBgColor(notification.type);

    return (
        <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5" />
        </div>
    );
};
