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
    this.sheetName = process.env.GOOGLE_SHEET_NAME || 'Preorders';
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
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${this.sheetName}?key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Google Sheets API error: ${response.status}`);
      }

      const data = await response.json();
      const emails = data.values?.map((row: string[]) => row[0]).filter(Boolean) || [];
      return emails;
    } catch (error) {
      console.error('Error fetching from Google Sheets:', error);
      return [];
    }
  }
}

export const googleSheetsService = new GoogleSheetsAPI();