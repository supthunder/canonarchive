'use client';
import { useState, useCallback } from 'react';
import { AdvancedFilterCriteria, FilterOption } from '@/types/product';

interface AdvancedFiltersProps {
  onFilterChange: (filters: AdvancedFilterCriteria) => void;
  filterOptions: {
    categories: FilterOption[];
    megapixels: FilterOption[];
    sensorSizes: FilterOption[];
    sensorTypes: FilterOption[];
    eras: FilterOption[];
    deviceTypes: FilterOption[];
    features: FilterOption[];
  };
  loading?: boolean;
}

export default function AdvancedFilters({ 
  onFilterChange, 
  filterOptions, 
  loading 
}: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<AdvancedFilterCriteria>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilters = useCallback((newFilters: Partial<AdvancedFilterCriteria>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  }, [filters, onFilterChange]);

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof AdvancedFilterCriteria];
    return value !== undefined && value !== null && 
           (Array.isArray(value) ? value.length > 0 : true);
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Main Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder='Try "12.1", "ccd", "zoom", "2010s", or any camera feature...'
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            value={filters.search || ''}
            onChange={(e) => updateFilters({ search: e.target.value })}
            disabled={loading}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* Quick Examples */}
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Quick examples:</span>
          {[
            { label: '12.1MP', search: '12.1' },
            { label: 'CCD sensors', search: 'ccd' },
            { label: '2010s cameras', search: '2010s' },
            { label: 'Zoom lenses', search: 'zoom' }
          ].map((example) => (
            <button
              key={example.label}
              onClick={() => updateFilters({ search: example.search })}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
              disabled={loading}
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Filters Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            multiple
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            size={3}
            value={filters.categories || []}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              updateFilters({ categories: values });
            }}
            disabled={loading}
          >
            {filterOptions.categories.slice(0, 10).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.count})
              </option>
            ))}
          </select>
        </div>

        {/* Megapixels */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Megapixels</label>
          <select
            multiple
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            size={3}
            value={filters.megapixels?.values?.map(v => `${v}MP`) || []}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => 
                parseFloat(option.value.replace('MP', ''))
              );
              updateFilters({ 
                megapixels: values.length > 0 ? { values } : undefined 
              });
            }}
            disabled={loading}
          >
            {filterOptions.megapixels.slice(0, 10).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.count})
              </option>
            ))}
          </select>
        </div>

        {/* Sensor Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sensor Type</label>
          <select
            multiple
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            size={3}
            value={filters.sensorTypes || []}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              updateFilters({ sensorTypes: values });
            }}
            disabled={loading}
          >
            {filterOptions.sensorTypes.slice(0, 10).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.count})
              </option>
            ))}
          </select>
        </div>

        {/* Eras */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Era</label>
          <select
            multiple
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            size={3}
            value={filters.eras || []}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              updateFilters({ eras: values });
            }}
            disabled={loading}
          >
            {filterOptions.eras.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
          disabled={loading}
        >
          <svg 
            className={`w-4 h-4 mr-2 transform transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Advanced Filters
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-red-600 font-medium"
            disabled={loading}
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="border-t pt-4 space-y-4">
          {/* Megapixel Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Megapixels Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  step="0.1"
                  min="0"
                  max="100"
                  className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                  value={filters.megapixels?.min || ''}
                  onChange={(e) => {
                    const min = e.target.value ? parseFloat(e.target.value) : undefined;
                    updateFilters({
                      megapixels: { ...filters.megapixels, min }
                    });
                  }}
                  disabled={loading}
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  step="0.1"
                  min="0"
                  max="100"
                  className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                  value={filters.megapixels?.max || ''}
                  onChange={(e) => {
                    const max = e.target.value ? parseFloat(e.target.value) : undefined;
                    updateFilters({
                      megapixels: { ...filters.megapixels, max }
                    });
                  }}
                  disabled={loading}
                />
                <span className="text-gray-500 text-sm">MP</span>
              </div>
            </div>

            {/* Focal Length Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Focal Length Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  max="2000"
                  className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                  value={filters.focalLengthMin || ''}
                  onChange={(e) => {
                    const min = e.target.value ? parseFloat(e.target.value) : undefined;
                    updateFilters({ focalLengthMin: min });
                  }}
                  disabled={loading}
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  max="2000"
                  className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                  value={filters.focalLengthMax || ''}
                  onChange={(e) => {
                    const max = e.target.value ? parseFloat(e.target.value) : undefined;
                    updateFilters({ focalLengthMax: max });
                  }}
                  disabled={loading}
                />
                <span className="text-gray-500 text-sm">mm</span>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="From"
                  min="1950"
                  max="2024"
                  className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                  value={filters.marketedAfter || ''}
                  onChange={(e) => updateFilters({ marketedAfter: e.target.value })}
                  disabled={loading}
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="To"
                  min="1950"
                  max="2024"
                  className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                  value={filters.marketedBefore || ''}
                  onChange={(e) => updateFilters({ marketedBefore: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Sensor Sizes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sensor Sizes</label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.sensorSizes.slice(0, 12).map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={filters.sensorSizes?.includes(String(option.value)) || false}
                    onChange={(e) => {
                      const currentSizes = filters.sensorSizes || [];
                      const sizeValue = String(option.value);
                      
                      if (e.target.checked) {
                        updateFilters({ 
                          sensorSizes: [...currentSizes, sizeValue] 
                        });
                      } else {
                        updateFilters({ 
                          sensorSizes: currentSizes.filter(s => s !== sizeValue) 
                        });
                      }
                    }}
                    disabled={loading}
                  />
                  <span className="text-sm">
                    {option.label} ({option.count})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.features.slice(0, 15).map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={filters.searchTags?.includes(String(option.value)) || false}
                    onChange={(e) => {
                      const currentTags = filters.searchTags || [];
                      const tagValue = String(option.value);
                      
                      if (e.target.checked) {
                        updateFilters({ 
                          searchTags: [...currentTags, tagValue] 
                        });
                      } else {
                        updateFilters({ 
                          searchTags: currentTags.filter(t => t !== tagValue) 
                        });
                      }
                    }}
                    disabled={loading}
                  />
                  <span className="text-sm capitalize">
                    {option.label} ({option.count})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Zoom Filter */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={filters.hasZoom || false}
                onChange={(e) => updateFilters({ hasZoom: e.target.checked })}
                disabled={loading}
              />
              <span className="text-sm font-medium">Has Zoom Lens</span>
            </label>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            {filters.search && (
                           <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
               Search: &quot;{filters.search}&quot;
                <button 
                  onClick={() => updateFilters({ search: undefined })}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            
            {filters.categories?.map((category) => (
              <span key={category} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {category}
                <button 
                  onClick={() => updateFilters({ 
                    categories: filters.categories?.filter(c => c !== category) 
                  })}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            ))}
            
            {filters.sensorTypes?.map((type) => (
              <span key={type} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                {type} sensor
                <button 
                  onClick={() => updateFilters({ 
                    sensorTypes: filters.sensorTypes?.filter(t => t !== type) 
                  })}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            ))}
            
            {filters.megapixels?.values?.map((mp) => (
              <span key={mp} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                {mp}MP
                <button 
                  onClick={() => updateFilters({ 
                    megapixels: { 
                      ...filters.megapixels, 
                      values: filters.megapixels?.values?.filter(v => v !== mp) 
                    }
                  })}
                  className="ml-1 text-orange-600 hover:text-orange-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 