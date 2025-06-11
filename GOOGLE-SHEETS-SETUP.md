# Google Sheets Integration Setup

This guide will help you set up Google Sheets to collect email signups for static deployment.

## Option 1: Google Forms (Recommended - Easiest)

### Step 1: Create a Google Form
1. Go to [forms.google.com](https://forms.google.com)
2. Create a new form titled "Growing Us Pre-orders"
3. Add a question:
   - Type: "Short answer"
   - Question: "Email Address"
   - Required: Yes
   - Response validation: Email

### Step 2: Get the Form URL
1. Click "Send" in your form
2. Go to the "Link" tab
3. Copy the form URL (looks like: `https://docs.google.com/forms/d/e/1FAIpQLSe...`)

### Step 3: Get the Email Field ID
1. Right-click on your form page and select "View Source"
2. Search for `entry.` followed by numbers (e.g., `entry.123456789`)
3. This is your email field ID

### Step 4: Set Environment Variables
Create a `.env` file in your project root:
```env
VITE_GOOGLE_FORM_URL=https://docs.google.com/forms/d/e/1FAIpQLSe.../formResponse
VITE_GOOGLE_FORM_EMAIL_FIELD=entry.123456789
```

## Option 2: Google Sheets API (Advanced)

### Step 1: Create a Google Sheet
1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new sheet titled "Growing Us Preorders"
3. Add headers in row 1: "Email" (A1), "Timestamp" (B1)

### Step 2: Enable Google Sheets API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable the Google Sheets API
4. Create credentials (API Key)
5. Restrict the API key to Google Sheets API only

### Step 3: Make Sheet Public
1. In your Google Sheet, click "Share"
2. Change permissions to "Anyone with the link can edit"
3. Copy the sheet ID from the URL (the long string between `/d/` and `/edit`)

### Step 4: Set Environment Variables
```env
VITE_GOOGLE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
VITE_GOOGLE_SHEETS_API_KEY=AIzaSyBnf7k8l3m2n4o5p6q7r8s9t0u1v2w3x4y5z
```

## Building for Static Deployment

After setting up either option, build your static site:

```bash
# Build for static deployment
node build-static.js

# The dist/ directory will contain your deployable files
```

## Verification

Test your setup:
1. Build the project
2. Serve the static files locally
3. Submit a test email
4. Check your Google Form responses or Google Sheet

## Deployment

Deploy the `dist/` folder to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- Replit Static Deployment

Your email collection will work without any backend server!