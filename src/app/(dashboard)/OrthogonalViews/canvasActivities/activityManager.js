import { CrosshairActivity } from "../hooks/crosshairHandlers";
import { SliceDragActivity } from "./Acttivites/sliceDragActivity";
import { DrawActivity } from "./Acttivites/drawActivity";
import { ZoomActivity } from "./Acttivites/zoomActivity";
import { BrightnessActivity } from "./Acttivites/brightnessActivity";
import { RulerActivity } from "./Acttivites/rulerActivity";

const ACTIVITIES = {
  "crosshair": CrosshairActivity,
  // "slice-scroll": SliceDragActivity,
  // "draw": DrawActivity,
  // "zoom": ZoomActivity,
  "brightness": BrightnessActivity,
  // "ruler": RulerActivity,
};

export const getActivityById = (id) => ACTIVITIES[id] || null;
export const getAllActivities = () => Object.values(ACTIVITIES);
