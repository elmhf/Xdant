import { getActivityById } from "./activityManager";
import { useSettingsStore } from "../stores/useSettingsStore";

export function useActivityManager(state) {
  const activeActivities = useSettingsStore((s) => s.activeActivities);
  const activities = activeActivities.map(getActivityById).filter(Boolean);

  // Handler functions for Konva events
  // These handlers are now sourced from crosshairHandlers.js via activityManager.js
  const handleMouseDown = (e) => {
    activities.forEach((activity) => activity.onMouseDown?.(e, state));
  };
  const handleMouseMove = (e) => {
    activities.forEach((activity) => activity.onMouseMove?.(e, state));
  };
  const handleMouseUp = (e) => {
    activities.forEach((activity) => activity.onMouseUp?.(e, state));
  };
  const handleWheel = (e) => {
    activities.forEach((activity) => activity.onWheel?.(e, state));
  };
  const handleDblClick = (e) => {
    activities.forEach((activity) => activity.onDblClick?.(e, state));
  };
  const handleMouseLeave = (e) => {
    activities.forEach((activity) => activity.onMouseLeave?.(e, state));
  };
  const handleClick = (e) => {
    activities.forEach((activity) => activity.onClick?.(e, state));
  };
  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleDblClick,handleMouseLeave
    ,handleClick
  };
}
