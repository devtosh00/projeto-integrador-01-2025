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
        host=os.environ.get("DB_HOST", "localhost"),
        database=os.environ.get("DB_NAME", "cdc"),
        user=os.environ.get("DB_USER", "admin"),
        password=os.environ.get("DB_PASSWORD", "admin")
    )
cur = conn.cursor()
    
# conn = psycopg2.connect(
#     dbname="db",
#     user="admin",
#     password="admin",
#     host="localhost"
# )

# Insert data
for text, emb in zip(paragraphs, embeddings):
    emb_str = "[" + ",".join(map(str, emb)) + "]"
    cur.execute("INSERT INTO documents (content, embedding) VALUES (%s, %s)", (text, emb_str))

conn.commit()
cur.close()
conn.close()
