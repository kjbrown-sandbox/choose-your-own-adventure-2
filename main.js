// @ts-check

import { AllEndings } from "./endings.js";

const STORAGE_KEY = "endings";
const GRID_SELECTOR = "[data-endings-grid]";
const TOOLTIP_OFFSET = 18;

/**
 * @param {readonly import("./endings.js").Ending[]} endings
 * @returns {Array<[string, boolean]>}
 */
function ensureSeedData(endings) {
   const seeded = endings.map((ending) => /** @type {[string, boolean]} */ ([ending.key, false]));
   localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
   return seeded;
}

/**
 * @param {readonly import("./endings.js").Ending[]} endings
 * @returns {Record<string, boolean>}
 */
function loadUnlockedMap(endings) {
   const raw = localStorage.getItem(STORAGE_KEY);

   /** @type {Array<[string, boolean]> | null} */
   /** @type {Array<[string, boolean]> | null} */
   let parsed = null;

   if (raw) {
      try {
         const maybeArray = JSON.parse(raw);
         if (Array.isArray(maybeArray)) {
            parsed = /** @type {Array<[string, boolean]>} */ (maybeArray);
         }
      } catch (error) {
         console.warn("Failed to parse endings from localStorage; reseeding.", error);
      }
   }

   return Object.fromEntries(parsed ?? ensureSeedData(endings));
}

/**
 * @param {readonly import("./endings.js").Ending[]} endings
 */
/**
 * @typedef {{ root: HTMLDivElement; title: HTMLDivElement; body: HTMLDivElement }} TooltipElements
 */

/**
 * @param {readonly import("./endings.js").Ending[]} endings
 * @param {TooltipElements} tooltip
 */
function renderEndingsGrid(endings, tooltip) {
   const container = document.querySelector(GRID_SELECTOR);
   if (!container) return;

   const unlockedMap = loadUnlockedMap(endings);

   container.innerHTML = "";

   endings.forEach((ending, index) => {
      const card = document.createElement("div");
      const unlocked = Boolean(unlockedMap[ending.key]);

      card.className = "ending-card";
      card.dataset.unlocked = unlocked.toString();
      card.textContent = String(index + 1).padStart(2, "0");

      attachTooltip(card, tooltip, {
         title: ending.title,
         body: unlocked ? ending.description : "???",
         locked: !unlocked,
      });

      container.appendChild(card);
   });
}

/**
 * @returns {TooltipElements}
 */
function createTooltip() {
   const root = document.createElement("div");
   root.className = "ending-tooltip";
   root.dataset.visible = "false";

   const title = document.createElement("div");
   title.className = "ending-tooltip__title";

   const body = document.createElement("div");
   body.className = "ending-tooltip__body";

   root.append(title, body);
   document.body?.appendChild(root);

   return { root, title, body };
}

/**
 * @param {TooltipElements} tooltip
 * @param {{ title: string; body: string; locked: boolean }} content
 */
function showTooltip(tooltip, content) {
   tooltip.title.textContent = content.title;
   tooltip.body.textContent = content.body;
    tooltip.body.dataset.locked = content.locked.toString();
   tooltip.root.dataset.visible = "true";
}

/**
 * @param {TooltipElements} tooltip
 */
function hideTooltip(tooltip) {
   tooltip.root.dataset.visible = "false";
}

/**
 * @param {TooltipElements} tooltip
 * @param {MouseEvent} event
 */
function positionTooltip(tooltip, event) {
   const tooltipRect = tooltip.root.getBoundingClientRect();
   let x = event.clientX + TOOLTIP_OFFSET;
   let y = event.clientY + TOOLTIP_OFFSET;

   const maxX = window.innerWidth - tooltipRect.width - 8;
   const maxY = window.innerHeight - tooltipRect.height - 8;

   if (x > maxX) {
      x = Math.max(8, maxX);
   }

   if (y > maxY) {
      y = Math.max(8, maxY);
   }

   tooltip.root.style.left = `${x}px`;
   tooltip.root.style.top = `${y}px`;
}

/**
 * @param {HTMLDivElement} card
 * @param {TooltipElements} tooltip
 * @param {{ title: string; body: string; locked: boolean }} content
 */
function attachTooltip(card, tooltip, content) {
   /** @param {MouseEvent} event */
   const handleEnter = (event) => {
      showTooltip(tooltip, content);
      positionTooltip(tooltip, event);
   };

   /** @param {MouseEvent} event */
   const handleMove = (event) => {
      if (tooltip.root.dataset.visible === "true") {
         positionTooltip(tooltip, event);
      }
   };

   const handleLeave = () => {
      hideTooltip(tooltip);
   };

   card.addEventListener("mouseenter", handleEnter);
   card.addEventListener("mousemove", handleMove);
   card.addEventListener("mouseleave", handleLeave);
}

function init() {
   const endings = Array.isArray(AllEndings) ? AllEndings : [];

   if (!endings.length) {
      console.error("No endings data found; ensure endings.js exports AllEndings correctly.");
      return;
   }

    const tooltip = createTooltip();
   renderEndingsGrid(endings, tooltip);
}

document.addEventListener("DOMContentLoaded", init);
