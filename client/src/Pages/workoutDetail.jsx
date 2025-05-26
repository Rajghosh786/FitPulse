// import { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const WorkoutDetail = () => {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const [workout, setWorkout] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [currentExerciseIndex, setCurrentExerciseIndex] = useState(null);
//     const [isResting, setIsResting] = useState(false);
//     const [restTimeLeft, setRestTimeLeft] = useState(0);
//     const [workoutComplete, setWorkoutComplete] = useState(false);
//     const [workoutStarted, setWorkoutStarted] = useState(false);
//     const [workoutTime, setWorkoutTime] = useState(0);
//     const [showModal, setShowModal] = useState(false);
//     const [reward, setReward] = useState(null);

//     useEffect(() => {
//         const fetchWorkout = async () => {
//             try {
//                 const response = await axios.get(`http://localhost:8000/api/workouts/${id}`);
//                 setWorkout(response.data);
//             } catch (error) {
//                 console.error('Error fetching workout:', error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchWorkout();
//     }, [id]);

//     // Timer for tracking overall workout duration
//     useEffect(() => {
//         let interval;
//         if (workoutStarted && !workoutComplete) {
//             interval = setInterval(() => {
//                 setWorkoutTime((prev) => prev + 1);
//             }, 1000);
//         }
//         return () => clearInterval(interval);
//     }, [workoutStarted, workoutComplete]);

//     // Handle rest periods between exercises
//     useEffect(() => {
//         let restTimer;
//         if (isResting && restTimeLeft > 0) {
//             restTimer = setTimeout(() => {
//                 setRestTimeLeft((prev) => prev - 1);
//             }, 1000);
//         } else if (isResting && restTimeLeft === 0) {
//             setIsResting(false);
//             setCurrentExerciseIndex((prev) => prev + 1);
//             playWhistleSound();
//         }
//         return () => clearTimeout(restTimer);
//     }, [isResting, restTimeLeft]);

//     const playWhistleSound = () => {
//         const whistle = new Audio('/whistle.mp3'); // Ensure the whistle sound file is in the public folder
//         whistle.play();
//     };

//     const startWorkout = () => {
//         setWorkoutStarted(true);
//         setCurrentExerciseIndex(0);
//         setShowModal(true);
//         playWhistleSound();
//     };

//     const completeExercise = () => {
//         const exercise = workout.exercises[currentExerciseIndex];
//         if (currentExerciseIndex < workout.exercises.length - 1) {
//             if (exercise.restTime && exercise.restTime > 0) {
//                 setIsResting(true);
//                 setRestTimeLeft(exercise.restTime);
//                 playWhistleSound();
//             } else {
//                 setCurrentExerciseIndex((prev) => prev + 1);
//                 playWhistleSound();
//             }
//         } else {
//             setWorkoutComplete(true);
//             setShowModal(false);
//             calculateReward();
//         }
//     };

//     const calculateReward = () => {
//         const rewardPoints = Math.floor(workoutTime / 60) * 10; // Example: 10 points per minute
//         setReward(rewardPoints);
//         saveWorkoutRecord(rewardPoints);
//     };

//     const saveWorkoutRecord = (rewardPoints) => {
//         // Placeholder for saving the workout record to the user's profile
//         console.log(`Workout completed! Reward: ${rewardPoints} points`);
//         // Example: Send data to the backend
//         // axios.post('/api/profile/workout-record', { workoutId: id, rewardPoints, duration: workoutTime });
//     };

//     const formatTime = (seconds) => {
//         const mins = Math.floor(seconds / 60);
//         const secs = seconds % 60;
//         return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//     };

//     if (loading) return <div className="text-white">Loading workout...</div>;

//     if (!workout) return <div className="text-red-500">Workout not found.</div>;

//     return (
//         <div className="p-6 bg-gray-900 px-25 min-h-screen text-white">
//             <button
//                 onClick={() => navigate('/workouts')}
//                 className="text-blue-400 hover:text-blue-200 mb-4"
//             >
//                 &#8592; Back to Workouts
//             </button>

//             <h1 className="text-3xl font-bold mb-4">{workout.name}</h1>
//             <p className="mb-4 text-gray-300">{workout.description}</p>

