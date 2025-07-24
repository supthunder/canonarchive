import { CanonProduct } from '@/types/product';
import { v4 as uuidv4 } from 'uuid';

export const sampleCanonProducts = [
  {
    id: uuidv4(),
    name: 'Canon EOS R5',
    model: 'EOS R5',
    category: 'mirrorless',
    releaseDate: '2020-07-09',
    isDiscontinued: false,
    specifications: {
      'sensor_type': 'Full-frame CMOS',
      'sensor_size': '36.0 x 24.0 mm',
      'sensor_resolution': '45.0 megapixels',
      'mount': 'Canon RF',
      'weight': '738g',
      'dimensions': '138.5 x 97.5 x 88.0 mm',
      'battery_life': '320 shots',
      'iso_range': '100-51200',
      'video_recording': '8K RAW, 4K',
      'image_stabilization': 'In-body 5-axis',
      'autofocus_points': '5940 selectable positions'
    } as Record<string, string>,
    metadata: {
      sourceUrl: 'https://www.usa.canon.com/cameras/eos-r5',
      lastScraped: new Date().toISOString(),
      scrapeSource: 'canon',
      dataQuality: 'high',
      images: [
        'https://www.usa.canon.com/images/cameras/eos-r5-front.jpg',
        'https://www.usa.canon.com/images/cameras/eos-r5-back.jpg'
      ],
      description: 'Professional full-frame mirrorless camera with 8K video recording and advanced autofocus.',
      price: {
        msrp: 3899,
        currency: 'USD',
        currentPrice: 3899
      }
    }
  },
  {
    id: uuidv4(),
    name: 'Canon EOS R6 Mark II',
    model: 'EOS R6 Mark II',
    category: 'mirrorless',
    releaseDate: '2022-10-24',
    isDiscontinued: false,
    specifications: {
      sensor: {
        type: 'Full-frame CMOS',
        size: '35.9 x 23.9 mm',
        resolution: '24.2 megapixels',
        cropFactor: 1.0
      },
      mount: 'Canon RF',
      weight: '670g',
      dimensions: '138.4 x 98.4 x 88.4 mm',
      batteryLife: '360 shots',
      connectivity: ['Wi-Fi', 'Bluetooth', 'USB-C'],
      other: {
        'ISO Range': '100-102400',
        'Video Recording': '4K 60p',
        'Image Stabilization': 'In-body 5-axis',
        'Autofocus Points': '6072 selectable positions'
      }
    },
    metadata: {
      sourceUrl: 'https://www.usa.canon.com/cameras/eos-r6-mark-ii',
      lastScraped: new Date().toISOString(),
      scrapeSource: 'canon',
      dataQuality: 'high',
      description: 'Advanced full-frame mirrorless camera for enthusiasts and professionals.',
      price: {
        msrp: 2499,
        currency: 'USD',
        currentPrice: 2499
      }
    }
  },
  {
    id: uuidv4(),
    name: 'Canon EOS 5D Mark IV',
    model: 'EOS 5D Mark IV',
    category: 'dslr',
    releaseDate: '2016-08-25',
    isDiscontinued: true,
    discontinuedDate: '2023-01-15',
    specifications: {
      sensor: {
        type: 'Full-frame CMOS',
        size: '36.0 x 24.0 mm',
        resolution: '30.4 megapixels',
        cropFactor: 1.0
      },
      mount: 'Canon EF',
      weight: '890g',
      dimensions: '150.7 x 116.4 x 75.9 mm',
      batteryLife: '900 shots',
      connectivity: ['Wi-Fi', 'GPS'],
      other: {
        'ISO Range': '100-32000',
        'Video Recording': '4K 30p',
        'Autofocus Points': '61 cross-type points'
      }
    },
    metadata: {
      sourceUrl: 'https://www.usa.canon.com/cameras/eos-5d-mark-iv',
      lastScraped: new Date().toISOString(),
      scrapeSource: 'canon',
      dataQuality: 'high',
      description: 'Professional full-frame DSLR camera, now discontinued.',
      price: {
        msrp: 3499,
        currency: 'USD'
      }
    }
  },
  {
    id: uuidv4(),
    name: 'Canon RF 24-70mm f/2.8L IS USM',
    model: 'RF 24-70mm f/2.8L IS USM',
    category: 'lens',
    releaseDate: '2019-09-05',
    isDiscontinued: false,
    specifications: {
      mount: 'Canon RF',
      focalLength: '24-70mm',
      aperture: 'f/2.8',
      stabilization: true,
      weight: '900g',
      dimensions: '88.8 x 125.7 mm',
      other: {
        'Minimum Focus Distance': '0.21m',
        'Maximum Magnification': '0.3x',
        'Filter Thread': '82mm',
        'Weather Sealing': 'Yes',
        'Lens Elements': '21 elements in 15 groups'
      }
    },
    metadata: {
      sourceUrl: 'https://www.usa.canon.com/lenses/rf-24-70mm-f-2-8l-is-usm',
      lastScraped: new Date().toISOString(),
      scrapeSource: 'canon',
      dataQuality: 'high',
      description: 'Professional standard zoom lens with image stabilization.',
      price: {
        msrp: 2299,
        currency: 'USD',
        currentPrice: 2299
      }
    }
  },
  {
    id: uuidv4(),
    name: 'Canon RF 85mm f/1.2L USM',
    model: 'RF 85mm f/1.2L USM',
    category: 'lens',
    releaseDate: '2019-05-16',
    isDiscontinued: false,
    specifications: {
      mount: 'Canon RF',
      focalLength: '85mm',
      aperture: 'f/1.2',
      stabilization: false,
      weight: '1195g',
      dimensions: '103.2 x 117.3 mm',
      other: {
        'Minimum Focus Distance': '0.85m',
        'Maximum Magnification': '0.12x',
        'Filter Thread': '82mm',
        'Weather Sealing': 'Yes',
        'Lens Elements': '13 elements in 8 groups'
      }
    },
    metadata: {
      sourceUrl: 'https://www.usa.canon.com/lenses/rf-85mm-f-1-2l-usm',
      lastScraped: new Date().toISOString(),
      scrapeSource: 'canon',
      dataQuality: 'high',
      description: 'Professional portrait lens with exceptional bokeh.',
      price: {
        msrp: 2699,
        currency: 'USD',
        currentPrice: 2699
      }
    }
  },
  {
    id: uuidv4(),
    name: 'Canon EOS Rebel T7i',
    model: 'EOS Rebel T7i',
    category: 'dslr',
    releaseDate: '2017-02-14',
    isDiscontinued: true,
    discontinuedDate: '2022-08-10',
    specifications: {
      sensor: {
        type: 'APS-C CMOS',
        size: '22.3 x 14.9 mm',
        resolution: '24.2 megapixels',
        cropFactor: 1.6
      },
      mount: 'Canon EF-S',
      weight: '532g',
      dimensions: '131.0 x 99.9 x 76.2 mm',
      batteryLife: '600 shots',
      connectivity: ['Wi-Fi', 'Bluetooth'],
      other: {
        'ISO Range': '100-25600',
        'Video Recording': '1080p 60fps',
        'Autofocus Points': '45 cross-type points'
      }
    },
    metadata: {
      sourceUrl: 'https://www.usa.canon.com/cameras/eos-rebel-t7i',
      lastScraped: new Date().toISOString(),
      scrapeSource: 'canon',
      dataQuality: 'medium',
      description: 'Entry-level DSLR camera for beginners, now discontinued.',
      price: {
        msrp: 749,
        currency: 'USD'
      }
    }
  }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
] as any as CanonProduct[];

export async function createSampleData(): Promise<void> {
  const { DataManager } = await import('@/lib/data-manager');
  const dataManager = new DataManager();
  
  console.log('Creating sample Canon product data...');
  
  try {
    await dataManager.saveProductsJSON(sampleCanonProducts, 'sample-canon-products.json');
    await dataManager.saveProductsYAML(sampleCanonProducts, 'sample-canon-products.yaml');
    console.log(`Created sample data with ${sampleCanonProducts.length} products`);
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
} 