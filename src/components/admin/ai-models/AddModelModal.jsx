import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileCode, Check } from "lucide-react";
import { toast } from "sonner";

const AddModelModal = ({ isOpen, onOpenChange, onAdd }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('pano_detection');
    const [threshold, setThreshold] = useState('0.6');
    const [method, setMethod] = useState('upload'); // 'upload' or 'path'
    const [path, setPath] = useState('');
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name) {
            toast.error("Please enter a model name");
            return;
        }

        setIsLoading(true);
        try {
            const data = {
                name,
                type,
                threshold: parseFloat(threshold),
            };

            if (method === 'path') {
                if (!path) {
                    toast.error("Please enter a file path");
                    setIsLoading(false);
                    return;
                }
                data.path = path;
                await onAdd(data, null);
            } else {
                if (!file) {
                    toast.error("Please select a file to upload");
                    setIsLoading(false);
                    return;
                }
                await onAdd(data, file);
            }

            // Reset form
            setName('');
            setPath('');
            setFile(null);
            setThreshold('0.6');
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to add model", error);
            // Error handling should be done in parent or service usually, but here we catch to stop loading
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden sm:rounded-2xl transition-all duration-200 scale-100">
                <div className="bg-gradient-to-br from-indigo-50 to-white px-6 py-6 border-b border-gray-100">
                    <DialogHeader className="gap-2">
                        <DialogTitle className="text-2xl font-bold text-gray-900 tracking-tight">Add New AI Model</DialogTitle>
                        <DialogDescription className="text-gray-500 text-base">
                            Register a new model by uploading a file or specifying a path.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="px-6 py-6 space-y-6">
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Model Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Experimental V2"
                                className="h-11"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="type">Model Type</Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pano_detection">Pano Detection</SelectItem>
                                        <SelectItem value="cbct_segmentation">CBCT Segmentation</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="threshold">Threshold</Label>
                                <Input
                                    id="threshold"
                                    type="number"
                                    step="0.05"
                                    min="0"
                                    max="1"
                                    value={threshold}
                                    onChange={(e) => setThreshold(e.target.value)}
                                    className="h-11"
                                />
                            </div>
                        </div>

                        <Tabs defaultValue="upload" value={method} onValueChange={setMethod} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4 h-11 p-1 bg-gray-100 rounded-xl">
                                <TabsTrigger value="upload" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <Upload size={16} className="mr-2" /> Upload File
                                </TabsTrigger>
                                <TabsTrigger value="path" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <FileCode size={16} className="mr-2" /> Server Path
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="upload" className="mt-0 space-y-4">
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50/50 transition-colors cursor-pointer relative group">
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        accept=".pt,.pth,.onnx"
                                    />
                                    <div className="flex flex-col items-center gap-2 relative z-0">
                                        <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform duration-200">
                                            <Upload size={24} />
                                        </div>
                                        {file ? (
                                            <div className="text-sm font-medium text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full mt-2">
                                                <Check size={14} />
                                                {file.name}
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                                                <p className="text-xs text-gray-400">Supported: .pt, .pth, .onnx</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="path" className="mt-0">
                                <div className="grid gap-2">
                                    <Label htmlFor="path">File Path on Server</Label>
                                    <Input
                                        id="path"
                                        value={path}
                                        onChange={(e) => setPath(e.target.value)}
                                        placeholder="models/pano/custom.pt"
                                        className="h-11 font-mono text-sm"
                                    />
                                    <p className="text-xs text-gray-500">Provide the relative or absolute path to the model file on the server.</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="h-10 hover:bg-gray-100">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading} className="h-10 bg-[#7564ed] hover:bg-[#6353d6] text-white shadow-lg shadow-indigo-200">
                        {isLoading ? "Adding..." : "Add Model"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddModelModal;
