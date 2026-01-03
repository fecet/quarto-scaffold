--- Unified reuse filter for Quarto
--- Supports both Span and Div with consistent syntax
---
--- Define:
---   Span: [content]{#my-id .class}
---   Div:  ::: {#my-id .class attr="value"}
---
--- Reuse (auto-inherits classes/attributes):
---   Span: []{ref="my-id"}
---   Div:  ::: {ref="my-id"}
---
--- Can add extra classes at reuse site:
---   ::: {ref="my-id" .extra-class}

local storage = {}

local function collect(el)
  if el.identifier and el.identifier ~= '' then
    storage[el.identifier] = {
      content = el.content,
      classes = el.classes,
      attributes = el.attributes
    }
  end
  return el
end

local function merge_classes(target, source)
  local seen = {}
  for _, c in ipairs(target) do
    seen[c] = true
  end
  for _, c in ipairs(source) do
    if not seen[c] then
      target:insert(c)
    end
  end
end

local function replace(el)
  local ref = el.attributes['ref']
  if ref then
    local stored = storage[ref]
    if stored then
      el.content = stored.content
      merge_classes(el.classes, stored.classes)
      for k, v in pairs(stored.attributes) do
        if not el.attributes[k] then
          el.attributes[k] = v
        end
      end
    else
      quarto.log.warning('[reuse] Reference not found: ' .. ref)
    end
    el.attributes['ref'] = nil
  end
  return el
end

return {
  { Span = collect, Div = collect },
  { Span = replace, Div = replace }
}
