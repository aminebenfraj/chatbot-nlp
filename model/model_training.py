import json
from sklearn.model_selection import train_test_split
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
from datasets import Dataset
import torch
import pickle
from sklearn.metrics import accuracy_score, precision_recall_fscore_support

# 1. Load Dataset
with open("./programminglanguages.json", "r") as file:
    data = json.load(file)

questions = []
labels = []

# Prepare questions and labels for different intents
for item in data:
    language = item["intent"].split("_")[0]
    response = item["response"]
    
    intents = {
        f"{language}_definition": response["definition"],
        f"{language}_code_example": response["code_example"]["code"],
        f"{language}_key_features": response["key_features"],
        f"{language}_frameworks": response["popular_frameworks"],
        f"{language}_use_cases": response["best_used_for"]
    }
    
    # Example questions for each intent type (with added diversity)
    base_questions = {
        "definition": [
            f"What is {language.capitalize()}?", f"Can you define {language.capitalize()}?", 
            f"Explain {language.capitalize()}.", f"Give me an overview of {language.capitalize()}.",
            f"How would you describe {language.capitalize()}?", f"What does {language.capitalize()} mean?",
            f"Tell me about {language.capitalize()}.", f"Why is {language.capitalize()} important?", 
            f"Can you summarize {language.capitalize()}?", f"Give me a brief introduction to {language.capitalize()}.",
            f"What are the basics of {language.capitalize()}?", f"What is the concept behind {language.capitalize()}?",
            f"Why is {language.capitalize()} popular?", f"Can you describe the core idea of {language.capitalize()}?"
        ],
        "code_example": [
            f"Show me a code example for {language.capitalize()}",
            f"Can you provide a {language.capitalize()} code snippet?",
            f"Give me a sample code for {language.capitalize()}.",
            f"Can you write a basic {language.capitalize()} example?",
            f"Show me a simple program in {language.capitalize()}",
            f"Can you write a {language.capitalize()} function?",
            f"How does a {language.capitalize()} program look?",
            f"Provide a basic {language.capitalize()} code snippet",
            f"Give me a short {language.capitalize()} example",
            f"How would you write a hello world program in {language.capitalize()}?",
            f"Write a {language.capitalize()} program that does X",
            f"Show me an example of {language.capitalize()} with Y feature"
        ],
        "key_features": [
            f"What are the key features of {language.capitalize()}?",
            f"What makes {language.capitalize()} unique?",
            f"What are the main characteristics of {language.capitalize()}?",
            f"Why is {language.capitalize()} different from other languages?",
            f"Tell me about {language.capitalize()}'s important features.",
            f"How is {language.capitalize()} designed to be efficient?",
            f"What are the standout features of {language.capitalize()}?",
            f"What are some cool features of {language.capitalize()}?",
            f"Why should I choose {language.capitalize()} over other languages?",
            f"What are the advantages of using {language.capitalize()}?",
            f"How does {language.capitalize()} simplify coding?",
            f"Why is {language.capitalize()} considered modern?",
            f"Which key features are missing in {language.capitalize()}?"
        ],
        "frameworks": [
            f"What frameworks are used with {language.capitalize()}?",
            f"Which libraries are popular in {language.capitalize()}?",
            f"Can you list some {language.capitalize()} frameworks?",
            f"What are the most common frameworks for {language.capitalize()}?",
            f"Can you name some tools and frameworks for {language.capitalize()}?",
            f"What are the most useful libraries in {language.capitalize()}?",
            f"Which frameworks should I learn for {language.capitalize()}?",
            f"What is the best framework to use with {language.capitalize()}?",
            f"How do {language.capitalize()} frameworks help developers?",
            f"Which frameworks are ideal for {language.capitalize()} web development?",
            f"What tools can I use when working with {language.capitalize()}?",
            f"Can you name a few popular {language.capitalize()} libraries?"
        ],
        "use_cases": [
            f"What can I build with {language.capitalize()}?",
            f"What is {language.capitalize()} best used for?",
            f"Where is {language.capitalize()} commonly used?",
            f"Can {language.capitalize()} be used for web development?",
            f"What industries use {language.capitalize()}?",
            f"What are some real-world applications of {language.capitalize()}?",
            f"How is {language.capitalize()} used in the tech industry?",
            f"In which projects is {language.capitalize()} most effective?",
            f"What are some common projects built with {language.capitalize()}?",
            f"How is {language.capitalize()} applied in data science?",
            f"What type of software can I build using {language.capitalize()}?",
            f"What are some real-world examples of {language.capitalize()} in action?"
        ]
    }

    # Add questions and corresponding labels
    for intent, label in intents.items():
        intent_type = intent.split("_")[1]
        if intent_type in base_questions:
            questions.extend(base_questions[intent_type])
            labels.extend([intent] * len(base_questions[intent_type]))

# 2. Tokenization and Dataset Creation
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")  # Use a larger model for better results

def preprocess(examples):
    return tokenizer(examples["text"], truncation=True, padding=True, max_length=None)  # Dynamic padding

# Convert to Dataset format
dataset = Dataset.from_dict({"text": questions, "label": labels})
label_to_id = {label: idx for idx, label in enumerate(set(labels))}
id_to_label = {idx: label for label, idx in label_to_id.items()}

# Map labels to IDs
dataset = dataset.map(lambda x: {"label": label_to_id[x["label"]]})

# Train-test split
dataset = dataset.train_test_split(test_size=0.2)

# Tokenize Dataset
tokenized_datasets = dataset.map(preprocess, batched=True)

# 3. Load Model
model = AutoModelForSequenceClassification.from_pretrained(
    "bert-base-uncased", 
    num_labels=len(label_to_id)
)

# 4. Train the Model
training_args = TrainingArguments(
    output_dir="./results",
    evaluation_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=16,
    num_train_epochs=60,  # Increased number of epochs
    weight_decay=0.01,
    save_total_limit=1,
    save_strategy="epoch",
    logging_dir='./logs',
    logging_steps=500,
    load_best_model_at_end=True,
    metric_for_best_model="eval_loss",  # Change this to "eval_loss" or another valid metric
)

# Define a compute_metrics function to calculate accuracy and other metrics
def compute_metrics(p):
    predictions, labels = p
    preds = predictions.argmax(axis=1)
    
    # Compute precision, recall, and F1-score
    precision, recall, f1, _ = precision_recall_fscore_support(labels, preds, average='weighted')
    accuracy = accuracy_score(labels, preds)
    
    return {"accuracy": accuracy, "precision": precision, "recall": recall, "f1": f1}

# Update Trainer with compute_metrics
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets["train"],
    eval_dataset=tokenized_datasets["test"],
    tokenizer=tokenizer,
    compute_metrics=compute_metrics  # Add this line to track accuracy and other metrics
)

trainer.train()

# Save the model and tokenizer to the './model' directory
model.save_pretrained('./model')
tokenizer.save_pretrained('./model')

# Save label mappings
with open('./model/label_mappings.pkl', 'wb') as f:
    pickle.dump({'label_to_id': label_to_id, 'id_to_label': id_to_label}, f)

print("Model, tokenizer, and label mappings saved to './model'")
