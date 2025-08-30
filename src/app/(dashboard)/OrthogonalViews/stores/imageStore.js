import { create } from 'zustand';

const SECRET_KEY = "chams_dont_steal_me";

const generateHash = async (text) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 80);
};

const generateCDNUrl = async (view, index, w = 700, q = 100) => {
  const raw = `${view}-${index}-${w}-${q}-${SECRET_KEY}`;
  const sig = await generateHash(raw);
  return `http://localhost:5000/cdn-slice?view=${view}&index=${index}&w=${w}&q=${q}&s=${sig}`;
};





const loadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
};

const fetchVoxelSizes = async () => {
  try {
    const response = await fetch('http://localhost:5000/voxel-sizes');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching voxel sizes:', error);
    return null;
  }
};

const fetchSlicesCount = async () => {
  try {
    const res = await fetch('http://localhost:5000/slices-count');
    if (!res.ok) throw new Error('Failed to fetch slice counts');
    return await res.json(); // { axial: ..., coronal: ..., sagittal: ... }
  } catch (err) {
    console.error("Error fetching slice counts:", err);
    return null;
  }
};

export const useImageStore = create((set, get) => ({
  images: { axial: [], coronal: [], sagittal: [] },
  loading: { axial: false, coronal: false, sagittal: false },
  loadingCount: { axial: 0, coronal: 0, sagittal: 0 },
  sliceCounts: { axial: 1, coronal: 1, sagittal: 1 },

  voxelSizes: {
    x_spacing_mm: 0,
    y_spacing_mm: 0,
    z_spacing_mm: 0,
    unit: 'mm',
    loading: false,
    error: null
  },

  setSliceCounts: (counts) => {
    set({ sliceCounts: counts });
  },

  loadVoxelSizes: async () => {
    set(state => ({
      voxelSizes: { ...state.voxelSizes, loading: true, error: null }
    }));

    try {
      const voxelData = await fetchVoxelSizes();
      if (voxelData && voxelData.status === 'success') {
        set({
          voxelSizes: {
            x_spacing_mm: voxelData.x_spacing_mm,
            y_spacing_mm: voxelData.y_spacing_mm,
            z_spacing_mm: voxelData.z_spacing_mm,
            unit: voxelData.unit,
            loading: false,
            error: null
          }
        });
      } else {
        throw new Error('Failed to fetch voxel sizes');
      }
    } catch (error) {
      set(state => ({
        voxelSizes: { ...state.voxelSizes, loading: false, error: error.message }
      }));
    }
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

  fetchSlicesCount: async () => {
    const counts = await fetchSlicesCount();
    if (counts) get().setSliceCounts(counts);
    return counts;
  },

  loadViewImages: async (view, numSlices) => {
    const state = get();
    if (state.loading[view]) return;
    if (state.images[view].length === numSlices && numSlices > 0) return;

    set(state => ({
      loading: { ...state.loading, [view]: true },
      loadingCount: { ...state.loadingCount, [view]: 0 },
      images: { ...state.images, [view]: [] }
    }));

    const imagePromises = [];

    for (let i = 0; i < numSlices; i++) {
      const imagePromise = generateCDNUrl(view, i)
        .then(url => loadImage(url))
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
    const { fetchSlicesCount, loadViewImages, loadVoxelSizes } = get();

    const counts = await fetchSlicesCount();
    if (!counts) return;

    const voxelPromise = loadVoxelSizes();

    const imagePromises = Object.entries(counts).map(([view, count]) =>
      loadViewImages(view, count)
    );

    await Promise.all([voxelPromise, ...imagePromises]);
  },

  getViewImages: (view) => get().images[view] || [],
  getViewLoading: (view) => get().loading[view] || false,
  getViewLoadingCount: (view) => get().loadingCount[view] || 0,

  isViewLoaded: (view) => {
    const state = get();
    return state.images[view].length === state.sliceCounts[view] && state.sliceCounts[view] > 0;
  },

  areAllViewsLoaded: () => {
    const state = get();
    return Object.keys(state.sliceCounts).every(view =>
      state.images[view].length === state.sliceCounts[view] && state.sliceCounts[view] > 0
    );
  },

  reset: () => {
    set({
      images: { axial: [], coronal: [], sagittal: [] },
      loading: { axial: false, coronal: false, sagittal: false },
      loadingCount: { axial: 0, coronal: 0, sagittal: 0 },
      sliceCounts: { axial: 1, coronal: 1, sagittal: 1 },
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
