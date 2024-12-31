const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios'); // Import axios for making HTTP requests

dotenv.config();

const app = express();
const PORT = 5000;

const Intent = require('./models/Intent');  // Import the schema

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected successfully.");
  })
  .catch(err => console.error("MongoDB connection error:", err));

app.use(cors());
app.use(bodyParser.json());

// Route to process user input and get model response
app.post('/api/predict', async (req, res) => {
  const userInput = req.body.question;
  console.log("User Input:", userInput);

  try {
    // Send POST request to Flask server for intent prediction
    const response = await axios.post('http://localhost:5001/predict_intent', { question: userInput });

    const predictedIntent = response.data.predicted_intent;
    console.log("Predicted Intent:", predictedIntent);
    
    // Fetch the corresponding data from MongoDB based on the predicted intent
    const intentData = await Intent.findOne({ intent: predictedIntent });

    if (intentData) {
      const responseData = intentData.response;
      const type = responseData.type;
      
      // Prepare the response based on the type
      if (type === "definition") {
        res.json({ response: responseData.content });
      } else if (type === "code_example") {
        res.json({
          response: {
            title: responseData.content.title,
            code: responseData.content.code
          }
        });
      } else if (type === "key_features") {
        res.json({ response: responseData.content });
      } else if (type === "frameworks") {
        res.json({ response: responseData });
      } else if (type === "use_cases") {
        res.json({ response: responseData.content });
      } else {
        res.json({ response: "Sorry, I couldn't understand the request." });
      }
    } else {
      res.json({ response: "I'm not sure about that. Can you clarify your question?" });
    }
  } catch (error) {
    console.error('Error predicting intent:', error);
    res.status(500).json({ error: 'Error processing the request' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
