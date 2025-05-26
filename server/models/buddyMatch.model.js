const mongoose = require('mongoose');

const buddyMatchSchema = new Schema({
    user1: {type: Schema.Types.ObjectId,ref: 'User',required: true},
    user2: {type: Schema.Types.ObjectId,ref: 'User',required: true},
    matchDate: {type: Date,default: Date.now},
    status: {type: String,enum: ['pending', 'active', 'inactive'],default: 'pending'},
    sharedGoals: {type: [String],default: []},
    sharedWorkouts: {type: [String],default: []},
  }, { timestamps: true });
  

  const buddyMatchModel = mongoose.model('BuddyMatch', buddyMatchSchema);
  module.exports = {buddyMatchModel}
  