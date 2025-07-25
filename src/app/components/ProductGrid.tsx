'use client';
import Image from 'next/image';
import { useState } from 'react';
import { CanonProduct } from '@/types/product';

interface ProductGridProps {
  products: CanonProduct[];
  loading?: boolean;
}

export default function ProductGrid({ products, loading }: ProductGridProps) {
  const [viewMode, setViewMode] = useState<'normal' | 'compact'>('normal');

  // Extract model numbers from products for eBay search
  const getEbaySearchUrl = () => {
    const modelNumbers = products
      .map(product => {
        // Extract model numbers like A1200, EOS R5, etc.
        const match = product.id.match(/[a-z]*(\d+)/i) || product.name.match(/([A-Z]+\s*\d+|[A-Z]-\d+)/i);
        if (match) {
          const modelNum = match[1] || match[0];
          return `a${modelNum.toLowerCase().replace(/[^0-9]/g, '')}`;
        }
        return null;
      })
      .filter(Boolean)
      .slice(0, 8) // Limit to first 8 models to avoid URL length issues
      .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates

    if (modelNumbers.length === 0) return null;

    const searchQuery = `(${modelNumbers.join(', ')}) canon`;
    const encodedQuery = encodeURIComponent(searchQuery);
    return `https://www.ebay.com/sch/31388/i.html?_nkw=${encodedQuery}&_from=R40&LH_ItemCondition=3000&_sop=15`;
  };

  if (loading) {
    return (
      <div>
        {/* Header with loading placeholders */}
        <div className="flex justify-between items-center mb-6">
          <div className="bg-gray-200 animate-pulse h-10 w-32 rounded"></div>
          <div className="bg-gray-200 animate-pulse h-10 w-40 rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="y2k-card animate-pulse">
              <div className="bg-gradient-to-br from-purple-900 to-blue-900 aspect-square rounded-lg mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gradient-to-r from-cyan-500 to-pink-500 rounded w-3/4 opacity-30"></div>
                <div className="h-3 bg-gradient-to-r from-green-500 to-purple-500 rounded w-1/2 opacity-30"></div>
                <div className="h-3 bg-gradient-to-r from-pink-500 to-cyan-500 rounded w-2/3 opacity-30"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🤖</div>
        <h3 className="text-xl font-semibold glow-text mb-2">NO CAMERAS IN THE MATRIX</h3>
        <p className="text-cyan-400">Try adjusting your filters to find more results...</p>
      </div>
    );
  }

  const ebayUrl = getEbaySearchUrl();

  return (
    <div>
      {/* Header with eBay search and view toggle */}
      <div className="flex justify-between items-center mb-6">
        {/* eBay Search Button */}
        <div className="flex items-center">
          {ebayUrl && (
            <button
              onClick={() => window.open(ebayUrl, '_blank')}
              className="y2k-button flex items-center gap-2"
              title="Search these models on eBay"
            >
              <Image
                src="/ebay.svg"
                alt="eBay"
                width={20}
                height={20}
                className="flex-shrink-0"
              />
              <span>EBAY SEARCH</span>
            </button>
          )}
        </div>

        {/* Y2K View Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm glow-text">VIEW MODE:</span>
          <div className="bg-black bg-opacity-50 border border-cyan-400 rounded-lg p-1 flex">
            <button
              onClick={() => setViewMode('normal')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all duration-200 uppercase ${
                viewMode === 'normal'
                  ? 'bg-gradient-to-r from-cyan-400 to-pink-400 text-black shadow-lg'
                  : 'text-cyan-400 hover:text-white border border-transparent hover:border-cyan-400'
              }`}
            >
              NORMAL
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all duration-200 uppercase ${
                viewMode === 'compact'
                  ? 'bg-gradient-to-r from-cyan-400 to-pink-400 text-black shadow-lg'
                  : 'text-cyan-400 hover:text-white border border-transparent hover:border-cyan-400'
              }`}
            >
              COMPACT
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className={
        viewMode === 'compact' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4"
          : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      }>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} viewMode={viewMode} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product, viewMode }: { product: CanonProduct; viewMode: 'normal' | 'compact' }) {
  const smartSpecs = product.smartSpecs;
  const primaryImage = product.images[0];
  
  if (viewMode === 'compact') {
    // Y2K Compact view - minimal information, smaller card
    return (
      <div className="y2k-card overflow-hidden">
        {/* Product Image */}
        <div className="aspect-square bg-gray-100 relative">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-4xl">📷</div>
            </div>
          )}
          
          {/* Era Badge */}
          {smartSpecs.era && (
            <div className="absolute top-1 left-1 retro-badge text-[10px]">
              {smartSpecs.era}
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-1 right-1 retro-badge text-[10px]">
            {product.category}
          </div>
        </div>
        
        {/* Y2K Compact Product Info */}
        <div className="p-2">
          {/* Name */}
          <h3 className="font-medium text-white text-sm mb-1 line-clamp-2" title={product.name}>
            {product.name}
          </h3>
          
          {/* Key specs in one line */}
          <div className="text-xs text-cyan-400 mb-2">
            {smartSpecs.megapixels.primary && `${smartSpecs.megapixels.primary}MP`}
            {smartSpecs.megapixels.primary && smartSpecs.sensorType.length > 0 && ' • '}
            {smartSpecs.sensorType.length > 0 && smartSpecs.sensorType[0].toUpperCase()}
          </div>
          
          {/* Y2K Compact Action Button */}
          <button 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold py-1.5 px-2 rounded border border-cyan-400 transition-all duration-200 uppercase"
            onClick={() => {
              window.open(product.productUrl, '_blank');
            }}
          >
            ENTER
          </button>
        </div>
      </div>
    );
  }

  // Y2K Normal view - full information display
  return (
    <div className="y2k-card overflow-hidden">
      {/* Product Image */}
      <div className="aspect-square bg-gray-100 relative">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover"
            onError={(e) => {
              // Hide broken image
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-6xl">📷</div>
          </div>
        )}
        
        {/* Era Badge */}
        {smartSpecs.era && (
          <div className="absolute top-2 left-2 retro-badge">
            {smartSpecs.era}
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-2 right-2 retro-badge">
          {product.category}
        </div>
      </div>
      
      {/* Y2K Product Info */}
      <div className="p-4">
        {/* Name */}
        <h3 className="font-semibold text-white mb-2 line-clamp-2 glow-text" title={product.name}>
          {product.name}
        </h3>
        
        {/* Y2K Key Specs */}
        <div className="space-y-1 text-sm mb-3">
          {/* Megapixels */}
          {smartSpecs.megapixels.primary && (
            <div className="flex items-center">
              <span className="text-cyan-400 font-medium">📸</span>
              <span className="ml-2 text-cyan-300">{smartSpecs.megapixels.primary}MP</span>
            </div>
          )}
          
          {/* Sensor */}
          {smartSpecs.sensorSize.primary && (
            <div className="flex items-center">
              <span className="text-green-400 font-medium">📱</span>
              <span className="ml-2 truncate text-green-300" title={smartSpecs.sensorSize.primary}>
                {smartSpecs.sensorSize.primary}
              </span>
            </div>
          )}
          
          {/* Sensor Type */}
          {smartSpecs.sensorType.length > 0 && (
            <div className="flex items-center">
              <span className="text-purple-400 font-medium">🔧</span>
              <span className="ml-2 capitalize text-purple-300">{smartSpecs.sensorType[0]}</span>
            </div>
          )}
          
          {/* Marketing Date */}
          {product.marketedDate && (
            <div className="flex items-center">
              <span className="text-pink-400 font-medium">📅</span>
              <span className="ml-2 text-pink-300">{product.marketedDate}</span>
            </div>
          )}
        </div>
        
        {/* Y2K Features Tags */}
        {smartSpecs.searchTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {smartSpecs.searchTags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="retro-badge text-xs"
              >
                {tag}
              </span>
            ))}
            {smartSpecs.searchTags.length > 3 && (
              <span className="text-cyan-400 text-xs">
                +{smartSpecs.searchTags.length - 3} more
              </span>
            )}
          </div>
        )}
        
        {/* Y2K Lens Info */}
        {smartSpecs.lensSpecs.focalLength.length > 0 && (
          <div className="text-xs text-yellow-400 mb-2">
            {smartSpecs.lensSpecs.focalLength.map((lens, index) => (
              <div key={index}>
                🔭 {lens.min && lens.max 
                  ? `${lens.min}-${lens.max}mm (${lens.type})`
                  : lens.value 
                    ? `${lens.value}mm (${lens.type})`
                    : 'Lens available'
                }
              </div>
            )).slice(0, 1)}
          </div>
        )}
        
        {/* Y2K Video Capability */}
        {smartSpecs.videoSpecs.maxResolution && (
          <div className="text-xs text-green-400 mb-2">
            🎬 {smartSpecs.videoSpecs.maxResolution}
          </div>
        )}
        
        {/* Y2K Action Button */}
        <button 
          className="y2k-button w-full text-sm"
          onClick={() => {
            // Open product details modal or navigate to detail page
            window.open(product.productUrl, '_blank');
          }}
        >
          ENTER MATRIX
        </button>
      </div>
    </div>
  );
} 