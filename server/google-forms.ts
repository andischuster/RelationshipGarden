interface GoogleFormsService {
  addPreorder(email: string): Promise<{ success: boolean; message: string }>;
}

class GoogleFormsDirectSubmission implements GoogleFormsService {
  private readonly formSubmissionUrl: string;
  private readonly emailFieldEntry: string;

  constructor() {
    // Read from environment variables (secrets)
    const formUrl = process.env.GOOGLE_FORM_SUBMISSION_URL || '';
    const entryField = process.env.GOOGLE_FORM_EMAIL_ENTRY || '';
    
    console.log('Google Forms config:', { formUrl: formUrl ? 'SET' : 'MISSING', entryField: entryField ? 'SET' : 'MISSING' });
    
    // Use the form URL directly from secrets
    this.formSubmissionUrl = formUrl;
    this.emailFieldEntry = entryField;
  }

  async addPreorder(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if we have valid configuration
      if (!this.formSubmissionUrl || !this.emailFieldEntry) {
        throw new Error('Google Forms configuration missing');
      }

      const formUrl = this.formSubmissionUrl;
      console.log(`Attempting to submit to: ${formUrl}`);
      console.log(`Using entry field: ${this.emailFieldEntry}`);

      const formData = new URLSearchParams();
      formData.append(this.emailFieldEntry, email);

      const response = await fetch(formUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (compatible; EmailBot/1.0)',
        },
        body: formData,
        redirect: 'manual' // Don't follow redirects
      });

      console.log(`Form response status: ${response.status}`);

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
}

export const googleFormsService = new GoogleFormsDirectSubmission();