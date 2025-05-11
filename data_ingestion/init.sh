#!/bin/bash
python3 /app/src/cdc_pdf_to_text.py
python3 /app/src/ingest_embeddings.py
docker-entrypoint.sh -c 'shared_buffers=256MB' -c 'max_connections=200'