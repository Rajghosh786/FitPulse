import { useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuth from "../Context/AuthContext";
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
  
    const loginData = { email, password };
  
    axios.post("http://localhost:8000/user/login", loginData)
      .then((res) => {
        const {refreshToken, findUser } = res.data;
        login(refreshToken);
        localStorage.setItem('userData', JSON.stringify(findUser));
        navigate("/dashboard");
      })
      .catch((err) => {
        const msg = err.response?.data?.msg || "Login failed";
        alert(msg);
      });
  };

  return (
    <div className="min-h-screen relative">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source
          src="https://videos.pexels.com/video-files/5319759/5319759-uhd_2560_1440_25fps.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      <div className="absolute inset-0 bg-black opacity-50 z-10"></div>

      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 text-center text-white">
          Welcome Back
        </h1>
        <p className="text-lg opacity-90 text-center max-w-md text-white mb-8">
          Continue your fitness journey with personalized workouts and expert
          guidance
        </p>

        <div className="max-w-md w-full">
          <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-gray-700/50">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Sign in to your account
            </h2>

            <p className="text-gray-300 text-center mb-6">
              New to FitPulse AI?{" "}
              <span
                onClick={() => navigate("/signup")}
                className="text-sky-400 hover:text-sky-300 cursor-pointer transition-colors"
              >
                Create account
              </span>
            </p>

            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-xl font-medium flex items-center justify-center transition-colors"
              >
                Sign In
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-2 h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-grow h-px bg-gray-600"></div>
              <span className="px-4 text-sm text-gray-400">
                or continue with
              </span>
              <div className="flex-grow h-px bg-gray-600"></div>
            </div>

            <div className="space-y-3">
              <button className="w-full border border-gray-600 text-white py-3 rounded-xl flex items-center justify-center hover:bg-gray-700/50 transition-colors">
                <span className="mr-2">G</span>
                Google
              </button>

              <button className="w-full border border-gray-600 text-white py-3 rounded-xl flex items-center justify-center hover:bg-gray-700/50 transition-colors">
                <span className="mr-2">f</span>
                Facebook
              </button>

              <button className="w-full border border-gray-600 text-white py-3 rounded-xl flex items-center justify-center hover:bg-gray-700/50 transition-colors">
                <span className="mr-2">
                  <svg
                    className="w-5 h-5 inline"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                  >
                    <path
                      fill="currentColor"
                      d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
                    />
                  </svg>
                </span>
                Apple
              </button>
            </div>

            <div className="flex items-center justify-center mt-6 text-gray-300">
              <input type="checkbox" id="stay-signed-in" className="mr-2" />
              <label htmlFor="stay-signed-in">Stay signed in</label>
            </div>
          </div>
        </div>

        {/* <footer className="absolute bottom-0 w-full border-t border-gray-800 py-6 text-center px-4">
          <p className="text-gray-500 text-xs">
            Copyright © 2025 FitPulse AI. All Rights Reserved.{" "}
            <a href="#" className="text-sky-600 hover:text-sky-400 transition-colors">Privacy</a> •{" "}
            <a href="#" className="text-sky-600 hover:text-sky-400 transition-colors">Terms</a> •{" "}
            <a href="#" className="text-sky-600 hover:text-sky-400 transition-colors">Cookies</a>
          </p>
        </footer> */}
      </div>
    </div>
  );
};

export default Login;
