"use client";

import React, { useState } from 'react';
import GettingStartedSidebar from '@/components/features/getting-started/GettingStartedSidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';


const AccountCustomizationContent = ({ t }) => (
    <div className="space-y-8">
        <div>
            <p className="text-3xl font-bold text-[#1e3a5a] mb-4">{t('gettingStarted.content.accountCustomization.title')}</p>
            <p className="text-xl text-[#334e68] leading-relaxed">
                {t('gettingStarted.content.accountCustomization.description')}
            </p>
        </div>

        <section>
            <h2 className="text-md font-bold text-[#1e3a5a] mb-4">{t('gettingStarted.content.accountCustomization.accessingSettings.title')}</h2>
            <ol className="list-decimal ml-8 space-y-3 text-[#334e68]">
                <li><span className="font-bold text-[#1e3a5a]">{t('gettingStarted.content.accountCustomization.accessingSettings.step1.label')}</span> {t('gettingStarted.content.accountCustomization.accessingSettings.step1.text')}</li>
                <li><span className="font-bold text-[#1e3a5a]">{t('gettingStarted.content.accountCustomization.accessingSettings.step2.label')}</span> {t('gettingStarted.content.accountCustomization.accessingSettings.step2.text')}</li>
            </ol>
        </section>

        <section>
            <h2 className="text-md font-bold text-[#1e3a5a] mb-4">{t('gettingStarted.content.accountCustomization.profileSettings.title')}</h2>
            <p className="text-[#334e68] mb-3">{t('gettingStarted.content.accountCustomization.profileSettings.desc')}</p>
            <ul className="list-disc ml-8 space-y-3 text-[#334e68]">
                <li><span className="font-bold text-[#1e3a5a]">{t('gettingStarted.content.accountCustomization.profileSettings.step1.label')}</span> {t('gettingStarted.content.accountCustomization.profileSettings.step1.text')}</li>
                <li><span className="font-bold text-[#1e3a5a]">{t('gettingStarted.content.accountCustomization.profileSettings.step2.label')}</span> {t('gettingStarted.content.accountCustomization.profileSettings.step2.text')}</li>
                <li><span className="font-bold text-[#1e3a5a]">{t('gettingStarted.content.accountCustomization.profileSettings.step3.label')}</span> {t('gettingStarted.content.accountCustomization.profileSettings.step3.text')}</li>
            </ul>
        </section>

        <section>
            <h2 className="text-md font-bold text-[#1e3a5a] mb-4">{t('gettingStarted.content.accountCustomization.clinicSettings.title')}</h2>
            <p className="text-[#334e68] mb-4">{t('gettingStarted.content.accountCustomization.clinicSettings.desc')}</p>

            <div className="space-y-6 ml-4">
                <div>
                    <h3 className="font-bold text-[#1e3a5a] mb-2 text-md">{t('gettingStarted.content.accountCustomization.clinicSettings.info.title')}</h3>
                    <ul className="list-disc ml-8 space-y-2 text-[#334e68]">
                        <li><span className="font-bold text-[#1e3a5a]">{t('gettingStarted.content.accountCustomization.clinicSettings.info.step1.label')}</span> {t('gettingStarted.content.accountCustomization.clinicSettings.info.step1.text')}</li>
                        <li><span className="font-bold text-[#1e3a5a]">{t('gettingStarted.content.accountCustomization.clinicSettings.info.step2.label')}</span> {t('gettingStarted.content.accountCustomization.clinicSettings.info.step2.text')}</li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-bold text-[#1e3a5a] mb-2 text-md">{t('gettingStarted.content.accountCustomization.clinicSettings.team.title')}</h3>
                    <ul className="list-disc ml-8 space-y-3 text-[#334e68]">
                        <li><span className="font-bold text-[#1e3a5a]">{t('gettingStarted.content.accountCustomization.clinicSettings.team.step1.label')}</span> {t('gettingStarted.content.accountCustomization.clinicSettings.team.step1.text')}</li>
                        <li>
                            <span className="font-bold text-[#1e3a5a]">{t('gettingStarted.content.accountCustomization.clinicSettings.team.levels.label')}</span>
                            <ul className="list-circle ml-8 mt-2 space-y-1 text-[#4a6572]">
                                <li>{t('gettingStarted.content.accountCustomization.clinicSettings.team.levels.full')}</li>
                                <li>{t('gettingStarted.content.accountCustomization.clinicSettings.team.levels.clinical')}</li>
                                <li>{t('gettingStarted.content.accountCustomization.clinicSettings.team.levels.limited')}</li>
                                <li>{t('gettingStarted.content.accountCustomization.clinicSettings.team.levels.nonclinical')}</li>
                            </ul>
                        </li>
                        <li><span className="font-bold text-[#1e3a5a]">{t('gettingStarted.content.accountCustomization.clinicSettings.team.step2.label')}</span> {t('gettingStarted.content.accountCustomization.clinicSettings.team.step2.text')}</li>
                    </ul>
                </div>

            </div>

            <p className="mt-8 text-[#1e3a5a] font-bold italic">
                By customizing these settings, XDent becomes a tailored solution that fits seamlessly into your clinic's workflow.
            </p>
        </section>
    </div>
);

const PatientCardOverviewContent = ({ t }) => (
    <div className="space-y-8">
        <div>
            <p className="text-3xl font-bold text-[#1e3a5a] mb-4">{t('gettingStarted.content.patientCardOverview.title')}</p>
            <p className="text-xl text-[#334e68] leading-relaxed">
                {t('gettingStarted.content.patientCardOverview.description')}
            </p>
        </div>

        <section>
            <h2 className="text-md font-bold text-[#1e3a5a] mb-4">{t('gettingStarted.content.patientCardOverview.uploading2D.title')}</h2>
            <p className="text-[#334e68] mb-3">{t('gettingStarted.content.patientCardOverview.uploading2D.desc')}</p>
            <ol className="list-decimal ml-8 space-y-3 text-[#334e68]">
                <li><span className="font-bold text-[#1e3a5a]">{t('gettingStarted.content.patientCardOverview.uploading2D.step1.label')}</span> {t('gettingStarted.content.patientCardOverview.uploading2D.step1.text')}</li>
                <li><span className="font-bold text-[#1e3a5a]">{t('gettingStarted.content.patientCardOverview.uploading2D.step2.label')}</span> {t('gettingStarted.content.patientCardOverview.uploading2D.step2.text')}</li>
            </ol>
            <p className="mt-6 font-bold text-[#1e3a5a]">
                {t('gettingStarted.content.patientCardOverview.uploading2D.footer')}
            </p>
        </section>
    </div>
);

const PanoramicAnalysisContent = ({ t }) => (
    <div className="space-y-8">
        <div>
            <p className="text-3xl font-bold text-[#1e3a5a] mb-4">{t('gettingStarted.content.panoramicAnalysis.title')}</p>
            <p className="text-xl text-[#334e68] leading-relaxed">
                {t('gettingStarted.content.panoramicAnalysis.description')}
            </p>
        </div>



        <section>
            <h2 className="text-md font-bold text-[#1e3a5a] mb-4"> {t('gettingStarted.content.panoramicAnalysis.smartChart.title')}</h2>
            <p className="text-[#334e68] mb-3">{t('gettingStarted.content.panoramicAnalysis.smartChart.colorCodes')}</p>
            <ul className="list-disc ml-8 space-y-2 text-[#334e68]">
                <li><span className="font-bold text-[#1e3a5a]">{t('gettingStarted.content.panoramicAnalysis.smartChart.healthy')}</span></li>
                <li><span className="font-bold text-[#1e3a5a] italic">{t('gettingStarted.content.panoramicAnalysis.smartChart.treated')}</span></li>
                <li><span className="font-bold text-red-600">{t('gettingStarted.content.panoramicAnalysis.smartChart.pathology')}</span></li>
                <li><span className="font-bold text-[#1e3a5a]">{t('gettingStarted.content.panoramicAnalysis.smartChart.missing')}</span></li>
                <li><span className="font-bold text-red-400">{t('gettingStarted.content.panoramicAnalysis.smartChart.periodontal')}</span></li>
            </ul>
        </section>

        <section>
            <h2 className="text-md font-bold text-[#1e3a5a] mb-4">{t('gettingStarted.content.panoramicAnalysis.toothCards.title')}</h2>
            <p className="text-[#334e68] mb-3">{t('gettingStarted.content.panoramicAnalysis.toothCards.summary')}</p>
            <ul className="list-disc ml-8 space-y-2 text-[#334e68]">
                <li>{t('gettingStarted.content.panoramicAnalysis.toothCards.detected')}</li>
                <li>{t('gettingStarted.content.panoramicAnalysis.toothCards.severity')}</li>
            </ul>
            <p className="mt-4 text-[#1e3a5a] font-bold">{t('gettingStarted.content.panoramicAnalysis.toothCards.indicators')}</p>
            <p className="text-[#334e68]"><span className="text-red-600 font-bold">{t('gettingStarted.content.panoramicAnalysis.toothCards.pathologyLabel')}</span> | <span className="text-purple-600 font-bold">{t('gettingStarted.content.panoramicAnalysis.toothCards.priorLabel')}</span></p>
        </section>

        <section>
            <h2 className="text-md font-bold text-[#1e3a5a] mb-4">{t('gettingStarted.content.panoramicAnalysis.finalizing.title')}</h2>
            <ul className="list-disc ml-8 space-y-3 text-[#334e68]">
                <li>{t('gettingStarted.content.panoramicAnalysis.finalizing.approve')}</li>
                <li>{t('gettingStarted.content.panoramicAnalysis.finalizing.select')}</li>
                <li>{t('gettingStarted.content.panoramicAnalysis.finalizing.conclusions')}</li>
            </ul>
        </section>
    </div>
);

const CBCTAnalysisContent = ({ t }) => (
    <div className="space-y-8">
        <div>
            <p className="text-3xl font-bold text-[#1e3a5a] mb-4">{t('gettingStarted.content.cbctAnalysis.title')}</p>
            <p className="text-xl text-[#334e68] leading-relaxed">
                {t('gettingStarted.content.cbctAnalysis.description')}
            </p>
        </div>

        <section>
            <h2 className="text-md font-bold text-[#1e3a5a] mb-4">{t('gettingStarted.content.cbctAnalysis.accessing.title')}</h2>
            <ul className="list-disc ml-8 space-y-4 text-[#334e68]">
                <li><span className="font-bold text-[#1e3a5a]">{t('gettingStarted.content.cbctAnalysis.accessing.step1.label')}</span> {t('gettingStarted.content.cbctAnalysis.accessing.step1.text')}</li>
                <li><span className="font-bold text-[#1e3a5a]">{t('gettingStarted.content.cbctAnalysis.accessing.step2.label')}</span> {t('gettingStarted.content.cbctAnalysis.accessing.step2.text')}</li>
                <li><span className="font-bold text-[#1e3a5a]">{t('gettingStarted.content.cbctAnalysis.accessing.step3.label')}</span> {t('gettingStarted.content.cbctAnalysis.accessing.step3.text')}</li>
            </ul>
        </section>



        <section>
            <h2 className="text-md font-bold text-[#1e3a5a] mb-4">{t('gettingStarted.content.cbctAnalysis.formula.title')}</h2>
            <p className="text-[#334e68] mb-4">{t('gettingStarted.content.cbctAnalysis.formula.desc')}</p>
            <ul className="list-disc ml-8 space-y-3 text-[#334e68]">
                <li><span className="font-bold text-[#1e3a5a]">{t('gettingStarted.content.cbctAnalysis.formula.healthy')}</span></li>
                <li><span className="font-bold text-[#1e3a5a]">{t('gettingStarted.content.cbctAnalysis.formula.treated')}</span></li>
                <li><span className="font-bold text-[#1e3a5a]">{t('gettingStarted.content.cbctAnalysis.formula.unhealthy')}</span></li>
                <li><span className="font-bold text-[#1e3a5a]">{t('gettingStarted.content.cbctAnalysis.formula.missing')}</span></li>
            </ul>
        </section>
    </div>
);

export default function GettingStartedPage() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('account-customization');

    const videoMap = {
        'account-customization': 'h2Diys9v-Hk',
        'patient-card-overview': 'y6k9fe__Y9o',
        'panoramic-analysis': '',
        'cbct-analysis': '',
    };

    const renderContent = () => {
        const props = { t };
        switch (activeTab) {
            case 'account-customization':
                return <AccountCustomizationContent {...props} />;
            case 'patient-card-overview':
                return <PatientCardOverviewContent {...props} />;
            case 'panoramic-analysis':
                return <PanoramicAnalysisContent {...props} />;
            case 'cbct-analysis':
                return <CBCTAnalysisContent {...props} />;
            default:
                return <AccountCustomizationContent {...props} />;
        }
    };

    const tabsOrder = ['account-customization', 'patient-card-overview', 'panoramic-analysis', 'cbct-analysis'];
    const currentIndex = tabsOrder.indexOf(activeTab);

    return (
        <div className="flex mt-20 h-[calc(100vh-120px)] bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <GettingStartedSidebar activeId={activeTab} onSelect={setActiveTab} />

            <main className="flex-1 overflow-y-auto p-8 lg:p-12">
                <div className="max-w-4xl mx-auto space-y-10 pb-20">
                    {/* Redundant HeroBanner removed */}

                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-sm text-[#5b59d6] transition-opacity duration-300">
                        <span className="hover:underline cursor-pointer opacity-70">{t('gettingStarted.breadcrumb')}</span>
                        <ChevronRight className="w-4 h-4 opacity-40 shrink-0" />
                        <span className="font-medium text-[#7c5cfc]">
                            {t(`gettingStarted.menu.${activeTab.replace(/-([a-z])/g, (g) => g[1].toUpperCase())}`)}
                        </span>
                    </nav>

                    {renderContent()}

                    {/* Footer / Video Player */}
                    <div className="relative rounded-3xl overflow-hidden bg-gray-100 aspect-video shadow-2xl group border-[8px] border-white ring-1 ring-gray-200">
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${videoMap[activeTab]}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                        <div className="absolute inset-0 bg-blue-900/10 pointer-events-none group-hover:bg-transparent transition-colors"></div>
                    </div>

                    <div className="pt-10 border-t border-gray-100">
                        <p className="text-xs text-gray-400 italic leading-relaxed">
                            *The features and capabilities demonstrated in this video may not be available or approved for use in all regions. Regulatory clearance or approval varies by country. To confirm availability and compliance in your region, please contact our sales team.
                        </p>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-center gap-6 pt-8 pb-12">
                        <Button
                            variant="ghost"
                            disabled={currentIndex === 0}
                            onClick={() => setActiveTab(tabsOrder[currentIndex - 1])}
                            className="text-blue-600 font-bold flex items-center gap-2 hover:bg-blue-50 px-6 py-6 rounded-2xl disabled:opacity-30"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            {t('gettingStarted.buttons.goBack')}
                        </Button>
                        <span className="text-gray-300 font-light">/</span>
                        <Button
                            variant="ghost"
                            disabled={currentIndex === tabsOrder.length - 1}
                            onClick={() => setActiveTab(tabsOrder[currentIndex + 1])}
                            className="text-blue-600 font-bold flex items-center gap-2 hover:bg-blue-50 px-6 py-6 rounded-2xl disabled:opacity-30"
                        >
                            {t('gettingStarted.buttons.goNext')}
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
