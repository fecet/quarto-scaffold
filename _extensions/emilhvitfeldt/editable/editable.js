// editable: Image drag & resize plugin for Reveal.js
// Pure JS implementation - no Lua filter needed

// Global state
let activeImg = null;
let activeContainer = null;
let isDragging = false;
let isResizing = false;
let resizeHandle = null;
let startX, startY, initialX, initialY, initialWidth, initialHeight;
let maxZIndex = 100;
const modifiedImages = new Set();
let fileHandle = null;

window.Revealeditable = function () {
  return {
    id: "Revealeditable",
    init: function (deck) {
      deck.on("ready", async function () {
        // Register global events once
        document.addEventListener("mousemove", handleGlobalMove);
        document.addEventListener("mouseup", handleGlobalUp);
        document.addEventListener("touchmove", handleGlobalMove);
        document.addEventListener("touchend", handleGlobalUp);

        // Load existing layout and apply
        const layout = await fetchLayout();
        document.querySelectorAll("img.editable").forEach((img) => {
          setupDraggableImg(img);
          const id = getImageId(img);
          if (layout[id]) applyLayout(img, layout[id]);
        });

        addSaveMenuButton();
      });
    },
  };
};

async function fetchLayout() {
  try {
    const res = await fetch("editable-layout.json");
    if (res.ok) return await res.json();
  } catch (e) {
    // File doesn't exist or fetch failed
  }
  return {};
}

function applyLayout(img, dims) {
  const container = img.parentNode;
  if (dims.left !== undefined) container.style.left = dims.left + "px";
  if (dims.top !== undefined) container.style.top = dims.top + "px";
  if (dims.width !== undefined) img.style.width = dims.width + "px";
  if (dims.height !== undefined) img.style.height = dims.height + "px";
}

function addSaveMenuButton() {
  const slideMenuItems = document.querySelector(
    "div.slide-menu-custom-panel ul.slide-menu-items"
  );

  if (slideMenuItems) {
    const existingItems = slideMenuItems.querySelectorAll("li[data-item]");
    let maxDataItem = 0;
    existingItems.forEach((item) => {
      const dataValue = parseInt(item.getAttribute("data-item")) || 0;
      if (dataValue > maxDataItem) maxDataItem = dataValue;
    });

    const newLi = document.createElement("li");
    newLi.className = "slide-tool-item";
    newLi.setAttribute("data-item", (maxDataItem + 1).toString());
    newLi.innerHTML =
      '<a href="#" onclick="saveImageLayout()"><kbd>?</kbd> Save Layout</a>';
    slideMenuItems.appendChild(newLi);
  }
}

function getImageId(img) {
  const slide = img.closest("section[id]");
  const slideId = slide?.id || "unknown";
  const src = img.getAttribute("src") || img.getAttribute("data-src") || "";
  return `${slideId}/${src}`;
}

function getClientCoordinates(e) {
  const isTouch = e.type.startsWith("touch");
  const slidesContainerEl = document.querySelector(".slides");
  const scale = parseFloat(
    window.getComputedStyle(slidesContainerEl).getPropertyValue("--slide-scale")
  ) || 1;

  return {
    clientX: (isTouch ? e.touches[0].clientX : e.clientX) / scale,
    clientY: (isTouch ? e.touches[0].clientY : e.clientY) / scale,
  };
}

function handleGlobalMove(e) {
  if (!activeImg) return;

  const { clientX, clientY } = getClientCoordinates(e);
  const deltaX = clientX - startX;
  const deltaY = clientY - startY;

  if (isDragging) {
    activeContainer.style.left = initialX + deltaX + "px";
    activeContainer.style.top = initialY + deltaY + "px";
    e.preventDefault();
  } else if (isResizing) {
    let newWidth = initialWidth;
    let newHeight = initialHeight;
    let newX = initialX;
    let newY = initialY;

    const preserveAspectRatio = e.shiftKey;
    const aspectRatio = initialWidth / initialHeight;

    if (preserveAspectRatio) {
      if (resizeHandle.includes("e") || resizeHandle.includes("w")) {
        const widthChange = resizeHandle.includes("e") ? deltaX : -deltaX;
        newWidth = Math.max(50, initialWidth + widthChange);
        newHeight = newWidth / aspectRatio;
      } else {
        const heightChange = resizeHandle.includes("s") ? deltaY : -deltaY;
        newHeight = Math.max(50, initialHeight + heightChange);
        newWidth = newHeight * aspectRatio;
      }
      if (resizeHandle.includes("w")) newX = initialX + (initialWidth - newWidth);
      if (resizeHandle.includes("n")) newY = initialY + (initialHeight - newHeight);
    } else {
      if (resizeHandle.includes("e")) newWidth = Math.max(50, initialWidth + deltaX);
      if (resizeHandle.includes("w")) {
        newWidth = Math.max(50, initialWidth - deltaX);
        newX = initialX + (initialWidth - newWidth);
      }
      if (resizeHandle.includes("s")) newHeight = Math.max(50, initialHeight + deltaY);
      if (resizeHandle.includes("n")) {
        newHeight = Math.max(50, initialHeight - deltaY);
        newY = initialY + (initialHeight - newHeight);
      }
    }

    activeImg.style.width = newWidth + "px";
    activeImg.style.height = newHeight + "px";
    activeContainer.style.left = newX + "px";
    activeContainer.style.top = newY + "px";
    e.preventDefault();
  }
}

