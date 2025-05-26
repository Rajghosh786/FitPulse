const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    onboardingCompleted: { type: Boolean, default: false },
    // Physical details
    height: { type: Number },
    weight: { type: Number },
    bmi: { type: Number },
    // Fitness goals
    fitnessGoal: {
        type: String,
        enum: ['Weight Loss', 'Weight Gain', 'Health Maintenance']
    },
    targetWeight: { type: Number },
    // Diet preferences
    dietaryPreference: {
        type: String,
        enum: ['Vegan', 'Vegetarian', 'Non-Vegetarian']
    },
    mealsPerDay: { type: Number },
    hasAllergies: { type: Boolean, default: false },
    // Existing fields
    workoutPreferences: { type: [String], default: [] },
    profileImage: {type: String, default: ""},
    accessToken: {type: String},
    refreshToken: {type: String},
    blacklistedTokens: [{
        token: { type: String },
        blacklistedAt: { type: Date, default: Date.now }
    }],
    aiRecommendations: {
        diet: { type: String, default: '' },
        workout: { type: String, default: '' },
        avoid: { type: String, default: '' },
        lastUpdated: { type: Date }
    },
    dietHistory: [{
        weeklyPlan: {
            type: Object,  // This will store the complete weekly plan
            required: true
        },
        goal: String,
        preference: String,
        mealsPerDay: String,
        createdAt: { 
            type: Date, 
            default: Date.now 
        }
    }],
    workoutHistory: [{
        name: String,
        type: String,
        level: String,
        exercises: [{
            name: String,
            sets: Number,
            reps: Number,
            duration: Number,
            instructions: String
        }],
        duration: Number,
        description: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    progressMetrics: {
        weeklyStats: [{
            week: String, // Format: "YYYY-WW"
            weightLog: Number,
            caloriesConsumed: Number,
            caloriesBurned: Number,
            workoutsCompleted: Number,
            totalWorkoutDuration: Number,
            nutritionAdherence: Number, // Percentage
            waterIntake: Number, // Liters
            sleepHours: Number,
            moodScore: Number, // 1-10
            measurements: {
                chest: Number,
                waist: Number,
                hips: Number,
                arms: Number,
                thighs: Number
            },
            createdAt: { 
                type: Date, 
                default: Date.now 
            }
        }],
        monthlyProgress: [{
            month: String, // Format: "YYYY-MM"
            averageWeight: Number,
            totalWorkouts: Number,
            averageCaloriesConsumed: Number,
            averageCaloriesBurned: Number,
            workoutConsistency: Number, // Percentage
            nutritionConsistency: Number, // Percentage
            weightChange: Number, // + or - from previous month
            achievedGoals: [{
                goal: String,
                achievedDate: Date
            }],
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        dailyLogs: [{
            date: { type: Date, required: true },
            meals: [{
                name: { type: String, required: true },
                portions: String,
                time: String,
                calories: Number,
                nutrients: {
                    protein: Number,
                    carbs: Number,
                    fats: Number
                }
            }],
            totalNutrition: {
                calories: Number,
                protein: Number,
                carbs: Number,
                fats: Number,
                waterIntake: Number
            },
            workout: {
                type: {
                    type: String,
                    required: function() { return this.workout !== null; }
                },
                duration: {
                    type: Number,
                    default: 0
                },
                intensity: {
                    type: String,
                    enum: ['light', 'moderate', 'intense'],
                    default: 'moderate'
                },
                exercises: {
                    type: [String],
                    default: []
                },
                caloriesBurned: {
                    type: Number,
                    default: 0
                },
                intensityScore: {
                    type: Number,
                    default: 0
                },
                impactedMuscleGroups: {
                    type: [String],
                    default: []
                }
            },
            measurements: {
                weight: Number,
                chest: Number,
                waist: Number,
                hips: Number,
                arms: Number,
                thighs: Number
            },
            mood: {
                type: String,
                enum: ['great', 'good', 'neutral', 'poor', 'bad']
            },
            sleep: {
                hours: Number,
                quality: {
                    type: String,
                    enum: ['excellent', 'good', 'fair', 'poor']
                }
            },
            notes: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        goals: [{
            type: {
                type: String,
                enum: ['weight', 'workout', 'nutrition', 'measurement']
            },
            target: mongoose.Schema.Types.Mixed,
            startDate: Date,
            targetDate: Date,
            progress: Number, // Percentage
            achieved: {
                type: Boolean,
                default: false
            },
            achievedDate: Date
        }]
    }
}, {timestamps: true});

const userModel = mongoose.model('User', userSchema);

module.exports = {userModel}

