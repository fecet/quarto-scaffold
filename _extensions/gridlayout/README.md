# Grid Layout Extension

Reveal.js plugin for CSS Grid layouts.

## Usage

```markdown
:::: {.grid cols="1fr 2fr" rows="auto 1fr"}

::: {.slot}
Left column (1fr)
:::

::: {.slot}
Right column (2fr)
:::

::::
```

## CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--cols` | `1fr` | Column definition |
| `--rows` | `auto` | Row definition |
| `--gap` | `1em` | Gap between items |

## Slot Utilities

### Column Span
- `.span-2` - Span 2 columns
- `.span-3` - Span 3 columns
- `.span-4` - Span 4 columns

### Row Span
- `.row-span-2` - Span 2 rows
- `.row-span-3` - Span 3 rows
- `.row-span-4` - Span 4 rows

## Files

```
_extensions/gridlayout/
  _extension.yml  # Extension config
  grid-layout.js  # Attribute → CSS variable conversion
  grid-layout.css # .grid and .slot styles
  slot-id.lua     # Auto-generate slot IDs
  README.md       # This file
```
