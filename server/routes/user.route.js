const express = require("express")
const userRouter = express.Router()
const bcrypt = require('bcrypt');
const axios = require('axios');
const { userModel } = require("../models/user.model");
var jwt = require('jsonwebtoken');
const { auth } = require("../middlewares/auth");
require("dotenv").config()

// Progress helper functions
const hasValidWorkout = (workout) => {
    return workout && workout.type && parseInt(workout.duration, 10) > 0;
};

const isSameCalendarDay = (a, b) => {
    const d1 = new Date(a);
    const d2 = new Date(b);
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
};

const getWeekKey = (dateInput) => {
    const date = new Date(dateInput);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(date);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() + diff);

    const thursday = new Date(monday);
    thursday.setDate(monday.getDate() + 3);
    const yearStart = new Date(thursday.getFullYear(), 0, 1);
    const weekNum = Math.ceil((((thursday - yearStart) / 86400000) + 1) / 7);

    return `${thursday.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
};

const getMonthKey = (dateInput) => {
    const date = new Date(dateInput);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const recalculateWeeklyStats = (dailyLogs, weekKey) => {
    const weekLogs = dailyLogs.filter(log => getWeekKey(log.date) === weekKey);

    let caloriesConsumed = 0;
    let caloriesBurned = 0;
    let workoutsCompleted = 0;
    let totalWorkoutDuration = 0;
    let waterIntake = 0;
    let sleepHoursSum = 0;
    let latestMeasurements = {
        chest: 0,
        waist: 0,
        hips: 0,
        arms: 0,
        thighs: 0
    };
    let latestWeight = 0;
    let latestDate = null;

    weekLogs.forEach(log => {
        caloriesConsumed += log.totalNutrition?.calories || 0;
        waterIntake += log.totalNutrition?.waterIntake || 0;
        sleepHoursSum += log.sleep?.hours || 0;

        if (hasValidWorkout(log.workout)) {
            workoutsCompleted += 1;
            caloriesBurned += parseInt(log.workout.caloriesBurned, 10) || 0;
            totalWorkoutDuration += parseInt(log.workout.duration, 10) || 0;
        }

        const logDate = new Date(log.date);
        if (!latestDate || logDate >= latestDate) {
            latestDate = logDate;
            latestWeight = log.measurements?.weight || 0;
            latestMeasurements = {
                chest: log.measurements?.chest || 0,
                waist: log.measurements?.waist || 0,
                hips: log.measurements?.hips || 0,
                arms: log.measurements?.arms || 0,
                thighs: log.measurements?.thighs || 0
            };
        }
    });

    const logCount = weekLogs.length;

    return {
        week: weekKey,
        weightLog: latestWeight,
        caloriesConsumed,
        caloriesBurned,
        workoutsCompleted,
        totalWorkoutDuration,
        nutritionAdherence: 0,
        waterIntake,
        sleepHours: logCount > 0 ? sleepHoursSum / logCount : 0,
        moodScore: 0,
        measurements: latestMeasurements,
        createdAt: latestDate || new Date()
    };
};

const recalculateMonthlyProgress = (dailyLogs, monthKey) => {
    const monthLogs = dailyLogs.filter(log => getMonthKey(log.date) === monthKey);

    let totalWorkouts = 0;
    let totalCaloriesConsumed = 0;
    let totalCaloriesBurned = 0;
    let weightSum = 0;
    let weightCount = 0;
    const weights = [];

    monthLogs.forEach(log => {
        totalCaloriesConsumed += log.totalNutrition?.calories || 0;

        if (log.measurements?.weight) {
            weightSum += log.measurements.weight;
            weightCount += 1;
            weights.push({ weight: log.measurements.weight, date: new Date(log.date) });
        }

        if (hasValidWorkout(log.workout)) {
            totalWorkouts += 1;
            totalCaloriesBurned += parseInt(log.workout.caloriesBurned, 10) || 0;
        }
    });

    const logCount = monthLogs.length;
    weights.sort((a, b) => a.date - b.date);
    const weightChange = weights.length >= 2
        ? Number((weights[weights.length - 1].weight - weights[0].weight).toFixed(2))
        : 0;

    return {
        month: monthKey,
        averageWeight: weightCount > 0 ? Number((weightSum / weightCount).toFixed(2)) : 0,
        totalWorkouts,
        averageCaloriesConsumed: logCount > 0 ? Math.round(totalCaloriesConsumed / logCount) : 0,
        averageCaloriesBurned: totalWorkouts > 0 ? Math.round(totalCaloriesBurned / totalWorkouts) : 0,
        workoutConsistency: logCount > 0 ? Math.round((totalWorkouts / logCount) * 100) : 0,
        nutritionConsistency: 0,
        weightChange,
        achievedGoals: [],
        createdAt: monthLogs.length > 0
            ? new Date(Math.max(...monthLogs.map(log => new Date(log.date).getTime())))
            : new Date()
    };
};

const calculateWeightChange = (progressData) => {
    if (!progressData || progressData.length < 2) return 0;

    const sortedData = [...progressData].sort((a, b) =>
        new Date(a.createdAt) - new Date(b.createdAt)
    );

    const oldestWeight = sortedData[0].weightLog ?? sortedData[0].averageWeight ?? 0;
    const latestWeight = sortedData[sortedData.length - 1].weightLog ?? sortedData[sortedData.length - 1].averageWeight ?? 0;

    return Number((latestWeight - oldestWeight).toFixed(2));
};

const calculateConsistency = (dailyLogs) => {
    if (!dailyLogs || dailyLogs.length === 0) return 0;

    const daysWithWorkouts = dailyLogs.filter(log => hasValidWorkout(log.workout)).length;
    return Math.round((daysWithWorkouts / dailyLogs.length) * 100);
};

const normalizeMetricsForCharts = (metrics, timeframe) => {
    return metrics.map(item => ({
        ...item,
        workoutsCompleted: item.workoutsCompleted ?? item.totalWorkouts ?? 0,
        weightLog: item.weightLog ?? item.averageWeight ?? 0
    }));
};

const generateProgressInsight = async (timeframe, progressPayload) => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Gemini API key not configured');
    }

    const prompt = `Analyze this fitness ${timeframe} progress data and provide 3-4 key insights and recommendations:
