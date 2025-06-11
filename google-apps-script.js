// Google Apps Script code to deploy as a web app
// This handles POST requests and writes to your Google Sheet

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const email = data.email;
    const timestamp = data.timestamp || new Date().toISOString();
    
    // Open your specific Google Sheet
    const sheet = SpreadsheetApp.openById('1Pq9p0QxoNabUgAsaKmdI8N52DhDAeKvReE4IlLxsZFo').getSheetByName('Sheet1');
    
    // Check if email already exists
    const existingEmails = sheet.getRange('A:A').getValues().flat();
    if (existingEmails.includes(email)) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, message: 'Email already registered' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Add new row with email and timestamp
    sheet.appendRow([email, timestamp]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Email registered successfully' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'read') {
      const sheet = SpreadsheetApp.openById('1Pq9p0QxoNabUgAsaKmdI8N52DhDAeKvReE4IlLxsZFo').getSheetByName('Sheet1');
      const data = sheet.getDataRange().getValues();
      const emails = data.slice(1).map(row => row[0]).filter(Boolean);
      
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, emails: emails }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: 'Invalid action' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Instructions for deployment:
// 1. Go to script.google.com
// 2. Create new project
// 3. Paste this code
// 4. Deploy as web app
// 5. Set permissions to "Anyone" and execute as "Me"
// 6. Copy the web app URL and use as GOOGLE_APPS_SCRIPT_URL