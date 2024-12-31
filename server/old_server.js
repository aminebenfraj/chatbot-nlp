const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios'); // Import axios for making HTTP requests

dotenv.config();

const app = express();
const PORT = 5000;

const ProgrammingLanguage = require('./models/ProgrammingLanguage');  // Import the schema

mongoose.connect("mongodb+srv://wesssssssup:xZ0tlpzQFxhnop5e@cluster0.02kfnee.mongodb.net/", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected successfully.");
  })
  .catch(err => console.error("MongoDB connection error:", err));

app.use(cors());
app.use(bodyParser.json());

// Route to process user input and get model response
app.post('/api/predict', async (req, res) => {
  const userInput = req.body.question;
  console.log(userInput);
  
  try {
    // Send POST request to Flask server
    const response = await axios.post('http://localhost:5001/predict_intent', { question: userInput });

    const predictedIntent = response.data.predicted_intent;
    console.log(predictedIntent);
    
    // Fetch the corresponding data from MongoDB
    const responseData = await ProgrammingLanguage.findOne({ intent: predictedIntent });

    if (responseData) {
      res.json({ response: responseData.response });
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
