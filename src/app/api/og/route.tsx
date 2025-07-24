import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get parameters from URL
    const search = searchParams.get('search') || '';
    const resultCount = searchParams.get('count') || '0';
    const type = searchParams.get('type') || 'search'; // 'search' or 'camera'
    const cameraId = searchParams.get('cameraId');
    
    // Default branding (for future use)
    // const title = 'Canon Archive';
    // const subtitle = 'Intelligent Camera Discovery';

    if (type === 'camera' && cameraId) {
      // Single camera OG image (simplified for Edge runtime)
      const cameraName = searchParams.get('name') || 'Canon Camera';
      const megapixels = searchParams.get('mp');
      const sensor = searchParams.get('sensor');
      const era = searchParams.get('era');

      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f8fafc',
              backgroundImage: 'radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #10b981 0%, transparent 50%)',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 40,
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginRight: 16,
                }}
              >
                📷 Canon Archive
              </div>
            </div>

            {/* Camera Details */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: 'white',
                borderRadius: 20,
                padding: 40,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                maxWidth: 800,
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 'bold',
                  color: '#1f2937',
                  textAlign: 'center',
                  marginBottom: 20,
                }}
              >
                {cameraName}
              </div>
              
              {/* Camera Specs */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: 20,
                  marginTop: 20,
                }}
              >
                {megapixels && (
                  <div
                    style={{
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      padding: '8px 16px',
                      borderRadius: 12,
                      fontSize: 24,
                      fontWeight: '600',
                    }}
                  >
                    {megapixels}MP
                  </div>
                )}
                
                {sensor && (
                  <div
                    style={{
                      backgroundColor: '#d1fae5',
                      color: '#065f46',
                      padding: '8px 16px',
                      borderRadius: 12,
                      fontSize: 24,
                      fontWeight: '600',
                    }}
                  >
                    {sensor.toUpperCase()}
                  </div>
                )}
                
                {era && (
                  <div
                    style={{
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      padding: '8px 16px',
                      borderRadius: 12,
                      fontSize: 24,
                      fontWeight: '600',
                    }}
                  >
                    {era}
                  </div>
                )}
              </div>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        },
      );
    }

    // Search results OG image
    const searchText = search ? `"${search}"` : 'All Cameras';
    const count = parseInt(resultCount);
    
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            backgroundImage: 'radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #10b981 0%, transparent 50%)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 40,
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: '#1f2937',
                marginRight: 16,
              }}
            >
              📷 Canon Archive
            </div>
            <div
              style={{
                fontSize: 24,
                color: '#6b7280',
              }}
            >
              Intelligent Camera Discovery
            </div>
          </div>

          {/* Search Results Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'white',
              borderRadius: 20,
              padding: 50,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              maxWidth: 900,
            }}
          >
            <div
              style={{
                fontSize: 28,
                color: '#6b7280',
                marginBottom: 20,
                textAlign: 'center',
              }}
            >
              Search Results for
            </div>
            
            <div
              style={{
                fontSize: 56,
                fontWeight: 'bold',
                color: '#1f2937',
                textAlign: 'center',
                marginBottom: 30,
                maxWidth: 800,
              }}
            >
              {searchText}
            </div>

            {/* Result Count */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: count > 0 ? '#dbeafe' : '#fee2e2',
                color: count > 0 ? '#1e40af' : '#991b1b',
                padding: '16px 32px',
                borderRadius: 16,
                fontSize: 36,
                fontWeight: 'bold',
              }}
            >
              {count > 0 ? '🎯' : '😔'} {count} camera{count !== 1 ? 's' : ''} found
            </div>

            {/* Success indicators */}
            {count > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: 20,
                  marginTop: 30,
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#f0fdf4',
                    color: '#166534',
                    padding: '8px 16px',
                    borderRadius: 12,
                    fontSize: 20,
                  }}
                >
                  ✨ Smart Search
                </div>
                <div
                  style={{
                    backgroundColor: '#f0f9ff',
                    color: '#0c4a6e',
                    padding: '8px 16px',
                    borderRadius: 12,
                    fontSize: 20,
                  }}
                >
                  📊 Advanced Filters
                </div>
                <div
                  style={{
                    backgroundColor: '#fef7ed',
                    color: '#9a3412',
                    padding: '8px 16px',
                    borderRadius: 12,
                    fontSize: 20,
                  }}
                >
                  📷 908 Cameras
                </div>
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.log(`OG Image generation error: ${e.message}`);
    return generateDefaultImage('Canon Archive', 'Error generating preview');
  }
}

function generateDefaultImage(title: string, subtitle: string) {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1f2937',
          color: 'white',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            marginBottom: 20,
          }}
        >
          📷 {title}
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#9ca3af',
          }}
        >
          {subtitle}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
} 