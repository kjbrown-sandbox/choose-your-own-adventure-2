// @ts-check

import { EndingEnum } from "./endings.js";

/**
 * @typedef {Object} GameStateSnapshot
 * @property {string} currentRoom
 * @property {Set<string>} visitedRooms
 * @property {boolean} isGameOver
 */

/**
 * @typedef {Object} ChoiceHelpers
 * @property {(roomKey: string) => void} gotoRoom
 * @property {(message: string) => void} narrate
 * @property {(endingKey: string) => void} unlockEnding
 * @property {() => void} endGame
 */

/**
 * Describes an interactive option the player can select inside a room.
 * @typedef {Object} Choice
 * @property {(state: GameStateSnapshot) => boolean} precondition
 *    Pure check that returns true when this option should be visible. Runs on every render.
 * @property {string} text
 *    The label shown before the player selects the option.
 * @property {string} [postChoiceText]
 *    Optional narration displayed immediately after the choice is taken.
 * @property {(state: GameStateSnapshot, helpers: ChoiceHelpers) => void} onChoose
 *    Executes the consequences of the selection (update stats, move rooms, unlock endings, etc.).
 */

/**
 * Represents a story beat/room in the adventure flow.
 * @typedef {Object} Room
 * @property {string} key
 *    Stable identifier used for navigation and visit tracking.
 * @property {string | { initial: string; repeat?: string }} description
 *    Text shown on entry. Provide a string for a single description or an object to vary
 *    first-visit (`initial`) and repeat (`repeat`) copy.
 * @property {Choice[]} choices
 *    Ordered list of possible actions the player may take from this room.
 */

const RoomEnum = Object.freeze({
   ENTRANCE: "entrance",
   FRONT_ROOM: "frontRoom",
});

/** @type {Room[]} */
const RoomList = [
   {
      key: RoomEnum.ENTRANCE,
      description:
         "Lightning skitters across the spire's iron crown while rain needles your coat. The tower door stands ajar—dark, expectant.",
      choices: [
         {
            text: "Enter the tower",
            postChoiceText: "You slip through the stone archway before your courage fades.",
            precondition: () => true,
            onChoose: (_state, helpers) => {
               helpers.gotoRoom(RoomEnum.FRONT_ROOM);
            },
         },
         {
            text: "Get the heck away",
            postChoiceText:
               "Better drenched than dead—you bolt back down the cliff path, vowing to forget this place.",
            precondition: () => true,
            onChoose: (_state, helpers) => {
               helpers.unlockEnding(EndingEnum.COWARD);
               helpers.endGame();
            },
         },
      ],
   },
   {
      key: RoomEnum.FRONT_ROOM,
      description:
         "Inside, a foyer of dust and candle smoke stretches ahead. Portraits watch from the walls while a stairwell coils upward into shadow.",
      choices: [
         {
            text: "Catch your breath and take stock",
            postChoiceText:
               "The silence feels like a held breath. More paths will reveal themselves soon...",
            precondition: () => true,
            onChoose: () => {
               /* Placeholder action */
            },
         },
      ],
   },
];

const RoomsByKey = Object.freeze(
   RoomList.reduce((acc, room) => {
      acc[room.key] = room;
      return acc;
   }, /** @type {Record<string, Room>} */ ({}))
);

export { RoomEnum, RoomsByKey };
export default RoomEnum;
