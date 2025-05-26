// import { useState, useEffect, useRef } from 'react'
// import { motion } from 'framer-motion'
// import { FiPlay, FiPause, FiRefreshCw } from 'react-icons/fi'

// const WorkoutTimer = ({ duration, onComplete }) => {
//   const [timeLeft, setTimeLeft] = useState(duration)
//   const [isActive, setIsActive] = useState(false)
//   const [isPaused, setIsPaused] = useState(false)
//   const intervalRef = useRef(null)

//   useEffect(() => {
//     if (isActive && timeLeft > 0) {
//       intervalRef.current = setInterval(() => {
//         setTimeLeft((time) => time - 1)
//       }, 1000)
//     } else if (timeLeft === 0) {
//       clearInterval(intervalRef.current)
//       if (onComplete) onComplete()
//     }

//     return () => clearInterval(intervalRef.current)
//   }, [isActive, timeLeft, onComplete])

//   useEffect(() => {
//     if (isPaused) {
//       clearInterval(intervalRef.current)
//     } else if (isActive) {
//       intervalRef.current = setInterval(() => {
//         setTimeLeft((time) => time - 1)
//       }, 1000)
//     }

//     return () => clearInterval(intervalRef.current)
//   }, [isPaused, isActive])

//   const toggleTimer = () => {
//     if (!isActive) {
//       setIsActive(true)
//       setIsPaused(false)
//     } else if (isPaused) {
//       setIsPaused(false)
//     } else {
//       setIsPaused(true)
//     }
//   }

//   const resetTimer = () => {
//     clearInterval(intervalRef.current)
//     setTimeLeft(duration)
//     setIsActive(false)
//     setIsPaused(false)
//   }

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60)
//     const secs = seconds % 60
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
//   }

//   // Calculate progress percentage
//   const progress = ((duration - timeLeft) / duration) * 100

//   return (
//     <div className="w-full">
//       <div className="relative w-full max-w-xs mx-auto">
//         <svg className="w-full h-52" viewBox="0 0 100 100">
//           {/* Background circle */}
//           <circle
//             cx="50"
//             cy="50"
//             r="45"
//             fill="none"
//             stroke="#e2e8f0"
//             strokeWidth="8"
//           />
          
//           {/* Progress circle */}
//           <motion.circle
//             cx="50"
//             cy="50"
//             r="45"
//             fill="none"
//             stroke="#0ea5e9"
//             strokeWidth="8"
//             strokeLinecap="round"
//             strokeDasharray="283"
//             strokeDashoffset={283 - (283 * progress) / 100}
//             transform="rotate(-90 50 50)"
//             animate={{ strokeDashoffset: 283 - (283 * progress) / 100 }}
//             transition={{ duration: 0.5 }}
//           />
          
//           {/* Timer text */}
//           <text
//             x="50"
//             y="50"
//             textAnchor="middle"
//             dominantBaseline="middle"
//             fontSize="20"
//             fontWeight="bold"
//             fill="#0f172a"
//             className="dark:fill-white"
//           >
//             {formatTime(timeLeft)}
//           </text>
          
//           {/* Status text */}
//           <text
//             x="50"
//             y="65"
//             textAnchor="middle"
//             dominantBaseline="middle"
//             fontSize="10"
//             fill="#64748b"
//             className="dark:fill-gray-400"
//           >
//             {!isActive ? 'Ready' : isPaused ? 'Paused' : 'Active'}
//           </text>
//         </svg>
        
//         {/* Controls */}
//         <div className="flex justify-center items-center mt-4 space-x-4">
//           <motion.button
//             whileTap={{ scale: 0.95 }}
//             onClick={toggleTimer}
//             className={`${
//               isActive && !isPaused
//                 ? 'bg-error-500 hover:bg-error-600'
//                 : 'bg-success-500 hover:bg-success-600'
//             } text-white p-3 rounded-full shadow-md focus:outline-none`}
//           >
//             {isActive && !isPaused ? <FiPause /> : <FiPlay />}
//           </motion.button>
//           <motion.button
//             whileTap={{ scale: 0.95 }}
//             onClick={resetTimer}
//             className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 p-3 rounded-full shadow-md focus:outline-none"
//           >
//             <FiRefreshCw />
//           </motion.button>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default WorkoutTimer