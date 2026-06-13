import { useState, useEffect, useCallback, useRef } from "react";

const MAX_SPEED = 1500;

/**
 * Reusable hook for managing algorithm visualization states.
 * 
 * @param {Object} options
 * @param {number} [options.defaultSpeed=1200] - Default playback speed
 * @returns {Object} Visualizer state and handlers
 */
export function useVisualizer({ defaultSpeed = 1200 } = {}) {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(defaultSpeed);
  const [isLoaded, setIsLoaded] = useState(false);
  const playRef = useRef(null);

  const stepForward = useCallback(() => {
    setCurrentStep((curr) => {
      if (curr < history.length - 1) return curr + 1;
      setIsPlaying(false);
      return curr;
    });
  }, [history.length]);

  const stepBackward = useCallback(() => {
    setCurrentStep((curr) => (curr > 0 ? curr - 1 : curr));
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((playing) => !playing);
  }, []);

  const reset = useCallback(() => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
    setIsPlaying(false);
    if (playRef.current) clearInterval(playRef.current);
  }, []);

  const load = useCallback((newHistory) => {
    if (!newHistory || newHistory.length === 0) return;
    setHistory(newHistory);
    setCurrentStep(0);
    setIsLoaded(true);
    setIsPlaying(false);
  }, []);

  // Autoplay effect
  useEffect(() => {
    if (isPlaying) {
      if (currentStep >= history.length - 1) {
        setIsPlaying(false);
        return;
      }
      playRef.current = setInterval(() => {
        setCurrentStep((curr) => {
          if (curr >= history.length - 1) {
            clearInterval(playRef.current);
            setIsPlaying(false);
            return curr;
          }
          return curr + 1;
        });
      }, MAX_SPEED - speed);
    } else {
      if (playRef.current) clearInterval(playRef.current);
    }

    return () => {
      if (playRef.current) clearInterval(playRef.current);
    };
  }, [isPlaying, speed, history.length, currentStep]);

  // Keyboard shortcut listeners (Space = play/pause, ArrowRight = next, ArrowLeft = back)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLoaded) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === "ArrowRight") {
        stepForward();
      } else if (e.key === "ArrowLeft") {
        stepBackward();
      } else if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoaded, stepForward, stepBackward, togglePlay]);

  return {
    history,
    currentStep,
    currentState: history[currentStep] || {},
    isPlaying,
    speed,
    isLoaded,
    stepForward,
    stepBackward,
    togglePlay,
    reset,
    load,
    setSpeed,
    setCurrentStep
  };
}
