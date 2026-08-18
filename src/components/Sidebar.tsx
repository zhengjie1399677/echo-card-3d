import React, { useRef } from 'react';
import type { CardConfig } from './CardPreview';
import { Upload, Shuffle, RefreshCw } from 'lucide-react';

interface SidebarProps {
  config: CardConfig;
  onChange: (config: CardConfig) => void;
  onRandomize: () => void;
  onReset: () => void;
}

const FILTERS = [
  { id: 'none', label: '原图' },
  { id: 'grayscale', label: '复古黑白' },
  { id: 'sepia', label: '暖黄怀旧' },
  { id: 'vintage', label: '经典胶片' },
  { id: 'noir', label: '高对比黑白' },
  { id: 'vibrant', label: '鲜艳绚丽' },
];

export const Sidebar: React.FC<SidebarProps> = ({ config, onChange, onRandomize, onReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: keyof CardConfig, value: any) => {
    onChange({
      ...config,
      [field]: value
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange({
          ...config,
          imageUrl: event.target?.result as string,
          imageScale: 1.0,
          imageX: 0,
          imageY: 0
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. COVER IMAGE UPLOADER & EDITING */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '16px', color: 'var(--text-bright)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          卡片封面插画
        </h3>

        {/* Upload box */}
        <div
          onClick={triggerFileInput}
          style={{
            height: '110px',
            border: '2px dashed var(--border-color)',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            background: 'rgba(0, 0, 0, 0.2)',
            transition: 'border-color 0.2s, background-color 0.2s',
            gap: '8px',
            color: 'var(--text-muted)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-violet)';
            e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
          }}
        >
          <Upload size={24} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '13px', fontWeight: 500 }}>
            {config.imageUrl ? '替换封面图片' : '上传封面图片'}
          </span>
          <span style={{ fontSize: '10px', opacity: 0.6 }}>支持 PNG, JPG, WebP 格式</span>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </div>

        {config.imageUrl && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'rgba(0, 0, 0, 0.15)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            
            {/* Filter buttons */}
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>预设滤镜</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => updateField('imageFilter', f.id)}
                    style={{
                      padding: '6px 4px',
                      fontSize: '11px',
                      borderRadius: '6px',
                      background: config.imageFilter === f.id ? 'var(--accent-violet)' : 'rgba(255,255,255,0.05)',
                      border: 'none',
                      color: config.imageFilter === f.id ? 'white' : 'var(--text-main)',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                      fontWeight: config.imageFilter === f.id ? '600' : 'normal'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scale Slider */}
            <div className="slider-container">
              <div className="slider-header">
                <span>插画缩放</span>
                <span className="slider-value">{config.imageScale.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.05"
                className="custom-slider"
                value={config.imageScale}
                onChange={(e) => updateField('imageScale', parseFloat(e.target.value))}
              />
            </div>

            {/* X Offset Slider */}
            <div className="slider-container">
              <div className="slider-header">
                <span>水平偏移</span>
                <span className="slider-value">{config.imageX}%</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                className="custom-slider"
                value={config.imageX}
                onChange={(e) => updateField('imageX', parseInt(e.target.value))}
              />
            </div>

            {/* Y Offset Slider */}
            <div className="slider-container">
              <div className="slider-header">
                <span>垂直偏移</span>
                <span className="slider-value">{config.imageY}%</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                className="custom-slider"
                value={config.imageY}
                onChange={(e) => updateField('imageY', parseInt(e.target.value))}
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. CARD CONTENT TYPOGRAPHY */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '16px', color: 'var(--text-bright)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          卡片文字内容
        </h3>

        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>卡片标题</label>
          <input
            type="text"
            className="custom-input"
            value={config.title}
            onChange={(e) => updateField('title', e.target.value)}
            maxLength={40}
            placeholder="例如：时光回响探索计划"
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>副标题</label>
          <input
            type="text"
            className="custom-input"
            value={config.subtitle}
            onChange={(e) => updateField('subtitle', e.target.value)}
            maxLength={25}
            placeholder="例如：特别版纪念卡"
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>印言 / 描述</label>
          <textarea
            className="custom-textarea"
            value={config.description}
            onChange={(e) => updateField('description', e.target.value)}
            maxLength={180}
            placeholder="例如：在这里写下一段温暖的祝福，或者定制自己专属的主题卡片..."
          />
        </div>

        {/* Footer info splits */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>底部左侧标签</label>
            <input
              type="text"
              className="custom-input"
              value={config.footerLabelLeft}
              onChange={(e) => updateField('footerLabelLeft', e.target.value)}
              maxLength={15}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>左侧值</label>
            <input
              type="text"
              className="custom-input"
              value={config.footerValueLeft}
              onChange={(e) => updateField('footerValueLeft', e.target.value)}
              maxLength={15}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>底部右侧标签</label>
            <input
              type="text"
              className="custom-input"
              value={config.footerLabelRight}
              onChange={(e) => updateField('footerLabelRight', e.target.value)}
              maxLength={15}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>右侧值</label>
            <input
              type="text"
              className="custom-input"
              value={config.footerValueRight}
              onChange={(e) => updateField('footerValueRight', e.target.value)}
              maxLength={15}
            />
          </div>
        </div>
      </div>

      {/* 3. CARD TRAITS (心理特质属性) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          <h3 style={{ fontSize: '15px', color: 'var(--text-bright)', margin: 0 }}>
            心理特质条
          </h3>
          <button
            type="button"
            onClick={() => updateField('showTraits', !config.showTraits)}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              borderRadius: '6px',
              background: config.showTraits ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.05)',
              border: '1px solid ' + (config.showTraits ? 'var(--accent-violet)' : 'var(--border-color)'),
              color: config.showTraits ? 'var(--text-bright)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            {config.showTraits ? '已启用' : '已禁用'}
          </button>
        </div>

        {config.showTraits && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            {/* Trait 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input
                  type="text"
                  className="custom-input"
                  style={{ width: '120px', height: '24px', fontSize: '11px', padding: '2px 6px', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', borderRadius: 0 }}
                  value={config.traitName1 || '表象人格'}
                  onChange={(e) => updateField('traitName1', e.target.value)}
                  maxLength={10}
                />
                <span style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 'bold' }}>{config.traitValue1 ?? 85}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={config.traitValue1 ?? 85}
                onChange={(e) => updateField('traitValue1', parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-violet)', cursor: 'pointer' }}
              />
            </div>

            {/* Trait 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input
                  type="text"
                  className="custom-input"
                  style={{ width: '120px', height: '24px', fontSize: '11px', padding: '2px 6px', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', borderRadius: 0 }}
                  value={config.traitName2 || '潜意识深度'}
                  onChange={(e) => updateField('traitName2', e.target.value)}
                  maxLength={10}
                />
                <span style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 'bold' }}>{config.traitValue2 ?? 72}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={config.traitValue2 ?? 72}
                onChange={(e) => updateField('traitValue2', parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-violet)', cursor: 'pointer' }}
              />
            </div>

            {/* Trait 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input
                  type="text"
                  className="custom-input"
                  style={{ width: '120px', height: '24px', fontSize: '11px', padding: '2px 6px', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', borderRadius: 0 }}
                  value={config.traitName3 || '反差指数'}
                  onChange={(e) => updateField('traitName3', e.target.value)}
                  maxLength={10}
                />
                <span style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 'bold' }}>{config.traitValue3 ?? 90}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={config.traitValue3 ?? 90}
                onChange={(e) => updateField('traitValue3', parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-violet)', cursor: 'pointer' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. CARD SPECIAL EFFECTS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '16px', color: 'var(--text-bright)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          特效工艺
        </h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0, 0, 0, 0.2)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)' }}>镭射炫彩图层</span>
          <button
            type="button"
            onClick={() => updateField('holographic', !config.holographic)}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              borderRadius: '6px',
              border: 'none',
              background: config.holographic ? 'var(--accent-violet)' : 'rgba(255,255,255,0.1)',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'background 0.2s'
            }}
          >
            {config.holographic ? '已开启' : '已禁用'}
          </button>
        </div>
      </div>

      {/* 4. RESET / RANDOMIZE BUTTONS */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onReset}
          style={{ flex: 1 }}
        >
          <RefreshCw size={14} />
          重置卡片
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onRandomize}
          style={{ flex: 1 }}
        >
          <Shuffle size={14} />
          随机生成
        </button>
      </div>

    </div>
  );
};
