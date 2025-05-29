'use client'; // This is required for client-side interactivity in Next.js

import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';

export default function SignaturePad() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
    setIsSaved(false);
  };

  const saveSignature = async () => {
    const canvas = canvasRef.current;
    
    // Convert canvas to image data URL
    const dataUrl = canvas.toDataURL('image/png');
    setSignatureData(dataUrl);
    setIsSaved(true);
    
    // Optionally download the signature
    // const link = document.createElement('a');
    // link.download = 'signature.png';
    // link.href = dataUrl;
    // link.click();
  };

  return (
    <div className="signature-container p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">التوقيع الإلكتروني</h2>
      
      <div className="border border-gray-300 rounded-md mb-4">
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full bg-white cursor-crosshair"
        />
      </div>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={clearSignature}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
        >
          مسح التوقيع
        </button>
        <button
          onClick={saveSignature}
          disabled={isSaved}
          className={`px-4 py-2 rounded-md ${isSaved ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
        >
          {isSaved ? 'تم الحفظ' : 'حفظ التوقيع'}
        </button>
      </div>
      
      {signatureData && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">التوقيع المحفوظ:</h3>
          <img 
            src={signatureData} 
            alt="User Signature" 
            className="border border-gray-300 p-2"
          />
        </div>
      )}
    </div>
  );
}