function handleGlobalUp() {
  if (activeImg && (isDragging || isResizing)) {
    modifiedImages.add(getImageId(activeImg));
    setTimeout(() => {
      if (activeContainer && !activeContainer.matches(":hover")) {
        activeContainer.style.border = "2px solid transparent";
        activeContainer.querySelectorAll(".resize-handle").forEach((h) => (h.style.opacity = "0"));
      }
    }, 300);
  }

  isDragging = false;
  isResizing = false;
  resizeHandle = null;
  activeImg = null;
  activeContainer = null;
}

function setupDraggableImg(img) {
  const container = createContainer(img);
  setupImgStyles(img);
  createResizeHandles(container);
  setupHoverEffects(container);

  // Drag start on image
  img.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("resize-handle")) return;
    activateImg(img, container);
    startDrag(e);
  });
  img.addEventListener("touchstart", (e) => {
    if (e.target.classList.contains("resize-handle")) return;
    activateImg(img, container);
    startDrag(e);
  });

  // Resize start on handles
  container.querySelectorAll(".resize-handle").forEach((handle) => {
    handle.addEventListener("mousedown", (e) => {
      activateImg(img, container);
      startResize(e, handle.dataset.position);
    });
    handle.addEventListener("touchstart", (e) => {
      activateImg(img, container);
      startResize(e, handle.dataset.position);
    });
  });
}

function activateImg(img, container) {
  activeImg = img;
  activeContainer = container;
  container.style.zIndex = ++maxZIndex;
}

function startDrag(e) {
  isDragging = true;
  const { clientX, clientY } = getClientCoordinates(e);
  startX = clientX;
  startY = clientY;
  initialX = activeContainer.offsetLeft;
  initialY = activeContainer.offsetTop;
  e.preventDefault();
}

function startResize(e, position) {
  isResizing = true;
  resizeHandle = position;
  const { clientX, clientY } = getClientCoordinates(e);
  startX = clientX;
  startY = clientY;
  initialWidth = activeImg.offsetWidth;
  initialHeight = activeImg.offsetHeight;
  initialX = activeContainer.offsetLeft;
  initialY = activeContainer.offsetTop;
  e.preventDefault();
  e.stopPropagation();
}

function createContainer(img) {
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.display = "inline-block";
  container.style.border = "2px solid transparent";
  container.style.zIndex = maxZIndex;

  img.parentNode.insertBefore(container, img);
  container.appendChild(img);
  return container;
}

function setupImgStyles(img) {
  img.style.cursor = "move";
  img.style.position = "relative";
  img.style.display = "block";
  // Set default size (half of natural size)
  const w = img.naturalWidth || img.offsetWidth || 200;
  const h = img.naturalHeight || img.offsetHeight || 150;
  img.style.width = w / 2 + "px";
  img.style.height = h / 2 + "px";
}

function createResizeHandles(container) {
  const handles = ["nw", "ne", "sw", "se"];
  handles.forEach((position) => {
    const handle = document.createElement("div");
    handle.className = "resize-handle";
    handle.style.position = "absolute";
    handle.style.width = "10px";
    handle.style.height = "10px";
    handle.style.backgroundColor = "#007cba";
    handle.style.border = "1px solid #fff";
    handle.style.cursor = position + "-resize";
    handle.style.opacity = "0";
    handle.style.transition = "opacity 0.2s";

    if (position.includes("n")) handle.style.top = "-6px";
    if (position.includes("s")) handle.style.bottom = "-6px";
    if (position.includes("w")) handle.style.left = "-6px";
    if (position.includes("e")) handle.style.right = "-6px";

    handle.dataset.position = position;
    container.appendChild(handle);
  });
}

function setupHoverEffects(container) {
  container.addEventListener("mouseenter", () => {
    container.style.border = "2px solid #007cba";
    container.querySelectorAll(".resize-handle").forEach((h) => (h.style.opacity = "1"));
  });

  container.addEventListener("mouseleave", () => {
    if (!isDragging && !isResizing) {
      container.style.border = "2px solid transparent";
      container.querySelectorAll(".resize-handle").forEach((h) => (h.style.opacity = "0"));
    }
  });
}

async function saveImageLayout() {
  // Fetch existing layout and merge
  const layout = await fetchLayout();

  // Only update modified images
  document.querySelectorAll("img.editable").forEach((img) => {
    const id = getImageId(img);
    if (!modifiedImages.has(id)) return;

    const container = img.parentNode;
    layout[id] = {
      left: parseFloat(container.style.left) || container.offsetLeft,
      top: parseFloat(container.style.top) || container.offsetTop,
      width: parseFloat(img.style.width) || img.offsetWidth,
      height: parseFloat(img.style.height) || img.offsetHeight,
    };
  });

  await downloadJson(layout);
}

async function downloadJson(data) {
  const content = JSON.stringify(data, null, 2);
  const filename = "editable-layout.json";

  if ("showSaveFilePicker" in window) {
    try {
      // Reuse existing fileHandle if available
      if (!fileHandle) {
        fileHandle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{ description: "JSON files", accept: { "application/json": [".json"] } }],
        });
      }
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      console.log("Layout saved successfully");
      return;
    } catch (error) {
      console.log("File picker cancelled or error, using fallback");
      fileHandle = null;
    }
  }

  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
