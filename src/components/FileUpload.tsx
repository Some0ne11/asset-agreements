import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { Upload, FileText, AlertCircle, Users, Search, RefreshCw } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { FixedSizeList as List } from 'react-window';
import type { AgreementData, ParsedRow } from '../types';

interface FileUploadProps {
  onDataParsed: (data: AgreementData[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataParsed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<AgreementData[]>([]);
  const [showSelection, setShowSelection] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [listKey, setListKey] = useState(0); // Key to force list re-render
  const [showReloadNotification, setShowReloadNotification] = useState(false);

  // Function to parse Excel (.xlsx) files
  const parseExcelFile = useCallback((file: File) => {
    return new Promise<AgreementData[]>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          
          // Convert to JSON with header row
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            reject(new Error('Excel file must have at least a header row and one data row'));
            return;
          }
          
          // Get headers and convert to lowercase for matching
          const headers = (jsonData[0] as string[]).map(h => h?.toString().toLowerCase().trim());
          const dataRows = jsonData.slice(1) as any[][];
          
          // Find column indices
          const nameIndex = headers.findIndex(h => 
            h === 'name' || h.includes('name')
          );
          const assetNameIndex = headers.findIndex(h => 
            h === 'assetname' || h === 'asset name' || h === 'asset_name' || h.includes('asset')
          );
          const assetIdIndex = headers.findIndex(h => 
            h === 'assetid' || h === 'asset id' || h === 'asset_id' || h.includes('id')
          );
          
          if (nameIndex === -1) {
            reject(new Error('Could not find "name" column in Excel file'));
            return;
          }
          
          const agreementData: AgreementData[] = dataRows
            .filter(row => row[nameIndex]) // Filter out empty rows
            .map((row, index) => ({
              id: `entry-${index}`,
              name: row[nameIndex]?.toString() || '',
              assetName: row[assetNameIndex]?.toString() || '',
              assetId: row[assetIdIndex]?.toString() || ''
            }))
            .filter(item => item.name.trim()); // Remove entries with empty names
          
          resolve(agreementData);
        } catch (err) {
          reject(new Error(`Excel parsing error: ${err instanceof Error ? err.message : 'Unknown error'}`));
        }
      };
      
      reader.onerror = () => reject(new Error('Error reading Excel file'));
      reader.readAsArrayBuffer(file);
    });
  }, []);

  // Function to parse CSV (.csv) files
  const parseCsvFile = useCallback((file: File) => {
    return new Promise<AgreementData[]>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          
          Papa.parse(content, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              try {
                const data = results.data as ParsedRow[];
                const agreementData: AgreementData[] = data
                  .filter(row => row.name || row.Name) // Filter out empty rows
                  .map((row, index) => ({
                    id: `entry-${index}`,
                    name: row.name || row.Name || '',
                    assetName: row.assetName || row['Asset Name'] || row.asset_name || '',
                    assetId: row.assetId || row['Asset ID'] || row.asset_id || ''
                  }));
                
                resolve(agreementData);
              } catch (err) {
                reject(new Error(`CSV data processing error: ${err instanceof Error ? err.message : 'Unknown error'}`));
              }
            },
            error: (error: any) => {
              reject(new Error(`CSV parsing error: ${error.message}`));
            }
          });
        } catch (err) {
          reject(new Error('Error reading CSV file'));
        }
      };

      reader.onerror = () => reject(new Error('Error reading CSV file'));
      reader.readAsText(file);
    });
  }, []);

  // Process uploaded file (CSV or Excel)
  const processFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setShowSelection(false);
    setParsedData([]);

    try {
      let agreementData: AgreementData[];

      if (file.name.endsWith('.csv')) {
        agreementData = await parseCsvFile(file);
      } else if (file.name.endsWith('.xlsx')) {
        agreementData = await parseExcelFile(file);
      } else {
        throw new Error('Please upload a CSV (.csv) or Excel (.xlsx) file ONLY');
      }

      if (agreementData.length === 0) {
        setError('No valid data found. Please ensure your file has the required columns: name, assetName, assetId');
      } else if (agreementData.length === 1) {
        // Single entry, proceed directly
        onDataParsed(agreementData);
      } else {
        // Multiple entries, show selection
        setParsedData(agreementData);
        setShowSelection(true);
        
        // Save parsed entries
        localStorage.setItem("parsedData", JSON.stringify(agreementData));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred while processing file');
    } finally {
      setIsLoading(false);
    }
  }, [onDataParsed, parseCsvFile, parseExcelFile]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  // Drag leave handler
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Drop handler
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx'))) {
      processFile(file);
    } else {
      setError('Please upload a CSV (.csv) or Excel (.xlsx) file ONLY');
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleEntrySelect = (selectedData: AgreementData) => {

    onDataParsed([selectedData]);
    setShowSelection(false);

    // Save selected agreement
    localStorage.setItem("currentAgreement", JSON.stringify(selectedData));
    localStorage.setItem("inputMode", "file");
  };

  const handleBackToUpload = () => {
    setShowSelection(false);
    setParsedData([]);
    setSearchTerm('');
    setError(null);

    // Clear persisted data
    localStorage.removeItem("currentAgreement");
    localStorage.removeItem("inputMode");
    localStorage.removeItem("parsedData");
  };

  useEffect(() => {
    const savedParsed = localStorage.getItem("parsedData");
    if (savedParsed) {
      try {
        const parsed: AgreementData[] = JSON.parse(savedParsed);
        if (parsed.length > 1) {
          setParsedData(parsed);
          setShowSelection(true);
        }
      } catch (err) {
        console.error("Error restoring parsed CSV data", err);
      }
    }
  }, []);

  const filteredData = parsedData.filter(entry => 
    entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.assetId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reload function to refresh the list
  const handleReload = useCallback(() => {
    setListKey(prev => prev + 1); // Force list re-render
    setSearchTerm(''); // Clear search to show all items
    
    // Show notification
    setShowReloadNotification(true);
    setTimeout(() => setShowReloadNotification(false), 2000); // Hide after 2 seconds
  }, []);

  // Auto-reload on screen size changes
  useEffect(() => {
    const handleResize = () => {
      setListKey(prev => prev + 1); // Force list re-render on resize
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate responsive item height based on screen size
  const itemHeight = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    return isMobile ? 160 : 110; // Optimized height for proper content display
  }, [listKey]); // listKey as dependency to recalculate on resize

  // Calculate list height based on available space and screen size
  const listHeight = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const maxItems = Math.min(filteredData.length, isMobile ? 3 : 6);
    return Math.min(maxItems * itemHeight + 20, isMobile ? 560 : 480);
  }, [filteredData.length, itemHeight, listKey]);

  // Row renderer for react-window (virtualized list)
  interface RowProps {
    index: number;
    style: React.CSSProperties;
    data: AgreementData[];
  }

  const Row = ({ index, style, data }: RowProps) => {
    const entry = data[index];
    return (
      <div style={style} className="px-1 py-1">
        <div
          className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors h-full"
          onClick={() => handleEntrySelect(entry)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 h-full">
            <div className="min-w-0">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Name
              </label>
              <p className="font-medium text-gray-900 text-sm leading-tight break-words line-clamp-2">{entry.name}</p>
            </div>
            <div className="min-w-0">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Asset Name
              </label>
              <p className="font-medium text-gray-900 text-sm leading-tight break-words line-clamp-2">{entry.assetName}</p>
            </div>
            <div className="min-w-0 sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Asset ID
              </label>
              <p className="font-medium text-gray-900 text-sm leading-tight break-words line-clamp-1">{entry.assetId}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  // End Row renderer

  if (showSelection && parsedData.length > 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2 flex-shrink-0" />
              <span className="break-words">Select Entry to Generate Agreement</span>
            </h3>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 self-start sm:self-auto">
              <button
                onClick={handleBackToUpload}
                className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium whitespace-nowrap px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Upload different file
              </button>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            Found <span className="font-bold">{parsedData.length}</span> entries.{" "} 
            {searchTerm && (
              <>
                Showing <span className="font-bold">{filteredData.length}</span> matching results.
              </>
            )}{" "}
            Select one to generate the agreement:
          </p>
          
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, asset name, or asset ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              <button
                onClick={handleReload}
                className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium whitespace-nowrap px-4 py-2 sm:py-3 rounded-lg transition-colors duration-200"
                title="Reload list"
              >
                <RefreshCw className="h-4 w-4 flex-shrink-0" />
                <span className="ml-2 hidden sm:inline">Reload List</span>
              </button>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden">
            {filteredData.length > 0 ? (
              <List
                key={listKey} // Use key to force re-render
                height={listHeight}
                itemCount={filteredData.length}
                itemSize={itemHeight}
                width="100%"
                itemData={filteredData}
                className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              >
                {Row}
              </List>
            ) : (
              <div className="text-center py-8 px-4 text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm sm:text-base">No entries match your search criteria.</p>
                <p className="text-xs sm:text-sm mt-1">Try adjusting your search terms.</p>
              </div>
            )}

            {/* Toast Notification */}
            {showReloadNotification && (
              <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-right-5 duration-300">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">List reloaded successfully!</span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />
        
        <div className="flex flex-col items-center space-y-4">
          {isLoading ? (
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
          ) : (
            <>
              <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
              <div>
                <p className="text-base sm:text-lg font-medium text-gray-900 break-words">
                  Drop your CSV or Excel file here, or click to browse
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 break-words">
                  CSV (.csv) or Excel (.xlsx) files with columns: name, assetName, assetId
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-red-700 break-words">{error}</p>
        </div>
      )}

      <div className="mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" />
          <span className="font-medium text-gray-900 text-sm sm:text-base">Expected File Format:</span>
        </div>
        <div className="text-xs sm:text-sm text-gray-600">
          <div className="bg-white p-2 sm:p-3 rounded border mb-2">
            <strong>CSV Format:</strong>
            <div className="font-mono mt-1 overflow-x-auto">
              <div className="whitespace-pre-wrap break-all sm:break-normal">
                name,assetName,assetId<br />
                John Doe,Laptop Computer,LT001<br />
                Jane Smith,Office Chair,CH002
              </div>
            </div>
          </div>
          <div className="bg-white p-2 sm:p-3 rounded border">
            <strong>Excel Format:</strong>
            <div className="mt-1">
              Excel (.xlsx) files with headers in the first row and data in subsequent rows.
              Column names should include "name", "assetName" (or "Asset Name"), and "assetId" (or "Asset ID").
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};