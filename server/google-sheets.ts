interface GoogleSheetsService {
  addPreorder(email: string): Promise<{ success: boolean; message: string }>;
  getPreorders(): Promise<string[]>;
}

class GoogleSheetsAPI implements GoogleSheetsService {
  private readonly spreadsheetId: string;
  private readonly apiKey: string;
  private readonly sheetName: string;

  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID || '';
    this.apiKey = process.env.GOOGLE_SHEETS_API_KEY || '';
    this.sheetName = process.env.GOOGLE_SHEET_NAME || 'Sheet1';
  }

  async addPreorder(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if email already exists
      const existingEmails = await this.getPreorders();
      if (existingEmails.includes(email)) {
        return { success: false, message: 'Email already registered for pre-order' };
      }

      // Add new email to sheet
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${this.sheetName}:append?valueInputOption=RAW&key=${this.apiKey}`,
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
        const errorText = await response.text();
        console.error(`Append API Error ${response.status}:`, errorText);
        throw new Error(`Google Sheets API error: ${response.status}`);
      }

      return { success: true, message: 'Pre-order registered successfully!' };
    } catch (error) {
      console.error('Error adding to Google Sheets:', error);
      return { success: false, message: 'Failed to register pre-order' };
    }
  }

  async getPreorders(): Promise<string[]> {
    try {
      console.log(`Fetching from sheet: ${this.spreadsheetId}, range: ${this.sheetName}`);
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${this.sheetName}?key=${this.apiKey}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error ${response.status}:`, errorText);
        console.error(`URL used: https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${this.sheetName}?key=${this.apiKey.substring(0, 10)}...`);
        throw new Error(`Google Sheets API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Sheet data received:', data);
      const emails = data.values?.map((row: string[]) => row[0]).filter(Boolean) || [];
      return emails;
    } catch (error) {
      console.error('Error fetching from Google Sheets:', error);
      return [];
    }
  }
}

export const googleSheetsService = new GoogleSheetsAPI();