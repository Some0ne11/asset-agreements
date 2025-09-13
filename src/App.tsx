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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Agreement Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Generate professional asset agreements with digital signatures. 
            Upload CSV data or enter information manually.
          </p>
        </div>

        {viewMode === 'input' ? (
          <div className="space-y-8">
            {/* Input Mode Toggle */}
            <div className="flex justify-center">
              <div className="bg-white rounded-lg p-2 shadow-md">
                <div className="flex">
                  <button
                    onClick={() => setInputMode('file')}
                    className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                      inputMode === 'file'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <FileUp className="h-5 w-5 mr-2" />
                    Upload File
                  </button>
                  <button
                    onClick={() => setInputMode('manual')}
                    className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                      inputMode === 'manual'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Edit className="h-5 w-5 mr-2" />
                    Manual Entry
                  </button>
                </div>
              </div>
            </div>

            {/* Input Component */}
            {inputMode === 'file' ? (
              <FileUpload onDataParsed={handleFileDataParsed} />
            ) : (
              <ManualInput onDataSubmit={handleManualDataSubmit} />
            )}
          </div>
        ) : (
          currentAgreement && (
            <AgreementPreview
              data={currentAgreement}
              onBack={handleBackToInput}
            />
          )
        )}

        {/* Features Section */}
        {viewMode === 'input' && (
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <FileUp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                File Upload
              </h3>
              <p className="text-gray-600">
                Upload CSV files with employee and asset information for bulk processing
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <Edit className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Manual Entry
              </h3>
              <p className="text-gray-600">
                Enter individual employee and asset details through our intuitive form
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Digital Signature
              </h3>
              <p className="text-gray-600">
                Capture signatures on any device and generate professional PDF agreements
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;