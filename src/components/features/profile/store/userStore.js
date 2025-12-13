import { create } from 'zustand'

const useUserStore = create((set, get) => ({
  userInfo: {
    profilePhotoUrl: '',
    email: '',
    lastName: '',
    firstName: '',
    personalSignature: '',
    phoneNumber: '',
  },

  // Cache للصور المحملة
  imageCache: new Map(),

  // حالة تحميل الصور
  imageLoadingStates: new Map(),

  clinicsInfo: [],
  setClinicsInfo: (clinics) => set({ clinicsInfo: clinics }),
  currentClinicId: null,
  setCurrentClinicId: (clinicId) => set({ currentClinicId: clinicId }),
  invitations: [],
  setInvitations: (invitations) => set({ invitations }),

  // Role system and mapping
  roleLevels: {
    'limited_access': 1,
    'clinic_access': 2,
    'assistant': 3,
    'full_access': 4
  },

  // Role mapping from display names to API roles
  roleMapping: {
    'dentist': 'clinic_access',
    'receptionist': 'limited_access',
    'assistant': 'assistant',
    'admin': 'full_access',
    'owner': 'full_access'
  },

  // Get role level
  getRoleLevel: (role) => {
    const state = get();
    const apiRole = state.roleMapping[role] || role;
    return state.roleLevels[apiRole] || 0;
  },

  // Map display role to API role
  mapRoleToAPI: (displayRole) => {
    const state = get();
    return state.roleMapping[displayRole] || displayRole;
  },

  // Map API role to display role
  mapAPIToDisplay: (apiRole) => {
    const state = get();
    const reverseMapping = {
      'limited_access': 'receptionist',
      'clinic_access': 'dentist',
      'assistant': 'assistant',
      'full_access': 'admin'
    };
    return reverseMapping[apiRole] || apiRole;
  },
  getCurrentClinic: () => {
    const state = get();
    return state.clinicsInfo.find(clinic => clinic.id === state.currentClinicId) || null;
  },

  // Get current clinic logo from cache
  getCurrentClinicLogo: () => {
    const state = get();
    const currentClinic = state.clinicsInfo.find(clinic => clinic.id === state.currentClinicId);
    const logoUrl = currentClinic?.logoUrl || currentClinic?.logo_url;
    if (currentClinic && logoUrl) {
      return state.getImageFromCache(logoUrl);
    }
    return null;
  },

  // Load current clinic logo to cache
  loadCurrentClinicLogo: async () => {
    const state = get();
    const currentClinic = state.clinicsInfo.find(clinic => clinic.id === state.currentClinicId);
    const logoUrl = currentClinic?.logoUrl || currentClinic?.logo_url;
    if (currentClinic && logoUrl) {
      return await state.loadImage(logoUrl);
    }
    return null;
  },

  // Get current clinic stamp from cache
  getCurrentClinicStamp: () => {
    const state = get();
    const currentClinic = state.clinicsInfo.find(clinic => clinic.id === state.currentClinicId);
    const stampUrl = currentClinic?.stampUrl || currentClinic?.stamp_url;



    if (currentClinic && stampUrl) {
      const cachedImage = state.getImageFromCache(stampUrl);

      return cachedImage;
    }

    return null;
  },

  // Load current clinic stamp to cache
  loadCurrentClinicStamp: async () => {
    const state = get();
    const currentClinic = state.clinicsInfo.find(clinic => clinic.id === state.currentClinicId);
    const stampUrl = currentClinic?.stampUrl || currentClinic?.stamp_url;



    if (currentClinic && stampUrl) {

      try {
        const result = await state.loadImage(stampUrl);

        return result;
      } catch (error) {
        console.error("Error loading stamp to cache:", error);
        throw error;
      }
    } else {

      return null;
    }
  },

  setUserInfo: (info) => set(state => ({
    userInfo: { ...state.userInfo, ...info }
  })),

  clearUserData: () => set({
    userInfo: {
      profilePhotoUrl: '',
      email: '',
      lastName: '',
      firstName: '',
      personalSignature: '',
      phoneNumber: '',
    },
    imageCache: new Map(),
    imageLoadingStates: new Map(),
  }),
  setImageCache: (url, localUrl) => set(state => {
    const newCache = new Map(state.imageCache);
    newCache.set(url, localUrl);
    return { imageCache: newCache };
  }),
  // إضافة صورة إلى الـ cache
  addImageToCache: (url, imageElement) => set(state => {
    const newCache = new Map(state.imageCache);
    newCache.set(url, imageElement);
    return { imageCache: newCache };
  }),

  // الحصول على صورة من الـ cache
  getImageFromCache: (url) => {
    const state = get();
    return state.imageCache.get(url) || null;
  },

  // تحديث حالة التحميل للصورة
  setImageLoadingState: (url, isLoading, error = null) => set(state => {
    const newLoadingStates = new Map(state.imageLoadingStates);
    newLoadingStates.set(url, { isLoading, error });
    return { imageLoadingStates: newLoadingStates };
  }),

  // الحصول على حالة التحميل للصورة
  getImageLoadingState: (url) => {
    const state = get();
    return state.imageLoadingStates.get(url) || { isLoading: false, error: null };
  },

  // تحميل صورة وحفظها في الـ cache
  loadImage: (url) => {
    const state = get();

    // إذا كانت الصورة موجودة في الـ cache، إرجاعها مباشرة
    if (state.imageCache.has(url)) {
      return Promise.resolve(state.imageCache.get(url));
    }

    // إذا كانت الصورة قيد التحميل، انتظار انتهاء التحميل
    const loadingState = state.imageLoadingStates.get(url);
    if (loadingState?.isLoading) {
      return new Promise((resolve, reject) => {
        const checkLoading = () => {
          const currentState = get();
          const currentLoadingState = currentState.imageLoadingStates.get(url);

          if (!currentLoadingState?.isLoading) {
            if (currentLoadingState?.error) {
              reject(currentLoadingState.error);
            } else {
              const image = currentState.imageCache.get(url);
              resolve(image);
            }
          } else {
            setTimeout(checkLoading, 100);
          }
        };
        checkLoading();
      });
    }

    // بدء تحميل الصورة
    get().setImageLoadingState(url, true);

    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        get().addImageToCache(url, img);
        get().setImageLoadingState(url, false);
        resolve(img);
      };

      img.onerror = (error) => {
        console.error(`Failed to load image: ${url}`, error);
        get().setImageLoadingState(url, false, error);
        reject(error);
      };

      // تعيين CORS إذا لزم الأمر
      img.crossOrigin = 'anonymous';

      // Add additional headers for Supabase URLs
      if (url.includes('supabase.co')) {

      }

      img.src = url;
    });
  },

  // إزالة صورة من الـ cache
  removeImageFromCache: (url) => set(state => {
    const newCache = new Map(state.imageCache);
    const newLoadingStates = new Map(state.imageLoadingStates);
    newCache.delete(url);
    newLoadingStates.delete(url);
    return {
      imageCache: newCache,
      imageLoadingStates: newLoadingStates
    };
  }),

  // مسح الـ cache بالكامل
  clearImageCache: () => set(state => ({
    imageCache: new Map(),
    imageLoadingStates: new Map(),
  })),

  changePassword: async (oldPassword, newPassword) => {
    try {
      const res = await fetch("http://localhost:5000/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, message: "Password changed successfully!" };
      } else {
        return { success: false, message: data.message || "Error changing password" };
      }
    } catch (e) {
      return { success: false, message: "Network error" };
    }
  },

  changeName: async (firstName, lastName) => {
    try {
      const res = await fetch("http://localhost:5000/api/users/change-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ firstName: firstName, lastName: lastName }),
      });
      const data = await res.json();
      if (res.ok) {
        set(state => ({
          userInfo: {
            ...state.userInfo,
            firstName,
            lastName,
          }
        }));
        return { success: true, message: "Name changed successfully!" };
      } else {
        return { success: false, message: data.message || "Error changing name" };
      }
    } catch (e) {
      return { success: false, message: "Network error" };
    }
  },

  changeSignature: async (fileOrBlob) => {
    try {
      if (!fileOrBlob || (!(fileOrBlob instanceof File) && !(fileOrBlob instanceof Blob))) {
        return { success: false, message: "Fichier invalide" };
      }

      const formData = new FormData();
      formData.append('signature', fileOrBlob);

      const res = await fetch("http://localhost:5000/api/users/change-signature", {
        method: "POST",
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        // إزالة الصورة القديمة من الـ cache إذا وجدت
        const oldSignature = get().userInfo.personalSignature;
        if (oldSignature) {
          get().removeImageFromCache(oldSignature);
        }

        // تحميل الصورة الجديدة إلى الـ cache
        if (data.signatureUrl) {
          const url = URL.createObjectURL(fileOrBlob);
          get().setImageCache(data.signatureUrl, url);
        }

        set(state => ({
          userInfo: {
            ...state.userInfo,
            personalSignature: data.signatureUrl,
          }
        }));

        return {
          success: true,
          message: "Signature changed successfully!",
          signatureUrl: data.signatureUrl
        };
      } else {
        return {
          success: false,
          message: data.message || "Error changing signature"
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Network error: ${error.message}`
      };
    }
  },

  changePhoto: async (fileOrBlob) => {

    try {
      if (!fileOrBlob || (!(fileOrBlob instanceof File) && !(fileOrBlob instanceof Blob))) {
        return { success: false, message: "Fichier invalide" };
      }

      const formData = new FormData();
      formData.append('image', fileOrBlob);

      const res = await fetch("http://localhost:5000/api/users/change-profile-photo", {
        method: "POST",
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {

        // إزالة الصورة القديمة من الـ cache إذا وجدت
        const oldPhoto = get().userInfo.profilePhotoUrl;
        if (oldPhoto) {

          get().removeImageFromCache(oldPhoto);
        }

        // تحميل الصورة الجديدة إلى الـ cache
        if (data.profilePhotoUrl) {

          const url = URL.createObjectURL(fileOrBlob);
          get().setImageCache(data.profilePhotoUrl, url);
        }

        set(state => ({
          userInfo: {
            ...state.userInfo,
            profilePhotoUrl: data.profilePhotoUrl,
          }
        }));

        return {
          success: true,
          message: "Photo changed successfully!",
          profilePhotoUrl: data.profilePhotoUrl
        };
      } else {

        return {
          success: false,
          message: data.message || "Error changing photo"
        };
      }
    } catch (error) {

      return {
        success: false,
        message: `Network error: ${error.message}`
      };
    }
  },

  deletePhoto: async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users/delete-profile-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        // Remove old photo from cache
        const oldPhoto = get().userInfo.profilePhotoUrl;
        if (oldPhoto) {
          get().removeImageFromCache(oldPhoto);
        }

        // Update userInfo to set profilePhotoUrl to null
        set(state => ({
          userInfo: {
            ...state.userInfo,
            profilePhotoUrl: null,
          }
        }));

        return {
          success: true,
          message: "Photo supprimée avec succès!"
        };
      } else {
        return {
          success: false,
          message: data.message || "Erreur lors de la suppression de la photo"
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Erreur réseau: ${error.message}`
      };
    }
  },

  getUserInfo: async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
      });
      const data = await res.json();
      console.log('mee', data)

      if (res.ok) {

        // تحميل الصور إلى الـ cache عند جلب معلومات المستخدم
        if (data.personalSignature) {
          get().loadImage(data.personalSignature).catch(console.error);
        }
        if (data.profilePhotoUrl) {

          get().loadImage(data.profilePhotoUrl).catch(console.error);
        }

        set(state => ({
          userInfo: {
            ...state.userInfo,
            ...data,
            profilePhotoUrl: data.profilePhotoUrl, // أضف هذا السطر لتوحيد الاسم في الواجهة
          }
        }));
        return { success: true, data };
      } else {
        return { success: false, message: data.message || "Error fetching user info" };
      }
    } catch (e) {
      return { success: false, message: "Network error" };
    }
  },

  // Fetch clinics data and log it
  fetchMyClinics: async () => {
    try {

      const res = await fetch("http://localhost:5000/api/clinics/my-clinics", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
      });








      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error:", res.status, errorText);
        return null;
      }

      const data = await res.json();



      if (data.clinics && Array.isArray(data.clinics)) {
        set({ clinicsInfo: data.clinics });

        // Set the first clinic as current by default if not already set
        const state = get();
        if (data.clinics.length > 0 && !state.currentClinicId) {

          set({ currentClinicId: data.clinics[0].id });
        }

        // Load clinic logos and stamps to cache
        data.clinics.forEach(clinic => {
          const logoUrl = clinic.logoUrl || clinic.logo_url;
          const stampUrl = clinic.stampUrl || clinic.stamp_url;
          if (logoUrl) {
            get().loadImage(logoUrl).catch(console.error);
          }
          if (stampUrl) {
            get().loadImage(stampUrl).catch(console.error);
          }
        });


        return data.clinics;
      } else {
        console.error("Invalid clinics data format:", data);
        set({ clinicsInfo: [] });
        return [];
      }
    } catch (e) {
      console.error("Error fetching clinics:", e);
      set({ clinicsInfo: [] });
      return null;
    }
  },

  changeClinicLogo: async (clinicId, fileOrBlob) => {
    console.log(fileOrBlob, " fileOrBlob ****************************++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");


    try {
      if (!fileOrBlob || (!(fileOrBlob instanceof File) && !(fileOrBlob instanceof Blob))) {
        return { success: false, message: "Fichier invalide" };
      }




      const formData = new FormData();
      formData.append('clinicId', String(clinicId));
      formData.append('image', fileOrBlob);

      // Log FormData contents
      for (let [key, value] of formData.entries()) {

      }

      const res = await fetch("http://localhost:5000/api/clinics/change-logo", {
        method: "POST",
        credentials: 'include',
        body: formData,
      });




      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", errorText);
        return {
          success: false,
          message: `Server error: ${res.status} - ${errorText}`
        };
      }

      const data = await res.json();

      if (res.ok) {
        // إزالة الصورة القديمة من الـ cache إذا وجدت
        const currentClinic = get().getCurrentClinic();
        if (currentClinic && currentClinic.logoUrl) {
          get().removeImageFromCache(currentClinic.logoUrl);
        }

        // تحميل الصورة الجديدة إلى الـ cache
        if (data.logoUrl) {
          const url = URL.createObjectURL(fileOrBlob);
          get().setImageCache(data.logoUrl, url);
        }

        // تحديث معلومات العيادة في الـ store
        set(state => ({
          clinicsInfo: state.clinicsInfo.map(clinic =>
            clinic.id === clinicId
              ? { ...clinic, logoUrl: data.logoUrl, logo_url: data.logoUrl }
              : clinic
          )
        }));

        return {
          success: true,
          message: "Logo changed successfully!",
          logoUrl: data.logoUrl
        };
      } else {
        return {
          success: false,
          message: data.message || "Error changing logo"
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Network error: ${error.message}`
      };
    }
  },

  changeClinicStamp: async (clinicId, fileOrBlob) => {


    try {
      if (!fileOrBlob || (!(fileOrBlob instanceof File) && !(fileOrBlob instanceof Blob))) {
        return { success: false, message: "Fichier invalide" };
      }




      const formData = new FormData();
      formData.append('clinicId', String(clinicId));
      formData.append('image', fileOrBlob);

      // Log FormData contents
      for (let [key, value] of formData.entries()) {

      }

      const res = await fetch("http://localhost:5000/api/clinics/change-stamp", {
        method: "POST",
        credentials: 'include',
        body: formData,
      });




      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response for stamp:", errorText);
        return {
          success: false,
          message: `Server error: ${res.status} - ${errorText}`
        };
      }

      const data = await res.json();


      if (res.ok) {
        // إزالة الصورة القديمة من الـ cache إذا وجدت
        const currentClinic = get().getCurrentClinic();
        if (currentClinic && currentClinic.stampUrl) {
          get().removeImageFromCache(currentClinic.stampUrl);
        }

        // تحميل الصورة الجديدة إلى الـ cache
        if (data.stampUrl) {
          const url = URL.createObjectURL(fileOrBlob);
          get().setImageCache(data.stampUrl, url);
        }

        // تحديث معلومات العيادة في الـ store
        set(state => ({
          clinicsInfo: state.clinicsInfo.map(clinic =>
            clinic.id === clinicId
              ? { ...clinic, stampUrl: data.stampUrl, stamp_url: data.stampUrl }
              : clinic
          )
        }));

        return {
          success: true,
          message: "Stamp changed successfully!",
          stampUrl: data.stampUrl
        };
      } else {
        return {
          success: false,
          message: data.message || "Error changing stamp"
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Network error: ${error.message}`
      };
    }
  },

  // Fetch clinic members
  fetchClinicMembers: async (clinicId) => {
    try {
      const res = await fetch("http://localhost:5000/api/clinics/get-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ clinicId })
      });

      const data = await res.json();


      if (res.ok) {
        // Load profile images to cache
        if (data.members && Array.isArray(data.members)) {
          data.members.forEach(member => {
            if (member.user?.profilePhotoUrl) {
              get().loadImage(member.user.profilePhotoUrl).catch(console.error);
            }
          });
        }

        return {
          success: true,
          members: data.members || [],
          totalMembers: data.totalMembers || 0
        };
      } else {
        return {
          success: false,
          message: data.message || "Error fetching clinic members",
          members: []
        };
      }
    } catch (error) {
      console.error("Error fetching clinic members:", error);
      return {
        success: false,
        message: "Network error",
        members: []
      };
    }
  },

  // Invite clinic member
  inviteClinicMember: async (clinicId, email, role = 'staff') => {
    try {
      const res = await fetch("http://localhost:5000/api/clinics/invite-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ clinicId, email, role })
      });

      const data = await res.json();


      if (res.ok) {
        // Add the new invitation to the store if it exists
        const state = get();
        if (data.invitation) {
          // Update invitations array if it exists in the store
          set(state => ({
            invitations: state.invitations ? [...state.invitations, data.invitation] : [data.invitation]
          }));
        }

        return {
          success: true,
          message: data.message || "Invitation sent successfully",
          invitation: data.invitation
        };
      } else {
        return {
          success: false,
          message: data.error || "Error sending invitation"
        };
      }
    } catch (error) {
      console.error("Error inviting member:", error);
      return {
        success: false,
        message: "Network error"
      };
    }
  },

  // Fetch invited members
  fetchInvitedMembers: async (clinicId) => {

    try {
      const res = await fetch("http://localhost:5000/api/clinics/get-invitation-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ clinicId })
      });

      const data = await res.json();


      if (res.ok) {
        // Store invitations in the store
        set({ invitations: data.invitations || [] });

        return {
          success: true,
          invitations: data.invitations || [],
          totalInvitations: data.totalInvitations || 0
        };
      } else {
        return {
          success: false,
          message: data.message || "Error fetching invitations",
          invitations: []
        };
      }
    } catch (error) {
      console.error("Error fetching invited members:", error);
      return {
        success: false,
        message: "Network error",
        invitations: []
      };
    }
  },

  // Delete clinic invitation
  deleteClinicInvitation: async (clinicId, invitationId) => {


    try {
      const res = await fetch("http://localhost:5000/api/clinics/delete-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ clinicId, invitationId })
      });

      const data = await res.json();


      if (res.ok) {
        return {
          success: true,
          message: data.message || "Invitation deleted successfully",
          deletedInvitation: data.deletedInvitation
        };
      } else {
        return {
          success: false,
          message: data.error || "Error deleting invitation"
        };
      }
    } catch (error) {
      console.error("Error deleting invitation:", error);
      return {
        success: false,
        message: "Network error"
      };
    }
  },

  // Change member role
  changeMemberRole: async (clinicId, memberId, newRole) => {
    try {
      const res = await fetch("http://localhost:5000/api/clinics/change-member-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ clinicId, memberId, newRole })
      });

      const data = await res.json();


      if (res.ok) {
        return {
          success: true,
          message: data.message || "Member role updated successfully",
          member: data.member
        };
      } else {
        return {
          success: false,
          message: data.error || "Error updating member role"
        };
      }
    } catch (error) {
      console.error("Error changing member role:", error);
      return {
        success: false,
        message: "Network error"
      };
    }
  },

  // Get all patients for a clinic
  getPatients: async (clinicId) => {

    try {

      const res = await fetch(`http://localhost:5000/api/patients/all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ clinicId })
      });

      const data = await res.json();
      console.log(data, "data");

      if (res.ok) {
        return {
          success: true,
          patients: data.patients || [],
          totalPatients: data.totalPatients || 0
        };
      } else {
        return {
          success: false,
          message: data.error || "Error fetching patients",
          patients: []
        };
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      return {
        success: false,
        message: "Network error",
        patients: []
      };
    }
  },

  // Get single patient by ID
  getPatient: async (patientId) => {
    console.log('🔄 userStore - getPatient called with:', { patientId });
    try {
      console.log('🔄 userStore - Making API request to:', `http://localhost:5000/api/patients/${patientId}`);
      const res = await fetch(`http://localhost:5000/api/patients/${patientId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: 'include'
      });

      const data = await res.json();
      console.log('🔄 userStore - API response:', { status: res.status, data });

      if (res.ok) {
        console.log('✅ userStore - Patient fetched successfully:', data.patient);
        return {
          success: true,
          patient: data.patient,
          userAccess: data.userAccess
        };
      } else {
        console.log('❌ userStore - API error:', data.error);
        return {
          success: false,
          message: data.error || "Error fetching patient"
        };
      }
    } catch (error) {
      console.error("Error fetching patient:", error);
      return {
        success: false,
        message: "Network error"
      };
    }
  },

  // Delete patient
  deletePatient: async (patientId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/patients/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ patientId })
      });

      const data = await res.json();

      if (res.ok) {
        return {
          success: true,
          message: data.message || "Patient deleted successfully"
        };
      } else {
        return {
          success: false,
          message: data.error || "Error deleting patient"
        };
      }
    } catch (error) {
      console.error("Error deleting patient:", error);
      return {
        success: false,
        message: "Network error"
      };
    }
  },

  // Toggle patient favorite status
  toggleFavorite: async (patientId, isFavorite) => {
    try {
      console.log('Sending toggle favorite request:', { patientId, isFavorite });

      const res = await fetch(`http://localhost:5000/api/patients/favorites/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ patientId, isFavorite })
      });

      const data = await res.json();
      console.log('Toggle favorite response:', { status: res.status, data });

      if (res.ok) {
        return {
          success: true,
          message: data.message || "Favorite status updated successfully"
        };
      } else {
        console.error('Toggle favorite API error:', data);
        return {
          success: false,
          message: data.error || `Error updating favorite status (${res.status})`
        };
      }
    } catch (error) {
      console.error("Error updating favorite status:", error);
      return {
        success: false,
        message: "Network error"
      };
    }
  },
}))

export default useUserStore