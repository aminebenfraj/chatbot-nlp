from flask import Flask, request, jsonify
from model_inference import get_intent_from_question
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

@app.route('/predict_intent', methods=['POST'])
def predict_intent():
    data = request.get_json()
    question = data.get("question", "")
    
    if not question:
        return jsonify({"error": "No question provided"}), 400
    
    try:
        intent = get_intent_from_question(question)
        app.logger.info(f"Question: {question}, Predicted Intent: {intent}")
        return jsonify({"predicted_intent": intent})
    except Exception as e:
        app.logger.error(f"Error predicting intent: {str(e)}")
        return jsonify({"error": "An error occurred while predicting the intent"}), 500

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5001)

