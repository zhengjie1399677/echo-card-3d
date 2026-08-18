import React from 'react';
import type { CardConfig } from './CardPreview';

interface StampDesignerProps {
  config: CardConfig;
  onChange: (config: CardConfig) => void;
}

const COLOR_PRESETS = {
  ink: [
    { name: '复古朱红', value: '#8a1515' },
    { name: '靛青深蓝', value: '#0a235c' },
    { name: '帝国石绿', value: '#0b4a26' },
    { name: '碳墨雅黑', value: '#12141a' },
  ],
  wax: [
    { name: '勃艮第红', value: '#6b0505' },
    { name: '皇家金耀', value: '#a37e12' },
    { name: '森林古绿', value: '#0c2e0e' },
    { name: '午夜幽蓝', value: '#081324' },
  ]
};

export const StampDesigner: React.FC<StampDesignerProps> = ({ config, onChange }) => {
  const isWax = config.stampType === 'wax';
  const presets = isWax ? COLOR_PRESETS.wax : COLOR_PRESETS.ink;

  const handleTypeChange = (type: 'ink-circle' | 'ink-rect' | 'wax') => {
    // Pick an appropriate default color when type switches between ink and wax
    const defaultColor = type === 'wax' ? COLOR_PRESETS.wax[0].value : COLOR_PRESETS.ink[0].value;
    onChange({
      ...config,
      stampType: type,
      stampColor: defaultColor
    });
  };

  const updateField = (field: keyof CardConfig, value: any) => {
    onChange({
      ...config,
      [field]: value
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ fontSize: '15px', color: 'var(--text-bright)', marginBottom: '10px' }}>印章样式</h3>
        <div className="btn-group">
          <button
            type="button"
            className={`btn-group-btn ${config.stampType === 'ink-circle' ? 'active' : ''}`}
            onClick={() => handleTypeChange('ink-circle')}
          >
            圆形印泥
          </button>
          <button
            type="button"
            className={`btn-group-btn ${config.stampType === 'ink-rect' ? 'active' : ''}`}
            onClick={() => handleTypeChange('ink-rect')}
          >
            矩形印泥
          </button>
          <button
            type="button"
            className={`btn-group-btn ${config.stampType === 'wax' ? 'active' : ''}`}
            onClick={() => handleTypeChange('wax')}
          >
            火漆蜡印
          </button>
        </div>
      </div>

      {/* Stamp Color Presets */}
      <div>
        <h3 style={{ fontSize: '15px', color: 'var(--text-bright)', marginBottom: '10px' }}>印泥颜色</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {presets.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => updateField('stampColor', color.value)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: color.value,
                border: config.stampColor.toLowerCase() === color.value.toLowerCase() ? '3px solid white' : '1px solid rgba(255,255,255,0.2)',
                boxShadow: config.stampColor.toLowerCase() === color.value.toLowerCase() ? '0 0 10px rgba(255,255,255,0.4)' : 'none',
                cursor: 'pointer',
                transition: 'transform 0.15s, border-color 0.15s',
              }}
              title={color.name}
            />
          ))}
          {/* Custom color input */}
          <div style={{ position: 'relative', width: '32px', height: '32px' }}>
            <input
              type="color"
              value={config.stampColor}
              onChange={(e) => updateField('stampColor', e.target.value)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
              }}
            />
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: 'white',
                fontWeight: 'bold',
                pointerEvents: 'none',
              }}
            >
              +
            </div>
          </div>
        </div>
      </div>

      {/* Stamp Clarity Select (for Ink Stamp types only) */}
      {config.stampType !== 'wax' && (
        <div>
          <h3 style={{ fontSize: '15px', color: 'var(--text-bright)', marginBottom: '10px' }}>印泥清晰度</h3>
          <div className="btn-group">
            <button
              type="button"
              className={`btn-group-btn ${(config.stampClarity || 'medium') === 'high' ? 'active' : ''}`}
              onClick={() => updateField('stampClarity', 'high')}
            >
              高清晰 (无磨损)
            </button>
            <button
              type="button"
              className={`btn-group-btn ${(config.stampClarity || 'medium') === 'medium' ? 'active' : ''}`}
              onClick={() => updateField('stampClarity', 'medium')}
            >
              中斑驳 (经典印泥)
            </button>
            <button
              type="button"
              className={`btn-group-btn ${(config.stampClarity || 'medium') === 'low' ? 'active' : ''}`}
              onClick={() => updateField('stampClarity', 'low')}
            >
              重磨损 (斑驳古旧)
            </button>
          </div>
        </div>
      )}

      {/* Stamp Texts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '15px', color: 'var(--text-bright)' }}>印章排版文字</h3>
        
        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>上方文字 (环绕/眉栏)</label>
          <input
            type="text"
            className="custom-input"
            value={config.stampTextTop}
            onChange={(e) => updateField('stampTextTop', e.target.value.toUpperCase())}
            maxLength={32}
            placeholder="例如：APPROVED"
          />
        </div>

        {config.stampType !== 'ink-circle' && (
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>下方文字 (底边)</label>
            <input
              type="text"
              className="custom-input"
              value={config.stampTextBottom}
              onChange={(e) => updateField('stampTextBottom', e.target.value.toUpperCase())}
              maxLength={32}
              placeholder="例如：VERIFIED"
            />
          </div>
        )}

        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
            {config.stampType === 'ink-circle' ? '中心文字 (日期/编号)' : '核心文字'}
          </label>
          <input
            type="text"
            className="custom-input"
            value={config.stampTextCenter}
            onChange={(e) => updateField('stampTextCenter', e.target.value.toUpperCase())}
            maxLength={12}
            placeholder="例如：2026.08.18"
          />
        </div>
      </div>

      {/* Size / Scale Slider */}
      <div className="slider-container">
        <div className="slider-header">
          <span>印章大小缩放</span>
          <span className="slider-value">{(config.stampScale * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range"
          min="0.6"
          max="1.6"
          step="0.05"
          className="custom-slider"
          value={config.stampScale}
          onChange={(e) => updateField('stampScale', parseFloat(e.target.value))}
        />
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', display: 'flex', gap: '6px', alignItems: 'center' }}>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 9.152c.582.448 1.148.89 1.676 1.345m-1.676-1.345c-.528-.407-1.148-.89-1.676-1.345m3.352 2.69c.528.407 1.055.815 1.583 1.222m-1.583-1.222c-.528-.407-1.055-.815-1.583-1.222m-3.352-2.69a93.208 93.208 0 00-6.19 5.344m6.19-5.344A93.23 93.23 0 0015.04 3.75m-9.183 9.096A93.204 93.204 0 0112 18.025m-6.143-5.179A93.207 93.207 0 002.25 18c2.485 0 4.5-4.03 4.5-9" />
        </svg>
        <span>提示：您可以直接在卡片上拖动和旋转印章！</span>
      </div>
    </div>
  );
};
