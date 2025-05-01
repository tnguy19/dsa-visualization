import React, { useRef, useEffect, useState } from 'react';

const Visualizer = ({ renderFunction, data, width = 1000, height = 600 }) => {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(5, scale * delta));
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const newOffset = {
      x: mouseX - (mouseX - offset.x) * (newScale / scale),
      y: mouseY - (mouseY - offset.y) * (newScale / scale)
    };
    
    setScale(newScale);
    setOffset(newOffset);
  };
  
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y
    });
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const newOffset = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };
    
    setOffset(newOffset);
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [scale, offset, isDragging, dragStart]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    context.clearRect(0, 0, width, height);
    
    context.save();
    context.translate(offset.x, offset.y);
    context.scale(scale, scale);
    
    if (renderFunction && data) {
      renderFunction(context, data, { width, height, scale, offset });
    }
    
    context.restore();
    
    context.fillStyle = 'rgba(0, 0, 0, 0.6)';
    context.fillRect(10, 10, 90, 30);
    context.fillStyle = 'white';
    context.font = '12px Arial';
    context.fillText(`Zoom: ${Math.round(scale * 100)}%`, 15, 30);
    
  }, [renderFunction, data, width, height, scale, offset]);
  
  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };
  
  return (
    <div className="visualizer">
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height}
        className="visualization-canvas"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      />
      <div className="controls" style={{ marginTop: '10px' }}>
        <button onClick={resetView}>Reset View</button>
        <span style={{ marginLeft: '10px' }}>
          {scale < 1 ? 'Scroll up to zoom in' : 'Scroll down to zoom out'}, drag to pan
        </span>
      </div>
    </div>
  );
};

export default Visualizer;