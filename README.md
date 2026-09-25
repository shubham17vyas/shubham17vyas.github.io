# Shubham Vyas — portfolio

A static, responsive portfolio built with HTML, CSS, and vanilla JavaScript.
Public URL: https://shubham17vyas.github.io/

## Local preview

From this repository, run:

```bash
python -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765/ and stop the server with Ctrl+C. No build or package installation is required.

## Content order

1. Introduction and measured outcomes: establish identity and credibility immediately.
2. Experience: show delivery and engineering impact, with expandable case studies.
3. Peer recommendations: support the experience with attributed LinkedIn excerpts.
4. Projects: show initiative, with development goals clearly separated from shipped features; link to this portfolio as a working public code sample.
5. Skills: let technical reviewers assess relevant capabilities quickly.
6. About: add the person and context behind the work.
7. Education: show the academic foundation, with expandable details.
8. Certifications: surface six relevant courses; preserve all 20 in the expanded list.
9. Life: add personality through 14 photos with clickable dot indicators.
10. Motivation: four favorite quotes from the original portfolio, with rotation and dot navigation.
11. Contact: provide a clear next step for hiring and collaboration.

Earlier roles and technical details use native disclosures. They remain in the HTML
and work without JavaScript. The Life strip is manually scrollable without JavaScript;
automatic motion pauses offscreen, in a background tab, on hover or keyboard focus,
and after manual pointer/wheel interaction. Reduced-motion users start with motion off.
Dot controls support Left/Right arrows, Home, and End. Selecting a photo or quote
pauses its automatic movement. Photo dots replace the scrollbar once JavaScript is ready;
without JavaScript the native scrollbar remains available. Quotes rotate every eight
seconds only when visible, with horizontal slide transitions and previous/next,
dot, and pause/play controls beneath the quotes. Reduced-motion preferences disable
slide animation and start automatic rotation paused.

The original quote wording is retained with minor punctuation corrections. Theme
labels replace uncertain author credits and the old “Source Title: Google” text.
In particular, the [Einstein attribution for the creativity quote is unsupported](https://quoteinvestigator.com/2017/05/16/contagious/).

## SEO implementation

- Name and role in the page title, visible heading, description, and social metadata.
- One canonical homepage, with matching sitemap and crawlable assets.
- JSON-LD `WebSite`, `ProfilePage`, and `Person` entities linked to the public GitHub
  and LinkedIn profiles; education and employer match the visible content.
- Open Graph and Twitter summary cards use the existing 333 × 333 portrait.
- Semantic headings, descriptive image alternatives, explicit image dimensions,
  lazy loading below the fold, and no blocking framework or hero video.
- Legacy HTML routes redirect to the current portfolio; a custom 404 helps visitors recover.

## Performance and maintenance

- Responsive WebP photos provide up to two widths per original, never upscaled.
  The largest derivative set totals 779,970 bytes versus 1,472,791 bytes for the
  originals (47% smaller). This compares image files, not measured page-load time.
  Smaller screens can select smaller files. Original JPEGs remain available as source assets.
- The two Latin variable fonts are served locally (59,220 bytes combined), with
  `font-display: swap` and a preload for the heading font. There are no external font
  requests. Font files originate from Google Fonts; the SIL Open Font Licenses are
  included in `fonts/`.
- A selectable-text, one-page PDF resume replaces the Word download in the main CTAs.
  Its builder uses the supplied career background; it does not extract private contact
  information from older documents. Update the builder alongside the homepage.
- Print styles suppress the moving galleries and decorative artwork.
- No analytics or tracking scripts are loaded. Collection requires an actual configured
  destination; this change does not invent an analytics account or send visitor data elsewhere.

Run checks without additional packages:

```bash
python scripts/check_site.py
node --check js/main.js
node --check js/carousel-pagination.js
node --check js/life-gallery.js
node --check js/motivation.js
git diff --check
```

To regenerate image derivatives or the PDF, install the development-only dependencies:

```bash
python -m pip install -r scripts/requirements.txt
python scripts/optimize_images.py
python scripts/build_resume.py
python scripts/check_site.py
```

Pillow handles image resizing/encoding; ReportLab creates the PDF with selectable text.
Neither library runs in the website. Add new photos as original JPEGs and HTML entries
before rerunning the image task; it also refreshes existing derivatives in place.

## Content evidence

- Career outcomes and project direction come from the owner's supplied background.
  The performance percentages are approximate, owner-reported outcomes, not public benchmarks.
  Private project code and unverified demos are not exposed or claimed.
- Jason LeMauk's September 11, 2023 and Arun Upadhyay's February 8, 2023 recommendations
  were read in the [received LinkedIn recommendations](https://www.linkedin.com/in/shubham-vyas-0812a6133/details/recommendations/)
  on September 25, 2026. Short excerpts preserve their words; the ellipsis marks a shortened
  sentence. The explanatory text is a paraphrase. Author links and working relationships
  are shown without implying that either person directly managed Shubham.
- Responsive image implementation follows [MDN's image guidance](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images).

## After publishing

1. Confirm the homepage, `/robots.txt`, `/sitemap.xml`, `/images/formalpic.jpg`,
   `/images/favicon.svg`, and all four JavaScript files return successful responses.
2. Verify the URL-prefix property `https://shubham17vyas.github.io/` in
   [Google Search Console](https://search.google.com/search-console). Use the verification
   file or meta tag Google supplies to the site owner; no verification token is fabricated here.
3. Submit `https://shubham17vyas.github.io/sitemap.xml`, inspect the homepage URL,
   and request indexing. These account actions have not been performed by local code changes.
4. Check the deployed URL with [Rich Results Test](https://search.google.com/test/rich-results)
   and [PageSpeed Insights](https://pagespeed.web.dev/). A local JSON parse is not a Google
   rich-result validation or a measured Core Web Vitals result.
5. Link this homepage from the public LinkedIn and GitHub profiles to reinforce the same identity.
6. Monitor Search Console for searches containing “Shubham Vyas,” indexing issues, and mobile performance.

Keep employment, project status, and metadata accurate. Update sitemap `lastmod` only
when homepage content changes. If the domain changes, update the canonical, sitemap,
robots sitemap URL, JSON-LD IDs, and social image/page URLs together.

Search visibility also depends on indexing, competing results, and external signals.
No metadata or structured data guarantees a first-place ranking or a rich result.

References: [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide),
[ProfilePage structured data](https://developers.google.com/search/docs/appearance/structured-data/profile-page),
[canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).
