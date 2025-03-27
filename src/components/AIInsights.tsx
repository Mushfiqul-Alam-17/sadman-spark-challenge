
import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { analyzeHealthTrend, getAIRecommendation } from "@/services/aiAnalysis";
import { Sparkles, Brain, TrendingUp } from "lucide-react";

const AIInsights: React.FC = () => {
  const { logs, todayLog } = useUser();
  const [insight, setInsight] = useState<string>("");
  const [recommendation, setRecommendation] = useState<string>("");
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="glass-card p-5 animate-fade-in">
      <div className="mb-4 flex items-center gap-2">
        <Brain className="text-kidney-purple h-5 w-5" />
        <p className="text-sm font-medium uppercase text-muted-foreground">
          AI Insights
        </p>
      </div>
      
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse h-4 w-4 rounded-full bg-kidney-purple mr-2"></div>
            <div className="animate-pulse h-4 w-4 rounded-full bg-kidney-blue mr-2 animation-delay-200"></div>
            <div className="animate-pulse h-4 w-4 rounded-full bg-kidney-yellow animation-delay-400"></div>
          </div>
        ) : (
          <>
            <div className="border-l-4 border-kidney-purple pl-4 py-2">
              <div className="flex items-center mb-2">
                <TrendingUp className="text-kidney-purple h-4 w-4 mr-2" />
                <p className="text-sm font-medium">Health Trend Analysis</p>
              </div>
              <p className="text-sm text-muted-foreground">{insight}</p>
            </div>
            
            {recommendation && (
              <div className="border-l-4 border-kidney-yellow pl-4 py-2">
                <div className="flex items-center mb-2">
                  <Sparkles className="text-kidney-yellow h-4 w-4 mr-2" />
                  <p className="text-sm font-medium">Today's Recommendation</p>
                </div>
                <p className="text-sm text-muted-foreground">{recommendation}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
