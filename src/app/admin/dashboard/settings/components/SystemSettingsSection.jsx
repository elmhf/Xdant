"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Settings, Eye, EyeOff, Save, Key, Monitor, Cpu, Database, Plus, Trash2, Edit2, Pencil, Check, Fingerprint, X, Loader2 } from "lucide-react";
import { adminService } from '@/services/adminService';
import { toast } from 'sonner';

export default function SystemSettingsSection() {
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [showSecrets, setShowSecrets] = useState({});

    // UI State
    const [isManageMode, setIsManageMode] = useState(false);

    // Dynamic State
    const [settingsList, setSettingsList] = useState([]);
    const [config, setConfig] = useState({});

    // Edit/Add State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSetting, setEditingSetting] = useState(null);
    const [newSetting, setNewSetting] = useState({
        key: '',
        value: '',
        category: 'General',
        target_service: 'frontend',
        input_type: 'text'
    });

    // Password Confirmation State
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pendingAction, setPendingAction] = useState(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await adminService.getSystemConfig();
            if (res.settings) {
                setSettingsList(res.settings);
                const initialConfig = {};
                res.settings.forEach(item => {
                    initialConfig[item.key] = item.value;
                });
                setConfig(initialConfig);
            }
        } catch (error) {
            console.error("Failed to fetch system config", error);
            toast.error("Failed to load system configuration");
        } finally {
            setDataLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const toggleSecret = (key) => {
        setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Modified to open password modal
    const onSave = async () => {
        setPendingAction(() => executeSave);
        setIsPasswordModalOpen(true);
    };

    const executeSave = async (password) => {
        setLoading(true);
        try {
            await adminService.updateSystemConfig(config, password);
            toast.success("System configuration updated successfully");
            await fetchConfig();
            setIsPasswordModalOpen(false);
            setConfirmPassword('');
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to update configuration");
        } finally {
            setLoading(false);
        }
    };

    const onAddSetting = async () => {
        if (!newSetting.key || !newSetting.target_service) {
            toast.error("Key and Target Service are required");
            return;
        }
        try {
            await adminService.addSystemConfig(newSetting);
            toast.success("Setting added successfully");
            setIsAddModalOpen(false);
            setNewSetting({ key: '', value: '', category: 'General', target_service: 'frontend', input_type: 'text' });
            await fetchConfig();
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to add setting");
        }
    };

    const onDeleteSetting = async (key) => {
        if (!confirm(`Are you sure you want to delete ${key}?`)) return;
        try {
            await adminService.deleteSystemConfig(key);
            toast.success("Setting deleted successfully");
            await fetchConfig();
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to delete setting");
        }
    };

    // Modified to open password modal
    const onUpdateMetadata = async () => {
        if (!editingSetting) return;
        setPendingAction(() => executeUpdateMetadata);
        setIsPasswordModalOpen(true);
    };

    const executeUpdateMetadata = async (password) => {
        try {
            await adminService.updateSystemConfig(editingSetting, password);
            toast.success("Setting metadata updated successfully");
            setIsEditModalOpen(false);
            setEditingSetting(null);
            await fetchConfig();
            setIsPasswordModalOpen(false);
            setConfirmPassword('');
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to update metadata");
        }
    };

    const handleConfirmPassword = () => {
        if (!confirmPassword) {
            toast.error("Please enter your password");
            return;
        }
        if (pendingAction) {
            pendingAction(confirmPassword);
        }
    };

    const openEditModal = (setting) => {
        setEditingSetting({ ...setting });
        setIsEditModalOpen(true);
    };

    const groupedSettings = settingsList.reduce((acc, item) => {
        const group = item.target_service || 'general';
        if (!acc[group]) acc[group] = [];
        acc[group].push(item);
        return acc;
    }, {});



    const formatTitle = (text) => text.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    if (dataLoading) {
        return <div className="p-4 text-center text-gray-500">Loading system settings...</div>;
    }

    // Check for changes
    const hasChanges = settingsList.some(item => String(config[item.key]) !== String(item.value));

    return (
        <section className="space-y-10 max-w-6xl animate-in fade-in duration-500">
            {/* Header / Management Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-10 border-b border-gray-100">
                <div className="space-y-1">
                    <p className="text-3xl font-bold text-gray-900">System Configuration</p>
                    <p className="text-lg text-gray-500">
                        {isManageMode
                            ? "Management Mode Active: Add, Edit Metadata, or Delete settings."
                            : "Manage configuration dynamically."}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant={isManageMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsManageMode(!isManageMode)}
                        className={`gap-2 ${isManageMode ? "bg-green-600 hover:bg-green-700 text-white border-transparent" : "h-9"}`}
                    >
                        {isManageMode ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                        {isManageMode ? "Done Editing" : "Manage Config"}
                    </Button>

                    {isManageMode && (
                        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2 border-dashed h-9">
                                    <Plus className="w-4 h-4" /> Add New
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-xl bg-white rounded-3xl p-6 shadow-2xl border-0">
                                <DialogHeader className="pt-2 px-2">
                                    <DialogTitle className="text-2xl font-bold text-gray-900">Add New Configuration</DialogTitle>
                                    <DialogDescription className="text-gray-500 text-base mt-2">Add a new environment variable to the system.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Key</Label>
                                        <Input
                                            value={newSetting.key}
                                            onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value.toUpperCase() })}
                                            placeholder="MY_NEW_CONFIG"
                                            className="uppercase"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Value</Label>
                                        <Input
                                            value={newSetting.value}
                                            onChange={(e) => setNewSetting({ ...newSetting, value: e.target.value })}
                                            placeholder="Configuration value"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Service</Label>
                                            <Select value={newSetting.target_service} onValueChange={(val) => setNewSetting({ ...newSetting, target_service: val })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="frontend">Frontend</SelectItem>
                                                    <SelectItem value="server_api">Server API</SelectItem>
                                                    <SelectItem value="server_ai">Server AI</SelectItem>
                                                    <SelectItem value="general">General</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Type</Label>
                                            <Select value={newSetting.input_type} onValueChange={(val) => setNewSetting({ ...newSetting, input_type: val })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="text">Text</SelectItem>
                                                    <SelectItem value="number">Number</SelectItem>
                                                    <SelectItem value="boolean">Boolean</SelectItem>
                                                    <SelectItem value="password">Password</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Input
                                            value={newSetting.category}
                                            onChange={(e) => setNewSetting({ ...newSetting, category: e.target.value })}
                                            placeholder="e.g. Feature Flags"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={onAddSetting}>Add Setting</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            {/* Dynamic Groups */}
            {Object.keys(groupedSettings).map((group, index) => (
                <div key={group} className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${index !== Object.keys(groupedSettings).length - 1 ? 'pb-10 border-b border-gray-100' : ''}`}>
                    <div className="md:col-span-1 space-y-1">
                        <p className="text-2xl font-semibold text-gray-900">{formatTitle(group)}</p>
                        <p className="text-md text-gray-500">Configure settings for the {formatTitle(group)} module.</p>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 gap-5">
                            {groupedSettings[group].map((setting) => (
                                <div key={setting.key} className="relative group space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor={setting.key} className="text-gray-900 font-medium flex items-center gap-2 cursor-pointer">
                                            {formatTitle(setting.key)}
                                            {isManageMode && (
                                                <span className="text-md bg-gray-100 px-2 py-0.5 rounded text-gray-900 font-normal">{setting.category}</span>
                                            )}
                                        </Label>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="flex-1">
                                            {setting.input_type === 'boolean' ? (
                                                <div className="flex items-center space-x-2 py-2">
                                                    <Switch
                                                        id={setting.key}
                                                        checked={config[setting.key] === 'true' || config[setting.key] === true}
                                                        onCheckedChange={(checked) => handleChange(setting.key, checked)}
                                                    />
                                                    <Label htmlFor={setting.key} className="font-normal text-gray-500">
                                                        {(config[setting.key] === 'true' || config[setting.key] === true) ? 'Enabled' : 'Disabled'}
                                                    </Label>
                                                </div>
                                            ) : setting.input_type === 'password' ? (
                                                <div className="relative">
                                                    <Input
                                                        id={setting.key}
                                                        type={showSecrets[setting.key] ? "text" : "password"}
                                                        value={config[setting.key] || ''}
                                                        onChange={(e) => handleChange(setting.key, e.target.value)}
                                                    />
                                                    <button type="button" onClick={() => toggleSecret(setting.key)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                                        {showSecrets[setting.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            ) : (
                                                <Input
                                                    id={setting.key}
                                                    type={setting.input_type === 'number' ? 'number' : 'text'}
                                                    value={config[setting.key] || ''}
                                                    onChange={(e) => handleChange(setting.key, e.target.value)}
                                                />
                                            )}
                                        </div>

                                        {isManageMode && (
                                            <Button variant="secondary" size="icon" className="h-11 w-11 shrink-0 rounded-2xl bg-gray-100 hover:bg-gray-200" onClick={() => openEditModal(setting)}>
                                                <Pencil className="w-4 h-4 text-gray-600" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}

            {/* Save Action Bar */}
            <div className="flex justify-end items-center pt-6 sticky bottom-4">
                <div className={`flex items-center gap-4 bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 ${hasChanges ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
                    <p className="text-sm text-gray-500 px-2">
                        You have unsaved changes.
                    </p>
                    <Button
                        onClick={onSave}
                        disabled={loading || !hasChanges}
                        className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20"
                    >
                        {loading ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                    </Button>
                </div>
            </div>

            {/* Edit Metadata Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-xl bg-white rounded-3xl p-6 shadow-2xl border-0">
                    <DialogHeader className="pt-2 px-2">
                        <DialogTitle className="text-2xl font-bold text-gray-900">Edit Configuration Metadata</DialogTitle>
                        <DialogDescription className="text-gray-500 text-base mt-2">Modify the properties of {editingSetting?.key}</DialogDescription>
                    </DialogHeader>
                    {editingSetting && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Target Service</Label>
                                    <Select
                                        value={editingSetting.target_service}
                                        onValueChange={(val) => setEditingSetting({ ...editingSetting, target_service: val })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="frontend">Frontend</SelectItem>
                                            <SelectItem value="server_api">Server API</SelectItem>
                                            <SelectItem value="server_ai">Server AI</SelectItem>
                                            <SelectItem value="general">General</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Input Type</Label>
                                    <Select
                                        value={editingSetting.input_type}
                                        onValueChange={(val) => setEditingSetting({ ...editingSetting, input_type: val })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="text">Text</SelectItem>
                                            <SelectItem value="number">Number</SelectItem>
                                            <SelectItem value="boolean">Boolean</SelectItem>
                                            <SelectItem value="password">Password</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Input
                                    value={editingSetting.category}
                                    onChange={(e) => setEditingSetting({ ...editingSetting, category: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter className="flex justify-between sm:justify-between w-full">
                        <Button variant="destructive" onClick={() => { setIsEditModalOpen(false); onDeleteSetting(editingSetting.key); }}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </Button>
                        <Button onClick={onUpdateMetadata}>Update Metadata</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Password Confirmation Modal */}
            <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white rounded-xl">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            Verify Action
                        </DialogTitle>
                        <button
                            onClick={() => setIsPasswordModalOpen(false)}
                            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col items-center justify-center text-center space-y-4 mb-6">
                            <div className="h-20 w-20 bg-[#7564ed] rounded-3xl flex items-center justify-center shadow-md">
                                <Fingerprint className="text-white h-10 w-10" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-gray-900">Password Verification</h2>
                                <p className="text-gray-500 text-base">
                                    Enter your password to <span className="font-semibold text-[#7564ed]">confirm changes</span>
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="h-12 w-full text-base rounded-xl border-gray-200 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20 transition-all"
                            />

                            <div className="flex gap-3 pt-2 justify-end">
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsPasswordModalOpen(false)}
                                    className="text-lg font-semibold border text-gray-600 transition-all duration-150 px-4 py-2 rounded-2xl"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleConfirmPassword}
                                    disabled={loading || !confirmPassword}
                                    className="text-lg font-bold bg-[#7564ed] text-white hover:bg-[#6355d0] transition-all duration-150 px-6 py-2 rounded-2xl flex items-center"
                                >
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Confirm
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    );
}
