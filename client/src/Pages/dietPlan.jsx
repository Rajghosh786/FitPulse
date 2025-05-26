import { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DietHistoryModal from '../Components/DietHistoryModal';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const questions = [
  {
    question: "What's your primary fitness goal?",
    options: ["Weight Loss", "Muscle Gain", "Maintenance"],
    key: "goal",
  },
  {
    question: "What's your dietary preference?",
    options: ["Vegetarian", "Vegan", "Non-Vegetarian"],
    key: "preference",
  },
  {
    question: "How many meals do you prefer daily?",
    options: ["3", "4", "5+"],
    key: "mealsPerDay",
  },
];

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DietPlan = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [plans, setPlans] = useState({});
  const [loadingDay, setLoadingDay] = useState(null);
  const [openDay, setOpenDay] = useState(null);
  const [savedDays, setSavedDays] = useState({});
  const [userData, setUserData] = useState(null);
  const [fitnessFact, setFitnessFact] = useState('');
  const [loadingFact, setLoadingFact] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDietPlan, setSelectedDietPlan] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDays, setGeneratedDays] = useState(new Set());
  const pdfRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    generateFitnessFact();
  }, []);

  useEffect(() => {
    if (currentQuestion >= questions.length) {
      setIsGenerating(true);
      generateFullWeekPlan();
    }
  }, [currentQuestion]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:8000/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const generateFitnessFact = async () => {
    setLoadingFact(true);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Generate a random interesting fitness fact related to one of these topics:
    - Weight loss tips
    - Muscle building facts
    - Nutrition science
    - Exercise benefits
    Keep it concise (2-3 sentences) and engaging.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setFitnessFact(response.text());
    } catch (error) {
      console.error('Error generating fact:', error);
      setFitnessFact('Unable to load fitness fact. Please try again.');
    } finally {
      setLoadingFact(false);
    }
  };

  const generateDietPlan = async (day) => {
    setLoadingDay(day);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Create a structured ${answers.preference} diet plan for ${answers.goal}, with ${answers.mealsPerDay} meals for ${day}.
    
    Format the response as follows:
    Morning (Time: 7-9 AM)
    • Meal item 1 with portion size
    • Meal item 2 with portion size
    • Add calorie count

    Mid-Morning (Time: 11 AM)
    • Snack items with portions
    • Add calorie count

    Lunch (Time: 1-2 PM)
    • Main dish with portion
    • Side items with portions
    • Add calorie count

    Evening Snack (Time: 4-5 PM)
    • Healthy snack options
    • Add calorie count

    Dinner (Time: 7-8 PM)
    • Main dish with portion
    • Side items with portions
    • Add calorie count

    Total daily calories: [Sum]
    Protein: [g] | Carbs: [g] | Fats: [g]

    Add emojis for visual appeal and keep formatting clean.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();
        setPlans((prev) => ({ ...prev, [day]: text }));
    } catch (err) {
        console.error("Error generating:", err);
        setPlans((prev) => ({ ...prev, [day]: "❌ Failed to generate. Try again." }));
    } finally {
        setLoadingDay(null);
        setGeneratedDays(prev => new Set([...prev, day]));
    }
  };

  const generateFullWeekPlan = async () => {
    setIsGenerating(true);
    try {
      for (const day of daysOfWeek) {
        await generateDietPlan(day);
        setGeneratedDays(prev => new Set([...prev, day]));
      }
    } catch (error) {
      console.error('Error generating full week plan:', error);
      toast.error('Failed to generate some days. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleDay = (day) => {
    setOpenDay((prev) => (prev === day ? null : day));
  };

  const handleSave = (day) => {
    setSavedDays((prev) => ({ ...prev, [day]: true }));
    // Hook Firebase or local storage here
  };

  const handleAnswer = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setCurrentQuestion((prev) => prev + 1);
  };

  const handleDownloadPDF = async () => {
    const input = pdfRef.current;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('DietPlan.pdf');
  };

  const handleSaveWeeklyPlan = async () => {
    try {
        setSaving(true);
        const token = localStorage.getItem('token');
        
        // Create complete weekly plan object
        const weeklyPlan = {
            plans: plans,  // Complete 7-day plan
            goal: answers.goal,
            preference: answers.preference,
            mealsPerDay: answers.mealsPerDay
        };

        const response = await axios.post('http://localhost:8000/user/save-diet', 
            weeklyPlan,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        // Update local state with new history
        setUserData(prev => ({
            ...prev,
            dietHistory: response.data.dietHistory
        }));

        toast.success('Weekly meal plan saved successfully!');
    } catch (error) {
        console.error('Error saving meal plan:', error);
        toast.error('Failed to save meal plan');
    } finally {
        setSaving(false);
    }
  };

  const formatPlan = (plan) => {
    const sections = plan
      .split(/(?=Breakfast|Lunch|Dinner|Snack|Snacks)/gi)
      .map((sec, idx) => (
        <div key={idx} className="border-b border-gray-700 pb-3 mb-3">
          <h4 className="text-lg text-purple-400 font-semibold mb-1">
            {sec.split('\n')[0].trim()}
          </h4>
          <p className="text-sm text-gray-300 whitespace-pre-wrap">
            {sec.split('\n').slice(1).join('\n').replace(/\*/g, '').trim()}
          </p>
        </div>
      ));
    return sections;
  };

  const handleDietHistoryClick = (historyItem) => {
    setSelectedDietPlan(historyItem);
    setIsHistoryModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">Your Custom Diet Plan</h1>
          <p className="text-gray-400">Personalized nutrition guidance for your fitness journey</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Diet History (col-span-1) */}
          <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Previous Plans</h2>
              <span className="text-sm text-gray-400">
                {userData?.dietHistory?.length || 0} saved plans
              </span>
            </div>

            <div className="space-y-4">
              {userData?.dietHistory?.slice(0, 3).map((history, index) => (
                <motion.div 
                  key={index}
                  className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/30 
                             hover:border-sky-500/50 transition-all cursor-pointer"
                  onClick={() => handleDietHistoryClick(history)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium text-white">{history.goal}</h3>
                    <span className="text-xs text-gray-500">
                      {new Date(history.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {history.preference} • {history.mealsPerDay} meals/day
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Center Column - Diet Days List (col-span-2) */}
          <div className="lg:col-span-2">
            {currentQuestion < questions.length ? (
              <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-8 border border-gray-700/50">
                <div className="mb-8">
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-400">Step {currentQuestion + 1} of {questions.length}</span>
                    <span className="text-sky-400">{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 h-2 rounded-full">
                    <div 
                      className="bg-sky-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <h2 className="text-2xl font-semibold text-white mb-6">
                  {questions[currentQuestion].question}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {questions[currentQuestion].options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAnswer(questions[currentQuestion].key, option)}
                      className="bg-gray-700/50 hover:bg-sky-600/20 border border-gray-600 hover:border-sky-500 
                               text-white px-6 py-4 rounded-xl transition-all duration-300"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Plan Header */}
                <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-700/50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-semibold text-white mb-2">Weekly Meal Plan</h2>
                      <p className="text-gray-400">
                        {answers.goal} • {answers.preference} • {answers.mealsPerDay} meals/day
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={handleSaveWeeklyPlan}
                        disabled={saving || isGenerating || generatedDays.size < 7}
                        className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-xl 
                                 transition-all duration-300 disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : isGenerating ? 'Generating...' : 'Save Plan'}
                      </button>
                      <button
                        onClick={handleDownloadPDF}
                        disabled={isGenerating || generatedDays.size < 7}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl 
                                 transition-all duration-300 disabled:opacity-50"
                      >
                        Download PDF
                      </button>
                    </div>
                  </div>
                </div>

                {/* Days List */}
                <div className="space-y-4">
                  {daysOfWeek.map((day) => (
                    <div 
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700/50 
                                cursor-pointer hover:border-sky-500/50 transition-all
                                ${openDay === day ? 'border-sky-500' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-white">{day}</h3>
                        {loadingDay === day ? (
                          <span className="text-purple-400 animate-pulse">Generating...</span>
                        ) : (
                          <span className="text-sky-400">{plans[day] ? '✓' : '...'}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Day Detail View (col-span-1) */}
          <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-700/50">
            {openDay ? (
              <div className="h-full">
                <h2 className="text-2xl font-semibold text-white mb-4">{openDay}'s Diet</h2>
                <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
                  {loadingDay === openDay ? (
                    <p className="text-center text-purple-300 animate-pulse">⏳ Generating...</p>
                  ) : plans[openDay] ? (
                    <div className="space-y-3">
                      {formatPlan(plans[openDay])}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center">Select a day to view details</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-center">Select a day to view details</p>
            )}
          </div>
        </div>
      </div>

      <DietHistoryModal 
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        dietPlan={selectedDietPlan}
      />
    </div>
  );
};

export default DietPlan;
