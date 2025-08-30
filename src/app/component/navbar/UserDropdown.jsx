'use client';

import React, { useMemo, useCallback } from 'react';
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
import { ChevronDown, LogOut, Settings, Smartphone, User, Check, ChevronRight, ArrowLeft, Building2, Loader2, AlertTriangle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import clsx from 'clsx';
import useUserStore from '../profile/store/userStore';

export default function ProfileDropdown() {
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
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/login');
    } finally {
      setLoggingOut(false);
    }
  }, [router]);

  const renderUserAvatar = useCallback((userObj, size = "h-8 w-8") => {
    const getImageFromCache = useUserStore.getState().getImageFromCache;
    const getImageLoadingState = useUserStore.getState().getImageLoadingState;
    const profilePhotoUrl = userObj?.profilePhotoUrl;
    const imageLoadingState = profilePhotoUrl ? getImageLoadingState(profilePhotoUrl) : null;
    
    return (
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
        ) : null}
        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-sm font-medium">
          {userObj.firstName && userObj.lastName
            ? userObj.firstName[0] + userObj.lastName[0]
            : userObj.name 
              ? userObj.name.split(' ').map(n => n[0]).join('').slice(0, 2)
              : userObj.email?.[0]?.toUpperCase() || "?"}
        </AvatarFallback>
      </Avatar>
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
      : realUser?.email || "Utilisateur",
    [realUser]
  );

  return (
    <div className="flex items-center justify-center bg-gray-100">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-200 rounded-2xl shadow-sm hover:bg-gray-50 transition-all hover:shadow-md">
            {renderUserAvatar(realUser)}
            <div className="flex flex-col items-start hidden sm:flex">
              <span className="text-xs sm:text-sm font-semibold text-gray-900">{fullName}</span>
              <span className="text-xs text-gray-500">
                {isLoading ? 'Chargement...' : (currentCompany?.clinic_name || currentCompany?.clinicName || currentCompany?.name || 'Aucune clinique')}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 ml-1" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-72 sm:w-80 p-0 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          {!showSwitch ? (
            <>
              {/* User Account Section - ثابت */}
              <div onClick={() => { router.push('/profile'); setOpen(false); }} className="px-4 py-4 border-b cursor-pointer border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  {renderUserAvatar(realUser, "h-10 w-10 sm:h-12 sm:w-12")}
                  <div className="flex flex-col flex-1">
                    <span className="text-sm sm:text-base font-semibold text-gray-900">{fullName}</span>
                    <span className="text-xs sm:text-sm text-gray-500">{realUser?.email}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 mb-2">Personal Account</div>
              </div>

              {/* Current Clinic Section */}
              {currentCompany && (
                <div onClick={() => { router.push('/company'); setOpen(false); }} className="px-4 py-4 border-b cursor-pointer border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    {renderCompanyAvatar(currentCompany, "h-8 w-8 sm:h-10 sm:w-10")}
                    <div className="flex flex-col flex-1">
                      <span className="text-xs sm:text-sm font-semibold text-gray-900">
                        {currentCompany.clinic_name || currentCompany.clinicName || currentCompany.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {currentCompany.address || currentCompany.location || currentCompany.email || "Adresse non disponible"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">Clinique actuelle</div>
                </div>
              )}

              {/* Menu Items */}
              <div className="py-2">
                {/* Switch Company */}
                <div 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowSwitch(true);
                  }}
                  className="flex items-center gap-3 px-4 py-3 mx-0 hover:bg-gray-50 cursor-pointer border-none group"
                >
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700 flex-1">Changer de clinique</span>
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>


                {/* Logout */}
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  disabled={loggingOut}
                  className="flex items-center gap-3 px-4 py-3 mx-0 hover:bg-gray-50 cursor-pointer border-none"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                    {loggingOut ? 'Logging out…' : 'Log out'}
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
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                </button>
                <span className="text-sm sm:text-base font-semibold text-gray-900">Changer de clinique</span>
              </div>

              {/* Clinics List */}
              <div className="py-2 max-h-80 overflow-y-auto">
                {isLoading ? (
                  <div className="px-4 py-6 text-center">
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    <p className="text-xs sm:text-sm text-gray-500">Chargement des cliniques...</p>
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
                        <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                          {clinic.clinic_name || clinic.clinicName || clinic.name}
                        </span>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs text-gray-500 truncate flex-1">
                            {clinic.address || clinic.location || clinic.email || "Adresse non disponible"}
                          </span>
                          <span className={clsx(
                            "text-xs px-2 py-0.5 rounded-full flex-shrink-0",
                            clinic.role === 'owner' || clinic.role === 'admin'
                              ? "bg-green-100 text-green-700" 
                              : "bg-blue-100 text-blue-700"
                          )}>
                            {clinic.role === 'owner' || clinic.role === 'admin' ? 'Admin' : 'Membre'}
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
                    <p className="text-xs sm:text-sm text-gray-500 mb-2">Aucune clinique trouvée</p>
                    <p className="text-xs text-gray-400">Vous n'êtes membre d'aucune clinique</p>
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