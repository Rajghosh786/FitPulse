const express = require("express")
const userRouter = express.Router()
const bcrypt = require('bcrypt');
const { userModel } = require("../models/user.model");
var jwt = require('jsonwebtoken');
const { auth } = require("../middlewares/auth");
require("dotenv").config()

// Helper functions for progress calculations
const calculateWeightChange = (progressData) => {
    if (!progressData || progressData.length < 2) return 0;
    
    const sortedData = [...progressData].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    const latestWeight = sortedData[0].weightLog;
    const oldestWeight = sortedData[sortedData.length - 1].weightLog;
    
    return Number((latestWeight - oldestWeight).toFixed(2));
};

const calculateConsistency = (progressData) => {
    if (!progressData || progressData.length === 0) return 0;
    
    const totalDays = progressData.length;
    const daysWithWorkouts = progressData.filter(day => 
        day.workoutsCompleted > 0
    ).length;
    
    return Math.round((daysWithWorkouts / totalDays) * 100);
};

userRouter.post("/signup", async (req,res) => {
    const {firstName, lastName, email, password, dateOfBirth, city, state} = req.body
    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: "User already exists" });
        }

        bcrypt.hash(password, 13, async function(err, hash) {
            if(err){
                return res.status(400).json({msg:"Cannot register now"})
            }
            const newUser = await userModel.create({...req.body, password:hash})
            
            // Generate token after user creation
            const payload = {
                userId: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
            };
            
            const refreshToken = jwt.sign(payload, process.env.JWT_TOKEN, {
                expiresIn: "7d",
            });

            // Save token to user document
            newUser.refreshToken = refreshToken;
            await newUser.save();

            return res.status(200).json({
                msg: "user created successfully",
                userId: newUser._id,
                refreshToken, // Add token to response
                user: {
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    email: newUser.email,
                    _id: newUser._id
                }
            })
        }); 
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({msg:"Something went wrong"})
    }
})

userRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      if (email && password) {
        const findUser = await userModel.findOne({ email });
        console.log(findUser);
  
        if (!findUser) {
          return res.status(404).json({ msg: "User not found" });
        }
  
        bcrypt.compare(password, findUser.password, async function (err, result) {
          if (err) {
            return res.status(401).json({ msg: "Wrong Password", err });
          }
          if (result) {
           
            const payload = {
              userId: findUser._id,
              firstName: findUser.firstName,
              lastName: findUser.lastName,
              email: findUser.email,
            };
            
            const refreshToken = jwt.sign(payload, process.env.JWT_TOKEN, {
              expiresIn: "7d",
            });
  
        
            findUser.refreshToken = refreshToken;
            await findUser.save();
  
            
            return res.status(200).json({
              msg: "User Logged In successfully",
              refreshToken,
              findUser,  
            });
          }
          return res.status(401).json({ msg: "Wrong password" });
        });
      } else {
        return res.status(401).json({ msg: "Both email and password are required for login" });
      }
    } catch (error) {
      return res.status(500).json({ msg: "Something went wrong", error });
    }
  });
  
