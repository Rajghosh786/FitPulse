import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { motion } from 'framer-motion';
import { FiActivity, FiTarget, FiUser, FiCalendar } from 'react-icons/fi';
import { Line, Pie } from 'react-chartjs-2';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler  // Add this import
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler  // Add Filler plugin
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: 'rgb(209, 213, 219)', // text-gray-300
        padding: 20,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgb(17, 24, 39)', // bg-gray-900
      titleColor: 'rgb(255, 255, 255)',
      bodyColor: 'rgb(209, 213, 219)',
      borderColor: 'rgb(75, 85, 99)', // gray-600
      borderWidth: 1,
      padding: 12,
      boxPadding: 6
    }
  }
};

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState({
    diet: '',
    workout: '',
    avoid: '',
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
        // Get token from localStorage
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
        
        // Generate AI recommendations if they don't exist or are older than 24 hours
        if (!response.data.aiRecommendations?.lastUpdated || 
            isOlderThan24Hours(new Date(response.data.aiRecommendations.lastUpdated))) {
            await generateAIRecommendations(response.data);
        } else {
            setAiRecommendations(response.data.aiRecommendations);
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        if (error.response?.status === 401) {
            navigate('/login');
        }
    } finally {
        setLoading(false);
    }
};

const generateAIRecommendations = async (user) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `As a fitness expert, provide personalized recommendations for a person with the following details:
            - Height: ${user.height}cm
            - Weight: ${user.weight}kg
            - BMI: ${user.bmi}
            - Fitness Goal: ${user.fitnessGoal}
            - Target Weight: ${user.targetWeight}kg
            - Diet: ${user.dietaryPreference}
            - Meals per day: ${user.mealsPerDay}
            - Food allergies: ${user.hasAllergies ? 'Yes' : 'No'}

            Provide three sections:
            1. Diet Plan
            2. Workout Routine
            3. Foods to Avoid`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Parse AI response into sections
        const sections = text.split(/\d\./);
        const recommendations = {
            diet: sections[1]?.trim() || '',
            workout: sections[2]?.trim() || '',
            avoid: sections[3]?.trim() || ''
        };

        // Update recommendations in the database
        const token = localStorage.getItem('token');
        await axios.post(
            'http://localhost:8000/user/update-profile',
            {
                userId: user._id,
                height: user.height,
                weight: user.weight,
                bmi: user.bmi,
                fitnessGoal: user.fitnessGoal,
                targetWeight: user.targetWeight,
                dietaryPreference: user.dietaryPreference,
                mealsPerDay: user.mealsPerDay,
                hasAllergies: user.hasAllergies,
                aiRecommendations: recommendations
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        setAiRecommendations(recommendations);
    } catch (error) {
        console.error('Error generating AI recommendations:', error);
        if (error.response) {
            console.error('Server response:', error.response.data);
        }
    }
};

const isOlderThan24Hours = (date) => {
    const hours = Math.abs(new Date() - date) / 36e5;
    return hours > 24;
};

  const bmiChartData = {
    labels: ['Underweight', 'Normal', 'Overweight', 'Obese'],
    datasets: [{
      data: [18.5, 24.9, 29.9, 30],
      backgroundColor: [
        'rgba(54, 162, 235, 0.8)',  // Blue for Underweight
        'rgba(75, 192, 192, 0.8)',  // Green for Normal
        'rgba(255, 206, 86, 0.8)',  // Yellow for Overweight
        'rgba(255, 99, 132, 0.8)',  // Red for Obese
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(255, 99, 132, 1)',
      ],
      borderWidth: 2,
      hoverOffset: 4
    }]
  };

  const weightProjectionData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [{
      label: 'Projected Weight',
      data: calculateWeightProjection(),
      borderColor: 'rgb(14, 165, 233)', // sky-500
      backgroundColor: 'rgba(14, 165, 233, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: 'rgb(14, 165, 233)',
      pointBorderColor: 'rgb(255, 255, 255)',
      pointHoverRadius: 8,
      pointHoverBackgroundColor: 'rgb(255, 255, 255)',
      pointHoverBorderColor: 'rgb(14, 165, 233)',
    }]
  };

  const pieOptions = {
    ...chartOptions,
    cutout: '65%',
    radius: '90%'
  };
  
  const lineOptions = {
    ...chartOptions,
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: 'rgb(209, 213, 219)'
        }
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: 'rgb(209, 213, 219)',
          callback: (value) => `${value}kg`
        }
      }
    },
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          label: (context) => `Weight: ${context.parsed.y}kg`
        }
      }
    }
  };
  
  function calculateWeightProjection() {
    if (!userData) return [];
    
    const weeklyChange = userData.fitnessGoal === 'Weight Loss' ? -0.5 : 
                        userData.fitnessGoal === 'Weight Gain' ? 0.5 : 0;
    
    return Array(6).fill().map((_, i) => 
      Number(userData.weight) + (weeklyChange * (i + 1))
    );
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50">
            <FiUser className="w-8 h-8 text-sky-500 mb-4" />
            <h3 className="text-lg font-semibold">Current BMI</h3>
            <p className="text-2xl font-bold">{userData?.bmi}</p>
          </div>
          
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50">
            <FiTarget className="w-8 h-8 text-sky-500 mb-4" />
            <h3 className="text-lg font-semibold">Goal</h3>
            <p className="text-2xl font-bold">{userData?.fitnessGoal}</p>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50">
            <FiActivity className="w-8 h-8 text-sky-500 mb-4" />
            <h3 className="text-lg font-semibold">Target Weight</h3>
            <p className="text-2xl font-bold">{userData?.targetWeight} kg</p>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50">
            <FiCalendar className="w-8 h-8 text-sky-500 mb-4" />
            <h3 className="text-lg font-semibold">Meals/Day</h3>
            <p className="text-2xl font-bold">{userData?.mealsPerDay}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50">
            <h3 className="text-xl font-semibold mb-4">BMI Distribution</h3>
            <div className="relative h-[300px]">
              <Pie data={bmiChartData} options={pieOptions} />
              {userData?.bmi && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <p className="text-3xl font-bold text-sky-500">{userData.bmi}</p>
                  <p className="text-sm text-gray-400">Your BMI</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50">
            <h3 className="text-xl font-semibold mb-4">Weight Projection</h3>
            <div className="h-[300px]">
              <Line data={weightProjectionData} options={lineOptions} />
            </div>
            {userData?.fitnessGoal !== 'Health Maintenance' && (
              <div className="mt-4 text-center text-sm text-gray-400">
                <p>Projected {userData?.fitnessGoal === 'Weight Loss' ? 'loss' : 'gain'} of 0.5kg per week</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50">
            <h3 className="text-xl font-semibold mb-4">Personalized Diet Plan</h3>
            <p className="text-gray-300 whitespace-pre-line">{aiRecommendations.diet}</p>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50">
            <h3 className="text-xl font-semibold mb-4">Workout Recommendations</h3>
            <p className="text-gray-300 whitespace-pre-line">{aiRecommendations.workout}</p>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50">
            <h3 className="text-xl font-semibold mb-4">Foods to Avoid</h3>
            <p className="text-gray-300 whitespace-pre-line">{aiRecommendations.avoid}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;