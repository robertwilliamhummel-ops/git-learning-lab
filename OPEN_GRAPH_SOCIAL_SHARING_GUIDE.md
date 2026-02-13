# Open Graph & Social Media Sharing Setup Guide

## What We Just Did (Feb 13, 2026)

Added **Open Graph meta tags** to all 8 pages so your website looks professional when shared on social media.

## What Are Open Graph Tags?

Special code in your website's `<head>` section that tells Facebook, LinkedIn, Twitter, and WhatsApp how to display your link when someone shares it.

**Without OG tags:** Just shows URL text (ugly, no clicks)  
**With OG tags:** Shows image, title, description (professional, gets clicks)

---

## Pages Updated (All 8)

✅ index.html  
✅ website-design.html  
✅ seo-services.html  
✅ computer-repair.html  
✅ about.html  
✅ contact.html  
✅ remote-support.html  
✅ booking.html  

---

## What Tags Were Added

```html
<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://techflowsolutions.ca/page.html">
<meta property="og:title" content="Your Page Title">
<meta property="og:description" content="Your page description">
<meta property="og:image" content="https://techflowsolutions.ca/assets/images/og-image.jpg">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://techflowsolutions.ca/page.html">
<meta property="twitter:title" content="Your Page Title">
<meta property="twitter:description" content="Your description">
<meta property="twitter:image" content="https://techflowsolutions.ca/assets/images/og-image.jpg">
```

---

## ⚠️ IMPORTANT: You Need To Create The Image

**File needed:** `assets/images/og-image.jpg`

### Image Specs:
- **Size:** 1200 x 630 pixels (standard for all platforms)
- **Format:** JPG or PNG
- **File size:** Under 1MB (smaller = faster loading)

### What To Put On The Image:
```
TechFlow Solutions
Website Design • SEO Services • Computer Repair
Serving Toronto & GTA
```

Add your purple gradient background (#667eea to #764ba2) to match your site.

---

## How To Create The OG Image (3 Easy Ways)

### Option 1: AI Image Generator (RECOMMENDED - Shows Off Your Design Skills!)

**Use Gemini 2.5 Flash or Similar AI Tool**

Copy this prompt to create a futuristic, professional OG image:

```
Create a futuristic social media banner (1200x630px) for "TechFlow Solutions" - a premium tech company.

Design elements:
- Dark navy/black background with subtle circuit board patterns
- Vibrant purple-to-blue gradient overlay (#667eea to #764ba2 to #4A90E2)
- Glassmorphism effect with frosted glass panels
- Holographic text with subtle glow effects
- Modern geometric shapes (hexagons, triangles) floating in background
- Neon accents and light particles
- 3D depth with layered elements

Text layout:
- Main: "TECHFLOW SOLUTIONS" in bold futuristic font (large, top third)
- Subtext: "Website Design • SEO Services • Computer Repair" (medium, center)
- Location: "Serving Toronto & GTA" (small, bottom)

Style: Ultra-modern, sleek, tech-forward, professional but eye-catching
Inspiration: Apple product launches, Tesla UI, cyberpunk aesthetics
Colors: Purple gradient (#667eea to #764ba2), electric blue accents, white text
Mood: Innovation, trust, cutting-edge technology
```

**Alternative Shorter Prompt:**
```
Create a 1200x630px futuristic tech banner for "TechFlow Solutions" with purple-blue gradient (#667eea to #764ba2), glassmorphism effects, holographic text, geometric shapes, circuit patterns, and neon accents. Text: "TECHFLOW SOLUTIONS" (large), "Website Design • SEO Services • Computer Repair" (medium), "Serving Toronto & GTA" (small). Style: Modern, sleek, professional, cyberpunk-inspired.
```

**Where to generate:**
- Gemini 2.5 Flash (Google AI Studio)
- Midjourney
- DALL-E 3
- Leonardo.ai
- Ideogram.ai

After generating, save as: `assets/images/og-image.jpg`

---

### Option 2: Canva (Quick - 5 minutes)
1. Go to canva.com
2. Search for "Facebook Post" template (auto-sizes to 1200x630)
3. Add text: "TechFlow Solutions"
4. Add your tagline
5. Use purple gradient background
6. Add geometric shapes and effects
7. Download as JPG
8. Save to: `assets/images/og-image.jpg`

---

### Option 3: Photoshop/Figma (Full Control)
1. Create new file: 1200x630px
2. Add dark background with circuit patterns
3. Apply purple-blue gradient overlay
4. Add glassmorphism panels
5. Design text with glow effects
6. Add geometric accents
7. Export as JPG (quality 90%)
8. Save to: `assets/images/og-image.jpg`

---

## After Creating The Image

### Upload It:
```bash
# Add the file
git add assets/images/og-image.jpg

# Commit
git commit -m "Add Open Graph social sharing image"

# Push live
git push
```

### Test It Works:

**Facebook Sharing Debugger:**  
https://developers.facebook.com/tools/debug/  
→ Paste: https://techflowsolutions.ca/  
→ Click "Scrape Again"  
→ You should see your image!

**Twitter Card Validator:**  
https://cards-dev.twitter.com/validator  
→ Paste your URL  
→ Preview your card

**LinkedIn Post Inspector:**  
https://www.linkedin.com/post-inspector/  
→ Paste your URL  
→ See the preview

---

## Benefits

### Before OG Tags:
```
Someone shares on Facebook:
https://techflowsolutions.ca/
(Just boring text link, no one clicks)
```

### After OG Tags:
```
Someone shares on Facebook:
┌─────────────────────────────┐
│  [Your Beautiful Image]     │
├─────────────────────────────┤
│ TechFlow Solutions          │
│ Website Design, SEO & PC    │
│ Repair in Toronto           │
└─────────────────────────────┘
(Professional card, 10x more clicks!)
```

---

## Where It Works

✅ **Facebook** - Rich preview cards  
✅ **LinkedIn** - Professional business sharing  
✅ **Twitter** - Large image cards  
✅ **WhatsApp** - Link previews with thumbnails  
✅ **Slack** - Expanded previews  
✅ **iMessage** - Link previews  
✅ **Discord** - Embedded cards  

---

## Quick Reference

**File location:** `assets/images/og-image.jpg`  
**Image size:** 1200 x 630 pixels  
**All pages:** Already have the tags (done Feb 13, 2026)  
**What you need:** Just create and upload the image  

**Git commit:** b195643 - "Add Open Graph and Twitter Card meta tags to all pages for social media sharing"

---

## Troubleshooting

**Q: I uploaded the image but Facebook still shows old preview?**  
A: Facebook caches for 24 hours. Force refresh at: https://developers.facebook.com/tools/debug/

**Q: Image doesn't show?**  
A: Check the file is exactly at: `assets/images/og-image.jpg` (lowercase, no spaces)

**Q: Can I use PNG instead of JPG?**  
A: Yes! Just name it `og-image.jpg` or update all meta tags to say `.png`

---

## Summary

✅ All 8 pages have Open Graph tags  
✅ Tags are pushed live  
⏳ You need to create: `assets/images/og-image.jpg` (1200x630px)  
⏳ Upload it and push to GitHub  
✅ Then test with Facebook/Twitter validators  

**That's it! Your site will look professional when shared on social media.** 🎉