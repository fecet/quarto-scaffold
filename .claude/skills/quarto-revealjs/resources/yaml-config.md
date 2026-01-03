# YAML Configuration

## Minimal Template

```yaml
---
title: "Project Title"
author: "Team / Organization"
date: today
format:
  revealjs:
    theme: [default, styles/custom.scss]
    slide-number: "c/t"
    transition: fade
    progress: true
    controls: auto
    hash: true
    code-line-numbers: true
    code-overflow: wrap
execute:
  echo: false
---
```

## Title Slide Background

```yaml
title-slide-attributes:
  data-background-image: "assets/images/hero.jpg"
  data-background-size: cover
  data-background-opacity: "0.5"
```

## Presentation Size

```yaml
format:
  revealjs:
    width: 1920
    height: 1080
    margin: 0.1          # 0.0 - 0.5
    min-scale: 0.2
    max-scale: 2.0
```

Common ratios: `1920×1080` (16:9), `1024×768` (4:3)

## Navigation Control

```yaml
format:
  revealjs:
    touch: false              # disable swipe
    keyboard: true
    mouse-wheel: false
    hide-inactive-cursor: true
    hide-cursor-time: 5000
    navigation-mode: linear   # linear | vertical | grid
    controls-layout: bottom-right
```

## Scroll View (Reveal.js v5)

```yaml
format:
  revealjs:
    scroll-view: true
    scrollable: true
```

| Key | Action |
|-----|--------|
| `R` | Toggle scroll view |
| `?view=scroll` | URL parameter |
| `?view=print` | Print view |
