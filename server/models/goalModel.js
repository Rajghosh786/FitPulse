const mongoose = require('mongoose');

const goalSchema = new Schema({
    user: {type: Schema.Types.ObjectId,ref: 'User',required: true},
    goalType: {type: String,required: true,}, // e.g., "running", "weight loss"
    goalValue: {type: Number,required: true},
    currentProgress: {type: Number,default: 0},
    goalDeadline: {type: Date,required: true},
    notificationsEnabled: {type: Boolean,default: true}
  }, { timestamps: true });
  
  const goalModel = mongoose.model('Goal', goalSchema);
  module.exports = {goalModel}
  