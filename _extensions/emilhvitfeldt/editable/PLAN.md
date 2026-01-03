# editable 扩展

仅支持图片拖拽/缩放的 Reveal.js 插件。

## 使用方法

1. 在 Markdown 中为图片添加 `.editable` 类：
   ```markdown
   ![](assets/images/logo.png){.editable}
   ```

2. 预览时拖拽/缩放图片，按住 Shift 保持比例

3. 点击菜单 → "Save Layout" 下载 `editable-layout.json`

4. 将 JSON 文件放到项目根目录，重新渲染即可应用布局

## 文件说明

| 文件 | 功能 |
|------|------|
| `editable.js` | 图片拖拽/缩放交互，JSON 导出 |
| `editable.lua` | 读取 JSON，为 `img.editable` 注入 style |

## 稳定 ID

ID 格式：`{slide-id}/{图片src}`

- `slide-id`：来自 `## Slide Title {#my-id}` 或自动生成
- `图片src`：原始路径如 `assets/images/logo.png`
