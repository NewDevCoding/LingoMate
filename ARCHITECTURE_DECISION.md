# Architecture Decision: Backend Strategy

## Decision: Use Next.js API Routes Only (No Separate Express Backend)

**Date:** 2024  
**Status:** ✅ Recommended  
**Decision Makers:** Development Team

---

## Context

LingoMate is a language learning platform built with Next.js 16 (App Router), React 19, and TypeScript. The project needs to implement backend functionality for:

- **AI Chat/Conversation** - LLM integration for language learning conversations
- **Speech Processing** - Speech-to-text (STT) and text-to-speech (TTS)
- **Progress Tracking** - User learning analytics and statistics
- **Vocabulary Management** - CRUD operations for vocabulary words
- **Database Operations** - Supabase integration for data persistence
- **Authentication** - User management (handled by Supabase)

---

## Decision

**Use Next.js API Routes exclusively** - no separate Express/Node.js backend service.

---

## Rationale

### ✅ Advantages of Next.js API Routes

1. **Already Established**
   - Project already has API route structure (`app/api/`)
   - Next.js 16 App Router with full API route support
   - TypeScript setup complete

2. **Simplified Architecture**
   - Single codebase and deployment
   - Shared TypeScript types between frontend and backend
   - No CORS configuration needed
   - Easier local development (one `npm run dev` command)

3. **Perfect Fit for Requirements**
   - **Supabase**: Works seamlessly from Next.js API routes
   - **AI Services**: Can call LLM APIs (OpenAI, Anthropic, etc.) from API routes
   - **Speech Processing**: Can proxy to services (Google Cloud Speech, AWS Polly) or use Web APIs
   - **Database**: Direct Supabase client access from server-side

4. **Better Developer Experience**
   - Co-located with frontend code
   - Shared utilities in `lib/` folder
   - Faster iteration cycles
   - Easier debugging

5. **Deployment Simplicity**
   - Single deployment target (Vercel, Netlify, etc.)
   - No separate backend service to manage
   - Lower infrastructure costs
   - Built-in edge function support

6. **Performance Benefits**
   - API routes can be deployed as edge functions
   - Lower latency (same origin requests)
   - Automatic code splitting and optimization

### ❌ When to Consider Separate Express Backend

A separate Express backend would make sense if you need:

- **Heavy Background Jobs**: Long-running tasks, cron jobs, queues
- **WebSocket at Scale**: Real-time features requiring persistent connections
- **Microservices Architecture**: Multiple independent services
- **Team Separation**: Different teams managing frontend/backend
- **Legacy System Integration**: Complex integrations requiring Express middleware

**None of these apply to LingoMate's current requirements.**

---

## Implementation Strategy

### Current Structure (Already in Place)

```
app/
├── api/                    # Next.js API Routes
│   ├── chat/route.ts      # AI chat endpoints
│   ├── speech/route.ts    # STT/TTS endpoints
│   ├── progress/route.ts  # Progress tracking
│   └── vocabulary/route.ts # Vocabulary CRUD
lib/
├── ai/                    # AI/LLM utilities
├── auth/                  # Authentication utilities
├── db/                    # Database client (Supabase)
├── speech/                # Speech processing utilities
└── learning/              # Learning algorithms
```

### Recommended Implementation Pattern

**Example: `/api/chat/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/db/client';
import { getLLMResponse } from '@/lib/ai/llm.client';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId } = await request.json();
    
    // Get user from Supabase auth
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Call LLM service
    const response = await getLLMResponse(message, user.id);
    
    // Save to database
    await supabase
      .from('conversations')
      .insert({ user_id: user.id, message, response });
    
    return NextResponse.json({ response });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Key Patterns

1. **Server-Side Only**: API routes run on server, never exposed to client
2. **Type Safety**: Use shared types from `types/` folder
3. **Error Handling**: Consistent error responses
4. **Authentication**: Verify user via Supabase in each route
5. **Service Layer**: Business logic in `lib/` utilities, not in routes

---

## Migration Path (If Needed Later)

If you later need a separate backend, the migration is straightforward:

1. **Extract API routes** to Express routes
2. **Move `lib/` utilities** to shared package or backend
3. **Update frontend** to call new backend URL
4. **Deploy separately** (backend + frontend)

The modular structure you already have makes this transition easier.

---

## Performance Considerations

### Next.js API Routes Performance

- **Edge Functions**: Can deploy API routes to edge for lower latency
- **Serverless**: Automatic scaling per request
- **Caching**: Built-in caching strategies
- **Streaming**: Support for streaming responses (useful for AI chat)

### Optimization Tips

1. **Use Edge Runtime** for simple routes:
   ```typescript
   export const runtime = 'edge';
   ```

2. **Cache Responses** where appropriate:
   ```typescript
   export const revalidate = 3600; // 1 hour
   ```

3. **Stream AI Responses** for better UX:
   ```typescript
   return new Response(stream, {
     headers: { 'Content-Type': 'text/event-stream' },
   });
   ```

---

## Security Considerations

### API Route Security

1. **Authentication**: Always verify user in API routes
2. **Rate Limiting**: Implement rate limiting (use libraries like `@upstash/ratelimit`)
3. **Input Validation**: Validate all inputs (use Zod or similar)
4. **Environment Variables**: Keep secrets in `.env.local` (never commit)
5. **CORS**: Not needed (same origin), but can configure if needed

### Example Security Pattern

```typescript
import { rateLimit } from '@/lib/utils/rate-limit';
import { validateRequest } from '@/lib/utils/validation';

export async function POST(request: NextRequest) {
  // 1. Rate limiting
  const rateLimitResult = await rateLimit(request);
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  
  // 2. Authentication
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 3. Input validation
  const body = await request.json();
  const validated = validateRequest(body);
  if (!validated.success) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }
  
  // 4. Business logic
  // ...
}
```

---

## Conclusion

**Recommendation: Proceed with Next.js API routes only.**

This approach:
- ✅ Leverages your existing setup
- ✅ Simplifies development and deployment
- ✅ Meets all current requirements
- ✅ Allows future migration if needed
- ✅ Provides excellent performance and developer experience

---

## Next Steps

1. ✅ **Decision Made**: Use Next.js API routes
2. **Implement API Routes**: Start with `/api/chat` and `/api/vocabulary`
3. **Set Up Supabase Client**: Complete `lib/db/client.ts`
4. **Integrate AI Services**: Set up LLM client in `lib/ai/llm.client.ts`
5. **Add Authentication**: Implement auth checks in API routes
6. **Add Rate Limiting**: Protect API routes from abuse
7. **Test & Deploy**: Test locally, then deploy to Vercel

---

**Questions or Concerns?**

If you encounter requirements that suggest a separate backend is needed, revisit this decision. For now, Next.js API routes are the optimal choice.
