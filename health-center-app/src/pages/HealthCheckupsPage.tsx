// pages/HealthCheckupsPage.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Activity, Thermometer, Scale, Moon, Apple,
  Droplets, Wind, Eye, Ear, Brain, Pill, AlertTriangle,
  CheckCircle, ChevronRight, ChevronLeft, RotateCcw,
  Download, Share2, TrendingUp, TrendingDown, Minus,
  User, Calendar, Clock, ArrowRight, Sparkles, Target,
  Zap, Shield, Stethoscope, Clipboard, FileText, Info
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { healthUnits, calculateBMI, getBMICategory, formatWithUnit } from '../utils/healthUnits';

// Types
interface Question {
  id: string;
  category: string;
  question: string;
  type: 'single' | 'multiple' | 'scale' | 'number' | 'boolean';
  options?: { value: string | number; label: string; score: number }[];
  min?: number;
  max?: number;
  unit?: string;
  info?: string;
}

interface AssessmentResult {
  category: string;
  score: number;
  maxScore: number;
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  recommendations: string[];
  icon: React.ReactNode;
}

interface HealthMetrics {
  bmi: number | null;
  bmiCategory: string;
  heartRisk: number;
  diabetesRisk: number;
  sleepQuality: number;
  stressLevel: number;
  overallHealth: number;
}

