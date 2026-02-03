# Audio Recording Feature Implementation Plan

## Overview
This document outlines the implementation plan for adding audio recording functionality to the roleplay scenarios feature. Users will be able to record audio responses instead of typing, with automatic transcription to text.

## Intended Workflow
1. User clicks microphone icon in text input field
2. Recording begins automatically (no need to hold button)
3. Volume spike animation displays during recording (WhatsApp-style)
4. Trash icon appears on left side to cancel recording
5. User clicks microphone again (or send button) to stop recording
6. Audio is transcribed automatically
7. Transcribed text appears in input field for editing
8. User can send the message as normal

---

## Phase 1: Core Recording Functionality

### 1.1 State Management
Add the following state variables to `RoleplaySession.tsx`:

```typescript
const [isRecording, setIsRecording] = useState(false);
const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
const [recordingDuration, setRecordingDuration] = useState(0);
const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
const [volumeLevel, setVolumeLevel] = useState(0); // 0-100 for animation
const [isTranscribing, setIsTranscribing] = useState(false);
```

### 1.2 MediaRecorder Setup
- Request microphone permission via `navigator.mediaDevices.getUserMedia()`
- Initialize `MediaRecorder` with appropriate audio MIME type
- Handle browser compatibility (fallback MIME types: `audio/webm`, `audio/mp4`, `audio/ogg`)
- Set up event listeners:
  - `dataavailable` - collect audio chunks
  - `stop` - finalize recording and create blob
  - `error` - handle recording errors gracefully

### 1.3 Recording Controls
- **Start Recording**: Click microphone icon → request mic permission → start MediaRecorder
- **Stop Recording**: Click microphone again (or send button) → stop MediaRecorder → process audio
- **Cancel Recording**: Click trash icon → stop recording → clear audio → reset all state

---

## Phase 2: UI Components & Layout

### 2.1 Input Field Layout Changes

**Layout Structure:**
```
[Trash Icon] [Input Field with Volume Animation] [Microphone/Send Button]
```

**Component States:**
- **Idle**: `[Input Field] [Microphone Icon]`
- **Recording**: `[Trash Icon] [Input with Volume Bars] [Stop/Send Icon]`
- **Processing**: `[Input Field] [Loading Spinner]`
- **Ready**: `[Input Field with Text] [Send Button]`

### 2.2 Microphone Button
- **Location**: Right side of input field (replace or alongside send button)
- **Icon**: Microphone SVG icon
- **Behavior**:
  - **Idle State**: Gray microphone icon, clickable
  - **Recording State**: Red pulsing circle with stop icon
  - **Click Action**: Toggle recording on/off
- **Styling**: Match existing button styles, purple theme

### 2.3 Trash Icon (Cancel)
- **Location**: Left side of input field
- **Visibility**: Only shown when `isRecording === true`
- **Behavior**: Click → cancel recording, reset all state
- **Styling**: Red/error color, hover effect, smooth appearance animation

