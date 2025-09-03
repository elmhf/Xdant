import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// الهيكل الأولي للبيانات
const initialData = {
  reportType: '', // نوع التقرير
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
          console.log("Loading patient data:", patientData);
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
              note: tooth.note || "",
              toothNumber: tooth.toothNumber,
              category: tooth.category || "",
              position: tooth.position ? { ...tooth.position } : { x: 0, y: 0 },
              boundingBox: tooth.boundingBox ? [...tooth.boundingBox] : [],
              teeth_mask: tooth.teeth_mask ? [...tooth.teeth_mask] : [],
              sliceRanges: tooth.sliceRanges ? {
                axial: tooth.sliceRanges.axial ? { ...tooth.sliceRanges.axial } : null,
                sagittal: tooth.sliceRanges.sagittal ? { ...tooth.sliceRanges.sagittal } : null,
                coronal: tooth.sliceRanges.coronal ? { ...tooth.sliceRanges.coronal } : null
              } : null,
              problems: tooth.problems ? tooth.problems.map(problem => ({
                ...problem,
                mask: problem.mask ? [...problem.mask] : [],
                images: problem.images ? [...problem.images] : []
              })) : [],
              gumHealth: tooth.gumHealth || "",
              lastCheckup: tooth.lastCheckup || "",
              Endo: tooth.Endo ? { mask: [...tooth.Endo.mask] } : null,
              Root: tooth.Root ? { mask: [...tooth.Root.mask] } : null,
              Crown: tooth.Crown ? { mask: [...tooth.Crown.mask] } : null,
              approved: typeof tooth.approved === 'boolean' ? tooth.approved : false,
              roots: typeof tooth.roots === 'number' ? tooth.roots : 1,
              canals: typeof tooth.canals === 'number' ? tooth.canals : 1
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

      // === دوال Slice Ranges الجديدة ===

      // الحصول على slice ranges لسن معين
      getToothSliceRanges: (toothNumber, view = null) => {
        const tooth = get().getToothByNumber(toothNumber);
        
        if (!tooth || !tooth.sliceRanges) {
          console.warn(`No slice ranges found for tooth ${toothNumber}`);
          return null;
        }

        // إذا تم تحديد view معين
        if (view) {
          const normalizedView = view.toLowerCase();
          const validViews = ['axial', 'sagittal', 'coronal'];
          
          if (!validViews.includes(normalizedView)) {
            console.warn(`Invalid view '${view}'. Valid views: ${validViews.join(', ')}`);
            return null;
          }

          const sliceRange = tooth.sliceRanges[normalizedView];
          if (!sliceRange) {
            console.warn(`No ${normalizedView} slice range found for tooth ${toothNumber}`);
            return null;
          }

          return {
            view: normalizedView,
            start: sliceRange.start,
            end: sliceRange.end,
            range: sliceRange.end - sliceRange.start + 1
          };
        }

        // إرجاع جميع الـ views
        return tooth.sliceRanges;
      },

      // الحصول على slice ranges لجميع الأسنان
      getAllTeethSliceRanges: (view = null) => {
        const teeth = get().data.teeth;
        if (!teeth || teeth.length === 0) {
          console.warn('No teeth found in data');
          return {};
        }

        const allRanges = {};

        teeth.forEach(tooth => {
          if (!tooth.toothNumber || !tooth.sliceRanges) return;
          
          const ranges = get().getToothSliceRanges(tooth.toothNumber, view);
          if (ranges) {
            allRanges[tooth.toothNumber] = ranges;
          }
        });

        return allRanges;
      },

      // الحصول على الحدود العامة للـ slices في view معين
      getViewSliceBoundaries: (view) => {
        if (!view) return null;

        const allRanges = get().getAllTeethSliceRanges(view);
        const ranges = Object.values(allRanges);
        
        if (ranges.length === 0) return null;

        const starts = ranges.map(r => r.start);
        const ends = ranges.map(r => r.end);

        return {
          view: view.toLowerCase(),
          minStart: Math.min(...starts),
          maxEnd: Math.max(...ends),
          totalRange: Math.max(...ends) - Math.min(...starts) + 1,
          teethCount: ranges.length
        };
      },

      // البحث عن الأسنان الموجودة في slice معين
      findTeethInSlice: (sliceNumber, view) => {
        if (typeof sliceNumber !== 'number' || !view) return [];

        const allRanges = get().getAllTeethSliceRanges(view);
        const matchingTeeth = [];

        Object.entries(allRanges).forEach(([toothNumber, range]) => {
          if (sliceNumber >= range.start && sliceNumber <= range.end) {
            matchingTeeth.push({
              toothNumber: parseInt(toothNumber),
              range: range,
              relativePosition: sliceNumber - range.start + 1
            });
          }
        });

        return matchingTeeth;
      },

      // تحديث slice ranges لسن معين
      updateToothSliceRanges: (toothNumber, sliceRanges) => {
        const currentData = JSON.parse(JSON.stringify(get().data));
        const toothIndex = currentData.teeth.findIndex(t => t.toothNumber === toothNumber);
        
        if (toothIndex !== -1) {
          currentData.teeth[toothIndex].sliceRanges = {
            ...currentData.teeth[toothIndex].sliceRanges,
            ...sliceRanges
          };
          
          const newHistory = [...get().history.slice(0, get().currentIndex + 1), currentData];
          
          set({
            data: currentData,
            history: newHistory,
            currentIndex: newHistory.length - 1
          });
        }
      },

      // تحديث slice range لـ view معين لسن معين
      updateToothViewSliceRange: (toothNumber, view, rangeData) => {
        const normalizedView = view.toLowerCase();
        const validViews = ['axial', 'sagittal', 'coronal'];
        
        if (!validViews.includes(normalizedView)) {
          console.warn(`Invalid view '${view}'. Valid views: ${validViews.join(', ')}`);
          return;
        }

        const currentData = JSON.parse(JSON.stringify(get().data));
        const toothIndex = currentData.teeth.findIndex(t => t.toothNumber === toothNumber);
        
        if (toothIndex !== -1) {
          if (!currentData.teeth[toothIndex].sliceRanges) {
            currentData.teeth[toothIndex].sliceRanges = {};
          }
          
          currentData.teeth[toothIndex].sliceRanges[normalizedView] = {
            start: rangeData.start,
            end: rangeData.end
          };
          
          const newHistory = [...get().history.slice(0, get().currentIndex + 1), currentData];
          
          set({
            data: currentData,
            history: newHistory,
            currentIndex: newHistory.length - 1
          });
        }
      },

      // الحصول على إحصائيات الـ slice ranges
      getSliceRangesStatistics: () => {
        const teeth = get().data.teeth;
        if (!teeth || teeth.length === 0) return null;

        const stats = {
          totalTeeth: teeth.length,
          teethWithSliceRanges: 0,
          viewsAvailable: {
            axial: 0,
            sagittal: 0,
            coronal: 0
          },
          rangesByView: {
            axial: { min: null, max: null, total: 0 },
            sagittal: { min: null, max: null, total: 0 },
            coronal: { min: null, max: null, total: 0 }
          }
        };

        teeth.forEach(tooth => {
          if (tooth.sliceRanges) {
            stats.teethWithSliceRanges++;

            ['axial', 'sagittal', 'coronal'].forEach(view => {
              if (tooth.sliceRanges[view]) {
                stats.viewsAvailable[view]++;
                
                const range = tooth.sliceRanges[view];
                const currentStats = stats.rangesByView[view];
                
                if (currentStats.min === null || range.start < currentStats.min) {
                  currentStats.min = range.start;
                }
                if (currentStats.max === null || range.end > currentStats.max) {
                  currentStats.max = range.end;
                }
                currentStats.total += (range.end - range.start + 1);
              }
            });
          }
        });

        return stats;
      },

      // === نهاية دوال Slice Ranges ===

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
      },

      // تحديث حالة الموافقة لسن معين
      updateToothApproval: (toothNumber, approved) => {
        const currentData = JSON.parse(JSON.stringify(get().data));
        const toothIndex = currentData.teeth.findIndex(t => t.toothNumber === toothNumber);
        if (toothIndex !== -1) {
          currentData.teeth[toothIndex].approved = approved;
          set({ data: currentData });
        }
      },

      addToothNote: (toothNumber, note) => {
        const currentData = JSON.parse(JSON.stringify(get().data));
        const toothIndex = currentData.teeth.findIndex(t => t.toothNumber === toothNumber);
        if (toothIndex !== -1) {
          if (!Array.isArray(currentData.teeth[toothIndex].notes)) {
            currentData.teeth[toothIndex].notes = [];
          }
          currentData.teeth[toothIndex].notes.push({ ...note, date: new Date().toISOString() });
          set({ data: currentData });
        }
      },

      updateToothNote: (toothNumber, noteIndex, updatedNote) => {
        const currentData = JSON.parse(JSON.stringify(get().data));
        const tooth = currentData.teeth.find(t => t.toothNumber === toothNumber);
        if (tooth && Array.isArray(tooth.notes) && tooth.notes[noteIndex]) {
          tooth.notes[noteIndex] = { ...tooth.notes[noteIndex], ...updatedNote, date: new Date().toISOString() };
          set({ data: currentData });
        }
      },

      deleteToothNote: (toothNumber, noteIndex) => {
        const currentData = JSON.parse(JSON.stringify(get().data));
        const tooth = currentData.teeth.find(t => t.toothNumber === toothNumber);
        if (tooth && Array.isArray(tooth.notes) && tooth.notes[noteIndex]) {
          tooth.notes.splice(noteIndex, 1);
          set({ data: currentData });
        }
      },

      // تحديث نوع التقرير
      setReportType: (type) => {
        set(state => ({
          data: {
            ...state.data,
            reportType: type
          }
        }));
      },
      getReportType: () => get().data.reportType,
      isPano: () => get().data.reportType === 'pano ai' || get().data.reportType === 'pano',
      isCbct: () => get().data.reportType === 'cbct ai' || get().data.reportType === 'cbct',
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

// جلب بيانات JSON من رابط
// مثال الاستعمال:
// await fetchJsonFromUrl('https://example.com/patient.json'); // 1: بيانات المريض
// await fetchJsonFromUrl('https://example.com/teeth.json');   // 2: بيانات الأسنان
// await fetchJsonFromUrl('https://example.com/scan.json');    // 3: بيانات المسح
export async function fetchJsonFromUrl(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const jsonData = await response.json();
    // If the store exists, fill the data
    if (typeof useDentalStore === 'function') {
      const store = useDentalStore.getState();
      if (store && typeof store.loadPatientData === 'function') {
        store.loadPatientData(jsonData);
      }
    }
    return jsonData;
  } catch (error) {
    console.error('Failed to fetch JSON:', error);
    return null;
  }
}

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