import { NextRequest, NextResponse } from 'next/server';
import { CanonScraper } from '@/lib/scraper';
import { ProductCategory } from '@/types/product';

// Store active scraping jobs in memory (in production, use Redis or database)
const activeJobs = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categories = ['dslr', 'mirrorless', 'lens'] } = body;

    // Validate categories
    const validCategories = categories.filter((cat: string) => 
      ['dslr', 'mirrorless', 'compact', 'lens', 'accessory', 'printer', 'scanner', 'camcorder', 'professional'].includes(cat)
    ) as ProductCategory[];

    if (validCategories.length === 0) {
      return NextResponse.json(
        { error: 'No valid categories provided' },
        { status: 400 }
      );
    }

    const scraper = new CanonScraper();

    // Start scraping in background
    const scrapingPromise = scraper.scrapeProducts(validCategories);
    
    // Get initial job info
    const initialJob = await scrapingPromise;
    activeJobs.set(initialJob.id, initialJob);

    // Update scraper to save products using data manager
    scrapingPromise.then(async (job) => {
      if (job.status === 'completed') {
        // In a real implementation, we'd get the products from the scraper
        // For now, we'll simulate this
        console.log('Scraping job completed:', job.id);
      }
      activeJobs.set(job.id, job);
    });

    return NextResponse.json({
      message: 'Scraping job started',
      jobId: initialJob.id,
      status: initialJob.status,
      categories: validCategories
    });

  } catch (error) {
    console.error('Error starting scraping job:', error);
    return NextResponse.json(
      { error: 'Failed to start scraping job' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (jobId) {
      // Get specific job status
      const job = activeJobs.get(jobId);
      if (!job) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(job);
    } else {
      // Get all active jobs
      const jobs = Array.from(activeJobs.values());
      return NextResponse.json({ jobs });
    }

  } catch (error) {
    console.error('Error getting scraping job status:', error);
    return NextResponse.json(
      { error: 'Failed to get job status' },
      { status: 500 }
    );
  }
} 