import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import axios from 'axios';

const OnboardingSteps = ({ userId, token }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        height: '',
        weight: '',
        bmi: '',
        fitnessGoal: '',
        targetWeight: '',
        dietaryPreference: '',
        mealsPerDay: 3,
        hasAllergies: false
    });

    const calculateBMI = () => {
        if (formData.height && formData.weight) {
            const heightInMeters = formData.height / 100;
            const bmi = (formData.weight / (heightInMeters * heightInMeters)).toFixed(2);
            setFormData(prev => ({ ...prev, bmi }));
        }
    };

    useEffect(() => {
        calculateBMI();
    }, [formData.height, formData.weight]);

    const renderStep = () => {
        switch(step) {
            case 1:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <h2 className="text-2xl font-bold text-white">Physical Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-gray-300 mb-2 block">Height (cm)</label>
                                <input
                                    type="number"
                                    value={formData.height}
                                    onChange={(e) => setFormData(prev => ({...prev, height: e.target.value}))}
                                    className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-xl p-3"
                                />
                            </div>
                            <div>
                                <label className="text-gray-300 mb-2 block">Weight (kg)</label>
                                <input
                                    type="number"
                                    value={formData.weight}
                                    onChange={(e) => setFormData(prev => ({...prev, weight: e.target.value}))}
                                    className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-xl p-3"
                                />
                            </div>
                        </div>
                        {formData.bmi && (
                            <div className="bg-sky-900/30 p-4 rounded-xl">
                                <p className="text-white">Your BMI: {formData.bmi}</p>
                            </div>
                        )}
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <h2 className="text-2xl font-bold text-white">Fitness Goals</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                {['Weight Loss', 'Weight Gain', 'Health Maintenance'].map(goal => (
                                    <button
                                        key={goal}
                                        onClick={() => setFormData(prev => ({...prev, fitnessGoal: goal}))}
                                        className={`p-4 rounded-xl border ${
                                            formData.fitnessGoal === goal
                                                ? 'border-sky-500 bg-sky-900/30'
                                                : 'border-gray-600 bg-gray-700/30'
                                        }`}
                                    >
                                        {goal}
                                    </button>
                                ))}
                            </div>
                            {formData.fitnessGoal !== 'Health Maintenance' && (
                                <div>
                                    <label className="text-gray-300 mb-2 block">Target Weight (kg)</label>
                                    <input
                                        type="number"
                                        value={formData.targetWeight}
                                        onChange={(e) => setFormData(prev => ({...prev, targetWeight: e.target.value}))}
                                        className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-xl p-3"
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <h2 className="text-2xl font-bold text-white">Dietary Preferences</h2>
                        <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                {['Vegan', 'Vegetarian', 'Non-Vegetarian'].map(diet => (
                                    <button
                                        key={diet}
                                        onClick={() => setFormData(prev => ({...prev, dietaryPreference: diet}))}
                                        className={`p-4 rounded-xl border ${
                                            formData.dietaryPreference === diet
                                                ? 'border-sky-500 bg-sky-900/30'
                                                : 'border-gray-600 bg-gray-700/30'
                                        }`}
                                    >
                                        {diet}
                                    </button>
                                ))}
                            </div>
                            <div>
                                <label className="text-gray-300 mb-2 block">Meals per day</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="6"
                                    value={formData.mealsPerDay}
                                    onChange={(e) => setFormData(prev => ({...prev, mealsPerDay: e.target.value}))}
                                    className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-xl p-3"
                                />
                            </div>
                            {/* <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id="allergies"
                                    checked={formData.hasAllergies}
                                    onChange={(e) => setFormData(prev => ({...prev, hasAllergies: e.target.checked}))}
                                    className="w-5 h-5 rounded"
                                />
                                <label htmlFor="allergies" className="text-gray-300">I have food allergies</label>
                            </div> */}
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    const handleNext = async () => {
        if (step < 3) {
            setStep(prev => prev + 1);
        } else {
            try {
                const response = await axios.post(
                    'http://localhost:8000/user/update-profile',
                    {
                        ...formData,
                        userId
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`, // Make sure Bearer prefix is added
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                if (response.data.user) {
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                alert('Failed to update profile: ' + (error.response?.data?.msg || 'Unknown error'));
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-gray-700/50">
                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            {[1, 2, 3].map((num) => (
                                <div
                                    key={num}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        step >= num ? 'bg-sky-600' : 'bg-gray-700'
                                    }`}
                                >
                                    {step > num ? <FiCheck /> : num}
                                </div>
                            ))}
                        </div>
                    </div>

                    {renderStep()}

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={handleNext}
                            className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2"
                        >
                            <span>{step === 3 ? 'Finish' : 'Next'}</span>
                            <FiArrowRight />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingSteps;