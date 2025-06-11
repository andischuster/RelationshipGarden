interface GoogleSheetsOAuthService {
  addPreorder(email: string): Promise<{ success: boolean; message: string }>;
  getPreorders(): Promise<string[]>;
}

class GoogleSheetsWithServiceAccount implements GoogleSheetsOAuthService {
  private readonly spreadsheetId: string;
  private readonly serviceAccountEmail: string;
  private readonly privateKey: string;

  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID || '';
    this.serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
    this.privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';
  }

  private async getAccessToken(): Promise<string> {
    const jwt = await this.createJWT();
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!response.ok) {
      throw new Error(`OAuth token error: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  private async createJWT(): Promise<string> {
    const header = {
      alg: 'RS256',
      typ: 'JWT',
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: this.serviceAccountEmail,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    };

    // For production, use a proper JWT library
    // This is a simplified implementation
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    
    const message = `${encodedHeader}.${encodedPayload}`;
    
    // Sign with private key (requires crypto module)
    const crypto = await import('crypto');
    const signature = crypto.sign('sha256', Buffer.from(message), {
      key: this.privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    });
    
    const encodedSignature = signature.toString('base64url');
    return `${message}.${encodedSignature}`;
  }

  async addPreorder(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if email already exists
      const existingEmails = await this.getPreorders();
      if (existingEmails.includes(email)) {
        return { success: false, message: 'Email already registered for pre-order' };
      }

      const accessToken = await this.getAccessToken();
      
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Sheet1:append?valueInputOption=RAW`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [[email, new Date().toISOString()]]
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OAuth Append Error ${response.status}:`, errorText);
        throw new Error(`Google Sheets OAuth error: ${response.status}`);
      }

      return { success: true, message: 'Pre-order registered successfully!' };
    } catch (error) {
      console.error('Error adding to Google Sheets with OAuth:', error);
      return { success: false, message: 'Failed to register pre-order' };
    }
  }

  async getPreorders(): Promise<string[]> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Sheet1`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error(`OAuth read error: ${response.status}`);
      }

      const data = await response.json();
      const emails = data.values?.slice(1).map((row: string[]) => row[0]).filter(Boolean) || [];
      return emails;
    } catch (error) {
      console.error('Error fetching from Google Sheets with OAuth:', error);
      return [];
    }
  }
}

// Alternative: Use Google Apps Script as a webhook
class GoogleAppsScriptWebhook implements GoogleSheetsOAuthService {
  private readonly webhookUrl: string;

  constructor() {
    this.webhookUrl = process.env.GOOGLE_APPS_SCRIPT_URL || '';
  }

  async addPreorder(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, timestamp: new Date().toISOString() })
      });

      if (!response.ok) {
        throw new Error(`Apps Script error: ${response.status}`);
      }

      const result = await response.json();
      return result.success ? 
        { success: true, message: 'Pre-order registered successfully!' } :
        { success: false, message: result.message || 'Failed to register' };
    } catch (error) {
      console.error('Error with Apps Script webhook:', error);
      return { success: false, message: 'Failed to register pre-order' };
    }
  }

  async getPreorders(): Promise<string[]> {
    try {
      const response = await fetch(`${this.webhookUrl}?action=read`);
      if (!response.ok) {
        throw new Error(`Apps Script read error: ${response.status}`);
      }
      const data = await response.json();
      return data.emails || [];
    } catch (error) {
      console.error('Error reading from Apps Script:', error);
      return [];
    }
  }
}

// Export the appropriate service based on available credentials
export const googleSheetsOAuthService = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? 
  new GoogleSheetsWithServiceAccount() : 
  new GoogleAppsScriptWebhook();