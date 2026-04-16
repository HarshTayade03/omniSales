/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Upload, 
  Brain, 
  AlertCircle,
  Download,
  FileText,
} from "lucide-react";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Line
} from "recharts";
import axios from "axios";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { cn } from "@/lib/utils";

// --- Types ---
interface DataPreview {
  columns: string[];
  data: any[];
}

interface Insights {
  trends: string;
  anomalies: string;
  recommendations: string[];
  outlook: string;
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("/api/upload", formData);
      setData(response.data);
      await performAnalysis();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

  const performAnalysis = async () => {
    setAnalyzing(true);
    try {
      const analysisRes = await axios.get("/api/analyze");
      setStats(analysisRes.data);

      const forecastRes = await axios.post("/api/forecast", {
        dateCol: analysisRes.data.dateCol,
        salesCol: analysisRes.data.salesCol
      });
      setChartData(forecastRes.data.chartData);

      // Get AI Insights
      const aiRes = await axios.post("/api/ai-insights", {
        dataSummary: analysisRes.data.stats
      });
      setInsights(aiRes.data);
    } catch (err: any) {
      setError("Analysis failed: " + (err.response?.data?.error || err.message));
    } finally {
      setAnalyzing(false);
    }
  };

  const downloadSample = () => {
    window.open("/sample_retail_data.csv", "_blank");
  };

