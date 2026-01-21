# Supabase Environment Setup

## Quick Setup

1. **Create `.env.local` file** in the root directory with the following content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

2. **Get your Supabase credentials:**
   - Go to your Supabase project dashboard
   - Navigate to **Settings** → **API**
   - Copy the following:
     - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
     - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (optional, for server-side operations)

3. **Replace the placeholder values** in `.env.local` with your actual credentials

## Environment Variables

### `NEXT_PUBLIC_SUPABASE_URL`
- Your Supabase project URL
- Format: `https://xxxxx.supabase.co`
- Safe to expose in client-side code (NEXT_PUBLIC_ prefix)

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Your Supabase anonymous/public key
- Used for client-side database operations
- Safe to expose in client-side code
- Respects Row Level Security (RLS) policies

### `SUPABASE_SERVICE_ROLE_KEY` (Optional)
- Your Supabase service role key
- ⚠️ **NEVER expose this in client-side code**
- Has admin privileges and bypasses RLS
- Only use in API routes or server-side code
- Keep this secret!

## Security Notes

- `.env.local` is already in `.gitignore` - your secrets are safe
- Never commit `.env.local` to version control
- Use `NEXT_PUBLIC_` prefix only for variables needed in the browser
- The service role key should never have `NEXT_PUBLIC_` prefix

## Next Steps

After setting up your environment variables:
1. Install Supabase client library: `npm install @supabase/supabase-js`
2. Create a Supabase client utility in `lib/db/client.ts`
3. Start using Supabase in your components and API routes
