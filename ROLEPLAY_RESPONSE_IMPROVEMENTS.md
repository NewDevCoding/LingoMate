# Roleplay Response Quality Improvements - Implementation Plan

## Overview

This document outlines the plan to improve AI response quality in roleplay scenarios. The goal is to make responses more controlled, concise, scenario-appropriate, and natural.

---

## Current Issues

1. **Response Length**: AI sometimes generates long, multi-sentence responses
2. **Topic Drift**: Responses can go off-topic from the scenario
3. **Inconsistent Style**: Responses vary in formality and style
4. **No Length Control**: No constraints on response length
5. **Generic Prompts**: System prompts are too basic

---

## Implementation Phases

### Phase 1: Enhanced System Prompts ⭐ START HERE
**Priority**: High | **Effort**: Low | **Impact**: High

**File**: `features/speak/roleplay/roleplay.service.ts`

**Tasks**:
1. Update each scenario's `systemPrompt` with:
   - Explicit response length limits (1-2 sentences max)
   - Style guidelines (concise, natural, conversational)
   - Topic boundaries (what to discuss, what to avoid)
   - Difficulty-appropriate language instructions
   - Examples of good vs. bad responses

**Example Enhanced Prompt Structure**:
```
You are a friendly barista at a Spanish coffee shop.

RESPONSE RULES:
- Keep responses to 1-2 sentences maximum
- Be concise, natural, and conversational
- Only discuss coffee shop ordering, preferences, and recommendations
- Use simple, beginner-friendly Spanish
- Avoid long explanations or multiple questions in one response

GOOD: "¡Por supuesto! ¿Qué tamaño prefiere: pequeño, mediano o grande?"
BAD: "¡Por supuesto! Tenemos varios tamaños disponibles. ¿Prefiere pequeño, mediano o grande? También tenemos opciones sin cafeína si lo desea."

Stay focused on helping the customer order coffee and pastries.
```

**Deliverables**:
- [ ] Update all 6 scenario system prompts
- [ ] Test each scenario to verify improved responses
- [ ] Document prompt structure for future scenarios

---

### Phase 2: LLM Parameter Tuning
**Priority**: High | **Effort**: Low | **Impact**: Medium-High

**File**: `lib/ai/llm.client.ts`

**Tasks**:
1. Add `max_tokens` parameter to limit response length
   - Beginner: 50-80 tokens (~1-2 sentences)
   - Intermediate: 80-120 tokens (~2-3 sentences)
   - Advanced: 120-150 tokens (~3-4 sentences)

2. Lower `temperature` for roleplay scenarios
   - Current: 0.7 (too creative/variable)
   - Recommended: 0.3-0.5 (more consistent, controlled)

3. Add optional parameters to `chat()` method:
   ```typescript
   async chat(
     messages: ChatMessage[],
     options?: {
       maxTokens?: number;
       temperature?: number;
     }
   ): Promise<LLMResponse>
   ```

**File**: `app/api/roleplay/message/route.ts`

**Tasks**:
1. Pass scenario difficulty to determine max_tokens
2. Use lower temperature for roleplay (0.4 recommended)
3. Call LLM with optimized parameters

**Deliverables**:
- [ ] Add max_tokens calculation based on difficulty
- [ ] Lower temperature to 0.4 for roleplay
- [ ] Test response length consistency
- [ ] Adjust token limits based on testing

---

### Phase 3: Enhanced Prompt Building with Context Reinforcement
**Priority**: Medium | **Effort**: Medium | **Impact**: Medium

**File**: `app/api/roleplay/message/route.ts`

**Tasks**:
1. Build enhanced system prompt that includes:
   - Base scenario prompt
   - Response style reminders
   - Current conversation context
   - Topic boundaries reinforcement

2. Add context injection before each user message:
   ```typescript
   const enhancedSystemPrompt = `
   ${scenario.systemPrompt}
   
   REMINDER: Keep your response to 1-2 sentences. Stay focused on ${scenario.theme}.
   Current scenario: ${scenario.title}
   `;
   ```

3. Optionally track conversation stage and adjust prompts:
   - Greeting stage
   - Main interaction stage
   - Closing stage

**Deliverables**:
- [ ] Create prompt builder function
- [ ] Inject context reminders into system prompt
- [ ] Test that responses stay on-topic
- [ ] Document conversation stage tracking (optional)

