import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ZoomIn, ZoomOut, RotateCcw, Download, Play } from 'lucide-react';
import { useDentalData } from '../hooks/useDentalData'; // Import needed helper if not passed as prop, but better to pass helpers or use hook in parent.
// Or just replicate helpers here if they are simple pure functions.

export const FilePreviewDialog = ({ selectedFile, isOpen, onOpenChange, helpers }) => {
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Reset state when dialog closes
    React.useEffect(() => {
        if (!isOpen) {
            setZoom(1);
            setPosition({ x: 0, y: 0 });
        }
    }, [isOpen]);

    const { isImage, isVideo, getFileDetails, handleDownload } = helpers;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] w-[95vw] sm:max-w-[90vw] sm:w-[90vw] h-[95vh] p-0 overflow-hidden bg-black/95 border-none flex flex-col items-center justify-center">
                <DialogTitle className="sr-only">
                    {selectedFile?.name || 'File Preview'}
                </DialogTitle>
                <DialogDescription className="sr-only">
                    Preview of the selected file
                </DialogDescription>

                {/* Header Overlay */}
                {selectedFile && (
                    <div className="absolute top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                        <h3 className="text-white font-medium truncat text-center text-lg">{selectedFile.name}</h3>
                        <p className="text-white/70 text-xs text-center mt-1">
                            {getFileDetails(selectedFile).ext} • {getFileDetails(selectedFile).size}
                        </p>
                    </div>
                )}

                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    {selectedFile && isImage(selectedFile) && (
                        <>
                            {/* Zoom Controls */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-black/50 backdrop-blur-sm p-2 rounded-full border border-white/10">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full hover:bg-white/20 text-white"
                                    onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))}
                                    title="Zoom Out"
                                >
                                    <ZoomOut className="w-4 h-4" />
                                </Button>
                                <span className="text-white text-xs font-medium w-12 text-center">
                                    {Math.round(zoom * 100)}%
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full hover:bg-white/20 text-white"
                                    onClick={() => setZoom(prev => Math.min(3, prev + 0.25))}
                                    title="Zoom In"
                                >
                                    <ZoomIn className="w-4 h-4" />
                                </Button>
                                <div className="w-px h-4 bg-white/20 mx-1" />

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full hover:bg-white/20 text-white"
                                    onClick={() => {
                                        setZoom(1);
                                        setPosition({ x: 0, y: 0 });
                                    }}
                                    title="Reset Zoom"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </Button>
                                <div className="w-px h-4 bg-white/20 mx-1" />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full hover:bg-white/20 text-white"
                                    onClick={() => handleDownload(selectedFile)}
                                    title="Download"
                                >
                                    <Download className="w-4 h-4" />
                                </Button>
                            </div>

                            <div
                                className="w-full h-full overflow-hidden flex items-center justify-center p-4 cursor-grab active:cursor-grabbing"
                                onWheel={(e) => {
                                    e.preventDefault();
                                    const delta = e.deltaY * -0.01;
                                    const newZoom = Math.min(Math.max(0.5, zoom + delta), 4);
                                    setZoom(newZoom);
                                    if (newZoom === 1) setPosition({ x: 0, y: 0 });
                                }}
                                onMouseDown={(e) => {
                                    if (zoom > 1) {
                                        setIsDragging(true);
                                        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
                                    }
                                }}
                                onMouseMove={(e) => {
                                    if (isDragging && zoom > 1) {
                                        e.preventDefault();
                                        setPosition({
                                            x: e.clientX - dragStart.x,
                                            y: e.clientY - dragStart.y
                                        });
                                    }
                                }}
                                onMouseUp={() => setIsDragging(false)}
                                onMouseLeave={() => setIsDragging(false)}
                            >
                                <img
                                    src={selectedFile.url}
                                    alt={selectedFile.name}
                                    className="transition-transform duration-75 ease-out max-w-none"
                                    style={{
                                        transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                                        maxHeight: '100%',
                                        maxWidth: '100%',
                                        cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                                    }}
                                    draggable={false}
                                />
                            </div>
                        </>
                    )}
                    {selectedFile && isVideo(selectedFile) && (
                        <div className="w-full h-full flex items-center justify-center p-4">
                            <video
                                src={selectedFile.url}
                                controls
                                autoPlay
                                className="w-full h-full max-h-full object-contain"
                            />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
