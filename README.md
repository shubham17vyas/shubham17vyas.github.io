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
2. Experience: show professional delivery and engineering impact.
3. Projects: show initiative, with development status clearly labeled.
4. Skills: let technical reviewers assess relevant capabilities quickly.
5. About: add the person and context behind the work.
6. Education: show the academic foundation, with expandable details.
7. Certifications: surface six relevant courses; preserve all 20 in the expanded list.
8. Life: add personality through a continuous strip of personal photographs.
9. Contact: provide a clear next step for hiring and collaboration.

Earlier roles and technical details use native disclosures. They remain in the HTML
and work without JavaScript. The Life strip is manually scrollable without JavaScript;
automatic motion pauses offscreen, in a background tab, on hover or keyboard focus,
and after manual pointer/wheel interaction. Reduced-motion users start with motion off.

## SEO implementation

- Name and role in the page title, visible heading, description, and social metadata.
- One canonical homepage, with matching sitemap and crawlable assets.
- JSON-LD `WebSite`, `ProfilePage`, and `Person` entities linked to the public GitHub
  and LinkedIn profiles; education and employer match the visible content.
- Open Graph and Twitter summary cards use the existing 333 × 333 portrait.
- Semantic headings, descriptive image alternatives, explicit image dimensions,
  lazy loading below the fold, and no blocking framework or hero video.
- Legacy HTML routes redirect to the current portfolio; a custom 404 helps visitors recover.

## After publishing

1. Confirm the homepage, `/robots.txt`, `/sitemap.xml`, `/images/formalpic.jpg`,
   `/images/favicon.svg`, and both JavaScript files return successful responses.
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
