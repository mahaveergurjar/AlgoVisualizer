import { useCallback } from 'react';

/**
 * Generic hook to handle mode switching without forcing a reset of user input.
 *
 * @param {Object} params
 * @param {string} params.mode - Current mode value.
 * @param {(m:string)=>void} params.setMode - Setter for mode.
 * @param {boolean} params.isLoaded - Whether input is loaded.
 * @param {() => any | null} params.parseInput - Returns normalized parsed input or null/throws if invalid.
 * @param {Record<string, Function>} params.generators - Map of mode -> history generation function.
 * @param {(step:number)=>void} params.setCurrentStep - Setter for current step index.
 * @param {(msg:string)=>void} [params.onError] - Optional error reporter (alert, toast, etc.).
 *
 * Usage pattern inside a component:
 * const handleModeChange = useModeHistorySwitch({
 *   mode, setMode, isLoaded,
 *   parseInput: () => ({ nums: parsedNums, k }),
 *   generators: { 'brute-force': (input)=>..., optimal: (input)=>... },
 *   setCurrentStep
 * });
 * ... onClick={() => handleModeChange('optimal')}
 */
export function useModeHistorySwitch({
  mode,
  setMode,
  isLoaded,
  parseInput,
  generators,
  setCurrentStep,
  onError,
}) {
  return useCallback(
    (nextMode) => {
      if (!nextMode || nextMode === mode) return;
      setMode(nextMode);
      if (!isLoaded) return; // Nothing to regenerate yet
      let parsed;
      try {
        parsed = parseInput();
      } catch (e) {
        if (onError) onError(e.message || 'Invalid input');
        return;
      }
      if (parsed == null) return;
      const gen = generators[nextMode];
      if (typeof gen !== 'function') {
        if (onError) onError(`No generator for mode: ${nextMode}`);
        return;
      }
      gen(parsed);
      setCurrentStep(0);
    },
    [mode, setMode, isLoaded, parseInput, generators, setCurrentStep, onError]
  );
}

export default useModeHistorySwitch;
