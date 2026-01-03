-- Progressive Slides Filter
-- Generates auto-animate slides from step="N" attributes
--
-- Syntax:
--   step="1"                - show at step 1, hide after (default)
--   step="1" then="stay"    - show at step 1, stay visible
--   step="1" then="semi"    - show at step 1, semi-transparent after
--   no step                 - always visible (or inherit from parent)
--
-- Inheritance:
--   Children without step inherit parent's step
--   Children can override then behavior with their own then attribute

local function get_element_visibility(step, then_action, current_step)
  -- Determine element visibility for current step
  -- Returns: "hidden", "visible", or the CSS style to apply

  if not step then
    return "visible"  -- no step = always visible
  end

  if current_step < step then
    return "hidden"
  elseif current_step == step then
    return "visible"
  else
    -- current_step > step: apply "then" action
    if then_action == "hide" then
      return "hidden"
    elseif then_action == "stay" then
      return "visible"
    elseif then_action then
      -- Return the CSS style to inject
      return "style:" .. then_action
    else
      -- default: hide after step
      return "hidden"
    end
  end
end

local function collect_steps_from_inlines(inlines, steps, inherited_step)
  -- Collect step values from inline elements (Spans)
  for _, inline in ipairs(inlines) do
    if inline.t == "Span" then
      local step_str = inline.attributes["step"]
      local step = step_str and tonumber(step_str) or inherited_step
      if step then
        steps[step] = true
      end
      -- Recurse into span content
      if inline.content then
        collect_steps_from_inlines(inline.content, steps, step)
      end
    end
  end
end

local function collect_steps(blocks, steps, inherited_step)
  -- Recursively collect all step values from blocks
  -- inherited_step: step value inherited from parent
  for _, block in ipairs(blocks) do
    if block.t == "Div" then
      local step_str = block.attributes["step"]
      local step = step_str and tonumber(step_str) or inherited_step

      if step then
        steps[step] = true
      end

      -- Recurse into content, passing down step for inheritance
      if block.content then
        collect_steps(block.content, steps, step)
      end
    elseif block.content and type(block.content) == "table" then
      -- For other blocks (Para, Plain, etc.), check inline content
      collect_steps_from_inlines(block.content, steps, inherited_step)
    end
  end
  return steps
end

local function get_max_step(steps)
  local max = 0
  for step, _ in pairs(steps) do
    if step > max then max = step end
  end
  return max
end

local function deep_copy(el)
  return el:clone()
end

local function apply_visibility_style(el, visibility)
  -- Apply visibility result to element
  -- visibility can be "visible", "hidden", or "style:..."
  if visibility:sub(1, 6) == "style:" then
    local css = visibility:sub(7)
    local existing = el.attributes["style"] or ""
    if existing ~= "" and not existing:match(";%s*$") then
      existing = existing .. "; "
    end
    el.attributes["style"] = existing .. css
  end
end

local function process_inline_for_step(inline, current_step, inherited_step, inherited_then)
  -- Process inline element (Span) for current step
  -- Returns: processed inline or nil (if hidden)

  if inline.t ~= "Span" then
    return inline
  end

  local step_str = inline.attributes["step"]
  local step = step_str and tonumber(step_str) or inherited_step
  local then_action = inline.attributes["then"] or inherited_then

  local visibility = get_element_visibility(step, then_action, current_step)

  if visibility == "hidden" then
    return nil
  end

  local result = deep_copy(inline)

  -- Remove step/then attributes from output
  result.attributes["step"] = nil
  result.attributes["then"] = nil

  apply_visibility_style(result, visibility)

  return result
end

local function process_inlines(inlines, current_step, inherited_step, inherited_then)
  -- Process list of inline elements
  local new_inlines = {}
  for _, inline in ipairs(inlines) do
    if inline.t == "Span" then
      local processed = process_inline_for_step(inline, current_step, inherited_step, inherited_then)
      if processed then
        -- Recursively process span content
        if processed.content then
          processed.content = process_inlines(processed.content, current_step, inherited_step, inherited_then)
        end
        table.insert(new_inlines, processed)
      end
    else
      table.insert(new_inlines, inline)
    end
  end
  return new_inlines
end

local function process_block_for_step(block, current_step, inherited_step, inherited_then)
  -- Process block and its children for current step
  -- inherited_step: step value from parent
  -- inherited_then: then value from parent
  -- Returns: processed block or nil (if hidden)

  if block.t ~= "Div" then
    -- For non-Div blocks, process inline content if present
    if block.content and type(block.content) == "table" then
      local result = deep_copy(block)
      result.content = process_inlines(result.content, current_step, inherited_step, inherited_then)
      return result
    end
    return block
  end

  local step_str = block.attributes["step"]
  local step = step_str and tonumber(step_str) or inherited_step
  local then_action = block.attributes["then"] or inherited_then

  local visibility = get_element_visibility(step, then_action, current_step)

  if visibility == "hidden" then
    return nil
  end

  local result = deep_copy(block)

  -- Remove step/then attributes from output
  result.attributes["step"] = nil
  result.attributes["then"] = nil

  apply_visibility_style(result, visibility)

  -- Process children recursively, passing down step/then for inheritance
  if result.content then
    local new_content = {}
    for _, child in ipairs(result.content) do
      local processed = process_block_for_step(child, current_step, step, then_action)
      if processed then
        table.insert(new_content, processed)
      end
    end
    result.content = new_content
  end

  return result
end

local function process_slide(header, blocks)
  -- Process a slide (header + following blocks until next header)
  -- Returns: list of slides or nil if no steps

  -- Collect all steps from blocks (nil = no inherited step at top level)
  local steps = {}
  collect_steps(blocks, steps, nil)

  local max_step = get_max_step(steps)

  if max_step == 0 then
    return nil
  end

  -- Generate slides for each step
  local slides = {}

  for current_step = 1, max_step do
    -- Clone header and add auto-animate
    local slide_header = deep_copy(header)
    slide_header.attributes["auto-animate"] = "true"

    -- Ensure unique id for each step (avoid duplicate HTML ids)
    if current_step > 1 then
      slide_header.identifier = header.identifier .. "-step-" .. current_step
    end

    -- Process each block (nil = no inherited step/then at top level)
    local slide_blocks = {}
    for _, block in ipairs(blocks) do
      local processed = process_block_for_step(block, current_step, nil, nil)
      if processed then
        table.insert(slide_blocks, processed)
      end
    end

    table.insert(slides, { header = slide_header, blocks = slide_blocks })
  end

  return slides
end

function Pandoc(doc)
  local new_blocks = {}
  local i = 1

  while i <= #doc.blocks do
    local block = doc.blocks[i]

    if block.t == "Header" and block.level == 2 then
      -- Collect all blocks until next h2 header
      local slide_blocks = {}
      local j = i + 1
      while j <= #doc.blocks do
        local next_block = doc.blocks[j]
        if next_block.t == "Header" and next_block.level == 2 then
          break
        end
        table.insert(slide_blocks, next_block)
        j = j + 1
      end

      -- Process slide
      local slides = process_slide(block, slide_blocks)

      if slides then
        -- Insert generated slides
        for _, slide in ipairs(slides) do
          table.insert(new_blocks, slide.header)
          for _, b in ipairs(slide.blocks) do
            table.insert(new_blocks, b)
          end
        end
        i = j  -- Skip to next header
      else
        -- No steps, keep original
        table.insert(new_blocks, block)
        i = i + 1
      end
    else
      table.insert(new_blocks, block)
      i = i + 1
    end
  end

  doc.blocks = new_blocks
  return doc
end
