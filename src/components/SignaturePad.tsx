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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        minWidth: isMobile ? 2 : 1,
        maxWidth: isMobile ? 4 : 3,
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
  }, [isMobile]);

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
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                <PenTool className="h-5 w-5 sm:h-6 sm:w-6 mr-2 flex-shrink-0" />
                Digital Signature
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {isMobile 
                  ? 'Use your finger to sign below'
                  : 'Sign using your mouse, trackpad, or stylus'
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors sm:hidden"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 p-3 sm:p-6 overflow-hidden">
          <div className="h-full flex flex-col max-h-full">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 sm:p-4 bg-gray-50 flex-1 overflow-hidden">
              <canvas
                ref={canvasRef}
                className="w-full bg-white rounded cursor-crosshair border border-gray-200 block"
                style={{ 
                  touchAction: 'none',
                  height: isMobile ? '180px' : '240px',
                  maxWidth: '100%'
                }}
              />
            </div>
            
            {/* Status Text */}
            <div className="flex items-center justify-between mt-3 sm:mt-4">
              <p className="text-xs sm:text-sm text-gray-500">
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
              
              {isMobile && (
                <p className="text-xs text-gray-400">
                  Rotate device for larger canvas
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-3 sm:p-6 border-t border-gray-200 bg-gray-50 sm:bg-white">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
            {/* Clear Button */}
            <button
              onClick={clearSignature}
              className="flex items-center justify-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              disabled={isEmpty}
            >
              <RotateCcw className="h-4 w-4 mr-2 flex-shrink-0" />
              Clear Signature
            </button>

            {/* Primary Actions */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={onClose}
                className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={saveSignature}
                className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base order-1 sm:order-2"
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