import { create } from 'zustand';


const generateHash = async (text) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 80);
};

const generateCDNUrl = async (view, index, basePath, w = 700, q = 100) => {
  const normalizedBasePath = basePath.endsWith('/') ? basePath : `${basePath}/`;
  const url = `${normalizedBasePath}${view}/${index}.jpg`;
  // console.log("generateCDNUrl", url);
  return url;
};
const loadImage = (url) => {
  console.log("loadImage", url);
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
};

export const useImageStore = create((set, get) => ({
  // Base path configuration
  basePath: process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:5000',

  images: { axial: [], coronal: [], sagittal: [] },
  loading: { axial: false, coronal: false, sagittal: false },
  loadingCount: { axial: 0, coronal: 0, sagittal: 0 },
  sliceCounts: { axial: 0, coronal: 0, sagittal: 0 },

  voxelSizes: {
    x_spacing_mm: 0,
    y_spacing_mm: 0,
    z_spacing_mm: 0,
    unit: 'mm',
    loading: false,
    error: null
  },

  // Function to update base path
  setBasePath: (newBasePath) => {
    set({ basePath: newBasePath });
  },

  // Function to get current base path
  getBasePath: () => get().basePath,

  setSliceCounts: (counts) => {
    set({ sliceCounts: counts });
  },

  getVoxelSizes: () => get().voxelSizes,

  calculateRealSize: (pixelSize, view) => {
    const { voxelSizes } = get();
    if (!voxelSizes || voxelSizes.loading || voxelSizes.error) return pixelSize;

    switch (view) {
      case 'axial':
        return pixelSize * voxelSizes.x_spacing_mm;
      case 'coronal':
        return pixelSize * voxelSizes.x_spacing_mm;
      case 'sagittal':
        return pixelSize * voxelSizes.y_spacing_mm;
      default:
        return pixelSize;
    }
  },

  loadViewImages: async (view, numSlices) => {
    console.log(`ℹ️ View: ${view} | Total Slices: ${numSlices}`);
    const state = get();
    const { basePath } = state;

    if (state.loading[view]) return;
    if (state.images[view]?.length === numSlices && numSlices > 0) return;

    set(state => ({
      loading: { ...state.loading, [view]: true },
      loadingCount: { ...state.loadingCount, [view]: 0 },
      images: { ...state.images, [view]: [] }
    }));

    const imagePromises = [];
    console.log("numSlices", numSlices);
    for (let i = 0; i < numSlices; i++) {
      const imagePromise = generateCDNUrl(view, i, basePath)
        .then(url => {
          if (view === 'axial') {
            console.log(`Loading axial image ${i}: ${url}`);
          }
          return loadImage(url);
        })
        .then(img => ({ index: i, image: img }))
        .catch(error => {
          console.error(`Failed to load ${view} image ${i}:`, error);
          return null;
        });

      imagePromises.push(imagePromise);
    }

    try {
      const results = await Promise.all(imagePromises);
      const validImages = results.filter(result => result !== null);
      const newImages = [];
      validImages.forEach(({ index, image }) => {
        newImages[index] = image;
      });

      set(state => ({
        images: { ...state.images, [view]: newImages },
        loading: { ...state.loading, [view]: false },
        loadingCount: { ...state.loadingCount, [view]: validImages.length }
      }));
    } catch (error) {
      console.error(`Error loading ${view} images:`, error);
      set(state => ({
        loading: { ...state.loading, [view]: false }
      }));
    }
  },

  loadAllViews: async () => {
    const { loadViewImages, sliceCounts } = get();

    // Use existing slice counts from state
    if (!sliceCounts || Object.values(sliceCounts).every(count => count <= 1)) {
      console.log('⚠️ No slice counts available, skipping loadAllViews');
      return;
    }

    console.log('🔄 Loading all views with slice counts:', sliceCounts);

    const imagePromises = Object.entries(sliceCounts).map(([view, count]) =>
      loadViewImages(view, count)
    );

    await Promise.all(imagePromises);
  },

  getViewImages: (view) => get().images[view] || [],
  getViewLoading: (view) => get().loading[view] || false,
  getViewLoadingCount: (view) => get().loadingCount[view] || 0,

  isViewLoaded: (view) => {
    const state = get();
    return state.images[view]?.length === state.sliceCounts[view] && state.sliceCounts[view] > 0;
  },

  areAllViewsLoaded: () => {
    const state = get();
    return Object.keys(state.sliceCounts).every(view =>
      state.images[view]?.length === state.sliceCounts[view] && state.sliceCounts[view] > 0
    );
  },

  // Setup function that takes report data and initializes everything
  setupFromReport: async (reportData) => {
    console.log("🔄 Setting up image store with reportData KEYS:", Object.keys(reportData));
    console.log("reportData.metadata", reportData
    );
    try {
      // Extract base path from report data_url
      let newBasePath = get().basePath; // Keep current as default
      if (reportData?.data_url) {
        newBasePath = reportData.data_url;
        console.log('🔗 Using data URL from report:', newBasePath);
      }

      // Extract voxel sizes from scan data
      const voxelSizes = {
        x_spacing_mm: reportData.report?.metadata?.slice_count?.x_spacing_mm || 1,
        y_spacing_mm: reportData.report?.metadata?.slice_count?.y_spacing_mm || 1,
        z_spacing_mm: reportData.report?.metadata?.slice_count?.z_spacing_mm || 1,
        unit: 'mm',
        loading: false,
        error: null
      };

      console.log('📏 Extracted voxel sizes from report:', voxelSizes);

      // Extract slice counts for each view
      // Extract slice counts from scanInfo (Preferred) or metadata (Fallback)
      console.log("reportData.metadata", reportData.metadata);
      const sliceCounts = {
        axial: reportData.scanInfo?.dimensions?.z || reportData.metadata?.slice_count?.axial || 200,
        coronal: reportData.scanInfo?.dimensions?.y || reportData.metadata?.slice_count?.coronal || 200,
        sagittal: reportData.scanInfo?.dimensions?.x || reportData.metadata?.slice_count?.sagittal || 200
      };

      console.log('📊 Extracted slice counts:',
        `Axial: ${sliceCounts.axial}, Coronal: ${sliceCounts.coronal}, Sagittal: ${sliceCounts.sagittal}`
      );

      // Update the state with new values
      set({
        basePath: newBasePath,
        voxelSizes,
        sliceCounts,
        // Reset images and loading states
        images: { axial: [], coronal: [], sagittal: [] },
        loading: { axial: false, coronal: false, sagittal: false },
        loadingCount: { axial: 0, coronal: 0, sagittal: 0 }
      });

      console.log('🏪 Updated image store state with new values');

      // Start loading images for all views
      const { loadViewImages } = get();
      console.log("✅ Starting to load images for all views with counts:", sliceCounts);
      const imagePromises = Object.entries(sliceCounts).map(([view, count]) =>
        loadViewImages(view, count)
      );

      await Promise.all(imagePromises);

      console.log('✅ Setup completed successfully for all views');
      return { success: true, message: 'Setup completed successfully' };

    } catch (error) {
      console.error('❌ Error setting up from report:', error);
      return { success: false, error: error.message };
    }
  },

  reset: () => {
    const { basePath } = get(); // Preserve basePath during reset
    set({
      basePath, // Keep the current basePath
      images: { axial: [], coronal: [], sagittal: [] },
      loading: { axial: false, coronal: false, sagittal: false },
      loadingCount: { axial: 0, coronal: 0, sagittal: 0 },
      sliceCounts: { axial: 0, coronal: 0, sagittal: 0 },
      voxelSizes: {
        x_spacing_mm: 0,
        y_spacing_mm: 0,
        z_spacing_mm: 0,
        unit: 'mm',
        loading: false,
        error: null
      }
    });
  }
}));