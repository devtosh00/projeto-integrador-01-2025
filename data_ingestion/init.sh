# #!/bin/bash
# Cria extensão e tabela

psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS vector;
    CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        content TEXT,
        embedding VECTOR(384)
    );
EOSQL

# Roda os scripts Python
# docker exec -it semantic-search-cdc bash -c "python3 src/cdc_pdf_to_text.py && python3 src/ingest_embeddings.py"

python3 /app/src/cdc_pdf_to_text.py
python3 /app/src/ingest_embeddings.py

# # Inicia o PostgreSQL normalmente
#exec docker-entrypoint.sh postgres