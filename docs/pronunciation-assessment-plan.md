# Pronunciation & Response Assessment Feature Plan

## Overview
This document outlines the implementation plan for a premium pronunciation and response quality assessment feature. This will analyze user audio recordings and provide detailed feedback on pronunciation accuracy, fluency, grammar, and overall response quality.

---

## Feature Goals

### 1. Pronunciation Assessment
- **Accuracy Scoring**: Rate pronunciation accuracy (0-100%)
- **Phoneme Analysis**: Identify specific sounds that need improvement
- **Word-level Feedback**: Highlight words with pronunciation issues
- **Stress & Intonation**: Analyze word stress and sentence intonation patterns
- **Native Speaker Comparison**: Compare against native speaker models

### 2. Response Quality Assessment
- **Grammar Checking**: Identify and suggest corrections for grammar errors
- **Vocabulary Usage**: Assess appropriateness and sophistication of word choice
- **Fluency Scoring**: Measure speech flow, pauses, and naturalness
- **Completeness**: Check if the response adequately addresses the prompt
- **Context Appropriateness**: Evaluate if response fits the conversation context

### 3. Visual Feedback
- **Score Display**: Overall pronunciation/quality score
- **Word Highlighting**: Color-coded words (green = good, yellow = needs work, red = incorrect)
- **Detailed Breakdown**: Show scores for accuracy, fluency, completeness
- **Improvement Suggestions**: Specific tips for each issue found

---

## API Service Options

### Option 1: Azure Cognitive Services Speech (Recommended)
**Pros:**
- Built-in pronunciation assessment API
- Provides accuracy, fluency, completeness scores
- Word-level and phoneme-level feedback
- Supports multiple languages (ES, EN, FR, DE, etc.)
- Good documentation and examples

**Cons:**
- Requires Azure account setup
- Pricing based on usage
- Additional API key management

**API Endpoint**: `https://{region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`

**Features:**
- Pronunciation accuracy score (0-100)
- Fluency score (0-100)
- Completeness score (0-100)
- Word-level accuracy scores
- Phoneme-level feedback
- Reference text comparison

**Pricing**: ~$1 per 1000 audio minutes (varies by region)

---

### Option 2: Google Cloud Speech-to-Text with Custom Analysis
**Pros:**
- Already using Google Cloud services
- Can leverage existing API keys
- Good transcription accuracy

**Cons:**
- No built-in pronunciation assessment
- Need to build custom analysis layer
- More complex implementation

**Approach:**
1. Use Google STT for transcription
2. Compare transcribed text to expected/reference text
3. Use phoneme alignment libraries for pronunciation analysis
4. Build custom scoring algorithm

---

### Option 3: AssemblyAI (Alternative)
**Pros:**
- Simple API
- Good transcription quality
- Some built-in features

**Cons:**
- Limited pronunciation assessment features
- May need custom implementation
- Additional service to manage

---

### Option 4: Hybrid Approach (Recommended for MVP)
**Phase 1: Basic Assessment (MVP)**
- Use Azure Speech Pronunciation Assessment API
- Provide overall scores and basic feedback
- Word-level highlighting

**Phase 2: Enhanced Assessment**
- Add grammar checking (using OpenAI/Anthropic)
- Add vocabulary analysis
- Add context appropriateness checking
- Add detailed phoneme-level feedback

---

## Implementation Plan

### Phase 1: Basic Pronunciation Assessment (MVP)

#### 1.1 API Endpoint Setup
**File**: `app/api/speech/assess/route.ts`

**Request:**
```typescript
{
  audio: File/Blob,
  language: string, // 'es', 'en', 'fr', etc.
  referenceText?: string, // Optional: expected text for comparison
}
```

