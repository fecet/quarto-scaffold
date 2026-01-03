# Slide Compiler 扩展设计

将 `progressive` 扩展升级为通用的 **Slide Compiler**，支持用单个 slide 源文件"编译"成多个 slide，并允许 step 级别的属性控制。

## 语法示例

```markdown
## Slide Title

```{.slide-config}
{
  [2] = { ["background-image"] = "assets/highlight.png" },
  [3] = { ["background-color"] = "#1a1a2e", class = "+dark" },
}
```

::: {step="1" then="stay"}
First point
:::

::: {step="2" then="semi"}
Second point
:::

::: {step="3"}
Third point
:::
```

**生成 3 个 slide：**
- Slide 1: 默认背景，显示 "First point"
- Slide 2: `background-image` 生效，显示 "First point" + "Second point"（半透明）
- Slide 3: `background-color` + `.dark` class，显示全部内容

## 配置块语法（Lua table）

```lua
{
  [N] = {
    -- Reveal.js 背景
    ["background-image"] = "path",
    ["background-color"] = "#hex",
    ["background-video"] = "path",

    -- 标题覆盖
    title = "New Title",

    -- 过渡效果
    transition = "fade",

    -- Class 增删
    class = "+add-class -remove-class",

    -- 自定义 data 属性
    ["data-foo"] = "value",
  },
}
```

**`[N]` 表示第 N 个生成的 slide**（不是 step 属性值）。

## 处理流程

```
Pandoc Parse → Lua Filter → Pandoc Write

Lua Filter 内部:
1. 遇到 H2 header，开始收集 slide 内容
2. 遇到 .slide-config CodeBlock，用 load() 解析为 Lua table
3. 收集所有 step="N" 的 Div/Span
4. 计算 max_step，生成 N 个 slide
5. 对每个生成的 slide 应用对应的配置
```

## 实现清单

### 1. 修改 `Pandoc(doc)` 函数

```lua
function Pandoc(doc)
  local new_blocks = {}
  local i = 1

  while i <= #doc.blocks do
    local block = doc.blocks[i]

    if block.t == "Header" and block.level == 2 then
      local slide_blocks = {}
      local slide_config = nil  -- NEW: 配置表
      local j = i + 1

      while j <= #doc.blocks do
        local next_block = doc.blocks[j]
        if next_block.t == "Header" and next_block.level == 2 then
          break
        end
        -- NEW: 检查配置块
        if is_slide_config(next_block) then
          slide_config = parse_config(next_block.text)
        else
          table.insert(slide_blocks, next_block)
        end
        j = j + 1
      end

      local slides = process_slide(block, slide_blocks, slide_config)
      -- ... 插入 slides
      i = j
    else
      table.insert(new_blocks, block)
      i = i + 1
    end
  end

  doc.blocks = new_blocks
  return doc
end
```

### 2. 新增配置解析函数

```lua
local function is_slide_config(block)
  return block.t == "CodeBlock"
     and block.classes:includes("slide-config")
end

local function parse_config(text)
  local fn, err = load("return " .. text)
  if not fn then
    io.stderr:write("slide-config parse error: " .. err .. "\n")
    return nil
  end
  return fn()
end
```

### 3. 新增配置应用函数

```lua
local function apply_step_config(header, step_num, config)
  if not config or not config[step_num] then return end
  local cfg = config[step_num]

  -- 背景属性
  local bg_attrs = {
    "background-image", "background-color",
    "background-video", "transition"
  }
  for _, attr in ipairs(bg_attrs) do
    if cfg[attr] then
      header.attributes[attr] = cfg[attr]
    end
  end

  -- 标题覆盖
  if cfg.title then
    header.content = {pandoc.Str(cfg.title)}
  end

  -- Class 增删
  if cfg.class then
    for op, cls in cfg.class:gmatch("([%+%-])(%S+)") do
      if op == "+" then
        header.classes:insert(cls)
      else
        header.classes = header.classes:filter(function(c) return c ~= cls end)
      end
    end
  end

  -- data-* 属性
  for k, v in pairs(cfg) do
    if k:match("^data%-") then
      header.attributes[k] = v
    end
  end
end
```

### 4. 修改 `process_slide` 函数签名

```lua
-- 原签名
local function process_slide(header, blocks)

-- 新签名
local function process_slide(header, blocks, config)
```

在生成每个 slide 时调用 `apply_step_config`:

```lua
for current_step = 1, max_step do
  local slide_header = deep_copy(header)
  slide_header.attributes["auto-animate"] = "true"

  -- NEW: 应用 step 配置
  apply_step_config(slide_header, current_step, config)

  -- ... 处理内容块
end
```

## 向后兼容

- 无 `.slide-config` 块时，行为与现有完全一致
- `step="N"` / `then="stay|hide|semi"` 语法不变
- 现有 slides 无需修改
