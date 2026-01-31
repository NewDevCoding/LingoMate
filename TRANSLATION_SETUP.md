# Translation Feature Setup Guide

## Overview

The translation feature automatically translates words when clicked in the interactive reader. It uses Google Cloud Translation API to provide accurate translations.

## Setup Instructions

### 1. Get Google Cloud Translation API Key

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

### 2. Add API Key to Environment Variables

Add the following to your `.env.local` file in the project root:

```env
GOOGLE_TRANSLATE_API_KEY=your-api-key-here
```

**Important:** 
- Never commit `.env.local` to version control
- The `.env.local` file is already in `.gitignore`

### 3. Restart Development Server

After adding the environment variable, restart your Next.js development server:

```bash
npm run dev
```

## Usage

1. Open an article in the interactive reader
2. Click on any word
3. The translation will automatically appear in the sidebar
4. You can edit the translation if needed
5. Save to vocabulary by clicking the comprehension level buttons

## API Costs

- **Free Tier**: 500,000 characters per month
- **Paid Tier**: $20 per million characters after free tier

For most users, the free tier is sufficient for learning purposes.

## Troubleshooting

### Translation not working?

1. **Check API Key**: Make sure `GOOGLE_TRANSLATE_API_KEY` is set in `.env.local`
2. **Check API Status**: Verify the Cloud Translation API is enabled in Google Cloud Console
3. **Check Console**: Open browser console to see any error messages
4. **Check API Quota**: Ensure you haven't exceeded the free tier limit

### Error: "Translation service not configured"

- The API key is missing from environment variables
- Make sure `.env.local` exists and contains `GOOGLE_TRANSLATE_API_KEY`
- Restart the development server after adding the key

### Error: "Translation service error"

- The API key might be invalid or restricted
- Check API key restrictions in Google Cloud Console
- Verify the Cloud Translation API is enabled

## Configuration

### Default Language Settings

Currently, the translation defaults to:
- **Source Language**: Spanish (`es`)
- **Target Language**: English (`en`)

To change these defaults, update the `getTranslation` call in `features/reader/WordDefinitionPanel.tsx`:

```typescript
const translationResult = await getTranslation(word, {
  sourceLang: 'es', // Change to your source language
  targetLang: 'en', // Change to your target language
});
```

Future enhancements will allow language selection from user settings.

## Testing

To test the translation feature:

1. Make sure the API key is configured
2. Open an article with Spanish content
3. Click on a Spanish word (e.g., "hola", "mundo")
4. Verify the translation appears in the sidebar
5. Check that the translation is pre-filled in the input field

## Next Steps

- [ ] Add language detection from article metadata
- [ ] Add user language preferences
- [ ] Add context-aware translation (sentence context)
- [ ] Add translation caching to reduce API calls
- [ ] Add multiple translation options
