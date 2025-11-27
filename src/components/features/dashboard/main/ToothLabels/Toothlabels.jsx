"use client";
import ToothChar from "./ToothChar/ToothChar";
import SettingButton from './buttons/SettingButton';
import { useState, useRef, useEffect, useContext } from 'react';
import { DataContext } from "../../dashboard"; // أو المسار الصحيح

const Toothlabels = ({NumberOnlyMode=false}) => {
  const { ToothNumberSelect, setToothNumberSelect } = useContext(DataContext);
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
    <div className="w-full flex justify-center items-center  rounded-2xl  overflow-hidden bg-white ">
      <div className="w-full max-w-5xl bg-white items-start  p-4 flex flex-col gap-4">
        
        {!NumberOnlyMode &&    <div className="flex">
          <h2 className="text-2xl font-bold text-gray-800">Teeth in the Report</h2>
        </div>}
    


        {/* Chart */}
        <div
          ref={chartContainerRef}
          className="w-full flex-col items-center flex "
        >
                  {   !NumberOnlyMode &&     <div className="flex items-center gap-4 mb-2 w-fitt">
          <span className="flex items-center gap-1 text-gray-500 text-base">
            <span className="inline-block w-4 h-4 rounded-full border-2 border-[#0d0c22]"></span>
            Healthy
          </span>
          <span className="flex items-center gap-1 text-gray-500 text-base">
            <span className="inline-block w-4 h-4 rounded-full" style={{ background: '#8b5cf6' }}></span>
            Treated
          </span>
          <span className="flex items-center gap-1 text-gray-500 text-base">
            <span className=" w-4 h-4 text-xl text-red-500 flex items-center justify-center">×</span>
            Missing
          </span>
          <span className="flex items-center gap-1 text-gray-500 text-base">
            <span className="inline-block w-4 h-4 rounded-full" style={{ background: '#f43f5e' }}></span>
            Unhealthy
          </span>
        </div>}


          <ToothChar  NumberOnlyMode={NumberOnlyMode}/>
        </div>

   
      </div>
    </div>
  );
};

export default Toothlabels;
