"use client";
import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, FileText, User, Calendar, AlertCircle, X } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { DeleteReportDialog } from './components/DeleteReportDialog';
import { Input } from '@/components/ui/input';
import ReportsTable from './components/ReportsTable';

export default function ReportsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ from: '0', to: '10' });
    const [showFilters, setShowFilters] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [reportToDelete, setReportToDelete] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        fetchReports();
    }, [dateRange]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllReports(dateRange.from, dateRange.to);
            console.log("Reports API Response:", data);

            let reportsArray = [];
            if (Array.isArray(data)) {
                reportsArray = data;
            } else if (data?.data && Array.isArray(data.data)) {
                reportsArray = data.data;
            } else if (data?.reports && Array.isArray(data.reports)) {
                reportsArray = data.reports;
            } else if (data?.results && Array.isArray(data.results)) {
                reportsArray = data.results;
            } else {
                console.warn('Unexpected reports response structure:', data);
            }
            setReports(reportsArray);

            if (reportsArray.length < 10) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = async () => {
        const from = reports.length;
        const to = from + 10;
        try {
            const data = await adminService.getAllReports(from.toString(), to.toString());

            let newReports = [];
            if (Array.isArray(data)) {
                newReports = data;
            } else if (data?.data && Array.isArray(data.data)) {
                newReports = data.data;
            } else if (data?.reports && Array.isArray(data.reports)) {
                newReports = data.reports;
            } else if (data?.results && Array.isArray(data.results)) {
                newReports = data.results;
            }

            if (newReports.length > 0) {
                setReports(prev => [...prev, ...newReports]);
                if (newReports.length < 10) {
                    setHasMore(false);
                }
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to load more reports:', error);
        }
    };

    const handleViewReport = (report) => {
        // Navigate or open modal
        console.log('View report:', report);
        // e.g. router.push(`/patient/${report.patient_id}?report=${report.id}`)
    };

    const handleDeleteReport = (report) => {
        setReportToDelete(report);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteReport = async () => {
        if (!reportToDelete) return;
        setDeleteLoading(true);
        try {
            const reportId = reportToDelete.report_id || reportToDelete.id;
            await adminService.deleteReport(reportId);
            setReports(prev => prev.filter(r => (r.report_id || r.id) !== reportId));
            setIsDeleteDialogOpen(false);
            setReportToDelete(null);
        } catch (error) {
            console.error('Failed to delete report:', error);
        } finally {
            setDeleteLoading(false);
        }
    };

    const filteredReports = reports.filter(report =>
        (report.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.id || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.image_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const clearFilters = () => {
        setDateRange({ from: '0', to: '10' });
        setSearchTerm('');
        setHasMore(true);
    };

    return (
        <div className="w-full h-full  space-y-6">


            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Left: Title */}
                <p className="text-4xl font-bold text-gray-900">
                    All reports <span className="text-gray-400 font-normal ml-2">{reports?.length || 0}</span>
                </p>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 md:min-w-[500px]">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Search reports by patient or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-10 w-full  rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Filters Button */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 h-10 px-4 border rounded-md font-medium transition-all ${showFilters ? 'bg-gray-50 border-gray-300 text-gray-900' : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'}`}
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </button>
                </div>
            </div>

            {/* Filter Panel (if open) */}
            {showFilters && (
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">From:</span>
                            <input
                                type="number"
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7564ed]/20 w-24"
                                value={dateRange.from}
                                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">To:</span>
                            <input
                                type="number"
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7564ed]/20 w-24"
                                value={dateRange.to}
                                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Reports Table */}
            <div className="bg-white min-h-screen rounded-xl shadow max-w-full mx-auto">
                <ReportsTable
                    reports={filteredReports}
                    loading={loading}
                    onViewReport={handleViewReport}
                    onDeleteReport={handleDeleteReport}
                />
            </div>

            {/* Pagination */}
            {hasMore && !loading && (
                <div className="flex justify-center mt-6">
                    <button
                        onClick={handleLoadMore}
                        className="text-[#7564ed] hover:bg-[#7564ed]/10 hover:text-[#7564ed] px-4 py-2 rounded-md font-medium transition-colors"
                    >
                        Load more items
                    </button>
                </div>
            )}

            <DeleteReportDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                report={reportToDelete}
                onConfirm={confirmDeleteReport}
                loading={deleteLoading}
            />
        </div>
    );
}
