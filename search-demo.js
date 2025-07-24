#!/usr/bin/env node
import fs from 'fs';

// Load the smart JSON data
console.log('🔍 Canon Smart Search Demo\n');

try {
  const smartData = JSON.parse(fs.readFileSync('./data/canon-products-smart.json', 'utf-8'));
  console.log(`📊 Loaded ${smartData.totalProducts} Canon products with smart fields\n`);

  // Demo 1: Search for 12.1 megapixel cameras
  console.log('🎯 DEMO 1: Find all cameras with 12.1 megapixels');
  console.log('='.repeat(50));
  
  const megapixel121 = smartData.products.filter(product => 
    product.smartSpecs.megapixels.primary === 12.1
  );
  
  console.log(`Found ${megapixel121.length} cameras with 12.1 megapixels:\n`);
  megapixel121.slice(0, 5).forEach((camera, i) => {
    console.log(`${i + 1}. ${camera.name} (${camera.category})`);
    console.log(`   📸 Megapixels: ${camera.smartSpecs.megapixels.primary}MP`);
    console.log(`   📱 Sensor: ${camera.smartSpecs.sensorSize.primary || 'Unknown'}`);
    console.log(`   📅 Era: ${camera.smartSpecs.era}`);
    console.log('');
  });

  // Demo 2: Search by sensor size
  console.log('\n🎯 DEMO 2: Find cameras with 1/2.3" sensors');
  console.log('='.repeat(50));
  
  const sensor123 = smartData.products.filter(product => 
    product.smartSpecs.sensorSize.detected.includes('1/2.3"')
  );
  
  console.log(`Found ${sensor123.length} cameras with 1/2.3" sensors:\n`);
  sensor123.slice(0, 3).forEach((camera, i) => {
    console.log(`${i + 1}. ${camera.name}`);
    console.log(`   📱 Sensor: ${camera.smartSpecs.sensorSize.primary}`);
    console.log(`   📸 Megapixels: ${camera.smartSpecs.megapixels.primary || 'Unknown'}MP`);
    console.log('');
  });

  // Demo 3: Search by megapixel range
  console.log('\n🎯 DEMO 3: Find high-resolution cameras (20+ megapixels)');
  console.log('='.repeat(50));
  
  const highRes = smartData.products.filter(product => 
    product.smartSpecs.megapixels.primary >= 20
  );
  
  console.log(`Found ${highRes.length} high-resolution cameras (20+ MP):\n`);
  highRes.slice(0, 5).forEach((camera, i) => {
    console.log(`${i + 1}. ${camera.name} - ${camera.smartSpecs.megapixels.primary}MP`);
    console.log(`   📱 Sensor: ${camera.smartSpecs.sensorSize.primary || 'Unknown'}`);
    console.log(`   🎬 Category: ${camera.category}`);
    console.log('');
  });

  // Demo 4: Search by features
  console.log('\n🎯 DEMO 4: Find cameras with specific features');
  console.log('='.repeat(50));
  
  const withStabilization = smartData.products.filter(product => 
    product.smartSpecs.searchTags.includes('stabilization')
  );
  
  const with4K = smartData.products.filter(product => 
    product.smartSpecs.searchTags.includes('4k')
  );
  
  console.log(`📹 Cameras with image stabilization: ${withStabilization.length}`);
  console.log(`🎬 Cameras with 4K capability: ${with4K.length}`);

  // Demo 5: Statistics
  console.log('\n📊 SMART DATA STATISTICS');
  console.log('='.repeat(50));
  console.log(`Total products: ${smartData.totalProducts}`);
  console.log(`Products with megapixels: ${smartData.statistics.megapixelProducts}`);
  console.log(`Products with sensor info: ${smartData.statistics.sensorProducts}`);
  console.log(`Products with lens specs: ${smartData.statistics.lensProducts}`);
  
  console.log('\n🏆 Top megapixel counts:');
  const topMegapixels = Object.entries(smartData.statistics.megapixelDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  topMegapixels.forEach(([mp, count]) => {
    console.log(`   ${mp}MP: ${count} cameras`);
  });

  console.log('\n📱 Top sensor sizes:');
  const topSensors = Object.entries(smartData.statistics.sensorSizeDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  topSensors.forEach(([sensor, count]) => {
    console.log(`   ${sensor}: ${count} cameras`);
  });

  console.log('\n🎉 Demo complete! You can now search Canon products by:');
  console.log('   • Exact megapixel values (e.g., 12.1MP)');
  console.log('   • Sensor sizes (e.g., 1/2.3", Full Frame, APS-C)');
  console.log('   • Sensor types (e.g., CCD, CMOS)'); 
  console.log('   • Feature tags (e.g., stabilization, 4k, wifi)');
  console.log('   • Eras (e.g., 1980s, 2000s, 2010s)');
  console.log('   • Physical specs (dimensions, weight)');
  console.log('   • And much more!');

} catch (error) {
  console.error('❌ Error loading smart data:', error.message);
  console.log('💡 Make sure to run: node scraper/index.js smart-parse');
} 