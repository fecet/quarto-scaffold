-- Lua filter to auto-generate IDs for .slot divs
-- Prevents Pandoc from promoting divs with headings to sections

local current_slide_id = "slide"
local slot_counter = 0

function Header(el)
  -- Track slide ID from level 2 headers
  if el.level == 2 then
    current_slide_id = el.identifier ~= "" and el.identifier or "slide"
    slot_counter = 0
  end
  return el
end

function Div(el)
  -- Handle .grid.incremental: add fragment class to child slots
  if el.classes:includes("grid") and el.classes:includes("incremental") then
    el = el:walk({
      Div = function(child)
        if child.classes:includes("slot") and not child.classes:includes("fragment") and not child.classes:includes("nonincremental") then
          child.classes:insert("fragment")
        end
        return child
      end
    })
  end

  -- Check if div has .slot class
  local has_slot = el.classes:includes("slot")

  -- Add ID if .slot and no existing ID
  if has_slot and (el.identifier == nil or el.identifier == "") then
    slot_counter = slot_counter + 1
    el.identifier = current_slide_id .. "-slot-" .. slot_counter
  end

  return el
end

return {
  { Header = Header },
  { Div = Div }
}
