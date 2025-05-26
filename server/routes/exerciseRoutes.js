const express = require('express');
const Exercise = require('../models/exercise')
const router = express.Router();


router.post('/postExercise', async (req, res) => {
  try {
    const newExercise = new Exercise(req.body);
    await newExercise.save();
    res.status(201).json(newExercise);
  } catch (err) {
    res.status(500).json({ message: 'Error creating exercise', error: err });
  }
});


router.get('/', async (req, res) => {
  try {
    const exercises = await Exercise.find();
    res.json(exercises);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching exercises', error: err });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ message: 'Exercise not found' });
    res.json(exercise);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching exercise', error: err });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const updatedExercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedExercise) return res.status(404).json({ message: 'Exercise not found' });
    res.json(updatedExercise);
  } catch (err) {
    res.status(500).json({ message: 'Error updating exercise', error: err });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const deletedExercise = await Exercise.findByIdAndDelete(req.params.id);
    if (!deletedExercise) return res.status(404).json({ message: 'Exercise not found' });
    res.json({ message: 'Exercise deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting exercise', error: err });
  }
});

module.exports = router;
