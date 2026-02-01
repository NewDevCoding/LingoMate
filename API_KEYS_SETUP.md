# API Keys Setup Guide

## Quick Setup

1. **Create `.env.local` file** in the project root directory (same level as `package.json`)

2. **Add the following environment variables:**

```env
# OpenAI API Configuration
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini

# Google Cloud Translation API Configuration
# Get your API key from: https://console.cloud.google.com/apis/credentials
# Enable the Cloud Translation API first: https://console.cloud.google.com/apis/library/translate.googleapis.com
GOOGLE_TRANSLATE_API_KEY=your-google-translate-api-key-here
```

3. **Replace the placeholder values** with your actual API keys

4. **Restart your Next.js development server:**
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```

## Getting API Keys

### OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (you won't be able to see it again!)
5. Paste it into `.env.local` as `OPENAI_API_KEY`

**Note:** You'll need to add payment method to your OpenAI account to use the API (they have a pay-as-you-go model).

### Google Translate API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Cloud Translation API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Cloud Translation API"
   - Click "Enable"
4. Create an API key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key
   - (Optional) Restrict the API key to "Cloud Translation API" for security
5. Paste it into `.env.local` as `GOOGLE_TRANSLATE_API_KEY`

**Note:** Google Translate API has a free tier of 500,000 characters per month.

## Troubleshooting

### Error: "OpenAI API key not configured"

1. **Check that `.env.local` exists** in the project root
2. **Verify the variable name** is exactly `OPENAI_API_KEY` (case-sensitive, no spaces)
3. **Make sure you restarted the server** after adding the key
4. **Check for typos** in the API key value
5. **Verify the key is valid** by testing it on the OpenAI platform

### Error: "Translation service not configured"

1. **Check that `.env.local` exists** in the project root
2. **Verify the variable name** is exactly `GOOGLE_TRANSLATE_API_KEY` (case-sensitive, no spaces)
3. **Make sure you restarted the server** after adding the key
4. **Verify the Cloud Translation API is enabled** in Google Cloud Console
5. **Check that the API key has permissions** for the Translation API

### Environment variables not loading?

- **Restart the dev server** - Next.js only loads `.env.local` on startup
- **Check file location** - `.env.local` must be in the root directory (same level as `package.json`)
- **Check file name** - Must be exactly `.env.local` (not `.env`, `.env.local.txt`, etc.)
- **No quotes needed** - Don't wrap the API key in quotes: `OPENAI_API_KEY=sk-...` (not `OPENAI_API_KEY="sk-..."`)

## File Structure

Your project should look like this:

```
LingoMate/
├── .env.local          ← Create this file here
├── package.json
├── app/
├── components/
└── ...
```

## Security Notes

- ✅ `.env.local` is already in `.gitignore` - your secrets are safe
- ❌ Never commit `.env.local` to version control
- ❌ Never share your API keys publicly
- ✅ The API keys are only used server-side (in API routes)

## Testing

After setting up your API keys and restarting the server:

1. Navigate to `/speak/roleplay`
2. Click on a scenario
3. Send a message - you should get an AI response
4. Click "Translate" on an AI message - you should see the translation

If you still get errors, check the terminal/console for more details.
