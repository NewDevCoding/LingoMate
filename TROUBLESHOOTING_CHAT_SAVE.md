# Troubleshooting: Chats Not Being Saved

## Quick Checks

### 1. Did you run the database migration?
- Go to Supabase → Table Editor
- Check if `roleplay_sessions` and `roleplay_messages` tables exist
- If they don't exist, run the SQL migration first

### 2. Check Browser Console
- Open DevTools (F12)
- Go to Console tab
- Look for red error messages
- Common errors:
  - "Failed to create session"
  - "Failed to save message"
  - "Supabase not configured"

### 3. Check Server Logs
- Look at your terminal where `npm run dev` is running
- Look for error messages when you send a message
- Common errors:
  - Database connection errors
  - Table doesn't exist
  - RLS policy blocking access

### 4. Restart Dev Server
- Stop the server (Ctrl+C)
- Run `npm run dev` again
- Next.js API routes sometimes need a restart after code changes

### 5. Check Environment Variables
Make sure `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

### 6. Verify Database Tables Exist
In Supabase SQL Editor, run:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('roleplay_sessions', 'roleplay_messages');
```

Should return 2 rows. If not, run the migration.

### 7. Test Database Connection
In Supabase SQL Editor, try:
```sql
INSERT INTO roleplay_sessions (user_id, scenario_id, language)
VALUES ('test', 'test-scenario', 'es')
RETURNING id;
```

If this fails, the tables might not be set up correctly.

### 8. Check RLS Policies
If RLS is blocking, temporarily disable it:
```sql
ALTER TABLE roleplay_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE roleplay_messages DISABLE ROW LEVEL SECURITY;
```

(Re-enable after testing)

## Common Issues

### Issue: "Table does not exist"
**Solution**: Run the SQL migration in Supabase SQL Editor

### Issue: "Permission denied" or RLS blocking
**Solution**: 
- Check RLS policies allow anonymous access
- Or temporarily disable RLS for testing

### Issue: Session ID not being set
**Solution**: Check browser console for errors when creating session

### Issue: Messages not saving after session created
**Solution**: 
- Check if `sessionId` state is updated
- Check browser network tab to see if API calls are being made
- Verify the API route is receiving the requests

## Debug Steps

1. **Check Network Tab**:
   - Open DevTools → Network tab
   - Send a message
   - Look for:
     - `POST /api/roleplay/sessions` (should create session)
     - `POST /api/roleplay/sessions/{id}/messages` (should save messages)
   - Check if requests are successful (200 status) or failing (400/500)

2. **Check Session ID in URL**:
   - After sending first message, check if URL has `?sessionId=xxx`
   - If not, session creation might be failing

3. **Check Supabase Tables**:
   - Go to Supabase → Table Editor
   - Check `roleplay_sessions` table - should see new rows
   - Check `roleplay_messages` table - should see messages

4. **Add Console Logs**:
   Add to `RoleplaySession.tsx`:
   ```typescript
   console.log('Session ID:', sessionId);
   console.log('Saving messages:', messagesToSave);
   ```

## Still Not Working?

1. Share the error message from browser console
2. Share the error from server terminal
3. Verify tables exist in Supabase
4. Check if API routes are being called (Network tab)
