const mongoose = require('mongoose');

const progressReportSchema = new Schema({
    user: {type: Schema.Types.ObjectId,ref: 'User',required: true},
    weekStartDate: {type: Date,required: true},
    weekEndDate: {type: Date,required: true},
    workoutsCompleted: {type: Number,required: true,default: 0},
    caloriesBurned: {type: Number,required: true,default: 0},
    goalsProgress: {type: [String],} // List of achieved goals during the week
  }, { timestamps: true });
  
  const progressReportModel = mongoose.model('ProgressReport', progressReportSchema);
  module.exports = {progressReportModel}