// Health Assessment Questions
const healthQuestions: Question[] = [
  // Basic Information
  {
    id: 'age',
    category: 'basic',
    question: 'What is your age?',
    type: 'number',
    min: 18,
    max: 120,
    unit: 'years'
  },
  {
    id: 'gender',
    category: 'basic',
    question: 'What is your biological sex?',
    type: 'single',
    options: [
      { value: 'male', label: 'Male', score: 0 },
      { value: 'female', label: 'Female', score: 0 },
      { value: 'other', label: 'Other', score: 0 }
    ]
  },
  {
    id: 'height',
    category: 'basic',
    question: 'What is your height?',
    type: 'number',
    min: 100,
    max: 250,
    unit: 'cm'
  },
  {
    id: 'weight',
    category: 'basic',
    question: 'What is your current weight?',
    type: 'number',
    min: 30,
    max: 300,
    unit: 'kg'
  },
  // Heart Health
  {
    id: 'exercise_frequency',
    category: 'heart',
    question: 'How often do you exercise per week?',
    type: 'single',
    options: [
      { value: 'never', label: 'Never', score: 0 },
      { value: '1-2', label: '1-2 times', score: 5 },
      { value: '3-4', label: '3-4 times', score: 8 },
      { value: '5+', label: '5 or more times', score: 10 }
    ],
    info: 'Regular exercise strengthens your heart and improves circulation.'
  },
  {
    id: 'smoking',
    category: 'heart',
    question: 'Do you smoke or use tobacco products?',
    type: 'single',
    options: [
      { value: 'never', label: 'Never smoked', score: 10 },
      { value: 'quit', label: 'Quit smoking', score: 7 },
      { value: 'occasionally', label: 'Occasionally', score: 3 },
      { value: 'regularly', label: 'Regularly', score: 0 }
    ]
  },
  {
    id: 'alcohol',
    category: 'heart',
    question: 'How often do you consume alcohol?',
    type: 'single',
    options: [
      { value: 'never', label: 'Never', score: 10 },
      { value: 'rarely', label: 'Rarely (few times a month)', score: 8 },
      { value: 'weekly', label: 'Weekly', score: 5 },
      { value: 'daily', label: 'Daily', score: 2 }
    ]
  },
  {
    id: 'blood_pressure',
    category: 'heart',
    question: 'Do you have high blood pressure?',
    type: 'single',
    options: [
      { value: 'no', label: 'No', score: 10 },
      { value: 'controlled', label: 'Yes, but controlled with medication', score: 6 },
      { value: 'uncontrolled', label: 'Yes, not well controlled', score: 2 },
      { value: 'unknown', label: "I don't know", score: 5 }
    ]
  },
  {
    id: 'family_heart',
    category: 'heart',
    question: 'Is there a history of heart disease in your immediate family?',
    type: 'boolean',
    options: [
      { value: 'no', label: 'No', score: 10 },
      { value: 'yes', label: 'Yes', score: 3 }
    ]
  },
  // Diet & Nutrition
  {
    id: 'fruits_vegetables',
    category: 'nutrition',
    question: 'How many servings of fruits and vegetables do you eat daily?',
    type: 'single',
    options: [
      { value: '0', label: 'None', score: 0 },
      { value: '1-2', label: '1-2 servings', score: 4 },
      { value: '3-4', label: '3-4 servings', score: 7 },
      { value: '5+', label: '5 or more servings', score: 10 }
    ]
  },
  {
    id: 'water_intake',
    category: 'nutrition',
    question: 'How many glasses of water do you drink daily?',
    type: 'single',
    options: [
      { value: '1-2', label: '1-2 glasses', score: 2 },
      { value: '3-4', label: '3-4 glasses', score: 5 },
      { value: '5-6', label: '5-6 glasses', score: 7 },
      { value: '7+', label: '7 or more glasses', score: 10 }
    ]
  },
  {
    id: 'fast_food',
    category: 'nutrition',
    question: 'How often do you eat fast food or processed foods?',
    type: 'single',
    options: [
      { value: 'rarely', label: 'Rarely or never', score: 10 },
      { value: 'weekly', label: 'Once a week', score: 7 },
      { value: 'several', label: 'Several times a week', score: 3 },
      { value: 'daily', label: 'Almost daily', score: 0 }
    ]
  },
  // Sleep
  {
    id: 'sleep_hours',
    category: 'sleep',
    question: 'How many hours of sleep do you typically get per night?',
    type: 'single',
    options: [
      { value: '<5', label: 'Less than 5 hours', score: 2 },
      { value: '5-6', label: '5-6 hours', score: 5 },
      { value: '7-8', label: '7-8 hours', score: 10 },
      { value: '9+', label: 'More than 9 hours', score: 6 }
    ]
  },
  {
    id: 'sleep_quality',
    category: 'sleep',
    question: 'How would you rate your sleep quality?',
    type: 'scale',
    min: 1,
    max: 10,
    info: '1 = Very poor, 10 = Excellent'
  },
  {
    id: 'sleep_issues',
    category: 'sleep',
    question: 'Do you experience any sleep issues?',
    type: 'multiple',
    options: [
      { value: 'none', label: 'No issues', score: 10 },
      { value: 'falling_asleep', label: 'Difficulty falling asleep', score: -2 },
      { value: 'staying_asleep', label: 'Difficulty staying asleep', score: -2 },
      { value: 'snoring', label: 'Snoring', score: -1 },
      { value: 'apnea', label: 'Sleep apnea', score: -3 },
      { value: 'restless', label: 'Restless legs', score: -1 }
    ]
  },
  // Stress
  {
    id: 'stress_level',
    category: 'stress',
    question: 'How would you rate your current stress level?',
    type: 'scale',
    min: 1,
    max: 10,
    info: '1 = No stress, 10 = Extremely stressed'
  },
  {
    id: 'stress_management',
    category: 'stress',
    question: 'How do you typically manage stress?',
    type: 'multiple',
    options: [
      { value: 'exercise', label: 'Exercise', score: 3 },
      { value: 'meditation', label: 'Meditation/Yoga', score: 3 },
      { value: 'hobbies', label: 'Hobbies', score: 2 },
      { value: 'social', label: 'Talking to friends/family', score: 2 },
      { value: 'nothing', label: 'No specific method', score: 0 },
      { value: 'unhealthy', label: 'Unhealthy coping (smoking, drinking, etc.)', score: -3 }
    ]
  },
  // General Health
  {
    id: 'chronic_conditions',
    category: 'general',
    question: 'Do you have any chronic health conditions?',
    type: 'multiple',
    options: [
      { value: 'none', label: 'None', score: 10 },
      { value: 'diabetes', label: 'Diabetes', score: -3 },
      { value: 'hypertension', label: 'Hypertension', score: -2 },
      { value: 'asthma', label: 'Asthma', score: -1 },
      { value: 'arthritis', label: 'Arthritis', score: -1 },
      { value: 'thyroid', label: 'Thyroid disorder', score: -1 },
      { value: 'other', label: 'Other', score: -1 }
    ]
  },
  {
    id: 'medications',
    category: 'general',
    question: 'Are you currently taking any regular medications?',
    type: 'boolean',
    options: [
      { value: 'no', label: 'No', score: 5 },
      { value: 'yes', label: 'Yes', score: 0 }
    ]
  },
  {
    id: 'last_checkup',
    category: 'general',
    question: 'When was your last general health checkup?',
    type: 'single',
    options: [
      { value: '<6months', label: 'Within last 6 months', score: 10 },
      { value: '6-12months', label: '6-12 months ago', score: 8 },
      { value: '1-2years', label: '1-2 years ago', score: 5 },
      { value: '2+years', label: 'More than 2 years ago', score: 2 },
      { value: 'never', label: 'Never had one', score: 0 }
    ]
  },
  {
    id: 'energy_level',
    category: 'general',
    question: 'How would you rate your daily energy levels?',
    type: 'scale',
    min: 1,
    max: 10,
    info: '1 = Very low, 10 = Very high'
  }
];

const HealthCheckupsPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'intro' | 'assessment' | 'results'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [results, setResults] = useState<HealthMetrics | null>(null);
  const [categoryResults, setCategoryResults] = useState<AssessmentResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const currentQuestion = healthQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / healthQuestions.length) * 100;

  const handleAnswer = (value: any) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < healthQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      calculateResults();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateBMI = (height: number, weight: number): { bmi: number; category: string } => {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    let category = '';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';

    return { bmi: Math.round(bmi * 10) / 10, category };
  };

  const calculateResults = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      // Calculate BMI
      const bmiResult = calculateBMI(answers.height || 170, answers.weight || 70);

      // Calculate category scores
      const categories = ['heart', 'nutrition', 'sleep', 'stress', 'general'];
      const categoryScores: AssessmentResult[] = categories.map(cat => {
        const categoryQuestions = healthQuestions.filter(q => q.category === cat);
        let totalScore = 0;
        let maxScore = 0;

        categoryQuestions.forEach(q => {
          const answer = answers[q.id];
          if (q.type === 'scale') {
            totalScore += answer || 5;
            maxScore += 10;
          } else if (q.type === 'single' || q.type === 'boolean') {
            const option = q.options?.find(o => o.value === answer);
            totalScore += option?.score || 0;
            maxScore += 10;
          } else if (q.type === 'multiple') {
            const selected = answer || [];
            selected.forEach((val: string) => {
              const option = q.options?.find(o => o.value === val);
              totalScore += option?.score || 0;
            });
            maxScore += 10;
          }
        });

        const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
        let status: AssessmentResult['status'];
        if (percentage >= 80) status = 'excellent';
        else if (percentage >= 60) status = 'good';
        else if (percentage >= 40) status = 'fair';
        else if (percentage >= 20) status = 'poor';
        else status = 'critical';

        const recommendations = getRecommendations(cat, percentage, answers);
        const icons: Record<string, React.ReactNode> = {
          heart: <Heart className="w-6 h-6" />,
          nutrition: <Apple className="w-6 h-6" />,
          sleep: <Moon className="w-6 h-6" />,
          stress: <Brain className="w-6 h-6" />,
          general: <Activity className="w-6 h-6" />
        };

        return {
          category: cat.charAt(0).toUpperCase() + cat.slice(1),
          score: Math.round(percentage),
          maxScore: 100,
          status,
          recommendations,
          icon: icons[cat]
        };
      });

      setCategoryResults(categoryScores);

      // Calculate overall health score
      const overallScore = categoryScores.reduce((acc, cat) => acc + cat.score, 0) / categoryScores.length;

      setResults({
        bmi: bmiResult.bmi,
        bmiCategory: bmiResult.category,
        heartRisk: 100 - (categoryScores.find(c => c.category === 'Heart')?.score || 0),
        diabetesRisk: calculateDiabetesRisk(answers),
        sleepQuality: categoryScores.find(c => c.category === 'Sleep')?.score || 0,
        stressLevel: 100 - (categoryScores.find(c => c.category === 'Stress')?.score || 0),
        overallHealth: Math.round(overallScore)
      });

      setIsCalculating(false);
      setCurrentStep('results');
    }, 2000);
  };

  const calculateDiabetesRisk = (answers: Record<string, any>): number => {
    let risk = 0;
    if (answers.age > 45) risk += 15;
    if (answers.bmi > 25) risk += 20;
    if (answers.exercise_frequency === 'never') risk += 15;
    if (answers.family_heart === 'yes') risk += 10;
    if (answers.fast_food === 'daily') risk += 15;
    return Math.min(risk, 100);
  };

  const getRecommendations = (category: string, score: number, answers: Record<string, any>): string[] => {
    const recommendations: string[] = [];
    
    switch (category) {
      case 'heart':
        if (answers.exercise_frequency === 'never') {
          recommendations.push('Start with 15-20 minutes of walking daily');
        }
        if (answers.smoking !== 'never') {
          recommendations.push('Consider a smoking cessation program');
        }
        if (score < 60) {
          recommendations.push('Schedule a cardiovascular health screening');
        }
        break;
      case 'nutrition':
        if (answers.fruits_vegetables === '0' || answers.fruits_vegetables === '1-2') {
          recommendations.push('Aim for at least 5 servings of fruits and vegetables daily');
        }
        if (answers.water_intake === '1-2' || answers.water_intake === '3-4') {
          recommendations.push('Increase water intake to at least 8 glasses per day');
        }
        if (answers.fast_food === 'daily' || answers.fast_food === 'several') {
          recommendations.push('Reduce processed food consumption and cook more meals at home');
        }
        break;
      case 'sleep':
        if (answers.sleep_hours === '<5' || answers.sleep_hours === '5-6') {
          recommendations.push('Aim for 7-8 hours of sleep per night');
        }
        if (answers.sleep_quality < 6) {
          recommendations.push('Establish a consistent bedtime routine');
          recommendations.push('Avoid screens 1 hour before bed');
        }
        break;
      case 'stress':
        if (answers.stress_level > 7) {
          recommendations.push('Consider practicing daily meditation or deep breathing');
          recommendations.push('Speak with a mental health professional if stress persists');
        }
        break;
      case 'general':
        if (answers.last_checkup === '2+years' || answers.last_checkup === 'never') {
          recommendations.push('Schedule a comprehensive health checkup');
        }
        if (answers.energy_level < 5) {
          recommendations.push('Get blood work done to check for nutritional deficiencies');
        }
        break;
    }

    if (recommendations.length === 0) {
      recommendations.push('Keep up the great work! Maintain your healthy habits.');
    }

    return recommendations;
  };

  // Download report functionality
  const downloadReport = () => {
    const reportData = {
      assessmentDate: new Date().toLocaleDateString(),
      patientInfo: {
        age: answers.age,
        gender: answers.gender,
        height: `${answers.height} cm`,
        weight: `${answers.weight} kg`,
        bmi: results?.bmi?.toFixed(1),
        bmiCategory: results?.bmiCategory,
      },
      healthMetrics: results,
      categoryResults: categoryResults,
      recommendations: categoryResults.flatMap(cat => cat.recommendations),
    };

    const reportContent = `
HEALTH ASSESSMENT REPORT
========================

Assessment Date: ${reportData.assessmentDate}

PATIENT INFORMATION
------------------
Age: ${reportData.patientInfo.age} years
Gender: ${reportData.patientInfo.gender}
Height: ${reportData.patientInfo.height}
Weight: ${reportData.patientInfo.weight}
BMI: ${reportData.patientInfo.bmi} (${reportData.patientInfo.bmiCategory})

OVERALL HEALTH SCORE: ${results?.overallHealth}/100

HEALTH METRICS
--------------
Heart Disease Risk: ${results?.heartRisk}%
Diabetes Risk: ${results?.diabetesRisk}%
Sleep Quality: ${results?.sleepQuality}/10
Stress Level: ${results?.stressLevel}/10

DETAILED RESULTS
----------------
${categoryResults.map(cat => `
${cat.category} Health: ${cat.score}/100 (${cat.status})
Recommendations:
${cat.recommendations.map(rec => `• ${rec}`).join('\n')}
`).join('\n')}

RECOMMENDATIONS SUMMARY
-----------------------
${reportData.recommendations.map(rec => `• ${rec}`).join('\n')}

DISCLAIMER
----------
This assessment is for informational purposes only and is not a substitute 
for professional medical advice, diagnosis, or treatment. Always seek the 
advice of your physician or other qualified health provider with any 
questions you may have regarding a medical condition.

Generated by Kiangombe Health Center
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-assessment-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetAssessment = () => {
    setCurrentStep('intro');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResults(null);
    setCategoryResults([]);
  };

  const getStatusColor = (status: AssessmentResult['status']) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    if (score >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    if (score >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <AnimatePresence mode="wait">
          {/* Intro Screen */}
          {currentStep === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mb-4"
                >
                  <Stethoscope className="w-10 h-10 text-white" />
                </motion.div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Assessment</h1>
                <p className="text-gray-600 max-w-xl mx-auto">
                  Take our comprehensive health assessment to understand your current health status
                  and get personalized recommendations.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {[
                  { icon: Heart, title: 'Heart Health', desc: 'Assess cardiovascular risk factors', color: 'red' },
                  { icon: Apple, title: 'Nutrition', desc: 'Evaluate your dietary habits', color: 'green' },
                  { icon: Moon, title: 'Sleep Quality', desc: 'Analyze your sleep patterns', color: 'indigo' },
                  { icon: Brain, title: 'Stress Levels', desc: 'Measure mental wellness', color: 'purple' }
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <div className={`inline-flex items-center justify-center w-12 h-12 bg-${item.color}-100 rounded-lg mb-4`}>
                        <item.icon className={`w-6 h-6 text-${item.color}-600`} />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Card className="p-6 bg-blue-50 border-blue-200 mb-8">
                <div className="flex items-start gap-4">
                  <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Before you begin</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• This assessment takes approximately 5-10 minutes</li>
                      <li>• Have your height and weight measurements ready</li>
                      <li>• Answer honestly for accurate results</li>
                      <li>• This is not a substitute for professional medical advice</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <div className="text-center">
                <Button
                  onClick={() => setCurrentStep('assessment')}
                  className="px-8 py-3 text-lg"
                >
                  Start Assessment
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Assessment Questions */}
          {currentStep === 'assessment' && (
            <motion.div
              key="assessment"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Question {currentQuestionIndex + 1} of {healthQuestions.length}
                  </span>
                  <span className="text-sm font-medium text-gray-600">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Category Badge */}
              <div className="flex justify-center mb-6">
                <span className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 capitalize">
                  {currentQuestion.category === 'basic' ? '📋 Basic Information' :
                   currentQuestion.category === 'heart' ? '❤️ Heart Health' :
                   currentQuestion.category === 'nutrition' ? '🍎 Nutrition' :
                   currentQuestion.category === 'sleep' ? '🌙 Sleep' :
                   currentQuestion.category === 'stress' ? '🧠 Stress' :
                   '🏥 General Health'}
                </span>
              </div>

              {/* Question Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-8 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {currentQuestion.question}
                    </h2>
                    
                    {currentQuestion.info && (
                      <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        {currentQuestion.info}
                      </p>
                    )}

                    {/* Number Input */}
                    {currentQuestion.type === 'number' && (
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          min={currentQuestion.min}
                          max={currentQuestion.max}
                          value={answers[currentQuestion.id] || ''}
                          onChange={(e) => handleAnswer(parseFloat(e.target.value))}
                          className="w-32 px-4 py-3 text-2xl font-bold text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          placeholder="0"
                        />
                        <span className="text-lg text-gray-600">{currentQuestion.unit}</span>
                      </div>
                    )}

                    {/* Scale Input */}
                    {currentQuestion.type === 'scale' && (
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Low</span>
                          <span>High</span>
                        </div>
                        <div className="flex gap-2">
                          {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                            <button
                              key={num}
                              onClick={() => handleAnswer(num)}
                              className={`flex-1 py-4 rounded-lg text-lg font-bold transition-all ${
                                answers[currentQuestion.id] === num
                                  ? 'bg-blue-600 text-white scale-110'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Single Choice */}
                    {(currentQuestion.type === 'single' || currentQuestion.type === 'boolean') && (
                      <div className="grid gap-3">
                        {currentQuestion.options?.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleAnswer(option.value)}
                            className={`p-4 rounded-lg border-2 text-left transition-all ${
                              answers[currentQuestion.id] === option.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                answers[currentQuestion.id] === option.value
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300'
                              }`}>
                                {answers[currentQuestion.id] === option.value && (
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                )}
                              </div>
                              <span className="font-medium text-gray-900">{option.label}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Multiple Choice */}
                    {currentQuestion.type === 'multiple' && (
                      <div className="grid gap-3">
                        {currentQuestion.options?.map((option) => {
                          const selected = (answers[currentQuestion.id] || []).includes(option.value);
                          return (
                            <button
                              key={option.value}
                              onClick={() => {
                                const current = answers[currentQuestion.id] || [];
                                if (option.value === 'none') {
                                  handleAnswer(['none']);
                                } else {
                                  const filtered = current.filter((v: string) => v !== 'none');
                                  if (selected) {
                                    handleAnswer(filtered.filter((v: string) => v !== option.value));
                                  } else {
                                    handleAnswer([...filtered, option.value]);
                                  }
                                }
                              }}
                              className={`p-4 rounded-lg border-2 text-left transition-all ${
                                selected
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  selected
                                    ? 'border-blue-500 bg-blue-500'
                                    : 'border-gray-300'
                                }`}>
                                  {selected && <CheckCircle className="w-3 h-3 text-white" />}
                                </div>
                                <span className="font-medium text-gray-900">{option.label}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Previous
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={answers[currentQuestion.id] === undefined}
                >
                  {currentQuestionIndex === healthQuestions.length - 1 ? (
                    <>
                      Get Results
                      <Sparkles className="w-5 h-5 ml-1" />
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-5 h-5 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Calculating Screen */}
          {isCalculating && (
            <motion.div
              key="calculating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mb-6"
              >
                <Activity className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Results</h2>
              <p className="text-gray-600">Please wait while we calculate your health score...</p>
            </motion.div>
          )}

          {/* Results Screen */}
          {currentStep === 'results' && results && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Overall Score */}
              <Card className="p-8 mb-8 bg-gradient-to-r from-blue-600 to-green-600 text-white">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Your Overall Health Score</h2>
                  <div className="relative inline-flex items-center justify-center w-40 h-40 mb-4">
                    <svg className="absolute w-40 h-40 transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="12"
                        fill="none"
                      />
                      <motion.circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="white"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: '0 440' }}
                        animate={{ strokeDasharray: `${(results.overallHealth / 100) * 440} 440` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                      />
                    </svg>
                    <motion.span
                      className="text-5xl font-bold"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {results.overallHealth}
                    </motion.span>
                  </div>
                  <p className="text-lg opacity-90">
                    {results.overallHealth >= 80 ? "Excellent! You're in great health!" :
                     results.overallHealth >= 60 ? "Good health with room for improvement" :
                     results.overallHealth >= 40 ? "Fair health - consider lifestyle changes" :
                     "Your health needs attention - consult a doctor"}
                  </p>
                </div>
              </Card>

              {/* BMI Card */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-blue-600" />
                    Body Mass Index (BMI)
                  </h3>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-2">{results.bmi}</div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      results.bmiCategory === 'Normal' ? 'bg-green-100 text-green-700' :
                      results.bmiCategory === 'Overweight' ? 'bg-yellow-100 text-yellow-700' :
                      results.bmiCategory === 'Obese' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {results.bmiCategory}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Underweight</span>
                      <span>Normal</span>
                      <span>Overweight</span>
                      <span>Obese</span>
                    </div>
                    <div className="h-3 rounded-full bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-400 relative">
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-gray-800 shadow"
                        style={{ left: `${Math.min(Math.max(((results.bmi || 18) - 15) / 25 * 100, 0), 100)}%` }}
                      />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    Risk Indicators
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Heart Disease Risk</span>
                        <span className={`text-sm font-medium ${getScoreColor(100 - results.heartRisk)}`}>
                          {results.heartRisk}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-full rounded-full ${getProgressColor(100 - results.heartRisk)}`}
                          style={{ width: `${results.heartRisk}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Diabetes Risk</span>
                        <span className={`text-sm font-medium ${getScoreColor(100 - results.diabetesRisk)}`}>
                          {results.diabetesRisk}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-full rounded-full ${getProgressColor(100 - results.diabetesRisk)}`}
                          style={{ width: `${results.diabetesRisk}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Category Results */}
              <h3 className="text-xl font-bold text-gray-900 mb-4">Detailed Results</h3>
              <div className="grid gap-4 mb-8">
                {categoryResults.map((category, index) => (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${getStatusColor(category.status)}`}>
                          {category.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{category.category} Health</h4>
                            <span className={`text-2xl font-bold ${getScoreColor(category.score)}`}>
                              {category.score}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full mb-4">
                            <motion.div
                              className={`h-full rounded-full ${getProgressColor(category.score)}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${category.score}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                            />
                          </div>
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium text-gray-700">Recommendations:</h5>
                            <ul className="space-y-1">
                              {category.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-4 justify-center">
                <Button onClick={resetAssessment} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake Assessment
                </Button>
                <Button onClick={downloadReport} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
                <Button onClick={() => window.location.href = '/appointments'}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Consultation
                </Button>
              </div>

              {/* Disclaimer */}
              <Card className="p-4 mt-8 bg-yellow-50 border-yellow-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    <strong>Disclaimer:</strong> This assessment is for informational purposes only and is not a substitute 
                    for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician 
                    or other qualified health provider with any questions you may have regarding a medical condition.
                  </p>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HealthCheckupsPage;