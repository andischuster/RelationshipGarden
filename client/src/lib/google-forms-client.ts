// Client-side Google Forms submission for static deployment
export class GoogleFormsClient {
  private formUrl: string;
  private emailEntry: string;

  constructor(formUrl: string, emailEntry: string) {
    this.formUrl = formUrl;
    this.emailEntry = emailEntry;
  }

  async submitEmail(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const formData = new FormData();
      formData.append(this.emailEntry, email);

      const response = await fetch(this.formUrl, {
        method: 'POST',
        body: formData,
        mode: 'no-cors' // Required for cross-origin form submission
      });

      // With no-cors, we can't read the response status
      // Google Forms submission will succeed silently
      return { success: true, message: 'Pre-order registered successfully!' };
    } catch (error) {
      console.error('Error submitting to Google Form:', error);
      return { success: false, message: 'Failed to register pre-order' };
    }
  }
}

// Google Sheets API for reading data (admin functionality)
export class GoogleSheetsAPI {
  private spreadsheetId: string;
  private apiKey: string;

  constructor(spreadsheetId: string, apiKey: string) {
    this.spreadsheetId = spreadsheetId;
    this.apiKey = apiKey;
  }

  async addEmail(email: string): Promise<{ success: boolean; message: string }> {
    // Write operations require OAuth, so this is for reading only
    return { success: false, message: 'Write operations require OAuth authentication' };
  }

  async getEmails(): Promise<string[]> {
    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Sheet1?key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const emails = data.values?.slice(1).map((row: string[]) => row[0]).filter(Boolean) || [];
      return emails;
    } catch (error) {
      console.error('Error fetching from Google Sheets:', error);
      return [];
    }
  }
}