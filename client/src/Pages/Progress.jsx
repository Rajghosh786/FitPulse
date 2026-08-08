import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar, Radar, Doughnut } from 'react-chartjs-2';
import { FiActivity, FiTrendingUp, FiAward, FiCalendar } from 'react-icons/fi';
import axios from 'axios';
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
import OnboardingUpdate from './OnboardingUpdate';

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

const Progress = () => {
    const [timeframe, setTimeframe] = useState('weekly');
    const [insights, setInsights] = useState('');
    const [insightNoData, setInsightNoData] = useState(false);
    const [loading, setLoading] = useState(true);
    const [progressData, setProgressData] = useState(null);
    const [userData, setUserData] = useState(null);
    const [onboardingRequired, setOnboardingRequired] = useState(false);
    const [chartData, setChartData] = useState({
        weightChartData: null,
        workoutChartData: null,
        measurementsChartData: null,
        goalChartData: null
    });
    const [error, setError] = useState(null);

    const API = import.meta.env.VITE_API;

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

            // First check user's profile
            const profileResponse = await axios.get(`${API}/user/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setUserData(profileResponse.data);

            const onboardingIncomplete =
                !profileResponse.data?.dietaryPreference ||
                !profileResponse.data?.fitnessGoal ||
                !profileResponse.data?.height ||
                !profileResponse.data?.weight ||
                !profileResponse.data?.mealsPerDay ||
                (
                    profileResponse.data?.fitnessGoal !== "Health Maintenance" &&
                    !profileResponse.data?.targetWeight
                );

            if (onboardingIncomplete) {
                setOnboardingRequired(true);
                return;
            }

            // Profile is complete, so load progress
            setOnboardingRequired(false);

            const response = await axios.get(`${API}/user/progress/${timeframe}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.data) {
                throw new Error('No data received from server');
            }

            setProgressData(response.data);
            setInsights(response.data.insight || '');
            setInsightNoData(response.data.insightNoData || false);
        } catch (error) {
            console.error('Error fetching progress:', error);
            setError(error.message);
            toast.error('Failed to load progress data: ' + error.message);
        } finally {
            setLoading(false);
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
                data: metrics.map(d => d.weightLog ?? d.averageWeight ?? 0),
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
                data: metrics.map(d => d.workoutsCompleted ?? d.totalWorkouts ?? 0),
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
        const achievedCount = progressData.summary?.achievedGoals?.length || progressData.achievedGoals?.length || 0;
        const goalChartData = {
            labels: ['Completed', 'In Progress'],
            datasets: [{
                data: [
                    achievedCount,
                    achievedCount === 0 ? 1 : 0
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

    const handleLogSaved = (saveResponse) => {
        if (saveResponse?.progress) {
            const updated = saveResponse.progress[timeframe];
            if (updated) {
                setProgressData(updated);
                setInsights(updated.insight || '');
                setInsightNoData(updated.insightNoData || false);
            }
        } else {
            fetchUserProgress();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
                    <p className="text-gray-400 mt-4">
                        Loading your progress data...
                    </p>
                </div>
            </div>
        );
    }

    if (onboardingRequired) {
        const token = localStorage.getItem("token");

        return (
            <OnboardingUpdate
                userData={userData}
                userId={userData?._id}
                token={token}
                onComplete={async (updatedUser) => {
                    setUserData(updatedUser);
                    await fetchUserProgress();
                }}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-8">
            <div className="max-w-full mx-auto grid grid-cols-1 lg:grid-cols-4 gap-5">
                <LogEntry 
                  onLogSaved={handleLogSaved}
                  logs={progressData?.dailyLogs || []} 
                />
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 lg:col-span-4 order-first text-center"
                    >
                        <h1 className="text-4xl font-bold text-white mb-4">Your Fitness Journey</h1>
                        <p className="text-gray-400">Track your progress and celebrate your achievements</p>
                    </motion.div>
                {loading ? (
                    <div className="lg:col-start-2 lg:col-span-3 min-h-[500px] flex flex-col items-center justify-center text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
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
                        {/* Time Frame Selector */}
                        <div className="flex items-center gap-2 mb-0 lg:col-start-2 lg:col-span-3">
                            <button
                                onClick={() => setTimeframe('weekly')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                    timeframe === 'weekly'
                                        ? 'bg-sky-600 text-white'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                            >
                                Weekly
                            </button>

                            <button
                                onClick={() => setTimeframe('monthly')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                    timeframe === 'monthly'
                                        ? 'bg-sky-600 text-white'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                            >
                                Monthly
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 lg:col-start-2 lg:col-span-3">
                            {/* Stats Cards */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                            >
                                <StatsCard
                                    icon={<FiActivity />}
                                    title="Workouts"
                                    value={progressData?.totalWorkouts || 0}
                                    timeframe={timeframe}
                                />
                                <StatsCard
                                    icon={<FiTrendingUp />}
                                    title="Weight Change"
                                    value={`${progressData?.weightChange || 0}kg`}
                                    positive={(progressData?.weightChange || 0) <= 0}
                                    timeframe={timeframe}
                                />
                                <StatsCard
                                    icon={<FiAward />}
                                    title="Goals Achieved"
                                    value={progressData?.achievedGoals?.length || 0}
                                    timeframe={timeframe}
                                />
                                <StatsCard
                                    icon={<FiCalendar />}
                                    title="Consistency"
                                    value={`${progressData?.consistency || 0}%`}
                                    timeframe={timeframe}
                                />
                            </motion.div>
                        </div>
                                
                        {/* AI Insights */}
                        <div className="mt-0 lg:col-start-2 lg:col-span-3">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="lg:col-span-3 bg-gray-800/50 rounded-xl p-5"
                            >
                                <h3 className="text-xl font-semibold text-white mb-4">AI Insights</h3>
                                <div className="space-y-4 text-gray-300">
                                    {insights ? (
                                        <div dangerouslySetInnerHTML={{ __html: insights.replace(/\n/g, '<br/>') }} />
                                    ) : insightNoData || !(progressData?.dailyLogs?.length || progressData?.metrics?.length) ? (
                                        <p>No progress data available yet. Add a daily log to generate insights.</p>
                                    ) : (
                                        <p>Unable to generate insights at the moment.</p>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                        
                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-0 lg:col-start-2 lg:col-span-3">
                            {chartData.weightChartData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gray-800/50 rounded-xl p-5"
                                >
                                    <h3 className="text-xl font-semibold text-white mb-6">Weight Progress</h3>
                                    <div className="h-[270px]">
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
        {change && (
            <div className={`text-sm ${positive ? 'text-green-400' : 'text-red-400'}`}>
                {change} from last {timeframe}
            </div>
        )}
    </div>
);

export default Progress;