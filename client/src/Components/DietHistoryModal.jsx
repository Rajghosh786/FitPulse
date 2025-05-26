import { motion, AnimatePresence } from 'framer-motion';

const DietHistoryModal = ({ isOpen, onClose, dietPlan }) => {
  if (!isOpen || !dietPlan) return null;

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
          className="bg-gray-800 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-gray-800 p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">Weekly Diet Plan History</h2>
            <p className="text-gray-400">
              Created on: {new Date(dietPlan.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(dietPlan.weeklyPlan).map(([day, meals]) => (
              <div key={day} className="bg-gray-900/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">{day}</h3>
                <div className="space-y-4">
                  {meals.split('\n').map((line, index) => (
                    <p key={index} className="text-gray-300 text-sm">
                      {line.trim()}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DietHistoryModal;