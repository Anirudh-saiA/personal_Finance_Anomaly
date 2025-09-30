import pickle
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

# --- SETUP ---
app = Flask(__name__)
CORS(app) 

# --- NEWS API CONFIGURATION ---
NEWS_API_KEY = os.environ.get('NEWS_API_KEY', 'ed65784dbb2f4c91a7c96c88f4256edc')
# --- CORRECTED URL: Using a more general query that is more likely to return results on a free plan ---
NEWS_API_URL = f"https://newsapi.org/v2/everything?q=business&language=en&sortBy=publishedAt&apiKey={NEWS_API_KEY}"


# ... (Model loading code remains the same) ...
try:
    with open('personal_finance_model.pkl', 'rb') as model_file:
        model = pickle.load(model_file)
    with open('model_columns.pkl', 'rb') as columns_file:
        model_columns = pickle.load(columns_file)
    print("Model and columns loaded successfully.")
except Exception as e:
    print(f"CRITICAL ERROR: Could not load model or columns file. Error: {e}")
    model = None
    model_columns = None


# --- UPDATED NEWS ROUTE WITH BETTER LOGGING ---
@app.route('/news', methods=['GET'])
def get_news():
    print("\n--- Received a request for /news ---") # New log
    if NEWS_API_KEY == 'YOUR_NEWS_API_KEY_HERE':
        print("ERROR: News API key is not configured.")
        return jsonify({"error": "News API key not configured on the backend"}), 500
    try:
        response = requests.get(NEWS_API_URL)
        
        # --- NEW & IMPORTANT: Log the actual response from News API ---
        print(f"News API response status code: {response.status_code}")
        # We will now print the raw text of the response to see the error message
        print(f"News API response body: {response.text}")
        
        response.raise_for_status() 
        news_data = response.json()
        print("Successfully fetched and sent news articles.")
        return jsonify(news_data.get('articles', []))
    except requests.exceptions.RequestException as e:
        print(f"ERROR: Failed to fetch news from News API. Error: {e}")
        return jsonify({"error": f"Failed to fetch news: {e}"}), 500


# ... (The rest of your app.py file remains exactly the same) ...
def engineer_features(df):
    df_processed = df.copy()
    df_processed['Date'] = pd.to_datetime(df_processed['Date'])
    df_processed['day_of_week'] = df_processed['Date'].dt.dayofweek
    df_processed['day_of_month'] = df_processed['Date'].dt.day
    df_processed['is_weekend'] = (df_processed['Date'].dt.dayofweek >= 5).astype(int)
    df_processed = pd.get_dummies(df_processed, columns=['Category'], prefix='cat')
    df_final = df_processed.reindex(columns=model_columns, fill_value=0)
    return df_final

@app.route('/')
def index():
    return "Backend is running."

@app.route('/process_csv', methods=['POST'])
def process_csv():
    if model is None or model_columns is None:
        return jsonify({"error": "Model not loaded on server."}), 500
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file and file.filename.endswith('.csv'):
        try:
            df = pd.read_csv(file)
            required_columns = ['Date', 'Description', 'Amount', 'Category']
            if not all(col in df.columns for col in required_columns):
                return jsonify({"error": "CSV is missing required columns."}), 400

            features_for_prediction = engineer_features(df)
            predictions = model.predict(features_for_prediction)
            df['is_anomaly'] = [1 if p == -1 else 0 for p in predictions]

            df['Amount'] = pd.to_numeric(df['Amount'], errors='coerce').fillna(0)
            
            expenses_df = df[df['Amount'] < 0].copy()
            expenses_df['Amount'] = expenses_df['Amount'].abs()
            
            category_averages = expenses_df.groupby('Category')['Amount'].mean().to_dict()
            category_spending = expenses_df.groupby('Category')['Amount'].sum().to_dict()
            df['month'] = pd.to_datetime(df['Date']).dt.month_name()
            monthly_spending = expenses_df.groupby('month')['Amount'].sum().to_dict()

            total_expenses = df[df['Amount'] < 0]['Amount'].abs().sum()
            total_income = df[df['Amount'] > 0]['Amount'].sum()
            balance = total_income - total_expenses
            anomalies_found = df['is_anomaly'].sum()
            
            return jsonify({
                "transactions": df.to_dict(orient='records'),
                "summary": {
                    "anomalies_found": int(anomalies_found),
                    "total_income": float(total_income),
                    "total_expenses": float(total_expenses),
                    "balance": float(balance)
                },
                "charts_data": { "category_spending": category_spending, "monthly_spending": monthly_spending },
                "analysis": { "category_averages": category_averages }
            })
        except Exception as e:
            return jsonify({"error": f"An error occurred during processing: {str(e)}"}), 500
    return jsonify({"error": "Invalid file type."}), 400

if __name__ == '__main__':
    app.run(port=5000, debug=True)

