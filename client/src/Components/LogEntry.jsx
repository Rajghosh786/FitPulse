import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiMinus, FiSave } from 'react-icons/fi';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { toast } from 'react-toastify';
import axios from 'axios';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const LogEntry = ({ onLogSaved, date = new Date() }) => {
    const [meals, setMeals] = useState([{ name: '', portions: '', time: '' }]);
    const [workout, setWorkout] = useState({ 
        type: '',
        duration: '',
        intensity: 'moderate',
        exercises: []
    });
    const [measurements, setMeasurements] = useState({
        weight: '',
        chest: '',
        waist: '',
        hips: '',
        arms: '',
        thighs: ''
    });
    const [mood, setMood] = useState('good');
    const [sleep, setSleep] = useState({ hours: 8, quality: 'good' });
    const [loading, setLoading] = useState(false);

    const addMeal = () => {
        setMeals([...meals, { name: '', portions: '', time: '' }]);
    };

    const removeMeal = (index) => {
        setMeals(meals.filter((_, i) => i !== index));
    };

    const updateMeal = (index, field, value) => {
        const updatedMeals = [...meals];
        updatedMeals[index][field] = value;
        setMeals(updatedMeals);
    };

    const calculateCalories = async (meals) => {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `Act as a nutritional calculator. For these meals:
                ${meals.map(m => `${m.name} - ${m.portions}`).join('\n')}
                
                Return ONLY a valid JSON object like this:
                {
                    "totalCalories": <number>,
                    "protein": <number>,
                    "carbs": <number>,
                    "fats": <number>,
                    "breakdown": {
                        "<mealName>": <calories>
                    }
                }`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim();
            
            // Remove any markdown formatting
            const jsonStr = text.replace(/```json\n|\n```/g, '').trim();
            
            try {
                return JSON.parse(jsonStr);
            } catch (parseError) {
                console.error('Invalid JSON response:', text);
                // Fallback values
                return {
                    totalCalories: estimateCalories(meals),
                    protein: 0,
                    carbs: 0,
                    fats: 0,
                    breakdown: meals.reduce((acc, meal) => ({
                        ...acc,
                        [meal.name]: estimateCalories([meal])
                    }), {})
                };
            }
        } catch (error) {
            console.error('Error calculating calories:', error);
            throw error;
        }
    };

    const calculateWorkoutStats = async (workout) => {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `Act as a fitness calculator. For this workout:
                Type: ${workout.type}
                Duration: ${workout.duration} minutes
                Intensity: ${workout.intensity}
                Exercises: ${workout.exercises.join(', ')}
                
                Return ONLY a valid JSON object like this:
                {
                    "caloriesBurned": <number>,
                    "intensityScore": <number>,
                    "impactedMuscleGroups": [<string array>]
                }`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim();
            
            // Remove any markdown formatting
            const jsonStr = text.replace(/```json\n|\n```/g, '').trim();
            
            try {
                return JSON.parse(jsonStr);
            } catch (parseError) {
                console.error('Invalid JSON response:', text);
                return {
                    caloriesBurned: estimateCaloriesBurned(workout),
                    intensityScore: getIntensityScore(workout.intensity),
                    impactedMuscleGroups: estimateMuscleGroups(workout.type)
                };
            }
        } catch (error) {
            console.error('Error calculating workout stats:', error);
            throw error;
        }
    };

    // Helper functions for fallback calculations
    const estimateCalories = (meals) => {
        // Basic estimation: 300 calories per meal
        return meals.length * 300;
    };

    const estimateCaloriesBurned = (workout) => {
        const intensityMultiplier = {
            light: 4,
            moderate: 7,
            intense: 10
        };
        return Math.round(workout.duration * intensityMultiplier[workout.intensity]);
    };

    const getIntensityScore = (intensity) => {
        const scores = {
            light: 3,
            moderate: 6,
            intense: 9
        };
        return scores[intensity] || 5;
    };

    const estimateMuscleGroups = (workoutType) => {
        const muscleGroups = {
            cardio: ['legs', 'core', 'cardiovascular'],
            strength: ['chest', 'back', 'arms', 'shoulders'],
            yoga: ['core', 'flexibility', 'balance'],
            hiit: ['full body', 'cardiovascular'],
            default: ['full body']
        };
        return muscleGroups[workoutType.toLowerCase()] || muscleGroups.default;
    };

    // Update the handleSubmit function
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate required fields
            if (!measurements.weight) {
                toast.error('Weight measurement is required');
                return;
            }

            if (!meals[0].name || !meals[0].portions) {
                toast.error('At least one meal with name and portions is required');
                return;
            }

            const nutritionData = await calculateCalories(meals);
            
            // Initialize workout data with null or calculated values
            let workoutData = {
                caloriesBurned: 0,
                intensityScore: 0,
                impactedMuscleGroups: []
            };

            // Only calculate workout stats if type and duration are provided
            if (workout.type && workout.duration) {
                try {
                    workoutData = await calculateWorkoutStats(workout);
                } catch (error) {
                    console.error('Workout calculation error:', error);
                    // Continue with default values if workout calculation fails
                }
            }

            const logData = {
                date: new Date().toISOString(),
                meals: meals.map(meal => ({
                    name: meal.name,
                    portions: meal.portions,
                    time: meal.time,
                    calories: nutritionData.breakdown[meal.name] || 0,
                    nutrients: {
                        protein: Math.round(nutritionData.protein / meals.length),
                        carbs: Math.round(nutritionData.carbs / meals.length),
                        fats: Math.round(nutritionData.fats / meals.length)
                    }
                })),
                totalNutrition: {
                    calories: nutritionData.totalCalories,
                    protein: nutritionData.protein,
                    carbs: nutritionData.carbs,
                    fats: nutritionData.fats,
                    waterIntake: 0
                },
                workout: workout.type ? {
                    type: workout.type,
                    duration: parseInt(workout.duration) || 0,
                    intensity: workout.intensity,
                    exercises: workout.exercises,
                    ...workoutData
                } : null,
                measurements: Object.fromEntries(
                    Object.entries(measurements).map(([key, value]) => [key, parseFloat(value) || 0])
                ),
                mood,
                sleep,
                notes: ''
            };

            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8000/user/log-entry', logData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            toast.success('Daily log saved successfully!');
            onLogSaved(response.data);
            
            // Reset form
            setMeals([{ name: '', portions: '', time: '' }]);
            setWorkout({ type: '', duration: '', intensity: 'moderate', exercises: [] });
            setMeasurements({ weight: '', chest: '', waist: '', hips: '', arms: '', thighs: '' });
        } catch (error) {
            console.error('Error saving log:', error);
            toast.error(error.response?.data?.msg || 'Failed to save daily log');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-800/50 rounded-xl p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-white">Daily Log</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Meals Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl text-white">Meals</h3>
                        <button
                            type="button"
                            onClick={addMeal}
                            className="text-sky-400 hover:text-sky-300 flex items-center gap-2"
                        >
                            <FiPlus /> Add Meal
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        {meals.map((meal, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-3 gap-4"
                            >
                                <input
                                    type="text"
                                    placeholder="Meal name"
                                    value={meal.name}
                                    onChange={(e) => updateMeal(index, 'name', e.target.value)}
                                    className="bg-gray-700 text-white rounded-lg px-4 py-2"
                                />
                                <input
                                    type="text"
                                    placeholder="Portions"
                                    value={meal.portions}
                                    onChange={(e) => updateMeal(index, 'portions', e.target.value)}
                                    className="bg-gray-700 text-white rounded-lg px-4 py-2"
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="time"
                                        value={meal.time}
                                        onChange={(e) => updateMeal(index, 'time', e.target.value)}
                                        className="bg-gray-700 text-white rounded-lg px-4 py-2 flex-1"
                                    />
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => removeMeal(index)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <FiMinus />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Workout Section */}
                <div>
                    <h3 className="text-xl text-white mb-4">Workout</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Workout type"
                            value={workout.type}
                            onChange={(e) => setWorkout({ ...workout, type: e.target.value })}
                            className="bg-gray-700 text-white rounded-lg px-4 py-2"
                        />
                        <input
                            type="number"
                            placeholder="Duration (minutes)"
                            value={workout.duration}
                            onChange={(e) => setWorkout({ ...workout, duration: e.target.value })}
                            className="bg-gray-700 text-white rounded-lg px-4 py-2"
                        />
                        <select
                            value={workout.intensity}
                            onChange={(e) => setWorkout({ ...workout, intensity: e.target.value })}
                            className="bg-gray-700 text-white rounded-lg px-4 py-2"
                        >
                            <option value="light">Light</option>
                            <option value="moderate">Moderate</option>
                            <option value="intense">Intense</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Exercises (comma-separated)"
                            value={workout.exercises.join(', ')}
                            onChange={(e) => setWorkout({ 
                                ...workout, 
                                exercises: e.target.value.split(',').map(ex => ex.trim())
                            })}
                            className="bg-gray-700 text-white rounded-lg px-4 py-2"
                        />
                    </div>
                </div>

                {/* Measurements Section */}
                <div>
                    <h3 className="text-xl text-white mb-4">Measurements</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Weight (kg)</label>
                            <input
                                type="number"
                                step="0.1"
                                required
                                value={measurements.weight}
                                onChange={(e) => setMeasurements({
                                    ...measurements,
                                    weight: e.target.value
                                })}
                                className="bg-gray-700 text-white rounded-lg px-4 py-2 w-full"
                                placeholder="Weight in kg"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Chest (cm)</label>
                            <input
                                type="number"
                                value={measurements.chest}
                                onChange={(e) => setMeasurements({
                                    ...measurements,
                                    chest: e.target.value
                                })}
                                className="bg-gray-700 text-white rounded-lg px-4 py-2 w-full"
                                placeholder="Chest in cm"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">Waist (cm)</label>
                            <input
                                type="number"
                                value={measurements.waist}
                                onChange={(e) => setMeasurements({
                                    ...measurements,
                                    waist: e.target.value
                                })}
                                className="bg-gray-700 text-white rounded-lg px-4 py-2 w-full"
                                placeholder="Waist in cm"
                            />
                        </div>
                        {/* Add other measurement fields similarly */}
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2
                        ${loading 
                            ? 'bg-gray-600 cursor-not-allowed' 
                            : 'bg-sky-600 hover:bg-sky-700'} text-white transition-colors`}
                >
                    {loading ? 'Saving...' : (
                        <>
                            <FiSave />
                            Save Daily Log
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default LogEntry;