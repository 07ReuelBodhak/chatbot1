const { NlpManager } = require("node-nlp");
const fs = require("fs");

const intents = require("./intents.json");
console.log(intents);

const manager = new NlpManager({ languages: ["en"] });

intents.intents.forEach((intent) => {
  intent.patterns.forEach((pattern) => {
    manager.addDocument("en", pattern, intent.tag);
  });
});

async function trainModel() {
  try {
    await manager.train();
  } catch (error) {
    console.error("Error training model:", error);
  }
}
trainModel();

async function processMessage(message) {
  const response = await manager.process("en", message);
  return response;
}

function handleResponse(intent) {
  const matchedIntent = intents.intents.find((item) => item.tag === intent);
  if (matchedIntent) {
    const response =
      matchedIntent.responses[
        Math.floor(Math.random() * matchedIntent.responses.length)
      ];
    return response;
  } else {
    return "Sorry, I'm not sure how to respond to that.";
  }
}

module.exports = {
  trainModel,
  processMessage,
  handleResponse,
};
