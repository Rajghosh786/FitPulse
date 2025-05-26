import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
// import { useWorkout } from '../Context/workoutContext'
import { motion } from 'framer-motion'
import { FiArrowRight, FiActivity, FiStar, FiCalendar, FiClock, FiAward, FiPieChart } from 'react-icons/fi'
// import WorkoutCard from '../Components/workoutCard';
import MindMirror from '../Components/mind'
import Carousel from '../Components/carousel';
import AOS from "aos";
import "aos/dist/aos.css";

const Home = () => {
    const navigate = useNavigate()
    

    useEffect(() => {
        AOS.init();
    }, []);

    // Get featured workouts (first 3)
   

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    }

    return (
        <div className="space-y-12 p-2 lg:p-10 dark:bg-gray-900" data-aos="flip-left" data-aos-easing="ease-out-cubic"
            data-aos-duration="2000">
            {/* Hero section */}
            <section className="relative rounded-3xl overflow-hidden text-white py-10 px-6 md:px-12 shadow-2xl lg:px-16" data-aos="zoom-in-down">
                {/* Background Video */}
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover z-0"
                >
                    <source src="https://videos.pexels.com/video-files/5319759/5319759-uhd_2560_1440_25fps.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                {/* Overlay to darken the video a bit for contrast */}
                <div className="absolute inset-0  opacity-70 z-10"></div>

                {/* Content */}
                <div className="relative z-20 max-w-4xl">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl md:text-5xl font-bold mb-4"
                    >
                        Transform Your Fitness Journey with AI
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-lg md:text-xl opacity-90 mb-8"
                    >
                        Personalized workouts, expert guidance, and progress tracking - all designed to help you reach your fitness goals faster.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col sm:flex-row gap-4"
                    >
                        <button
                            onClick={() => navigate('/workouts')}
                            className="bg-white text-sky-700 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium flex items-center justify-center"
                        >
                            Start Workout
                            <FiArrowRight className="ml-2" />
                        </button>
                        <button
                            onClick={() => navigate('/signup')}
                            className="bg-sky-700 hover:bg-sky-800 border border-sky-500 text-white px-6 py-3 rounded-lg font-medium"
                        >
                            Sign Up Free
                        </button>
                    </motion.div>
                </div>
            </section>

            <section
                className="w-full bg-black overflow-hidden rounded-3xl text-white px-4 md:px-12 py-10 md:py-0 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-30"
                style={{ height: 'auto', minHeight: '290px' }} // Let it grow naturally on mobile
            >
                {/* Left Motivational Text */}
                <div className="w-full md:w-1/2 flex flex-col justify-center items-start gap-4">
                    <h1 className="text-2xl md:text-4xl font-extrabold leading-tight">
                        Unleash Your <span className="text-sky-400">Inner</span> Beast
                    </h1>
                    <p className="text-sm md:text-lg text-gray-300 leading-snug max-w-xl drop-shadow-md">
                        You're not here to be average. You're here to be legendary.
                        Every drop of sweat is fuel. Every rep, every run, every decision — it's all building the best version of you.
                    </p>
                    <button onClick={() => navigate('/signup')} className="mt-2 px-4 py-2 bg-[#00f2ff]/20 text-white border border-[#00f2ff] rounded-xl backdrop-blur hover:bg-[#00f2ff]/40 transition-all duration-300 text-sm">
                        Join the Revolution
                    </button>
                </div>

                {/* Right HeroSlider */}
                <div className="w-full md:w-1/2 mt-10 md:mt-0 md:ml-20 h-64 md:h-full">
                    <div className="h-full relative">
                        <Carousel
                            baseWidth={550}
                            autoplay={true}
                            autoplayDelay={2000}
                            pauseOnHover={true}
                            loop={true}
                            round={false}
                        />
                    </div>
                </div>
            </section>



            {/* Featured workouts section
            <section>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Workouts</h2>
                    <button
                        onClick={() => navigate('/workouts')}
                        className="text-sky-600 dark:text-sky-400 flex items-center text-sm font-medium"
                    >
                        See All
                        <FiArrowRight className="ml-1" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-aos="zoom-in-down">
                    {featuredWorkouts.map((workout, index) => (
                        <WorkoutCard key={workout.id} workout={workout} />
                    ))}
                </div>
            </section> */}

            <MindMirror/>

            


            {/* Features section */}
            <section className="bg-gray-50 dark:bg-gray-800/50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-12 rounded-xl" data-aos="zoom-out-right">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose FitPulse AI?</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        We combine cutting-edge AI technology with fitness expertise to deliver the most personalized workout experience.
                    </p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm" data-aos="zoom-out-right">
                        <div className="p-3 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-primary-400 rounded-lg w-fit mb-4">
                            <FiActivity className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Personalized Workouts</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            AI-generated workout plans based on your fitness level, goals, and available equipment.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm" data-aos="zoom-out-right">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg w-fit mb-4">
                            <FiPieChart className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Progress Tracking</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Visualize your fitness journey with detailed progress metrics and achievement tracking.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm" data-aos="zoom-out-right">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-warning-400 rounded-lg w-fit mb-4">
                            <FiCalendar className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Custom Diet Plans</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Nutrition plans tailored to your body type, fitness goals, and dietary preferences.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm" data-aos="zoom-out-right">
                        <div className="p-3 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg w-fit mb-4">
                            <FiClock className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Timed Workouts</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Interactive timers and guided sessions to optimize your workout efficiency.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm" data-aos="zoom-out-right">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg w-fit mb-4">
                            <FiAward className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Expert Guidance</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Detailed exercise instructions and form guidance to maximize results and prevent injury.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm" data-aos="zoom-out-right">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg w-fit mb-4">
                            <FiStar className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Motivation Boosters</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Streak tracking, achievements, and personalized encouragement to keep you motivated.
                        </p>
                    </motion.div>
                </motion.div>
            </section>

            <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white rounded-3xl px-8 py-14 shadow-inner mt-12" data-aos="fade-up" data-aos-duration="1500">
                <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-10">
                    {/* Left: Inspo + Vibes */}
                    <div className="w-full lg:w-1/2 space-y-6">
                        <h2 className="text-4xl font-bold leading-tight">
                            The <span className="text-sky-400">Mind Gym</span> 🧠
                        </h2>
                        <p className="text-lg text-gray-300">
                            Fitness ain't just what your mirror reflects. It's discipline in chaos, clarity in the noise. Welcome to your mental gains arena.
                        </p>
                        <ul className="space-y-2 text-gray-400">
                            <li className="flex items-center"><FiClock className="mr-2 text-sky-400" /> Guided meditation for pre-workout focus</li>
                            <li className="flex items-center"><FiStar className="mr-2 text-sky-400" /> Daily affirmations to crush doubt</li>
                            <li className="flex items-center"><FiAward className="mr-2 text-sky-400" /> Weekly mental toughness challenges</li>
                        </ul>
                        <button className="mt-6 px-6 py-3 bg-sky-600 hover:bg-sky-700 rounded-lg text-white font-semibold shadow-lg">
                            Enter The Mind Gym
                        </button>
                    </div>

                    {/* Right: Looping Calming Video */}
                    <div className="w-full lg:w-1/2 rounded-xl overflow-hidden shadow-lg">
                        <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-80 object-cover rounded-4xl"
                        >
                            <source src="https://videos.pexels.com/video-files/5319763/5319763-uhd_2560_1440_25fps.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
            </section>


            {/* CTA section */}
            <section className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4" data-aos="fade-down-left">Ready to Start Your Fitness Journey?</h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto" data-aos="fade-down-right">
                    Join thousands of users who have transformed their lives with FitPulse AI's personalized fitness guidance.
                </p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <button
                        onClick={() => navigate('/workouts')}
                        className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-lg font-medium text-lg"
                    >
                        Browse Workouts
                    </button>
                    <button
                        onClick={() => navigate('/signup')}
                        className="bg-white hover:bg-gray-100 text-sky-300 border border-sky-300 px-8 py-3 rounded-lg font-medium text-lg dark:bg-gray-800 dark:border-gray-700 dark:text-primary-400 dark:hover:bg-gray-700"
                    >
                        Create Account
                    </button>
                </motion.div>
            </section>
        </div>
    )
}

export default Home