userRouter.post('/update-profile', auth, async (req, res) => {
    try {
        const {
            userId,
            height,
            weight,
            bmi,
            fitnessGoal,
            targetWeight,
            dietaryPreference,
            mealsPerDay,
            hasAllergies,
            aiRecommendations // Add this
        } = req.body;

        // Verify that the authenticated user matches the userId
        if (req.userId !== userId) {
            return res.status(403).json({ msg: 'Unauthorized access' });
        }

        // Validate required fields
        if (!height || !weight || !fitnessGoal || !dietaryPreference) {
            return res.status(400).json({ msg: 'Missing required fields' });
        }

        // Additional validation
        const heightNum = parseFloat(height);
        const weightNum = parseFloat(weight);
        
        if (isNaN(heightNum) || isNaN(weightNum) || heightNum <= 0 || weightNum <= 0) {
            return res.status(400).json({ msg: 'Invalid height or weight values' });
        }

        // Calculate BMI if not provided
        const calculatedBMI = bmi || (weightNum / Math.pow(heightNum/100, 2)).toFixed(2);

        const updateData = {
            height: heightNum,
            weight: weightNum,
            bmi: calculatedBMI,
            fitnessGoal,
            targetWeight,
            dietaryPreference,
            mealsPerDay,
            hasAllergies,
            onboardingCompleted: true
        };

        // Add AI recommendations if provided
        if (aiRecommendations) {
            updateData.aiRecommendations = {
                ...aiRecommendations,
                lastUpdated: new Date()
            };
        }

        // Update user profile
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.status(200).json({
            msg: 'Profile updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ msg: 'Error updating profile', error: error.message });
    }
});

userRouter.get('/profile', auth, async (req, res) => {
    try {
        const user = await userModel.findById(req.userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        
        // Remove sensitive information
        const userProfile = user.toObject();
        delete userProfile.password;
        delete userProfile.blacklistedTokens;
        
        res.status(200).json(userProfile);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ msg: 'Error fetching profile', error: error.message });
    }
});

userRouter.post('/save-diet', auth, async (req, res) => {
    try {
        const { plans, goal, preference, mealsPerDay } = req.body;
        
        const user = await userModel.findById(req.userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Create a new diet plan entry with the complete weekly plan
        const newDietPlan = {
            weeklyPlan: plans,  // This contains the complete 7-day plan
            goal,
            preference,
            mealsPerDay,
            createdAt: new Date()
        };

        // Add to history
        if (!user.dietHistory) {
            user.dietHistory = [];
        }
        user.dietHistory.unshift(newDietPlan); // Add new plan at the beginning

        // Keep only last 5 plans
        if (user.dietHistory.length > 5) {
            user.dietHistory = user.dietHistory.slice(0, 5);
        }

        await user.save();
        
        res.status(200).json({ 
            msg: 'Weekly meal plan saved successfully',
            dietHistory: user.dietHistory 
        });
    } catch (error) {
        console.error('Error saving meal plan:', error);
        res.status(500).json({ msg: 'Error saving meal plan', error: error.message });
    }
});

userRouter.post('/workouts/save', auth, async (req, res) => {
    try {
        const { workout } = req.body;
        const user = await userModel.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Add to workout history
        if (!user.workoutHistory) {
            user.workoutHistory = [];
        }
        
        user.workoutHistory.unshift({
            ...workout,
            createdAt: new Date()
        });

        // Keep only last 10 workouts
        if (user.workoutHistory.length > 10) {
            user.workoutHistory = user.workoutHistory.slice(0, 10);
        }

        await user.save();
        
        res.status(200).json({
            msg: 'Workout saved successfully',
            workoutHistory: user.workoutHistory
        });
    } catch (error) {
        console.error('Error saving workout:', error);
        res.status(500).json({ msg: 'Error saving workout', error: error.message });
    }
});

userRouter.post('/log-entry', auth, async (req, res) => {
    try {
        const { date, meals, totalNutrition, workout, measurements, mood, sleep, notes } = req.body;

        // Validate measurements
        if (!measurements || typeof measurements.weight !== 'number') {
            return res.status(400).json({ msg: 'Valid weight measurement is required' });
        }

        const user = await userModel.findById(req.userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Initialize progressMetrics if needed
        if (!user.progressMetrics) {
            user.progressMetrics = {
                dailyLogs: [],
                weeklyStats: [],
                monthlyProgress: [],
                goals: []
            };
        }

        // Prepare workout data
        const workoutData = workout ? {
            type: workout.type || '',
            duration: parseInt(workout.duration) || 0,
            intensity: workout.intensity || 'moderate',
            exercises: Array.isArray(workout.exercises) ? workout.exercises : [],
            caloriesBurned: parseInt(workout.caloriesBurned) || 0,
            intensityScore: parseInt(workout.intensityScore) || 0,
            impactedMuscleGroups: Array.isArray(workout.impactedMuscleGroups) ? 
                workout.impactedMuscleGroups : []
        } : null;

        // Create daily log
        const dailyLog = {
            date: new Date(date),
            meals: meals.map(meal => ({
                name: meal.name,
                portions: meal.portions,
                time: meal.time,
                calories: parseFloat(meal.calories) || 0,
                nutrients: {
                    protein: parseFloat(meal.nutrients?.protein) || 0,
                    carbs: parseFloat(meal.nutrients?.carbs) || 0,
                    fats: parseFloat(meal.nutrients?.fats) || 0
                }
            })),
            totalNutrition: {
                calories: parseFloat(totalNutrition?.calories) || 0,
                protein: parseFloat(totalNutrition?.protein) || 0,
                carbs: parseFloat(totalNutrition?.carbs) || 0,
                fats: parseFloat(totalNutrition?.fats) || 0,
                waterIntake: parseFloat(totalNutrition?.waterIntake) || 0
            },
            workout: workoutData,
            measurements: Object.fromEntries(
                Object.entries(measurements).map(([key, value]) => [
                    key, 
                    parseFloat(value) || 0
                ])
            ),
            mood: mood || 'good',
            sleep: {
                hours: parseFloat(sleep?.hours) || 8,
                quality: sleep?.quality || 'good'
            },
            notes: notes || '',
            createdAt: new Date()
        };

        // Add to dailyLogs
        if (!user.progressMetrics.dailyLogs) {
            user.progressMetrics.dailyLogs = [];
        }
        user.progressMetrics.dailyLogs.push(dailyLog);

        // Calculate week number
        const weekStart = new Date(date);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekKey = `${weekStart.getFullYear()}-W${String(Math.ceil(weekStart.getDate() / 7)).padStart(2, '0')}`;

        // Update or create weekly stats
        let weekStats = user.progressMetrics.weeklyStats.find(stat => stat.week === weekKey);
        if (!weekStats) {
            weekStats = {
                week: weekKey,
                weightLog: measurements.weight,
                caloriesConsumed: 0,
                caloriesBurned: 0,
                workoutsCompleted: 0,
                totalWorkoutDuration: 0,
                nutritionAdherence: 0,
                waterIntake: 0,
                sleepHours: 0,
                moodScore: 0,
                measurements,
                createdAt: new Date()
            };
            user.progressMetrics.weeklyStats.push(weekStats);
        }

        // Update weekly metrics
        weekStats.caloriesConsumed += dailyLog.totalNutrition.calories;
        if (workoutData) {
            weekStats.caloriesBurned += workoutData.caloriesBurned;
            weekStats.workoutsCompleted += 1;
            weekStats.totalWorkoutDuration += workoutData.duration;
        }
        weekStats.waterIntake += dailyLog.totalNutrition.waterIntake;
        weekStats.sleepHours = (weekStats.sleepHours + dailyLog.sleep.hours) / 2;
        weekStats.measurements = measurements;

        await user.save();
        
        res.status(200).json({
            msg: 'Log entry saved successfully',
            dailyLog,
            weekStats
        });
    } catch (error) {
        console.error('Error saving log entry:', error);
        res.status(500).json({ 
            msg: 'Error saving log entry', 
            error: error.message,
            stack: error.stack // For debugging
        });
    }
});

// Helper function for calculating progress
const calculateProgress = (current, target) => {
    const progress = (current / target) * 100;
    return Math.min(Math.max(progress, 0), 100); // Clamp between 0 and 100
};

userRouter.get('/progress/:timeframe', auth, async (req, res) => {
    try {
        const { timeframe } = req.params;
        const user = await userModel.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Initialize if needed
        user.progressMetrics = user.progressMetrics || {
            dailyLogs: [],
            weeklyStats: [],
            monthlyProgress: [],
            goals: []
        };

        let metrics;
        if (timeframe === 'weekly') {
            metrics = user.progressMetrics.weeklyStats.sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            ).slice(0, 4); // Last 4 weeks
        } else {
            // Calculate monthly progress from weekly stats
            const monthlyData = {};
            user.progressMetrics.weeklyStats.forEach(week => {
                const monthKey = new Date(week.createdAt).toISOString().slice(0, 7); // YYYY-MM
                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = {
                        month: monthKey,
                        totalWorkouts: 0,
                        totalCalories: 0,
                        weightSum: 0,
                        weightCount: 0,
                        measurements: week.measurements,
                        createdAt: week.createdAt
                    };
                }
                monthlyData[monthKey].totalWorkouts += week.workoutsCompleted;
                monthlyData[monthKey].totalCalories += week.caloriesConsumed;
                monthlyData[monthKey].weightSum += week.weightLog;
                monthlyData[monthKey].weightCount++;
            });

            metrics = Object.values(monthlyData).map(month => ({
                ...month,
                averageWeight: month.weightSum / month.weightCount,
                averageCalories: month.totalCalories / month.weightCount
            })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        // Calculate summary
        const summary = {
            totalWorkouts: metrics.reduce((acc, curr) => acc + (curr.workoutsCompleted || curr.totalWorkouts || 0), 0),
            weightChange: calculateWeightChange(metrics),
            consistency: calculateConsistency(metrics),
            achievedGoals: user.progressMetrics.goals?.filter(goal => goal.achieved) || []
        };

        res.status(200).json({
            timeframe,
            metrics,
            summary
        });
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({ 
            msg: 'Error fetching progress data', 
            error: error.message,
            stack: error.stack // For debugging
        });
    }
});

module.exports = {userRouter}