import React, { useRef, useEffect, useState } from 'react';
import SignaturePadLib from 'signature_pad';
import { PenTool, RotateCcw, Check, X } from 'lucide-react';

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

  // Fixed canvas dimensions for consistency across all devices
  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 200;

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      
      // Set fixed canvas size for consistency
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = CANVAS_WIDTH * dpr;
      canvas.height = CANVAS_HEIGHT * dpr;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      
      // Set CSS size to match logical canvas size
      canvas.style.width = CANVAS_WIDTH + 'px';
      canvas.style.height = CANVAS_HEIGHT + 'px';

      signaturePadRef.current = new SignaturePadLib(canvas, {
        backgroundColor: 'white',
        penColor: 'black',
        minWidth: 1.5,
        maxWidth: 2.5,
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

      // Handle window resize - maintain fixed canvas size
      const handleResize = () => {
        if (canvas && signaturePadRef.current) {
          const newDpr = window.devicePixelRatio || 1;
          
          // Save current signature data
          const signatureData = signaturePadRef.current.isEmpty() ? null : signaturePadRef.current.toData();
          
          // Reset canvas with fixed dimensions
          canvas.width = CANVAS_WIDTH * newDpr;
          canvas.height = CANVAS_HEIGHT * newDpr;
          
          const newCtx = canvas.getContext('2d');
          if (newCtx) {
            newCtx.scale(newDpr, newDpr);
          }
          
          canvas.style.width = CANVAS_WIDTH + 'px';
          canvas.style.height = CANVAS_HEIGHT + 'px';
          
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Fixed width modal container for consistency */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <PenTool className="h-6 w-6 mr-2 flex-shrink-0" />
                Digital Signature
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Sign using your mouse, trackpad, stylus, or finger
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 p-6 flex flex-col justify-center items-center overflow-auto">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            <canvas
              ref={canvasRef}
              className="bg-white rounded cursor-crosshair border border-gray-200 block"
              style={{ 
                touchAction: 'none',
                width: `${CANVAS_WIDTH}px`,
                height: `${CANVAS_HEIGHT}px`,
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            />
          </div>
          
          {/* Status Text */}
          <div className="flex items-center justify-center mt-4">
            <p className="text-sm text-gray-500">
              {isEmpty ? (
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                  Ready for signature
                </span>
              ) : (
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Signature captured
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex justify-between items-center">
            {/* Clear Button */}
            <button
              onClick={clearSignature}
              className="flex items-center justify-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
              disabled={isEmpty}
            >
              <RotateCcw className="h-4 w-4 mr-2 flex-shrink-0" />
              Clear Signature
            </button>

            {/* Primary Actions */}
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-base"
              >
                Cancel
              </button>
              <button
                onClick={saveSignature}
                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
                disabled={isEmpty}
              >
                <Check className="h-4 w-4 mr-2 flex-shrink-0" />
                Use Signature
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};