//             <div className="flex flex-wrap items-center gap-4 mb-6">
//                 <span className="text-xs px-4 py-2 rounded-full bg-gray-100 text-gray-800">
//                     {workout.level}
//                 </span>
//                 <span className="text-xs px-4 py-2 rounded-full bg-gray-100 text-gray-800">
//                     {workout.type}
//                 </span>
//                 <span className="text-xs px-4 py-2 rounded-full bg-gray-100 text-gray-800">
//                     {workout.estimatedDuration} min
//                 </span>
//                 <span className="text-xs px-4 py-2 rounded-full bg-gray-100 text-gray-800">
//                     {workout.exercises.length} exercises
//                 </span>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                 {/* Left Column: Workout List */}
//                 <div className="lg:col-span-2">
//                     <div className="bg-gray-800 p-6 rounded-lg">
//                         <h2 className="text-xl font-bold mb-4">Workout List</h2>
//                         <ul className="space-y-4">
//                             {workout.exercises.map((exercise, index) => (
//                                 <li
//                                     key={index}
//                                     className={`p-4 rounded-lg ${
//                                         currentExerciseIndex === index
//                                             ? 'bg-blue-500 text-white'
//                                             : 'bg-gray-700 text-gray-300'
//                                     }`}
//                                 >
//                                     <h3 className="text-lg font-semibold">{exercise.name}</h3>
//                                     <p className="text-sm">{exercise.instructions}</p>
//                                     <p className="text-sm">
//                                         {exercise.sets && `Sets: ${exercise.sets}`}
//                                         {exercise.reps && ` | Reps: ${exercise.reps}`}
//                                         {exercise.duration && ` | Duration: ${exercise.duration}s`}
//                                     </p>
//                                 </li>
//                             ))}
//                         </ul>
//                     </div>
//                 </div>

//                 {/* Right Column: Timer and Controls */}
//                 <div>
//                     <div className="bg-gray-800 p-6 rounded-lg">
//                         <h3 className="text-xl font-bold mb-4">Workout Timer</h3>
//                         <p className="text-5xl font-bold mb-4">{formatTime(workoutTime)}</p>
//                         {!workoutStarted && !workoutComplete && (
//                             <button
//                                 onClick={startWorkout}
//                                 className="bg-blue-500 text-white px-4 py-2 rounded w-full"
//                             >
//                                 Start Exercise
//                             </button>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {showModal && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//                     <div className="bg-gray-800 p-6 rounded-lg text-white w-96">
//                         {isResting ? (
//                             <div className="text-center">
//                                 <h2 className="text-xl font-bold mb-4">Rest Time</h2>
//                                 <p className="text-5xl font-bold mb-4">{restTimeLeft}s</p>
//                                 <p className="text-gray-400 mb-4">Take a short break before the next exercise.</p>
//                                 <button
//                                     onClick={() => {
//                                         setIsResting(false);
//                                         setCurrentExerciseIndex((prev) => prev + 1);
//                                     }}
//                                     className="bg-blue-500 text-white px-4 py-2 rounded"
//                                 >
//                                     Skip Rest
//                                 </button>
//                             </div>
//                         ) : (
//                             <div className="text-center">
//                                 <h2 className="text-xl font-bold mb-4">
//                                     {workout.exercises[currentExerciseIndex].name}
//                                 </h2>
//                                 <p className="mb-4">{workout.exercises[currentExerciseIndex].instructions}</p>
//                                 <button
//                                     onClick={completeExercise}
//                                     className="bg-blue-500 text-white px-4 py-2 rounded"
//                                 >
//                                     Complete Exercise
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )}

//             {workoutComplete && (
//                 <div className="text-center mt-8">
//                     <h2 className="text-2xl font-bold text-green-500 mb-4">Workout Complete!</h2>
//                     <p className="text-gray-300 mb-4">Total Time: {formatTime(workoutTime)}</p>
//                     <p className="text-gray-300 mb-4">Reward: {reward} points</p>
//                     <div className="bg-gray-800 p-6 rounded-lg text-white">
//                         <h3 className="text-xl font-bold mb-4">Workout Summary</h3>
//                         <ul className="space-y-2">
//                             {workout.exercises.map((exercise, index) => (
//                                 <li key={index} className="text-gray-300">
//                                     <strong>{index + 1}. {exercise.name}</strong> - {exercise.instructions}
//                                 </li>
//                             ))}
//                         </ul>
//                     </div>
//                     <button
//                         onClick={() => navigate('/profile')}
//                         className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
//                     >
//                         View Profile
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default WorkoutDetail;