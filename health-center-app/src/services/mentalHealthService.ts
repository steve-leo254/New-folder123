/**
 * Mental Health Service
 * Handles API calls for mental health data including mood tracking, game results, and scores
 */

import { apiService } from './api';

export interface MoodEntry {
  id: number;
  user_id: number;
  date: string;
  mood: number; // 1-10 scale
  energy: number; // 1-10 scale
  anxiety: number; // 1-10 scale
  notes: string;
  created_at: string;
}

export interface MoodEntryCreate {
  mood: number; // 1-10 scale
  energy: number; // 1-10 scale
  anxiety: number; // 1-10 scale
  notes: string;
}

export interface GameResult {
  id: number;
  user_id: number;
  game: string; // memory, reaction, color, focus
  score: number;
  level: number;
  metrics: Record<string, number>;
  timestamp: string;
}

export interface GameResultCreate {
  game: string; // memory, reaction, color, focus
  score: number;
  level: number;
  metrics: Record<string, number>;
}

export interface MentalHealthScore {
  overall: number;
  stress: number;
  anxiety: number;
  focus: number;
  mood: number;
  recommendations: string[];
  last_updated: string;
}

export const mentalHealthService = {
  // Mood Tracking
  async createMoodEntry(moodData: MoodEntryCreate): Promise<MoodEntry> {
    const { data } = await apiService.post('/api/mental-health/mood', moodData);
    return data;
  },

  async getMoodEntries(limit: number = 30): Promise<MoodEntry[]> {
    const { data } = await apiService.get(`/api/mental-health/mood?limit=${limit}`);
    return data;
  },

  // Game Results
  async createGameResult(gameData: GameResultCreate): Promise<GameResult> {
    const { data } = await apiService.post('/api/mental-health/games', gameData);
    return data;
  },

  async getGameResults(gameType?: string, limit: number = 50): Promise<GameResult[]> {
    const params = new URLSearchParams();
    if (gameType) params.append('game_type', gameType);
    params.append('limit', limit.toString());
    
    const { data } = await apiService.get(`/api/mental-health/games?${params}`);
    return data;
  },

  // Mental Health Score
  async getMentalHealthScore(): Promise<MentalHealthScore> {
    const { data } = await apiService.get('/api/mental-health/score');
    return data;
  }
};
