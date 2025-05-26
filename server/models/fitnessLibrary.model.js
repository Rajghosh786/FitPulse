const mongoose = require("mongoose")

const fitnessLibrarySchema = new Schema({
    title: {type: String,required: true},
    type: {type: String,enum: ['video', 'article'],required: true},
    url: {type: String,required: true},
    description: {type: String,required: true},
    tags: {type: [String],} // Tags for categorizing resources (e.g., 'strength', 'yoga', etc.default: []
  }, { timestamps: true });

  const fitnessLibraryModel = mongoose.model('FitnessLibrary', fitnessLibrarySchema);
  module.exports = {fitnessLibraryModel}
  