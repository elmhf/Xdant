import React from 'react';
import { Button } from "@/components/ui/button";
import { Building2, Plus } from "lucide-react";
import Link from 'next/link';

const NoClinicState = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200 shadow-sm">
            <div className="w-24 h-24 bg-[#7564ed]/10 rounded-full flex items-center justify-center mb-6">
                <Building2 className="w-12 h-12 text-[#7564ed]" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                No Clinic Selected
            </h2>

            <p className="text-gray-600 max-w-md mb-8 text-lg">
                You need to select a clinic to view and manage its patients.
                If you don't have a clinic yet, you can create one or wait for an invitation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/create-clinic">
                    <Button className="bg-[#7564ed] hover:bg-[#6a5ad6] text-white px-8 h-12 rounded-2xl text-lg font-semibold shadow-lg shadow-[#7564ed]/20 transition-all hover:scale-105">
                        <Plus className="w-5 h-5 mr-2" />
                        Create New Clinic
                    </Button>
                </Link>

                <Button variant="outline" onClick={() => window.location.reload()} className="border-gray-200 text-gray-700 px-8 h-12 rounded-2xl text-lg font-semibold hover:bg-gray-50">
                    Refresh Page
                </Button>
            </div>
        </div>
    );
};

export default NoClinicState;
