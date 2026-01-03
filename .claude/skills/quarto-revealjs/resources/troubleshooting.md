# Troubleshooting

## Background Image Path in SCSS

**Problem:** Image not found in compiled CSS.

**Solution:** Use 5-level relative path:
```scss
background-image: url("../../../../../assets/images/bg.jpg");
```

CSS compiles to `_output/index_files/libs/revealjs/dist/theme/`

## Auto-Stretch vs Scrollable

**Problem:** Images don't auto-stretch on scrollable slides.

**Solutions:**
1. Global: `auto-stretch: false` + manual `.r-stretch`
2. Per-slide: Add `.nostretch` class

## Self-Contained Limitations

**Problem:** Zoom/speaker notes broken with `embed-resources: true`.

**Solution:** Keep external links or disable self-contained.

## Title Slide Background

**Problem:** `background-image` ignored for title slide.

**Solution:** Use `title-slide-attributes:` with `data-` prefix.

## SCSS Override Not Applied

**Solutions:**
1. Check theme order: `[default, custom.scss]`
2. Use `.reveal .slide` prefix
3. Verify section comments exist

## Accessibility

- Background images need visible text descriptions
- Font Awesome: use `title="..."` attribute
- Color contrast ratio ≥ 4.5:1
