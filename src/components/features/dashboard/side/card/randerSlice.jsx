"use client";
import React, { useState, useEffect } from 'react';
import { CroppedSlice } from '@/utils/CroppedSliceUtils';
import { useDentalStore } from '@/stores/dataStore';

function RenderAllSlices({ teeth, isDragging, sliceDrager, ToothSlicemode }) {

  if (!teeth) {
    return <div className="p-6 text-red-500">No tooth data available</div>;
  }
  const tooth = teeth;
  const removeToothSlice = useDentalStore(state => state.removeToothSlice);
  const addToothSlice = useDentalStore(state => state.addToothSlice);
  const [sliceselectlocal, setsliceselectlocal] = useState({ "view": null, "slice": null })
  if (!tooth.slice) {
    return <div className="p-6 text-red-500">No slice data available</div>;
  }

  const [isHovering, setIsHovering] = useState(false);
  const [draggingSlice, setDraggingSlice] = useState(null);

  // ندمج الكل مع بعض (Axial + Sagittal + Coronal)
  const allSlices = [
    ...(tooth.slice.axial?.map((idx) => ({ view: "axial", index: idx })) || []),
    ...(tooth.slice.sagittal?.map((idx) => ({ view: "sagittal", index: idx })) || []),
    ...(tooth.slice.coronal?.map((idx) => ({ view: "coronal", index: idx })) || []),
  ];

  const handleDelete = (view, index) => {
    removeToothSlice(tooth.toothNumber, view, index);
  };

  return (
    <div
      onMouseEnter={() => {
        setIsHovering(true);
      }}
      className="relative h-fit   flex flex-wrap gap-1 ">
      {allSlices.map((slice) => (
        <div
          key={`${slice.view}-${slice.index}`}
          draggable
          onDragStart={() => setDraggingSlice(slice)}
          onDragEnd={() => setDraggingSlice(null)}
        >
          <CroppedSlice
            ToothSlicemode={ToothSlicemode}
            view={slice.view}
            index={slice.index}
            onDelete={handleDelete}
          />
        </div>
      ))}

      {/* Add Image Card */}
      {ToothSlicemode && (
        <div
          className="h-[140px] w-[140px] flex flex-col items-center justify-center border-2 border-dashed border-[#7564ed] bg-white rounded-2xl cursor-pointer hover:bg-[#f8f7ff] transition-colors gap-1"
        >
          <span className="text-[#7564ed] text-lg font-bold">Add image</span>
          <span className="text-sm text-gray-400 text-center leading-tight px-1">drag&drop images here</span>
        </div>
      )}

      {isDragging && (
        <div
          className="absolute inset-0 z-[1000] p-20 flex flex-col items-center justify-center 
                     bg-white opacity-80 border-4 border-dashed hover:[border-style:solid] border-[#7564ed] 
                     rounded-2xl text-center transition-all duration-200"
          onMouseEnter={() => {
            setsliceselectlocal(sliceDrager)
            setIsHovering(true)
          }}
          onMouseUp={() => {
            if (sliceDrager && sliceDrager.view && sliceDrager.index != null) {
              console.log("Dropping slice:", sliceDrager);
              addToothSlice(tooth.toothNumber, sliceDrager.view, sliceDrager.index);
            }
          }}
          onMouseLeave={() => { setIsHovering(false); setsliceselectlocal({ "view": null, "slice": null }) }}
        >
          <p className="text-gray-600 font-medium">Add slice</p>
          <p className="text-sm text-gray-400">drag & drop slices here</p>
        </div>
      )}
    </div>
  );
}

export default RenderAllSlices;
