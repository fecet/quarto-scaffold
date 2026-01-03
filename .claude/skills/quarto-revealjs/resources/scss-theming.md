# SCSS Theming

## Required Sections

```scss
/*-- scss:defaults --*/
$body-bg: #0f172a;
$body-color: #e5e7eb;
$link-color: #60a5fa;
$presentation-font-size-root: 40px;
$presentation-heading-color: lighten($body-color, 15%);
$font-family-sans-serif: 'Inter', system-ui, sans-serif;
$font-family-monospace: ui-monospace, SFMono-Regular, monospace;

/*-- scss:rules --*/
.reveal .slide blockquote {
  border-left: 3px solid lighten($body-color, 50%);
  padding-left: .6em;
}
```

## Color Map Pattern

```scss
/*-- scss:defaults --*/
$colors: (
  "brand": #394D85,
  "accent": #FA5F5C,
  "bg": #FFF7C7,
  "ink": #13234B
);

@function theme($k) { @return map-get($colors, $k); }

body {
  background: theme("bg");
  color: theme("ink");
}

@each $name, $c in $colors {
  .text-#{$name} { color: $c; }
  .bg-#{$name} { background-color: $c; }
}
```

## Background Image Mixin

```scss
/*-- scss:rules --*/
@mixin bg-full() {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.theme-a:is(.slide-background) {
  background-image: url('../../../../../assets/images/bg.svg');
  @include bg-full();
}
```

**Path note:** CSS compiles to `_output/index_files/libs/revealjs/dist/theme/` — use 5-level relative paths.

## Override Specificity

Use `.reveal .slide` prefix to beat built-in styles:

```scss
.reveal .slide h2 { letter-spacing: .5px; }
```
