--- Notes Sync Filter for Quarto Revealjs
--- Injects speaker notes from notes.md into slides by position

local notes_list = {}  -- ordered list of notes blocks for each slide

--- Parse notes.md and split by H2 headers
local function load_notes()
  local f = io.open("notes.md", "r")
  if not f then
    quarto.log.info("[notes-sync] notes.md not found, skipping")
    return
  end

  local content = f:read("*a")
  f:close()

  local doc = pandoc.read(content, "markdown")
  local current = {}

  local seen_first_header = false
  for _, block in ipairs(doc.blocks) do
    if block.t == "Header" and block.level == 2 then
      if seen_first_header then
        -- Save previous section
        table.insert(notes_list, current)
      end
      seen_first_header = true
      current = {}
    else
      table.insert(current, block)
    end
  end
  -- Don't forget last section
  if seen_first_header then
    table.insert(notes_list, current)
  end

  quarto.log.info("[notes-sync] Loaded " .. #notes_list .. " note sections")
end

--- Check if a Div has class "notes"
local function is_notes_div(el)
  return el.t == "Div" and el.classes:includes("notes")
end

--- Main filter: inject notes into slides
function Pandoc(doc)
  load_notes()

  if #notes_list == 0 then
    return doc
  end

  local slide_index = 0
  local new_blocks = {}
  local pending_notes = nil  -- notes to insert before next H2

  for _, block in ipairs(doc.blocks) do
    -- When hitting a new H2, first insert pending notes from previous slide
    if block.t == "Header" and block.level == 2 then
      if pending_notes then
        table.insert(new_blocks, pending_notes)
        pending_notes = nil
      end

      slide_index = slide_index + 1
      table.insert(new_blocks, block)

      -- Prepare notes for this slide
      if notes_list[slide_index] and #notes_list[slide_index] > 0 then
        pending_notes = pandoc.Div(notes_list[slide_index], pandoc.Attr("", {"notes"}))
      end
    elseif is_notes_div(block) then
      -- Skip existing notes div (will be replaced by notes.md content)
    else
      table.insert(new_blocks, block)
    end
  end

  -- Insert notes for last slide
  if pending_notes then
    table.insert(new_blocks, pending_notes)
  end

  return pandoc.Pandoc(new_blocks, doc.meta)
end
