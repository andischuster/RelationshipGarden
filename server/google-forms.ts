interface GoogleFormsService {
  addPreorder(email: string): Promise<{ success: boolean; message: string }>;
}

class GoogleFormsDirectSubmission implements GoogleFormsService {
  private readonly formSubmissionUrl: string;
  private readonly emailFieldEntry: string;

  constructor() {
    this.formSubmissionUrl = process.env.GOOGLE_FORM_URL || 'https://docs.google.com/forms/d/e/1FAIpQLSerOXUpDzQqoM2RC4Lvkg95AJ4nRBLHnQb-918TA3ibMgLi0Q/formResponse';
    this.emailFieldEntry = process.env.GOOGLE_FORM_EMAIL_ENTRY || 'entry.1835138428';
  }

  async addPreorder(email: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`Attempting to submit to: ${this.formSubmissionUrl}`);
      console.log(`Using entry field: ${this.emailFieldEntry}`);

      const formData = new URLSearchParams();
      formData.append(this.emailFieldEntry, email);

      const response = await fetch(this.formSubmissionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });

      console.log(`Form response status: ${response.status}`);

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
}

export const googleFormsService = new GoogleFormsDirectSubmission();