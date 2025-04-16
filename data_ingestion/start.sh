#!/bin/bash

docker build -t semantic-search-cdc . && \
docker rm -f semantic-search-cdc && \
docker run -d \
  --name semantic-search-cdc \
  -p 5432:5432 \
  semantic-search-cdc && \
sleep 10 && \
docker exec -it semantic-search-cdc bash -c "psql --username admin --dbname cdc <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS vector;

    CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        content TEXT,
        embedding VECTOR(384)
    );
EOSQL" && \
docker exec -it semantic-search-cdc bash -c "python3 src/cdc_pdf_to_text.py && python3 src/ingest_embeddings.py"