import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { File, AlertCircle, Trash2, Upload } from "lucide-react";

const GenericUploadDialog = ({
    isOpen,
    onClose,
    onUpload
}) => {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [error, setError] = useState(null);

    const handleFileUpload = (event) => {
        setError(null);
        const files = Array.from(event.target.files || event.dataTransfer.files);

        if (files.length > 0) {
            const file = files[0];
            setUploadedFiles([file]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleFileUpload(e);
    };

    const removeFile = () => {
        setUploadedFiles([]);
    };

    const handleClose = () => {
        setUploadedFiles([]);
        setError(null);
        onClose();
    };

    const handleConfirm = () => {
        if (uploadedFiles.length === 0) return;
        onUpload(uploadedFiles[0]);
        handleClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md bg-white rounded-2xl border-0 shadow-xl p-0 overflow-hidden">
                <DialogTitle className="sr-only">Upload Files</DialogTitle>

                {/* Header */}
                <div className="bg-white px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Upload Files
                        </h2>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-5 space-y-5">
                    {error && (
                        <Alert variant="destructive" className="border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-700">{error}</AlertDescription>
                        </Alert>
                    )}

                    <div
                        className={`border-2 border-dashed border-gray-200 rounded-xl p-8 text-center transition-all duration-200 ${uploadedFiles.length === 0 ? 'hover:border-[#7564ed] hover:bg-purple-50/30' : ''
                            }`}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        {uploadedFiles.length === 0 ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-4 bg-purple-50 rounded-full">
                                    <Upload className="w-8 h-8 text-[#7564ed]" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-lg font-semibold text-gray-900">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Images, Videos, CBCT, Pano, STL, DCM, PLY (Max size: 5GB)
                                    </p>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="generic-upload"
                                        type="file"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    <Label
                                        htmlFor="generic-upload"
                                        className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#7564ed] hover:bg-[#6354c9] transition-colors"
                                    >
                                        Select File
                                    </Label>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-100 text-[#7564ed] rounded-2xl flex items-center justify-center">
                                            <File className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
                                                {uploadedFiles[0].name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {(uploadedFiles[0].size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={removeFile}
                                        className="text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                    <Button
                        variant="ghost"
                        onClick={handleClose}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={uploadedFiles.length === 0}
                        className="bg-[#7564ed] hover:bg-[#6354c9] text-white font-medium"
                    >
                        Upload
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default GenericUploadDialog;
