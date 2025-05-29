"use client"
import styles from './ToothLabels.module.css'
import ToothChar from "./ToothChar/ToothChar"
import { BsSquareFill } from "react-icons/bs";
import { FaTooth, FaRegTimesCircle } from "react-icons/fa";
import { useState } from 'react';
import SettingButton from './buttons/SettingButton';
import { Tooltip } from '@/components/ui/tooltip';

// لوحة ألوان متسقة
const COLOR_PALETTE = {
  healthy: 'rgb(var(--color-Healthy))',
  treated: 'rgb(var(--color-Treated))',
  unhealthy: 'rgb(var(--color-Unhealthy))',
  missing: 'var(--color-Missing)',
  background: 'var(--card-background-color)',
  text: 'var(--text-color)'
};

const ToothStatusIndicator = ({ icon: Icon, color, label }) => (
  <div className={styles.statusItem}>
    <Icon className={styles.statusIcon} style={{ color }} />
    <span className={styles.statusLabel} style={{ color }}>{label}</span>
  </div>
);

const Toothlabels = () => {
  const [selectedTooth, setSelectedTooth] = useState(null);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Header Section */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            Teeth in the Report
          </h2>
          <div className={styles.actions}>
            <SettingButton />
          </div>
        </div>

        {/* Teeth Chart Section */}
        <div className={styles.chartContainer}>
          <ToothChar data2={selectedTooth} />
        </div>

        {/* Status Legend */}
        {/* <div className={styles.legend}>
          <ToothStatusIndicator 
            icon={BsSquareFill} 
            color={COLOR_PALETTE.healthy} 
            label="Healthy" 
          />
          <ToothStatusIndicator 
            icon={BsSquareFill} 
            color={COLOR_PALETTE.treated} 
            label="Treated" 
          />
          <ToothStatusIndicator 
            icon={BsSquareFill} 
            color={COLOR_PALETTE.unhealthy} 
            label="Unhealthy" 
          />
          <ToothStatusIndicator 
            icon={FaRegTimesCircle} 
            color={COLOR_PALETTE.missing} 
            label="Missing" 
          />
        </div> */}
      </div>
    </div>
  );
};

export default Toothlabels;