---

### Phase 4: Response Post-Processing & Validation
**Priority**: Medium | **Effort**: Medium | **Impact**: Medium

**File**: `app/api/roleplay/message/route.ts` or new utility file

**Tasks**:
1. Create response validator function:
   ```typescript
   function validateResponse(
     response: string,
     scenario: RoleplayScenario
   ): { isValid: boolean; cleaned?: string; reason?: string }
   ```

2. Implement validation checks:
   - Length check (max 2 sentences)
   - Topic relevance (basic keyword check)
   - Language check (ensure target language)
   - Trim if too long

3. Post-process responses:
   - Split on sentence boundaries
   - Take first 1-2 sentences if too long
   - Remove trailing incomplete sentences
   - Trim whitespace

**Deliverables**:
- [ ] Create response validation utility
- [ ] Implement length trimming
- [ ] Add basic topic validation
- [ ] Test edge cases (very long responses, off-topic)

---

### Phase 5: Advanced Features (Optional)
**Priority**: Low | **Effort**: High | **Impact**: Low-Medium

**Tasks**:
1. **Conversation State Tracking**
   - Track conversation stages
   - Adjust prompts based on stage
   - Prevent repetition

2. **Response Quality Scoring**
   - Score responses before sending
   - Regenerate if quality is low
   - Log quality metrics

3. **Scenario-Specific Vocabulary**
   - Inject relevant vocabulary lists
   - Guide AI to use scenario-appropriate words
   - Track vocabulary usage

4. **A/B Testing Framework**
   - Test different prompt variations
   - Compare response quality
   - Optimize based on results

---

## Implementation Order

1. ✅ **Phase 1** - Enhanced System Prompts (Quick win, high impact)
2. ✅ **Phase 2** - LLM Parameter Tuning (Easy, immediate improvement)
3. ✅ **Phase 3** - Enhanced Prompt Building (Builds on Phase 1)
4. ✅ **Phase 4** - Response Post-Processing (Safety net)
5. ⏸️ **Phase 5** - Advanced Features (Future enhancement)

---

## Testing Strategy

### After Each Phase:
1. Test each scenario (coffee shop, restaurant, airport, hotel, shopping, doctor)
2. Verify response length (should be 1-2 sentences)
3. Check topic relevance (stays on scenario theme)
4. Test edge cases (very short user messages, off-topic user messages)
5. Compare before/after response quality

### Success Metrics:
- ✅ Average response length: 1-2 sentences
- ✅ Topic relevance: >95% on-topic
- ✅ User satisfaction: Responses feel natural and appropriate
- ✅ No off-topic tangents

---

## Files to Modify

1. `features/speak/roleplay/roleplay.service.ts` - System prompts
2. `lib/ai/llm.client.ts` - LLM parameters
3. `app/api/roleplay/message/route.ts` - Prompt building & validation
4. `lib/ai/prompt.builder.ts` (new) - Prompt building utilities (optional)
5. `lib/utils/response.validator.ts` (new) - Response validation (optional)

---

## Example Enhanced System Prompt Template

```typescript
const enhancedPrompt = `
You are ${role} in a ${scenario} scenario.

SCENARIO: ${scenario.title}
DIFFICULTY: ${difficulty}
LANGUAGE: ${language}

RESPONSE RULES:
1. Keep responses to 1-2 sentences maximum
2. Be concise, natural, and conversational
3. Stay focused on: ${topicBoundaries}
4. Use ${difficulty}-level ${language}
5. Avoid: ${thingsToAvoid}

GOOD EXAMPLE: "${goodExample}"
BAD EXAMPLE: "${badExample}"

Remember: Short, natural, on-topic responses only.
`;
```

---

## Notes

- Start with Phase 1 - it's the foundation for everything else
- Test incrementally after each phase
- Adjust token limits and temperature based on real-world testing
- Keep prompts concise - too long prompts can confuse the AI
- Document what works best for each scenario type

---

## Future Enhancements

- Conversation flow management (track stages)
- Adaptive difficulty (adjust based on user performance)
- Response templates for common scenarios
- Multi-turn conversation goals (e.g., "complete an order")
- User feedback integration (learn from user corrections)
