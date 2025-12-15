"use client";

import React, { useState } from 'react';
import { MoreVertical, Image as ImageIcon } from 'lucide-react';

import { useDentalData } from './hooks/useDentalData';
import { FilePreviewDialog } from './components/FilePreviewDialog';
import { DeleteFileDialog } from './components/DeleteFileDialog';
import { DentalFileCard } from './components/DentalFileCard';

const DentalDataPage = () => {
    const {
        loading,
        sortedDates,
        groupedFiles,
        deleteFile,
        helpers // Expose helpers for child components if needed
    } = useDentalData();

    const [selectedFile, setSelectedFile] = useState(null);
    const [fileToDelete, setFileToDelete] = useState(null);

    const handleDeleteClick = (e, file) => {
        e.stopPropagation();
        setFileToDelete(file);
    };

    const confirmDelete = async () => {
        if (fileToDelete) {
            console.log(fileToDelete, "fileToDelete");
            await deleteFile(fileToDelete.id);
            setFileToDelete(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#7564ed] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen ">

            <div className="flex items-center justify-between pb-8 pt-8">
                <div className="text-4xl font-bold text-gray-900">Dental Data</div>
            </div>
            {/* Gallery Content */}
            <div className=" space-y-12">
                {sortedDates.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No dental data found</h3>
                        <p className="text-gray-500 mt-1">Uploaded files will appear here.</p>
                    </div>
                ) : (
                    sortedDates.map((date) => (
                        <div key={date} className="space-y-4">
                            {/* Date Header */}
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-gray-900">{date}</h2>
                                <button className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
                                {groupedFiles[date].map((file) => (
                                    <DentalFileCard
                                        key={file.id}
                                        file={file}
                                        helpers={helpers}
                                        onSelect={setSelectedFile}
                                        onDelete={handleDeleteClick}
                                    />
                                ))}
                            </div>
                        </div >
                    ))
                )}
            </div >

            <FilePreviewDialog
                selectedFile={selectedFile}
                isOpen={!!selectedFile}
                onOpenChange={(open) => !open && setSelectedFile(null)}
                helpers={helpers}
            />

            <DeleteFileDialog
                fileToDelete={fileToDelete}
                onOpenChange={(open) => !open && setFileToDelete(null)}
                onConfirm={confirmDelete}
            />
        </div >
    );
};

export default DentalDataPage;
