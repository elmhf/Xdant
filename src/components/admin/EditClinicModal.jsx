import React, { useState, useEffect } from 'react';
import { Save, Trash2, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services/adminService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function EditClinicModal({ clinic, open, onOpenChange, onUpdate }) {
    const [activeTab, setActiveTab] = useState('details'); // details | members
    const [members, setMembers] = useState([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [newMember, setNewMember] = useState({ email: '', role: 'clinic_access' });
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        clinic_name: '',
        email: '',
        phone: '',
        website: '',
        street_address: '',
        neighbourhood: '',
        city: '',
        postal_code: '',
        country: '',
    });

    useEffect(() => {
        if (clinic) {
            setFormData({
                clinic_name: clinic.clinic_name || clinic.name || '',
                email: clinic.email || '',
                phone: clinic.phone || '',
                website: clinic.website || '',
                street_address: clinic.street_address || clinic.address || '',
                neighbourhood: clinic.neighbourhood || '',
                city: clinic.city || '',
                postal_code: clinic.postal_code || '',
                country: clinic.country || '',
            });
            if (activeTab === 'members') {
                fetchMembers();
            }
        }
    }, [clinic, activeTab]);

    const fetchMembers = async () => {
        if (!clinic?.id && !clinic?.clinic_id) return;
        setMembersLoading(true);
        try {
            const res = await adminService.getClinicMembers(clinic.id || clinic.clinic_id);
            console.log(res.members);
            setMembers(res.members || []);
        } catch (error) {
            console.error('Failed to fetch members:', error);
            // toast.error('Failed to load members');
        } finally {
            setMembersLoading(false);
        }
    };

    const handleAddMember = async () => {
        if (!newMember.email) return;
        setLoading(true);
        try {
            await adminService.addUserToClinic(clinic.id || clinic.clinic_id, newMember.email, newMember.role);
            toast.success('Member added successfully');
            setNewMember(prev => ({ ...prev, email: '' }));
            fetchMembers();
        } catch (error) {
            console.error('Failed to add member:', error);
            toast.error(error.message || 'Failed to add member');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateMemberRole = async (userId, newRole) => {
        try {
            await adminService.updateUserClinicRole(userId, clinic.id || clinic.clinic_id, newRole);
            toast.success('Role updated successfully');
            fetchMembers();
        } catch (error) {
            console.error('Failed to update role:', error);
            toast.error('Failed to update role');
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!confirm('Remove this user from the clinic?')) return;
        setLoading(true);
        try {
            await adminService.removeUserFromClinic(userId, clinic.id || clinic.clinic_id);
            toast.success('Member removed successfully');
            fetchMembers();
        } catch (error) {
            console.error('Failed to remove member:', error);
            toast.error('Failed to remove member');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await adminService.updateClinic(clinic.id || clinic.clinic_id, formData);
            toast.success('Clinic updated successfully');
            onUpdate();
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to update clinic:', error);
            toast.error('Failed to update clinic');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClinic = async () => {
        if (!confirm('Are you sure you want to delete this clinic? This action cannot be undone and will delete all associated data.')) return;
        setLoading(true);
        try {
            await adminService.deleteClinic(clinic.id || clinic.clinic_id);
            toast.success('Clinic deleted successfully');
            onUpdate();
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to delete clinic:', error);
            toast.error('Failed to delete clinic');
        } finally {
            setLoading(false);
        }
    };

    const inputClassName = "flex border-1 border-gray-300 py-3 bg-white hover:border-[#7564ed] hover:border-2 focus:border-[#7564ed] focus:border-2 focus:outline-none focus:ring-0 transition-colors duration-200 h-12 text-base max-w-sm rounded-2xl px-3 w-full text-gray-900";

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-[40vw] max-w-3xl bg-white p-0 overflow-hidden border-0 rounded-2xl">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex-shrink-0 flex justify-between items-center">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-bold text-gray-900">Edit Clinic</DialogTitle>
                    </DialogHeader>
                    {/* Tabs */}
                    <div className="flex bg-gray-100 p-1 mx-5 rounded-xl">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'details' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Details
                        </button>
                        <button
                            onClick={() => setActiveTab('members')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'members' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Members
                        </button>
                    </div>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto max-h-[80vh] p-8">
                    {activeTab === 'details' ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Clinic Name <span className="text-red-500">*</span></label>
                                    <Input
                                        type="text"
                                        name="clinic_name"
                                        value={formData.clinic_name}
                                        onChange={handleChange}
                                        className={inputClassName}
                                        placeholder="Enter clinic name"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Email Address <span className="text-red-500">*</span></label>
                                    <Input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={inputClassName}
                                        placeholder="Enter email address"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                                    <Input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={inputClassName}
                                        placeholder="Enter phone number"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Website</label>
                                    <Input
                                        type="text"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        className={inputClassName}
                                        placeholder="Enter website URL"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Street Address</label>
                                <Input
                                    type="text"
                                    name="street_address"
                                    value={formData.street_address}
                                    onChange={handleChange}
                                    className={inputClassName}
                                    placeholder="Enter street address"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Neighbourhood</label>
                                    <Input
                                        type="text"
                                        name="neighbourhood"
                                        value={formData.neighbourhood}
                                        onChange={handleChange}
                                        className={inputClassName}
                                        placeholder="Enter neighbourhood"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">City</label>
                                    <Input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className={inputClassName}
                                        placeholder="Enter city"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Postal Code</label>
                                    <Input
                                        type="text"
                                        name="postal_code"
                                        value={formData.postal_code}
                                        onChange={handleChange}
                                        className={inputClassName}
                                        placeholder="Enter postal code"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Country</label>
                                    <Input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        className={inputClassName}
                                        placeholder="Enter country"
                                    />
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center justify-between pt-8 mt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={handleDeleteClinic}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 font-medium transition-colors"
                                >
                                    <Trash2 size={18} />
                                    Delete Clinic
                                </button>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => onOpenChange(false)}
                                        className="px-6 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="text-lg font-bold bg-[#EBE8FC] text-[#7564ed] hover:outline-[#7564ed] hover:outline-4 transition-all duration-150 px-3 py-2 rounded-2xl flex items-center min-w-[6vw]"
                                    >
                                        {loading ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6 min-w-full">
                            {/* Add Member Form */}
                            <div className="bg-gray-100 p-4 rounded-xl space-y-4">
                                <h3 className="font-semibold text-gray-900">Add New Member</h3>
                                <div className="flex w-full gap-3">
                                    <Input
                                        placeholder="User Email"
                                        value={newMember.email}
                                        onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                                        className="flex-1 min-w-full w-full bg-white"
                                    />
                                    <Select
                                        value={newMember.role}
                                        onValueChange={(value) => setNewMember(prev => ({ ...prev, role: value }))}
                                    >
                                        <SelectTrigger className="h-10 w-[180px] bg-[#f3f4f6] hover:bg-[#e5e7eb] border-0 focus:ring-0 text-gray-900 font-medium rounded-lg px-3 shadow-none">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="clinic_access">Clinic Access</SelectItem>
                                            <SelectItem value="assistant_access">Assistant Access</SelectItem>
                                            <SelectItem value="full_access">Full Access</SelectItem>
                                            <SelectItem value="limited_access">Limited Access</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        onClick={handleAddMember}
                                        disabled={loading || !newMember.email}
                                        className="bg-[#7564ed] hover:bg-[#6353d6]"
                                    >
                                        Add
                                    </Button>
                                </div>
                            </div>

                            {/* Members List */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-900">Current Members</h3>
                                {membersLoading ? (
                                    <p className="text-gray-500">Loading members...</p>
                                ) : members.length === 0 ? (
                                    <p className="text-gray-500">No members found.</p>
                                ) : (
                                    <div className="">
                                        {members.map((member) => (
                                            <div key={member.userId} className="flex items-center justify-between py-4 group">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={member.profilePhotoUrl} />
                                                        <AvatarFallback className="bg-gray-100 text-gray-600 font-medium">
                                                            {getInitials(member.firstName, member.lastName)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="flex items-center gap-3">
                                                            <p className="text-[15px] font-semibold text-gray-900">
                                                                {member.firstName} {member.lastName}
                                                            </p>
                                                            <p className="text-[14px] text-gray-500 font-normal">
                                                                {member.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Select
                                                        value={member.role}
                                                        onValueChange={(value) => handleUpdateMemberRole(member.userId, value)}
                                                    >
                                                        <SelectTrigger className="h-8 w-auto min-w-[120px] bg-[#f3f4f6] hover:bg-[#e5e7eb] border-0 focus:ring-0 text-gray-900 font-medium rounded-lg px-3 shadow-none">
                                                            <SelectValue placeholder="Select Role" />
                                                        </SelectTrigger>
                                                        <SelectContent className="z-[9999]">
                                                            <SelectItem value="admin">Admin</SelectItem>
                                                            <SelectItem value="full_access">Full Access</SelectItem>
                                                            <SelectItem value="clinic_access">Clinic Access</SelectItem>
                                                            <SelectItem value="assistant_access">Assistant Access</SelectItem>
                                                            <SelectItem value="limited_access">Limited Access</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <button
                                                        onClick={() => handleRemoveMember(member.userId)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600  rounded-lg transition-all "
                                                        title="Remove user"
                                                    >
                                                        <UserMinus className="w-6 h-6" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
