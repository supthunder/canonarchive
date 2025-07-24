'use client';
import { useState, useEffect, useCallback } from 'react';
import AdvancedFilters from './components/AdvancedFilters';
import ProductGrid from './components/ProductGrid';
import { AdvancedFilterCriteria, SearchResult } from '@/types/product';

export default function CanonArchive() {
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data on mount
  useEffect(() => {
    handleFilterChange({});
  }, []);

  const handleFilterChange = useCallback(async (filters: AdvancedFilterCriteria) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/smart-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        throw new Error('Failed to search products');
      }

      const result: SearchResult = await response.json();
      setSearchResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const hasSearchTerm = searchResult?.products && 
    Object.keys(searchResult.products.length > 0 ? {} : {}).length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                📷 Canon Archive
                <span className="ml-3 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Smart Search Engine
                </span>
              </h1>
              <p className="mt-2 text-gray-600">
                Explore 908 Canon cameras with intelligent filtering - find your perfect camera by megapixels, sensor type, and more!
              </p>
            </div>
            
            {/* Statistics */}
            {searchResult && (
              <div className="hidden md:block text-right">
                <div className="text-sm text-gray-500">
                  Showing {formatNumber(searchResult.total)} of {formatNumber(searchResult.statistics.totalProducts)} cameras
                </div>
                {searchResult.statistics.averageMegapixels > 0 && (
                  <div className="text-xs text-gray-400">
                    Average: {searchResult.statistics.averageMegapixels}MP
                    {searchResult.statistics.megapixelRange.min > 0 && 
                      ` • Range: ${searchResult.statistics.megapixelRange.min}-${searchResult.statistics.megapixelRange.max}MP`
                    }
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Advanced Filters */}
        <AdvancedFilters
          onFilterChange={handleFilterChange}
          filterOptions={searchResult?.filters || {
            categories: [],
            megapixels: [],
            sensorSizes: [],
            sensorTypes: [],
            eras: [],
            deviceTypes: [],
            features: []
          }}
          loading={loading}
        />

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-red-400">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Search Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}. Please try again or contact support if the problem persists.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        {searchResult && !loading && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="text-blue-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-blue-800">
                  Found {formatNumber(searchResult.total)} cameras
                </h3>
                <div className="mt-1 text-sm text-blue-700">
                  {searchResult.total === searchResult.statistics.totalProducts ? (
                    'Showing all Canon cameras in the archive'
                  ) : (
                    <>
                      Filtered from {formatNumber(searchResult.statistics.totalProducts)} total cameras
                      {searchResult.statistics.topCategories.length > 0 && (
                        <span className="ml-2">
                          • Top categories: {searchResult.statistics.topCategories.slice(0, 3).map(c => c.label).join(', ')}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {searchResult && searchResult.total > 0 && !loading && (
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{formatNumber(searchResult.total)}</div>
              <div className="text-sm text-gray-500">Cameras Found</div>
            </div>
            
            {searchResult.statistics.averageMegapixels > 0 && (
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-green-600">
                  {searchResult.statistics.averageMegapixels}
                </div>
                <div className="text-sm text-gray-500">Average MP</div>
              </div>
            )}
            
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-purple-600">
                {searchResult.filters.categories.length}
              </div>
              <div className="text-sm text-gray-500">Categories</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-orange-600">
                {searchResult.filters.eras.length}
              </div>
              <div className="text-sm text-gray-500">Eras</div>
            </div>
          </div>
        )}

        {/* Help Text for First-Time Users */}
        {searchResult && searchResult.total === searchResult.statistics.totalProducts && !loading && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-yellow-400">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  💡 Pro Tips for Smart Searching
                </h3>
                <div className="mt-2 text-sm text-yellow-700 space-y-1">
                  <div>• <strong>Search "12.1" or "20MP"</strong> to find cameras by exact megapixels</div>
                  <div>• <strong>Search "ccd" or "cmos"</strong> to filter by sensor technology</div>
                  <div>• <strong>Search "2010s" or "1990s"</strong> to explore cameras by era</div>
                  <div>• <strong>Search "zoom" or "stabilization"</strong> to find cameras with specific features</div>
                  <div>• <strong>Use Advanced Filters</strong> for precise megapixel ranges and sensor sizes</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <ProductGrid 
          products={searchResult?.products || []} 
          loading={loading}
        />

        {/* Load More / Pagination could go here */}
        {searchResult && searchResult.total > 50 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Showing first 50 results. Use filters to narrow down your search for more specific results.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500 mb-4 md:mb-0">
              Canon Archive - Intelligent Camera Database with {searchResult?.statistics.totalProducts || 908} cameras
            </div>
            <div className="flex space-x-6 text-sm text-gray-500">
              <span>🔍 Smart Search Powered</span>
              <span>📊 {searchResult?.statistics.totalProducts || 908} Products Indexed</span>
              <span>🎯 Advanced Filtering</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
