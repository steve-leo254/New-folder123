/**
 * Mental Health Hook
 * Manages state and API calls for mental health functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { mentalHealthService, MoodEntry, GameResult, MentalHealthScore, MoodEntryCreate, GameResultCreate } from '../services/mentalHealthService';

export const useMentalHealth = () => {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [mentalHealthScore, setMentalHealthScore] = useState<MentalHealthScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load mood entries
  const loadMoodEntries = useCallback(async (limit: number = 30) => {
    try {
      setLoading(true);
      const entries = await mentalHealthService.getMoodEntries(limit);
      setMoodEntries(entries);
    } catch (err: any) {
      setError(err.message || 'Failed to load mood entries');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load game results
  const loadGameResults = useCallback(async (gameType?: string, limit: number = 50) => {
    try {
      setLoading(true);
      const results = await mentalHealthService.getGameResults(gameType, limit);
      setGameResults(results);
    } catch (err: any) {
      setError(err.message || 'Failed to load game results');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load mental health score
  const loadMentalHealthScore = useCallback(async () => {
    try {
      setLoading(true);
      const score = await mentalHealthService.getMentalHealthScore();
      setMentalHealthScore(score);
    } catch (err: any) {
      setError(err.message || 'Failed to load mental health score');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create mood entry
  const createMoodEntry = useCallback(async (moodData: MoodEntryCreate) => {
    try {
      setLoading(true);
      const newEntry = await mentalHealthService.createMoodEntry(moodData);
      setMoodEntries(prev => [newEntry, ...prev]);
      // Refresh score after new mood entry
      await loadMentalHealthScore();
      return newEntry;
    } catch (err: any) {
      setError(err.message || 'Failed to create mood entry');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadMentalHealthScore]);

  // Create game result
  const createGameResult = useCallback(async (gameData: GameResultCreate) => {
    try {
      setLoading(true);
      const newResult = await mentalHealthService.createGameResult(gameData);
      setGameResults(prev => [newResult, ...prev]);
      // Refresh score after new game result
      await loadMentalHealthScore();
      return newResult;
    } catch (err: any) {
      setError(err.message || 'Failed to create game result');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadMentalHealthScore]);

  // Load all data on mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          loadMoodEntries(),
          loadGameResults(),
          loadMentalHealthScore()
        ]);
      } catch (err: any) {
        setError(err.message || 'Failed to load mental health data');
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [loadMoodEntries, loadGameResults, loadMentalHealthScore]);

  return {
    moodEntries,
    gameResults,
    mentalHealthScore,
    loading,
    error,
    loadMoodEntries,
    loadGameResults,
    loadMentalHealthScore,
    createMoodEntry,
    createGameResult
  };
};
