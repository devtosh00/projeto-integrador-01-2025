import os
import psycopg2
from sentence_transformers import SentenceTransformer, util

# Load SBERT model
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

paragraphs = []

with open("CDC.txt", "r", encoding="utf-8") as f:
    paragraphs = f.read().split("\n")

# Embed
embeddings = model.encode(paragraphs)

# Connect to DB
conn = psycopg2.connect(
    dbname="cdc",
    user="admin",
    password="admin",
    host="localhost"
)
cur = conn.cursor()

# Insert data
for text, emb in zip(paragraphs, embeddings):
    emb_str = "[" + ",".join(map(str, emb)) + "]"
    cur.execute("INSERT INTO documents (content, embedding) VALUES (%s, %s)", (text, emb_str))

conn.commit()
cur.close()
conn.close()
