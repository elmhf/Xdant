"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useImageStore } from "./stores/imageStore";
import ToolPanel from "./components/ToolPanel";
import SidePanel from "./components/SidePanel";
import { useToolPanel, useLayoutTools } from "./hooks/ToothPanelHook";
import MedicalImageViewer from "./MedicalImageViewer";
// Error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error("Caught error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-600">Something went wrong</h2>
            <p className="text-sm text-gray-600 mt-2">Please refresh the page</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}



export default function Page() {

  const [paths, setPaths] = useState([]);
  const [smoothedPaths, setSmoothedPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const workerRef = useRef(null);
  const [NumSlicesAxial,setNumSlicesAxial]=useState()
  const [NumSlicesCoronal,setNumSlicesCoronal]=useState()
  const [NumSlicesSagittal,setNumSlicesSagittal]=useState()



  const {
    sliceCounts,
    loadAllViews,
    getViewImages,
    getViewLoading,
    getViewLoadingCount,
    getVoxelSizes,
  } = useImageStore();

  const voxelSizes = getVoxelSizes() || {};




  
  // Load slice counts
  useEffect(() => {
    const fetchSlicesCount = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:5000/slices-count");
        const data = await res.json();
        console.log(data)
        setNumSlicesAxial(data.axial || 1); // This line is removed as per the edit hint
        setNumSlicesCoronal(data.coronal || 1); // This line is removed as per the edit hint
        setNumSlicesSagittal(data.sagittal || 1); // This line is removed as per the edit hint
        await loadAllViews(data);
      } catch (err) {
        console.error("Failed to fetch slice counts", err);
        setError("Failed to load slices.");
      } finally {
        setLoading(false);
      }
      console.log(getVoxelSizes())
    };
    fetchSlicesCount();
  }, [loadAllViews]);

  // Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL("./workers/canvasWorker.js", import.meta.url));
    workerRef.current.onmessage = (e) => {
      const { type, data } = e.data;
      if (type === "pathsProcessed") {
        setSmoothedPaths(data);
      }
    };
    return () => workerRef.current?.terminate();
  }, []);

  useEffect(() => {
    if (workerRef.current && paths.length > 0) {
      workerRef.current.postMessage({ type: "updatePaths", data: paths });
    }
  }, [paths]);

  // UI hooks
  const toolPanelHook = useToolPanel();
  const layoutToolsHook = useLayoutTools(toolPanelHook);




  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading medical images...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold">Error Loading Images</div>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="max-h-[90vh] h-[90vh]  w-[98vw] max-w-[100%] p-2 gap-3 flex flex-col">
        <ToolPanel {...toolPanelHook} {...layoutToolsHook} />
        <div className="flex flex-row gap-3 h-[90%] min-h-[90%] max-h-[90%] max-w-full">
          <SidePanel /> 
          <div className="w-[80%] min-h-full">
            <MedicalImageViewer/>
        </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
