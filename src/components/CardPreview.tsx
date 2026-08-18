import React, { useState, useRef, useEffect } from 'react';
import { RotateCw } from 'lucide-react';

export interface CardConfig {
  title: string;
  subtitle: string;
  description: string;
  footerLabelLeft: string;
  footerValueLeft: string;
  footerLabelRight: string;
  footerValueRight: string;
  imageUrl: string;
  imageScale: number;
  imageX: number; // offset percentage
  imageY: number; // offset percentage
  imageFilter: string; // 'none' | 'grayscale' | 'sepia' | 'vintage' | 'noir' | 'vibrant'
  holographic: boolean;
  isFlipped: boolean;
  
  // Stamp properties
  stampType: 'ink-circle' | 'ink-rect' | 'wax';
  stampTextTop: string;
  stampTextBottom: string;
  stampTextCenter: string;
  stampColor: string;
  stampClarity?: 'high' | 'medium' | 'low';
  stampX: number; // percentage width
  stampY: number; // percentage height
  stampRotation: number; // degrees
  stampScale: number;

  // Psychological Traits fields (for self-disclosure diagnostic profile)
  showTraits?: boolean;
  traitName1?: string;
  traitValue1?: number;
  traitName2?: string;
  traitValue2?: number;
  traitName3?: string;
  traitValue3?: number;
}

interface CardPreviewProps {
  config: CardConfig;
  onChange: (config: CardConfig) => void;
  exportRef: React.RefObject<HTMLDivElement | null>;
}

