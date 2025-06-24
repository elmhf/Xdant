"use client";
import ToothChar from "./ToothChar/ToothChar";
import SettingButton from './buttons/SettingButton';
import { useState, useRef, useEffect } from 'react';

const Toothlabels = () => {
  const [selectedTooth, setSelectedTooth] = useState(null);
  const chartContainerRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState(240); // default

  useEffect(() => {
    // optional logic if you want to auto-adjust height based on window size
    const handleResize = () => {
      const vh = window.innerHeight;
      const newHeight = Math.min(300, vh * 0.25); // max 300px or 25vh
      setMaxHeight(newHeight);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full flex justify-center items-center  bg-gray-50">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-md p-4 flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Teeth in the Report</h2>
          <SettingButton />
        </div>

        {/* Chart */}
        <div
          ref={chartContainerRef}
          className="w-full flex justify-center  overflow-x-auto overflow-y-hidden border rounded-xl"
          style={{
            maxHeight: `${maxHeight}px`,

          }}
        >
          <ToothChar selectedTooth={selectedTooth} setSelectedTooth={setSelectedTooth} />
        </div>

   
      </div>
    </div>
  );
};

export default Toothlabels;
