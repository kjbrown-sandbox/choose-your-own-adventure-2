// @ts-check

import { ALL_ENDINGS } from "./endings.js";
import { RoomEnum, RoomsByKey } from "./rooms.js";

/** @typedef {import("./endings.js").Ending} Ending */
/** @typedef {import("./rooms.js").Room} Room */
/** @typedef {import("./rooms.js").Choice} RoomChoice */
/** @typedef {Record<string, unknown>} RoomState */
/** @typedef {Record<string, RoomState>} RoomsState */

const STORAGE_KEY = "endings";
const GRID_SELECTOR = "[data-endings-grid]";
const TOOLTIP_OFFSET = 18;
const STORY_TITLE_SELECTOR = "[data-room-title]";
const STORY_DESCRIPTION_SELECTOR = "[data-room-description]";
const STORY_OPTIONS_SELECTOR = "[data-room-options]";
const STORY_FEEDBACK_SELECTOR = "[data-story-feedback]";

/**
 * @returns {RoomsState}
 */
function createInitialRoomsState() {
   return Object.keys(RoomsByKey).reduce((acc, roomKey) => {
      acc[roomKey] = {};
      return acc;
   }, /** @type {RoomsState} */ ({}));
}

/**
 * @param {readonly Ending[]} endings
 * @returns {Array<[string, boolean]>}
 */
function ensureSeedData(endings) {
   const seeded = endings.map((ending) => /** @type {[string, boolean]} */ ([ending.key, false]));
   localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
   return seeded;
}

/**
 * @param {readonly Ending[]} endings
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
 * @param {Record<string, boolean>} unlockedMap
 */
function persistUnlockedMap(unlockedMap) {
   const entries = Object.entries(unlockedMap);
   localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

/**
 * @typedef {{ root: HTMLDivElement; title: HTMLDivElement; body: HTMLDivElement }} TooltipElements
 */

/**
 * @param {readonly Ending[]} endings
 * @param {TooltipElements} tooltip
 * @param {Record<string, boolean>} [unlockedOverride]
 */
function renderEndingsGrid(endings, tooltip, unlockedOverride) {
   const container = document.querySelector(GRID_SELECTOR);
   if (!container) return;

   const unlockedMap = unlockedOverride ?? loadUnlockedMap(endings);

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

/**
 * @typedef {Object} StoryUIElements
 * @property {HTMLElement | null} title
 * @property {HTMLElement | null} description
 * @property {HTMLElement | null} options
 * @property {HTMLElement | null} feedback
 */

/**
 * @returns {StoryUIElements}
 */
function queryStoryElements() {
   return {
      title: document.querySelector(STORY_TITLE_SELECTOR),
      description: document.querySelector(STORY_DESCRIPTION_SELECTOR),
      options: document.querySelector(STORY_OPTIONS_SELECTOR),
      feedback: document.querySelector(STORY_FEEDBACK_SELECTOR),
   };
}

/**
 * @param {HTMLElement | null} node
 * @param {string} text
 */
function setFeedback(node, text) {
   if (!node) return;
   if (!text) {
      node.textContent = "";
      node.setAttribute("hidden", "hidden");
      return;
   }

   node.textContent = text;
   node.removeAttribute("hidden");
}

/**
 * @param {Room} room
 * @param {Set<string>} visitedRooms
 */
function resolveRoomDescription(room, visitedRooms) {
   if (typeof room.description === "string") {
      return room.description;
   }

   if (visitedRooms.has(room.key) && room.description.repeat) {
      return room.description.repeat;
   }

   return room.description.initial;
}

/**
 * @param {string} key
 */
function formatRoomTitle(key) {
   return key
      .split(/[-_]/)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ");
}

/**
 * @param {Room} room
 * @param {StoryUIElements} ui
 * @param {GameState} state
 * @param {ChoiceHelpers} helpers
 */
function renderStory(room, ui, state, helpers) {
   const { title, description, options, feedback } = ui;

   if (!room || !title || !description || !options) {
      return;
   }

   const visited = state.visitedRooms;
   title.textContent = formatRoomTitle(room.key);
   description.textContent = resolveRoomDescription(room, visited);
   visited.add(room.key);
   options.innerHTML = "";
   if (feedback) {
      setFeedback(feedback, "");
   }

   if (state.isGameOver) {
      const message = document.createElement("p");
      message.className = "story-panel__sysmsg";
      message.textContent = "The story pauses here—for now. Refresh to begin anew.";
      options.appendChild(message);
      return;
   }

   const availableChoices = room.choices.filter((choice) => {
      try {
         return choice.precondition(state);
      } catch (error) {
         console.error("Choice precondition failed", error);
         return false;
      }
   });

   if (!availableChoices.length) {
      const message = document.createElement("p");
      message.className = "story-panel__sysmsg";
      message.textContent = "There are no choices here yet.";
      options.appendChild(message);
      return;
   }

   availableChoices.forEach((choice) => {
      const button = document.createElement("button");
      button.className = "story-option";
      button.type = "button";
      button.textContent = choice.text;
      button.addEventListener("click", () => {
         handleChoiceSelection(choice, state, helpers, ui);
      });
      options.appendChild(button);
   });
}

/**
 * @typedef {ReturnType<typeof createInitialState>} GameState
 * @typedef {{ gotoRoom: (roomKey: string) => void; narrate: (text: string) => void; unlockEnding: (endingKey: string) => void; endGame: () => void }} ChoiceHelpers
 */

function createInitialState() {
   return {
      currentRoom: /** @type {string} */ (RoomEnum.ENTRANCE),
      visitedRooms: new Set(),
      isGameOver: false,
      rooms: createInitialRoomsState(),
   };
}

/**
 * @param {RoomChoice} choice
 * @param {GameState} state
 * @param {ChoiceHelpers} helpers
 * @param {StoryUIElements} ui
 */
function handleChoiceSelection(choice, state, helpers, ui) {
   if (state.isGameOver) return;

   try {
      choice.onChoose(state, helpers);
   } catch (error) {
      console.error("Choice handler failed", error);
      return;
   }

   if (choice.result && ui.feedback) {
      helpers.narrate(choice.result);
   }

   const nextRoom = RoomsByKey[state.currentRoom];
   renderStory(nextRoom, ui, state, helpers);
}

function init() {
   if (!ALL_ENDINGS.length) {
      console.error("No endings data found; ensure endings.js exports ALL_ENDINGS correctly.");
      return;
   }

   const tooltip = createTooltip();
   let unlockedMap = loadUnlockedMap(ALL_ENDINGS);
   const ui = queryStoryElements();
   const state = createInitialState();

   /** @type {ChoiceHelpers} */
   const helpers = {
      gotoRoom: (roomKey) => {
         state.currentRoom = roomKey;
         state.isGameOver = false;
      },
      narrate: (text) => {
         setFeedback(ui.feedback, text);
      },
      unlockEnding: (endingKey) => {
         if (unlockedMap[endingKey]) return;
         unlockedMap = { ...unlockedMap, [endingKey]: true };
         persistUnlockedMap(unlockedMap);
         renderEndingsGrid(ALL_ENDINGS, tooltip, unlockedMap);
      },
      endGame: () => {
         state.isGameOver = true;
      },
   };

   renderEndingsGrid(ALL_ENDINGS, tooltip, unlockedMap);
   const startingRoom = RoomsByKey[state.currentRoom];
   renderStory(startingRoom, ui, state, helpers);
}

document.addEventListener("DOMContentLoaded", init);
