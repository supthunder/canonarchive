'use client';
import { useState, useEffect, useCallback } from 'react';
import AdvancedFilters from './components/AdvancedFilters';
import ProductGrid from './components/ProductGrid';
import { AdvancedFilterCriteria, SearchResult } from '@/types/product';

export default function CanonArchive() {
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update page metadata for dynamic OG images
  const updatePageMetadata = useCallback((filters: AdvancedFilterCriteria, result: SearchResult) => {
    const searchTerm = filters.search || '';
    const count = result.products.length;
    
    // Create OG image URL with search parameters
    const ogImageUrl = new URL('/api/og', window.location.origin);
    if (searchTerm) {
      ogImageUrl.searchParams.set('search', searchTerm);
    }
    ogImageUrl.searchParams.set('count', count.toString());
    ogImageUrl.searchParams.set('type', 'search');

    // Update meta tags dynamically
    updateMetaTag('og:title', searchTerm ? 
      `"${searchTerm}" - ${count} cameras found | Canon Archive` : 
      `Canon Archive - ${count} cameras available`
    );
    
    updateMetaTag('og:description', searchTerm ? 
      `Found ${count} Canon cameras matching "${searchTerm}". Explore vintage and modern cameras with intelligent search and filtering.` :
      `Discover ${count} Canon cameras from our comprehensive archive. Search by megapixels, sensor type, era, and more with advanced filtering.`
    );
    
    updateMetaTag('og:image', ogImageUrl.toString());
    updateMetaTag('twitter:image', ogImageUrl.toString());

    // Update page title
    document.title = searchTerm ? 
      `"${searchTerm}" - ${count} cameras | Canon Archive` : 
      `Canon Archive - ${count} cameras`;
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
        throw new Error('Search failed');
      }

      const result = await response.json();
      setSearchResult(result);

      // Update page metadata for social sharing
      updatePageMetadata(filters, result);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [updatePageMetadata]);

  // Load initial data on mount
  useEffect(() => {
    handleFilterChange({});
  }, [handleFilterChange]);

  // Helper function to update meta tags
  const updateMetaTag = (property: string, content: string) => {
    let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  // Remove unused variable

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Y2K Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl y2k-title mb-6">
            📷 Canon Archive
          </h1>
          <p className="y2k-subtitle mb-8">
            &gt;&gt;&gt; Retro Camera Database &lt;&lt;&lt;
          </p>

          {/* Y2K Statistics */}
          {searchResult && (
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="y2k-card">
                <div className="text-2xl font-bold glow-text">
                  {formatNumber(searchResult.products.length)}
                </div>
                <div className="text-sm opacity-80">Results Found</div>
              </div>
              <div className="y2k-card">
                <div className="text-2xl font-bold glow-text">
                  {formatNumber(searchResult.statistics.totalProducts)}
                </div>
                <div className="text-sm opacity-80">Total Cameras</div>
              </div>
              <div className="y2k-card">
                <div className="text-2xl font-bold glow-text">
                  {searchResult.statistics.averageMegapixels ? 
                    `${searchResult.statistics.averageMegapixels.toFixed(1)}MP` : 'N/A'}
                </div>
                <div className="text-sm opacity-80">Avg Megapixels</div>
              </div>
            </div>
          )}

          {/* Y2K Help Section */}
          <div className="y2k-container mb-8 max-w-4xl mx-auto">
            <div className="flex items-start space-x-4">
              <div className="text-3xl">🔮</div>
              <div className="text-left">
                <h3 className="text-lg font-semibold glow-text mb-3">
                  🔮 SEARCH THE MATRIX
                </h3>
                <div className="mt-2 text-sm space-y-2">
                   <div>• <strong className="text-pink-400">Search &quot;12.1&quot; or &quot;20MP&quot;</strong> to find cameras by exact megapixels</div>
                   <div>• <strong className="text-cyan-400">Search &quot;ccd&quot; or &quot;cmos&quot;</strong> to filter by sensor technology</div>
                   <div>• <strong className="text-green-400">Search &quot;2010s&quot; or &quot;1990s&quot;</strong> to explore cameras by era</div>
                   <div>• <strong className="text-purple-400">Search &quot;zoom&quot; or &quot;stabilization&quot;</strong> to find cameras with specific features</div>
                   <div>• <strong className="text-yellow-400">Use Advanced Filters</strong> for precise megapixel ranges and sensor sizes</div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Interface */}
        <div className="mb-8">
          <AdvancedFilters 
            onFilterChange={handleFilterChange}
            filterOptions={searchResult?.filters || {
              categories: [],
              megapixels: [],
              sensorTypes: [],
              sensorSizes: [],
              eras: [],
              deviceTypes: [],
              features: []
            }}
            loading={loading}
          />
        </div>

        {/* Results */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-2">
              <span className="text-red-500">❌</span>
              <span className="text-red-700 font-medium">Search Error</span>
            </div>
            <p className="text-red-600 mt-2">{error}</p>
          </div>
        )}

        <ProductGrid 
          products={searchResult?.products || []} 
          loading={loading}
        />

        {/* Footer */}
        <div className="text-center mt-16 py-8 border-t border-gray-200">
          <p className="text-gray-600">
            Built with ❤️ for camera enthusiasts • Data from Canon Museum
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Powered by Next.js, TypeScript, and intelligent data processing
          </p>
        </div>
      </div>
    </div>
  );
}
