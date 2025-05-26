// import React, { useState } from 'react';

// function WorkoutTracking() {
//   const [workouts] = useState([
//     { type: 'Running', duration: 30, calories: 300, date: '2025-04-20' },
//     { type: 'Weightlifting', duration: 45, calories: 400, date: '2025-04-18' },
//     { type: 'Yoga', duration: 60, calories: 250, date: '2025-04-17' },
//   ]);

//   return (
//     <div className="p-8">
//       <h2 className="text-2xl font-semibold mb-6">Track Your Workouts</h2>
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {workouts.map((workout, index) => (
//           <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
//             <h3 className="text-lg font-semibold">{workout.type}</h3>
//             <p className="text-gray-700">Duration: {workout.duration} minutes</p>
//             <p className="text-gray-700">Calories Burned: {workout.calories}</p>
//             <p className="text-gray-700">Date: {workout.date}</p>
//           </div>
//         ))}
//       </div>
//       <div className="mt-6">
//         <button className="bg-blue-500 text-white p-2 rounded w-full">Log a New Workout</button>
//       </div>
//     </div>
//   );
// }

// export default WorkoutTracking;
