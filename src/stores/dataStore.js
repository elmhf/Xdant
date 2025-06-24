import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// الهيكل الأولي للبيانات
const initialData = {
  patientInfo: {
    patientId: "",
    info: {
      fullName: "",
      dateOfBirth: "",
      age: 0,
      lastScanDate: "",
      gender: "",
      bloodType: "",
      allergies: [],
      medicalHistory: []
    }
  },
  jawData: {
    upperJaw: {
      mask: []
    },
    lowerJaw: {
      mask: [] 
    }
  },
  teeth: [],
  statistics: {
    totalTeeth: 0,
    healthy: 0,
    treated: 0,
    pathology: 0,
    missing: 0,
    cariesDistribution: {
      active: 0,
      arrested: 0,
      recurrent: 0
    },
    periodontalStatus: ""
  },
  scanInfo: {
    device: "",
    dimensions: {
      width: 0,
      height: 0,
      resolution: "",
      dpi: 0
    },
    scanDate: "",
    scanType: "",
    radiationDose: ""
  },
  problemDetection: [],
  treatmentPlan: [],
  metadata: {
    generatedBy: "",
    lastUpdated: "",
    clinicInfo: {
      name: "",
      license: "",
      address: ""
    }
  }
};

export const useDentalStore = create(
    (set, get) => ({
      
      data: JSON.parse(JSON.stringify(initialData)),
      history: [],
      currentIndex: -1,
      loading: false,
      error: null,

      // التحقق من وجود البيانات
      hasData: () => {
        const state = get();
        const data = state.data;
        
        // التحقق من وجود معرف المريض
        if (!data.patientInfo?.patientId || data.patientInfo.patientId.trim() === "") {
          return false;
        }
        
        // التحقق من وجود اسم المريض
        if (!data.patientInfo?.info?.fullName || data.patientInfo.info.fullName.trim() === "") {
          return false;
        }
        
        return true;
      },

      // التحقق من وجود بيانات المريض الأساسية
      hasPatientInfo: () => {
        const data = get().data.patientInfo;
        return !!(
          data?.patientId && 
          data?.info?.fullName && 
          data?.info?.dateOfBirth
        );
      },

      // التحقق من وجود بيانات الأسنان
      hasTeethData: () => {
        const teeth = get().data.teeth;
        return teeth && teeth.length > 0;
      },

      // التحقق من وجود بيانات المسح
      hasScanData: () => {
        const scanInfo = get().data.scanInfo;
        return !!(
          scanInfo?.device || 
          scanInfo?.scanDate || 
          scanInfo?.scanType
        );
      },

      // التحقق من وجود خطط العلاج
      hasTreatmentPlans: () => {
        const plans = get().data.treatmentPlan;
        return plans && plans.length > 0;
      },

      // التحقق من وجود مشاكل في الأسنان
      hasProblems: () => {
        const teeth = get().data.teeth;
        return teeth && teeth.some(tooth => tooth.problems && tooth.problems.length > 0);
      },

      // التحقق من حالة البيانات الشاملة
      getDataStatus: () => {
        const state = get();
        return {
          hasData: state.hasData(),
          hasPatientInfo: state.hasPatientInfo(),
          hasTeethData: state.hasTeethData(),
          hasScanData: state.hasScanData(),
          hasTreatmentPlans: state.hasTreatmentPlans(),
          hasProblems: state.hasProblems(),
          isEmpty: !state.hasData(),
          teethCount: state.data.teeth?.length || 0,
          problemsCount: state.data.teeth?.reduce((count, tooth) => 
            count + (tooth.problems?.length || 0), 0) || 0,
          treatmentPlansCount: state.data.treatmentPlan?.length || 0
        };
      },

      // التحقق من صحة البيانات
      validateData: () => {
        const data = get().data;
        const errors = [];

        // التحقق من معلومات المريض
        if (!data.patientInfo?.patientId) {
          errors.push("معرف المريض مطلوب");
        }
        
        if (!data.patientInfo?.info?.fullName) {
          errors.push("اسم المريض مطلوب");
        }
        
        if (!data.patientInfo?.info?.dateOfBirth) {
          errors.push("تاريخ الميلاد مطلوب");
        }
        
        // التحقق من بيانات الأسنان
        if (data.teeth && data.teeth.length > 0) {
          data.teeth.forEach((tooth, index) => {
            if (!tooth.toothNumber) {
              errors.push(`رقم السن مفقود في السن رقم ${index + 1}`);
            }
          });
        }

        return {
          isValid: errors.length === 0,
          errors: errors
        };
      },

      // تحميل بيانات المريض
      loadPatientData: (patientData) => {
        set({ loading: true, error: null });
        
        try {
          if (!patientData?.patientId) {
            throw new Error("بيانات المريض ناقصة");
          }

          const formattedData = {
            patientInfo: {
              patientId: patientData.patientId,
              info: {
                fullName: patientData.info?.fullName || "",
                dateOfBirth: patientData.info?.dateOfBirth || "",
                age: patientData.info?.age || 0,
                lastScanDate: patientData.info?.lastScanDate || "",
                gender: patientData.info?.gender || "",
                bloodType: patientData.info?.bloodType || "",
                allergies: patientData.info?.allergies ? [...patientData.info.allergies] : [],
                medicalHistory: patientData.info?.medicalHistory ? [...patientData.info.medicalHistory] : []
              }
            },
            jawData: {
              upperJaw: {
                mask: patientData.JAw?.upperJaw?.mask ? [...patientData.JAw.upperJaw.mask] : []
              },
              lowerJaw: {
                mask: patientData.JAw?.lowerJaw?.mask ? [...patientData.JAw.lowerJaw.mask] : []
              }
            },
            teeth: patientData.teeth?.map(tooth => ({
              comment: tooth.comment || "",
              toothNumber: tooth.toothNumber,
              category: tooth.category || "",
              position: tooth.position ? { ...tooth.position } : { x: 0, y: 0 },
              boundingBox: tooth.boundingBox ? [...tooth.boundingBox] : [],
              teeth_mask: tooth.teeth_mask ? [...tooth.teeth_mask] : [],
              problems: tooth.problems ? tooth.problems.map(problem => ({
                ...problem,
                mask: problem.mask ? [...problem.mask] : [],
                images: problem.images ? [...problem.images] : []
              })) : [],
              gumHealth: tooth.gumHealth || "",
              lastCheckup: tooth.lastCheckup || "",
              Endo: tooth.Endo ? { mask: [...tooth.Endo.mask] } : null,
              Root: tooth.Root ? { mask: [...tooth.Root.mask] } : null,
              Crown: tooth.Crown ? { mask: [...tooth.Crown.mask] } : null
            })) || [],
            statistics: patientData.statistics ? {
              ...patientData.statistics,
              cariesDistribution: {
                ...(patientData.statistics.cariesDistribution || {})
              }
            } : initialData.statistics,
            scanInfo: patientData.scan ? {
              ...patientData.scan,
              dimensions: {
                ...(patientData.scan.dimensions || {})
              }
            } : initialData.scanInfo,
            problemDetection: patientData.problemDetective ? [...patientData.problemDetective] : [],
            treatmentPlan: patientData.treatmentPlan ? patientData.treatmentPlan.map(plan => ({
              ...plan,
              procedures: plan.procedures?.map(proc => ({
                ...proc,
                prescriptions: [...(proc.prescriptions || [])],
                materials: [...(proc.materials || [])]
              })) || [],
              followUp: {
                ...plan.followUp,
                requiredTests: [...(plan.followUp?.requiredTests || [])]
              }
            })) : [],
            metadata: patientData.metadata ? {
              ...patientData.metadata,
              clinicInfo: {
                ...(patientData.metadata.clinicInfo || {})
              }
            } : initialData.metadata
          };
          
          set({
            data: formattedData,
            history: [formattedData],
            currentIndex: 0,
            loading: false
          });

          return { success: true };
        } catch (error) {
          set({ 
            error: error.message,
            loading: false
          });
          return { success: false, error: error.message };
        }
      },

      // تحديث معلومات المريض
      updatePatientInfo: (updatedInfo) => {
        const currentData = get().data;
        set({
          data: {
            ...currentData,
            patientInfo: {
              ...currentData.patientInfo,
              info: {
                ...currentData.patientInfo.info,
                ...updatedInfo
              }
            }
          }
        });
      },

      // إدارة الأسنان
      getToothByNumber: (number) => {
        return get().data.teeth.find(t => t.toothNumber === number);
      },

      updateTooth: (toothNumber, updates) => {
        const currentData = JSON.parse(JSON.stringify(get().data));
        const toothIndex = currentData.teeth.findIndex(t => t.toothNumber === toothNumber);
        
        if (toothIndex !== -1) {
          currentData.teeth[toothIndex] = {
            ...currentData.teeth[toothIndex],
            ...updates
          };
          
          const newHistory = [...get().history.slice(0, get().currentIndex + 1), currentData];
          
          set({
            data: currentData,
            history: newHistory,
            currentIndex: newHistory.length - 1
          });
        }
      },

      addToothProblem: (toothNumber, problem) => {
        const currentData = JSON.parse(JSON.stringify(get().data));
        const toothIndex = currentData.teeth.findIndex(t => t.toothNumber === toothNumber);
        
        if (toothIndex !== -1) {
          currentData.teeth[toothIndex].problems = [
            ...(currentData.teeth[toothIndex].problems || []),
            problem
          ];
          
          const newHistory = [...get().history.slice(0, get().currentIndex + 1), currentData];
          
          set({
            data: currentData,
            history: newHistory,
            currentIndex: newHistory.length - 1
          });
        }
      },

      // إدارة خطط العلاج
      addTreatmentPlan: (newPlan) => {
        const currentData = JSON.parse(JSON.stringify(get().data));
        currentData.treatmentPlan = [
          ...(currentData.treatmentPlan || []),
          newPlan
        ];
        
        const newHistory = [...get().history.slice(0, get().currentIndex + 1), currentData];
        
        set({
          data: currentData,
          history: newHistory,
          currentIndex: newHistory.length - 1
        });
      },

      updateTreatmentPlan: (planId, updates) => {
        const currentData = JSON.parse(JSON.stringify(get().data));
        const planIndex = currentData.treatmentPlan.findIndex(p => p.planId === planId);
        
        if (planIndex !== -1) {
          currentData.treatmentPlan[planIndex] = {
            ...currentData.treatmentPlan[planIndex],
            ...updates
          };
          
          const newHistory = [...get().history.slice(0, get().currentIndex + 1), currentData];
          
          set({
            data: currentData,
            history: newHistory,
            currentIndex: newHistory.length - 1
          });
        }
      },

      // التراجع والإعادة
      undo: () => {
        if (get().currentIndex > 0) {
          set({
            data: JSON.parse(JSON.stringify(get().history[get().currentIndex - 1])),
            currentIndex: get().currentIndex - 1
          });
        }
      },

      redo: () => {
        if (get().currentIndex < get().history.length - 1) {
          set({
            data: JSON.parse(JSON.stringify(get().history[get().currentIndex + 1])),
            currentIndex: get().currentIndex + 1
          });
        }
      },

      // إعادة التعيين
      resetData: () => {
        set({
          data: JSON.parse(JSON.stringify(initialData)),
          history: [],
          currentIndex: -1,
          error: null
        });
      },

      // إحصائيات
      getProblemStatistics: () => {
        return get().data.teeth.reduce((stats, tooth) => {
          tooth.problems?.forEach(problem => {
            stats[problem.type] = (stats[problem.type] || 0) + 1;
          });
          return stats;
        }, {});
      },

      // تصدير البيانات
      exportData: () => {
        return JSON.parse(JSON.stringify(get().data));
      }
    }),
    {
      name: 'dental-patient-data',
      version: 1,
      partialize: (state) => ({
        data: state.data,
        history: state.history,
        currentIndex: state.currentIndex
      }),
    }
);

// دوال مساعدة
export const getToothName = (toothNumber) => {
  const quadrant = Math.floor(toothNumber / 10);
  const tooth = toothNumber % 10;
  
  const quadrants = {
    1: "Upper Right",
    2: "Upper Left",
    3: "Lower Left",
    4: "Lower Right"
  };
  
  const teethNames = {
    1: "Central Incisor",
    2: "Lateral Incisor",
    3: "Canine",
    4: "First Premolar",
    5: "Second Premolar",
    6: "First Molar",
    7: "Second Molar",
    8: "Third Molar"
  };
  
  return `${quadrants[quadrant]} ${teethNames[tooth]}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return "";
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};