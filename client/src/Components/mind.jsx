import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function MindMirror() {
  const [stage, setStage] = useState("start");
  const [emotion, setEmotion] = useState("");
  const [count, setCount] = useState(5);
  const [breathing, setBreathing] = useState(false);

  useEffect(() => {
          AOS.init();
      }, []);

  useEffect(() => {
    if (stage === "breathe" && count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else if (stage === "breathe" && count === 0) {
      setStage("affirm");
    }
  }, [stage, count]);

  const handleStart = () => {
    setStage("ask");
  };

  const handleEmotion = (e) => {
    setEmotion(e);
    setStage("breathe");
    setBreathing(true);
  };

  const affirmations = {
    tired: "Rest is power. You're building even when you're still.",
    anxious: "Breathe in strength. Breathe out doubt.",
    focused: "Stay locked in. You're shaping destiny with every move.",
    lost: "The fog clears when you move. Keep walking.",
    hyped: "Channel that fire. This is your moment.",
  };

  return (
    <section className="bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white rounded-3xl px-8 py-14 mt-16 ">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        
        {/* Left: Image */}
        <div className="w-full h-full lg:w-1/2 flex justify-center " data-aos="zoom-in-right">
          <img
            src="https://static.vecteezy.com/system/resources/previews/044/777/275/large_2x/bodybuilder-man-standing-for-workout-training-isolated-on-transparent-background-free-png.png"
            alt="Bodybuilder"
            className="rounded-2xl  w-full max-w-md object-cover items-center h-full"
          />
        </div>

        {/* Right: The Mind Mirror */}
        <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left" data-aos="fade-up-left">
          {stage === "start" && (
            <div>
            <h2 className="text-5xl font-bold text-white mb-8">
              The Mind <span className="text-sky-300">Mirror</span> 🪞
            </h2>
            <p className="text-lg text-gray-200 mb-6 ">
              <span className="font-semibold text-orange-200">Pause for 60 seconds</span> in the chaos of the world around you. 
              <span className="italic text-green-100">Step into your inner sanctum,</span> where your thoughts align and your spirit finds stillness.
              <span className="text-green-200"> It's time to reflect, recalibrate, and restore.</span> 🌀
              <br />
              With every breath, feel the tension dissolve, the distractions fade, and your mind <span className="font-semibold text-orange-200">reset.</span>
              <br />
              <span className="text-purple-100 font-semibold">Are you ready to meet yourself again?</span>
            </p>
            <button
              onClick={handleStart}
              className="bg-sky-800 hover:bg-sky-600  px-6 py-3 rounded-xl font-semibold text-gray-200 cursor-pointer"
            >
              Begin Reflection 🌀
            </button>
          </div>
          
          
          )}

          {stage === "ask" && (
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">How do you feel right now?</h3>
              <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
                {["tired", "anxious", "focused", "lost", "hyped"].map((mood) => (
                  <button
                    key={mood}
                    onClick={() => handleEmotion(mood)}
                    className="bg-gray-700 hover:bg-sky-600 rounded-lg py-2 px-4 capitalize"
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>
          )}

          {stage === "breathe" && (
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold">Breathe with me...</h3>
              <p className="text-6xl text-sky-400 font-bold animate-pulse">{count}</p>
              <p className="italic text-gray-400">Inhale clarity. Exhale chaos.</p>
            </div>
          )}

          {stage === "affirm" && (
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-emerald-400">Affirmation Unlocked ✨</h3>
              <p className="text-xl italic text-gray-300 max-w-md">{affirmations[emotion]}</p>
              <p className="mt-4 text-sm text-gray-500">Power stance for 10s... right now. Feel it. 💪</p>
              <button
                onClick={() => {
                  setStage("start");
                  setEmotion("");
                  setCount(5);
                }}
                className="mt-6 bg-sky-600 hover:bg-sky-700 px-6 py-3 rounded-xl font-semibold text-white cursor-pointer"
              >
                Reflect Again 🔁
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
