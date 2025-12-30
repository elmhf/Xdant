import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Edit, Trash2, Ban, ShieldCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { User } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const PasswordCell = ({ password }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className="flex items-center gap-2 cursor-pointer py-1"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <span className="text-base font-medium text-gray-700 min-w-[80px] transition-all duration-200">
                {isVisible ? password : '••••••••'}
            </span>
        </div>
    );
};

const UsersTable = ({
    users,
    sorting,
    onSort,
    onEditUser,
    onDeleteUser,
    onBanUser,
    onUnbanUser,
    onViewBanDetails,
    loading
}) => {
    const [viewingImage, setViewingImage] = useState(null);

    return (
        <>
            <div className="border border-gray-200 rounded-2xl overflow-x-auto">
                <div className="max-h-[85vh] overflow-y-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100/70 border-b border-gray-200 sticky top-0 z-10 filter backdrop-blur-sm">
                            <tr>
                                <th
                                    className="min-w-80 text-left py-3 px-6 text-md font-medium text-gray-500 cursor-pointer hover:bg-gray-100/50 transition-colors"
                                    onClick={() => onSort && onSort('name')}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>User name</span>
                                        {onSort && (
                                            <div className="flex flex-col">
                                                <ChevronUp className="w-3 h-3 text-gray-400" />
                                                <ChevronDown className="w-3 h-3 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                </th>

                                <th className="min-w-64 text-left py-3 px-6 text-md font-medium text-gray-500 hidden lg:table-cell">
                                    Contact
                                </th>

                                <th className="min-w-32 text-left py-3 px-6 text-md font-medium text-gray-500">
                                    Status
                                </th>

                                <th className="min-w-56 text-left py-3 px-6 text-md font-medium text-gray-500 hidden md:table-cell">
                                    Password
                                </th>

                                <th className="min-w-40 text-left py-3 px-6 text-md font-medium text-gray-500 hidden lg:table-cell">
                                    Signature
                                </th>

                                <th className="min-w-32 text-center py-3 px-6 text-md font-medium text-gray-500">

                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                // Simple Loading skeleton matching table structure
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse border-b border-gray-100">
                                        <td className="min-w-80 py-4 px-4"><div className="h-12 w-48 bg-gray-100 rounded-3xl"></div></td>
                                        <td className="min-w-64 py-4 px-4 hidden lg:table-cell"><div className="h-4 w-32 bg-gray-100 rounded"></div></td>
                                        <td className="min-w-32 py-4 px-4"><div className="h-6 w-20 bg-gray-100 rounded-full"></div></td>
                                        <td className="min-w-56 py-4 px-4 hidden md:table-cell"><div className="h-8 w-24 bg-gray-100 rounded-full"></div></td>
                                        <td className="min-w-40 py-4 px-4 hidden lg:table-cell"><div className="h-6 w-16 bg-gray-100 rounded-full"></div></td>
                                        <td className="min-w-32 py-4 px-4"><div className="h-8 w-8 bg-gray-100 rounded-lg mx-auto"></div></td>
                                    </tr>
                                ))
                            ) : users && users.length > 0 ? (
                                users.map((user, index) => (
                                    <tr
                                        key={user.user_id || index}
                                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                                        onClick={() => onEditUser(user)}
                                    >
                                        <td className="min-w-80 py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (user.profilePhotoUrl) {
                                                            setViewingImage({
                                                                url: user.profilePhotoUrl,
                                                                title: 'Profile Photo',
                                                                alt: `${user.firstName} ${user.lastName}`
                                                            });
                                                        }
                                                    }}
                                                >
                                                    <Avatar className="h-12 w-12 rounded-3xl">
                                                        <AvatarImage src={user.profilePhotoUrl} />
                                                        <AvatarFallback className="bg-gradient-to-br from-[#A196F3] to-[#7564ED] text-white text-sm font-semibold">
                                                            {((user.firstName?.[0] || '') + (user.lastName?.[0] || '')).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-base font-medium text-gray-900 truncate">
                                                        {user.firstName} {user.lastName}
                                                    </span>
                                                    <span className="text-xs text-gray-400 font-light hidden sm:block">
                                                        ID: {user.user_id}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="min-w-64 py-4 px-4 hidden lg:table-cell">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-base font-medium text-gray-600 truncate max-w-[200px]" title={user.email}>
                                                    {user.email}
                                                </span>
                                                <span className="text-sm text-gray-400">
                                                    {user.phone || '-'}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="min-w-32 py-4 px-4">
                                            {user.is_banned ? (
                                                <div
                                                    className={cn(
                                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border border-transparent transition-all cursor-pointer shadow-sm",
                                                        user.ban_type === 'TEMPORARY'
                                                            ? "bg-orange-500 text-white hover:bg-orange-600"
                                                            : "bg-red-600 text-white hover:bg-red-700"
                                                    )}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onViewBanDetails && onViewBanDetails(user);
                                                    }}
                                                >
                                                    {user.ban_type === 'TEMPORARY' ? (
                                                        <>
                                                            <Clock className="w-6 h-6" />
                                                            <span>Tempo</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Ban className="w-6 h-6" />
                                                            <span>Banned</span>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-indigo-600 text-white border border-transparent shadow-sm">
                                                    <ShieldCheck className="w-6 h-6" />
                                                    <span>Active</span>
                                                </div>
                                            )}
                                        </td>

                                        <td className="min-w-56 py-4 px-4 hidden md:table-cell">
                                            <PasswordCell className="w-6 h-6" password={user.password} />
                                        </td>

                                        <td className="min-w-40 py-4 px-4 hidden lg:table-cell">
                                            {user.personalSignature ? (
                                                <Button
                                                    variant="ghost"
                                                    className="text-[#7564ed] hover:bg-[#7564ed]/10 p-0 h-auto font-medium"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setViewingImage({
                                                            url: user.personalSignature,
                                                            title: 'User Signature',
                                                            alt: 'Signature'
                                                        });
                                                    }}
                                                >
                                                    View Signature
                                                </Button>
                                            ) : (
                                                <span className="text-sm text-gray-400">-</span>
                                            )}
                                        </td>

                                        <td className="min-w-32 py-4 px-4">
                                            <td className="min-w-32 py-4 px-4">
                                                <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-400 hover:text-indigo-600 rounded-lg transition-colors"
                                                        onClick={() => onEditUser(user)}
                                                        title="Edit User"
                                                    >
                                                        <Edit className="h-6 w-6 stroke-2" />
                                                    </Button>

                                                    {user.is_banned ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-gray-400 hover:text-[#7564ed] rounded-lg transition-colors"
                                                            onClick={() => onUnbanUser(user)}
                                                            title="Restore Access"
                                                        >
                                                            <ShieldCheck className="h-6 w-6 stroke-2" />
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-gray-400 hover:text-[#7564ed] rounded-lg transition-colors"
                                                            onClick={() => onBanUser(user)}
                                                            title="Ban User"
                                                        >
                                                            <Ban className="h-6 w-6 stroke-2" />
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-400 hover:text-[#7564ed] rounded-lg transition-colors"
                                                        onClick={() => onDeleteUser(user)}
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="h-6 w-6 stroke-2" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="">
                                        <Empty>
                                            <EmptyHeader>
                                                <EmptyMedia variant="icon">
                                                    <User className="h-10 w-10 text-gray-400" />
                                                </EmptyMedia>

                                                <EmptyTitle className="text-xl font-semibold">
                                                    No users found
                                                </EmptyTitle>

                                                <EmptyDescription className="text-gray-600 text-base">
                                                    No users match your search criteria.
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

            <Dialog open={!!viewingImage} onOpenChange={(open) => !open && setViewingImage(null)}>
                <DialogContent className="max-w-2xl bg-white">
                    <DialogHeader>
                        <DialogTitle>{viewingImage?.title}</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center p-4 bg-white rounded-xl border border-dashed border-gray-200 min-h-[200px]">
                        {viewingImage?.url ? (
                            <img
                                src={viewingImage.url}
                                alt={viewingImage.alt}
                                className="max-w-full max-h-[400px] object-contain"
                            />
                        ) : (
                            <div className="text-gray-400">No image loaded</div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default UsersTable;
