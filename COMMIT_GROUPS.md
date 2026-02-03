# Commit Groups for Uncommitted Changes

## Group 1: Core Authentication Infrastructure
**Commit message:** `feat: add Supabase authentication infrastructure`

### Files:
- `lib/db/client.ts` - Updated to split client/server clients
- `lib/db/server.ts` - New server-side Supabase client
- `lib/auth/auth.ts` - Client-side auth functions (signIn, signUp, signOut, etc.)
- `lib/auth/server.ts` - Server-side auth helpers for API routes
- `components/AuthProvider.tsx` - React context for auth state
- `middleware.ts` - Route protection middleware

**Why together:** These are the foundational pieces that enable authentication. They work together as a cohesive system.

---

## Group 2: Authentication UI Pages
**Commit message:** `feat: add authentication pages (login, signup, password reset)`

### Files:
- `app/auth/login/page.tsx` - Login page with email confirmation handling
- `app/auth/signup/page.tsx` - Signup page
- `app/auth/forgot-password/page.tsx` - Password reset request
- `app/auth/reset-password/page.tsx` - Password reset confirmation

**Why together:** All user-facing authentication pages that work together as a complete auth flow.

---

## Group 3: Auth Integration into Existing Components
**Commit message:** `feat: integrate authentication into app layout and header`

### Files:
- `app/layout.tsx` - Added AuthProvider wrapper
- `components/AppLayout.tsx` - Hide sidebar/header on auth pages
- `components/TopHeader.tsx` - User profile menu with sign out

**Why together:** These integrate auth into the existing UI without changing core functionality.

---

## Group 4: Dependencies Update
**Commit message:** `chore: add @supabase/ssr package for Next.js auth support`

### Files:
- `package.json` - Added @supabase/ssr dependency
- `package-lock.json` - Lock file update

**Why together:** Single dependency addition, should be committed separately.

---

## Group 5: Authentication Documentation
**Commit message:** `docs: add authentication setup and email confirmation guides`

### Files:
- `AUTH_SETUP.md` - Complete auth setup guide
- `EMAIL_CONFIRMATION_SETUP.md` - Email confirmation troubleshooting

**Why together:** Documentation that explains how to use the auth system.

---

## Group 6: Bug Fixes and Minor Updates
**Commit message:** `fix: add missing chat route handler and update config`

### Files:
- `app/api/chat/route.ts` - Fixed empty route file (was causing build error)
- `tsconfig.json` - TypeScript config updates (likely auto-updated by Next.js)

**Note:** `next-env.d.ts` is in `.gitignore` and should NOT be committed.

**Why together:** Bug fixes and config files that aren't part of the main feature.

---

## Group 7: Other Modified Files (Review Needed)
**Commit message:** `chore: update roleplay components and schema`

### Files:
- `app/speak/roleplay/[id]/page.tsx` - Modified (need to check what changed)
- `features/speak/roleplay/RoleplaySession.tsx` - Modified (need to check what changed)
- `lib/db/schema.ts` - Modified (need to check what changed)

**Why together:** These files were modified but may not be directly related to auth. Review to see if they should be in a separate commit or if changes are auth-related.

---

## Ignore These (Build Artifacts)
These are auto-generated and should NOT be committed:
- All files in `.next/` directory

---

## Recommended Commit Order

1. **Group 4** (Dependencies) - Do this first so the code has the packages it needs
2. **Group 1** (Core Infrastructure) - Foundation
3. **Group 2** (Auth Pages) - UI that uses the infrastructure
4. **Group 3** (Integration) - Connects auth to existing UI
5. **Group 5** (Documentation) - Explains everything
6. **Group 6** (Bug Fixes) - Fixes issues found during development
7. **Group 7** (Other Changes) - Review and commit separately if needed

---

## Quick Commit Commands

```bash
# Group 4: Dependencies
git add package.json package-lock.json
git commit -m "chore: add @supabase/ssr package for Next.js auth support"

# Group 1: Core Infrastructure
git add lib/db/client.ts lib/db/server.ts lib/auth/auth.ts lib/auth/server.ts components/AuthProvider.tsx middleware.ts
git commit -m "feat: add Supabase authentication infrastructure"

# Group 2: Auth Pages
git add app/auth/
git commit -m "feat: add authentication pages (login, signup, password reset)"

# Group 3: Integration
git add app/layout.tsx components/AppLayout.tsx components/TopHeader.tsx
git commit -m "feat: integrate authentication into app layout and header"

# Group 5: Documentation
git add AUTH_SETUP.md EMAIL_CONFIRMATION_SETUP.md
git commit -m "docs: add authentication setup and email confirmation guides"

# Group 6: Bug Fixes
git add app/api/chat/route.ts tsconfig.json
git commit -m "fix: add missing chat route handler and update config"

# Group 7: Review first, then commit if needed
# git add app/speak/roleplay/[id]/page.tsx features/speak/roleplay/RoleplaySession.tsx lib/db/schema.ts
# git commit -m "chore: update roleplay components and schema"
```