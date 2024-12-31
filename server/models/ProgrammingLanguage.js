const mongoose = require('mongoose');

// Define a sub-schema for the code example
const codeExampleSchema = new mongoose.Schema({
  title: String,
  code: String
});

// Define the main schema for the programming language data
const programmingLanguageSchema = new mongoose.Schema({
  intent: String,
  questions: [String],
  response: {
    definition: String,
    key_features: [String],
    best_used_for: [String],
    popular_frameworks: [String],
    code_example: codeExampleSchema
  }
});

// Create a model based on the schema
const ProgrammingLanguage = mongoose.model('ProgrammingLanguage', programmingLanguageSchema);

module.exports = ProgrammingLanguage;
