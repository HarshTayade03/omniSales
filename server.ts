import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import * as dfd from "danfojs-node";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import * as ss from "simple-statistics";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ dest: "uploads/" });

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory store for the current dataset
  let currentData: any = null;

  // API Routes
  app.post("/api/upload", upload.single("file"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const filePath = req.file.path;
      let df;

      if (req.file.originalname.endsWith(".csv")) {
        df = await dfd.readCSV(filePath);
      } else if (req.file.originalname.endsWith(".xlsx")) {
        df = await dfd.readExcel(filePath);
      } else {
        return res.status(400).json({ error: "Unsupported file format" });
      }

      // Basic cleaning
      df = df.dropNa();
      
      currentData = df;
      
      // Return preview
      const preview = dfd.toJSON(df.head(10));
      const columns = df.columns;
      const shape = df.shape;

      res.json({ 
        message: "File uploaded successfully", 
        preview, 
        columns, 
        shape,
        filename: req.file.originalname
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analyze", async (req, res) => {
    try {
      if (!currentData) {
        return res.status(400).json({ error: "No data uploaded" });
      }

      const df = currentData;
      const stats = dfd.toJSON(df.describe());
      const columns = df.columns;
      
      // Try to identify date and sales columns
      const dateCol = columns.find((c: string) => c.toLowerCase().includes("date") || c.toLowerCase().includes("time"));
      const salesCol = columns.find((c: string) => c.toLowerCase().includes("sales") || c.toLowerCase().includes("revenue") || c.toLowerCase().includes("amount"));

      res.json({ stats, dateCol, salesCol, columns });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/forecast", async (req, res) => {
    try {
      if (!currentData) {
        return res.status(400).json({ error: "No data uploaded" });
      }

      const { horizon = 30, dateCol, salesCol } = req.body;
      
      if (!dateCol || !salesCol) {
        return res.status(400).json({ error: "Date and Sales columns must be specified" });
      }

      const df = currentData;
      // Sort by date
      const sortedDf = df.sortValues(dateCol);
      
      const salesValues = sortedDf[salesCol].values.map(Number);
      const dates = sortedDf[dateCol].values;

      // Simple linear regression for forecast
      const x = salesValues.map((_: any, i: number) => i);
      const regressionLine = ss.linearRegression(x.map((val, i) => [val, salesValues[i]]));
      const regressionFunc = ss.linearRegressionLine(regressionLine);

      // Prepare data for Recharts
      const chartData = dates.map((d: any, i: number) => ({
        date: d,
        actual: salesValues[i],
        forecast: Math.max(0, Math.round(regressionFunc(i)))
      }));

      // Add future forecast
      const lastDate = new Date(dates[dates.length - 1]);
      for (let i = 1; i <= horizon; i++) {
        const futureDate = new Date(lastDate);
        futureDate.setDate(lastDate.getDate() + i);
        chartData.push({
          date: futureDate.toISOString().split('T')[0],
          forecast: Math.max(0, Math.round(regressionFunc(dates.length + i)))
        });
      }

      res.json({ chartData });
    } catch (error: any) {
      console.error("Forecast error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai-insights", async (req, res) => {
    try {
      const { dataSummary } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

      const prompt = `
        As a Retail Analytics Expert, analyze the following sales data summary and provide:
        1. Key Trends (Seasonality, Growth)
        2. Anomalies or Patterns
        3. 3-5 Actionable Business Recommendations
        4. A brief forecast outlook.

        Data Summary:
        ${JSON.stringify(dataSummary)}

        Format the response as JSON with keys: "trends", "anomalies", "recommendations" (array), "outlook".
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });
      
      const text = response.text || "{}";
      
      // Clean JSON from markdown if needed
      const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
      res.json(JSON.parse(jsonStr));
    } catch (error: any) {
      console.error("AI Insights error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
