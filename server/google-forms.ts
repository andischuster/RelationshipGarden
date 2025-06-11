interface GoogleFormsService {
  addPreorder(email: string): Promise<{ success: boolean; message: string }>;
  getPreorders(): Promise<string[]>;
}

class GoogleFormsAPI implements GoogleFormsService {
  private readonly formId: string;
  private readonly emailFieldId: string;
  private readonly apiKey: string;
  private readonly spreadsheetId: string;

  constructor() {
    this.formId = process.env.GOOGLE_FORM_ID || '';
    this.emailFieldId = process.env.GOOGLE_FORM_EMAIL_FIELD || '';
    this.apiKey = process.env.GOOGLE_SHEETS_API_KEY || '';
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID || '';
  }

  async addPreorder(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if email already exists by reading the linked spreadsheet
      const existingEmails = await this.getPreorders();
      if (existingEmails.includes(email)) {
        return { success: false, message: 'Email already registered for pre-order' };
      }

      // Submit to Google Form
      const formData = new URLSearchParams();
      formData.append(this.emailFieldId, email);

      const response = await fetch(`https://docs.google.com/forms/d/e/${this.formId}/formResponse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });

      // Google Forms returns 200 even for successful submissions when using formResponse
      // The response doesn't indicate success/failure, so we assume success if no error
      if (response.status === 200 || response.status === 302) {
        return { success: true, message: 'Pre-order registered successfully!' };
      } else {
        throw new Error(`Form submission failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error submitting to Google Form:', error);
      return { success: false, message: 'Failed to register pre-order' };
    }
  }

  async getPreorders(): Promise<string[]> {
    try {
      // Read from the Google Sheet that's linked to the form
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Sheet1?key=${this.apiKey}`
      );

      if (!response.ok) {
        console.error(`Error reading form responses: ${response.status}`);
        return [];
      }

      const data = await response.json();
      // Skip header row and extract email column
      const emails = data.values?.slice(1).map((row: string[]) => row[1]).filter(Boolean) || [];
      return emails;
    } catch (error) {
      console.error('Error fetching form responses:', error);
      return [];
    }
  }
}

// Simpler direct form submission without API
class GoogleFormsDirectSubmission implements GoogleFormsService {
  private readonly formSubmissionUrl: string;
  private readonly emailFieldEntry: string;

  constructor() {
    this.formSubmissionUrl = process.env.GOOGLE_FORM_SUBMISSION_URL || '';
    this.emailFieldEntry = process.env.GOOGLE_FORM_EMAIL_ENTRY || '';
  }

  async addPreorder(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if we have valid configuration
      if (!this.formSubmissionUrl || !this.emailFieldEntry) {
        throw new Error('Google Forms configuration missing');
      }

      // Construct proper form URL if only form ID was provided
      let formUrl = this.formSubmissionUrl;
      if (!formUrl.includes('docs.google.com')) {
        formUrl = `https://docs.google.com/forms/d/e/${formUrl}/formResponse`;
      }

      const formData = new URLSearchParams();
      formData.append(this.emailFieldEntry, email);

      const response = await fetch(formUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
        redirect: 'manual' // Don't follow redirects
      });

      // Google Forms typically returns 302 redirect on successful submission
      if (response.status === 200 || response.status === 302) {
        return { success: true, message: 'Pre-order registered successfully!' };
      } else {
        throw new Error(`Form submission failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Error submitting to Google Form:', error);
      return { success: false, message: 'Failed to register pre-order' };
    }
  }

  async getPreorders(): Promise<string[]> {
    // For direct submission, we can't easily read back the responses
    // Would need the linked spreadsheet approach
    console.log('Reading responses requires spreadsheet access');
    return [];
  }
}

export const googleFormsService = new GoogleFormsDirectSubmission();