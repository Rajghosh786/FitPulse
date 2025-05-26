import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiClock, FiActivity } from 'react-icons/fi';

const WorkoutDetailModal = ({ isOpen, onClose, workout }) => {
  if (!isOpen || !workout) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gray-800/95 backdrop-blur border-b border-gray-700 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{workout.name}</h2>
                <p className="text-gray-400">{workout.description}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <span className="text-sm px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">
                <FiActivity className="inline mr-1" />
                {workout.type}
              </span>
              <span className="text-sm px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                {workout.level}
              </span>
              <span className="text-sm px-3 py-1 rounded-full bg-purple-500/20 text-purple-400">
                <FiClock className="inline mr-1" />
                {workout.duration} mins
              </span>
            </div>
          </div>

          {/* Exercises List */}
          <div className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Exercises</h3>
            <div className="space-y-4">
              {workout.exercises.map((exercise, index) => (
                <div
                  key={index}
                  className="bg-gray-700/50 rounded-xl p-4 hover:bg-gray-700/70 transition-colors"
                >
                  <h4 className="text-lg font-medium text-white mb-2">
                    {index + 1}. {exercise.name}
                  </h4>
                  <div className="flex gap-4 text-sm text-gray-300 mb-2">
                    <span>{exercise.sets} sets</span>
                    <span>•</span>
                    <span>{exercise.reps} reps</span>
                  </div>
                  <p className="text-gray-400 text-sm">{exercise.instructions}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-800/95 backdrop-blur border-t border-gray-700 p-6">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WorkoutDetailModal;