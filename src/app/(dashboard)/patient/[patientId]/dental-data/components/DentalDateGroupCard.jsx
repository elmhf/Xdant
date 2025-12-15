import React from 'react';
import { Play } from 'lucide-react';

export const DentalDateGroupCard = ({ date, files, helpers, onSelect }) => {
    const { isImage, isVideo, shouldPreview } = helpers;

    // Limit to 2 items for display
    const displayFiles = files.slice(0, 2);
    const additionalCount = files.length > 2 ? files.length - 2 : 0;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="mb-4">
                <h3 className="text-3xl font-bold text-gray-900">Dental Photos</h3>
                <p className="text-sm font-semibold text-gray-500 mt-1">{date}</p>
            </div>

            <div className="grid grid-cols-2 gap-1">
                {displayFiles.map((file, index) => (
                    <div
                        key={file.id}
                        className="aspect-[4/3] relative rounded-xl overflow-hidden cursor-pointer hover:opacity-95 transition-opacity bg-black/5"
                        onClick={() => shouldPreview(file.url ? file : files[index]) && onSelect(file.url ? file : files[index])}
                    >
                        {isImage(file) ? (
                            <img
                                src={file.url}
                                alt={file.name}
                                className="w-full h-full object-cover"
                            />
                        ) : isVideo(file) ? (
                            <div className="w-full h-full flex items-center justify-center relative bg-gray-900">
                                <video
                                    src={file.url}
                                    className="w-full h-full object-cover opacity-80"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                                        <Play className="w-6 h-6 text-white fill-current" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 text-xs p-2 text-center">
                                {file.name}
                            </div>
                        )}

                        {/* Overlay for +N */}
                        {index === 1 && additionalCount > 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white text-3xl font-bold">+{additionalCount}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
