const mongoose = require('mongoose');


// Main schema for intent data with flexible response types
const intentSchema = new mongoose.Schema({
  intent: { type: String, required: true },
  questions: [{ type: String, required: true }],
  response: {
    type: {
      type: String, // e.g., 'definition', 'code_example', 'frameworks', etc.
      required: true
    },
    content: mongoose.Schema.Types.Mixed // Can be String, Array, or Object (for flexibility)
  }
});

// Create the model based on the schema
const Intent = mongoose.model('Intent', intentSchema);

module.exports = Intent;