export const CardPreview: React.FC<CardPreviewProps> = ({ config, onChange, exportRef }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);
  
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [isResetting, setIsResetting] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  
  // Dragging and Rotating Stamp States
  const dragStartRef = useRef<{ pointerId: number; startX: number; startY: number; stampX: number; stampY: number } | null>(null);
  const rotateStartRef = useRef<{ pointerId: number; centerX: number; centerY: number; startAngle: number } | null>(null);
  const [isDraggingStamp, setIsDraggingStamp] = useState(false);
  const [isRotatingStamp, setIsRotatingStamp] = useState(false);

  // Set card flipping class trigger
  useEffect(() => {
    setIsFlipping(true);
    const timer = setTimeout(() => setIsFlipping(false), 800);
    return () => clearTimeout(timer);
  }, [config.isFlipped]);

  // Mouse Move 3D Parallax Tilt Effect
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (config.isFlipped || isFlipping || isDraggingStamp || isRotatingStamp) return;
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate rotation angles based on cursor position relative to card center
    // Clamp to prevent extreme tilts when dragging touch outside the card
    const px = Math.max(-0.2, Math.min(1.2, x / rect.width));
    const py = Math.max(-0.2, Math.min(1.2, y / rect.height));
    const rotateX = (0.5 - py) * 48; // Max 24 degrees tilt (increased from 30)
    const rotateY = (px - 0.5) * 48;

    // Update CSS Variables for shine position
    const glareX = `${px * 100}%`;
    const glareY = `${py * 100}%`;

    setTiltStyle({
      transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      // @ts-ignore custom properties
      '--glare-x': glareX,
      '--glare-y': glareY,
      '--sheen-x': `${(px + py) * 50}%`,
      '--sheen-y': `${(1.5 - px) * 50}%`,
    });
  };

  const handlePointerLeave = () => {
    if (isDraggingStamp || isRotatingStamp) return;
    setIsResetting(true);
    setTiltStyle({
      transform: 'rotateX(0deg) rotateY(0deg)',
    });
    // Remove resetting transition class after it finishes
    setTimeout(() => {
      setIsResetting(false);
    }, 600);
  };

  // Stamp Pointer Down: Start Dragging
  const handleStampPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Avoid interference with rotation handle
    if ((e.target as HTMLElement).closest('.stamp-rotate-handle')) return;
    if (!cardRef.current || !stampRef.current) return;

    e.stopPropagation();
    const stampEl = stampRef.current;
    stampEl.setPointerCapture(e.pointerId);

    dragStartRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      stampX: config.stampX,
      stampY: config.stampY
    };
    setIsDraggingStamp(true);
  };

  // Stamp Dragging Move
  const handleStampPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingStamp || !dragStartRef.current || dragStartRef.current.pointerId !== e.pointerId) return;
    if (!cardRef.current) return;

    e.stopPropagation();
    const cardRect = cardRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;

    // Convert pixels to card percentage width/height
    const pctDeltaX = (deltaX / cardRect.width) * 100;
    const pctDeltaY = (deltaY / cardRect.height) * 100;

    let newX = dragStartRef.current.stampX + pctDeltaX;
    let newY = dragStartRef.current.stampY + pctDeltaY;

    // Clamp within card boundaries (with some overflow allowed)
    newX = Math.max(-10, Math.min(110, newX));
    newY = Math.max(-10, Math.min(110, newY));

    onChange({
      ...config,
      stampX: Math.round(newX * 10) / 10,
      stampY: Math.round(newY * 10) / 10
    });
  };

  // Stamp Dragging End
  const handleStampPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartRef.current?.pointerId === e.pointerId) {
      e.stopPropagation();
      if (stampRef.current) {
        stampRef.current.releasePointerCapture(e.pointerId);
      }
      dragStartRef.current = null;
      setIsDraggingStamp(false);
    }
  };

  // Rotate Pointer Down: Start Rotating
  const handleRotatePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!stampRef.current) return;
    e.stopPropagation();
    
    const handleEl = e.currentTarget;
    handleEl.setPointerCapture(e.pointerId);

    const stampRect = stampRef.current.getBoundingClientRect();
    const centerX = stampRect.left + stampRect.width / 2;
    const centerY = stampRect.top + stampRect.height / 2;

    // Initial angle of pointer relative to center
    const dy = e.clientY - centerY;
    const dx = e.clientX - centerX;
    const startAngle = Math.atan2(dy, dx) * (180 / Math.PI);

    rotateStartRef.current = {
      pointerId: e.pointerId,
      centerX,
      centerY,
      startAngle: startAngle - config.stampRotation
    };
    setIsRotatingStamp(true);
  };

  // Rotate Move
  const handleRotatePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isRotatingStamp || !rotateStartRef.current || rotateStartRef.current.pointerId !== e.pointerId) return;

    e.stopPropagation();
    const { centerX, centerY, startAngle } = rotateStartRef.current;
    
    const dy = e.clientY - centerY;
    const dx = e.clientX - centerX;
    const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Compute new rotation angle
    let newRotation = currentAngle - startAngle;

    // Normalize to 0-360 range
    newRotation = (newRotation % 360 + 360) % 360;

    onChange({
      ...config,
      stampRotation: Math.round(newRotation)
    });
  };

  // Rotate End
  const handleRotatePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (rotateStartRef.current?.pointerId === e.pointerId) {
      e.stopPropagation();
      e.currentTarget.releasePointerCapture(e.pointerId);
      rotateStartRef.current = null;
      setIsRotatingStamp(false);
    }
  };

  // SVG circular text stamp renderer
  const renderCircularStamp = () => {
    const radius = 45;
    const size = 110;
    const center = size / 2;
    
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`} 
        style={{ color: config.stampColor, ...distressFilterStyle }}
        className="stamp-ink stamp-ink-circular"
      >
        <defs>
          {/* Arc path for text. Using SVG textPath */}
          <path 
            id="textArc" 
            d={`M ${center - radius},${center} A ${radius},${radius} 0 1,1 ${center + radius},${center} A ${radius},${radius} 0 1,1 ${center - radius},${center}`} 
            fill="none" 
          />
        </defs>
        
        {/* Double Rings */}
        <circle cx={center} cy={center} r={radius + 4} fill="none" stroke="currentColor" strokeWidth="2.5" />
        <circle cx={center} cy={center} r={radius - 2} fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3, 3" />
        
        {/* Circular Text */}
        <text fill="currentColor" fontSize="8" fontWeight="800" letterSpacing="0.8">
          <textPath href="#textArc" startOffset="50%" textAnchor="middle">
            {config.stampTextTop} • {config.stampTextBottom}
          </textPath>
        </text>
        
        {/* Center Text (Date or Badge) */}
        <text 
          x={center} 
          y={center + 4} 
          textAnchor="middle" 
          fontSize="11" 
          fontWeight="900" 
          fill="currentColor"
          style={{ fontStyle: 'italic' }}
        >
          {config.stampTextCenter}
        </text>
      </svg>
    );
  };

  // SVG filter styles for Ink Distress
  const distressClarity = config.stampClarity || 'medium';
  const distressFilterStyle = config.stampType !== 'wax' && distressClarity !== 'high' ? {
    filter: `url(#rubber-stamp-distress-${distressClarity})`
  } : undefined;

  return (
    <div 
      className="perspective-stage"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* SVG Distress Noise filter for rubber stamps */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} width="0" height="0">
        <defs>
          {/* Medium distress - Standard worn look */}
          <filter id="rubber-stamp-distress-medium">
            <feTurbulence type="fractalNoise" baseFrequency="0.18" numOctaves="4" result="noise" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 2.2 -0.9" result="distressed-noise"/>
            <feComposite operator="out" in="SourceGraphic" in2="distressed-noise" result="stamp"/>
          </filter>
          {/* Low clarity / Heavy distress - Very rustic worn look */}
          <filter id="rubber-stamp-distress-low">
            <feTurbulence type="fractalNoise" baseFrequency="0.25" numOctaves="4" result="noise" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 3.2 -1.2" result="distressed-noise"/>
            <feComposite operator="out" in="SourceGraphic" in2="distressed-noise" result="stamp"/>
          </filter>
        </defs>
      </svg>

      <div 
        ref={exportRef} 
        style={{ padding: '20px', background: 'transparent', display: 'inline-block' }}
      >
        <div
          ref={cardRef}
          className={`card-3d-wrapper ${isResetting ? 'resetting' : ''} ${isFlipping ? 'flipping' : ''} ${config.isFlipped ? 'is-flipped' : ''}`}
          style={tiltStyle}
        >
          {/* ================= CARD FRONT ================= */}
          <div className="card-face card-front">
            {/* Glare and Reflection */}
            <div className="card-glare" />
            {config.holographic && <div className="card-holographic-sheen" />}

            {/* Background Artwork */}
            <div className="card-artwork-container">
              {config.imageUrl ? (
                <img
                  src={config.imageUrl}
                  alt="Card Artwork"
                  className={`card-artwork filter-${config.imageFilter}`}
                  style={{
                    // @ts-ignore custom properties
                    '--img-scale': config.imageScale,
                    '--img-x': `${config.imageX}%`,
                    '--img-y': `${config.imageY}%`,
                  }}
                />
              ) : (
                <div className="card-artwork-placeholder">
                  <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <p style={{ fontSize: '13px', fontWeight: 500 }}>上传封面图片</p>
                </div>
              )}
            </div>

            {/* Card Content Details */}
            <div className="card-body">
              {/* Row 1: Header (Title & Subtitle Badge) */}
              <div className="card-header-row">
                <span className="card-title">{config.title || '回响项目'}</span>
                <span className="card-subtitle-badge">{config.subtitle || '未分类'}</span>
              </div>

              {/* Row 2: Split Content Panel (Left = Details/Traits, Right = QR Code) */}
              <div className="card-split-panel">
                <div className="card-split-left">
                  {!config.showTraits ? (
                    <div className="card-desc">{config.description || '在此处添加一段优雅的描述或文字...'}</div>
                  ) : (
                    <div className="card-traits-container">
                      <div className="trait-item">
                        <span className="trait-label">{config.traitName1 || '表象人格'}</span>
                        <div className="trait-bar-track">
                          <div 
                            className="trait-bar-fill" 
                            style={{ 
                              width: `${config.traitValue1 ?? 85}%`,
                              background: `linear-gradient(90deg, var(--accent-violet) 0%, ${config.stampColor || 'var(--accent-gold)'} 100%)`
                            }} 
                          />
                        </div>
                        <span className="trait-value">{config.traitValue1 ?? 85}%</span>
                      </div>
                      <div className="trait-item">
                        <span className="trait-label">{config.traitName2 || '潜意识深度'}</span>
                        <div className="trait-bar-track">
                          <div 
                            className="trait-bar-fill" 
                            style={{ 
                              width: `${config.traitValue2 ?? 72}%`,
                              background: `linear-gradient(90deg, var(--accent-violet) 0%, ${config.stampColor || 'var(--accent-gold)'} 100%)`
                            }} 
                          />
                        </div>
                        <span className="trait-value">{config.traitValue2 ?? 72}%</span>
                      </div>
                      <div className="trait-item">
                        <span className="trait-label">{config.traitName3 || '反差指数'}</span>
                        <div className="trait-bar-track">
                          <div 
                            className="trait-bar-fill" 
                            style={{ 
                              width: `${config.traitValue3 ?? 90}%`,
                              background: `linear-gradient(90deg, var(--accent-violet) 0%, ${config.stampColor || 'var(--accent-gold)'} 100%)`
                            }} 
                          />
                        </div>
                        <span className="trait-value">{config.traitValue3 ?? 90}%</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-split-right">
                  <div className="card-qr-wrapper">
                    <div className="card-qr-code">
                      <svg width="26" height="26" viewBox="0 0 29 29" fill="currentColor" style={{ color: '#ffffff' }}>
                        <path d="M0 0h7v7H0zm1 1v5h5V1zm1 1h3v3H1zM0 22h7v7H0zm1 1v5h5V22zm1 1h3v3H1zM22 0h7v7h-7zm1 1v5h5V1zm1 1h3v3H1z" />
                        <path d="M9 0h2v1H9zm4 0h1v2h-1zm3 0h2v1h-2zm4 0h1v1h-1zm-10 2h1v1H9zm3 0h1v1h-1zm2 0h1v1h-1zm1 0h1v2h-1zm3 0h1v1h-1zm-8 2h3v1H9zm4 0h1v1h-1zm2 0h2v1h-2zm-6 2h1v1H9zm2 0h1v2h-1zm2 0h2v1h-2zm4 0h1v1h-1zm-8 2h1v1H9zm2 0h1v1h-1zm3 0h1v1h-1zm2 0h1v1h-1zm1 0h1v1h-1zm-10 2h1v1H9zm3 0h1v1h-1zm1 0h1v1h-1zm2 0h1v2h-1zm3 0h1v1h-1z" />
                        <path d="M0 9h1v1H0zm2 0h1v2H2zm2 0h3v1H4zm5 0h1v1H9zm1 0h1v1h-1zm3 0h1v1h-1zm2 0h2v1h-2zm3 0h1v1h-1zm2 0h2v1h-2zm5 0h1v1h-1zm-24 2h1v1H0zm3 0h1v1H3zm3 0h1v1H6zm2 0h1v1H8zm2 0h2v1H10zm4 0h1v1h-1zm1 0h1v1h-1zm3 0h1v2h-1zm2 0h1v1h-1zm2 0h1v1h-1zm2 0h1v1h-1zm-20 2h1v1H0zm2 0h2v1H2zm4 0h1v1H6zm4 0h1v1H10zm3 0h1v1h-1zm3 0h2v1h-2zm4 0h1v2h-1zm4 0h1v1h-1zm-22 2h2v1H0zm3 0h1v1H3zm2 0h1v1H5zm2 0h1v1H7zm2 0h1v1H9zm2 0h1v1H11zm3 0h1v1h-1zm2 0h1v1h-1zm3 0h1v1h-1zm2 0h2v1h-2zm3 0h1v1h-1zm-20 2h1v1H0zm2 0h1v1H2zm2 0h2v1H4zm5 0h1v1H9zm1 0h1v1h-1zm2 0h1v1h-1zm3 0h1v1h-1zm2 0h1v1h-1zm1 0h1v1h-1zm2 0h2v1H-2zm4 0h1v1h-1z" />
                        <path d="M9 22h1v1H9zm2 0h1v1h-1zm3 0h1v1h-1zm1 0h2v1h-2zm3 0h1v1h-1zm2 0h1v1h-1zm-10 2h1v1H9zm2 0h1v1h-1zm3 0h1v1h-1zm3 0h2v1h-2zm3 0h1v1h-1zm-10 2h2v1H9zm4 0h1v1h-1zm2 0h1v1h-1zm2 0h1v1h-1zm2 0h1v1h-1z" />
                      </svg>
                    </div>
                    <span className="card-qr-label">SYNC SCAN</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drag/Rotate Seal Overlay - Moved to card-front level so it can cover the image and text anywhere */}
            <div
              ref={stampRef}
              className={`stamp-container ${isDraggingStamp ? 'is-dragging' : ''}`}
              style={{
                left: `${config.stampX}%`,
                top: `${config.stampY}%`,
                transform: `translate(-50%, -50%) translateZ(60px) rotate(${config.stampRotation}deg) scale(${config.stampScale})`
              }}
              onPointerDown={handleStampPointerDown}
              onPointerMove={handleStampPointerMove}
              onPointerUp={handleStampPointerUp}
            >
              {/* Stamp Rotate Handle */}
              <div 
                className="stamp-rotate-handle"
                onPointerDown={handleRotatePointerDown}
                onPointerMove={handleRotatePointerMove}
                onPointerUp={handleRotatePointerUp}
              >
                <RotateCw size={10} style={{ color: 'var(--accent-violet)' }} />
                <div className="stamp-rotate-line" />
              </div>

              {/* Stamp Types */}
              {config.stampType === 'ink-circle' && renderCircularStamp()}

              {config.stampType === 'ink-rect' && (
                <div 
                  className="stamp-ink stamp-ink-rectangular"
                  style={{ color: config.stampColor, ...distressFilterStyle }}
                >
                  <div style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '1px' }}>{config.stampTextTop}</div>
                  <div style={{ fontSize: '14px', fontWeight: 900, margin: '2px 0', letterSpacing: '1.5px' }}>{config.stampTextCenter}</div>
                  <div style={{ fontSize: '8px', opacity: 0.85, fontWeight: 500 }}>{config.stampTextBottom}</div>
                </div>
              )}

              {config.stampType === 'wax' && (
                <div 
                  className="stamp-wax-seal" 
                  style={{ backgroundColor: config.stampColor }}
                >
                  <div className="stamp-wax-inner">
                    <div style={{ fontSize: '7px', letterSpacing: '0.5px', marginBottom: '2px', fontWeight: 600 }}>{config.stampTextTop}</div>
                    <div style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.8px' }}>{config.stampTextCenter}</div>
                    <div style={{ fontSize: '7px', opacity: 0.7, marginTop: '2px', fontWeight: 500 }}>{config.stampTextBottom}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ================= CARD BACK ================= */}
          <div className="card-face card-back">
            <div className="card-back-logo">内 在 共 鸣</div>
            <div className="card-back-pattern">
              <svg width="28" height="28" fill="none" stroke="var(--accent-gold)" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.905 0-5.62-.515-8.129-1.458m16.258 0A11.952 11.952 0 0012 20.025a11.952 11.952 0 00-8.129-11.483" />
              </svg>
            </div>
            <div className="card-back-details">
              <p>机密安全许可等级 IV</p>
              <p style={{ fontSize: '9px', marginTop: '6px', opacity: 0.6 }}>No. {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              <p style={{ fontSize: '8px', color: 'var(--text-muted)', marginTop: '20px', textTransform: 'none' }}>
                所有授权均需通过生物特征校验。根据刑法第 §84-B 条规定，严禁直接复制或伪造。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
