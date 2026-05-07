import { Outlet } from "react-router-dom";
import { logo, a1, a2, a3 } from "../assets";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const carouselItems = [
  {
    image: a1,
    title: "Manage Organizations Efficiently",
    description: "Seamlessly handle multiple client companies in one unified dashboard."
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
    <div className="flex min-h-screen bg-gradient-to-br from-[#F8F9FF] via-white to-[#E9EDFF] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/20 blur-[120px] rounded-full" />

      {/* Desktop Sidebar (Left) */}
      <div className="hidden lg:flex lg:w-1/2 p-6 z-10">
        <div className="relative w-full h-full bg-gray-100 rounded-[2.5rem] overflow-hidden flex flex-col items-center shadow-2xl shadow-indigo-500/10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={carouselItems[currentIndex].image}
                alt={`Slide ${currentIndex + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/90 via-indigo-900/20 to-transparent"></div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Text (Desktop) */}
          <div className="absolute bottom-24 left-0 right-0 px-16 text-center z-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${currentIndex}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h3 className="text-4xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                  {carouselItems[currentIndex].title}
                </h3>
                <p className="text-indigo-100/90 text-lg max-w-md mx-auto leading-relaxed font-medium">
                  {carouselItems[currentIndex].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="absolute bottom-10 flex items-center justify-center gap-3 z-20">
            {carouselItems.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-700 rounded-full ${
                  idx === currentIndex 
                    ? "w-10 h-2 bg-white" 
                    : "w-2 h-2 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-20">
        {/* Mobile Carousel Header (Visible only on mobile/tablet) */}
        <div className="lg:hidden h-[35vh] relative w-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={`mobile-bg-${currentIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <img
                src={carouselItems[currentIndex].image}
                alt="Mobile Slide"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#F8F9FF]"></div>
            </motion.div>
          </AnimatePresence>
          
          <div className="absolute top-10 left-0 right-0 px-6 flex justify-between items-center">
            <img src={logo} alt="Hrm360" className="w-24 h-8 object-contain brightness-0 invert" />
          </div>

          <div className="absolute bottom-8 left-0 right-0 px-6 text-center">
             <AnimatePresence mode="wait">
              <motion.div
                key={`mobile-text-${currentIndex}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-xl font-bold text-white drop-shadow-lg">
                  {carouselItems[currentIndex].title}
                </h3>
              </motion.div>
            </AnimatePresence>
            
            {/* Mobile Indicators */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {carouselItems.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    idx === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 py-10 lg:px-20 overflow-y-auto">
          {/* Logo (Desktop only, already handled for mobile) */}
          <div className="hidden lg:flex absolute top-12 right-12">
            <img src={logo} alt="Hrm360" className="w-32 h-10 object-contain" />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl bg-white/70 backdrop-blur-xl border border-white/50 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-500/5 lg:bg-transparent lg:backdrop-blur-none lg:border-none lg:shadow-none lg:p-0"
          >
            <Outlet />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

