import { useEffect, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const OnboardingUpdate = ({ userData, userId, token, onComplete  }) => {
    const navigate = useNavigate();
    const API = import.meta.env.VITE_API;
    const [formData, setFormData] = useState({
        height: userData?.height || "",
        weight: userData?.weight || "",
        bmi: userData?.bmi || "",
        fitnessGoal: userData?.fitnessGoal || "",
        targetWeight: userData?.targetWeight || "",
        dietaryPreference: userData?.dietaryPreference || "",
        mealsPerDay: userData?.mealsPerDay || ""
    });

    const calculateBMI = () => {
        if (formData.height && formData.weight) {
            const heightInMeters = formData.height / 100;

            const bmi = (
                formData.weight /
                (heightInMeters * heightInMeters)
            ).toFixed(2);

            setFormData((prev) => ({
                ...prev,
                bmi
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                bmi: ""
            }));
        }
    };

    useEffect(() => {
        calculateBMI();
    }, [formData.height, formData.weight]);

    const updateField = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData?.height) {
            toast.error("Please enter valid Height");
            return;
        }

        if (!formData?.weight) {
            toast.error("Please enter valid Weight");
            return;
        }

        if (!formData?.fitnessGoal) {
            toast.error("Please select fitness goal");
            return;
        }

        if (
            formData?.fitnessGoal !== "Health Maintenance" &&
            !formData?.targetWeight
        ) {
            toast.error("Please enter valid Target Weight");
            return;
        }

        if (!formData?.dietaryPreference?.trim()) {
            toast.error("Please select dietary preference");
            return;
        }

        if (!formData?.mealsPerDay) {
            toast.error("Please enter valid Meals per Day");
            return;
        }
        console.log("TOKEN:", userData);
        try {
            const response = await axios.post(
                `${API}/user/update-profile`,
                {
                    ...formData,
                    userId
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            if (response.data.user) {
                localStorage.setItem("userData",JSON.stringify(response.data.user));
                toast.success("Profile updated successfully");
                onComplete(response.data.user);
            }
        } catch (error) {
            console.error("Error updating profile:", error);

            toast.error("Failed to update profile: " +(error.response?.data?.msg || "Unknown error"));
        }
    };

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="container mx-auto px-4 py-12">

                <div className="max-w-3xl mx-auto">

                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">
                            Complete Your Profile
                        </h1>

                        <p className="text-gray-400">
                            Update your fitness details to get personalized
                            workout, diet plans ,progress tracker and dashboard.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-gray-700/50"
                    >

                        {/* Physical Details */}

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-white mb-6">
                                Physical Details
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div>
                                    <label className="text-gray-300 mb-2 block">
                                        Height (cm)
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.height}
                                        onChange={(e) =>
                                            updateField(
                                                "height",
                                                e.target.value
                                            )
                                        }
                                        onWheel={(e) => e.target.blur()}
                                        className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-gray-300 mb-2 block">
                                        Weight (kg)
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.weight}
                                        onChange={(e) =>
                                            updateField(
                                                "weight",
                                                e.target.value
                                            )
                                        }
                                        onWheel={(e) => e.target.blur()}
                                        className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                                        required
                                    />
                                </div>

                            </div>

                            {formData.bmi && (
                                <div className="bg-sky-900/30 border border-sky-800/40 p-4 rounded-xl mt-4">
                                    <p className="text-white">
                                        Your BMI:{" "}
                                        <span className="font-semibold">
                                            {formData.bmi}
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Fitness Goals */}

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-white mb-6">
                                Fitness Goals
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                {[
                                    "Weight Loss",
                                    "Weight Gain",
                                    "Health Maintenance"
                                ].map((goal) => (
                                    <button
                                        type="button"
                                        key={goal}
                                        onClick={() =>
                                            updateField("fitnessGoal", goal)
                                        }
                                        className={`p-4 rounded-xl border text-center transition-all ${
                                            formData.fitnessGoal === goal
                                                ? "border-sky-500 bg-sky-900/30 text-white"
                                                : "border-gray-600 bg-gray-700/30 text-gray-300 hover:bg-gray-700/50"
                                        }`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <span>{goal}</span>

                                            {formData.fitnessGoal === goal && (
                                                <FiCheck className="text-sky-400" />
                                            )}
                                        </div>
                                    </button>
                                ))}

                            </div>

                            {/* Target Weight */}

                            {formData.fitnessGoal &&
                                formData.fitnessGoal !== "Health Maintenance" && (
                                    <div className="mt-5">
                                        <label className="text-gray-300 mb-2 block">
                                            Target Weight (kg)
                                        </label>

                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.targetWeight}
                                            onChange={(e) =>
                                                updateField(
                                                    "targetWeight",
                                                    e.target.value
                                                )
                                            }
                                            onWheel={(e) => e.target.blur()}
                                            className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                                            required
                                        />
                                    </div>
                                )}
                        </div>


                        {/* Dietary Preference */}

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-white mb-6">
                                Dietary Preference
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                {[
                                    "Vegan",
                                    "Vegetarian",
                                    "Non-Vegetarian"
                                ].map((diet) => (
                                    <button
                                        type="button"
                                        key={diet}
                                        onClick={() =>
                                            updateField(
                                                "dietaryPreference",
                                                diet
                                            )
                                        }
                                        className={`p-4 rounded-xl border text-center transition-all ${
                                            formData.dietaryPreference === diet
                                                ? "border-sky-500 bg-sky-900/30 text-white"
                                                : "border-gray-600 bg-gray-700/30 text-gray-300 hover:bg-gray-700/50"
                                        }`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <span>{diet}</span>

                                            {formData.dietaryPreference === diet && (
                                                <FiCheck className="text-sky-400" />
                                            )}
                                        </div>
                                    </button>
                                ))}

                            </div>
                        </div>


                        {/* Meals Per Day */}

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-white mb-6">
                                Meals per Day
                            </h2>

                            <input
                                type="number"
                                min="1"
                                max="6"
                                value={formData.mealsPerDay}
                                onChange={(e) =>
                                    updateField(
                                        "mealsPerDay",
                                        e.target.value
                                    )
                                }
                                onWheel={(e) => e.target.blur()}
                                className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                                required
                            />
                        </div>


                        {/* Submit */}

                        <div className="flex justify-end border-t border-gray-700 pt-6">

                            <button
                                type="submit"
                                className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-xl font-medium transition-colors"
                            >
                                Update Profile
                            </button>

                        </div>

                    </form>

                </div>

            </div>
        </div>
    );
};

export default OnboardingUpdate;