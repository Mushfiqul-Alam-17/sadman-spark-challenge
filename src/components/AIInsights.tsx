
import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { analyzeHealthTrend, getAIRecommendation } from "@/services/aiAnalysis";
import { Sparkles, Brain, TrendingUp, Zap } from "lucide-react";
import LivePulse from "./LivePulse";

const AIInsights: React.FC = () => {
  const { logs, todayLog } = useUser();
  const [insight, setInsight] = useState<string>("");
  const [recommendation, setRecommendation] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [animateZap, setAnimateZap] = useState(false);

  useEffect(() => {
    const getInsights = async () => {
      if (logs.length > 0) {
        setLoading(true);
        try {
          const trend = await analyzeHealthTrend(logs);
          setInsight(trend);
          
          if (todayLog) {
            const rec = getAIRecommendation(
              todayLog.meds,
              todayLog.junk,
              todayLog.sleep,
              todayLog.midnightSleep,
              todayLog.move
            );
            setRecommendation(rec);
          }
        } catch (error) {
          console.error("Error getting AI insights:", error);
          setInsight("AI insights unavailable right now. Try again later!");
        }
        setLoading(false);
      }
    };

    getInsights();
  }, [logs, todayLog]);

  // Trigger zap animation randomly
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setAnimateZap(true);
        setTimeout(() => setAnimateZap(false), 1000);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card p-5 animate-fade-in relative overflow-hidden">
      {/* Background animation */}
      <div className="absolute -z-10 inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-kidney-purple/20 blur-xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-kidney-blue/20 blur-xl" />
      </div>
      
      <div className="mb-4 flex items-center gap-2">
        <Brain className={`text-kidney-purple h-5 w-5 ${animateZap ? 'animate-ping' : ''}`} />
        <p className="text-sm font-medium uppercase text-muted-foreground">
          AI Insights
        </p>
        <Zap 
          className={`ml-auto text-kidney-yellow h-4 w-4 transition-all duration-300 ${
            animateZap ? 'scale-150 rotate-12' : 'scale-100 rotate-0'
          }`} 
        />
      </div>
      
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <LivePulse color="#7209B7" size="md" intensity="medium" />
            <p className="text-sm text-muted-foreground animate-pulse">AI is analyzing your health data...</p>
          </div>
        ) : (
          <>
            <div className="border-l-4 border-kidney-purple pl-4 py-2 transition-all hover:border-l-8 duration-300">
              <div className="flex items-center mb-2">
                <TrendingUp className="text-kidney-purple h-4 w-4 mr-2" />
                <p className="text-sm font-medium">Health Trend Analysis</p>
              </div>
              <p className="text-sm text-muted-foreground transition-all hover:text-foreground">{insight}</p>
            </div>
            
            {recommendation && (
              <div className="border-l-4 border-kidney-yellow pl-4 py-2 transition-all hover:border-l-8 duration-300">
                <div className="flex items-center mb-2">
                  <Sparkles className="text-kidney-yellow h-4 w-4 mr-2" />
                  <p className="text-sm font-medium">Today's Recommendation</p>
                </div>
                <p className="text-sm text-muted-foreground transition-all hover:text-foreground">{recommendation}</p>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex justify-center">
                <button 
                  className="px-4 py-2 rounded-full text-xs text-kidney-purple bg-kidney-purple/10 hover:bg-kidney-purple/20 transition-colors flex items-center gap-1"
                  onClick={() => {
                    setLoading(true);
                    setTimeout(() => {
                      setLoading(false);
                    }, 2000);
                  }}
                >
                  <Zap className="h-3 w-3" />
                  <span>Refresh Analysis</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
