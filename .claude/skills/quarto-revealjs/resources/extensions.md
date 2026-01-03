# Extensions

## Font Awesome

```bash
quarto add quarto-ext/fontawesome
```

```markdown
{{< fa envelope title="Email" >}}
{{< fa brands github size=2xl >}}
```

## embedio (Embed Slides/PDF/Audio)

```bash
quarto add coatless-quarto/embedio
```

```markdown
{{< revealjs file="slides.html" width="100%" height="480px" >}}
{{< pdf file="report.pdf" >}}
{{< audio file="narration.mp3" >}}
```

## Editable (Drag/Resize)

```bash
quarto add EmilHvitfeldt/quarto-revealjs-editable
```

YAML:
```yaml
revealjs-plugins: [editable]
filters: [editable]
```

Usage:
```markdown
![](image.png){.editable}

::: {.editable}
Draggable text
:::
```

Save positions: Menu (`M`) → Tools → Save Moved Elements

## Custom Reveal.js Plugin

Create your own Reveal.js plugin as a Quarto extension.

### Directory Structure

```
_extensions/myplugin/
  _extension.yml
  myplugin.js
  myplugin.css
  README.md
```

### _extension.yml

```yaml
title: My Plugin
author: Your Name
version: 1.0.0
quarto-required: ">=1.2.0"
contributes:
  revealjs-plugins:
    - name: myplugin
      script:
        - myplugin.js
      stylesheet:
        - myplugin.css
```

### Plugin JavaScript

```javascript
window.myplugin = function() {
  return {
    id: 'myplugin',
    init: function(deck) {
      deck.on('ready', () => { /* ... */ });
      deck.on('slidechanged', () => { /* ... */ });
    }
  };
};
```

### Usage

```yaml
revealjs-plugins:
  - myplugin
```

### ⚠️ Naming Warning

**Quarto removes hyphens from plugin names.** Use camelCase or lowercase without hyphens:

| ❌ Don't use | ✅ Use instead |
|-------------|----------------|
| `grid-layout` | `gridlayout` |
| `my-plugin` | `myplugin` |

The directory name, `_extension.yml` name, and `window.*` variable must all match the hyphen-free name.
