import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react"; // Using a modern icon for attractiveness

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {visible && (
        <button
          onClick={scrollToTop}
          className="
            fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50
            p-4 sm:p-5 bg-gradient-to-r from-blue-500 to-purple-500
            rounded-full shadow-2xl text-white flex items-center justify-center
            hover:scale-110 hover:shadow-xl hover:shadow-purple-500/50
            transition-all duration-300
            ring-2 ring-blue-300/50
          "
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-6 w-6 sm:h-7 sm:w-7 animate-bounce-subtle" />
        </button>
      )}

      {/* subtle bounce animation */}
      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default ScrollToTop;
