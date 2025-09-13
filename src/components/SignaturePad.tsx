import React, { useRef, useEffect, useState } from 'react';
import SignaturePadLib from 'signature_pad';
import { PenTool, RotateCcw, Check } from 'lucide-react';

interface SignaturePadProps {
  onSignatureComplete: (signature: string) => void;
  onClose: () => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSignatureComplete,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePadLib | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      
      // Set canvas size
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';

      signaturePadRef.current = new SignaturePadLib(canvas, {
        backgroundColor: 'white',
        penColor: 'black',
        minWidth: 1,
        maxWidth: 3,
        throttle: 16,
        minDistance: 5,
      });

      // Listen for signature events
      const handleBeginStroke = () => {
        setIsEmpty(false);
      };

      const handleEndStroke = () => {
        // Additional validation can be added here
      };

      signaturePadRef.current.addEventListener('beginStroke', handleBeginStroke);
      signaturePadRef.current.addEventListener('endStroke', handleEndStroke);

      // Handle window resize
      const handleResize = () => {
        if (canvas && signaturePadRef.current) {
          const newRect = canvas.getBoundingClientRect();
          const newDpr = window.devicePixelRatio || 1;
          
          // Save current signature data
          const signatureData = signaturePadRef.current.isEmpty() ? null : signaturePadRef.current.toData();
          
          canvas.width = newRect.width * newDpr;
          canvas.height = newRect.height * newDpr;
          
          const newCtx = canvas.getContext('2d');
          if (newCtx) {
            newCtx.scale(newDpr, newDpr);
          }
          
          canvas.style.width = newRect.width + 'px';
          canvas.style.height = newRect.height + 'px';
          
          // Restore signature data if it existed
          if (signatureData && signatureData.length > 0) {
            signaturePadRef.current.fromData(signatureData);
            setIsEmpty(false);
          } else {
            signaturePadRef.current.clear();
            setIsEmpty(true);
          }
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (signaturePadRef.current) {
          signaturePadRef.current.removeEventListener('beginStroke', handleBeginStroke);
          signaturePadRef.current.removeEventListener('endStroke', handleEndStroke);
        }
      };
    }
  }, []);

  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setIsEmpty(true);
    }
  };

  const saveSignature = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      try {
        const signatureData = signaturePadRef.current.toDataURL('image/png', 1.0);
        onSignatureComplete(signatureData);
      } catch (error) {
        console.error('Error saving signature:', error);
        alert('Error saving signature. Please try again.');
      }
    } else {
      alert('Please provide a signature before saving.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <PenTool className="h-5 w-5 mr-2" />
            Digital Signature
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Please sign in the area below using your finger or stylus
          </p>
        </div>

        <div className="flex-1 p-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            <canvas
              ref={canvasRef}
              className="w-full h-64 bg-white rounded cursor-crosshair border border-gray-200"
              style={{ 
                touchAction: 'none',
                width: '100%',
                height: '256px'
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {isEmpty ? 'Canvas is ready for signature' : 'Signature captured'}
          </p>
        </div>

        <div className="p-6 border-t flex justify-between">
          <button
            onClick={clearSignature}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            disabled={isEmpty}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear
          </button>

          <div className="space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveSignature}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="h-4 w-4 mr-2" />
              Use Signature
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};