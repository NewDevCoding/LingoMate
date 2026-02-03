# How to Initialize Reviews for Existing Vocabulary

## Option 1: Browser Console (Easiest)

1. Start your Next.js dev server: `npm run dev`
2. Open your app in the browser (usually `http://localhost:3000`)
3. Open browser DevTools (F12)
4. Go to Console tab
5. Run this code:

```javascript
fetch('/api/vocabulary/reviews/initialize', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
})
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
    alert(`Initialized ${data.count} review entries!`);
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Failed to initialize reviews');
  });
```

---

## Option 2: curl Command

If you have curl installed, run this in your terminal:

```bash
curl -X POST http://localhost:3000/api/vocabulary/reviews/initialize \
  -H "Content-Type: application/json"
```

Or if you're using a different port, adjust the URL accordingly.

---

## Option 3: Create a Utility Page (Recommended for Testing)

I can create a simple admin page that you can visit to initialize reviews. This would be at `/admin/initialize-reviews` or similar.

---

## Option 4: Postman / Insomnia

1. Create a new POST request
2. URL: `http://localhost:3000/api/vocabulary/reviews/initialize`
3. Headers: `Content-Type: application/json`
4. Send the request

---

## Expected Response

On success, you'll get:
```json
{
  "message": "Initialized X review entries",
  "count": X
}
```

On error:
```json
{
  "error": "Failed to initialize reviews"
}
```

---

## Important Notes

- Make sure your database migration has been run first (the `vocabulary_reviews` table must exist)
- The endpoint will only create reviews for vocabulary that doesn't already have a review entry
- It's safe to run multiple times - it won't create duplicates
- The count returned is the number of new review entries created
