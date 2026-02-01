# Google Cloud TTS Voice Selection Guide

## Important: You Don't "Create" Voices

Google Cloud TTS provides **pre-built voices** - you select from their library. You cannot create custom voices, but you can:
- Choose from many high-quality voices
- Select by language, gender, accent
- Adjust voice parameters (pitch, speed, volume)

---

## How to Select Voices

### Step 1: List Available Voices

First, you need to see what voices are available for your language. You can do this via:

**Option A: API Call (Programmatic)**
```typescript
// List all Spanish voices
GET https://texttospeech.googleapis.com/v1/voices?languageCode=es-ES
```

**Option B: Google Cloud Console**
- Go to Text-to-Speech API documentation
- View the [voices list](https://cloud.google.com/text-to-speech/docs/voices)

**Option C: Use the API route we'll create**
```typescript
// In your app
GET /api/speech/voices?language=es
```

### Step 2: Choose a Voice

Voices follow this naming pattern:
```
{language}-{country}-{type}-{variant}
```

**Examples for Spanish:**
- `es-ES-Standard-A` - Female, standard quality
- `es-ES-Standard-B` - Male, standard quality
- `es-ES-Neural2-A` - Female, neural (better quality)
- `es-ES-Neural2-B` - Male, neural (better quality)
- `es-ES-Neural2-C` - Female, neural (different tone)
- `es-ES-Neural2-D` - Male, neural (different tone)
- `es-ES-Neural2-E` - Female, neural
- `es-ES-Neural2-F` - Male, neural

**Spanish Variants Available:**
- `es-ES` - Spain Spanish
- `es-US` - US Spanish
- `es-MX` - Mexican Spanish
- `es-AR` - Argentine Spanish
- `es-CO` - Colombian Spanish
- And more...

### Step 3: Use the Voice in API Call

When making a TTS request, specify the voice:

```typescript
const request = {
  input: { text: "Hola, ¿cómo estás?" },
  voice: {
    languageCode: "es-ES",
    name: "es-ES-Neural2-A",  // Female Spanish voice
    ssmlGender: "FEMALE"      // Optional, helps with selection
  },
  audioConfig: {
    audioEncoding: "MP3",
    speakingRate: 1.0,        // Speed (0.25 to 4.0)
    pitch: 0.0,                // Pitch (-20.0 to 20.0)
    volumeGainDb: 0.0         // Volume (-96.0 to 16.0)
  }
};
```

---

## Voice Selection Strategy for Your App

### Recommended Approach

Since your scenarios are in Spanish (`language: 'es'`), here's a good strategy:

**1. Default Voice Selection Function**
```typescript
function getVoiceForLanguage(language: string, gender: 'male' | 'female' = 'female'): string {
  const voices: Record<string, { male: string; female: string }> = {
    'es': {
      female: 'es-ES-Neural2-A',  // High-quality female Spanish
      male: 'es-ES-Neural2-B'     // High-quality male Spanish
    },
    'en': {
      female: 'en-US-Neural2-F',
      male: 'en-US-Neural2-D'
    },
    // Add more languages as needed
  };
  
  return voices[language]?.[gender] || voices['es'].female;
}
```

**2. Per-Scenario Voice Selection**

You could also assign different voices per scenario for variety:

```typescript
// In roleplay.service.ts
const MOCK_SCENARIOS: RoleplayScenario[] = [
  {
    id: 'coffee-shop',
    // ... other fields
    language: 'es',
    voiceName: 'es-ES-Neural2-A',  // Friendly female voice
  },
  {
    id: 'doctor',
    // ... other fields
    language: 'es',
    voiceName: 'es-ES-Neural2-B',  // Professional male voice
  },
];
```

**3. Voice Parameters**

Adjust voice characteristics for different scenarios:

```typescript
// Friendly coffee shop - slightly faster, higher pitch
{
  speakingRate: 1.1,
  pitch: 2.0,
  volumeGainDb: 0.0
}

// Professional doctor - slower, lower pitch
{
  speakingRate: 0.95,
  pitch: -1.0,
  volumeGainDb: 0.0
}
```

---

## Available Spanish Voices (Neural2 - Best Quality)

### Spain Spanish (es-ES)
- **es-ES-Neural2-A** - Female, warm and friendly
- **es-ES-Neural2-B** - Male, clear and professional
- **es-ES-Neural2-C** - Female, energetic
- **es-ES-Neural2-D** - Male, calm
- **es-ES-Neural2-E** - Female, mature
- **es-ES-Neural2-F** - Male, authoritative

### US Spanish (es-US)
- **es-US-Neural2-A** - Female
- **es-US-Neural2-B** - Male
- **es-US-Neural2-C** - Female

### Mexican Spanish (es-MX)
- **es-MX-Neural2-A** - Female
- **es-MX-Neural2-B** - Male
- **es-MX-Neural2-C** - Female

### Argentine Spanish (es-AR)
- **es-AR-Neural2-A** - Female
- **es-AR-Neural2-B** - Male

### Colombian Spanish (es-CO)
- **es-CO-Neural2-A** - Female
- **es-CO-Neural2-B** - Male

---

## Implementation Example

Here's how the TTS service will work:

```typescript
// lib/speech/tts.ts
export async function synthesizeSpeech(
  text: string,
  language: string = 'es',
  voiceName?: string
): Promise<ArrayBuffer> {
  // Auto-select voice if not provided
  const selectedVoice = voiceName || getVoiceForLanguage(language);
  
  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: language === 'es' ? 'es-ES' : language,
          name: selectedVoice,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
        },
      }),
    }
  );
  
  const data = await response.json();
  // Decode base64 audio
  return Buffer.from(data.audioContent, 'base64');
}
```

---

## Voice Parameters Explained

### `speakingRate` (Speed)
- **Range**: 0.25 to 4.0
- **Default**: 1.0 (normal speed)
- **Example**: 
  - `0.8` = 20% slower (good for beginners)
  - `1.2` = 20% faster (for advanced learners)

### `pitch` (Tone)
- **Range**: -20.0 to 20.0 semitones
- **Default**: 0.0 (normal pitch)
- **Example**:
  - `-2.0` = Lower pitch (more serious)
  - `2.0` = Higher pitch (more friendly)

### `volumeGainDb` (Volume)
- **Range**: -96.0 to 16.0 decibels
- **Default**: 0.0 (normal volume)
- **Example**:
  - `-3.0` = Quieter
  - `3.0` = Louder

---

## Recommendations for Language Learning

### Beginner Scenarios
- **Voice**: `es-ES-Neural2-A` (friendly female)
- **Speed**: `0.9` (slightly slower)
- **Pitch**: `1.0` (slightly higher, more engaging)

### Intermediate Scenarios
- **Voice**: `es-ES-Neural2-B` (clear male)
- **Speed**: `1.0` (normal)
- **Pitch**: `0.0` (neutral)

### Advanced Scenarios
- **Voice**: `es-ES-Neural2-D` (calm male)
- **Speed**: `1.1` (slightly faster)
- **Pitch**: `-1.0` (slightly lower, more natural)

---

## Testing Voices

You can test different voices using the Google Cloud Console:
1. Go to [Text-to-Speech API](https://console.cloud.google.com/apis/library/texttospeech.googleapis.com)
2. Click "Try this API"
3. Enter text and select different voices
4. Listen to the output

Or use the API directly:
```bash
curl -X POST \
  "https://texttospeech.googleapis.com/v1/text:synthesize?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {"text": "Hola, ¿cómo estás?"},
    "voice": {"languageCode": "es-ES", "name": "es-ES-Neural2-A"},
    "audioConfig": {"audioEncoding": "MP3"}
  }'
```

---

## Summary

1. **You don't create voices** - you select from Google's library
2. **Choose by language code** - `es-ES`, `es-MX`, etc.
3. **Select voice name** - `es-ES-Neural2-A`, `es-ES-Neural2-B`, etc.
4. **Adjust parameters** - speed, pitch, volume
5. **Use in API call** - specify in the request body

For your app, I recommend:
- **Default**: `es-ES-Neural2-A` (female, high quality)
- **Alternative**: `es-ES-Neural2-B` (male, high quality)
- **Speed**: `1.0` (normal) or `0.9` (slightly slower for learning)
