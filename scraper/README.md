# Canon Museum Scraper

A standalone Node.js scraper for extracting Canon camera data from the Canon Camera Museum website.

## 🎯 Features

- **Batch Processing**: Processes 15 products at a time with 5 concurrent requests
- **Progress Tracking**: Real-time progress bars and statistics
- **Resume Capability**: Continue scraping from where you left off
- **Duplicate Prevention**: Uses unique product IDs to avoid duplicates
- **Comprehensive Data**: Extracts specifications, images, descriptions, and metadata
- **Error Handling**: Robust retry logic and error recovery
- **Multiple Formats**: Saves data in structured JSON format

## 📦 Installation

```bash
cd scraper
npm install
```

## 🚀 Usage

### Quick Start
```bash
# Extract product links first
node index.js extract-links

# Scrape a sample for testing
node index.js scrape-sample

# Start full scraping
node index.js scrape
```

### Commands

| Command | Description |
|---------|-------------|
| `extract-links` | Extract all product links from raw HTML |
| `scrape-sample` | Scrape first 5 products (for testing) |
| `scrape` | Start full scraping process |
| `scrape-category` | Scrape specific categories |
| `resume` | Resume interrupted scraping |
| `stats` | Show scraping statistics |
| `help` | Show help message |

### Options

| Option | Description |
|--------|-------------|
| `--limit <num>` | Limit number of products to scrape |
| `--categories <list>` | Comma-separated category codes |
| `--batch-size <num>` | Products per batch (default: 15) |

### Examples

```bash
# Scrape only digital compact cameras
node index.js scrape-category --categories dcc

# Scrape first 50 products
node index.js scrape --limit 50

# Scrape DSLR and compact cameras with smaller batches
node index.js scrape-category --categories dslr,dcc --batch-size 10

# Resume interrupted scraping
node index.js resume

# Check scraping progress
node index.js stats
```

## 📊 Category Codes

| Code | Category |
|------|----------|
| `dslr` | DSLR Cameras |
| `dcc` | Digital Compact Cameras |
| `dhc` | HD Camcorders |
| `cesc` | Cinema Cameras |
| `film` | Film Cameras |
| `dvc` | Digital Camcorders |
| `colvc` | Color Camcorders |
| `8mmvc` | 8mm Camcorders |
| `svc` | Still Video Cameras |
| `cine` | Movie Cameras |

## 📁 Output Structure

The scraper generates:

- `extracted-links.json` - All product links from the museum
- `../data/canon-products-scraped.json` - Complete scraped product data

### Data Structure

```json
{
  "scrapedAt": "2025-07-24T18:00:00.000Z",
  "totalProducts": 150,
  "scrapedProducts": 148,
  "failedProducts": 2,
  "categories": ["DSLR Camera", "Digital Compact Camera", "..."],
  "products": [
    {
      "id": "dcc580",
      "name": "PowerShot SD980 IS DIGITAL ELPH",
      "category": "Digital Compact Camera",
      "productUrl": "https://global.canon/en/c-museum/product/dcc580.html",
      "names": {
        "japan": "IXY DIGITAL 930 IS",
        "americas": "PowerShot SD980 IS DIGITAL ELPH",
        "europe": "Digital IXUS 200 IS"
      },
      "marketedDate": "September 2009",
      "images": [
        "https://global.canon/ja/c-museum/wp-content/uploads/2015/05/dcc580-1_b.jpg"
      ],
      "specifications": {
        "camera_effective_pixels": "Approx. 12.1 million",
        "image_sensor": "1/2.3-inch type CCD",
        "lens": "4.3 (W) – 21.5 (T) mm",
        "digital_zoom": "Approx. 4.0x",
        "lcd_monitor": "3.0-inch type TFT LCD color monitor"
      },
      "description": "Camera description...",
      "scrapedAt": "2025-07-24T18:00:00.000Z",
      "dataQuality": "high"
    }
  ]
}
```

## ⚡ Performance

- **Concurrent Requests**: 5 simultaneous requests
- **Batch Size**: 15 products per batch
- **Request Delay**: 2 seconds between requests
- **Retry Logic**: 3 attempts with exponential backoff
- **Progress Saving**: After each batch completion

## 🛡️ Error Handling

- **Network Errors**: Automatic retries with exponential backoff
- **Rate Limiting**: Built-in delays to respect server limits
- **Data Validation**: Checks for required fields before saving
- **Progress Persistence**: Saves progress after each batch
- **Graceful Shutdown**: Handles Ctrl+C interruption

## 🔧 Configuration

Edit the scraper settings in the class constructors:

```javascript
// In BatchScraper
this.batchSize = 15;        // Products per batch
this.concurrency = 5;       // Max concurrent requests
this.delay = 2000;          // Delay between requests (ms)
this.maxRetries = 3;        // Retry attempts
```

## 📝 Notes

- The scraper is designed to be respectful to the Canon Museum website
- It includes appropriate delays and error handling
- Progress is automatically saved, so interruptions won't lose work
- Duplicate detection prevents re-scraping existing products
- All scraped data includes quality indicators and timestamps 