**Response:**
```typescript
{
  pronunciation: {
    accuracyScore: number, // 0-100
    fluencyScore: number, // 0-100
    completenessScore: number, // 0-100
    overallScore: number, // Weighted average
  },
  words: Array<{
    word: string,
    accuracyScore: number,
    errorType?: 'Mispronunciation' | 'Omission' | 'Insertion',
    phonemes?: Array<{
      phoneme: string,
      accuracyScore: number,
    }>,
  }>,
  transcription: string,
  suggestions: string[], // Improvement tips
}
```

#### 1.2 Azure Speech Service Integration
- Set up Azure Speech resource
- Configure pronunciation assessment
- Handle authentication (API key or token)
- Process audio and return assessment

#### 1.3 UI Components
**File**: `features/speak/roleplay/PronunciationFeedback.tsx`

**Features:**
- Score display (circular progress or bar)
- Word-level highlighting in transcribed text
- Expandable detailed breakdown
- Improvement suggestions panel

#### 1.4 Integration with Roleplay Session
- Add "Assess Pronunciation" button/option
- Show feedback after recording
- Allow user to retry based on feedback
- Store assessment history

---

### Phase 2: Response Quality Assessment

#### 2.1 Grammar Checking API
**Option A: OpenAI GPT-4**
- Use GPT-4 for grammar correction
- Provide explanations for corrections
- Suggest alternative phrasings

**Option B: LanguageTool API**
- Open-source grammar checker
- Multiple language support
- Free tier available

#### 2.2 Vocabulary Analysis
- Check word appropriateness for level
- Suggest more natural alternatives
- Identify advanced vocabulary usage
- Flag informal/inappropriate language

#### 2.3 Context Appropriateness
- Compare response to conversation context
- Check if response answers the question
- Assess politeness/formality level
- Suggest improvements for naturalness

---

### Phase 3: Advanced Features

#### 3.1 Phoneme-Level Feedback
- Visual phoneme breakdown
- Show correct vs. user pronunciation
- Interactive phoneme practice

#### 3.2 Progress Tracking
- Track pronunciation improvement over time
- Show progress graphs
- Identify persistent issues
- Celebrate improvements

#### 3.3 Personalized Recommendations
- AI-generated practice exercises
- Focus on specific problem areas
- Adaptive difficulty based on performance

#### 3.4 Comparison Mode
- Compare to native speaker audio
- Side-by-side waveform visualization
- Highlight differences

---

## Technical Architecture

### File Structure
```
LingoMate/
├── app/
│   └── api/
│       └── speech/
│           ├── transcribe/
│           │   └── route.ts (existing)
│           └── assess/
│               └── route.ts (new)
├── features/
│   └── speak/
│       └── roleplay/
│           ├── RoleplaySession.tsx (update)
│           └── PronunciationFeedback.tsx (new)
│           └── AssessmentPanel.tsx (new)
├── lib/
│   └── speech/
│       ├── pronunciation.assessor.ts (new)
│       └── response.analyzer.ts (new)
└── types/
    └── assessment.ts (new)
```

### Type Definitions
```typescript
// types/assessment.ts
export interface PronunciationAssessment {
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  overallScore: number;
  words: WordAssessment[];
  phonemes?: PhonemeAssessment[];
  suggestions: string[];
}

export interface WordAssessment {
  word: string;
  accuracyScore: number;
  errorType?: 'Mispronunciation' | 'Omission' | 'Insertion';
  startTime?: number;
  endTime?: number;
  phonemes?: PhonemeAssessment[];
}

export interface PhonemeAssessment {
  phoneme: string;
  accuracyScore: number;
  expectedPhoneme?: string;
  actualPhoneme?: string;
}

export interface ResponseQualityAssessment {
  grammarScore: number;
  vocabularyScore: number;
  fluencyScore: number;
  completenessScore: number;
  contextScore: number;
  overallScore: number;
  corrections: GrammarCorrection[];
  suggestions: string[];
}

export interface GrammarCorrection {
  original: string;
  corrected: string;
  explanation: string;
  type: 'grammar' | 'vocabulary' | 'style';
}
```

---

## UI/UX Design

### Assessment Display Options

