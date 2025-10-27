# Blog Documents & Key Dates Troubleshooting Guide

## Issue

Documents and Key Dates are not showing on the blog page after saving.

## Changes Made

### 1. Increased Dialog Width ✅

- Changed from `max-w-4xl` to `max-w-6xl`
- Location: `src/app/admin/blog/page.tsx:576`

### 2. Added Debug Logging ✅

- Added console.log when loading post data (line 292)
- Added console.log when saving post data (line 365)

## Testing Checklist

### Step 1: Verify Database Columns Exist

Run this in Supabase SQL Editor:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'blog_posts'
AND column_name IN ('documents', 'key_dates', 'sidebar_summary', 'subtitle');
```

**Expected Result**: Should return 4 rows showing these columns exist as JSONB type.

### Step 2: Create a Test Blog Post

1. Go to `/admin/blog`
2. Click "New Blog Post"
3. Fill in required fields:
   - Title: "Test Blog Post with Documents"
   - Subtitle: "Testing rich content features"
   - Excerpt: "This is a test"
   - Content: "Test content"
4. Add a document:
   - Click "Add Document"
   - Title: "Test Document"
   - Upload a PDF file (or any document)
   - Wait for "Document uploaded successfully" toast
5. Add key dates:
   - Click "Add Date"
   - Label: "Test Date"
   - Date: "Oct 31"
6. Fill sidebar summary:
   - Label: "Test Label"
   - Value: "Test Value"
7. Click "Create Post"

### Step 3: Check Browser Console

Open browser DevTools (F12) → Console tab

**When saving**, you should see:

```
Saving blog post with data: {
  documents: [{title: "Test Document", url: "https://..."}],
  keyDates: [{label: "Test Date", date: "Oct 31"}],
  sidebarItems: [{label: "Test Label", value: "Test Value"}],
  ...
}
```

**If documents array is empty**: The upload didn't work - check storage bucket permissions.

### Step 4: Verify Data in Database

Run in Supabase SQL Editor:

```sql
SELECT id, title, documents, key_dates, sidebar_summary
FROM blog_posts
WHERE title = 'Test Blog Post with Documents';
```

**Expected Result**:

```json
{
  "documents": [{ "title": "Test Document", "url": "https://..." }],
  "key_dates": [{ "label": "Test Date", "date": "Oct 31" }],
  "sidebar_summary": { "items": [{ "label": "Test Label", "value": "Test Value" }] }
}
```

**If NULL or empty arrays**: Data is not being saved. Check API route.

### Step 5: View Blog Post

1. Go to `/blog`
2. Find "Test Blog Post with Documents"
3. Click to view the post

**Expected Results**:

- Subtitle should appear under title
- Sidebar should show on the right (desktop) or below (mobile)
- "Official Documents" card should show with download link
- "Key Dates to Remember" card should show "Test Date: Oct 31"
- "Quick Summary" card should show test label/value

**If sidebar is missing**: Check browser console for errors in the page.

### Step 6: Check Network Tab

In browser DevTools → Network tab:

1. Reload the blog post page
2. Find the API call to `/api/blog/posts/[slug]`
3. Click on it → Response tab

**Expected Response**:

```json
{
  "post": {
    "id": "...",
    "title": "Test Blog Post with Documents",
    "subtitle": "Testing rich content features",
    "documents": [{"title": "Test Document", "url": "https://..."}],
    "key_dates": [{"label": "Test Date", "date": "Oct 31"}],
    "sidebar_summary": {"items": [...]},
    ...
  }
}
```

**If documents/key_dates are missing from response**: API is not returning them.

## Common Issues & Solutions

### Issue 1: Storage Bucket Not Found

**Error**: `StorageApiError: Bucket not found`
**Solution**: Run migration `038_create_blog_documents_storage_bucket.sql`

### Issue 2: RLS Policy Error

**Error**: `new row violates row-level security policy`
**Solution**:

1. Delete old policies in Supabase Storage → blog-documents → Policies
2. Re-run updated migration that creates policies without `TO authenticated`

### Issue 3: Empty Arrays in Database

**Problem**: Documents/key_dates saved as `[]` even after adding items
**Check**:

- Console log shows empty arrays when saving
- You didn't add items before clicking save
  **Solution**: Make sure to click "Add Document" and fill in fields

### Issue 4: Sidebar Not Showing

**Problem**: Blog page doesn't show sidebar
**Check**:

1. Browser console for JavaScript errors
2. Network tab - is API returning the data?
3. React DevTools - check component state
   **Solution**:

- If data is in API response but not showing: Check TypeScript interface matches
- If data is missing from API: Check database has the data

### Issue 5: Documents Upload Fails

**Problem**: Can't upload documents
**Checks**:

1. Is `blog-documents` bucket created?
2. Are policies set correctly (should allow public INSERT)?
3. Are MIME types allowed in bucket settings?
   **Solution**:

```sql
-- Check bucket exists
SELECT * FROM storage.buckets WHERE id = 'blog-documents';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%blog-documents%';
```

## Code Locations Reference

- **Admin Form**: `src/app/admin/blog/page.tsx`
  - Document upload: Lines 184-272
  - Documents UI: Lines 699-779
  - Key Dates UI: Lines 781-820
  - Save handler: Lines 323-398

- **Blog Display**: `src/app/blog/[slug]/page.tsx`
  - Sidebar: Lines 224-293
  - Documents display: Lines 244-270
  - Key Dates display: Lines 272-292

- **API Routes**:
  - Admin API: `src/app/api/admin/blog/route.ts`
  - Public API: `src/app/api/blog/posts/[slug]/route.ts`

- **Database Migrations**:
  - Rich content fields: `037_update_blog_posts_rich_content.sql`
  - Document storage: `038_create_blog_documents_storage_bucket.sql`

## Still Not Working?

1. Share the console logs (both when saving and when loading)
2. Share the database query result
3. Share the Network tab API response
4. Check for any errors in the browser console when viewing the blog post
