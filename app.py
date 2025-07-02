from flask import Flask, request, jsonify
from flask_cors import CORS
from pyngrok import ngrok
from transformers import pipeline


emotion_classifier = pipeline(
    "sentiment-analysis",
    model="bhadresh-savani/bert-base-uncased-emotion",
    tokenizer="bhadresh-savani/bert-base-uncased-emotion"
)

label_map = {
    "LABEL_0": "Tristeza",
    "LABEL_1": "Alegría",
    "LABEL_2": "Amor",
    "LABEL_3": "Enojo",
    "LABEL_4": "Miedo",
    "LABEL_5": "Sorpresa"
}

def analyze_text_sentiment(text_paragraph):
    if not text_paragraph or not text_paragraph.strip():
        return {"sentimiento": "neutral", "confianza": 1.0, "mensaje": "Texto de entrada vacío o solo espacios."}
    try:
        results = emotion_classifier(text_paragraph)[0]
        main_sentiment = label_map.get(results["label"], "Desconocido")
        confidence = round(float(results["score"]), 4)
        return {"sentimiento": main_sentiment, "confianza": confidence}
    except Exception as e:
        return {"sentimiento": "error", "confianza": 0.0, "mensaje": f"Error interno del modelo: {e}"}

# --- API Flask ---
app = Flask(__name__)
CORS(app)

@app.route('/analizar', methods=['POST'])
def analizar():
    data = request.get_json()
    text = data.get('texto', '')
    result = analyze_text_sentiment(text)
    return jsonify(result)

# Inicia ngrok y Flask
public_url = ngrok.connect(5000)
print(f" * API pública: {public_url}/analizar")

app.run(port=5000)