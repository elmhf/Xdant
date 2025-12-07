import React, { useEffect } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { useDentalStore } from "@/stores/dataStore";
import { useCurrentPatient, usePatientStore } from "@/stores/patientStore";

export default function Breadcrumb({ className = "" }) {
  const params = useParams();
  const pathname = usePathname();
  const { patientId, report_id, toothId } = params;

  // Fetch data from store
  const dentalPatientName = useDentalStore(state => state.data?.patientInfo?.info?.fullName);
  const reportType = useDentalStore(state => state.data?.reportType);
  const currentPatient = useCurrentPatient();
  const fetchPatient = usePatientStore(state => state.fetchPatient);

  // Auto-fetch patient data if missing or mismatched
  useEffect(() => {
    if (patientId && (!currentPatient || currentPatient.id !== patientId)) {
      fetchPatient(patientId);
    }
  }, [patientId, currentPatient, fetchPatient]);

  // Determine display name: try patientStore first (more likely to be complete), then dentalStore
  const getPatientName = (p) => {
    if (!p) return null;
    if (p.first_name && p.last_name) return `${p.first_name} ${p.last_name}`;
    if (p.firstName && p.lastName) return `${p.firstName} ${p.lastName}`;
    if (p.fullName) return p.fullName;
    if (p.name) return p.name;
    return null;
  };

  const patientDisplayName = getPatientName(currentPatient) || dentalPatientName || "Patient";

  const isActive = (path) => pathname === path;
  const isPrintPage = pathname?.includes('/PDFReport');

  // Construct items
  const items = [];

  if (patientId) {
    items.push({
      label: patientDisplayName,
      href: `/patient/${patientId}`,
      current: !report_id && !toothId && !isPrintPage
    });
  }

  if (report_id) {
    items.push({
      label: reportType ? `Rapport ${reportType}` : `Rapport`,
      href: `/patient/${patientId}/${report_id}`,
      current: !toothId && !isPrintPage
    });
  }

  if (toothId) {
    items.push({
      label: `Dent ${toothId}`,
      href: `/patient/${patientId}/${report_id}/ToothSlice/${toothId}`,
      current: true
    });
  }

  if (isPrintPage) {
    items.push({
      label: "Imprimer le rapport",
      href: pathname, // Or construct it if needed, but pathname is already correct
      current: true
    });
  }

  if (items.length === 0) return null;

  // Don't show breadcrumb on the main patient page (only when viewing a report or deeper)
  if (!report_id && !isPrintPage) return null;

  return (
    <nav className={`flex items-center space-x-1 text-xl font-medium ${className}`} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={item.href}>
          {index > 0 && <ChevronRight className="w-6 h-6 text-[#7564ed]" />}

          <Link
            href={item.href}
            className={`transition-colors ${item.current
              ? 'text-gray-900  pointer-events-none'
              : 'text-[#7564ed] hover:underline'
              }`}
          >
            {item.label}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
}
