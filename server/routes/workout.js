const express = require("express");
const { Workout, Progress } = require('../models/workout')
const { userModel } = require('../models/user.model')

const workoutRouter = express.Router();

// Get all workouts
workoutRouter.get("/", async (req, res) => {
  try {
    const workouts = await Workout.find();
    return res.status(200).json(workouts);
  } catch (error) {
    return res.status(500).json({ msg: "Error fetching workouts" });
  }
});

// Add a new workout
workoutRouter.post("/", async (req, res) => {
  const { name, type, level, estimatedDuration, description, exercises } = req.body;

  try {
    const newWorkout = new Workout({ name, type, level, estimatedDuration, description, exercises });
    await newWorkout.save();
    return res.status(201).json({ msg: "Workout added", workout: newWorkout });
  } catch (error) {
    return res.status(500).json({ msg: "Error adding workout" });
  }
});

workoutRouter.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const workout = await Workout.findById(id);
      if (!workout) {
        return res.status(404).json({ msg: "Workout not found" });
      }
      return res.status(200).json(workout);
    } catch (error) {
      return res.status(500).json({ msg: "Error fetching workout" });
    }
});

// Update progress (e.g., after a workout is completed)
workoutRouter.post("/progress", async (req, res) => {
  const { userId, completedWorkouts, totalMinutes, streakDays, lastWorkout } = req.body;

  try {
    const progress = await Progress.findOneAndUpdate(
      { userId },
      { completedWorkouts, totalMinutes, streakDays, lastWorkout },
      { new: true, upsert: true }
    );
    return res.status(200).json(progress);
  } catch (error) {
    return res.status(500).json({ msg: "Error updating progress" });
  }
});

// Fetch user progress
workoutRouter.get("/progress/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const progress = await Progress.findOne({ userId });
    if (!progress) {
      return res.status(404).json({ msg: "No progress found for user" });
    }
    return res.status(200).json(progress);
  } catch (error) {
    return res.status(500).json({ msg: "Error fetching progress" });
  }
});

module.exports = workoutRouter;
