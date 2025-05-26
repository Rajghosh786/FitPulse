import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar, Radar, Doughnut } from 'react-chartjs-2';
import { FiActivity, FiTrendingUp, FiAward, FiCalendar } from 'react-icons/fi';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { toast } from 'react-toastify';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    RadialLinearScale,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import LogEntry from '../Components/LogEntry';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    RadialLinearScale,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const Progress = () => {
    const [timeframe, setTimeframe] = useState('weekly');
    const [userData, setUserData] = useState(null);
    const [insights, setInsights] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedMetric, setSelectedMetric] = useState('weight');
    const [progressData, setProgressData] = useState(null);
    const [chartData, setChartData] = useState({
        weightChartData: null,
        workoutChartData: null,
        measurementsChartData: null,
        goalChartData: null
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUserProgress();
    }, [timeframe]);

    useEffect(() => {
        if (progressData?.metrics) {
            const generatedChartData = generateChartData(progressData.metrics, timeframe);
            setChartData(generatedChartData);
        }
    }, [progressData, timeframe]);

    const fetchUserProgress = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('No authorization token found');
            }

            const response = await axios.get(`http://localhost:8000/user/progress/${timeframe}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.data) {
                throw new Error('No data received from server');
            }

            setProgressData(response.data);
            
            // Only generate insights if we have data
            if (response.data.metrics && response.data.metrics.length > 0) {
                await generateInsights(response.data);
            }
        } catch (error) {
            console.error('Error fetching progress:', error);
            setError(error.message);
            toast.error('Failed to load progress data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const generateInsights = async (data) => {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `Analyze this fitness progress data and provide 3-4 key insights and recommendations:
                ${JSON.stringify(data)}
                Focus on trends, improvements, and areas needing attention.
                Format the response in bullet points.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            setInsights(response.text());
        } catch (error) {
            console.error('Error generating insights:', error);
            setInsights('Unable to generate insights at the moment.');
        }
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.7)'
                }
            },
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.7)'
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: 'rgba(255, 255, 255, 0.7)'
                }
            }
        }
    };

    const generateChartData = (metrics, timeframe) => {
        if (!metrics || metrics.length === 0) {
            return {
                weightChartData: null,
                workoutChartData: null,
                measurementsChartData: null,
                goalChartData: null
            };
        }

        // Weight Progress Chart
        const weightChartData = {
            labels: metrics.map(d => new Date(d.createdAt).toLocaleDateString()),
            datasets: [{
                label: 'Weight (kg)',
                data: metrics.map(d => d.weightLog),
                borderColor: 'rgb(14, 165, 233)',
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                fill: true
            }]
        };

        // Workout Statistics Chart
        const workoutChartData = {
            labels: metrics.map(d => new Date(d.createdAt).toLocaleDateString()),
            datasets: [{
                label: 'Workouts Completed',
                data: metrics.map(d => d.workoutsCompleted),
                backgroundColor: 'rgba(14, 165, 233, 0.7)'
            }]
        };

        // Body Measurements Chart
        const measurementsChartData = {
            labels: ['Chest', 'Waist', 'Hips', 'Arms', 'Thighs'],
            datasets: [{
                label: 'Current Measurements (cm)',
                data: metrics[0]?.measurements ? [
                    metrics[0].measurements.chest,
                    metrics[0].measurements.waist,
                    metrics[0].measurements.hips,
                    metrics[0].measurements.arms,
                    metrics[0].measurements.thighs
                ] : [],
                backgroundColor: 'rgba(14, 165, 233, 0.4)',
                borderColor: 'rgb(14, 165, 233)',
                fill: true
            }]
        };

        // Goal Progress Chart
        const goalChartData = {
            labels: ['Completed', 'In Progress'],
            datasets: [{
                data: [
                    progressData.summary.achievedGoals.length,
                    3 - progressData.summary.achievedGoals.length // Assuming 3 total goals
                ],
                backgroundColor: [
                    'rgba(14, 165, 233, 0.7)',
                    'rgba(100, 116, 139, 0.7)'
                ]
            }]
        };

        return {
            weightChartData,
            workoutChartData,
            measurementsChartData,
            goalChartData
        };
    };

    const handleLogSaved = (logData) => {
        // Refresh progress data after new log is saved
        fetchUserProgress();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-8">
            <div className="max-w-7xl mx-auto">
                <LogEntry onLogSaved={handleLogSaved} />

                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
                        <p className="text-gray-400 mt-4">Loading your progress data...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <p className="text-red-400">{error}</p>
                        <button 
                            onClick={fetchUserProgress}
                            className="mt-4 px-4 py-2 bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Header Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <h1 className="text-4xl font-bold text-white mb-4">Your Fitness Journey</h1>
                            <p className="text-gray-400">Track your progress and celebrate your achievements</p>
                        </motion.div>

                        {/* Time Frame Selector */}
                        <div className="flex gap-4 mb-8">
                            <button
                                onClick={() => setTimeframe('weekly')}
                                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                                    timeframe === 'weekly'
                                        ? 'bg-sky-600 text-white'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                            >
                                Weekly
                            </button>
                            <button
                                onClick={() => setTimeframe('monthly')}
                                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                                    timeframe === 'monthly'
                                        ? 'bg-sky-600 text-white'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                            >
                                Monthly
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Stats Cards */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                            >
                                <StatsCard
                                    icon={<FiActivity />}
                                    title="Workouts"
                                    value={progressData?.totalWorkouts || 0}
                                    change="+12%"
                                    positive={true}
                                    timeframe={timeframe}
                                />
                                <StatsCard
                                    icon={<FiTrendingUp />}
                                    title="Weight Change"
                                    value={`${progressData?.weightChange || 0}kg`}
                                    change="-2.5kg"
                                    positive={true}
                                    timeframe={timeframe}
                                />
                                <StatsCard
                                    icon={<FiAward />}
                                    title="Goals Achieved"
                                    value={progressData?.achievedGoals?.length || 0}
                                    change="+2"
                                    positive={true}
                                    timeframe={timeframe}
                                />
                                <StatsCard
                                    icon={<FiCalendar />}
                                    title="Consistency"
                                    value={`${progressData?.consistency || 0}%`}
                                    change="+5%"
                                    positive={true}
                                    timeframe={timeframe}
                                />
                            </motion.div>

                            {/* AI Insights */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="lg:col-span-1 bg-gray-800/50 rounded-xl p-6"
                            >
                                <h3 className="text-xl font-semibold text-white mb-4">AI Insights</h3>
                                <div className="space-y-4 text-gray-300">
                                    {insights ? (
                                        <div dangerouslySetInnerHTML={{ __html: insights.replace(/\n/g, '<br/>') }} />
                                    ) : (
                                        <p>Generating insights...</p>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                            {chartData.weightChartData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gray-800/50 rounded-xl p-6"
                                >
                                    <h3 className="text-xl font-semibold text-white mb-6">Weight Progress</h3>
                                    <div className="h-[300px]">
                                        <Line data={chartData.weightChartData} options={chartOptions} />
                                    </div>
                                </motion.div>
                            )}

                            {chartData.workoutChartData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gray-800/50 rounded-xl p-6"
                                >
                                    <h3 className="text-xl font-semibold text-white mb-6">Workout Statistics</h3>
                                    <div className="h-[300px]">
                                        <Bar data={chartData.workoutChartData} options={chartOptions} />
                                    </div>
                                </motion.div>
                            )}

                            {chartData.measurementsChartData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gray-800/50 rounded-xl p-6"
                                >
                                    <h3 className="text-xl font-semibold text-white mb-6">Body Measurements</h3>
                                    <div className="h-[300px]">
                                        <Radar data={chartData.measurementsChartData} options={chartOptions} />
                                    </div>
                                </motion.div>
                            )}

                            {chartData.goalChartData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gray-800/50 rounded-xl p-6"
                                >
                                    <h3 className="text-xl font-semibold text-white mb-6">Goal Progress</h3>
                                    <div className="h-[300px]">
                                        <Doughnut data={chartData.goalChartData} options={chartOptions} />
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// StatsCard Component
const StatsCard = ({ icon, title, value, change, positive, timeframe }) => (
    <div className="bg-gray-800/50 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-sky-500/20 text-sky-400 rounded-lg">
                {icon}
            </div>
            <div>
                <p className="text-gray-400 text-sm">{title}</p>
                <h4 className="text-2xl font-bold text-white">{value}</h4>
            </div>
        </div>
        <div className={`text-sm ${positive ? 'text-green-400' : 'text-red-400'}`}>
            {change} from last {timeframe}
        </div>
    </div>
);

export default Progress;