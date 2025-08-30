import { useState, useEffect, useMemo, useCallback } from 'react';
import useUserStore from "@/app/component/profile/store/userStore";

// ===============================
// Constants
// ===============================

const ROLES = {
  FULL_ACCESS: 'full_access',
  CLINIC_ACCESS: 'clinic_access',
  ASSISTANT_ACCESS: 'assistant_access',
  LIMITED_ACCESS: 'limited_access'
};

const ROLE_LEVELS = {
  [ROLES.FULL_ACCESS]: 4,
  [ROLES.CLINIC_ACCESS]: 3,
  [ROLES.ASSISTANT_ACCESS]: 2,
  [ROLES.LIMITED_ACCESS]: 1
};

const PERMISSIONS = {
  COMPANY_ACCESS: 'hasCompanyAccess',
  MEMBER_MANAGEMENT: 'hasMemberManagement',
  INVITATION_MANAGEMENT: 'hasInvitationManagement',
  CLINIC_SETTINGS: 'hasClinicSettings',
  EDIT_CLINIC: 'canEditClinic',
  VIEW_REPORTS: 'canViewReports',
  MANAGE_APPOINTMENTS: 'canManageAppointments'
};

const CLINIC_EDIT_ROLES = [
  ROLES.FULL_ACCESS,
  ROLES.CLINIC_ACCESS
];

const normalizeRole = (role) => {
  if (!role) return null;
  
  // Handle different role formats
  const normalized = role.toLowerCase().replace(/[^a-z_]/g, '');
  
  // Map common role variations
  const roleMapping = {
    'full_access': 'full_access',
    'fullaccess': 'full_access',
    'admin': 'full_access',
    'clinic_access': 'clinic_access',
    'clinicaccess': 'clinic_access',
    'clinical_access': 'clinic_access',
    'clinicalaccess': 'clinic_access',
    'assistant_access': 'assistant_access',
    'assistantaccess': 'assistant_access',
    'limited_access': 'limited_access',
    'limitedaccess': 'limited_access',
    'staff': 'limited_access'
  };
  
  return roleMapping[normalized] || role;
};

const getPermissionsByRole = (role, customPermissions = {}) => {
  if (!role) {
    return {
      hasCompanyAccess: false,
      hasMemberManagement: false,
      hasInvitationManagement: false,
      hasClinicSettings: false,
      canEditClinic: false,
      canViewReports: false,
      canManageAppointments: false
    };
  }

  const level = ROLE_LEVELS[role] || 0;

  return {
    hasCompanyAccess: level >= 0,
    hasMemberManagement: level >= 3,
    hasInvitationManagement: level >= 3,
    hasClinicSettings: level >= 4,
    canEditClinic: CLINIC_EDIT_ROLES.includes(role),
    canViewReports: level >= 2,
    canManageAppointments: level >= 2,
    ...customPermissions
  };
};

// ===============================
// Hook
// ===============================

export const usePermissions = (clinicId, options = {}) => {
  const {
    customPermissions = {},
    strictMode = true
  } = options;

  const userInfo = useUserStore(state => state.userInfo);
  const getUserInfo = useUserStore(state => state.getUserInfo);

  console.log("userInfo", userInfo);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Memoize user role calculation
  const calculatedUserRole = useMemo(() => {
    if (!userInfo?.rolesByClinic || !clinicId) {
      return null;
    }
    const rawRole = userInfo.rolesByClinic[clinicId] || null;
    const normalizedRole = normalizeRole(rawRole);
    
    console.log("Role normalization:", { rawRole, normalizedRole, clinicId });
    
    return normalizedRole;
  }, [userInfo?.rolesByClinic, clinicId]);

  useEffect(() => {
    const loadUser = async () => {
      if (!clinicId) {
        setIsLoading(false);
        setError("No clinicId provided");
        return;
      }

      setIsLoading(true);
      try {
        if (!userInfo?.email || !userInfo?.rolesByClinic) {
          await getUserInfo();
        }
      } catch (err) {
        setError("Failed to load user");
      } finally {
        setIsLoading(false);
        setIsDataLoaded(true);
      }
    };

    loadUser();
  }, [clinicId, userInfo?.email, userInfo?.rolesByClinic, getUserInfo]);

  // Update user role when calculated role changes
  useEffect(() => {
    setUserRole(calculatedUserRole);
  }, [calculatedUserRole]);

  const permissions = useMemo(() => {
    if (!isDataLoaded) {
      const fallback = !strictMode;
      return {
        hasCompanyAccess: fallback,
        hasMemberManagement: fallback,
        hasInvitationManagement: fallback,
        hasClinicSettings: fallback,
        canEditClinic: fallback,
        canViewReports: fallback,
        canManageAppointments: fallback
      };
    }

    const result = getPermissionsByRole(userRole, customPermissions);
    
    // Debug logs
    console.log("=== usePermissions Debug ===");
    console.log("userRole:", userRole);
    console.log("userInfo?.rolesByClinic:", userInfo?.rolesByClinic);
    console.log("clinicId:", clinicId);
    console.log("calculatedUserRole:", calculatedUserRole);
    console.log("permissions result:", result);
    console.log("===========================");
    
    return result;
  }, [isDataLoaded, userRole, customPermissions, strictMode, userInfo?.rolesByClinic, clinicId, calculatedUserRole]);

  const hasPermission = useCallback((key) => permissions[key] || false, [permissions]);
  const hasAnyPermission = useCallback((keys) => keys.some(key => permissions[key]), [permissions]);
  const hasAllPermissions = useCallback((keys) => keys.every(key => permissions[key]), [permissions]);

  const getRoleLevel = useCallback(() => ROLE_LEVELS[userRole] || 0, [userRole]);
  const canAccessFeature = useCallback((minLevel) => getRoleLevel() >= minLevel, [getRoleLevel]);

  const roleProperties = useMemo(() => ({
    isAdmin: userRole === ROLES.FULL_ACCESS,
    isAssistant: userRole === ROLES.ASSISTANT_ACCESS,
    isClinical: userRole === ROLES.CLINIC_ACCESS,
    isLimited: userRole === ROLES.LIMITED_ACCESS
  }), [userRole]);

  return {
    userRole,
    normalizedRole: normalizeRole(userRole),
    isLoading,
    isDataLoaded,
    error,

    // Permissions
    ...permissions,

    // Role info
    ...roleProperties,

    // Utilities
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getRoleLevel,
    canAccessFeature,

    // Constants
    ROLES,
    PERMISSIONS
  };
};