const EndingEnum = Object.freeze({
   COWARD: "coward",
});

const AllEndings = [
   {
      key: EndingEnum.COWARD,
      title: "The Coward",
      description: "Choose to walk away immediately before trying anything else.",
   },
];

// Just for type validating
for (const ending of AllEndings) {
   const keys = Object.keys();
   if (!keys.includes("key") || !keys.includes("title") || !keys.includes("description")) {
      throw new Error(`Ending is missing required fields: ${JSON.stringify(ending)}`);
   }
}

export default EndingEnum;
