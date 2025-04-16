# Semantic Search over Brazil's Código de Defesa do Consumidor (CDC)

## Project Structure

```

├── Dockerfile
├── init.sh
├── src
│   ├── ingest_embeddings.py
│   └── cdc_pdf_to_text.py
├── Tests.ipynb
├── start.sh
├── CDC.pdf
├── requirements.txt
└── README.md
```

## Setup Instructions

1. **Initialize application**
   Build the image using the following command:
   ```bash
   ./start.sh
   ```

3. **Run Test Jupyter Notebook**

   Open the Tests.ipynb and run both tests (local and Postgres)