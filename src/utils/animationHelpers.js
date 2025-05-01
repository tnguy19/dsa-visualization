export const animationHelpers = {
    //set params for smooth animations
    easeInOut: (t) => {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },
    
    //animation for value changes
    animateValue: (start, end, duration, callback) => {
      const startTime = performance.now();
      
      const animate = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easedProgress = animationHelpers.easeInOut(progress);
        
        const currentValue = start + (end - start) * easedProgress;
        callback(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    },
    
    //animation for positionn changes
    animatePosition: (startX, startY, endX, endY, duration, callback) => {
      const startTime = performance.now();
      
      const animate = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easedProgress = animationHelpers.easeInOut(progress);
        
        const currentX = startX + (endX - startX) * easedProgress;
        const currentY = startY + (endY - startY) * easedProgress;
        
        callback(currentX, currentY);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  };