#!/usr/bin/env node
/**
 * Sync data from warinfo project to mobile PWA
 */

const fs = require('fs');
const path = require('path');

// Source directories
const WARINFO_DIR = path.join(__dirname, '..', '..', 'warinfo');
const MOBILE_DIR = path.join(__dirname, '..');

// Copy conflict data
function syncConflictData() {
  try {
    // Copy JSON data
    const jsonData = fs.readFileSync(path.join(WARINFO_DIR, 'conflict_data.json'));
    fs.writeFileSync(path.join(MOBILE_DIR, 'api', 'conflicts.json'), jsonData);
    
    // Copy database if needed (for future API expansion)
    if (fs.existsSync(path.join(WARINFO_DIR, 'conflict_data.db'))) {
      const dbData = fs.readFileSync(path.join(WARINFO_DIR, 'conflict_data.db'));
      fs.writeFileSync(path.join(MOBILE_DIR, 'api', 'conflict_data.db'), dbData);
    }
    
    console.log('✅ Conflict data synced successfully');
  } catch (error) {
    console.error('❌ Error syncing conflict data:', error);
  }
}

// Update manifest with latest data
function updateManifest() {
  try {
    const manifestPath = path.join(MOBILE_DIR, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Update version based on current date
    const now = new Date();
    manifest.version = now.toISOString().split('T')[0];
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('✅ Manifest updated with version:', manifest.version);
  } catch (error) {
    console.error('❌ Error updating manifest:', error);
  }
}

// Main sync function
function main() {
  console.log('🔄 Starting WarInfo Mobile data sync...');
  
  syncConflictData();
  updateManifest();
  
  console.log('✨ Data sync completed!');
}

if (require.main === module) {
  main();
}