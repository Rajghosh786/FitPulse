const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  muscleGroup: { type: String, required: true },
  image: { type: String, required: true },
  steps: [{ type: String }],
  musclesWorked: { type: String },
  equipment: { type: String },
  tips: [{ type: String }]
});

module.exports = mongoose.model('Exercise', exerciseSchema);
