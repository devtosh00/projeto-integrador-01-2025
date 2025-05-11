# Semantic Search sobre o Código de Defesa do Consumidor (CDC)

Este projeto implementa uma API e frontend para busca semântica e textual sobre o **Código de Defesa do Consumidor (CDC)** brasileiro. O backend utiliza Python/Flask e PostgreSQL com extensão pgvector, permitindo buscas eficientes em trechos do CDC extraídos de um PDF oficial.

---

## Estrutura de Pastas

```
projeto-integrador-01-2025/
├── back-end/
│   ├── api.py
│   ├── requirements.txt
│   └── parserJSON.py
├── data_ingestion/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── CDC.pdf
│   ├── src/
│   │   ├── cdc_pdf_to_text.py
│   │   └── ingest_embeddings.py
│   ├── init.sh
│   └── start.sh
├── front/
│   └── ... (arquivos do frontend)
├── docker-compose.yml
```

---

## Como rodar o projeto

### 1. **Clone o repositório**

```sh
git clone https://github.com/seu-usuario/projeto-integrador-01-2025.git
cd projeto-integrador-01-2025
```

### 2. **Build e subida dos containers**

```sh
docker-compose up --build
```

Isso irá:
- Construir o banco de dados PostgreSQL com pgvector e popular a tabela `documents` a partir do PDF.
- Subir o backend Flask na porta 5000.
- Subir o frontend (Nginx) na porta 8080.

### 3. **Testando a API**

#### Teste rápido do endpoint `/test`:

```sh
curl http://localhost:5000/test
```

#### Exemplo de busca no endpoint `/query` (via Postman ou curl):

```json
POST http://localhost:5000/query
Content-Type: application/json

{
  "content": "direito de arrependimento",
  "limit": 10,
  "offset": 0
}
```

#### Para visualizar o PDF original:

Acesse [http://localhost:5000/cdc-pdf](http://localhost:5000/cdc-pdf) no navegador.

---

## Observações

- O banco de dados é populado automaticamente a partir do PDF `CDC.pdf` na primeira execução.
- Se quiser resetar o banco, basta rodar:
  ```sh
  docker-compose down -v
  docker-compose up --build
  ```
- O frontend pode ser acessado em [http://localhost:8080](http://localhost:8080).

---

## Licença

MIT