${JSON.stringify(progressPayload)}
Focus on trends, improvements, and areas needing attention.
Format the response in bullet points.`;

    const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
        {
            contents: [{ parts: [{ text: prompt }] }]
        }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
        throw new Error('Empty AI response');
    }

    return text;
};

const recalculateAllWeeklyStats = (dailyLogs) => {
    const weekKeys = [...new Set((dailyLogs || []).map(log => getWeekKey(log.date)))];
    return weekKeys
        .map(weekKey => recalculateWeeklyStats(dailyLogs, weekKey))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const recalculateAllMonthlyProgress = (dailyLogs) => {
    const monthKeys = [...new Set((dailyLogs || []).map(log => getMonthKey(log.date)))];
    return monthKeys
        .map(monthKey => recalculateMonthlyProgress(dailyLogs, monthKey))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const buildProgressResponse = (user, timeframe) => {
    const allDailyLogs = (user.progressMetrics.dailyLogs || [])
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    let metrics;
    let periodDailyLogs = allDailyLogs;

    if (timeframe === 'weekly') {
        metrics = (user.progressMetrics.weeklyStats || [])
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 4);

        if (metrics.length > 0) {
            const weekKeys = new Set(metrics.map(item => item.week));
            periodDailyLogs = allDailyLogs.filter(log => weekKeys.has(getWeekKey(log.date)));
        }
    } else {
        metrics = (user.progressMetrics.monthlyProgress || [])
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 6);

        if (metrics.length > 0) {
            const monthKeys = new Set(metrics.map(item => item.month));
            periodDailyLogs = allDailyLogs.filter(log => monthKeys.has(getMonthKey(log.date)));
        }
    }

    const chartMetrics = normalizeMetricsForCharts(metrics, timeframe);
    const achievedGoals = user.progressMetrics.goals?.filter(goal => goal.achieved) || [];
    const totalWorkouts = metrics.reduce((acc, curr) =>
        acc + (curr.workoutsCompleted || curr.totalWorkouts || 0), 0);
    const weightChange = timeframe === 'monthly' && metrics[0]?.weightChange !== undefined
        ? metrics[0].weightChange
        : calculateWeightChange(chartMetrics);
    const consistency = calculateConsistency(periodDailyLogs);

    const summary = {
        totalWorkouts,
        weightChange,
        consistency,
        achievedGoals
    };

    const insight = user.progressMetrics.aiInsights?.[timeframe]?.content || '';

    return {
        timeframe,
        metrics: chartMetrics,
        dailyLogs: allDailyLogs,
        summary,
        totalWorkouts: summary.totalWorkouts,
        weightChange: summary.weightChange,
        consistency: summary.consistency,
        achievedGoals: summary.achievedGoals,
        insight,
        insightGeneratedAt: user.progressMetrics.aiInsights?.[timeframe]?.generatedAt || null,
        insightNoData: allDailyLogs.length === 0
    };
};

const buildInsightPayload = (user, timeframe) => {
    const progress = buildProgressResponse(user, timeframe);
    return {
        timeframe,
        metrics: progress.metrics,
        dailyLogs: progress.dailyLogs.slice(0, 14),
        summary: progress.summary
    };
};

const regenerateAllInsights = async (user) => {
    const now = new Date();

    if (!user.progressMetrics.aiInsights) {
        user.progressMetrics.aiInsights = {
            weekly: { content: '', generatedAt: null },
            monthly: { content: '', generatedAt: null }
        };
    }

    const dailyLogs = user.progressMetrics.dailyLogs || [];

    if (dailyLogs.length === 0) {
        user.progressMetrics.aiInsights.weekly = { content: '', generatedAt: now };
        user.progressMetrics.aiInsights.monthly = { content: '', generatedAt: now };
        return;
    }

    for (const timeframe of ['weekly', 'monthly']) {
        try {
            const content = await generateProgressInsight(timeframe, buildInsightPayload(user, timeframe));
            user.progressMetrics.aiInsights[timeframe] = {
                content,
                generatedAt: now
            };
        } catch (error) {
            console.error(`${timeframe} insight generation error:`, error);
            user.progressMetrics.aiInsights[timeframe] = {
                content: '',
                generatedAt: now
            };
        }
    }
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

userRouter.post('/update-height-weight', auth, async (req, res) => {
    try {
        const {
            userId,
            height,
            weight
        } = req.body;

        // Verify that the authenticated user matches the userId
        if (req.userId !== userId) {
            return res.status(403).json({ msg: 'Unauthorized access' });
        }

        // Validate required fields
        if (!height || !weight) {
            return res.status(400).json({ msg: 'Missing required fields' });
        }

        // Additional validation
        const heightNum = parseFloat(height);
        const weightNum = parseFloat(weight);
        
        if (isNaN(heightNum) || isNaN(weightNum) || heightNum <= 0 || weightNum <= 0) {
            return res.status(400).json({ msg: 'Invalid height or weight values' });
        }

        // Update height and weight
        const updateData = {
            height: heightNum,
            weight: weightNum
        };

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
            msg: 'Height and weight updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Height and weight update error:', error);
        res.status(500).json({ msg: 'Error updating height and weight', error: error.message });
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

        if (!measurements || typeof measurements.weight !== 'number') {
            return res.status(400).json({ msg: 'Valid weight measurement is required' });
        }

        const user = await userModel.findById(req.userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (!user.progressMetrics) {
            user.progressMetrics = {
                dailyLogs: [],
                weeklyStats: [],
                monthlyProgress: [],
                goals: [],
                aiInsights: {
                    weekly: { content: '', generatedAt: null },
                    monthly: { content: '', generatedAt: null }
                }
            };
        }

        const workoutData = hasValidWorkout(workout) ? {
            type: workout.type,
            duration: parseInt(workout.duration, 10) || 0,
            intensity: workout.intensity || 'moderate',
            exercises: Array.isArray(workout.exercises) ? workout.exercises : [],
            caloriesBurned: parseInt(workout.caloriesBurned, 10) || 0,
            intensityScore: parseInt(workout.intensityScore, 10) || 0,
            impactedMuscleGroups: Array.isArray(workout.impactedMuscleGroups) ?
                workout.impactedMuscleGroups : []
        } : null;

        const logDate = new Date(date);
        const existingIndex = (user.progressMetrics.dailyLogs || []).findIndex(log =>
            isSameCalendarDay(log.date, logDate)
        );

        const dailyLog = {
            date: logDate,
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
            createdAt: existingIndex >= 0
                ? user.progressMetrics.dailyLogs[existingIndex].createdAt || new Date()
                : new Date()
        };

        if (!user.progressMetrics.dailyLogs) {
            user.progressMetrics.dailyLogs = [];
        }

        if (existingIndex >= 0) {
            user.progressMetrics.dailyLogs[existingIndex] = dailyLog;
        } else {
            user.progressMetrics.dailyLogs.push(dailyLog);
        }

        user.progressMetrics.weeklyStats = recalculateAllWeeklyStats(user.progressMetrics.dailyLogs);
        user.progressMetrics.monthlyProgress = recalculateAllMonthlyProgress(user.progressMetrics.dailyLogs);

        await regenerateAllInsights(user);

        user.markModified('progressMetrics');
        await user.save();

        res.status(200).json({
            msg: 'Log entry saved successfully',
            dailyLog,
            weeklyStats: user.progressMetrics.weeklyStats,
            monthlyProgress: user.progressMetrics.monthlyProgress,
            aiInsights: user.progressMetrics.aiInsights,
            progress: {
                weekly: buildProgressResponse(user, 'weekly'),
                monthly: buildProgressResponse(user, 'monthly')
            }
        });
    } catch (error) {
        console.error('Error saving log entry:', error);
        res.status(500).json({
            msg: 'Error saving log entry',
            error: error.message
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

        user.progressMetrics = user.progressMetrics || {
            dailyLogs: [],
            weeklyStats: [],
            monthlyProgress: [],
            goals: [],
            aiInsights: {
                weekly: { content: '', generatedAt: null },
                monthly: { content: '', generatedAt: null }
            }
        };

        if (!user.progressMetrics.aiInsights) {
            user.progressMetrics.aiInsights = {
                weekly: { content: '', generatedAt: null },
                monthly: { content: '', generatedAt: null }
            };
        }

        res.status(200).json(buildProgressResponse(user, timeframe));
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({
            msg: 'Error fetching progress data',
            error: error.message
        });
    }
});

module.exports = {userRouter}