const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema({
  name: String,
  type: String,
  level: String,
  estimatedDuration: Number,
  description: String,
  exercises: [
    {
      name: String,
      sets: { type: Number, required: false },
      reps: { type: Number, required: false },
      duration: { type: Number, required: false },
      restTime: Number,
      instructions: String,
      muscleGroup: String,
      videoUrl: String,
    },
  ],
});

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  completedWorkouts: { type: Number, default: 0 },
  totalMinutes: { type: Number, default: 0 },
  streakDays: { type: Number, default: 0 },
  lastWorkout: Date,
});

const Workout = mongoose.model("Workout", workoutSchema);
const Progress = mongoose.model("Progress", progressSchema);

module.exports = { Workout, Progress };
