// Configuration for static deployment with Google Sheets
export const staticConfig = {
  // Google Sheets configuration
  googleSheets: {
    // Option 1: Google Forms submission URL (recommended for static sites)
    formUrl: process.env.VITE_GOOGLE_FORM_URL || '',
    emailFieldId: process.env.VITE_GOOGLE_FORM_EMAIL_FIELD || 'entry.123456789',
    
    // Option 2: Direct Sheets API (requires public API key)
    spreadsheetId: process.env.VITE_GOOGLE_SHEET_ID || '',
    apiKey: process.env.VITE_GOOGLE_SHEETS_API_KEY || '',
    sheetName: process.env.VITE_GOOGLE_SHEET_NAME || 'Preorders'
  },
  
  // Deployment settings
  deployment: {
    type: 'static',
    enableDatabase: false,
    enableBackend: false
  }
};