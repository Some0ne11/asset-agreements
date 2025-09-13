import React, { useState } from 'react';
import { FileText, Download, Edit3, Calendar, Eye } from 'lucide-react';
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

  const handleSignatureComplete = (signature: string) => {
    setSignatureData(signature);
    setShowSignaturePad(false);
  };

  const handlePreviewPDF = async () => {
    if (!signatureData) {
      alert('Please add your signature before previewing');
      return;
    }

    setIsGenerating(true);
    try {
      const pdfDataUrl = await generatePDF({
        ...data,
        signature: signatureData
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
      await generatePDF({
        ...data,
        signature: signatureData
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
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Agreement Form */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6">
            <h2 className="text-2xl font-bold flex items-center">
              <FileText className="h-6 w-6 mr-3" />
              Asset Agreement
            </h2>
            <p className="text-blue-100 mt-1">Review and sign your agreement</p>
          </div>

          {/* Agreement Content */}
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                Date: {currentDate}
              </div>
            </div>

            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Asset Assignment Agreement
              </h3>
              
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <div className="grid md:grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee Name
                    </label>
                    <p className="text-lg font-semibold text-gray-900">{data.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Asset Name
                    </label>
                    <p className="text-lg font-semibold text-gray-900">{data.assetName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Asset ID
                    </label>
                    <p className="text-lg font-semibold text-gray-900">{data.assetId}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-gray-700 leading-relaxed text-sm">
                <p>
                  This agreement confirms that <strong>{data.name}</strong> acknowledges 
                  receipt of the following company asset:
                </p>
                
                <p>
                  <strong>Asset:</strong> {data.assetName} (ID: {data.assetId})
                </p>

                <p>
                  By signing this agreement, the employee confirms:
                </p>

                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Receipt of the asset in good working condition</li>
                  <li>Responsibility for the care and maintenance of the asset</li>
                  <li>Agreement to return the asset upon termination of employment</li>
                  <li>Understanding that any damage or loss may result in deduction from final pay</li>
                </ul>
              </div>

              {/* Signature Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Employee Signature</h4>
                  {!signatureData && (
                    <button
                      onClick={() => setShowSignaturePad(true)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Add Signature
                    </button>
                  )}
                </div>

                {signatureData ? (
                  <div className="relative">
                    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 inline-block">
                      <img
                        src={signatureData}
                        alt="Signature"
                        className="max-w-xs h-20 object-contain"
                      />
                    </div>
                    <button
                      onClick={() => setShowSignaturePad(true)}
                      className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit Signature
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <p className="text-gray-500">Click "Add Signature" to sign this agreement</p>
                  </div>
                )}

                <div className="mt-4 text-sm text-gray-600">
                  Date: {currentDate}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 p-6 flex justify-between items-center">
            <button
              onClick={onBack}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
            >
              Back
            </button>

            <div className="flex space-x-3">
              <button
                onClick={handlePreviewPDF}
                disabled={!signatureData || isGenerating}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                {isGenerating ? 'Generating...' : 'Preview PDF'}
              </button>

              <button
                onClick={handleDownloadPDF}
                disabled={!signatureData || isGenerating}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isGenerating ? 'Generating...' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>

        {/* PDF Preview */}
        {showPreview && previewUrl && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-800 text-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  PDF Preview
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-300 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4">
              <iframe
                src={previewUrl}
                className="w-full h-96 border border-gray-300 rounded"
                title="PDF Preview"
              />
            </div>
          </div>
        )}
        </div>

      {showSignaturePad && (
        <SignaturePad
          onSignatureComplete={handleSignatureComplete}
          onClose={() => setShowSignaturePad(false)}
        />
      )}
    </div>
  );
};