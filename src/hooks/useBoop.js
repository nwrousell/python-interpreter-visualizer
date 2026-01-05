import { useState, useEffect } from 'preact/hooks';

// Hook for boop animation (from Josh Comeau)
export function useBoop({ scale = 1.2, timing = 150 }) {
  const [isBooped, setIsBooped] = useState(false);

  useEffect(() => {
    if (!isBooped) return;

    const timeoutId = setTimeout(() => {
      setIsBooped(false);
    }, timing);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isBooped, timing]);

  const trigger = () => {
    setIsBooped(true);
  };

  const style = {
    transform: isBooped ? `scale(${scale})` : 'scale(1)',
    transition: `transform ${timing}ms`,
  };

  return { style, trigger };
}
