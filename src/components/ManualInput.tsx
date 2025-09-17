import React, { useState } from 'react';
import { Plus, User, Package, Tag } from 'lucide-react';
import type { AgreementData } from '../types';

interface ManualInputProps {
  onDataSubmit: (data: AgreementData) => void;
}

export const ManualInput: React.FC<ManualInputProps> = ({ onDataSubmit }) => {
  const [formData, setFormData] = useState<AgreementData>({
    name: '',
    assetName: '',
    assetId: ''
  });

  const [errors, setErrors] = useState<Partial<AgreementData>>({});

  const handleInputChange = (field: keyof AgreementData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<AgreementData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.assetName.trim()) {
      newErrors.assetName = 'Asset name is required';
    }
    
    if (!formData.assetId.trim()) {
      newErrors.assetId = 'Asset ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onDataSubmit(formData);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Manual Entry
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline h-4 w-4 mr-1" />
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleInputChange('name')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="assetName" className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="inline h-4 w-4 mr-1" />
              Asset Name
            </label>
            <input
              type="text"
              id="assetName"
              value={formData.assetName}
              onChange={handleInputChange('assetName')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.assetName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter asset name"
            />
            {errors.assetName && (
              <p className="mt-1 text-sm text-red-600">{errors.assetName}</p>
            )}
          </div>

          <div>
            <label htmlFor="assetId" className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="inline h-4 w-4 mr-1" />
              Asset ID
            </label>
            <input
              type="text"
              id="assetId"
              value={formData.assetId}
              onChange={handleInputChange('assetId')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.assetId ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter asset ID"
            />
            {errors.assetId && (
              <p className="mt-1 text-sm text-red-600">{errors.assetId}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Generate Agreement
          </button>
        </form>
      </div>
    </div>
  );
};