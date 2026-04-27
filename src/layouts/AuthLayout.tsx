import { Outlet } from "react-router-dom";
import { logo, a1, a2, a3 } from "../assets";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const carouselItems = [
  {
    image: a1,
    title: "Manage Organizations Efficiently",
    description: "Seamlessly handle multiple client companies like CapitalCorp in one unified dashboard."
  },
  {
    image: a2,
    title: "Streamline Employee Data",
    description: "Keep all your employee records organized, secure, and easily accessible."
  },
  {
    image: a3,
    title: "Optimize Performance Tracking",
    description: "Empower your team with insightful performance metrics and goal management."
  }
];

const AuthLayout = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Sidebar */}
      <div className="hidden lg:flex lg:w-1/2 p-4">
        <div className="relative w-full h-full bg-gray-100 rounded-[2rem] overflow-hidden flex flex-col items-center">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={carouselItems[currentIndex].image}
                alt={`Slide ${currentIndex + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            </motion.div>
          </AnimatePresence>

          {/* Text Content */}
          <div className="absolute bottom-20 left-0 right-0 px-12 text-center z-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${currentIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3 className="text-3xl font-bold text-white mb-3 tracking-wide drop-shadow-md">
                  {carouselItems[currentIndex].title}
                </h3>
                <p className="text-gray-200 text-base max-w-md mx-auto leading-relaxed drop-shadow">
                  {carouselItems[currentIndex].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Carousel Indicators */}
          <div className="absolute bottom-8 flex items-center justify-center gap-3 z-20">
            {carouselItems.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-500 rounded-full ${
                  idx === currentIndex 
                    ? "w-8 h-2 bg-white" 
                    : "w-2 h-2 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 flex flex-col pt-12 px-8 lg:px-24">
        <div className="flex justify-end mb-16">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Hrm360" className="w-28 h-10 object-contain" />
          </div>
        </div>
        
        <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
