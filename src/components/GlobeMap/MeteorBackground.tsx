//components/DrawMap/MeteorBackground.tsx
import React, {  useCallback, useEffect, useRef } from 'react';

const MeteorBackground = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const createMeteor = useCallback(() => {
    if (!wrapperRef.current) return;

    const meteor = document.createElement('div');
    
    // Randomize meteor characteristics
    const startX = Math.random() * 100;
    const startY = Math.random() * -50; // Start above viewport
    const duration = 1000 + Math.random() * 3000;
    const size = Math.random() * 2 + 0.5; // Random size between 0.5 and 2.5
    const trailLength = 50 + Math.random() * 100; // Random trail length
    const angle = Math.random() * 30 + 75; // Angle between 75-105 degrees for more vertical feel
    const opacity = 0.3 + Math.random() * 0.7; // Random opacity
    
    meteor.className = `
      absolute
      rounded-full
      animate-meteor
      before:content-['']
      before:absolute
      before:top-1/2
      before:transform
      before:-translate-y-1/2
      before:bg-gradient-to-t
      before:from-transparent
      before:via-white/30
      before:to-white/0
    `;
    
    // Apply random styles
    meteor.style.cssText = `
      top: ${startY}%;
      left: ${startX}%;
      width: ${size}px;
      height: ${size}px;
      background: rgba(255, 255, 255, ${opacity});
      box-shadow: 0 0 ${size * 2}px rgba(255, 255, 255, ${opacity * 0.5});
      animation-duration: ${duration}ms;
      transform: rotate(${angle}deg);
    `;

    // Apply trail styles
    const before = document.createElement('style');
    before.textContent = `
      #meteor-${startX}-${startY}::before {
        width: ${trailLength}px;
        height: ${size * 2}px;
        opacity: ${opacity};
      }
    `;
    meteor.id = `meteor-${startX}-${startY}`;
    document.head.appendChild(before);
    
    wrapperRef.current.appendChild(meteor);
    
    // Cleanup
    setTimeout(() => {
      if (wrapperRef.current?.contains(meteor)) {
        wrapperRef.current.removeChild(meteor);
        document.head.removeChild(before);
      }
    }, duration)

  }, []);

  const createMeteorShower = useCallback(() => {
    const meteorCount = Math.floor(Math.random() * 10) + 5;
    
    for (let i = 0; i < meteorCount; i++) {
      setTimeout(createMeteor, i * 500);
    }
  }, [createMeteor]);

  useEffect(() => {
    // Regular single meteors
    const meteorInterval = setInterval(createMeteor, 400);
    
    // Occasional meteor showers
    const showerInterval = setInterval(createMeteorShower, 5000);
    
    return () => {
      clearInterval(meteorInterval);
      clearInterval(showerInterval);
    };
  }, [createMeteor, createMeteorShower]);

  return (
    <div 
      ref={wrapperRef} 
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

export default MeteorBackground;