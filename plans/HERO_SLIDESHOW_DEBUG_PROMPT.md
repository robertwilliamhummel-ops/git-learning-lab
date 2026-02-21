# Hero Slideshow Debug - Architect Mode Prompt

## Problem Statement
The About page hero slideshow has a "dropping down" effect where images appear to move vertically down the page during transitions, instead of smoothly fading in place like the working Home page.

## Working Reference
- **Home page (index.html)** - Slideshow works perfectly with smooth transitions
- **IT Services page** - Also works correctly

## Broken Pages
- **About page (about.html)** - Images "drop down" during transitions
- **Contact page** - Likely same issue
- **Remote Support page** - Likely same issue

## Current Architecture

### Home Page (WORKING)
```html
<section class="hero">
    <div class="hero-background">
        <div class="hero-image active" style="background: linear-gradient(...), url('assets/images/heroes/hero-home-1.png') ..."></div>
        <div class="hero-image" style="background: linear-gradient(...), url('assets/images/heroes/hero-home-2.png') ..."></div>
        <!-- More images with inline styles -->
    </div>
</section>
```

### About Page (BROKEN)
```html
<section class="hero-about">
    <div class="hero-background">
        <div class="hero-image active"></div>
        <div class="hero-image"></div>
        <div class="hero-image"></div>
    </div>
</section>
```

### CSS (hero.css)
```css
.hero-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    overflow: hidden;
}

.hero-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 2s ease-in-out;
    background-size: cover;
    background-position: center;
    z-index: 1;
}

.hero-image.active {
    opacity: 1;
    z-index: 2;
}

.hero-about .hero-image:nth-child(1) {
    background: linear-gradient(...), url('../assets/images/heroes/hero-about-1.png') ...;
}
/* Similar for :nth-child(2) and :nth-child(3) */
```

### JavaScript (about.html)
```javascript
document.addEventListener('DOMContentLoaded', () => {
    const heroImages = document.querySelectorAll('.hero-about .hero-image');
    let currentImage = 0;

    function rotateHeroImages() {
        heroImages[currentImage].classList.remove('active');
        currentImage = (currentImage + 1) % heroImages.length;
        heroImages[currentImage].classList.add('active');
    }

    setInterval(rotateHeroImages, 5000);
});
```

## Fixes Attempted (All Failed)
1. ✗ Added z-index stacking to prevent layering issues
2. ✗ Removed inline style conflicts
3. ✗ Added `overflow: hidden` to `.hero-background`
4. ✗ Changed container width from 1400px to 1200px
5. ✗ Tried both inline styles and CSS `:nth-child()` selectors
6. ✗ Removed `data-image` attributes

## Task for Architect Mode

**Systematically analyze and create a comprehensive fix plan:**

1. **Compare Complete Structure**
   - Read and compare the ENTIRE hero section of index.html (working) vs about.html (broken)
   - Document EVERY difference in HTML structure, CSS classes, and JavaScript implementation
   - Check for any parent containers or wrappers that might differ

2. **Analyze CSS Cascade**
   - Check if there are any conflicting CSS rules in about.html's `<style>` block
   - Verify CSS specificity isn't causing unexpected behavior
   - Check for any CSS animations or transforms that might affect positioning

3. **Investigate JavaScript Behavior**
   - Verify the JavaScript selector is correctly targeting only About page images
   - Check if there's any JavaScript in main.js that might interfere
   - Analyze the timing and sequence of class additions/removals

4. **Test Hypothesis: Document Flow**
   - The "dropping down" suggests images might be in document flow instead of positioned
   - Check if `.hero-background` or `.hero-about` has any positioning issues
   - Verify parent containers have correct `position: relative`

5. **Create Systematic Fix Plan**
   - Document the root cause
   - Provide step-by-step fix with exact line numbers
   - Include fallback options if primary fix fails
   - Explain why Home page works but About page doesn't

## Expected Deliverable
A detailed architectural analysis document with:
- Root cause identification
- Complete fix implementation plan
- Code changes with exact file paths and line numbers
- Testing strategy to verify the fix
- Prevention strategy to avoid similar issues on Contact and Remote Support pages

## Key Question to Answer
**Why does the exact same CSS positioning work on Home page but fail on About page?**