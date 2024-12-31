import json
from sklearn.model_selection import train_test_split
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
from datasets import Dataset
import torch
import pickle

# 1. Load Dataset
with open("./programming_languages.json", "r") as file:
    data = json.load(file)

questions = []
labels = []

# Prepare questions and labels
for item in data["programming_languages"]:
    intent = item["intent"]
    for question in item["questions"]:
        questions.append(question)
        labels.append(intent)

# 2. Tokenization and Dataset Creation
tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")

def preprocess(examples):
    return tokenizer(examples["text"], truncation=True, padding=True)

# Convert to Dataset format
dataset = Dataset.from_dict({"text": questions, "label": labels})
label_to_id = {label: idx for idx, label in enumerate(set(labels))}
id_to_label = {idx: label for label, idx in label_to_id.items()}
dataset = dataset.map(lambda x: {"label": label_to_id[x["label"]]})

# Train-test split
dataset = dataset.train_test_split(test_size=0.2)

# Tokenize Dataset
tokenized_datasets = dataset.map(preprocess, batched=True)

# 3. Load Model
model = AutoModelForSequenceClassification.from_pretrained(
    "distilbert-base-uncased", 
    num_labels=len(label_to_id)
)

# 4. Train the Model
training_args = TrainingArguments(
    output_dir="./old_results",
    evaluation_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=16,
    num_train_epochs=30,
    weight_decay=0.01,
    save_total_limit=1,
    save_strategy="epoch",
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets["train"],
    eval_dataset=tokenized_datasets["test"],
    tokenizer=tokenizer
)

trainer.train()

# Save the model and tokenizer to the './model' directory
model.save_pretrained('./old_model')
tokenizer.save_pretrained('./old_model')

# Save label mappings
with open('./old_model/label_mappings.pkl', 'wb') as f:
    pickle.dump({'label_to_id': label_to_id, 'id_to_label': id_to_label}, f)

print("Model, tokenizer, and label mappings saved to './old_model'")

