## Project Overview

Quarto Revealjs presentation project. Main deck is `deck.qmd`, individual slides are in `slides/`.

**Required Skills**:
- `create-slide`: 本项目专用规范（Grid 布局、MD3 工具类、组件）
- `quarto-revealjs`: Quarto/Reveal.js 通用知识（YAML、SCSS、扩展）

## Startup

Before starting any task, launch the live reload server:

```bash
python serve.py &
```

Preview URL: http://localhost:5555/deck.html

The server auto-renders every 5 seconds and refreshes the browser when `deck.html` changes.

## 制作流程

### 1. 启动开发环境
- 运行 `python serve.py &` 启动实时预览服务器
- 打开 http://localhost:5555/deck.html 预览

### 2. 规划阶段（textslide 技能）
- 使用 textslide DSL 设计幻灯片布局草图
- 输出 ASCII 布局 + 内容块规格
- 确定各区域的角色和内容类型

### 3. 实现阶段（create-slide + quarto-revealjs 技能）
- 创建 `slides/[主题名]/index.md`
- 在 `deck.qmd` 中添加 include
- 参考 `create-slide` 技能：Grid 布局、MD3 工具类、组件模式
- 参考 `quarto-revealjs` 技能：yaml-config、animation、scss-theming
- 图标使用 `{{< fa icon-name >}}` 或 emoji
- 图片使用 svg 直接生成，或使用 matplotlib 等工具

### 4. 调试阶段（chrome-devtools-mcp）
- 使用 take_snapshot 检查页面结构
- 使用 take_screenshot 截图对比
- 截图存放在 `raw-assets/` 目录（不被 VCS 追踪）
- 检查控制台错误和网络请求

### 5. 常用命令
- `just render` - 手动渲染
- `just scss-combine` - 合并样式
- `just sync-assets` - 同步资源

## Project Structure

```
deck.qmd            # Main presentation (includes slides/)
slides/             # Individual slide files (one per slide)
  [slide-name]/
    index.md        # Slide content
    assets/         # Source assets for this slide (SVG, images, etc.)
_quarto.yml         # Quarto project config (runs sync-assets & scss-combine pre-render)
justfile            # just task runner
styles/
  _*.scss           # Source SCSS files (edit these)
  custom.scss       # Auto-generated (DO NOT EDIT)
assets/             # Synced assets (DO NOT EDIT - copied from slides/*/assets/ by pre-render hook) deck_files/         # Build output (not in git) - check for implementation details
```

## Assets Workflow

Assets are managed per-slide and synced to root `assets/` automatically:

1. **Source**: Place assets in `slides/[slide-name]/assets/`
2. **Sync**: `just sync-assets` (pre-render hook) copies all `slides/*/assets/*` to root `assets/`
3. **Reference**: In markdown, use relative path `assets/filename.svg`

**Important**:
- Edit assets in `slides/*/assets/` (source of truth)
- Never edit `assets/` directly (will be overwritten)
- SVG files used as `<img>` must have embedded `<style>` tags (external CSS won't apply)

## deck_files Reference

When implementation details are unclear, check `deck_files/` for compiled output:

```
deck_files/
  libs/
    revealjs/
      dist/
        reveal.js           # Reveal.js core
        theme/quarto-*.css  # Compiled theme CSS (final styles)
      plugin/
        quarto-support/     # Quarto support JS (link handling, theme toggle)
        notes/              # Speaker notes
        math/               # KaTeX/MathJax
        highlight/          # Code highlighting
        zoom/search/        # Navigation plugins
    quarto-html/
      tippy.*               # Tooltips
      tabby.*               # Tab panels
      quarto-syntax-*.css   # Syntax highlighting
    clipboard/              # Copy button functionality
```

**Key files for debugging**:
- `libs/revealjs/dist/theme/quarto-*.css` - Final compiled CSS (check actual styles)
- `libs/revealjs/plugin/quarto-support/support.js` - Quarto runtime behavior

## SCSS Workflow

SCSS is split into partial files (`styles/_*.scss`) and combined via `just scss-combine` before render.

- **Edit**: `styles/_00-theme.scss`, `styles/_custom.scss`, `styles/_vs-grid.scss`
- **Never edit**: `styles/custom.scss` (auto-generated)

The pre-render hook in `_quarto.yml` runs `just scss-combine` automatically.

## 样式约定

- **字体大小**: 使用 `style="font-size: ..."` 显式覆盖，禁止使用 Quarto 的 `.smaller` 类

## 幻灯片格式

Quarto 的 `{{< include >}}` 是简单的文本拼接，因此：

- **标题及属性**：写在 `deck.qmd` 中（作为可见大纲）
- **内容**：写在 `slides/*/index.md` 中（不含 `##` 标题行）
- **演讲者注释**：使用 `::: {.hidden}` 块放在标题下方

示例：

```markdown
## 标题文字 {background-color="#fff"}

::: {.hidden}
演讲者注释内容
:::

{{< include slides/slide-name/index.md >}}
```

