from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import pickle

# Load the trained model and tokenizer
model_path = "./old_model"
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSequenceClassification.from_pretrained(model_path)

# Load label mappings
with open(f'{model_path}/label_mappings.pkl', 'rb') as f:
    label_mappings = pickle.load(f)
    id_to_label = label_mappings['id_to_label']

def get_intent_from_question(question):
    inputs = tokenizer(question, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
    predicted_label = torch.argmax(outputs.logits, dim=-1).item()
    
    # Check for prediction confidence
    softmax_probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
    max_prob = torch.max(softmax_probs).item()
    
    # If the confidence is below a certain threshold, respond with fallback
    if max_prob < 0.5:  # Set a confidence threshold
        return "I'm not sure about that. Can you clarify your question?"
    
    # Return the predicted intent
    return id_to_label[predicted_label]

