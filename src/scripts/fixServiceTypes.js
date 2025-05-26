/**
 * This script updates service files to use proper TypeScript types
 * It replaces 'any' types with more specific types and improves error handling
 * 
 * To run: node src/scripts/fixServiceTypes.js
 */
const fs = require('fs');
const path = require('path');

const SERVICES_DIR = path.resolve(__dirname, '../services');
const UTILS_IMPORT = "import { handleApiError } from '@/utils/serviceUtils';";

// Patterns to replace
const replacements = [
  // Replace any types with unknown in interfaces
  {
    pattern: /Record<string,\s*any>/g,
    replacement: 'Record<string, unknown>'
  },
  // Replace any[] with unknown[] or more specific types
  {
    pattern: /:\s*any\[\]/g,
    replacement: ': unknown[]'
  },
  // Replace catch(error: any) with catch(error: unknown)
  {
    pattern: /catch\s*\(\s*error\s*:\s*any\s*\)/g,
    replacement: 'catch (error: unknown)'
  },
  // Replace simple any types with unknown
  {
    pattern: /:\s*any\s*([,;)])/g,
    replacement: ': unknown$1'
  },
  // Replace error handling with utility function
  {
    pattern: /console\.error\([^;]+\);\s*throw\s+error;/g,
    replacement: 'return handleApiError(error, \'perform operation\');'
  }
];

// Process each service file
fs.readdirSync(SERVICES_DIR).forEach(file => {
  if (!file.endsWith('.ts')) return;
  
  const filePath = path.join(SERVICES_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add utility import if not present
  if (!content.includes('handleApiError')) {
    const importIndex = content.lastIndexOf('import');
    const importEndIndex = content.indexOf(';', importIndex) + 1;
    content = content.slice(0, importEndIndex) + '\n' + UTILS_IMPORT + content.slice(importEndIndex);
  }
  
  // Apply replacements
  replacements.forEach(({ pattern, replacement }) => {
    content = content.replace(pattern, replacement);
  });
  
  // Write updated content
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});

console.log('Service files updated successfully!');
