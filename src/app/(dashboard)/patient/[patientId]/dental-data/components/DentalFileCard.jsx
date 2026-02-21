import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { File, Image as ImageIcon, Download, Play, Trash2 } from 'lucide-react';

export const DentalFileCard = ({ file, helpers, onSelect, onDelete }) => {
    const { t } = useTranslation('patient');
    const { isImage, isVideo, shouldPreview, getFileDetails, handleDownload } = helpers;

    return (
        <div className="group relative aspect-[4/3] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
            <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 rounded-full shadow-sm"
                    onClick={(e) => onDelete(e, file)}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
            {shouldPreview(file) ? (
                <div
                    className="w-full h-full cursor-pointer relative"
                    onClick={() => onSelect(file)}
                >
                    {isImage(file) ? (
                        <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center relative">
                            <video
                                src={file.url}
                                className="w-full h-full object-cover"
                                preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                <div className="bg-white/90 p-3 rounded-full shadow-sm">
                                    <Play className="w-6 h-6 text-[#7564ed] fill-current" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 via-black/40 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <p className="text-sm font-medium truncate drop-shadow-md">{file.name}</p>
                        <p className="text-[10px] text-gray-200 mt-0.5 drop-shadow-md">
                            {getFileDetails(file).ext} • {getFileDetails(file).size}
                        </p>
                    </div>
                </div>
            ) : (
                <div
                    className="w-full h-full backdrop-blur-[2px] flex flex-col items-center justify-center bg-gray-50 p-6 text-center cursor-pointer hover:bg-gray-100 transition-colors group/download"
                    onClick={() => handleDownload(file)}
                    title={t('dentalData.card.downloadHint')}
                >
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 group-hover/download:scale-110 transition-transform">
                        {isImage(file) ? <ImageIcon className="w-6 h-6 text-gray-400" /> : (isVideo(file) ? <Play className="w-6 h-6 text-gray-400" /> : <File className="w-6 h-6 text-[#7564ed]" />)}
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate w-full px-4" title={file.name}>
                        {file.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {getFileDetails(file).ext} • {getFileDetails(file).size}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-[#7564ed] opacity-0 group-hover/download:opacity-100 transition-opacity">
                        <Download className="w-3 h-3" />
                        <span className="text-xs font-medium">{t('dentalData.card.download')}</span>
                    </div>
                    {file.size > (50 * 1024 * 1024) && (isImage(file) || isVideo(file)) && (
                        <span className="text-[10px] text-orange-500 font-medium mt-2 bg-orange-50 px-2 py-0.5 rounded-full">
                            {t('dentalData.card.largeImage')}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};
