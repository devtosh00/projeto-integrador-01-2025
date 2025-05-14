from flask import Flask, request, jsonify
import os
import psycopg2
from parserJSON import JSONParser
from flask_cors import CORS
from flask import send_from_directory
from sentence_transformers import SentenceTransformer

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False
CORS(app, origins=["http://127.0.0.1:8080", "http://localhost:8080"])
# Load SBERT model
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

def get_db_connection():
    conn = psycopg2.connect(
        host=os.environ.get("DB_HOST", "127.0.0.1"),
        database=os.environ.get("DB_NAME", "cdc"),
        user=os.environ.get("DB_USER", "admin"),
        password=os.environ.get("DB_PASSWORD", "admin")
    )
    return conn

# Connect to database
conn = get_db_connection()

@app.route('/')
def home():
    return jsonify({"message": "Bem-vindo à API do CDC!"})

@app.route('/cdc-pdf')
def serve_pdf():
    return send_from_directory('/app', 'CDC.pdf')

@app.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "API funcionando!"})

@app.route('/query', methods=['POST'])
def query():
    try:
        # Parse the incoming request
        data = request.get_json()
        query = JSONParser.parse_request(data)['content']

        cur = conn.cursor()
        
        """
        # Execute query using the parsed data
        cur.execute(
            "SELECT * FROM documents WHERE content ILIKE %s LIMIT %s OFFSET %s", 
            (f"%{parsed_data['content']}%", parsed_data['limit'], parsed_data['offset'])
        )
        results = cur.fetchall()
        cur.close()
        conn.close()
        """
        
        # Embed query
        query_embedding = model.encode(query)

        query_vector = query_embedding.tolist()  # Convert the numpy array to a list
        sql = """
        SELECT id, content, embedding <=> %s::vector AS distance
        FROM documents
        ORDER BY distance ASC
        LIMIT 10;
        """
        cur.execute(sql, (query_vector,))

        # Fetch and print the results
        results = cur.fetchall()
        
        # Format the response
        return jsonify(JSONParser.format_response(results))
    except ValueError as e:
        return jsonify(JSONParser.format_error(str(e))), 400
    except Exception as e:
        return jsonify(JSONParser.format_error(f"Server error: {str(e)}", 500)), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)