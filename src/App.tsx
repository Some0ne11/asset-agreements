import { useState } from 'react';
import { FileUp, Edit, FileText } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { ManualInput } from './components/ManualInput';
import { AgreementPreview } from './components/AgreementPreview';
import type { AgreementData } from './types';

type ViewMode = 'input' | 'preview';
type InputMode = 'file' | 'manual';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('input');
  const [inputMode, setInputMode] = useState<InputMode>('file');
  const [currentAgreement, setCurrentAgreement] = useState<AgreementData | null>(null);

  const handleFileDataParsed = (data: AgreementData[]) => {
    if (data.length > 0) {
      // For now, we'll handle the first entry. In a full app, you'd want to handle multiple entries
      setCurrentAgreement(data[0]);
      setViewMode('preview');
    }
  };

  const handleManualDataSubmit = (data: AgreementData) => {
    setCurrentAgreement(data);
    setViewMode('preview');
  };

  const handleBackToInput = () => {
    setViewMode('input');
    setCurrentAgreement(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
            Agreement Generator
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4 leading-relaxed">
            Generate professional asset agreements with digital signatures. 
            Upload CSV data or enter information manually.
          </p>
        </div>

        {viewMode === 'input' ? (
          <div className="space-y-6 sm:space-y-8">
            {/* Input Mode Toggle */}
            <div className="flex justify-center px-4">
              <div className="bg-white rounded-lg p-1 sm:p-2 shadow-md w-full max-w-md sm:w-auto">
                <div className="flex">
                  <button
                    onClick={() => setInputMode('file')}
                    className={`flex items-center justify-center flex-1 sm:flex-none sm:px-6 px-4 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                      inputMode === 'file'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <FileUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                    <span className="truncate">Upload File</span>
                  </button>
                  <button
                    onClick={() => setInputMode('manual')}
                    className={`flex items-center justify-center flex-1 sm:flex-none sm:px-6 px-4 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                      inputMode === 'manual'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Edit className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                    <span className="truncate">Manual Entry</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Input Component */}
            <div className="w-full">
              {inputMode === 'file' ? (
                <FileUpload onDataParsed={handleFileDataParsed} />
              ) : (
                <ManualInput onDataSubmit={handleManualDataSubmit} />
              )}
            </div>
          </div>
        ) : (
          currentAgreement && (
            <div className="w-full">
              <AgreementPreview
                data={currentAgreement}
                onBack={handleBackToInput}
              />
            </div>
          )
        )}

        {/* Features Section */}
        {viewMode === 'input' && (
          <div className="mt-12 sm:mt-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md text-center">
                <FileUp className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  File Upload
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Upload CSV files with employee and asset information for bulk processing
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md text-center">
                <Edit className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  Manual Entry
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Enter individual employee and asset details through our intuitive form
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md text-center sm:col-span-2 lg:col-span-1">
                <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  Digital Signature
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Capture signatures on any device and generate professional PDF agreements
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;