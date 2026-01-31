# Quick Setup Checklist for Vocabulary Feature

## ✅ What's Already Implemented

- ✅ Vocabulary service (`features/vocabulary/vocabulary.service.ts`) - retrieves from Supabase
- ✅ Vocabulary page (`app/vocabulary/page.tsx`) - displays vocabulary from Supabase
- ✅ Supabase client configuration (`lib/db/client.ts`)
- ✅ Type definitions (`types/word.ts`)

## 📋 What You Need to Do

### 1. Environment Variables
- [ ] Create `.env.local` file in the root directory
- [ ] Add your Supabase URL: `NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co`
- [ ] Add your Supabase anon key: `NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here`
- [ ] Restart your development server after adding env variables

### 2. Database Setup
- [ ] Go to your Supabase project dashboard
- [ ] Navigate to **SQL Editor**
- [ ] Run `supabase/migrations/001_create_vocabulary_table.sql`
- [ ] Run `supabase/migrations/002_rls_policies_anonymous.sql`
- [ ] Verify the `vocabulary` table exists in **Table Editor**

### 3. Test the Integration
- [ ] Start your dev server: `npm run dev`
- [ ] Navigate to `/vocabulary` page
- [ ] Check browser console for any errors
- [ ] Try adding a word from the reader page
- [ ] Verify it appears on the vocabulary page

## 🔍 Troubleshooting

### If vocabulary page shows "No vocabulary items found"
- Check browser console for errors
- Verify Supabase credentials in `.env.local`
- Check that the database table exists
- Verify RLS policies are set up correctly

### If you see "Missing Supabase environment variables"
- Make sure `.env.local` exists in the root directory
- Verify the variable names are exactly: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart your dev server after adding env variables

### If vocabulary doesn't save
- Check browser console for errors
- Verify RLS policies allow INSERT operations
- Check that `user_id` is being generated (check localStorage for `lingomate_temp_user_id`)

## 📁 Files Created

- `supabase/migrations/001_create_vocabulary_table.sql` - Creates the vocabulary table
- `supabase/migrations/002_rls_policies_anonymous.sql` - Sets up security policies
- `DATABASE_SETUP.md` - Detailed setup guide
- `QUICK_SETUP_CHECKLIST.md` - This file

## 🎯 Next Steps After Setup

Once everything is working:
1. Test adding vocabulary from the reader
2. Test updating comprehension levels
3. Test deleting vocabulary
4. Consider implementing Supabase Authentication for better user management
