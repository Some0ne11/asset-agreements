import React, { useState } from 'react';
import { FileText, Download, Edit3, Calendar, Eye, ArrowLeft, X } from 'lucide-react';
import type { AgreementData } from '../types';
import { SignaturePad } from './SignaturePad';
import { generatePDF } from '../utils/pdfGenerator';

interface AgreementPreviewProps {
  data: AgreementData;
  onBack: () => void;
}

export const AgreementPreview: React.FC<AgreementPreviewProps> = ({
  data,
  onBack
}) => {
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(data.signature || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedAdditionalAssets, setSelectedAdditionalAssets] = useState<string[]>([]);

  // Common additional assets
  const additionalAssets = [
    { id: 'power-cord', name: 'Power Cord' },
    { id: 'mouse', name: 'Mouse' },
    { id: 'keyboard', name: 'Keyboard' },
    { id: 'carrying-bag', name: 'Carrying Bag' },
  ];

  // Handle signature completion
  const handleSignatureComplete = (signature: string) => {
    setSignatureData(signature);
    setShowSignaturePad(false);
  };

  // Handle PDF preview generation
  const handlePreviewPDF = async () => {
    if (!signatureData) {
      alert('Please add your signature before previewing');
      return;
    }

    setIsGenerating(true);
    try {
      const additionalAssetsData = selectedAdditionalAssets
        .map(assetId => additionalAssets.find(asset => asset.id === assetId)?.name)
        .filter((name): name is string => Boolean(name));

      const pdfDataUrl = await generatePDF({
        ...data,
        signature: signatureData,
        additionalAssets: additionalAssetsData
      }, false) as string;
      
      setPreviewUrl(pdfDataUrl);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating PDF preview:', error);
      alert('Error generating PDF preview. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!signatureData) {
      alert('Please add your signature before downloading');
      return;
    }

    setIsGenerating(true);
    try {
      const additionalAssetsData = selectedAdditionalAssets
        .map(assetId => additionalAssets.find(asset => asset.id === assetId)?.name)
        .filter((name): name is string => Boolean(name));

      await generatePDF({
        ...data,
        signature: signatureData,
        additionalAssets: additionalAssetsData
      }, true);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen py-4 sm:py-6">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Agreement Form */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold flex items-center">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="break-words">Asset Agreement</span>
            </h2>
            <p className="text-blue-100 mt-1 text-sm sm:text-base">Review and sign your agreement</p>
          </div>

          {/* Agreement Content */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center text-xs sm:text-sm text-gray-600">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="break-words">Date: {currentDate}</span>
              </div>
            </div>

            <div className="prose max-w-none">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                Asset Assignment Agreement
              </h3>
              
              <div className="bg-gray-100 p-4 sm:p-6 rounded-lg mb-4 sm:mb-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="min-w-0">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Employee Name
                    </label>
                    <p className="text-base sm:text-lg font-semibold text-gray-900 break-words">{data.name}</p>
                  </div>
                  <div className="min-w-0">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Asset Name
                    </label>
                    <p className="text-base sm:text-lg font-semibold text-gray-900 break-words">{data.assetName}</p>
                  </div>
                  <div className="min-w-0">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Asset ID
                    </label>
                    <p className="text-base sm:text-lg font-semibold text-gray-900 break-words">{data.assetId}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4 text-gray-700 leading-relaxed text-xs sm:text-sm">
                <p>
                  This agreement confirms that <strong className="break-words">{data.name}</strong> acknowledges 
                  receipt of the following company asset:
                </p>
                
                <p className="break-words">
                  <strong>Asset:</strong> {data.assetName} (ID: {data.assetId})
                  {selectedAdditionalAssets.length > 0 && (
                    <span>
                      <br />
                      <strong>Additional Assets:</strong> {selectedAdditionalAssets
                        .map(assetId => additionalAssets.find(asset => asset.id === assetId)?.name)
                        .filter((name): name is string => Boolean(name))
                        .join(', ')}
                    </span>
                  )}
                </p>

                <p>
                  By signing this agreement, the employee confirms:
                </p>

                <ul className="list-disc pl-4 sm:pl-6 space-y-1 text-xs sm:text-sm">
                  <li>Receipt of the asset in good working condition</li>
                  <li>Responsibility for the care and maintenance of the asset</li>
                  <li>Agreement to return the asset upon termination of employment</li>
                  <li>Understanding that any damage or loss may result in deduction from final pay</li>
                </ul>
              </div>

              {/* Additional Assets Section */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Additional Assets (Optional)</h4>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
                  Please check any additional assets received with the main item:
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {additionalAssets.map((asset) => (
                    <label key={asset.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAdditionalAssets.includes(asset.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAdditionalAssets([...selectedAdditionalAssets, asset.id]);
                          } else {
                            setSelectedAdditionalAssets(selectedAdditionalAssets.filter(id => id !== asset.id));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">{asset.name}</span>
                    </label>
                  ))}
                </div>
                
                {selectedAdditionalAssets.length > 0 && (
                  <div className="mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg">
                    <h5 className="text-sm font-medium text-blue-900 mb-2">Selected Additional Assets:</h5>
                    <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                      {selectedAdditionalAssets.map(assetId => {
                        const asset = additionalAssets.find(a => a.id === assetId);
                        return asset ? <li key={assetId}>• {asset.name}</li> : null;
                      })}
                    </ul>
                  </div>
                )}
              </div>

              {/* Signature Section */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
                  <h4 className="text-base sm:text-lg font-medium text-gray-900">Employee Signature</h4>
                  {!signatureData && (
                    <button
                      onClick={() => setShowSignaturePad(true)}
                      className="flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
                    >
                      <Edit3 className="h-4 w-4 mr-2 flex-shrink-0" />
                      Add Signature
                    </button>
                  )}
                </div>

                {signatureData ? (
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="border border-gray-300 rounded-lg p-3 sm:p-4 bg-gray-50 w-full sm:w-auto">
                      <img
                        src={signatureData}
                        alt="Signature"
                        className="w-full sm:max-w-xs h-16 sm:h-20 object-contain"
                      />
                    </div>
                    <button
                      onClick={() => setShowSignaturePad(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium self-start"
                    >
                      Edit Signature
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center">
                    <p className="text-gray-500 text-sm sm:text-base">Click "Add Signature" to sign this agreement</p>
                  </div>
                )}

                <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
                  Date: {currentDate}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
              <button
                onClick={onBack}
                className="flex items-center justify-center px-4 sm:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors text-sm sm:text-base w-full sm:w-auto order-2 sm:order-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2 flex-shrink-0" />
                Back
              </button>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 order-1 sm:order-2">
                <button
                  onClick={handlePreviewPDF}
                  disabled={!signatureData || isGenerating}
                  className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {isGenerating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Eye className="h-4 w-4 mr-2 flex-shrink-0" />
                  )}
                  {isGenerating ? 'Generating...' : 'Preview PDF'}
                </button>

                <button
                  onClick={handleDownloadPDF}
                  disabled={!signatureData || isGenerating}
                  className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {isGenerating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Download className="h-4 w-4 mr-2 flex-shrink-0" />
                  )}
                  {isGenerating ? 'Generating...' : 'Download PDF'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Preview Overlay Modal */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl h-full max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gray-800 text-white p-3 sm:p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold flex items-center">
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                  PDF Preview
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-300 hover:text-white p-1 rounded hover:bg-gray-700 transition-colors"
                  aria-label="Close preview"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 p-3 sm:p-4 min-h-0">
              <iframe
                src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                className="w-full h-full border border-gray-300 rounded"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* Signature Pad Modal */}
      {showSignaturePad && (
        <SignaturePad
          onSignatureComplete={handleSignatureComplete}
          onClose={() => setShowSignaturePad(false)}
        />
      )}
    </div>
  );
};