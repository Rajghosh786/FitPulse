import React from "react";
import { motion } from "framer-motion";

const plateVariant = (direction = 1) => ({
  initial: { x: direction * 150, opacity: 0, scale: 0.9 },
  animate: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.2,
      ease: "easeOut",
      delay: direction === 1 ? 0.4 : 0.6,
    },
  },
});

const Loading = () => {

  const Dot = ({ delay = 0 }) => (
    <motion.div
      className="w-3 h-3 bg-cyan-400 rounded-full absolute"
      initial={{ y: -20, opacity: 0.6 }}
      animate={{ y: [ -20, 20, -20 ], opacity: [0.6, 1, 0.6] }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-black overflow-hidden">
      
      {/* 🏋️ Background */}
      <motion.div
        className="absolute inset-0 object-fill m-15 rounded-4xl bg-center border border-sky-200 shadow-3xl brightness-40"
        style={{
          backgroundImage: "url('https://cdn.pixabay.com/photo/2019/11/23/20/42/man-4648086_1280.jpg')",
        }}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* 💬 Overlay */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: [0, -5, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        className="relative text-center text-white z-10"
      >
        <h1 className="text-3xl md:text-5xl font-bold mb-4 animate-pulse">
          Ready to <span className="text-sky-400">Crush Your Goals?</span>
        </h1>
        <p className="text-lg md:text-xl opacity-90">
          Your fitness journey starts <span className="text-pink-400 font-semibold">NOW</span>. Let’s go 💥
        </p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
          className="mt-4 text-sm md:text-lg text-gray-300 italic"
        >
          ⏳ Prepping your custom workout... Grab water and breathe. 😤
        </motion.p>
      </motion.div>

      {/* 🌀 Loader */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative mt-6 z-10"
      >
        {/* DNA Loader */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute" style={{ left: `${i * 12}px` }}>
              <Dot delay={i * 0.15} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* 🏋️ Realistic Barbell */}
      <div className="absolute bottom-20 flex items-center gap-4 z-10">
        {/* Left Plate */}
        <motion.div
          variants={plateVariant(-1)}
          initial="initial"
          animate="animate"
          className="w-10 h-20 rounded-full bg-black shadow-inner"
          style={{
            background: "radial-gradient(circle at 30% 30%, #444, #000)",
            boxShadow: "inset -4px -4px 10px rgba(255,255,255,0.1), 2px 2px 10px rgba(0,0,0,0.6)",
            transform: "rotateY(20deg)",
          }}
        />
        {/* Rod */}
        <div
          className="h-2 rounded-sm"
          style={{
            width: "200px",
            background: "linear-gradient(to right, #bbb, #999, #ccc)",
            boxShadow: "0 0 5px #aaa",
          }}
        />
        {/* Right Plate */}
        <motion.div
          variants={plateVariant(1)}
          initial="initial"
          animate="animate"
          className="w-10 h-20 rounded-full bg-black shadow-inner"
          style={{
            background: "radial-gradient(circle at 30% 30%, #444, #000)",
            boxShadow: "inset -4px -4px 10px rgba(255,255,255,0.1), 2px 2px 10px rgba(0,0,0,0.6)",
            transform: "rotateY(-20deg)",
          }}
        />
      </div>
    </div>
  );
};

export default Loading;


// import React, { useEffect, useRef } from "react";
// import { motion } from "framer-motion";
// import { DNA } from "react-loader-spinner";

// const plateVariant = (direction = 1) => ({
//     initial: { x: direction * 150, opacity: 0, scale: 0.9 },
//     animate: {
//         x: 0,
//         opacity: 1,
//         scale: 1,
//         transition: {
//             duration: 1.2,
//             ease: "easeOut",
//             delay: direction === 1 ? 0.4 : 0.6,
//         },
//     },
// });

// const Loading = () => {

//     return (
//         <div className="relative flex flex-col items-center justify-center h-screen bg-black overflow-hidden">

//             {/* 🏋️ Background */}
//             <motion.div
//                 className="absolute inset-0 object-fill m-15 rounded-4xl bg-center border border-sky-200 shadow-3xl brightness-40"
//                 style={{
//                     backgroundImage: "url('https://cdn.pixabay.com/photo/2019/11/23/20/42/man-4648086_1280.jpg')",
//                 }}
//                 initial={{ scale: 1.2, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 transition={{ duration: 1.2, ease: "easeOut" }}
//             />

//             {/* 💬 Overlay */}
//             <motion.div
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: [0, -5, 0] }}
//                 transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
//                 className="relative text-center text-white z-10"
//             >
//                 <h1 className="text-3xl md:text-5xl font-bold mb-4 animate-pulse">
//                     Ready to <span className="text-sky-400">Crush Your Goals?</span>
//                 </h1>
//                 <p className="text-lg md:text-xl opacity-90">
//                     Your fitness journey starts <span className="text-pink-400 font-semibold">NOW</span>. Let’s go 💥
//                 </p>
//                 <motion.p
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
//                     className="mt-4 text-sm md:text-lg text-gray-300 italic"
//                 >
//                     ⏳ Prepping your custom workout... Grab water and breathe. 😤
//                 </motion.p>
//             </motion.div>

//             {/* 🌀 Loader */}
//             <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.8, ease: "easeOut" }}
//                 className="relative mt-6 z-10"
//             >
//                 <DNA
//                     visible={true}
//                     height="170"
//                     width="170"
//                     ariaLabel="dna-loading"
//                     wrapperStyle={{}}
//                     wrapperClass="dna-wrapper"
//                 />
//             </motion.div>

//             {/* 🏋️ Realistic Barbell */}
//             <div className="absolute bottom-20 flex items-center gap-4 z-10">
//                 {/* Left Plate */}
//                 <motion.div
//                     variants={plateVariant(-1)}
//                     initial="initial"
//                     animate="animate"
//                     className="w-10 h-20 rounded-full bg-black shadow-inner"
//                     style={{
//                         background: "radial-gradient(circle at 30% 30%, #444, #000)",
//                         boxShadow: "inset -4px -4px 10px rgba(255,255,255,0.1), 2px 2px 10px rgba(0,0,0,0.6)",
//                         transform: "rotateY(20deg)",
//                     }}
//                 />
//                 {/* Rod */}
//                 <div
//                     className="h-2 rounded-sm"
//                     style={{
//                         width: "200px",
//                         background: "linear-gradient(to right, #bbb, #999, #ccc)",
//                         boxShadow: "0 0 5px #aaa",
//                     }}
//                 />
//                 {/* Right Plate */}
//                 <motion.div
//                     variants={plateVariant(1)}
//                     initial="initial"
//                     animate="animate"
//                     className="w-10 h-20 rounded-full bg-black shadow-inner"
//                     style={{
//                         background: "radial-gradient(circle at 30% 30%, #444, #000)",
//                         boxShadow: "inset -4px -4px 10px rgba(255,255,255,0.1), 2px 2px 10px rgba(0,0,0,0.6)",
//                         transform: "rotateY(-20deg)",
//                     }}
//                 />
//             </div>
//         </div>
//     );
// };

// export default Loading;
