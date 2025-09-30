Personal Finance Anomaly Detector
A full-stack web application that uses machine learning to detect anomalies in personal financial statements, providing users with interactive visualizations and insights into their spending habits.

Live Application: https://personal-finance-anomaly.vercel.app/

(Suggestion: Replace the placeholder above with a real screenshot of your application's dashboard)

🌟 Key Features
ML-Powered Anomaly Detection: Upload a CSV of your bank statement, and the backend uses an IsolationForest model to identify unusual transactions that deviate from your normal spending patterns.

Interactive Data Visualization: An intuitive dashboard displays your financial summary, monthly spending trends (Bar Chart), and spending breakdown by category (Pie Chart).

Secure User Authentication: Users can create an account and log in securely, with authentication managed by Firebase.

Live Financial News Feed: A public homepage displays the latest business and finance news fetched in real-time from a third-party API.

Upload & Analysis History: Every analysis is automatically saved to a Firestore database. A dedicated "History" page allows users to view and reload past analyses without re-uploading files.

Responsive Design: The interface is fully responsive and works seamlessly on both desktop and mobile devices.

🛠️ Tech Stack
This project utilizes a modern, decoupled architecture.

Frontend:

Framework: React (with Vite)

Styling: Tailwind CSS

Charts: Chart.js

Authentication: Firebase Authentication

Database: Firestore

Icons: Lucide React

Backend:

Framework: Python (Flask)

Machine Learning: Scikit-learn (IsolationForest)

Data Handling: Pandas

API Testing: Postman

Deployment:

Version Control: Git & GitHub

Frontend Hosting: Vercel

Backend Hosting: Render

⚙️ Local Setup and Installation
To run this project on your local machine, follow these steps:

Clone the Repository:

git clone [https://github.com/Anirudh-saiA/personal_Finance_Anomaly.git](https://github.com/Anirudh-saiA/personal_Finance_Anomaly.git)
cd personal_finance_anomaly

Backend Setup:

Navigate to the backend folder:

cd backend

Install the required Python packages:

pip install -r requirements.txt

(Optional) If you don't have the .pkl files, run the Jupyter Notebook to train the model:

jupyter notebook Train_New_Model_with_Accuracy.ipynb

Start the Flask server:

python app.py

The backend will be running at http://127.0.0.1:5000.

Frontend Setup:

Open a new terminal and navigate to the frontend folder:

cd frontend

Install the required npm packages:

npm install

Create a .env.local file with your Firebase configuration keys.

Start the Vite development server:

npm run dev

The frontend will be available at http://localhost:5173.
