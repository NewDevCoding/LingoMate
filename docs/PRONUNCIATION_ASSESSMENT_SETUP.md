# Pronunciation Assessment Setup Guide

## Overview
This guide explains how to set up the pronunciation assessment feature using Azure Speech Services.

## Prerequisites
1. Azure account (free tier available)
2. Azure Speech resource created
3. API key and region

## Setup Steps

### 1. Create Azure Speech Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Speech"
4. Select "Speech" and click "Create"
5. Fill in the required information:
   - **Subscription**: Your Azure subscription
   - **Resource Group**: Create new or use existing
   - **Region**: Choose a region (e.g., `eastus`, `westus`, `westeurope`)
   - **Name**: Give your resource a name
   - **Pricing Tier**: Choose "Free (F0)" for testing or "Standard (S0)" for production
6. Click "Review + create" then "Create"

### 2. Get API Key and Region

1. After the resource is created, go to the resource page
2. Click on "Keys and Endpoint" in the left menu
3. Copy **Key 1** (or Key 2)
4. Note the **Region** (e.g., `eastus`)

### 3. Configure Environment Variables

Add the following to your `.env.local` file:

```env
AZURE_SPEECH_KEY=your_api_key_here
AZURE_SPEECH_REGION=your_region_here
```

Example:
```env
AZURE_SPEECH_KEY=1234567890abcdef1234567890abcdef
AZURE_SPEECH_REGION=eastus
```

### 4. Install Dependencies

The Azure Speech SDK is already installed. If you need to reinstall:

```bash
npm install microsoft-cognitiveservices-speech-sdk
```

## Usage

### In Roleplay Session

1. Record a voice message using the microphone button
2. Wait for transcription to complete
3. Click "Assess Pronunciation" button
4. View the assessment results with scores and suggestions

### API Endpoint

The assessment API is available at:
```
POST /api/speech/assess
```

**Request:**
- `audio`: Audio file (Blob/File)
- `language`: Language code (e.g., "es", "en", "fr")
- `referenceText`: (Optional) Expected text for comparison

**Response:**
```json
{
  "pronunciation": {
    "accuracyScore": 85,
    "fluencyScore": 80,
    "completenessScore": 90,
    "overallScore": 85,
    "words": [...],
    "suggestions": [...],
    "transcription": "..."
  }
}
```

## Premium Feature Gating

### Free Tier
- 5 assessments per day
- Basic scores only
- No word-level highlighting

### Premium Tier
- Unlimited assessments
- Detailed word-level feedback
- Phoneme-level analysis
- Progress tracking

To enable premium features, update `lib/subscription/subscription.ts` to check actual subscription status.

## Troubleshooting

### Error: "Azure Speech API key not configured"
- Make sure `AZURE_SPEECH_KEY` is set in `.env.local`
- Restart your development server after adding the key

### Error: "Failed to assess pronunciation"
- Check that your Azure Speech resource is active
- Verify the region matches your resource region
- Check that you have sufficient quota (free tier has limits)

### Assessment returns placeholder scores
- The Azure Speech SDK might need additional configuration
- Check server logs for detailed error messages
- Ensure audio format is supported (WEBM_OPUS, MP4, etc.)

## Cost Considerations

### Free Tier (F0)
- 5 hours of audio per month
- Good for testing and development

### Standard Tier (S0)
- Pay-as-you-go pricing
- ~$1 per 1000 audio minutes
- Recommended for production

## Next Steps

1. **Test the feature**: Record a message and assess pronunciation
2. **Customize feedback**: Modify `PronunciationFeedback.tsx` for different UI
3. **Add usage tracking**: Implement database tracking for free tier limits
4. **Integrate subscription**: Connect with your payment/subscription system

## Resources

- [Azure Speech Documentation](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/)
- [Pronunciation Assessment Guide](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-pronunciation-assessment)
- [Azure Speech SDK Reference](https://learn.microsoft.com/en-us/javascript/api/microsoft-cognitiveservices-speech-sdk/)
