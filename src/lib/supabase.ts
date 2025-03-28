
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

// Create a new user in the database
export const createUser = async (userData: {
  name: string;
  streak?: number;
  points?: number;
  rank?: string;
  current_challenge?: string;
  completed_challenges?: string[];
}) => {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select();
    
  if (error) {
    console.error('Error creating user:', error);
    return null;
  }
  return data?.[0];
};

// Get user data from the database
export const getUser = async (name: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('name', name)
    .single();
    
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return data;
};

// Update user data in the database
export const updateUser = async (name: string, userData: any) => {
  const { data, error } = await supabase
    .from('users')
    .update(userData)
    .eq('name', name)
    .select();
    
  if (error) {
    console.error('Error updating user:', error);
    return false;
  }
  return true;
};

// Log daily activity
export const saveDailyLog = async (
  userId: string,
  logData: {
    water_intake?: number;
    medication_taken?: boolean;
    sleep_hours?: number;
    exercise_minutes?: number;
    mood?: string;
    notes?: string;
    date?: string;
  }
) => {
  // Ensure we have a date
  const date = logData.date || new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('daily_logs')
    .upsert([
      { 
        user_id: userId,
        date,
        ...logData
      }
    ], { onConflict: 'user_id,date' });
    
  if (error) {
    console.error('Error saving daily log:', error);
    return false;
  }
  return true;
};

// Get daily logs for a user
export const getDailyLogs = async (userId: string, limit = 7) => {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit);
    
  if (error) {
    console.error('Error getting daily logs:', error);
    return [];
  }
  return data;
};