#### Option 1: Inline Feedback (Recommended)
- Show scores above transcribed text
- Highlight words with color coding
- Click words to see detailed feedback
- Expandable suggestions panel

#### Option 2: Side Panel
- Similar to translation panel
- Show detailed breakdown
- Comparison view
- History of assessments

#### Option 3: Modal/Overlay
- Full-screen assessment view
- Detailed analysis
- Practice suggestions
- Close and retry options

---

## Premium Feature Gating

### Implementation Strategy

1. **Database Schema**
   - Add `subscription_tier` to users table
   - Add `assessment_usage` tracking table
   - Track free vs. premium usage

2. **API Middleware**
   - Check user subscription status
   - Enforce usage limits for free users
   - Return appropriate error messages

3. **UI Gating**
   - Show "Upgrade to Pro" for free users
   - Limit assessment frequency
   - Show premium badge/indicator

4. **Usage Limits (Free Tier)**
   - 5 assessments per day
   - Basic scores only (no detailed breakdown)
   - No phoneme-level feedback

5. **Premium Features**
   - Unlimited assessments
   - Detailed phoneme analysis
   - Progress tracking
   - Personalized recommendations
   - Comparison mode

---

## Cost Considerations

### Azure Speech Pricing (Example)
- **Standard**: ~$1 per 1000 audio minutes
- **Free Tier**: 5 hours/month free
- **Estimated Cost**: $0.001 per assessment (assuming 30-second recordings)

### OpenAI Grammar Checking (If Used)
- **GPT-4**: ~$0.03 per 1K tokens
- **Estimated Cost**: $0.01-0.02 per assessment

### Total Estimated Cost per Assessment
- **Basic (Pronunciation only)**: ~$0.001
- **Full (Pronunciation + Grammar)**: ~$0.01-0.02

---

## Implementation Phases

### Phase 1: MVP (2-3 weeks)
- [ ] Set up Azure Speech account
- [ ] Create `/api/speech/assess` endpoint
- [ ] Basic pronunciation assessment
- [ ] Simple UI feedback component
- [ ] Integration with roleplay session
- [ ] Premium feature gating

### Phase 2: Enhanced Assessment (2-3 weeks)
- [ ] Grammar checking integration
- [ ] Vocabulary analysis
- [ ] Context appropriateness
- [ ] Enhanced UI with detailed breakdown
- [ ] Progress tracking

### Phase 3: Advanced Features (3-4 weeks)
- [ ] Phoneme-level feedback
- [ ] Comparison mode
- [ ] Personalized recommendations
- [ ] Progress analytics
- [ ] Practice exercises

---

## Success Metrics

- **User Engagement**: % of users who use assessment feature
- **Improvement Rate**: Average score improvement over time
- **Premium Conversion**: % of free users who upgrade for assessments
- **Feature Satisfaction**: User ratings/feedback on assessments
- **Accuracy**: How well assessments match user perception

---

## Questions to Consider

1. **When to show assessment?**
   - After every recording? (Premium)
   - On-demand only? (User clicks button)
   - After specific prompts?

2. **Reference text?**
   - Use AI-generated expected response?
   - Compare to previous user responses?
   - Use scenario-specific templates?

3. **Feedback granularity?**
   - Overall score only? (Free)
   - Word-level? (Premium)
   - Phoneme-level? (Premium+)

4. **Retry mechanism?**
   - Allow unlimited retries?
   - Show improvement tracking?
   - Suggest specific practice?

---

## Next Steps

1. **Choose API service** (Recommend Azure Speech)
2. **Set up Azure account** and get API keys
3. **Create MVP endpoint** for basic pronunciation assessment
4. **Build simple UI component** to display feedback
5. **Integrate with roleplay session**
6. **Add premium gating**
7. **Test and iterate**

---

## Resources

- [Azure Speech Pronunciation Assessment](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-pronunciation-assessment)
- [Azure Speech SDK Documentation](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/quickstarts/setup-platform)
- [LanguageTool API](https://languagetool.org/http-api/)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
