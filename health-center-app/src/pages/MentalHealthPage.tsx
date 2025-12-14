// pages/MentalHealthPage.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Heart, Smile, Frown, Meh, Sun, Moon, Cloud, CloudRain,
  Zap, Target, Clock, Trophy, Star, Play, Pause, RotateCcw,
  ChevronRight, Award, TrendingUp, Calendar, MessageCircle,
  Sparkles, Volume2, VolumeX, Info, CheckCircle, X, ArrowRight,
  Wind, Eye, Gamepad2, BarChart3, AlertCircle, RefreshCw
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

// Types
interface MoodEntry {
  date: string;
  mood: number;
  energy: number;
  anxiety: number;
  notes: string;
}

interface GameResult {
  game: string;
  score: number;
  level: number;
  timestamp: Date;
  metrics: Record<string, number>;
}

interface MentalHealthScore {
  overall: number;
  stress: number;
  anxiety: number;
  focus: number;
  mood: number;
  recommendations: string[];
}

// ============================================
// MEMORY GAME COMPONENT
// ============================================
const MemoryGame: React.FC<{ onComplete: (result: GameResult) => void }> = ({ onComplete }) => {
  const [cards, setCards] = useState<{ id: number; emoji: string; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [level, setLevel] = useState(1);
  const [isComplete, setIsComplete] = useState(false);

  const emojis = ['🧠', '❤️', '⭐', '🌟', '🎯', '🔥', '💎', '🌈', '🦋', '🌸', '🍀', '🎨'];

  const initializeGame = useCallback((lvl: number) => {
    const pairCount = Math.min(4 + lvl * 2, 12);
    const selectedEmojis = emojis.slice(0, pairCount);
    const gameCards = [...selectedEmojis, ...selectedEmojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false
      }));
    
    setCards(gameCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsComplete(false);
    setGameStarted(false);
    setTimeElapsed(0);
  }, []);

  useEffect(() => {
    initializeGame(level);
  }, [level, initializeGame]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !isComplete) {
      interval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, startTime, isComplete]);

  const handleCardClick = (id: number) => {
    if (!gameStarted) {
      setGameStarted(true);
      setStartTime(Date.now());
    }

    if (flippedCards.length === 2) return;
    if (cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);
    setFlippedCards([...flippedCards, id]);

    if (flippedCards.length === 1) {
      setMoves(prev => prev + 1);
      const firstCard = cards[flippedCards[0]];
      const secondCard = newCards[id];

      if (firstCard.emoji === secondCard.emoji) {
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[flippedCards[0]].isMatched = true;
          matchedCards[id].isMatched = true;
          setCards(matchedCards);
          setFlippedCards([]);
          setMatches(prev => {
            const newMatches = prev + 1;
            const totalPairs = cards.length / 2;
            if (newMatches === totalPairs) {
              setIsComplete(true);
              const score = Math.max(100 - moves * 2 - timeElapsed, 10);
              onComplete({
                game: 'memory',
                score,
                level,
                timestamp: new Date(),
                metrics: {
                  moves: moves + 1,
                  timeElapsed,
                  accuracy: ((totalPairs / (moves + 1)) * 100)
                }
              });
            }
            return newMatches;
          });
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[flippedCards[0]].isFlipped = false;
          resetCards[id].isFlipped = false;
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const gridCols = cards.length <= 8 ? 4 : cards.length <= 12 ? 4 : 6;

  return (
    <div className="space-y-6">
      {/* Game Stats */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-4">
          <div className="bg-blue-100 px-4 py-2 rounded-lg">
            <span className="text-sm text-blue-600">Level</span>
            <p className="text-xl font-bold text-blue-800">{level}</p>
          </div>
          <div className="bg-purple-100 px-4 py-2 rounded-lg">
            <span className="text-sm text-purple-600">Moves</span>
            <p className="text-xl font-bold text-purple-800">{moves}</p>
          </div>
          <div className="bg-green-100 px-4 py-2 rounded-lg">
            <span className="text-sm text-green-600">Time</span>
            <p className="text-xl font-bold text-green-800">{timeElapsed}s</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => initializeGame(level)}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Game Grid */}
      <div 
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
      >
        {cards.map((card) => (
          <motion.button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`aspect-square rounded-xl text-3xl md:text-4xl flex items-center justify-center transition-all ${
              card.isFlipped || card.isMatched
                ? 'bg-white border-2 border-blue-300'
                : 'bg-gradient-to-br from-blue-500 to-purple-600'
            } ${card.isMatched ? 'opacity-50' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={card.isMatched}
          >
            <AnimatePresence>
              {(card.isFlipped || card.isMatched) && (
                <motion.span
                  initial={{ rotateY: 90 }}
                  animate={{ rotateY: 0 }}
                  exit={{ rotateY: 90 }}
                >
                  {card.emoji}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      {/* Complete Modal */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Level Complete!</h3>
              <p className="text-gray-600 mb-6">
                Completed in {moves} moves and {timeElapsed} seconds
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => initializeGame(level)}>
                  Retry Level
                </Button>
                <Button onClick={() => setLevel(prev => prev + 1)}>
                  Next Level
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// BREATHING EXERCISE COMPONENT
// ============================================
const BreathingExercise: React.FC<{ onComplete: (result: GameResult) => void }> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [cycleCount, setCycleCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const totalCycles = 5;

  const phaseConfig: Record<'inhale' | 'hold' | 'exhale', { duration: number; next: 'inhale' | 'hold' | 'exhale'; instruction: string }> = {
    inhale: { duration: 4, next: 'hold', instruction: 'Breathe In' },
    hold: { duration: 4, next: 'exhale', instruction: 'Hold' },
    exhale: { duration: 6, next: 'inhale', instruction: 'Breathe Out' }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && phase !== 'idle') {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            const currentPhase = phaseConfig[phase];
            if (phase === 'exhale') {
              if (cycleCount + 1 >= totalCycles) {
                setIsActive(false);
                setPhase('idle');
                setIsCompleted(true);
                onComplete({
                  game: 'breathing',
                  score: 100,
                  level: 1,
                  timestamp: new Date(),
                  metrics: { cyclesCompleted: cycleCount + 1 }
                });
                return 0;
              }
              setCycleCount(c => c + 1);
            }
            setPhase(currentPhase.next);
            return phaseConfig[currentPhase.next].duration;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, phase, cycleCount, onComplete]);

  const startExercise = () => {
    setIsActive(true);
    setPhase('inhale');
    setTimer(phaseConfig.inhale.duration);
    setCycleCount(0);
    setIsCompleted(false);
  };

  const resetExercise = () => {
    setIsActive(false);
    setPhase('idle');
    setCycleCount(0);
    setTimer(0);
    setIsCompleted(false);
  };

  const getCircleScale = () => {
    if (phase === 'inhale') return 1.5;
    if (phase === 'hold') return 1.5;
    if (phase === 'exhale') return 1;
    return 1;
  };

  const getCircleColor = () => {
    if (phase === 'inhale') return '#3B82F6';
    if (phase === 'hold') return '#8B5CF6';
    if (phase === 'exhale') return '#10B981';
    return '#E5E7EB';
  };

  return (
    <div className="text-center space-y-8">
      <div className="relative inline-flex items-center justify-center">
        <motion.div
          animate={{ 
            scale: getCircleScale(),
            backgroundColor: getCircleColor()
          }}
          transition={{ duration: phase === 'idle' ? 0.3 : phaseConfig[phase]?.duration || 0.3 }}
          className="w-48 h-48 rounded-full flex items-center justify-center"
        >
          <div className="text-white text-center">
            {phase !== 'idle' ? (
              <>
                <p className="text-4xl font-bold">{timer}</p>
                <p className="text-lg">{phaseConfig[phase]?.instruction}</p>
              </>
            ) : isCompleted ? (
              <div>
                <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">Complete!</p>
              </div>
            ) : (
              <Wind className="w-12 h-12" />
            )}
          </div>
        </motion.div>
        
        {/* Progress Ring */}
        <svg className="absolute w-56 h-56">
          <circle
            cx="112"
            cy="112"
            r="100"
            stroke="#E5E7EB"
            strokeWidth="8"
            fill="none"
          />
          <motion.circle
            cx="112"
            cy="112"
            r="100"
            stroke="#3B82F6"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={628}
            animate={{ strokeDashoffset: 628 - (cycleCount / totalCycles) * 628 }}
            transition={{ duration: 0.5 }}
          />
        </svg>
      </div>

      <div className="space-y-2">
        <p className="text-lg text-gray-600">
          Cycle {Math.min(cycleCount + 1, totalCycles)} of {totalCycles}
        </p>
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalCycles }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                i < cycleCount ? 'bg-green-500' : 
                i === cycleCount && isActive ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-4">
        {phase === 'idle' && !isCompleted && (
          <Button onClick={startExercise} className="px-8 py-3">
            <Play className="w-5 h-5 mr-2" />
            Start Breathing Exercise
          </Button>
        )}
        
        {isActive && (
          <Button variant="outline" onClick={resetExercise}>
            <Pause className="w-5 h-5 mr-2" />
            Stop
          </Button>
        )}
        
        {isCompleted && (
          <Button onClick={startExercise} className="px-8 py-3">
            <RefreshCw className="w-5 h-5 mr-2" />
            Do It Again
          </Button>
        )}
      </div>

      <Card className="p-4 bg-blue-50 border-blue-200 max-w-md mx-auto">
        <p className="text-sm text-blue-800">
          <strong>4-4-6 Breathing:</strong> This technique helps reduce anxiety and stress 
          by activating your parasympathetic nervous system.
        </p>
      </Card>
    </div>
  );
};

// ============================================
// REACTION TIME TEST COMPONENT
// ============================================
const ReactionTimeTest: React.FC<{ onComplete: (result: GameResult) => void }> = ({ onComplete }) => {
  const [state, setState] = useState<'waiting' | 'ready' | 'go' | 'result' | 'early' | 'finished'>('waiting');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxAttempts = 5;

  const startTest = () => {
    setState('ready');
    const delay = Math.random() * 3000 + 2000;
    
    timeoutRef.current = setTimeout(() => {
      setState('go');
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (state === 'waiting') {
      startTest();
    } else if (state === 'ready') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setState('early');
    } else if (state === 'go') {
      const time = Date.now() - startTime;
      setReactionTime(time);
      const newAttempts = [...attempts, time];
      setAttempts(newAttempts);
      
      if (newAttempts.length >= maxAttempts) {
        setState('finished');
        const avgTime = newAttempts.reduce((a, b) => a + b, 0) / newAttempts.length;
        const score = Math.max(100 - Math.floor((avgTime - 200) / 5), 10);
        onComplete({
          game: 'reaction',
          score,
          level: 1,
          timestamp: new Date(),
          metrics: {
            averageTime: Math.round(avgTime),
            bestTime: Math.min(...newAttempts),
            worstTime: Math.max(...newAttempts),
            attempts: newAttempts.length
          }
        });
      } else {
        setState('result');
      }
    } else if (state === 'result' || state === 'early') {
      startTest();
    }
  };

  const resetGame = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setState('waiting');
    setAttempts([]);
    setReactionTime(null);
  };

  const getBackgroundColor = () => {
    switch (state) {
      case 'waiting': return 'bg-gray-200';
      case 'ready': return 'bg-red-500';
      case 'go': return 'bg-green-500';
      case 'result': return 'bg-blue-500';
      case 'early': return 'bg-yellow-500';
      case 'finished': return 'bg-purple-500';
    }
  };

  const getMessage = () => {
    switch (state) {
      case 'waiting': return 'Click to Start';
      case 'ready': return 'Wait for Green...';
      case 'go': return 'CLICK NOW!';
      case 'result': return `${reactionTime}ms - Click to Continue`;
      case 'early': return 'Too Early! Click to Retry';
      case 'finished': return 'Test Complete!';
    }
  };

  const averageTime = attempts.length > 0 
    ? Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-4">
          <div className="bg-purple-100 px-4 py-2 rounded-lg">
            <span className="text-sm text-purple-600">Attempts</span>
            <p className="text-xl font-bold text-purple-800">{attempts.length}/{maxAttempts}</p>
          </div>
          {averageTime && (
            <div className="bg-blue-100 px-4 py-2 rounded-lg">
              <span className="text-sm text-blue-600">Average</span>
              <p className="text-xl font-bold text-blue-800">{averageTime}ms</p>
            </div>
          )}
          {attempts.length > 0 && (
            <div className="bg-green-100 px-4 py-2 rounded-lg">
              <span className="text-sm text-green-600">Best</span>
              <p className="text-xl font-bold text-green-800">{Math.min(...attempts)}ms</p>
            </div>
          )}
        </div>
        {state === 'finished' && (
          <Button variant="outline" onClick={resetGame}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>

      <motion.button
        onClick={state !== 'finished' ? handleClick : undefined}
        className={`w-full h-64 rounded-2xl flex items-center justify-center cursor-pointer transition-colors ${getBackgroundColor()}`}
        whileTap={state !== 'finished' ? { scale: 0.98 } : {}}
      >
        <span className={`text-2xl md:text-3xl font-bold ${state === 'waiting' ? 'text-gray-600' : 'text-white'}`}>
          {getMessage()}
        </span>
      </motion.button>

      {attempts.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {attempts.map((time, i) => (
            <div
              key={i}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                time < 250 ? 'bg-green-100 text-green-700' :
                time < 350 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}
            >
              {time}ms
            </div>
          ))}
        </div>
      )}

      <Card className="p-4 bg-purple-50 border-purple-200">
        <p className="text-sm text-purple-800">
          <strong>Reaction Time Test:</strong> Average human reaction time is around 250ms. 
          Faster times indicate better focus and cognitive function.
        </p>
      </Card>
    </div>
  );
};

// ============================================
// COLOR MATCH GAME COMPONENT
// ============================================
const ColorMatchGame: React.FC<{ onComplete: (result: GameResult) => void }> = ({ onComplete }) => {
  const colors = [
    { name: 'RED', hex: '#EF4444' },
    { name: 'BLUE', hex: '#3B82F6' },
    { name: 'GREEN', hex: '#22C55E' },
    { name: 'YELLOW', hex: '#EAB308' },
    { name: 'PURPLE', hex: '#A855F7' },
    { name: 'ORANGE', hex: '#F97316' }
  ];

  const [currentWord, setCurrentWord] = useState({ text: '', color: '' });
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const generateNewWord = useCallback(() => {
    const wordColor = colors[Math.floor(Math.random() * colors.length)];
    const displayColor = colors[Math.floor(Math.random() * colors.length)];
    setCurrentWord({ text: wordColor.name, color: displayColor.hex });
  }, []);

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      setIsFinished(true);
      onComplete({
        game: 'colorMatch',
        score,
        level: 1,
        timestamp: new Date(),
        metrics: {
          correctAnswers: score,
          totalAnswers,
          accuracy: totalAnswers > 0 ? Math.round((score / totalAnswers) * 100) : 0,
          maxStreak
        }
      });
    }
  }, [isPlaying, timeLeft, score, totalAnswers, maxStreak, onComplete]);

  const startGame = () => {
    setIsPlaying(true);
    setIsFinished(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(30);
    setTotalAnswers(0);
    generateNewWord();
  };

  const handleAnswer = (isMatch: boolean) => {
    const wordColorObj = colors.find(c => c.name === currentWord.text);
    const actualMatch = wordColorObj?.hex === currentWord.color;
    
    setTotalAnswers(t => t + 1);
    
    if (isMatch === actualMatch) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak(prev => Math.max(prev, newStreak));
      setScore(s => s + 1 + Math.floor(streak / 3));
    } else {
      setStreak(0);
    }
    
    generateNewWord();
  };

  return (
    <div className="space-y-6">
      {!isPlaying && !isFinished ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Color Match</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Does the <strong>COLOR</strong> of the word match what the word says? 
            Test your cognitive flexibility and attention!
          </p>
          <Button onClick={startGame} className="px-8 py-3">
            <Play className="w-5 h-5 mr-2" />
            Start Game
          </Button>
        </div>
      ) : isFinished ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Game Over!</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-lg mx-auto mb-6">
            <div className="bg-green-100 p-4 rounded-lg">
              <p className="text-2xl font-bold text-green-800">{score}</p>
              <p className="text-sm text-green-600">Score</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg">
              <p className="text-2xl font-bold text-blue-800">{totalAnswers}</p>
              <p className="text-sm text-blue-600">Answers</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg">
              <p className="text-2xl font-bold text-purple-800">
                {totalAnswers > 0 ? Math.round((score / totalAnswers) * 100) : 0}%
              </p>
              <p className="text-sm text-purple-600">Accuracy</p>
            </div>
            <div className="bg-orange-100 p-4 rounded-lg">
              <p className="text-2xl font-bold text-orange-800">{maxStreak}🔥</p>
              <p className="text-sm text-orange-600">Max Streak</p>
            </div>
          </div>
          <Button onClick={startGame} className="px-8 py-3">
            <RefreshCw className="w-5 h-5 mr-2" />
            Play Again
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-4">
              <div className="bg-green-100 px-4 py-2 rounded-lg">
                <span className="text-sm text-green-600">Score</span>
                <p className="text-xl font-bold text-green-800">{score}</p>
              </div>
              <div className="bg-purple-100 px-4 py-2 rounded-lg">
                <span className="text-sm text-purple-600">Streak</span>
                <p className="text-xl font-bold text-purple-800">{streak}🔥</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-lg ${timeLeft <= 10 ? 'bg-red-100' : 'bg-blue-100'}`}>
              <span className={`text-sm ${timeLeft <= 10 ? 'text-red-600' : 'text-blue-600'}`}>Time</span>
              <p className={`text-xl font-bold ${timeLeft <= 10 ? 'text-red-800' : 'text-blue-800'}`}>{timeLeft}s</p>
            </div>
          </div>

          <Card className="p-8 md:p-12 text-center">
            <motion.p
              key={currentWord.text + currentWord.color}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl md:text-7xl font-bold"
              style={{ color: currentWord.color }}
            >
              {currentWord.text}
            </motion.p>
          </Card>

          <p className="text-center text-gray-600">
            Does the <strong>color</strong> match what the word says?
          </p>

          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => handleAnswer(true)}
              className="px-8 md:px-12 py-4 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-6 h-6 mr-2" />
              Match
            </Button>
            <Button
              onClick={() => handleAnswer(false)}
              className="px-8 md:px-12 py-4 bg-red-600 hover:bg-red-700"
            >
              <X className="w-6 h-6 mr-2" />
              No Match
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

// ============================================
// MOOD TRACKER COMPONENT
// ============================================
const MoodTracker: React.FC<{ onSubmit: (entry: MoodEntry) => void }> = ({ onSubmit }) => {
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [anxiety, setAnxiety] = useState(5);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const moodEmojis = ['😢', '😔', '😕', '😐', '🙂', '😊', '😄', '😁', '🤩', '🥳'];
  const energyLevels = ['💤', '😴', '🥱', '😶', '🙂', '😊', '💪', '⚡', '🔥', '🚀'];
  const anxietyLevels = ['😌', '🙂', '😊', '😐', '😕', '😟', '😰', '😨', '😱', '🤯'];

  const handleSubmit = () => {
    onSubmit({
      date: new Date().toISOString(),
      mood,
      energy,
      anxiety,
      notes
    });
    setSubmitted(true);
  };

  const resetForm = () => {
    setMood(5);
    setEnergy(5);
    setAnxiety(5);
    setNotes('');
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <Card className="p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Mood Logged!</h3>
        <p className="text-gray-600 mb-6">
          Great job tracking your mental wellness today. Keep it up!
        </p>
        <Button onClick={resetForm}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Log Another Entry
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <h3 className="text-xl font-bold text-gray-900 flex items-center">
        <Calendar className="w-6 h-6 mr-2 text-blue-600" />
        How are you feeling today?
      </h3>
      
      {/* Mood */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Mood: <span className="text-2xl ml-2">{moodEmojis[mood - 1]}</span>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={mood}
          onChange={(e) => setMood(parseInt(e.target.value))}
          className="w-full h-3 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Very Low</span>
          <span>Neutral</span>
          <span>Excellent</span>
        </div>
      </div>

      {/* Energy */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Energy Level: <span className="text-2xl ml-2">{energyLevels[energy - 1]}</span>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={energy}
          onChange={(e) => setEnergy(parseInt(e.target.value))}
          className="w-full h-3 bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Exhausted</span>
          <span>Moderate</span>
          <span>Energized</span>
        </div>
      </div>

      {/* Anxiety */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Anxiety Level: <span className="text-2xl ml-2">{anxietyLevels[anxiety - 1]}</span>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={anxiety}
          onChange={(e) => setAnxiety(parseInt(e.target.value))}
          className="w-full h-3 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Very Calm</span>
          <span>Moderate</span>
          <span>Very Anxious</span>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What's on your mind today? Any specific triggers or highlights?"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>

      <Button onClick={handleSubmit} className="w-full py-3">
        <CheckCircle className="w-5 h-5 mr-2" />
        Log My Mood
      </Button>
    </Card>
  );
};

// ============================================
// FOCUS TIMER COMPONENT
// ============================================
const FocusTimer: React.FC<{ onComplete: (result: GameResult) => void }> = ({ onComplete }) => {
  const [duration, setDuration] = useState(5); // minutes
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [focusSessions, setFocusSessions] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setIsCompleted(true);
      setFocusSessions(prev => prev + 1);
      onComplete({
        game: 'focus',
        score: duration * 10,
        level: 1,
        timestamp: new Date(),
        metrics: {
          duration: duration,
          sessionsCompleted: focusSessions + 1
        }
      });
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, duration, focusSessions, onComplete]);

  const startTimer = () => {
    setTimeLeft(duration * 60);
    setIsRunning(true);
    setIsCompleted(false);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
    setIsCompleted(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  return (
    <div className="text-center space-y-8">
      {/* Duration Selector */}
      {!isRunning && !isCompleted && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Focus Duration
          </label>
          <div className="flex justify-center gap-3">
            {[5, 10, 15, 25, 30].map(mins => (
              <button
                key={mins}
                onClick={() => {
                  setDuration(mins);
                  setTimeLeft(mins * 60);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  duration === mins
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Timer Display */}
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-64 h-64 transform -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="#E5E7EB"
            strokeWidth="12"
            fill="none"
          />
          <motion.circle
            cx="128"
            cy="128"
            r="120"
            stroke={isCompleted ? '#22C55E' : '#3B82F6'}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={754}
            animate={{ strokeDashoffset: 754 - (progress / 100) * 754 }}
            transition={{ duration: 0.5 }}
          />
        </svg>
        <div className="absolute text-center">
          {isCompleted ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-gray-900">Complete!</p>
            </>
          ) : (
            <>
              <p className="text-5xl font-bold text-gray-900">{formatTime(timeLeft)}</p>
              <p className="text-gray-500">{isRunning ? 'Focus Time' : 'Ready'}</p>
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        {!isRunning && !isCompleted && (
          <Button onClick={startTimer} className="px-8 py-3">
            <Play className="w-5 h-5 mr-2" />
            Start Focus
          </Button>
        )}
        
        {isRunning && (
          <>
            <Button variant="outline" onClick={pauseTimer}>
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </Button>
            <Button variant="outline" onClick={resetTimer}>
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset
            </Button>
          </>
        )}
        
        {isCompleted && (
          <Button onClick={startTimer} className="px-8 py-3">
            <RefreshCw className="w-5 h-5 mr-2" />
            Start Another Session
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-4">
        <div className="bg-blue-100 px-6 py-3 rounded-lg">
          <p className="text-2xl font-bold text-blue-800">{focusSessions}</p>
          <p className="text-sm text-blue-600">Sessions Today</p>
        </div>
        <div className="bg-green-100 px-6 py-3 rounded-lg">
          <p className="text-2xl font-bold text-green-800">{focusSessions * duration}</p>
          <p className="text-sm text-green-600">Minutes Focused</p>
        </div>
      </div>

      <Card className="p-4 bg-purple-50 border-purple-200 max-w-md mx-auto">
        <p className="text-sm text-purple-800">
          <strong>Pomodoro Technique:</strong> Focus sessions improve concentration 
          and reduce mental fatigue. Take a 5-minute break between sessions.
        </p>
      </Card>
    </div>
  );
};

// ============================================
// MENTAL HEALTH SCORE CARD COMPONENT
// ============================================
const MentalHealthScoreCard: React.FC<{ gameResults: GameResult[]; moodEntries: MoodEntry[] }> = ({ 
  gameResults, 
  moodEntries 
}) => {
  const calculateScore = (): MentalHealthScore => {
    let focusScore = 50;
    let stressScore = 50;
    let moodScore = 50;
    let anxietyScore = 50;
    const recommendations: string[] = [];

    // Calculate from game results
    const memoryGames = gameResults.filter(g => g.game === 'memory');
    const reactionGames = gameResults.filter(g => g.game === 'reaction');
    const breathingGames = gameResults.filter(g => g.game === 'breathing');
    const colorGames = gameResults.filter(g => g.game === 'colorMatch');

    if (memoryGames.length > 0) {
      const avgMemoryScore = memoryGames.reduce((a, b) => a + b.score, 0) / memoryGames.length;
      focusScore = Math.min(100, focusScore + avgMemoryScore * 0.3);
    }

    if (reactionGames.length > 0) {
      const avgReactionScore = reactionGames.reduce((a, b) => a + b.score, 0) / reactionGames.length;
      focusScore = Math.min(100, focusScore + avgReactionScore * 0.2);
    }

    if (breathingGames.length > 0) {
      stressScore = Math.min(100, stressScore + breathingGames.length * 10);
    }

    if (colorGames.length > 0) {
      const avgColorScore = colorGames.reduce((a, b) => a + b.score, 0) / colorGames.length;
      focusScore = Math.min(100, focusScore + avgColorScore * 0.2);
    }

    // Calculate from mood entries
    if (moodEntries.length > 0) {
      const avgMood = moodEntries.reduce((a, b) => a + b.mood, 0) / moodEntries.length;
      const avgAnxiety = moodEntries.reduce((a, b) => a + b.anxiety, 0) / moodEntries.length;
      
      moodScore = avgMood * 10;
      anxietyScore = 100 - (avgAnxiety * 10);
    }

    const overall = Math.round((focusScore + stressScore + moodScore + anxietyScore) / 4);

    // Generate recommendations
    if (focusScore < 60) {
      recommendations.push('Try more memory and reaction games to improve focus');
    }
    if (stressScore < 60) {
      recommendations.push('Practice breathing exercises daily to reduce stress');
    }
    if (moodScore < 60) {
      recommendations.push('Consider activities that bring you joy and track your mood regularly');
    }
    if (anxietyScore < 60) {
      recommendations.push('Try mindfulness exercises and breathing techniques to manage anxiety');
    }
    if (recommendations.length === 0) {
      recommendations.push('Great job! Keep up your mental wellness routine');
    }

    return {
      overall,
      stress: Math.round(stressScore),
      anxiety: Math.round(anxietyScore),
      focus: Math.round(focusScore),
      mood: Math.round(moodScore),
      recommendations
    };
  };

  const score = calculateScore();

  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-blue-600';
    if (value >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (value: number) => {
    if (value >= 80) return 'bg-green-100';
    if (value >= 60) return 'bg-blue-100';
    if (value >= 40) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <BarChart3 className="w-6 h-6 mr-2 text-purple-600" />
        Mental Health Score
      </h3>

      {/* Overall Score */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBgColor(score.overall)}`}>
          <div>
            <p className={`text-4xl font-bold ${getScoreColor(score.overall)}`}>{score.overall}</p>
            <p className="text-sm text-gray-600">Overall</p>
          </div>
        </div>
      </div>

      {/* Individual Scores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${getScoreBgColor(score.focus)}`}>
          <Target className={`w-6 h-6 mb-2 ${getScoreColor(score.focus)}`} />
          <p className={`text-2xl font-bold ${getScoreColor(score.focus)}`}>{score.focus}</p>
          <p className="text-sm text-gray-600">Focus</p>
        </div>
        <div className={`p-4 rounded-lg ${getScoreBgColor(score.stress)}`}>
          <Wind className={`w-6 h-6 mb-2 ${getScoreColor(score.stress)}`} />
          <p className={`text-2xl font-bold ${getScoreColor(score.stress)}`}>{score.stress}</p>
          <p className="text-sm text-gray-600">Stress Mgmt</p>
        </div>
        <div className={`p-4 rounded-lg ${getScoreBgColor(score.mood)}`}>
          <Smile className={`w-6 h-6 mb-2 ${getScoreColor(score.mood)}`} />
          <p className={`text-2xl font-bold ${getScoreColor(score.mood)}`}>{score.mood}</p>
          <p className="text-sm text-gray-600">Mood</p>
        </div>
        <div className={`p-4 rounded-lg ${getScoreBgColor(score.anxiety)}`}>
          <Heart className={`w-6 h-6 mb-2 ${getScoreColor(score.anxiety)}`} />
          <p className={`text-2xl font-bold ${getScoreColor(score.anxiety)}`}>{score.anxiety}</p>
          <p className="text-sm text-gray-600">Calm</p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
          Recommendations
        </h4>
        <ul className="space-y-2">
          {score.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start text-sm text-gray-700">
              <ChevronRight className="w-4 h-4 mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

// ============================================
// MAIN MENTAL HEALTH PAGE COMPONENT
// ============================================
const MentalHealthPage: React.FC = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);

  const games = [
    {
      id: 'memory',
      title: 'Memory Match',
      description: 'Test and improve your memory and concentration',
      icon: Brain,
      color: 'from-blue-500 to-purple-600',
      benefit: 'Improves: Focus, Memory'
    },
    {
      id: 'breathing',
      title: 'Breathing Exercise',
      description: 'Guided breathing to reduce stress and anxiety',
      icon: Wind,
      color: 'from-green-500 to-teal-600',
      benefit: 'Reduces: Stress, Anxiety'
    },
    {
      id: 'reaction',
      title: 'Reaction Time',
      description: 'Test your reflexes and mental alertness',
      icon: Zap,
      color: 'from-yellow-500 to-orange-600',
      benefit: 'Improves: Alertness, Focus'
    },
    {
      id: 'colorMatch',
      title: 'Color Match',
      description: 'Challenge your cognitive flexibility',
      icon: Eye,
      color: 'from-pink-500 to-red-600',
      benefit: 'Improves: Cognitive Speed'
    },
    {
      id: 'focus',
      title: 'Focus Timer',
      description: 'Pomodoro-style focus sessions',
      icon: Clock,
      color: 'from-indigo-500 to-blue-600',
      benefit: 'Improves: Productivity, Focus'
    },
    {
      id: 'mood',
      title: 'Mood Tracker',
      description: 'Log and track your daily mood',
      icon: Heart,
      color: 'from-red-500 to-pink-600',
      benefit: 'Tracks: Mood, Energy, Anxiety'
    }
  ];

  const handleGameComplete = (result: GameResult) => {
    setGameResults(prev => [...prev, result]);
  };

  const handleMoodSubmit = (entry: MoodEntry) => {
    setMoodEntries(prev => [...prev, entry]);
  };

  const renderGame = () => {
    switch (activeGame) {
      case 'memory':
        return <MemoryGame onComplete={handleGameComplete} />;
      case 'breathing':
        return <BreathingExercise onComplete={handleGameComplete} />;
      case 'reaction':
        return <ReactionTimeTest onComplete={handleGameComplete} />;
      case 'colorMatch':
        return <ColorMatchGame onComplete={handleGameComplete} />;
      case 'focus':
        return <FocusTimer onComplete={handleGameComplete} />;
      case 'mood':
        return <MoodTracker onSubmit={handleMoodSubmit} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Brain className="w-16 h-16" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Mental Health & Wellness</h1>
            <p className="text-lg md:text-xl text-purple-100 max-w-3xl mx-auto">
              Interactive games and exercises designed to improve your mental wellbeing. 
              Track your progress and discover personalized recommendations.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Game */}
            <AnimatePresence mode="wait">
              {activeGame ? (
                <motion.div
                  key={activeGame}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        <Gamepad2 className="w-6 h-6 mr-2 text-purple-600" />
                        {games.find(g => g.id === activeGame)?.title}
                      </h2>
                      <Button variant="outline" onClick={() => setActiveGame(null)}>
                        <X className="w-4 h-4 mr-2" />
                        Close
                      </Button>
                    </div>
                    {renderGame()}
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Gamepad2 className="w-7 h-7 mr-3 text-purple-600" />
                    Mental Wellness Activities
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {games.map((game) => (
                      <motion.button
                        key={game.id}
                        onClick={() => setActiveGame(game.id)}
                        className={`bg-gradient-to-br ${game.color} p-6 rounded-xl text-white text-left hover:shadow-lg transition-shadow`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <game.icon className="w-10 h-10 mb-4" />
                        <h3 className="text-lg font-bold mb-2">{game.title}</h3>
                        <p className="text-sm opacity-90 mb-3">{game.description}</p>
                        <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                          {game.benefit}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recent Activity */}
            {gameResults.length > 0 && (
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {gameResults.slice(-5).reverse().map((result, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="bg-purple-100 p-2 rounded-lg mr-3">
                          {result.game === 'memory' && <Brain className="w-5 h-5 text-purple-600" />}
                          {result.game === 'breathing' && <Wind className="w-5 h-5 text-green-600" />}
                          {result.game === 'reaction' && <Zap className="w-5 h-5 text-yellow-600" />}
                          {result.game === 'colorMatch' && <Eye className="w-5 h-5 text-pink-600" />}
                          {result.game === 'focus' && <Clock className="w-5 h-5 text-blue-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{result.game}</p>
                          <p className="text-sm text-gray-500">
                            {result.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-600">{result.score} pts</p>
                        <p className="text-sm text-gray-500">Level {result.level}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mental Health Score */}
            <MentalHealthScoreCard gameResults={gameResults} moodEntries={moodEntries} />

            {/* Quick Tips */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                Daily Tips
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Sun className="w-5 h-5 text-yellow-500 mr-3 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    Start your day with 5 minutes of breathing exercises
                  </p>
                </div>
                <div className="flex items-start">
                  <Brain className="w-5 h-5 text-purple-500 mr-3 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    Play a quick memory game to sharpen your focus
                  </p>
                </div>
                <div className="flex items-start">
                  <Heart className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    Log your mood daily to identify patterns
                  </p>
                </div>
                <div className="flex items-start">
                  <Moon className="w-5 h-5 text-indigo-500 mr-3 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    End your day with a calming breathing session
                  </p>
                </div>
              </div>
            </Card>

            {/* Resources */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-blue-500" />
                Need Support?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                If you're struggling with mental health, remember that help is available.
              </p>
              <Button className="w-full mb-3">
                Talk to a Professional
              </Button>
              <Button variant="outline" className="w-full">
                <Info className="w-4 h-4 mr-2" />
                Mental Health Resources
              </Button>
            </Card>

            {/* Streak */}
            <Card className="p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Activity Streak</p>
                  <p className="text-3xl font-bold">{gameResults.length > 0 ? '🔥 1 Day' : 'Start Today!'}</p>
                </div>
                <Trophy className="w-12 h-12 opacity-80" />
              </div>
              <p className="text-sm text-orange-100 mt-2">
                Complete activities daily to build your streak!
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentalHealthPage;