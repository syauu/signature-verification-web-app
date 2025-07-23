import React, { useRef, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';

const SignatureCanvas = ({ onSignatureChange, width = 500, height = 500 }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [lastPoint, setLastPoint] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width, height });
  const [strokePoints, setStrokePoints] = useState([]);
  const [allStrokes, setAllStrokes] = useState([]); // Store all completed strokes
  const [lastDrawTime, setLastDrawTime] = useState(0); // For throttling drawing events

  // Ultra high-quality canvas settings for crisp signatures
  const CANVAS_SCALE = 4; // 4x resolution for maximum quality
  const STROKE_WIDTH = 4; // Fixed pen size
  const DRAW_THROTTLE = 8; // Minimum milliseconds between draw events (helps with tablet performance)
  const displayWidth = canvasSize.width;
  const displayHeight = canvasSize.height;
  const actualWidth = canvasSize.width * CANVAS_SCALE;
  const actualHeight = canvasSize.height * CANVAS_SCALE;

  // Handle responsive sizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth - 60; // Account for padding and margins
        const maxWidth = Math.min(width, containerWidth);
        const aspectRatio = height / width;
        const responsiveHeight = Math.min(height, maxWidth * aspectRatio);
        
        setCanvasSize({ 
          width: maxWidth > 300 ? maxWidth : 300, // Minimum width of 300px
          height: responsiveHeight > 150 ? responsiveHeight : 150 // Minimum height of 150px
        });
      }
    };

    // Use timeout to ensure container is rendered
    const timeoutId = setTimeout(handleResize, 100);
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set ultra high DPI scaling for maximum quality
    canvas.width = actualWidth;
    canvas.height = actualHeight;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    
    // Scale the context to match the ultra-high resolution
    ctx.scale(CANVAS_SCALE, CANVAS_SCALE);
    
    // Premium quality rendering settings for natural signatures
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Set pristine white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Set premium ink color and properties
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#000000';
    ctx.lineWidth = STROKE_WIDTH;
    
    // Natural ink effect with subtle shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 0.8;
    ctx.shadowOffsetX = 0.1;
    ctx.shadowOffsetY = 0.1;
  }, [canvasSize.width, canvasSize.height]);

  // Redraw all strokes on canvas
  const redrawAllStrokes = (ctx) => {
    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Reset context properties
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#000000';
    ctx.lineWidth = STROKE_WIDTH;
    
    // Draw all completed strokes
    allStrokes.forEach(stroke => {
      if (stroke.length > 0) {
        drawSmoothCurve(ctx, stroke);
      }
    });
    
    // Draw current stroke if it exists
    if (strokePoints.length > 0) {
      drawSmoothCurve(ctx, strokePoints);
    }
  };

  // Advanced smooth drawing with Catmull-Rom splines for natural curves
  const drawSmoothCurve = (ctx, points) => {
    if (points.length < 2) return;
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    if (points.length === 2) {
      // Simple line for 2 points
      ctx.lineTo(points[1].x, points[1].y);
    } else if (points.length === 3) {
      // Quadratic curve for 3 points
      const cp = points[1];
      ctx.quadraticCurveTo(cp.x, cp.y, points[2].x, points[2].y);
    } else {
      // Catmull-Rom spline for 4+ points - creates very smooth, natural curves
      for (let i = 1; i < points.length - 2; i++) {
        const p0 = points[i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2];
        
        // Calculate control points for smooth Catmull-Rom curve
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      }
      
      // Connect to last point
      if (points.length > 3) {
        const lastTwo = points.slice(-2);
        ctx.lineTo(lastTwo[1].x, lastTwo[1].y);
      }
    }
    
    ctx.stroke();
  };

  // Variable pressure simulation based on speed and acceleration
  const calculatePressure = (currentPoint, lastPoint, velocity) => {
    if (!lastPoint) return STROKE_WIDTH;
    
    // Calculate speed-based pressure variation
    const distance = Math.sqrt(
      Math.pow(currentPoint.x - lastPoint.x, 2) + 
      Math.pow(currentPoint.y - lastPoint.y, 2)
    );
    const timeDelta = currentPoint.timestamp - lastPoint.timestamp;
    const speed = timeDelta > 0 ? distance / timeDelta : 0;
    
    // Natural pressure variation: slower = thicker, faster = thinner
    const pressureFactor = Math.max(0.7, Math.min(1.4, 1 / (speed * 0.02 + 0.5)));
    return STROKE_WIDTH * pressureFactor;
  };

  // Handle drawing start
  const handleDrawStart = (x, y) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    setIsDrawing(true);
    setHasSignature(true);
    
    const point = { x, y, timestamp: Date.now() };
    setLastPoint(point);
    setStrokePoints([point]);
    
    // Draw initial dot for natural pen contact
    ctx.beginPath();
    ctx.arc(x, y, STROKE_WIDTH / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  // Handle drawing movement with advanced smoothing and tablet optimization
  const handleDrawMove = (x, y) => {
    if (!isDrawing || !lastPoint) return;
    
    // Throttle drawing events for better tablet performance
    const currentTime = Date.now();
    if (currentTime - lastDrawTime < DRAW_THROTTLE) return;
    setLastDrawTime(currentTime);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Calculate distance to avoid micro-movements that cause stuttering
    const distance = Math.sqrt(
      Math.pow(x - lastPoint.x, 2) + Math.pow(y - lastPoint.y, 2)
    );
    
    // Skip very small movements that can cause stuttering on tablets
    if (distance < 1.5) return;
    
    const currentPoint = { x, y, timestamp: currentTime };
    
    // Add point to current stroke
    setStrokePoints(prevPoints => {
      const newPoints = [...prevPoints, currentPoint];
      
      // Only start drawing smooth curves after we have enough points
      if (newPoints.length >= 4) {
        // Redraw everything including all previous strokes
        redrawAllStrokes(ctx);
      } else {
        // For the first few points, draw simple lines without clearing previous strokes
        ctx.lineWidth = STROKE_WIDTH;
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      
      return newPoints;
    });
    
    setLastPoint(currentPoint);
  };

  // Handle drawing end
  const handleDrawEnd = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    setLastPoint(null);
    
    // Add current stroke to all strokes
    if (strokePoints.length > 0) {
      setAllStrokes(prevStrokes => [...prevStrokes, strokePoints]);
    }
    setStrokePoints([]);
    
    // Create a temporary canvas to resize to 224x224 for saving
    setTimeout(() => {
      const canvas = canvasRef.current;
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      // Set temp canvas to exactly 224x224
      tempCanvas.width = 224;
      tempCanvas.height = 224;
      
      // Fill with white background
      tempCtx.fillStyle = '#ffffff';
      tempCtx.fillRect(0, 0, 224, 224);
      
      // Draw the main canvas scaled down to 224x224
      tempCtx.drawImage(
        canvas, 
        0, 0, actualWidth, actualHeight,
        0, 0, 224, 224
      );
      
      // Convert to blob and create file
      tempCanvas.toBlob((blob) => {
        const file = new File([blob], 'signature.png', { type: 'image/png' });
        onSignatureChange(file);
      }, 'image/png', 1.0);
    }, 100); // Small delay to ensure rendering is complete
  };

  // Pointer events - optimized for drawing tablets and stylus
  const handlePointerDown = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setLastDrawTime(Date.now());
    handleDrawStart(x, y);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    // Optimize for high-frequency tablet events
    if (e.pointerType === 'pen' || e.pointerType === 'touch') {
      // Use requestAnimationFrame for smoother tablet drawing
      requestAnimationFrame(() => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        handleDrawMove(x, y);
      });
    } else {
      // Regular handling for mouse
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      handleDrawMove(x, y);
    }
  };

  const handlePointerUp = (e) => {
    e.preventDefault();
    handleDrawEnd();
  };

  // Mouse events - fallback for regular mouse
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleDrawStart(x, y);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleDrawMove(x, y);
  };

  const handleMouseUp = () => {
    handleDrawEnd();
  };

  // Touch events - optimized for tablet touch
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    setLastDrawTime(Date.now());
    handleDrawStart(x, y);
  };

  const handleTouchMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    // Use requestAnimationFrame for smoother touch drawing on tablets
    requestAnimationFrame(() => {
      const touch = e.touches[0];
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      handleDrawMove(x, y);
    });
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    handleDrawEnd();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas and reset to pristine white
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    
    setHasSignature(false);
    setAllStrokes([]); // Clear all strokes
    setStrokePoints([]); // Clear current stroke
    onSignatureChange(null);
  };

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <Card style={{
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        border: '2px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
        padding: '1rem'
      }}>
      <Card.Header className="bg-light">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <h6 className="mb-0">Draw Your Signature</h6>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={clearCanvas}
            disabled={!hasSignature}
          >
            Clear
          </Button>
        </div>
      </Card.Header>
      
      <Card.Body className="p-2">
        <div 
          style={{
            border: '2px dashed #ccc',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fafafa',
            position: 'relative'
          }}
        >
          <canvas
            ref={canvasRef}
            // Pointer events (best for stylus/tablet)
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            // Mouse events
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            // Touch events
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              cursor: 'crosshair',
              border: '1px solid #ddd',
              borderRadius: '6px',
              backgroundColor: 'white',
              touchAction: 'none',
              // Optimize for drawing tablets
              willChange: 'contents',
              imageRendering: 'pixelated'
            }}
          />
        </div>
        
        {/* Status message */}
        {hasSignature && (
          <div className="mt-2 text-center">
            <small className="text-success">

            </small>
          </div>
        )}
        
        {!hasSignature && (
          <div className="mt-2 text-center">
            <small className="text-muted">

            </small>
          </div>
        )}
      </Card.Body>
    </Card>
    </div>
  );
};

export default SignatureCanvas;
