// Client-side Google Sheets integration for static deployment
export class GoogleSheetsClient {
  private formUrl: string;

  constructor(formUrl: string) {
    this.formUrl = formUrl;
  }

  async submitEmail(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const formData = new FormData();
      formData.append('entry.emailField', email); // This will be replaced with actual field ID
      formData.append('entry.timestamp', new Date().toISOString());

      const response = await fetch(this.formUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
      });

      // no-cors mode doesn't allow reading response, so we assume success
      return {
        success: true,
        message: 'Pre-order registered successfully!'
      };
    } catch (error) {
      console.error('Error submitting to Google Sheets:', error);
      return {
        success: false,
        message: 'Failed to register pre-order. Please try again.'
      };
    }
  }
}

// Alternative: Direct Google Sheets API approach (requires public sheet)
export class GoogleSheetsAPI {
  private spreadsheetId: string;
  private apiKey: string;

  constructor(spreadsheetId: string, apiKey: string) {
    this.spreadsheetId = spreadsheetId;
    this.apiKey = apiKey;
  }

  async addEmail(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Sheet1:append?valueInputOption=RAW&key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [[email, new Date().toISOString()]]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return {
        success: true,
        message: 'Email registered successfully!'
      };
    } catch (error) {
      console.error('Google Sheets API error:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.'
      };
    }
  }
}