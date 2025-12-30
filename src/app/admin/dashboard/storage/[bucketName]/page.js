"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft,
    FileImage,
    FileText,
    Database,
    Server,
    Search,
    Download,
    Trash2,
    MoreVertical,
    Loader2,
    Folder,
    Home
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminService } from '@/services/adminService';
import { toast } from 'sonner';

export default function BucketDetailPage() {
    const { bucketName } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get path from URL query param, default to empty string (root)
    const currentPath = searchParams.get('path') || '';

    const [bucketData, setBucketData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchBucketContent = async () => {
            setLoading(true);
            try {
                // Pass currentPath to service
                const data = await adminService.getBucketContent(bucketName, currentPath);
                setBucketData(data);
            } catch (error) {
                console.error("Failed to fetch bucket content", error);
                toast.error(`Failed to load bucket content`);
            } finally {
                setLoading(false);
            }
        };

        if (bucketName) {
            fetchBucketContent();
        }
    }, [bucketName, currentPath]); // Re-fetch when path changes

    const handleFolderClick = (folderName) => {
        // Append new folder to current path
        // Ensure we handle trailing slashes correctly
        const newPath = currentPath ? `${currentPath}${folderName}/` : `${folderName}/`;
        router.push(`/admin/dashboard/storage/${bucketName}?path=${encodeURIComponent(newPath)}`);
    };

    const handleBreadcrumbClick = (index, breadcrumbs) => {
        // Reconstruct path up to the clicked index
        if (index === -1) {
            router.push(`/admin/dashboard/storage/${bucketName}`); // Root
            return;
        }
        // Slice up to index+1 because path components are split by '/'
        const newPath = breadcrumbs.slice(0, index + 1).join('/') + '/';
        router.push(`/admin/dashboard/storage/${bucketName}?path=${encodeURIComponent(newPath)}`);
    };

    const getIcon = (item) => {
        if (item.isFolder) return <Folder className="text-yellow-500 fill-yellow-50" size={20} />;
        const lower = item.name.toLowerCase();
        if (lower.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) return <FileImage size={18} className="text-emerald-500" />;
        if (lower.match(/\.(pdf|doc|docx|txt)$/)) return <FileText size={18} className="text-indigo-500" />;
        if (lower.match(/\.(sql|db|backup)$/)) return <Database size={18} className="text-amber-500" />;
        return <Server size={18} className="text-gray-400" />;
    };

    const filteredFiles = bucketData?.files?.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    // Path Breadcrumbs generator
    const breadcrumbs = currentPath.split('/').filter(p => p);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/admin/dashboard/storage')}
                        className="rounded-full hover:bg-gray-100"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900">{bucketName}</h1>
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-mono">{currentPath || '/'}</span>
                        </div>
                    </div>
                </div>

                {/* Breadcrumbs Bar */}
                <div className="flex items-center gap-1 text-sm text-gray-500 bg-white p-2 px-4 rounded-xl border border-gray-100 overflow-x-auto">
                    <button
                        onClick={() => handleBreadcrumbClick(-1)}
                        className="hover:bg-gray-100 p-1.5 rounded-md text-emerald-600 transition-colors"
                    >
                        <Home size={16} />
                    </button>
                    {breadcrumbs.map((crumb, i) => (
                        <div key={i} className="flex items-center">
                            <span className="mx-1 text-gray-300">/</span>
                            <button
                                onClick={() => handleBreadcrumbClick(i, breadcrumbs)}
                                className={`px-2 py-1 rounded-md hover:bg-gray-100 transition-colors ${i === breadcrumbs.length - 1 ? 'font-bold text-gray-900' : ''}`}
                            >
                                {crumb}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions Toolbar */}
            <div className="flex flex-col md:flex-row justify-between gap-4">

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                        placeholder="Search current folder..."
                        className="pl-9 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                    Upload to {currentPath ? 'Folder' : 'Root'}
                </Button>
            </div>

            {/* Files List */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center p-20 text-gray-400 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Name</th>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Type</th>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Size</th>
                                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Last Modified</th>
                                    <th className="text-right py-3 px-6 text-sm font-medium text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredFiles.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-gray-400">
                                            {searchTerm ? 'No matching files found.' : 'Folder is empty.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredFiles.map((file) => (
                                        <tr
                                            key={file.id}
                                            className={`hover:bg-gray-50/80 transition-colors group ${file.isFolder ? 'cursor-pointer bg-gray-50/30' : ''}`}
                                            onClick={() => file.isFolder && handleFolderClick(file.name)}
                                        >
                                            <td className="py-3 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-gray-100 rounded-lg text-gray-500 group-hover:text-emerald-600 transition-colors">
                                                        {getIcon(file)}
                                                    </div>
                                                    <span className={`font-medium ${file.isFolder ? 'text-gray-900' : 'text-gray-700'}`}>
                                                        {file.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-6 text-sm text-gray-500 max-w-[150px] truncate">
                                                {file.type}
                                            </td>
                                            <td className="py-3 px-6 text-sm text-gray-900 font-medium font-mono">
                                                {file.size}
                                            </td>
                                            <td className="py-3 px-6 text-sm text-gray-500">
                                                {file.created_at}
                                            </td>
                                            <td className="py-3 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                                                {!file.isFolder && (
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 rounded-full">
                                                            <Download size={16} className="text-gray-500" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 rounded-full">
                                                            <Trash2 size={16} className="text-red-500" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 rounded-full">
                                                            <MoreVertical size={16} className="text-gray-500" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