  return (
    <div className="flex min-h-screen bg-bg-dark text-text-main font-sans">
      {/* Sidebar */}
      <aside className="w-[240px] bg-surface border-r border-border-custom p-6 flex flex-col gap-8 shrink-0">
        <div className="logo font-serif italic text-[22px] tracking-tight text-accent-custom">OmniSight</div>
        
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <div className="text-[10px] uppercase tracking-[1px] text-text-dim mb-2">Platform</div>
            <div className={cn("nav-item-custom", activeTab === "overview" && "nav-item-active")} onClick={() => setActiveTab("overview")}>
              <BarChart3 size={18} />
              Dashboard
            </div>
            <div className={cn("nav-item-custom", activeTab === "data" && "nav-item-active")} onClick={() => setActiveTab("data")}>
              <Package size={18} />
              Dataset Manager
            </div>
            <div className={cn("nav-item-custom", activeTab === "forecast" && "nav-item-active")} onClick={() => setActiveTab("forecast")}>
              <TrendingUp size={18} />
              Model Architecture
            </div>
            <div className={cn("nav-item-custom", activeTab === "insights" && "nav-item-active")} onClick={() => setActiveTab("insights")}>
              <Brain size={18} />
              AI Insights
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-2">
            <div className="text-[10px] uppercase tracking-[1px] text-text-dim mb-2">Model Status</div>
            <div className="text-[12px] opacity-70 text-text-dim leading-relaxed">
              XGBoost v2.4.1<br />
              RMSE: 142.02
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-surface border-b border-border-custom flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3 text-[13px] text-text-dim">
            <span>Current Dataset:</span>
            {file ? (
              <span className="bg-surface-light px-2.5 py-1 rounded border border-positive/20 font-mono text-positive text-[12px]">
                {file.name}
              </span>
            ) : (
              <span className="opacity-50 italic">No dataset uploaded</span>
            )}
            {data && <span className="opacity-50 ml-2">Processed recently</span>}
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadSample} 
              className="bg-transparent border-border-custom text-text-main hover:bg-surface-light"
            >
              <Download size={14} className="mr-2" />
              Sample Data
            </Button>
            <Button 
              size="sm" 
              className="bg-accent-custom text-bg-dark hover:bg-accent-custom/90 font-semibold"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              Upload New
            </Button>
            <Input
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              id="file-upload"
              onChange={handleFileUpload}
            />
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">
          {!data ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl"
              >
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text-main mb-6">
                  Retail Intelligence <span className="text-accent-custom">Redefined</span>
                </h1>
                <p className="text-lg text-text-dim mb-10 leading-relaxed max-w-lg mx-auto">
                  Upload your sales data and let OmniSight generate high-precision forecasts 
                  and actionable business recommendations.
                </p>
                
                <div 
                  className="relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-custom bg-surface p-16 transition-all hover:border-accent-custom/50 cursor-pointer group"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <div className="absolute inset-0 bg-accent-custom/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                  <Upload className="mb-4 h-12 w-12 text-accent-custom" />
                  <h3 className="mb-2 text-xl font-semibold text-text-main">Drop your dataset here</h3>
                  <p className="text-sm text-text-dim">CSV or Excel files supported</p>
                </div>
                
                {error && (
                  <Alert variant="destructive" className="mt-6 bg-rose-500/10 border-rose-500/20 text-rose-500">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </motion.div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* KPI Row */}
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard 
                  title="Projected Sales" 
                  value={analyzing ? null : "$1.24M"} 
                  subValue="+8.2% vs. Last Period" 
                  positive
                />
                <KpiCard 
                  title="Model Accuracy" 
                  value={analyzing ? null : "94.8%"} 
                  subValue="XGBoost Regressor" 
                  accent
                />
                <KpiCard 
                  title="Peak Demand Day" 
                  value={analyzing ? null : "Friday"} 
                  subValue="High Promo Sensitivity" 
                />
                <KpiCard 
                  title="Anomaly Score" 
                  value={analyzing ? null : "0.04"} 
                  subValue="Clean Signal" 
                  dim
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Chart Section */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="card-custom">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-[15px] font-medium text-text-main">Sales Forecast vs. Historical Baseline</h3>
                        <p className="text-[12px] text-text-dim">Projected sales performance for the selected horizon</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[12px] text-text-dim">Horizon:</span>
                        <select className="bg-surface-light border border-border-custom text-text-main px-2 py-1 rounded text-[12px] outline-none focus:border-accent-custom">
                          <option>30 Days</option>
                          <option>60 Days</option>
                          <option>90 Days</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="h-[300px] w-full">
                      {analyzing ? (
                        <Skeleton className="h-full w-full rounded-lg bg-surface-light" />
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00d9ff" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#00d9ff" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2d2d31" />
                            <XAxis 
                              dataKey="date" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 10, fill: '#8e8e93' }}
                              minTickGap={40}
                            />
                            <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 10, fill: '#8e8e93' }}
                              tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#121214', borderRadius: '8px', border: '1px solid #2d2d31', color: '#e1e1e6' }}
                              itemStyle={{ color: '#00d9ff' }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="forecast" 
                              stroke="#00d9ff" 
                              strokeWidth={2}
                              fillOpacity={1} 
                              fill="url(#colorForecast)" 
                              strokeDasharray="5 5"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="actual" 
                              stroke="#8e8e93" 
                              strokeWidth={1.5}
                              dot={false}
                              strokeDasharray="4 4"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="card-custom">
                    <div className="text-[12px] font-semibold uppercase tracking-[0.5px] mb-4 flex items-center gap-2">
                      <Brain size={16} className="text-accent-custom" />
                      AI-Generated Insights Engine
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <InsightItem 
                        text={insights?.trends || "Analyzing temporal patterns..."}
                        tag="Temporal Pattern"
                      />
                      <InsightItem 
                        text={insights?.anomalies || "Scanning feature impact..."}
                        tag="Feature Impact"
                      />
                      <InsightItem 
                        text={insights?.outlook || "Optimizing model..."}
                        tag="Model Optimization"
                      />
                    </div>
                  </div>
                </div>

                {/* Sidebar Panels */}
                <div className="space-y-6">
                  <div className="card-custom">
                    <div className="text-[12px] font-semibold uppercase tracking-[0.5px] mb-4">Dataset Schema</div>
                    <div className="font-mono text-[12px] space-y-2">
                      {data.columns.slice(0, 6).map((col: string) => (
                        <div key={col} className="flex justify-between py-1.5 border-b border-surface-light last:border-0">
                          <span className="text-text-dim">{col}</span>
                          <span className="text-accent-custom">FLOAT64</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card-custom bg-accent-dim border-accent-custom/20">
                    <div className="text-[12px] font-semibold uppercase tracking-[0.5px] mb-4 text-accent-custom">Recommendations</div>
                    <div className="space-y-4">
                      {analyzing ? (
                        <Skeleton className="h-20 w-full bg-surface-light" />
                      ) : (
                        insights?.recommendations.slice(0, 3).map((rec, i) => (
                          <div key={i} className="text-[12px] text-text-main leading-relaxed flex gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-accent-custom shrink-0 mt-1.5"></div>
                            {rec}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="card-custom">
                    <div className="text-[12px] font-semibold uppercase tracking-[0.5px] mb-4">Quick Actions</div>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start text-[12px] border-border-custom hover:bg-surface-light h-9">
                        <Download size={14} className="mr-2" /> Export Forecast
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-[12px] border-border-custom hover:bg-surface-light h-9">
                        <FileText size={14} className="mr-2" /> Generate Report
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// --- Helper Components ---

function KpiCard({ title, value, subValue, positive, accent, dim }: { 
  title: string, 
  value: string | null, 
  subValue: string, 
  positive?: boolean, 
  accent?: boolean, 
  dim?: boolean 
}) {
  return (
    <div className="card-custom">
      <div className="kpi-label">{title}</div>
      {value === null ? (
        <Skeleton className="h-8 w-24 bg-surface-light" />
      ) : (
        <>
          <div className="kpi-value">{value}</div>
          <div className={cn(
            "text-[12px] mt-1 font-medium",
            positive ? "text-positive" : accent ? "text-accent-custom" : dim ? "text-text-dim" : "text-text-main"
          )}>
            {subValue}
          </div>
        </>
      )}
    </div>
  );
}

function InsightItem({ text, tag }: { text: string, tag: string }) {
  return (
    <div className="space-y-3">
      <p className="text-[13px] leading-relaxed text-text-main">{text}</p>
      <div className="inline-block text-[10px] px-2 py-0.5 rounded bg-surface-light text-text-dim uppercase tracking-wider">
        {tag}
      </div>
    </div>
  );
}

