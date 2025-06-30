
// Configuration for static deployment with Google Sheets
export const staticConfig = {
  // Google Sheets configuration
  googleSheets: {
    // Option 1: Google Forms submission URL (recommended for static sites)
    formUrl: import.meta.env.VITE_GOOGLE_FORM_URL || '',
    emailFieldId: import.meta.env.VITE_GOOGLE_FORM_EMAIL_FIELD || 'entry.123456789',
    
    // Option 2: Direct Sheets API (requires public API key)
    spreadsheetId: import.meta.env.VITE_GOOGLE_SHEET_ID || '',
    apiKey: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || '',
    sheetName: import.meta.env.VITE_GOOGLE_SHEET_NAME || 'Preorders'
  },
  
  // Deployment settings
  deployment: {
    type: 'static' as const,
    enableDatabase: false,
    enableBackend: false
  },
  
  // Form submission handler for static deployment
  async submitForm(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.googleSheets.formUrl) {
        // Use Google Forms submission
        const formData = new FormData();
        formData.append(this.googleSheets.emailFieldId, email);
        
        const response = await fetch(this.googleSheets.formUrl, {
          method: 'POST',
          body: formData,
          mode: 'no-cors'
        });
        
        return { success: true };
      } else {
        throw new Error('No form URL configured');
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};
