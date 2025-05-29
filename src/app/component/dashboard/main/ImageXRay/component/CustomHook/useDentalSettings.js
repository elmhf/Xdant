"use client";
import { useState } from 'react';

export const useDentalSettings = () => {



  const updateSettingProblem = (problemsArray,setSettingList) => {
    // Create an object where each problem in the array will be set to true
    const updatedProblems = problemsArray.reduce((acc, problem) => {
      acc[`show${problem}`] = true; // Set each problem to `true`
      return acc;
    }, {});
    
    // Update the state with   the new problems
    setSettingList(prevSettings => ({
      ...prevSettings,
      problems: {
        ...updatedProblems, // Merge the new problems into the existing problems
      },
    }));
  };



  const [settings, setSettings] = useState({
    brightness: 100,
    contrast: 100,
    zoom: 100,
    showTeeth: true,
    showJaw: true,
    showRoots: false,
    showEndo:true,
    showCrown:true,
    showNerves: false,
    showNumbering: true,
    showCaries: true,
    problems:{
      showNerves: false,
      showNumbering: true,
      showCaries: true,
      showNumbering: true,
      showNumbering: true,
      showdfghjk: true,
    },
  });

  const SettingChange = (key, value, chapter = null) => {
    
    setSettings(prev => {
      let newSettings = { ...prev }; 
  
      if (chapter === "problems") {
        newSettings.problems = { ...newSettings.problems, [key]: value };
      } else {
        newSettings[key] = value; 
      }
  
      if (key === 'showTeeth' && value === false) {
        newSettings.showRoots = false;
        newSettings.showNerves = false;
      }
  
      // Special case for `brightness`
      if (key === 'brightness') {
        
      }
  
      return newSettings;
    });
  };
  

  const resetSettings = () => {
    setSettings({
      brightness: 100,
      contrast: 100,
      zoom: 100,
      showTeeth: true,
      showJaw: false,
      showRoots: false,
      showNerves: false,
      showNumbering: true,
      showCaries: true,
      problems:{
        showNerves: false,
        showNumbering: true,
        showCaries: true,
        showNumbering: true,
        showNumbering: true,
        showdfghjk: true,
      },
    });
  };

  return { settings, SettingChange,updateSettingProblem, resetSettings,setSettings };
};