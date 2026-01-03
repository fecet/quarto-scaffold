# Animation

## Fragment Effects

```markdown
::: {.fragment .fade-up}
Slides up while fading in
:::

::: {.fragment .highlight-red}
Turns red
:::
```

**Available effects:**
- Fade: `fade-out`, `fade-up`, `fade-down`, `fade-left`, `fade-right`, `fade-in-then-out`, `fade-in-then-semi-out`, `semi-fade-out`
- Transform: `grow`, `shrink`, `strike`
- Highlight: `highlight-red`, `highlight-green`, `highlight-blue`, `highlight-current-red`, `highlight-current-green`, `highlight-current-blue`

### Fragment Order

```markdown
::: {.fragment fragment-index=2}
Shows second
:::
::: {.fragment fragment-index=1}
Shows first
:::
```

### Nested Fragments

```markdown
::: {.fragment .fade-in}
::: {.fragment .highlight-red}
::: {.fragment .fade-out}
Fades in → highlights → fades out
:::
:::
:::
```

### Custom Fragment CSS

```scss
.fragment.custom-blur {
  filter: blur(5px);
  transition: filter 0.5s;
}
.fragment.custom-blur.visible {
  filter: none;
}
```

## Auto-Animate

```markdown
## Step 1 {auto-animate=true}

::: {data-id="box" style="background:red; width:100px;"}
:::

## Step 2 {auto-animate=true}

::: {data-id="box" style="background:blue; width:300px;"}
:::
```

### Settings

```markdown
## Slide {auto-animate=true auto-animate-easing="ease-out" auto-animate-duration=0.8}
```

Per-element delay:
```markdown
::: {data-id="a" data-auto-animate-delay="0.5"}
Delayed
:::
```

### Global Config

```yaml
format:
  revealjs:
    auto-animate-unmatched: fade  # fade | true | false
```

## Pause

```markdown
Content before

. . .

Content after
```
