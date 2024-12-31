from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import pickle

# Load the trained model and tokenizer
model_path = "./model"  # Path to the saved model directory
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSequenceClassification.from_pretrained(model_path)

# Load label mappings (from the saved pickle file)
with open(f'{model_path}/label_mappings.pkl', 'rb') as f:
    label_mappings = pickle.load(f)
    id_to_label = label_mappings['id_to_label']

def get_intent_from_question(question):
    # Tokenize the input question with dynamic padding
    inputs = tokenizer(question, return_tensors="pt", truncation=True, padding=True)
    
    # Ensure we're using the model in evaluation mode (no gradients)
    model.eval()
    
    with torch.no_grad():
        # Get model outputs (logits)
        outputs = model(**inputs)
    
    # Get the predicted label (the one with the highest logit)
    predicted_label = torch.argmax(outputs.logits, dim=-1).item()
    
    # Calculate prediction confidence using softmax
    softmax_probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
    max_prob = torch.max(softmax_probs).item()
    
    # If the confidence is below a certain threshold, respond with a fallback message
    if max_prob < 0.6:  # You can adjust this threshold for better confidence
        return "I'm not sure about that. Can you clarify your question?"
    
    # Return the predicted intent based on the id_to_label mapping
    return id_to_label[predicted_label]

# Example usage
question = "What is Python?"
predicted_intent = get_intent_from_question(question)
print(f"Predicted Intent: {predicted_intent}")
