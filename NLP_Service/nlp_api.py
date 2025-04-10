from flask import Flask, request, jsonify
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allows requests from your Node.js backend

analyzer = SentimentIntensityAnalyzer()

@app.route('/analyze', methods=['POST'])

def analyze_sentiment():
    data = request.get_json()  # Ensure JSON parsing
    print("Received Data:", data)  # Debugging line

    text = data.get('text') or data.get('review')  # Accept both "text" and "review"

    if not text:
        print("Error: No Text Provided!")  # Debugging line
        return jsonify({'error': 'No Text Provided!'}), 400

    sentiment_score = analyzer.polarity_scores(text)['compound']
    return jsonify({'sentiment_score': sentiment_score})

if __name__ == '__main__':
    app.run(debug=True, port=5001)