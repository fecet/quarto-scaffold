# Layout Patterns

## Two-Column

```markdown
:::: {.columns}
::: {.column width="40%"}
Left
:::
::: {.column width="60%"}
Right
:::
::::
```

## Fit Text

```markdown
::: r-fit-text
Big headline
:::
```

## Absolute Positioning

```markdown
![](photo.jpg){.absolute top="-8%" right="-10%" height="120%"}
```

## Stack Elements

```markdown
::: {.r-stack}
![](img1.png){.fragment width="600"}
![](img2.png){.fragment width="600"}
:::
```

## Stretch to Fill

```markdown
![](diagram.png){.r-stretch}
```

## Vertical Center

```markdown
::: {.center}
Centered content
:::
```

## Multi-Row Layout

```markdown
::: {layout="[[20,20,0],[1,1]]"}
## Row 1 Left
## Row 1 Right
::: {placeholder}
:::
## Row 2 Left
## Row 2 Right
:::
```

## Glass Overlay

```markdown
## {background-image="hero.jpg"}
::: {.absolute left="55%" top="55%" style="padding:.6em 1em; background:rgba(255,255,255,.45); backdrop-filter:blur(6px);"}
Key message
:::
```
