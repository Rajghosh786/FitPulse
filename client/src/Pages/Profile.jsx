import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEdit2, FiActivity, FiUser, FiMapPin, FiMail, FiCalendar, FiAward, FiTrendingUp } from 'react-icons/fi';
import AOS from "aos";
import "aos/dist/aos.css";

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init();
    const token = localStorage.getItem('token');
    const storedUserData = localStorage.getItem('userData');

    if (!token || !storedUserData) {
      setLoading(false);
      return;
    }

    setUserData(JSON.parse(storedUserData));
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            No Login Found, Please Login
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            To access your profile and tracking features, please log in to your account.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-lg font-medium text-lg"
          >
            Login Now
          </button>
        </motion.div>
      </div>
    );
  }

  // Format date function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen p-4 lg:p-8 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Profile Header */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden text-white"
          data-aos="fade-down"
        >
          {/* Background Video */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
          >
            <source src="https://videos.pexels.com/video-files/4804789/4804789-uhd_2560_1440_25fps.mp4" type="video/mp4" />
          </video>
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black opacity-60 z-10"></div>

          {/* Content */}
          <div className="relative z-20 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-4xl font-bold border-4 border-sky-500">
              {userData.profileImage ? (
                <img src={userData.profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                `${userData.firstName[0]}${userData.lastName[0]}`
              )}
            </div>
            
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {userData.firstName} {userData.lastName}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-2">
                  <FiMapPin /> {userData.city}, {userData.state}
                </span>
                <span className="flex items-center gap-2">
                  <FiMail /> {userData.email}
                </span>
                <span className="flex items-center gap-2">
                  <FiCalendar /> Joined {formatDate(userData.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-aos="fade-up">
          <StatsCard
            icon={<FiActivity className="w-6 h-6" />}
            title="Workouts Completed"
            value="24"
            color="sky"
          />
          <StatsCard
            icon={<FiTrendingUp className="w-6 h-6" />}
            title="Current Streak"
            value="7 days"
            color="green"
          />
          <StatsCard
            icon={<FiAward className="w-6 h-6" />}
            title="Achievements"
            value="12"
            color="yellow"
          />
          <StatsCard
            icon={<FiUser className="w-6 h-6" />}
            title="BMI"
            value="22.5"
            color="purple"
          />
        </div>

        {/* Detailed Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg"
            data-aos="fade-right"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center justify-between">
              Personal Information
              <button className="text-sky-500 hover:text-sky-600">
                <FiEdit2 className="w-5 h-5" />
              </button>
            </h2>
            <div className="space-y-4">
              <InfoRow label="Date of Birth" value={formatDate(userData.dateOfBirth)} />
              <InfoRow label="Email" value={userData.email} />
              <InfoRow label="Location" value={`${userData.city}, ${userData.state}`} />
              <InfoRow label="Member Since" value={formatDate(userData.createdAt)} />
            </div>
          </motion.section>

          {/* Workout Preferences */}
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg"
            data-aos="fade-left"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Workout Preferences
            </h2>
            {userData.workoutPreferences && userData.workoutPreferences.length > 0 ? (
              <div className="space-y-4">
                {userData.workoutPreferences.map((pref, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <FiActivity className="text-sky-500" />
                    {pref}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No workout preferences set yet. Add your preferences to get personalized recommendations.
              </p>
            )}
          </motion.section>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatsCard = ({ icon, title, value, color }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg" data-aos="zoom-in">
    <div className={`p-3 bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400 rounded-lg w-fit mb-4`}>
      {icon}
    </div>
    <h3 className="text-gray-500 dark:text-gray-400 text-sm mb-1">{title}</h3>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
    <span className="text-gray-600 dark:text-gray-400">{label}</span>
    <span className="text-gray-900 dark:text-white font-medium">{value}</span>
  </div>
);

export default Profile;