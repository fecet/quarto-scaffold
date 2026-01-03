# Motivation

1. Browser security: `showSaveFilePicker` requires user authorization on every session
2. Include files: `{{< include >}}` content cannot be saved back to source files
3. Solution: Store layout in JSON, apply styles via Lua filter at compile time
