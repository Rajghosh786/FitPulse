import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from "axios";
import { FiSearch, FiFilter, FiInfo, FiX, FiLoader } from 'react-icons/fi';

const Exercises = () => {
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_KEY = import.meta.env.VITE_RAPID_API_KEY;
    const muscleGroups = [
        'All',
        'Back',
        'Cardio',
        'Chest',
        'Lower arms',
        'Lower legs',
        'Neck',
        'Shoulders',
        'Upper arms',
        'Upper legs',
        'Waist'
    ];

    useEffect(() => {
        fetchExercises();
    }, []);

    const fetchExercises = async () => {
        try {
            const response = await axios.get('https://exercisedb.p.rapidapi.com/exercises', {
                headers: {
                    'X-RapidAPI-Key': API_KEY,
                    'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
                }
            });
            setExercises(response.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setError('Failed to load exercises');
            setLoading(false);
        }
    };

    const fetchByBodyPart = async (bodyPart) => {
        if (bodyPart === 'All') {
            fetchExercises();
            return;
        }
        
        setLoading(true);
        try {
            const response = await axios.get(`https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}`, {
                headers: {
                    'X-RapidAPI-Key': API_KEY,
                    'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
                }
            });
            setExercises(response.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setError('Failed to load exercises');
            setLoading(false);
        }
    };

    const filteredExercises = exercises.filter(exercise => 
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.equipment.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <FiLoader className="w-12 h-12 animate-spin text-sky-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <FiX className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-xl text-gray-700">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 bg-gray-50">
            {/* Search and Filter Section */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search exercises..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Muscle Group Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {muscleGroups.map(muscle => (
                        <button
                            key={muscle}
                            onClick={() => {
                                setFilter(muscle);
                                fetchByBodyPart(muscle);
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                                ${filter === muscle 
                                    ? 'bg-sky-500 text-white' 
                                    : 'bg-white text-gray-700 hover:bg-sky-50'}`}
                        >
                            {muscle}
                        </button>
                    ))}
                </div>
            </div>

            {/* Exercises Grid */}
            <div className="max-w-7xl mx-auto">
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {filteredExercises.map((exercise) => (
                        <motion.div
                            key={exercise.id}
                            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                            whileHover={{ y: -5 }}
                            onClick={() => setSelectedExercise(exercise)}
                        >
                            <img 
                                src={exercise.gifUrl} 
                                alt={exercise.name} 
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2 capitalize">
                                    {exercise.name}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-2 py-1 bg-sky-100 text-sky-700 rounded-full text-sm">
                                        {exercise.bodyPart}
                                    </span>
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                        {exercise.target}
                                    </span>
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                        {exercise.equipment}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Exercise Detail Modal */}
            {selectedExercise && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-2xl font-bold text-gray-800 capitalize">
                                    {selectedExercise.name}
                                </h2>
                                <button 
                                    onClick={() => setSelectedExercise(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <FiX className="w-6 h-6" />
                                </button>
                            </div>
                            <img 
                                src={selectedExercise.gifUrl} 
                                alt={selectedExercise.name} 
                                className="w-full rounded-lg mb-4"
                            />
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-gray-700">Target Muscle:</h3>
                                    <p className="text-gray-600 capitalize">{selectedExercise.target}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-700">Equipment Needed:</h3>
                                    <p className="text-gray-600 capitalize">{selectedExercise.equipment}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-700">Body Part:</h3>
                                    <p className="text-gray-600 capitalize">{selectedExercise.bodyPart}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Exercises;