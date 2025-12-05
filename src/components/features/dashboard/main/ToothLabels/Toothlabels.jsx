"use client";
import ToothChar from "./ToothChar/ToothChar";
import SettingButton from './buttons/SettingButton';
import { useState, useRef, useEffect, useContext, useMemo } from 'react';
import { DataContext } from "../../dashboard";
import { useDentalStore } from "@/stores/dataStore";

const Toothlabels = ({ NumberOnlyMode = false }) => {
  const { toothNumberSelect, setToothNumberSelect, selectedTeeth, setSelectedTeeth } = useContext(DataContext);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const chartContainerRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState(240);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Get tooth data from store
  const data = useDentalStore(state => state.data);

  // Helper to get all tooth numbers from data
  const allToothNumbers = useMemo(() => (data?.teeth || []).map(t => t.toothNumber), [data?.teeth]);

  // Helper to get tooth numbers by category
  const getTeethByCategory = (category) => {
    return (data?.teeth || [])
      .filter(t => t?.category === category)
      .map(t => t.toothNumber);
  };

  // Calculate counts for each category
  const categoryCounts = useMemo(() => {
    const teeth = data?.teeth || [];
    return {
      Healthy: teeth.filter(t => t?.category === 'Healthy').length,
      Treated: teeth.filter(t => t?.category === 'Treated').length,
      Missing: teeth.filter(t => t?.category === 'Missing').length,
      Unhealthy: teeth.filter(t => t?.category === 'Unhealthy').length,
      Total: teeth.length
    };
  }, [data?.teeth]);

  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight;
      const newHeight = Math.min(300, vh * 0.25);
      setMaxHeight(newHeight);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCategory = (category) => {
    const categoryTeeth = getTeethByCategory(category);
    const allSelected = categoryTeeth.every(t => selectedTeeth.includes(t));

    if (allSelected) {
      // Deselect all in category
      setSelectedTeeth(prev => prev.filter(t => !categoryTeeth.includes(t)));
    } else {
      // Select all in category
      const newSelection = [...new Set([...selectedTeeth, ...categoryTeeth])];
      setSelectedTeeth(newSelection);
    }
  };

  const toggleAllCategories = () => {
    const allSelected = allToothNumbers.every(t => selectedTeeth.includes(t));

    if (allSelected) {
      setSelectedTeeth([]);
    } else {
      setSelectedTeeth(allToothNumbers);
    }
  };

  const toggleTooth = (toothNumber) => {
    setSelectedTeeth(prev =>
      prev.includes(toothNumber)
        ? prev.filter(t => t !== toothNumber)
        : [...prev, toothNumber]
    );
  };

  const toggleSelectionMode = () => {
    if (!isSelectionMode) {
      // Entering selection mode - select all existing teeth by default
      setIsSelectionMode(true);
      setSelectedTeeth(allToothNumbers);
    } else {
      // Exiting selection mode - reset to show all teeth
      setIsSelectionMode(false);
      setSelectedTeeth([]);
    }
  };

  // Helper to check if a category is fully selected
  const isCategorySelected = (category) => {
    const categoryTeeth = getTeethByCategory(category);
    return categoryTeeth.length > 0 && categoryTeeth.every(t => selectedTeeth?.includes(t));
  };

  // Helper to check if all teeth are selected
  const isAllSelected = allToothNumbers.length > 0 && allToothNumbers.every(t => selectedTeeth?.includes(t));

  return (
    <div className="w-full flex justify-center items-center rounded-2xl overflow-hidden bg-white">
      <div className="w-full max-w-5xl bg-white items-start p-4 flex flex-col gap-1">

        {!NumberOnlyMode && <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-800">
              {isSelectionMode ? 'Select teeth' : 'Teeth in the Report'}
            </h2>
            {isSelectionMode && selectedTeeth?.length > 0 && (
              <span className="px-3 py-1 bg-[#7564ed] text-white text-sm font-semibold rounded-full ">
                {selectedTeeth.length} selected
              </span>
            )}
          </div>
          <button
            onClick={toggleSelectionMode}
            className={`px-6 py-2.5 text-base font-bold rounded-lg 
             bg-[#EBE8FC] text-[#7564ed] hover:bg-[#ddd6fc] 
              `}
          >
            {isSelectionMode ? 'Save' : 'Select teeth'}
          </button>
        </div>}

        {/* Filters / Legend Row */}
        {!NumberOnlyMode && (
          <div className="w-full flex items-center justify-start gap-1 flex-wrap">
            {isSelectionMode ? (
              // Selection Mode Filters
              <>
                <button
                  onClick={toggleAllCategories}
                  className={`px-2 py-1 rounded-full text-sm font-semibold transition-colors ${isAllSelected
                    ? 'bg-[#7564ed] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  All {categoryCounts.Total}
                </button>
                <button
                  onClick={() => toggleCategory('Healthy')}
                  className={`px-2 py-1 rounded-full text-sm font-semibold transition-colors ${isCategorySelected('Healthy')
                    ? 'bg-[#8b5cf6] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Healthy {categoryCounts.Healthy}
                </button>
                <button
                  onClick={() => toggleCategory('Treated')}
                  className={`px-2 py-1 rounded-full text-sm font-semibold transition-colors ${isCategorySelected('Treated')
                    ? 'bg-[#8b5cf6] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Treated {categoryCounts.Treated}
                </button>
                <button
                  onClick={() => toggleCategory('Missing')}
                  className={`px-2 py-1 rounded-full text-sm font-semibold transition-colors ${isCategorySelected('Missing')
                    ? 'bg-[#f43f5e] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Missing {categoryCounts.Missing}
                </button>
                <button
                  onClick={() => toggleCategory('Unhealthy')}
                  className={`px-2 py-1 rounded-full text-sm font-semibold transition-colors ${isCategorySelected('Unhealthy')
                    ? 'bg-[#f43f5e] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Unhealthy {categoryCounts.Unhealthy}
                </button>
              </>
            ) : (
              // Normal Mode Legend
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-[#0d0c22]"></div>
                  <span className="text-gray-500 font-medium">Healthy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#8b5cf6]"></div>
                  <span className="text-gray-500 font-medium">Treated</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 text-xl text-[#f43f5e] flex items-center justify-center font-bold">×</div>
                  <span className="text-gray-500 font-medium">Missing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#f43f5e]"></div>
                  <span className="text-gray-500 font-medium">Unhealthy</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chart */}
        <div
          ref={chartContainerRef}
          className="w-full flex justify-center items-center"
        >
          <ToothChar
            NumberOnlyMode={NumberOnlyMode}
            isSelectionMode={isSelectionMode}
            selectedTeeth={selectedTeeth}
            toggleTooth={toggleTooth}
          />
        </div>

      </div>
    </div>
  );
};

export default Toothlabels;
