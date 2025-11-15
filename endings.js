// @ts-check

const EndingEnum = Object.freeze({
   COWARD: "coward",
   MARTYR: "martyr",
   SCHOLAR: "scholar",
   TRICKSTER: "trickster",
   PARADOX: "paradox",
   DREAMER: "dreamer",
   RELUCTANT_HERO: "reluctantHero",
   STARLIGHT: "starlight",
   MIRROR: "mirror",
   HERALD: "herald",
   LINGERING_ECHO: "lingeringEcho",
});

/** @typedef {typeof EndingEnum[keyof typeof EndingEnum]} EndingKey */

/**
 * @typedef {Object} Ending
 * @property {EndingKey} key One of the values from `EndingEnum`.
 * @property {string} title Short label shown in the endings grid.
 * @property {string} description Narrative summary for how the ending was achieved.
 */

/** @type {readonly Ending[]} */
const ALL_ENDINGS = [
   {
      key: EndingEnum.COWARD,
      title: "The Coward",
      description: "Choose to walk away immediately before trying anything else.",
   },
   {
      key: EndingEnum.MARTYR,
      title: "The Martyr",
      description: "You sacrificed your only escape to save a stranger.",
   },
   {
      key: EndingEnum.SCHOLAR,
      title: "The Scholar",
      description: "You catalogued every sigil before the clock chimed midnight.",
   },
   {
      key: EndingEnum.TRICKSTER,
      title: "The Trickster",
      description: "A clever truth turned every accusation back on your accusers.",
   },
   {
      key: EndingEnum.PARADOX,
      title: "The Paradox",
      description: "You met yourself in the hall of doors and both walked away.",
   },
   {
      key: EndingEnum.DREAMER,
      title: "The Dreamer",
      description: "Accepting the unreality freed you from the nightmare loop.",
   },
   {
      key: EndingEnum.RELUCTANT_HERO,
      title: "The Reluctant Hero",
      description: "Despite fear, you stepped forward when no one else would.",
   },
   {
      key: EndingEnum.STARLIGHT,
      title: "The Starlight",
      description: "You followed the constellation cipher into the attic skylight.",
   },
   {
      key: EndingEnum.MIRROR,
      title: "The Mirror",
      description: "You trusted the reflection and became the person looking back.",
   },
   {
      key: EndingEnum.HERALD,
      title: "The Herald",
      description: "You rang the bell three times and summoned the forgotten court.",
   },
   {
      key: EndingEnum.LINGERING_ECHO,
      title: "The Lingering Echo",
      description: "You chose to remain between moments, a caretaker of whispers.",
   },
];

// const endingsBundle = Object.freeze({
//    AllEndings,
//    EndingEnum,
// });

// if (typeof window !== "undefined") {
//    /** @type {Window & typeof globalThis & { EndingsData?: typeof endingsBundle }} */ (
//       window
//    ).EndingsData = endingsBundle;
// }

export { ALL_ENDINGS, EndingEnum };
