# RetailPulse AI - Sales Forecasting & Analytics

RetailPulse AI is a production-ready end-to-end web application designed for retail sales forecasting and data analysis. It leverages machine learning and AI to provide actionable insights from your sales data.

## 🚀 Features

- **Automated Data Processing**: Upload CSV or Excel files, and the system automatically detects schema, identifies key columns, and cleans the data.
- **Advanced Forecasting**: Uses statistical regression and AI to project future sales trends.
- **AI-Powered Insights**: Powered by Gemini 2.0 Flash to generate human-readable trends, anomaly detection, and business recommendations.
- **Interactive Dashboard**: Real-time visualizations using Recharts and a modern, responsive UI built with React and Tailwind CSS.
- **Sample Data**: Includes a sample retail dataset to get you started immediately.

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, Shadcn UI, Recharts, Framer Motion.
- **Backend**: Express (Node.js), Danfo.js (Pandas for JS), Simple-Statistics.
- **AI/ML**: Google Gemini API for advanced analytics and recommendations.

## 📦 Setup & Installation

### Prerequisites
- Node.js (v18+)
- Gemini API Key (configured in AI Studio)

### Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

3. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

## 📊 Example Dataset Format

Your dataset should ideally include the following columns:
- `Date`: The date of the transaction (YYYY-MM-DD).
- `Sales`: The revenue or sales amount.
- `Category`: (Optional) Product category for distribution analysis.
- `Store`: (Optional) Store location or ID.

Example:
```csv
Date,Store,Product,Category,Sales,Quantity,Promotion,Price
2023-01-01,Store_A,Product_1,Electronics,1200,5,No,240
2023-01-02,Store_A,Product_1,Electronics,1500,6,No,250
```

## 🤖 AI Insights Engine

The application uses the Gemini 2.0 Flash model to analyze your data summary. It provides:
- **Trend Analysis**: Identifies growth patterns and seasonality.
- **Anomaly Detection**: Spots unusual dips or spikes in sales.
- **Business Recommendations**: Suggests inventory optimization, promotion timing, and pricing strategies.

---
Built with ❤️ using Google AI Studio.
