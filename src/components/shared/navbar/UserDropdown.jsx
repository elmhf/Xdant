'use client';

import React, { useMemo, useCallback } from 'react';
import { apiClient } from "@/utils/apiClient";
import { useRouter } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  ChevronDown, LogOut, Settings, Smartphone, User, Check, ChevronRight, ArrowLeft, Building2, Loader2, AlertTriangle, UserRound
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import clsx from 'clsx';
import useUserStore from '@/components/features/profile/store/userStore';
import { useTranslation } from 'react-i18next';

export default function ProfileDropdown() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [showSwitch, setShowSwitch] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Get real data from userStore with memoization
  const userInfo = useUserStore(state => state.userInfo);
  const clinicsInfo = useUserStore(state => state.clinicsInfo);
  const currentClinicId = useUserStore(state => state.currentClinicId);
  const setCurrentClinicId = useUserStore(state => state.setCurrentClinicId);
  const getCurrentClinic = useUserStore(state => state.getCurrentClinic);

  // Memoize computed values
  const realUser = useMemo(() => userInfo || {}, [userInfo]);
  const realClinics = useMemo(() => clinicsInfo || [], [clinicsInfo]);
  const realCurrentClinicId = useMemo(() => currentClinicId, [currentClinicId]);
  const currentCompany = useMemo(() =>
    realClinics.find((c) => c.id === realCurrentClinicId),
    [realClinics, realCurrentClinicId]
  );

  // Set loading to false when data is available
  React.useEffect(() => {
    if (userInfo || clinicsInfo) {
      setIsLoading(false);
    }
  }, [userInfo, clinicsInfo]);

  // Load images to cache when data changes
  React.useEffect(() => {
    if (userInfo?.profilePhotoUrl) {
      useUserStore.getState().loadImage(userInfo.profilePhotoUrl).catch(console.error);
    }

    if (clinicsInfo && clinicsInfo.length > 0) {
      clinicsInfo.forEach(clinic => {
        const logoUrl = clinic.logoUrl || clinic.logo_url;
        if (logoUrl) {
          useUserStore.getState().loadImage(logoUrl).catch(console.error);
        }
      });
    }
  }, [userInfo?.profilePhotoUrl, clinicsInfo]);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await apiClient('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/login');
    } finally {
      setLoggingOut(false);
    }
  }, [router]);

  const renderUserAvatar = useCallback((userObj, size = "h-11 w-11", Chevron = true) => {
    const getImageFromCache = useUserStore.getState().getImageFromCache;
    const getImageLoadingState = useUserStore.getState().getImageLoadingState;
    const profilePhotoUrl = userObj?.profilePhotoUrl;
    const imageLoadingState = profilePhotoUrl ? getImageLoadingState(profilePhotoUrl) : null;

    return (
      <div className="relative inline-block  cursor-pointer">
        <Avatar className={size}>
          {profilePhotoUrl && !imageLoadingState?.isLoading ? (
            <img
              src={getImageFromCache(profilePhotoUrl)?.src || profilePhotoUrl}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : profilePhotoUrl && imageLoadingState?.isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          ) : (
            <AvatarFallback>
              {userObj?.name?.charAt(0)?.toUpperCase() || <UserRound />}
            </AvatarFallback>
          )}
        </Avatar>

        {/* ↓↓↓ الـ icon متاع السهم ↓↓↓ */}
        {Chevron && <div className="absolute bottom-0.5 right-0.5 translate-y-1/4 translate-x-1/4 bg-gray-300 rounded-full p-[2px] shadow-md">
          <ChevronDown className="w-3.5 h-3.5 text-gray-700 stroke-4" />
        </div>}
      </div>


    );
  }, []);

  const renderCompanyAvatar = useCallback((companyObj, size = "h-8 w-8") => {
    const getImageFromCache = useUserStore.getState().getImageFromCache;
    const getImageLoadingState = useUserStore.getState().getImageLoadingState;
    const logoUrl = companyObj?.logoUrl || companyObj?.logo_url;
    const clinicName = companyObj?.clinic_name || companyObj?.clinicName || companyObj?.name;
    const imageLoadingState = logoUrl ? getImageLoadingState(logoUrl) : null;

    return (
      <Avatar className={size}>
        {logoUrl && !imageLoadingState?.isLoading ? (
          <img
            src={getImageFromCache(logoUrl)?.src || logoUrl}
            alt="Clinic Logo"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : logoUrl && imageLoadingState?.isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          </div>
        ) : null}
        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-400 text-white text-sm font-medium">
          {clinicName
            ? clinicName.split(' ').map(n => n[0]).join('').slice(0, 2)
            : companyObj?.email?.[0]?.toUpperCase() || "?"}
        </AvatarFallback>
      </Avatar>
    );
  }, []);

  const fullName = useMemo(() =>
    realUser?.firstName && realUser?.lastName
      ? `${realUser.firstName} ${realUser.lastName}`
      : realUser?.email || t('common.user'),
    [realUser, t]
  );

  return (
    <div className="flex items-center justify-center">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          {/* <Button className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-md shadow-sm "> */}
          {renderUserAvatar(realUser)}
          {/* <div className="flex flex-col items-start  sm:flex">
              <span className="text-xs sm:text-sm font-semibold text-[#0d0c22]">{fullName}</span>
              <span className="text-xs text-gray-500">
                {isLoading ? 'Chargement...' : (currentCompany?.clinic_name || currentCompany?.clinicName || currentCompany?.name || 'Aucune clinique')}
              </span>
            </div> */}
          {/* <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 ml-1" /> */}
          {/* </Button> */}
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-72 sm:w-80 p-0 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          {!showSwitch ? (
            <>
              {/* User Account Section - ثابت */}
              <div onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push('/profile');
                setOpen(false);
              }} className="px-2 py-2 border-b cursor-pointer border-gray-100">
                <div className="flex items-center gap-3  p-2 overflow-hidden rounded-md hover:bg-gray-100">
                  {renderUserAvatar(realUser, "h-10 w-10 sm:h-12 sm:w-12", false)}
                  <div className="flex flex-col flex-1">
                    <span className="text-sm sm:text-base font-semibold text-[#0d0c22]">{fullName}</span>
                    <span className="text-xs sm:text-sm text-gray-500">{realUser?.email}</span>
                  </div>
                </div>
              </div>

              {/* Current Clinic Section */}
              {currentCompany && (
                <div onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push('/company');
                  setOpen(false);
                }} className="px-2 py-2 border-b cursor-pointer border-gray-100">
                  <div className="flex items-center gap-3  p-2 overflow-hidden rounded-md hover:bg-gray-100 ">
                    {renderCompanyAvatar(currentCompany, "h-10 w-10 sm:h-12 sm:w-12")}
                    <div className="flex flex-col flex-1">
                      <span className="text-sm sm:text-base font-semibold text-[#0d0c22]">
                        {currentCompany.clinic_name || currentCompany.clinicName || currentCompany.name}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500">
                        {currentCompany.address || currentCompany.location || currentCompany.email || t('common.addressUnavailable')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">{t('common.currentClinic')}</div>
                </div>
              )}

              {/* Menu Items */}
              <div className="p-2  ">
                {/* Switch Company */}
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowSwitch(true);
                  }}
                  className="flex items-center gap-3 px-4 py-3 mx-0 p-2 overflow-hidden rounded-md hover:bg-gray-100 cursor-pointer border-none group"
                >
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700 flex-1 ">{t('common.switchClinic')}</span>
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>


                {/* Logout */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-3 px-4 py-3 mx-0 hover:bg-gray-100 cursor-pointer border-none"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                    {loggingOut ? t('common.loading') : t('common.logout')}
                  </span>
                </DropdownMenuItem>
              </div>
            </>
          ) : (
            <>
              {/* Switch Clinic Header */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowSwitch(false);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-2xl transition-colors"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                </button>
                <span className="text-sm sm:text-base font-semibold text-[#0d0c22]">{t('common.switchClinic')}</span>
              </div>

              {/* Clinics List */}
              <div className="py-2 max-h-80 overflow-y-auto">
                {isLoading ? (
                  <div className="px-4 py-6 text-center">
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    <p className="text-xs sm:text-sm text-gray-500">{t('common.loadingClinics')}</p>
                  </div>
                ) : realClinics.length > 0 ? (
                  realClinics.map(clinic => (
                    <div
                      key={clinic.id}
                      className={clsx(
                        "flex items-center gap-2 sm:gap-3 px-4 py-3 cursor-pointer transition-colors",
                        realCurrentClinicId === clinic.id
                          ? "bg-blue-50 hover:bg-blue-100"
                          : "hover:bg-gray-50"
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentClinicId(clinic.id);
                        setShowSwitch(false);
                      }}
                    >
                      {renderCompanyAvatar(clinic, "h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0")}
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-xs sm:text-sm font-semibold text-[#0d0c22] truncate">
                          {clinic.clinic_name || clinic.clinicName || clinic.name}
                        </span>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs text-gray-500 truncate flex-1">
                            {clinic.address || clinic.location || clinic.email || t('common.addressUnavailable')}
                          </span>
                          <span className={clsx(
                            "text-xs px-2 py-0.5 rounded-full flex-shrink-0",
                            clinic.role === 'owner' || clinic.role === 'admin'
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          )}>
                            {clinic.role === 'owner' || clinic.role === 'admin' ? t('common.admin') : t('common.member')}
                          </span>
                        </div>
                      </div>
                      {realCurrentClinicId === clinic.id && (
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center">
                    <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs sm:text-sm text-gray-500 mb-2">{t('common.noClinicsFound')}</p>
                    <p className="text-xs text-gray-400">{t('common.noClinicsFoundDesc')}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}