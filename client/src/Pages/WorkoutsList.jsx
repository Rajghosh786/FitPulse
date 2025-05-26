import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiActivity, FiFilter, FiSearch } from 'react-icons/fi';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { toast } from 'react-toastify';
import WorkoutDetailModal from '../Components/WorkoutDetailModal';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const WorkoutCard = ({ workout, onSave }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getLevelColor = (level) => {
        const colors = {
            'Beginner': 'bg-green-100 text-green-800',
            'Intermediate': 'bg-yellow-100 text-yellow-800',
            'Advanced': 'bg-red-100 text-red-800'
        }
        return colors[level] || 'bg-gray-100 text-gray-800';
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Strength':
            case 'Cardio':
            case 'Core':
                return <FiActivity className="mr-1" />;
            default:
                return <FiActivity className="mr-1" />;
        }
    };

    return (
        <>
            <motion.div
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
                <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{workout.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{workout.description}</p>

                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className={`text-xs px-2 py-1 rounded-full flex items-center ${getLevelColor(workout.level)}`}>
                            {workout.level}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center">
                            {getTypeIcon(workout.type)}
                            {workout.type}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center">
                            <FiClock className="mr-1" />
                            {workout.estimatedDuration} min
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {workout.exercises.length} exercises
                        </span>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                        >
                            View Workout →
                        </button>
                    </div>
                </div>
            </motion.div>

            <WorkoutDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                workout={workout}
            />
        </>
    );
};

const WorkoutsList = () => {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        level: '',
        type: '',
        duration: ''
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(true);
    const [aiGenerating, setAiGenerating] = useState(false);

    const workoutTypes = [
        'Strength',
        'Cardio',
        'Core',
        'HIIT',
        'Yoga',
        'Pilates',
        'CrossFit',
        'Calisthenics',
        'Flexibility',
        'Boxing'
    ];

    const durationOptions = [
        { value: 30, label: '30 mins' },
        { value: 60, label: '60 mins' },
        { value: 90, label: '90 mins' },
        { value: 120, label: '120 mins' },
        { value: 150, label: '150 mins' }
    ];

    useEffect(() => {
        // Generate initial workouts when component mounts
        generateAIWorkouts();
    }, []);

    useEffect(() => {
        if (filters.level || filters.type || filters.duration) {
            generateAIWorkouts();
        }
    }, [filters]);

    const parseAIWorkouts = (aiResponse) => {
        try {
            // First, ensure we have a valid response
            if (!aiResponse) return [];

            // Split into workouts more reliably
            const workouts = aiResponse.split(/Workout\s*\d+:/i).filter(Boolean);
            
            return workouts.map(workout => {
                const lines = workout.trim().split('\n').filter(Boolean);
                const name = lines[0]?.trim() || 'Unnamed Workout';
                
                // More robust regex patterns
                const typeMatch = workout.match(/Type:\s*([^,\n]+)/i);
                const levelMatch = workout.match(/Level:\s*([^,\n]+)/i);
                const durationMatch = workout.match(/Duration:\s*(\d+)/i);
                
                // More robust exercise parsing
                const exercisesSection = workout.split(/exercises:/i)[1];
                let exercises = [];
                
                if (exercisesSection) {
                    exercises = exercisesSection
                        .split(/\d+\.|[-•]/g)
                        .filter(Boolean)
                        .map(exercise => {
                            const exerciseText = exercise.trim();
                            const [name, ...detailsParts] = exerciseText.split(/[:-]/);
                            const details = detailsParts.join(' ').trim();
                            
                            return {
                                name: name.trim(),
                                sets: details.match(/(\d+)\s*sets?/i)?.[1] || '3',
                                reps: details.match(/(\d+)\s*reps?/i)?.[1] || '12',
                                instructions: details || 'Perform the exercise with proper form'
                            };
                        });
                }

                return {
                    name,
                    type: typeMatch?.[1]?.trim() || filters.type || 'General',
                    level: levelMatch?.[1]?.trim() || filters.level || 'Intermediate',
                    duration: parseInt(durationMatch?.[1]) || parseInt(filters.duration) || 30,
                    exercises: exercises.length ? exercises : [{
                        name: 'Basic Exercise',
                        sets: '3',
                        reps: '12',
                        instructions: 'Perform the exercise with proper form'
                    }],
                    description: lines[1]?.trim() || `A ${filters.level || 'general'} ${filters.type || 'workout'} routine`
                };
            });
        } catch (error) {
            console.error('Error parsing workouts:', error);
            return [];
        }
    };

    const generateAIWorkouts = async (searchTerm = '') => {
        setAiGenerating(true);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `Generate 3 detailed workout plans${searchTerm ? ` for "${searchTerm}"` : ''}.
        ${filters.type ? `Type: ${filters.type}` : ''}
        ${filters.level ? `Level: ${filters.level}` : ''}
        ${filters.duration ? `Duration: around ${filters.duration} minutes` : ''}
        
        Format each workout as:
        Workout Name
        Type: [type]
        Level: [level]
        Duration: [minutes]
        Description: Brief description
        Exercises:
        1. [exercise name]: [sets] sets of [reps] reps - [instructions]
        2. [next exercise...]`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const workoutText = response.text();
            
            const formattedWorkouts = parseAIWorkouts(workoutText);
            setWorkouts(formattedWorkouts);
        } catch (error) {
            console.error('Error generating workouts:', error);
            toast.error('Failed to generate workouts. Please try again.');
        } finally {
            setAiGenerating(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            await generateAIWorkouts(searchQuery);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const saveWorkout = async (workout) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8000/api/workouts/save', 
                { workout },
                { headers: { 'Authorization': `Bearer ${token}` }}
            );
            toast.success('Workout saved successfully!');
        } catch (error) {
            console.error('Error saving workout:', error);
            toast.error('Failed to save workout');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 px-4 py-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Workouts</h1>
                    <p className="text-gray-400">
                        Discover and create personalized workout routines
                    </p>
                </div>

                {/* Search and Filters Section */}
                <div className="bg-gray-800 rounded-xl p-6 mb-8">
                    <form onSubmit={handleSearch} className="flex gap-4 mb-6">
                        <div className="flex-1">
                            <input
                                type="text"
                                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Search workouts or generate new ones..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {aiGenerating ? 'Generating...' : 'Search'}
                        </button>
                    </form>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
                            value={filters.level}
                            onChange={(e) => handleFilterChange('level', e.target.value)}
                        >
                            <option value="">All Levels</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>

                        <select
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                        >
                            <option value="">All Types</option>
                            {workoutTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>

                        <select
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
                            value={filters.duration}
                            onChange={(e) => handleFilterChange('duration', e.target.value)}
                        >
                            <option value="">Any Duration</option>
                            {durationOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Workouts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workouts.map((workout, index) => (
                        <WorkoutCard 
                            key={index} 
                            workout={workout}
                            onSave={() => saveWorkout(workout)}
                        />
                    ))}
                </div>

                {workouts.length === 0 && !aiGenerating && (
                    <div className="text-center py-12">
                        <p className="text-gray-400">
                            No workouts found. Try adjusting your filters or search for something specific.
                        </p>
                    </div>
                )}

                {aiGenerating && (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-400">Generating workouts...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkoutsList;
