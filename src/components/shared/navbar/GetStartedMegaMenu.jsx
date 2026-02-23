'use client';

import React from 'react';
import { BookOpen, LayoutDashboard, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const GetStartedMegaMenu = ({ isOpen, onClose }) => {
    const router = useRouter();

    if (!isOpen) return null;

    const menuItems = [
        { id: 'account-customization', title: 'Account Customization', description: 'Setup your profile and clinic branding' },
        { id: 'patient-card-overview', title: 'Patient Card Overview', description: 'Manage patient data and uploads' },
        { id: 'panoramic-analysis', title: 'Panoramic Analysis', description: 'Master AI-driven radiographic reports' },
        { id: 'cbct-analysis', title: 'CBCT Analysis', description: 'Deep dive into 3D diagnostics' },
    ];

    const handleLinkClick = (id) => {
        router.push(`/getting-started?tab=${id}`);
        onClose();
    };

    return (
        <div
            className="absolute top-full left-0 right-0 mt-4 z-[100] animate-in fade-in slide-in-from-top-4 duration-300"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="mx-auto max-w-[70vw] bg-[#7c5cfc] rounded-3xl overflow-hidden shadow-2xl border border-white/20 relative group">
                {/* Decorative 3D-like icons */}
                <div className="absolute left-[-20px] top-[20%] w-40 h-40 bg-white/10 backdrop-blur-3xl rounded-full blur-3xl opacity-50"></div>
                <div className="absolute right-[-20px] bottom-[20%] w-40 h-40 bg-white/10 backdrop-blur-3xl rounded-full blur-3xl opacity-50"></div>

                {/* 3D Elements Placeholder Icons */}
                <div className="absolute left-10 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block">
                    <LayoutDashboard className="w-48 h-48 text-white" strokeWidth={0.5} />
                </div>

                <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block">
                    <img src="/XDENTAL.png" alt="" className="w-48 h-48 brightness-0 invert" />
                </div>

                <div className="relative z-10 p-8 lg:p-12 flex flex-col lg:flex-row gap-12">
                    {/* Left Column - Greeting & Action */}
                    <div className="flex-1 space-y-10">
                        <div className="flex items-center gap-3">
                            <img src="/XDENTAL.png" alt="Logo" className="w-10 h-10 brightness-0 invert" />
                            <span className="text-2xl font-bold text-white tracking-tight">XDental</span>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                                Hello. How can we help you?
                            </h2>
                            <p className="text-white/80 text-lg max-w-md">
                                Discover how XDent can transform your clinic's workflow with AI-driven diagnostics.
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            className="bg-white text-[#7c5cfc] border-none hover:bg-gray-100 rounded-full px-8 py-6 transition-all text-sm font-semibold shadow-lg group"
                            onClick={() => window.open('https://xdent.com', '_blank')}
                        >
                            Go to XDent.com
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>

                    {/* Right Column - Links */}
                    <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-6 lg:p-8 border border-white/10">
                        <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-white/70" />
                            Knowledge Base
                        </h3>

                        <div className="grid gap-4">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleLinkClick(item.id)}
                                    className="w-full text-left p-4 rounded-xl hover:bg-white/10 transition-colors group flex items-center justify-between"
                                >
                                    <div className="space-y-1">
                                        <p className="text-white font-semibold flex items-center gap-2">
                                            {item.title}
                                            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </p>
                                        <p className="text-white/60 text-xs">{item.description}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight className="w-4 h-4 text-white" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Tip */}
                <div className="bg-white/5 border-t border-white/10 p-4 px-12 text-center">
                    <p className="text-white/40 text-xs italic">
                        The features and capabilities demonstrated may vary by region based on regulatory approvals.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GetStartedMegaMenu;
