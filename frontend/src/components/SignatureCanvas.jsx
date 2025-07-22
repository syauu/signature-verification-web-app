import React, { useRef, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';

const SignatureCanvas = ({ onSignatureChange, width = 500, height = 500 }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [lastPoint, setLastPoint] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width, height });

  // Ultra high-quality canvas settings for crisp signatures
  const CANVAS_SCALE = 4; // 4x resolution for maximum quality
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
    
    // Premium quality rendering settings
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
    ctx.lineWidth = strokeWidth;
    
    // Enable shadow for natural ink effect
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 0.5;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }, [canvasSize.width, canvasSize.height, strokeWidth]);

  // Smooth, natural drawing with anti-aliasing
  const drawSmoothLine = (ctx, fromX, fromY, toX, toY) => {
    // Calculate distance for smoothing
    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 2) {
      // For very short distances, just draw a simple line
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();
    } else {
      // For longer strokes, use quadratic curves for smoothness
      const midX = (fromX + toX) / 2;
      const midY = (fromY + toY) / 2;
      
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.quadraticCurveTo(fromX, fromY, midX, midY);
      ctx.quadraticCurveTo(midX, midY, toX, toY);
      ctx.stroke();
    }
  };

  // Handle drawing start
  const handleDrawStart = (x, y) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    setIsDrawing(true);
    setHasSignature(true);
    setLastPoint({ x, y });
    
    // Draw initial dot for natural pen-like start
    ctx.beginPath();
    ctx.arc(x, y, strokeWidth / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  // Handle drawing movement
  const handleDrawMove = (x, y) => {
    if (!isDrawing || !lastPoint) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set line properties for this stroke
    ctx.lineWidth = strokeWidth;
    
    // Draw smooth line from last point to current point
    drawSmoothLine(ctx, lastPoint.x, lastPoint.y, x, y);
    
    setLastPoint({ x, y });
  };

  // Handle drawing end
  const handleDrawEnd = () => {
    setIsDrawing(false);
    setLastPoint(null);
    
    // Convert canvas to ultra-high quality PNG
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      const file = new File([blob], 'signature.png', { type: 'image/png' });
      onSignatureChange(file);
    }, 'image/png', 1.0); // Maximum quality
  };

  // Pointer events - for tablets and stylus
  const handlePointerDown = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleDrawStart(x, y);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleDrawMove(x, y);
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

  // Touch events - for mobile/tablet touch
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    handleDrawStart(x, y);
  };

  const handleTouchMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    handleDrawMove(x, y);
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
          <h6 className="mb-0">✏️ Draw Your Signature</h6>
          <div className="d-flex gap-3 align-items-center flex-wrap">
            {/* Pen Size Control */}
            <div className="d-flex gap-2 align-items-center">
              <Form.Label className="mb-0 small">Pen Size:</Form.Label>
              <Form.Range
                min="1"
                max="6"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                style={{ width: '80px' }}
              />
              <small>{strokeWidth}px</small>
            </div>
            
            {/* Clear Button */}
            <Button
              variant="outline-danger"
              size="sm"
              onClick={clearCanvas}
              disabled={!hasSignature}
            >
              Clear
            </Button>
          </div>
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
              touchAction: 'none'
            }}
          />
        </div>
        
        {/* Status message */}
        {hasSignature && (
          <div className="mt-2 text-center">
            <small className="text-success">
              ✅ Signature captured in ultra-high quality (4x resolution PNG)
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
    </div>
  );
};

export default SignatureCanvas;
