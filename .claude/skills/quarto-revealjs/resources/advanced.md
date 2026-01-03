# Advanced Features

## Parallax Background

```yaml
format:
  revealjs:
    parallax-background-image: "bg.jpg"
    parallax-background-size: "3000px 2000px"
    parallax-background-horizontal: 200
    parallax-background-vertical: 50
```

## Vertical Slides

```markdown
# Section {.stack}

## Vertical 1

## Vertical 2
```

Navigation modes: `linear`, `vertical`, `grid`

## Custom Title Slide

Create `title-slide.html`:
```html
<section id="title-slide">
  <h1 class="title">$title$</h1>
  $if(author)$<p class="author">$author$</p>$endif$
  <div class="custom-logo"></div>
</section>
```

```yaml
format:
  revealjs:
    template-partials:
      - title-slide.html
    center-title-slide: true
```

## Slide Visibility

```markdown
## Hidden {visibility="hidden"}
Completely hidden from navigation.

## Appendix {visibility="uncounted"}
Shown but not counted in slide numbers.
```

## Content Includes

```markdown
{{< include path/_content.qmd >}}
{{< embed other.qmd#chunk-id >}}
{{< video https://youtube.com/... >}}
```

## Raw HTML

````markdown
```{=html}
<div class="custom">HTML</div>
```
````

```yaml
format:
  revealjs:
    include-in-header: includes/head.html
    include-after-body: includes/after.html
```

## Reveal.js Events

```html
<!-- includes/after.html -->
<script>
  Reveal.on('ready', () => { /* init */ });
  Reveal.on('slidechanged', e => { /* e.currentSlide */ });
</script>
```
