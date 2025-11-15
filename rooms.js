// @ts-check

import { EndingEnum } from "./endings.js";

/**
 * @typedef {Object} CharacterState
 * @property {boolean} hasSpellbook
 */

/**
 * @typedef {Object} GameStateSnapshot
 * @property {string} currentRoom
 * @property {Set<string>} visitedRooms
 * @property {boolean} isGameOver
 * @property {Record<string, Record<string, any>>} rooms
 * @property {CharacterState} character
 * @property {number} paranoia
 */

/**
 * @typedef {Object} ChoiceHelpers
 * @property {(roomKey: string) => void} gotoRoom
 * @property {(message: string) => void} narrate
 * @property {(endingKey: string) => void} unlockEnding
 * @property {() => void} endGame
 * @property {(delta: number) => void} adjustParanoia
 */

/**
 * Describes an interactive option the player can select inside a room.
 * @typedef {Object} Choice
 * @property {(state: GameStateSnapshot) => boolean} precondition
 *    Pure check that returns true when this option should be visible. Runs on every render.
 * @property {string} text
 *    The label shown before the player selects the option.
 * @property {string} [result]
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
      description: "The manor stands before you, dark and foreboding.",
      choices: [
         {
            precondition: () => true,
            text: "Enter through the front door",
            result: "",
            onChoose: (_state, helpers) => {
               helpers.gotoRoom(RoomEnum.FRONT_ROOM);
            },
         },
         {
            precondition: (state) => !state.rooms[RoomEnum.ENTRANCE].hasPondered,
            text: "Wait, what's going on?",
            result: `You take a moment to gather your bearings.
               
               You look around and find yourself at the entrance of large dark-wooded manor. The porch shows signs of neglect--peeling paint, uneven boards, and greenery peeking up through cracks. Around you is a forest, vibrant and green and tall, in stark contrast to the dilapidated building. You stand there and close your eyes, trying to recall how you got here, why you're here, what was going on, really any clues to your situation. You feel it shouldn't be difficult. But your mind is stubbornly blank. It unnerves you.
               
               (+1 Paranoia)`,
            onChoose: (state, helpers) => {
               state.rooms[RoomEnum.ENTRANCE].hasPondered = true;
               helpers.adjustParanoia(1);
            },
         },
         {
            precondition: (state) => Boolean(state.rooms[RoomEnum.ENTRANCE].hasPondered),
            text: "Think harder about your situation",
            result: `You force yourself to concentrate. You feel a slight pressure in your head. You get the odd sensation that you're playing tug-of-war with yourself. What's going on? You focus on recalling the most recent memory of how you arrived--even of simply walking through the rusted-over wrought-iron gate that stands a stone's throw away. And yet, as you push to remember, you feel a force resisting your efforts, and you're unwillingly pulled out of your contemplations.
            
            When you open your eyes, you're shocked to find yourself sweating and your body tense, as though bracing itself for impact. More alarmingly, the sun's position has shifted significantly. You're breathing heavily. Your body feels as though it's just finished a harsh sprint. What was going on?
            
            In regaining your breath and slowly coming to your senses, you become aware of two things.
            
            The first, you feel a weight on your back and realize you're carrying a rucksack.
            
            The second, you realize that despite your close proximity to the forest and the manor, you haven't heard a single sound since arriving aside from your own breathing.
            
            (+2 Paranoia)`,
            onChoose: (state, helpers) => {
               state.rooms[RoomEnum.ENTRANCE].hasPonderedAgain = true;
               state.rooms[RoomEnum.ENTRANCE].hasPondered = false;
               helpers.adjustParanoia(2);
            },
         },
         {
            precondition: (state) => Boolean(state.rooms[RoomEnum.ENTRANCE].hasPonderedAgain),
            text: "Inspect the rucksack",
            result: `An ornate spellbook with an odd collection of miscellaneous items: some silver thread, an empty snail shell, a polished black stone, a plant of sorts with a strong sulfuric smell--things that seem to have no relation to one another. Flipping through the spellbook, you stare at the writing and feel an air of familiarity. The writing. It's by your own hand. You don't have a single memory of filling the pages, but somehow you distinctly know that this is your work. A sense of pride wells up in you, though you can't place why.

            As you rifle through the other items, you find a folded piece of parchment tucked at the end. It has rough edges, as though ripped from a larger sheet. It has exactly two words:
            
            "FIND ME"
            
            The handwriting is not your own.
            
            (+Spellbook acquired)`,
            onChoose: (state, helpers) => {
               state.character.hasSpellbook = true;
               helpers.gotoRoom(RoomEnum.FRONT_ROOM);
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
            result:
               "The silence feels like a held breath. More paths will reveal themselves soon...",
            precondition: (state) => !state.rooms[RoomEnum.FRONT_ROOM].hasTakenStock,
            onChoose: (state) => {
               state.rooms[RoomEnum.FRONT_ROOM].hasTakenStock = true;
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
