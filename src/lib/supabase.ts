
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iozdfpfyoaebvpwhuxaz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvemRmcGZ5b2FlYnZwd2h1eGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNDA1NzYsImV4cCI6MjA1ODcxNjU3Nn0.Lro-uiAU2CX0uOJGMaNr1SI4F7bE1hE_iL85gMMDmiY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for the games data
export const saveGameScore = async (
  userId: string, 
  gameName: string, 
  score: number, 
  date = new Date().toISOString().split('T')[0]
) => {
  const { data, error } = await supabase
    .from('game_scores')
    .upsert([
      { 
        user_id: userId, 
        game_name: gameName, 
        score, 
        played_at: date
      }
    ], { onConflict: 'user_id,game_name,played_at' });
    
  if (error) {
    console.error('Error saving game score:', error);
    return false;
  }
  return true;
};

export const getGameScores = async (userId: string, gameName?: string) => {
  let query = supabase
    .from('game_scores')
    .select('*')
    .eq('user_id', userId)
    .order('played_at', { ascending: false });
    
  if (gameName) {
    query = query.eq('game_name', gameName);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error getting game scores:', error);
    return [];
  }
  return data;
};