### 2.4 Volume Animation (WhatsApp-style)
- **Component**: Animated bars inside input field
- **Implementation**:
  - Use `AnalyserNode` from `AudioContext` to get real-time volume data
  - Create 3-5 vertical bars that scale with volume level
  - Bars animate up/down based on `volumeLevel` state
  - Color: Purple (#8b5cf6) matching user message theme
  - Animation: Smooth transitions, responsive to voice input
- **Visual**: Bars should pulse and scale smoothly, creating a dynamic visual feedback

---

## Phase 3: Audio Processing & Transcription

### 3.1 Volume Level Detection
- Use `AudioContext` + `AnalyserNode` for real-time audio analysis
- Connect microphone stream to analyser node
- Calculate RMS (Root Mean Square) for accurate volume measurement
- Update `volumeLevel` state at ~60fps using `requestAnimationFrame`
- Normalize volume to 0-100 range for consistent animation

**Implementation:**
```typescript
const analyser = audioContext.createAnalyser();
analyser.fftSize = 256;
const dataArray = new Uint8Array(analyser.frequencyBinCount);
// Update in animation loop
analyser.getByteFrequencyData(dataArray);
const volume = calculateRMS(dataArray);
setVolumeLevel(volume);
```

### 3.2 Recording Timer
- Display duration while recording (format: `MM:SS`)
- Update every second using `setInterval`
- Show in input placeholder or above input field
- Reset when recording stops/cancels

### 3.3 Transcription API
- **New Endpoint**: `/api/speech/transcribe`
- **Method**: POST
- **Request**: FormData with audio blob
- **Response**: `{ text: string, language: string }`
- **Service Options**:
  - OpenAI Whisper API (recommended for accuracy)
  - Google Speech-to-Text API
  - Browser SpeechRecognition API (fallback)
- **Error Handling**: Graceful fallback, show error message to user

### 3.4 Post-Recording Flow
1. Stop recording → collect all audio chunks
2. Create audio blob from chunks
3. Show loading state (transcribing indicator)
4. Send blob to transcription API as FormData
5. Receive transcribed text
6. Populate input field with transcription
7. User can edit transcription before sending
8. Send button becomes active
9. User sends message as normal text

---

## Phase 4: Visual Design & Styling

### 4.1 Recording Animation Styles

```typescript
VolumeBarsContainer: {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
  height: '100%',
  padding: '0 12px',
  position: 'absolute',
  left: '50px', // After trash icon
} as React.CSSProperties,

VolumeBar: {
  width: '3px',
  backgroundColor: '#8b5cf6',
  borderRadius: '2px',
  transition: 'height 0.1s ease-out',
  minHeight: '4px',
  maxHeight: '20px',
} as React.CSSProperties,
```

### 4.2 Input Field States

**Normal State:**
- Standard input styling
- Placeholder: "Aa"
- Border: `#313131`

**Recording State:**
- Show volume bars instead of placeholder
- Timer display (e.g., "0:15")
- Border color: Purple (#8b5cf6) or red accent
- Input disabled (read-only)

**Processing State:**
- Disabled state
- Loading spinner or "Transcribing..." text
- Border: subtle animation

**Ready State:**
- Normal input with transcribed text
- User can edit
- Send button active

### 4.3 Button States

**Microphone Button:**
- **Idle**: Gray icon (#a0a0a0), hover effect
- **Recording**: Red pulsing circle (#ef4444), stop icon
- **Processing**: Disabled, loading spinner

**Trash Button:**
- **Color**: Red (#ef4444) or error color
- **Icon**: Trash/delete SVG
- **Animation**: Fade in when recording starts
- **Hover**: Darker red, scale effect

**Send Button:**
- **Active**: Purple (#8b5cf6) when text is ready
- **Disabled**: Gray when no text or processing

---

## Phase 5: Error Handling & Edge Cases

### 5.1 Permission Handling
- Request microphone permission on first click
- Handle denial gracefully:
  - Show informative message
  - Provide instructions for enabling permissions
  - Link to browser settings if possible
- Check permission status before attempting to record

### 5.2 Browser Compatibility
- Check for `MediaRecorder` support
- Check for `getUserMedia` support
- Fallback message for unsupported browsers
- Handle different MIME types:
  - `audio/webm` (Chrome, Firefox)
  - `audio/mp4` (Safari)
  - `audio/ogg` (Firefox)
- Test on major browsers: Chrome, Firefox, Safari, Edge

### 5.3 Recording Limits
- **Max Duration**: 60 seconds (configurable)
- Show warning at 50 seconds
- Auto-stop at limit
- Display max duration indicator

### 5.4 Network Errors
- Handle transcription API failures gracefully
- Show user-friendly error message
- Allow user to:
  - Retry transcription
  - Type message manually
  - Cancel and start over

### 5.5 Audio Quality Issues
- Handle low/no audio input
- Detect silent recordings
- Warn user if volume is too low
- Provide feedback on audio quality

---

## Phase 6: Implementation Steps

### Step 1: Add Microphone Button
- Add microphone icon button to input field
- Position on right side
- Add click handler (placeholder for now)

### Step 2: Implement MediaRecorder Setup
- Create `startRecording()` function
- Request microphone permission
- Initialize MediaRecorder
- Handle browser compatibility
- Test basic start/stop functionality

### Step 3: Add Trash Icon and Cancel
- Add trash icon component
- Show/hide based on `isRecording` state
- Implement cancel functionality
- Reset all recording state

### Step 4: Implement Volume Detection
- Set up AudioContext and AnalyserNode
- Create volume calculation function
- Update volume level in animation loop
- Test volume detection accuracy

### Step 5: Create Volume Animation
- Create VolumeBars component
- Animate bars based on volume level
- Style to match WhatsApp animation
- Test animation smoothness

### Step 6: Create Transcription API Endpoint
- Create `/api/speech/transcribe/route.ts`
- Set up OpenAI Whisper API (or chosen service)
- Handle audio blob upload
- Return transcribed text
- Add error handling

### Step 7: Integrate Transcription
- Add transcription call after recording stops
- Show loading state during transcription
- Populate input field with result
- Handle transcription errors

### Step 8: Add Timer Display
- Create timer component
- Update every second during recording
- Format as MM:SS
- Reset on stop/cancel

### Step 9: Polish UI/UX
- Smooth transitions between states
- Loading indicators
- Error messages
- Success feedback
- Accessibility improvements

### Step 10: Testing & Edge Cases
- Test across browsers
- Test permission scenarios
- Test error cases
- Test long recordings
- Test network failures
- Performance testing

---

## Technical Considerations

### Dependencies
- **No new npm packages needed** - MediaRecorder is native browser API
- **API Key Required**: For transcription service (OpenAI Whisper or Google Speech-to-Text)
- **Environment Variables**: Add transcription API key to `.env.local`

### File Structure
```
LingoMate/
├── features/
│   └── speak/
│       └── roleplay/
│           └── RoleplaySession.tsx (update)
├── app/
│   └── api/
│       └── speech/
│           └── transcribe/
│               └── route.ts (new)
└── lib/
    └── audio/
        └── recorder.ts (optional utility)
```

### Performance Considerations
- Volume analysis runs in `requestAnimationFrame` loop (60fps)
- Clean up audio streams on component unmount
- Release blob URLs after use to prevent memory leaks
- Debounce volume updates if needed for performance
- Stop analyser when not recording

### Security Considerations
- Validate audio file size before sending to API
- Sanitize transcribed text before displaying
- Handle sensitive audio data appropriately
- Consider privacy implications of audio recording

---

## API Endpoint Specification

### POST `/api/speech/transcribe`

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `audio`: Blob/File (audio recording)
  - `language`: string (optional, e.g., "es", "en")

**Response:**
```json
{
  "text": "transcribed text here",
  "language": "es",
  "confidence": 0.95
}
```

**Error Response:**
```json
{
  "error": "Transcription failed",
  "message": "Error details"
}
```

---

## Questions to Clarify

1. **Recording Stop Method**: Should recording stop when:
   - User clicks microphone again? ✅ (Recommended)
   - User clicks send button?
   - Both options available?

2. **Max Recording Duration**: 
   - Recommended: 60 seconds
   - Should we enforce a limit?

3. **Transcription Review**:
   - Should users be able to edit transcription before sending? ✅ (Recommended)
   - Or send automatically?

4. **Audio Storage**:
   - Store audio file in database?
   - Or only store transcription?
   - Recommended: Only transcription (save storage)

5. **Transcription Failure**:
   - Allow manual typing as fallback? ✅ (Recommended)
   - Show error and require retry?
   - Allow sending audio without transcription?

6. **Recording Indicator**:
   - Show timer in input placeholder?
   - Or separate display above input?

---

## Success Criteria

- ✅ User can click microphone to start recording
- ✅ Volume animation displays during recording
- ✅ Trash icon appears and allows canceling
- ✅ Recording stops on second click or send
- ✅ Audio is transcribed automatically
- ✅ Transcribed text appears in input field
- ✅ User can edit and send transcription
- ✅ Works across major browsers
- ✅ Handles errors gracefully
- ✅ Provides good user feedback

---

## Future Enhancements (Post-MVP)

- Voice activity detection (auto-stop on silence)
- Audio playback before sending
- Multiple language transcription support
- Real-time transcription display (as user speaks)
- Audio quality indicators
- Noise cancellation
- Recording history/playback
- Integration with voice commands

---

## Notes

- This feature enhances the roleplay experience by allowing natural speech input
- Transcription accuracy is critical for good UX
- Consider user privacy and data handling for audio recordings
- Test thoroughly on mobile devices (if applicable)
- Consider accessibility for users who cannot use microphone
