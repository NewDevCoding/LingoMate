# Google Cloud Text-to-Speech API Setup Guide

## What You Need

### 1. Google Cloud Account
- A Google account (Gmail account works)
- Access to [Google Cloud Console](https://console.cloud.google.com/)

### 2. Google Cloud Project
- Create a new project or use an existing one
- Project name: e.g., "LingoMate" or "LanguageLearning"

### 3. Enable Text-to-Speech API
- Navigate to "APIs & Services" > "Library"
- Search for "Cloud Text-to-Speech API"
- Click "Enable"

### 4. Create API Credentials

You have two options:

#### Option A: API Key (Simpler, but less secure)
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key
4. (Recommended) Restrict the API key:
   - Click on the API key to edit
   - Under "API restrictions", select "Restrict key"
   - Choose "Cloud Text-to-Speech API"
   - Save

#### Option B: Service Account (More secure, recommended for production)
1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Give it a name (e.g., "lingomate-tts")
4. Grant role: "Cloud Text-to-Speech API User"
5. Create and download JSON key file
6. Keep this file secure (don't commit to git!)

### 5. Billing Setup
- Google Cloud requires a billing account (even for free tier)
- Add a payment method (credit card)
- **Free Tier**: First 4 million characters per month are free
- **After Free Tier**: ~$4 per million characters

### 6. Environment Variable

Add to your `.env.local` file:

```env
# For API Key method:
GOOGLE_TTS_API_KEY=your-api-key-here

# OR for Service Account method:
GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account-key.json
```

---

## Step-by-Step Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click project dropdown (top bar)
3. Click "New Project"
4. Enter project name: "LingoMate"
5. Click "Create"

### Step 2: Enable Billing
1. Go to "Billing" in the menu
2. Link a billing account (or create one)
3. Add payment method
4. Link to your project

### Step 3: Enable Text-to-Speech API
1. Go to "APIs & Services" > "Library"
2. Search: "Cloud Text-to-Speech API"
3. Click on it
4. Click "Enable" button
5. Wait for it to enable (usually instant)

### Step 4: Create API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "+ CREATE CREDENTIALS" at the top
3. Select "API key"
4. Copy the API key immediately (you won't see it again!)
5. Click "Restrict Key" (recommended)
6. Under "API restrictions":
   - Select "Restrict key"
   - Check "Cloud Text-to-Speech API"
7. Click "Save"

### Step 5: Add to Project
1. Open `.env.local` in your project root
2. Add: `GOOGLE_TTS_API_KEY=your-copied-api-key-here`
3. Save the file
4. Restart your dev server

---

## Cost Information

### Free Tier
- **4 million characters per month** (free)
- Enough for ~40,000 words per month
- Resets monthly

### Paid Tier
- **$4 per million characters** after free tier
- Example: 1 million characters ≈ 200,000 words
- Very affordable for a language learning app

### Cost Estimation
- Average message: ~50-100 characters
- 100 messages/day = ~5,000 characters/day
- Monthly: ~150,000 characters (well within free tier)

---

## Security Best Practices

### ✅ DO:
- Use API key restrictions (limit to Text-to-Speech API only)
- Add domain restrictions if deploying (optional)
- Keep API key in `.env.local` (already in `.gitignore`)
- Rotate keys periodically

### ❌ DON'T:
- Commit API keys to git
- Share API keys publicly
- Use unrestricted API keys in production
- Hardcode keys in source code

---

## Testing Your Setup

After setup, test with:

```bash
# Check if API key is set
echo $GOOGLE_TTS_API_KEY

# Or in your code, test the API
```

---

## Troubleshooting

### "API key not valid"
- Check that API key is correct
- Verify Text-to-Speech API is enabled
- Check API key restrictions

### "Billing not enabled"
- Enable billing in Google Cloud Console
- Link billing account to project

### "Quota exceeded"
- Check usage in "APIs & Services" > "Dashboard"
- Verify you're within free tier limits

---

## Alternative: Browser TTS (No Setup Required)

If you don't want to set up Google Cloud TTS, the implementation will fall back to browser's built-in TTS:
- No API key needed
- No billing required
- Works immediately
- Lower quality but functional

The code will automatically use browser TTS if Google TTS API key is not configured.

---

## Next Steps

1. ✅ Set up Google Cloud project
2. ✅ Enable Text-to-Speech API
3. ✅ Create API key
4. ✅ Add to `.env.local`
5. ✅ Restart dev server
6. ✅ Test TTS functionality
