# EaseMyPrompt.ai — Production Guide

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

Create a `.env` file at the root with these values:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/easemyprompt
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

EMAIL_SERVER=smtp://user:pass@smtp.gmail.com:587
EMAIL_FROM=noreply@easemyprompt.ai

ANTHROPIC_API_KEY=your_anthropic_api_key
```

---

## 🗄️ Managing Prompts & Categories via MongoDB Compass

All Prompt Bank content is managed directly in MongoDB. No admin panel needed — just use **MongoDB Compass** or the **Atlas web UI**.

### Database: `easemyprompt`
### Collections:
- `categories` — Prompt category tags shown in the filter bar
- `prompts` — The actual prompt cards shown in the Prompt Bank

---

## 📁 Adding a Category

Each category appears as a tab in the Prompt Bank filter bar with an emoji label.

### Single Entry (via Compass)
1. Open Compass → connect to your cluster.
2. Navigate to `easemyprompt` → `categories`.
3. Click **Add Data → Insert Document**.
4. Paste this JSON:

```json
{
  "name": "Copywriting",
  "emoji": "✍️"
}
```

> `name` must be **unique**. `emoji` is displayed next to the tab label.

### Bulk Insert (multiple categories at once)
1. In Compass, click **Add Data → Import JSON or CSV**.
2. Select JSON and paste an **array**:

```json
[
  { "name": "Copywriting", "emoji": "✍️" },
  { "name": "Coding", "emoji": "💻" },
  { "name": "Marketing", "emoji": "📣" },
  { "name": "Design", "emoji": "🎨" },
  { "name": "Writing", "emoji": "📝" },
  { "name": "Image", "emoji": "🖼️" },
  { "name": "Video", "emoji": "🎬" },
  { "name": "Business", "emoji": "💼" }
]
```

3. Click **Import**. Categories appear on the site immediately (no restart needed).

---

## 📄 Adding a Regular Prompt

Regular prompts open a **detail modal** when clicked.

### Required Fields

| Field | Type | Description |
|---|---|---|
| `title` | String | Short name of the prompt |
| `emoji` | String | Single emoji shown on the card |
| `category` | String | **Must match** an existing category `name` exactly |
| `description` | String | Short summary shown on the card |
| `promptText` | String | The full prompt body (shown in modal) |
| `isMega` | Boolean | Set to `false` for regular prompts |

### Optional Fields

| Field | Type | Description |
|---|---|---|
| `sampleOutput` | String | Preview text shown on card and in modal |
| `outputType` | String | `"text"`, `"image"`, or `"video"` |
| `tags` | Array | Searchable tags e.g. `["seo", "blog"]` |
| `trendingScore` | Number | Higher = appears higher in trending |
| `popularScore` | Number | Higher = more popular ranking |

### Single Entry Example

```json
{
  "title": "SEO Blog Outline",
  "emoji": "📝",
  "category": "Writing",
  "description": "Generate a full SEO-optimized blog outline from a single keyword.",
  "promptText": "Act as an expert SEO content strategist. I will give you a keyword and you will produce a complete, detailed blog post outline.\n\nKeyword: [INSERT KEYWORD]\n\nInclude:\n- A compelling H1 title\n- Meta description (under 160 chars)\n- 5 H2 sections with 3 H3 sub-points each\n- Suggested internal link anchor texts\n- A closing CTA section",
  "sampleOutput": "H1: The Ultimate Guide to [Keyword] in 2025...",
  "outputType": "text",
  "isMega": false,
  "tags": ["seo", "blog", "content"],
  "trendingScore": 80,
  "popularScore": 90
}
```

---

## ⚡ Adding a Mega Prompt

Mega Prompts display on a **dedicated full page** (`/prompts/[id]`) with a large formatted layout. Use these for long, comprehensive prompts.

Set `"isMega": true`. Everything else is the same structure as a regular prompt.

### Mega Prompt Example

```json
{
  "title": "Full SaaS Landing Page Copywriting System",
  "emoji": "🚀",
  "category": "Copywriting",
  "description": "A complete system for writing an entire high-converting SaaS landing page from scratch.",
  "promptText": "Act as a world-class SaaS copywriter with 10+ years of experience.\n\nYour goal: Write a complete, high-converting landing page for a B2B SaaS product.\n\n### CONTEXT (fill this in):\n- Product Name: [NAME]\n- Core Value Proposition: [WHAT IT DOES IN ONE SENTENCE]\n- Target Audience: [WHO USES IT]\n- Primary Pain Point: [THE PROBLEM IT SOLVES]\n- Top 3 Features: [LIST THEM]\n- Pricing Model: [FREE TRIAL / MONTHLY / ONE-TIME]\n\n### SECTIONS TO WRITE:\n1. Hero: Hook + H1 (under 8 words) + H2 (under 20 words) + CTA\n2. Social Proof Bar: 3 logo placeholders + one stat\n3. Features: 3 benefit-driven feature blocks\n4. Pain Agitation: Speak directly to the pain\n5. How it Works: 3 numbered steps\n6. Testimonials: 3 realistic testimonials\n7. Pricing: 2 tier comparison\n8. Final CTA: High-urgency close\n\n### FORMAT:\n- Use markdown headers\n- Use authoritative, clear, benefit-first language\n- Avoid jargon\n- CTA text should be action verbs",
  "sampleOutput": "## Hero\n**H1:** Pitch Less. Close More.\n**H2:** The AI that writes your entire sales page before your morning coffee.\n**CTA:** Start Free — No Credit Card",
  "outputType": "text",
  "isMega": true,
  "tags": ["saas", "landing page", "copywriting", "conversion"],
  "trendingScore": 95,
  "popularScore": 95
}
```

---

## 🖼️ Adding Image or Video Sample Outputs

If you want a Prompt Card to display an image or play a video instead of showing text, you must use a **direct public URL** for the media file.

1. **Host the Media**: Upload your image or video to a free public host like Imgur, Cloudinary, AWS S3, or your own server. You must get a direct link (e.g., ending in `.jpg`, `.png`, or `.mp4`).
2. **Set `outputType`**: Change the `outputType` field to exactly `"image"` or `"video"`.
3. **Set `sampleOutput`**: Paste the direct URL of the media into the `sampleOutput` field.

### Image Output Example

```json
{
  "title": "Hyper-realistic Portrait",
  "emoji": "📸",
  "category": "Image Generation",
  "description": "Midjourney prompt for a hyper-realistic cinematic portrait.",
  "promptText": "A hyper-realistic cinematic portrait of a cyberpunk hacker in a neon-lit alleyway, 8k resolution, shot on 35mm lens --ar 16:9",
  "sampleOutput": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
  "outputType": "image",
  "isMega": false,
  "tags": ["midjourney", "portrait", "cyberpunk"]
}
```

### Video Output Example

```json
{
  "title": "Fluid Motion Animation",
  "emoji": "🎬",
  "category": "Video",
  "description": "Sora AI prompt for fluid water simulation.",
  "promptText": "A highly detailed, fluid 3D animation of water wrapping around a glowing orb in slow motion, photorealistic.",
  "sampleOutput": "https://www.w3schools.com/html/mov_bbb.mp4",
  "outputType": "video",
  "isMega": false,
  "tags": ["sora", "animation", "water"]
}
```

---

## 📦 Bulk Import Prompts

1. Prepare a JSON **array** of prompt objects (see examples above).
2. In Compass: `prompts` collection → **Add Data → Import JSON or CSV**.
3. Select your `.json` file or paste the array.
4. Click **Import**.

The Prompt Bank page auto-refreshes data on every visit — no server restart needed.

---

## 🔁 Editing & Deleting Prompts

- **Edit**: In Compass, find the document, click the pencil icon, and modify any field.
- **Delete**: Click the trash icon next to the document.

Changes reflect on the site immediately. Category tab filters dynamically update based on what's in the `categories` collection.

---

## 🛠️ Tech Stack

- **Next.js 14** (App Router)
- **MongoDB Atlas** via Mongoose
- **NextAuth.js** — Google OAuth, Magic Link, and Credentials auth
- **Anthropic SDK** — Claude AI streaming
- **Tailwind CSS**

---

## 🔐 Auth Flow

| Method | How it works |
|---|---|
| **Email + Password** | User signs up (password hashed with bcrypt), logs in via Credentials provider |
| **Magic Link** | Sends a one-click login link to email via SMTP |
| **Google** | Standard OAuth via Google Cloud Console |

> After signup via email, a verification magic link is automatically sent. Clicking it confirms the account and redirects to `/dashboard`.
