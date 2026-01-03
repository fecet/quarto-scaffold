# Masonry Layout Extension

Reveal.js plugin for masonry layouts using [Masonry.js](https://masonry.desandro.com/).

## Usage

```markdown
::::: {.masonry style="--cols: 3; --gap: 4px;"}

![](image1.png)

![](image2.png)

![](image3.png)

:::::
```

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--cols` | `2` | Number of columns |
| `--gap` | `8px` | Gap between items (in px) |

## Files

```
_extensions/masonry/
  _extension.yml       # Extension config
  masonry.pkgd.min.js  # Masonry.js library (~7KB)
  masonry.js           # Reveal.js plugin
  masonry.css          # Layout styles
  README.md            # This file
```
