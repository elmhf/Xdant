import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, CheckCircle, UploadCloud, HardDrive, Edit, Check, XCircle } from "lucide-react";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { BrainCircuit } from 'lucide-react';

const ModelList = ({ models, activeModels, onSetActive, onDelete, onDeactivate, loading }) => {
    // Helper to check if a model is active
    const isActive = (model) => {
        const activeModel = activeModels[model.type];
        return activeModel && activeModel.id === model.id;
    };

    return (
        <div className="border border-gray-200 rounded-2xl overflow-x-auto bg-white">
            <div className="max-h-[85vh] overflow-y-auto">
                <table className="w-full">
                    <thead className="bg-gray-100/70 border-b border-gray-200 sticky top-0 z-10 filter backdrop-blur-sm">
                        <tr>
                            <th className="min-w-80 text-left py-3 px-6 text-md font-medium text-gray-500">
                                Model Name
                            </th>
                            <th className="min-w-48 text-left py-3 px-6 text-md font-medium text-gray-500">
                                Type
                            </th>
                            <th className="min-w-32 text-center py-3 px-6 text-md font-medium text-gray-500">
                                Source
                            </th>
                            <th className="min-w-32 text-center py-3 px-6 text-md font-medium text-gray-500">
                                Threshold
                            </th>
                            <th className="min-w-32 text-center py-3 px-6 text-md font-medium text-gray-500">
                                Status
                            </th>
                            <th className="min-w-32 text-center py-3 px-6 text-md font-medium text-gray-500">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse border-b border-gray-100">
                                    <td className="min-w-80 py-4 px-4"><div className="h-12 w-48 bg-gray-100 rounded-3xl"></div></td>
                                    <td className="min-w-48 py-4 px-4"><div className="h-4 w-32 bg-gray-100 rounded"></div></td>
                                    <td className="min-w-32 py-4 px-4 text-center"><div className="h-4 w-12 bg-gray-100 rounded mx-auto"></div></td>
                                    <td className="min-w-32 py-4 px-4 text-center"><div className="h-4 w-12 bg-gray-100 rounded mx-auto"></div></td>
                                    <td className="min-w-32 py-4 px-4 text-center"><div className="h-6 w-16 bg-gray-100 rounded-full mx-auto"></div></td>
                                    <td className="min-w-32 py-4 px-4"><div className="h-8 w-8 bg-gray-100 rounded-lg mx-auto"></div></td>
                                </tr>
                            ))
                        ) : models.length > 0 ? (
                            models.map((model) => {
                                const isModelActive = isActive(model);
                                return (
                                    <tr
                                        key={model.id}
                                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isModelActive ? 'bg-indigo-50/20' : ''}`}
                                    >
                                        <td className="min-w-80 py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="text-base font-medium text-gray-900 truncate">
                                                    {model.name}
                                                </span>
                                                <span className="text-xs text-gray-400 font-mono mt-0.5 truncate max-w-[200px]">
                                                    ID: {model.id}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="min-w-48 py-4 px-6">
                                            <Badge variant="outline" className="bg-white text-gray-600 border-gray-200 font-normal">
                                                {model.type}
                                            </Badge>
                                        </td>

                                        <td className="min-w-32 py-4 px-6 text-center">
                                            <div className="flex items-center justify-center gap-1.5 text-gray-600">
                                                {model.source === 'local_default' ? (
                                                    <HardDrive size={16} className="text-gray-400" />
                                                ) : (
                                                    <UploadCloud size={16} className="text-blue-400" />
                                                )}
                                                <span className="text-sm capitalize">{model.source?.replace('_', ' ') || 'Unknown'}</span>
                                            </div>
                                        </td>

                                        <td className="min-w-32 py-4 px-6 text-center">
                                            <span className="text-sm font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded-md">
                                                {model.threshold || '-'}
                                            </span>
                                        </td>

                                        <td className="min-w-32 py-4 px-6 text-center">
                                            {isModelActive ? (
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 px-3 py-1 shadow-none font-medium">
                                                    <CheckCircle size={12} className="mr-1.5" />
                                                    Active
                                                </Badge>
                                            ) : (
                                                <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-full">Inactive</span>
                                            )}
                                        </td>

                                        <td className="min-w-32 py-4 px-6">
                                            <div className="flex items-center justify-center gap-2">
                                                {!isModelActive ? (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => onSetActive(model.id)}
                                                        className="h-8 px-2 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium"
                                                        title="Set as Active"
                                                    >
                                                        Activate
                                                    </Button>
                                                ) : (
                                                    // Option to Deactivate if needed (user asked for unactive)
                                                    // Only key system models might not be deactivatable? 
                                                    // We can allow reverting to system default if this IS a custom one.
                                                    model.source !== 'local_default' && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => onDeactivate(model.type, model.name)}
                                                            className="h-8 px-2 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 font-medium"
                                                            title="Revert to Default"
                                                        >
                                                            Deactivate
                                                        </Button>
                                                    )
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => onDelete(model.id)}
                                                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                    title="Delete Model"
                                                >
                                                    <Trash2 size={18} className="stroke-[2.5]" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" className="">
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon">
                                                <BrainCircuit className="h-10 w-10 text-gray-400" />
                                            </EmptyMedia>

                                            <EmptyTitle className="text-xl font-semibold">
                                                No models found
                                            </EmptyTitle>

                                            <EmptyDescription className="text-gray-600 text-base">
                                                Use the 'Add Model' button to register new AI models.
                                            </EmptyDescription>
                                        </EmptyHeader>
                                    </Empty>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ModelList;
