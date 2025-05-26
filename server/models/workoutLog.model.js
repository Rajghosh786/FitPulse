const mongoose = require('mongoose');

const workoutLogSchema = new Schema({
    user: {type: Schema.Types.ObjectId,ref: 'User',required: true},
    workoutType: {type: String,required: true},
    duration: {type: Number}, // in minutes
    distance: {type: Number}, // in miles or kilometers (optional)
    caloriesBurned: {type: Number,required: true},
    date: {type: Date,required: true},
    intensity: {type: String,enum: ['low', 'medium', 'high'],default: 'medium'},
    notes: {type: String,default: null}
  }, { timestamps: true });
  
  const workoutLogModel = mongoose.model('WorkoutLog', workoutLogSchema);
  module.exports = {workoutLogModel}
  