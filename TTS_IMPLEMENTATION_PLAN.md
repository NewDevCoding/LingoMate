# Text-to-Speech (TTS) Implementation Plan

## Overview

Implement auto-playing TTS for AI messages in roleplay scenarios using native speaker voices.

---

## Implementation Options

### Option 1: Google Cloud Text-to-Speech (Recommended)
**Pros:**
- High-quality native speaker voices
- Multiple voice options per language
- Natural pronunciation
- Good for Spanish (multiple accents available)

**Cons:**
- Requires API key and billing setup
- Costs per character (~$4 per million characters)

**API**: Google Cloud Text-to-Speech API

### Option 2: Browser Web Speech API (Fallback)
**Pros:**
- Free, no API key needed
- Works offline
- No server-side processing

**Cons:**
- Limited voice quality
- Voice availability depends on browser/OS
- Less natural pronunciation

**API**: `window.speechSynthesis`

### Option 3: Hybrid Approach (Best)
- Primary: Google Cloud TTS (high quality)
- Fallback: Browser Web Speech API (if API key not configured)

---

## Implementation Plan

### Phase 1: TTS Service & API Route
**Files**: 
- `lib/speech/tts.ts` - TTS service
- `app/api/speech/tts/route.ts` - TTS API endpoint

**Tasks**:
1. Create TTS service with Google Cloud TTS integration
2. Add browser TTS fallback
3. Create API route that returns audio blob
4. Support language-specific voice selection

### Phase 2: Audio Manager
**File**: `lib/speech/audio.manager.ts`

**Tasks**:
1. Create audio playback manager
2. Handle audio queue (don't overlap multiple audio)
3. Stop/play/pause controls
4. Cleanup on unmount

### Phase 3: Integration with Roleplay
**File**: `features/speak/roleplay/RoleplaySession.tsx`

**Tasks**:
1. Auto-play TTS when AI message arrives
2. Add replay button functionality
3. Handle audio playback state
4. Stop previous audio when new message arrives

---

## Technical Details

### Google Cloud TTS Setup
1. Enable Cloud Text-to-Speech API
2. Get API key or use service account
3. Add to `.env.local`: `GOOGLE_TTS_API_KEY`

### Voice Selection
- Spanish (es): `es-ES-Standard-A` (female) or `es-ES-Standard-B` (male)
- Can be configurable per scenario

### Audio Format
- Format: MP3 or WAV
- Return as blob URL for browser playback
- Cache audio for repeated messages (optional)

---

## User Experience

1. **Auto-play**: When AI sends message → audio plays automatically
2. **Replay button**: Click to replay the audio
3. **Stop on new message**: If new message arrives, stop current audio
4. **Volume control**: Use browser/system volume
5. **Loading state**: Show loading while generating audio (optional)

---

## Files to Create/Modify

1. `lib/speech/tts.ts` - TTS service implementation
2. `app/api/speech/tts/route.ts` - TTS API endpoint
3. `lib/speech/audio.manager.ts` - Audio playback manager
4. `features/speak/roleplay/RoleplaySession.tsx` - Integrate TTS
5. `.env.local` - Add `GOOGLE_TTS_API_KEY` (optional)

---

## Next Steps

1. Implement TTS service with Google Cloud TTS
2. Add browser TTS fallback
3. Create API route
4. Integrate auto-play in roleplay component
5. Add replay functionality
