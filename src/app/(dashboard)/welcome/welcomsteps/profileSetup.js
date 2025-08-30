"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfileSetup({ onBack, onNext, isFirstStep, isLastStep }) {
  const [profileImage, setProfileImage] = useState(null);
  const [clinicLogo, setClinicLogo] = useState(null);
  const [signature, setSignature] = useState("");
  const [signatureMode, setSignatureMode] = useState("draw");
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const svgRef = useRef(null);

  const handleImageUpload = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Signature drawing logic (identique à avant)
  const getSVGPoint = (evt) => {
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const scaleX = svg.viewBox.baseVal.width / rect.width;
    const scaleY = svg.viewBox.baseVal.height / rect.height;
    let clientX, clientY;
    if (evt.type.includes('touch')) {
      clientX = evt.touches[0].clientX;
      clientY = evt.touches[0].clientY;
    } else {
      clientX = evt.clientX;
      clientY = evt.clientY;
    }
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };
  const createSmoothPath = (points) => {
    if (points.length < 2) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX = (current.x + next.x) / 2;
      const controlY = (current.y + next.y) / 2;
      path += ` Q ${current.x} ${current.y} ${controlX} ${controlY}`;
    }
    if (points.length > 1) {
      const lastPoint = points[points.length - 1];
      path += ` T ${lastPoint.x} ${lastPoint.y}`;
    }
    return path;
  };
  const startDrawing = (evt) => {
    evt.preventDefault();
    const point = getSVGPoint(evt);
    setCurrentPath([point]);
    setIsDrawing(true);
  };
  const draw = (evt) => {
    if (!isDrawing) return;
    evt.preventDefault();
    const point = getSVGPoint(evt);
    setCurrentPath(prev => [...prev, point]);
  };
  const finishDrawing = () => {
    if (currentPath.length > 0) {
      setPaths(prev => [...prev, currentPath]);
      setCurrentPath([]);
    }
    setIsDrawing(false);
  };
  const clearSignature = () => {
    setPaths([]);
    setCurrentPath([]);
    setSignature("");
  };
  const saveSignature = () => {
    const svg = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    setSignature(svgUrl);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full flex w-full items-center justify-center px-4"
    >
      <div className="w-full max-w-lg bg-white space-y-8  border-gray-100">
        {/* Heading + logo preview */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-bold mt-2">Profile Setup</h2>
          <p className="text-sm text-gray-500 text-center max-w-xs">
            Add your profile photo, clinic logo, and signature
          </p>
        </div>

        {/* Form */}
        <div className="space-y-8">
          {/* Profile Photo */}
          <div className="space-y-2">
            <Label className="text-gray-700 font-semibold">Upload a profile picture</Label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-2xl mb-1">👤</div>
                  </div>
                )}
              </div>
              <div className="flex-1 flex items-center">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, setProfileImage)}
                  className="hidden"
                  id="profile-upload"
                />
                <label
                  htmlFor="profile-upload"
                  className="inline-block px-5 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-700 font-semibold cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition"
                  style={{ boxShadow: 'none' }}
                >
                  Upload picture
                </label>
              </div>
            </div>
          </div>

          {/* Clinic Logo */}
          <div className="space-y-2">
            <Label className="text-gray-700 font-semibold">Upload a clinic logo</Label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden">
                {clinicLogo ? (
                  <img
                    src={clinicLogo}
                    alt="Clinic Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-2xl mb-1">🏥</div>
                  </div>
                )}
              </div>
              <div className="flex-1 flex items-center">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, setClinicLogo)}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-block px-5 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-700 font-semibold cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition"
                  style={{ boxShadow: 'none' }}
                >
                  Upload picture
                </label>
              </div>
            </div>
          </div>

          {/* Digital Signature */}
          <div className="space-y-3">
            <Label className="text-gray-700 font-semibold">Digital Signature</Label>
            {/* Signature Mode Toggle supprimé, on garde que Draw */}
            <div className="border border-gray-300 rounded-lg bg-white p-4">
              <svg
                ref={svgRef}
                width="100%"
                height="180"
                viewBox="0 0 400 180"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={finishDrawing}
                onMouseLeave={finishDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={finishDrawing}
                className="cursor-crosshair w-full block"
                style={{ touchAction: 'none' }}
              >
                {/* Ligne guide au centre */}
                <line x1="20" y1="90" x2="380" y2="90" stroke="#e5e7eb" strokeWidth="2" strokeDasharray="6,6" />
                {/* Render signature paths */}
                {paths.map((path, index) => (
                  <path
                    key={index}
                    d={createSmoothPath(path)}
                    stroke="#111827"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
                {currentPath.length > 0 && (
                  <path
                    d={createSmoothPath(currentPath)}
                    stroke="#111827"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>
              {/* Actions */}
              <div className="mt-3 flex justify-between items-center text-sm text-gray-500">
                <span>Draw your signature above</span>
                <div className="flex gap-2">
                  <Button variant="ghost" className="text-xs text-red-500 px-2 py-1" onClick={clearSignature}>
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center px-6 py-2 rounded-full border bg-white text-black border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              <span className="mr-2">&#8592;</span> Go back
            </button>
            <button
              type="submit"
              onClick={onNext}
              className="px-6 py-2 rounded-full bg-black text-white font-semibold hover:bg-gray-900 transition-all duration-200"
            >
              Finish
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}