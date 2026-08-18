import { useState, useRef, useEffect } from 'react';
import { CardPreview, type CardConfig } from './components/CardPreview';
import { Sidebar } from './components/Sidebar';
import { StampDesigner } from './components/StampDesigner';
import { 
  Sparkles, 
  RotateCw, 
  Download, 
  Bookmark,
  Smartphone,
  Layers,
  Palette
} from 'lucide-react';
import { toPng, getFontEmbedCSS } from 'html-to-image';

// Unsplash premium stock images that support CORS
const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop', // Mysterious dark silhouette
  'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?q=80&w=800&auto=format&fit=crop', // Vintage letter & compass
  'https://images.unsplash.com/photo-1515263487990-61b07816b324?q=80&w=800&auto=format&fit=crop', // Abstract neon blue/pink reflections
];

const PRESETS: { [key: string]: CardConfig } = {
  agent: {
    title: '光影探索者 // 纪念卡',
    subtitle: '特别定制版',
    description: '光影随行，记忆回响。这是一张互动 3D 视差纪念卡，您可以在左侧面板定制专属插画、印章和浮雕火漆印。',
    footerLabelLeft: '制作者',
    footerValueLeft: 'ECHO 团队',
    footerLabelRight: '体验版本',
    footerValueRight: 'v1.0.0',
    imageUrl: PRESET_IMAGES[0],
    imageScale: 1.1,
    imageX: 0,
    imageY: -10,
    imageFilter: 'noir',
    holographic: false,
    isFlipped: false,
    stampType: 'ink-circle',
    stampTextTop: '时光回响纪念印',
    stampTextBottom: 'SPECIAL EDITION',
    stampTextCenter: '2026.08.18',
    stampColor: '#8a1515',
    stampClarity: 'medium',
    stampX: 75,
    stampY: 58,
    stampRotation: 345,
    stampScale: 1.05,
    showTraits: true,
    traitName1: '表象人格',
    traitValue1: 85,
    traitName2: '潜意识深度',
    traitValue2: 72,
    traitName3: '反差指数',
    traitValue3: 90,
  },
  letter: {
    title: '致远方的你 // 信笺',
    subtitle: '私人手札',
    description: '见字如晤。在岁月的褶皱里，我们用火漆封存着往昔的秘密。愿这封信带着微温，穿过时光的缝隙送达你的手中。',
    footerLabelLeft: '寄件人',
    footerValueLeft: '时空旅人',
    footerLabelRight: '信件状态',
    footerValueRight: '已封存',
    imageUrl: PRESET_IMAGES[1],
    imageScale: 1.0,
    imageX: 0,
    imageY: 0,
    imageFilter: 'vintage',
    holographic: false,
    isFlipped: false,
    stampType: 'wax',
    stampTextTop: '时空密件',
    stampTextBottom: 'PRIVATE SEAL',
    stampTextCenter: 'SEALED',
    stampColor: '#6b0505',
    stampClarity: 'medium',
    stampX: 75,
    stampY: 62,
    stampRotation: 12,
    stampScale: 1.15,
    showTraits: false,
    traitName1: '怀旧情感',
    traitValue1: 95,
    traitName2: '文字温度',
    traitValue2: 88,
    traitName3: '回响共鸣',
    traitValue3: 75,
  },
  cyberpunk: {
    title: '网格 // 神经网络操作员',
    subtitle: '生物特征识别通行证',
    description: '链接已激活。神经同步已完成，同步率 98.4%。认知负荷正常。网络偏移防御系统已完全就绪。',
    footerLabelLeft: '服务分区',
    footerValueLeft: '霓虹网格-07',
    footerLabelRight: '身份验证',
    footerValueRight: '已通过',
    imageUrl: PRESET_IMAGES[2],
    imageScale: 1.35,
    imageX: 10,
    imageY: -5,
    imageFilter: 'vibrant',
    holographic: true,
    isFlipped: false,
    stampType: 'ink-rect',
    stampTextTop: '安全控制模块',
    stampTextBottom: 'SYSTEM APPROVED',
    stampTextCenter: '已验证',
    stampColor: '#0f4523',
    stampClarity: 'medium',
    stampX: 80,
    stampY: 60,
    stampRotation: 45,
    stampScale: 0.95,
    showTraits: true,
    traitName1: '神经同步率',
    traitValue1: 98,
    traitName2: '数据稳定度',
    traitValue2: 85,
    traitName3: '核心偏移度',
    traitValue3: 15,
  }
};

const DEFAULT_CONFIG: CardConfig = PRESETS.agent;

function App() {
  const [config, setConfig] = useState<CardConfig>({ ...DEFAULT_CONFIG });
  const [activeTab, setActiveTab] = useState<'presets' | 'card' | 'stamp'>('card');
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const exportAreaRef = useRef<HTMLDivElement>(null);
  // Cache the font embed CSS after first export to avoid re-fetching fonts on every export
  const fontEmbedCSSCache = useRef<string | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setActiveTab(prev => prev === 'presets' ? 'card' : prev);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleConfigChange = (newConfig: CardConfig) => {
    setConfig(newConfig);
  };

  const handlePresetSelect = (presetName: keyof typeof PRESETS) => {
    setConfig({ ...PRESETS[presetName] });
  };

  const handleFlip = () => {
    setConfig(prev => ({
      ...prev,
      isFlipped: !prev.isFlipped
    }));
  };

  const handleRandomize = () => {
    const titles = ['时光回响计划', '阿尔法代号项目', '暗物质实验室', '模因协议验证', '静默认知节点'];
    const subtitles = ['IV 级安全许可', '身份归档记录', '草案技术规范', '已验证数据源', '生物矩阵编码'];
    const descriptions = [
      '在静默的信道中，核心信息如涟漪般扩散。如果您读到此处，说明循环已重新启动。',
      '潜意识选择的数字化折射。请勿将信号追溯至源头基站。',
      '映射到神经网络网格的认知架构。所有操作必须以最高隐蔽参数运行。',
      '在网络连接完全占领我们的主节点之前，关于我们是谁的最后一抹余晖。',
      '按照标准协议提取的未分类生物学数据。需要授权人员的电子签名。'
    ];
    const footerLabels = [['操作员', 'ECHO-88'], ['安全校验', '已通过'], ['发信人', '访客'], ['签发日期', '2026/08']];
    const stampTexts = [['绝密副本', '请勿外传'], ['内部使用', '安全已验'], ['审核通过', '允许发布']];
    const stampColors = ['#bf2a2a', '#254e9e', '#1a7a4c', '#d4af37', '#8a1c1c', '#1c2e4a'];
    const filterTypes = ['none', 'grayscale', 'sepia', 'vintage', 'noir', 'vibrant'];
    const stampTypes: ('ink-circle' | 'ink-rect' | 'wax')[] = ['ink-circle', 'ink-rect', 'wax'];

    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    const randomSub = subtitles[Math.floor(Math.random() * subtitles.length)];
    const randomDesc = descriptions[Math.floor(Math.random() * descriptions.length)];
    const randomFooter = footerLabels[Math.floor(Math.random() * footerLabels.length)];
    const randomStampText = stampTexts[Math.floor(Math.random() * stampTexts.length)];
    const randomColor = stampColors[Math.floor(Math.random() * stampColors.length)];
    const randomFilter = filterTypes[Math.floor(Math.random() * filterTypes.length)];
    const randomStampType = stampTypes[Math.floor(Math.random() * stampTypes.length)];
    const randomImage = PRESET_IMAGES[Math.floor(Math.random() * PRESET_IMAGES.length)];

    setConfig({
      title: randomTitle,
      subtitle: randomSub,
      description: randomDesc,
      footerLabelLeft: randomFooter[0],
      footerValueLeft: randomFooter[1],
      footerLabelRight: '机密状态',
      footerValueRight: 'SECURE',
      imageUrl: randomImage,
      imageScale: parseFloat((Math.random() * 0.8 + 0.9).toFixed(2)),
      imageX: Math.floor(Math.random() * 40 - 20),
      imageY: Math.floor(Math.random() * 40 - 20),
      imageFilter: randomFilter,
      holographic: Math.random() > 0.5,
      isFlipped: false,
      stampType: randomStampType,
      stampTextTop: randomStampText[0],
      stampTextBottom: randomStampText[1],
      stampTextCenter: 'APPROVED',
      stampColor: randomColor,
      stampX: Math.floor(Math.random() * 30 + 60), // Random stamp position in the lower right area
      stampY: Math.floor(Math.random() * 30 + 55),
      stampRotation: Math.floor(Math.random() * 90 - 45),
      stampScale: parseFloat((Math.random() * 0.4 + 0.8).toFixed(2)),
      showTraits: Math.random() > 0.4,
      traitName1: '认知匹配度',
      traitValue1: Math.floor(Math.random() * 50 + 50),
      traitName2: '逻辑复杂度',
      traitValue2: Math.floor(Math.random() * 50 + 50),
      traitName3: '本能偏向率',
      traitValue3: Math.floor(Math.random() * 80 + 10),
    });
  };

  const handleReset = () => {
    setConfig({ ...DEFAULT_CONFIG });
  };

  const handleExport = async () => {
    if (!exportAreaRef.current) return;
    
    setIsExporting(true);
    // Switch to front side for capture if flipped
    const wasFlipped = config.isFlipped;
    if (wasFlipped) {
      setConfig(prev => ({ ...prev, isFlipped: false }));
      // Give enough time for the flip back animation
      await new Promise(r => setTimeout(r, 600));
    }

    // Set temporary export class to freeze 3D tilt, hide rotate dot, etc.
    const cardWrapper = exportAreaRef.current.querySelector('.card-3d-wrapper');
    const rotateHandle = exportAreaRef.current.querySelector('.stamp-rotate-handle');
    
    if (cardWrapper) {
      cardWrapper.classList.add('is-exporting');
      // @ts-ignore
      cardWrapper.style.transform = 'none';
    }
    if (rotateHandle) {
      // @ts-ignore
      rotateHandle.style.display = 'none';
    }

    // Wait a brief frame for layout reflow
    await new Promise(r => setTimeout(r, 100));

    try {
      // Pre-generate font embed CSS and cache it — only fetched on the first export.
      // This avoids html-to-image re-fetching all font files on every subsequent export.
      if (!fontEmbedCSSCache.current) {
        fontEmbedCSSCache.current = await getFontEmbedCSS(exportAreaRef.current);
      }

      const dataUrl = await toPng(exportAreaRef.current, {
        // cacheBust is intentionally omitted: it would append timestamps to every
        // font URL, bypassing the browser cache and forcing a full re-download each time.
        backgroundColor: 'transparent',
        style: {
          transform: 'none',
          transformOrigin: 'top left'
        },
        pixelRatio: 3, // 3x for sharp, high-resolution output
        fontEmbedCSS: fontEmbedCSSCache.current, // Use cached font CSS — skips network on 2nd+ export
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${config.title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')}-card.png`;
      link.click();
      
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export card image:', err);
    } finally {
      // Restore card interactive styles
      if (cardWrapper) {
        cardWrapper.classList.remove('is-exporting');
        // @ts-ignore
        cardWrapper.style.transform = '';
      }
      if (rotateHandle) {
        // @ts-ignore
        rotateHandle.style.display = '';
      }
      setIsExporting(false);
      
      // Restore flipped state if it was flipped
      if (wasFlipped) {
        setConfig(prev => ({ ...prev, isFlipped: true }));
      }
    }
  };

  const renderPresetsList = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Preset 1 */}
      <div
        onClick={() => handlePresetSelect('agent')}
        style={{
          padding: '14px',
          borderRadius: '10px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-gold)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 'bold', letterSpacing: '0.5px' }}>时光纪念卡</span>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#bf2a2a' }} />
        </div>
        <h4 style={{ fontSize: '13px', fontWeight: 600 }}>光影探索者纪念卡</h4>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          艺术感黑白光影封面，搭配定制双环纪念印章。
        </p>
      </div>

      {/* Preset 2 */}
      <div
        onClick={() => handlePresetSelect('letter')}
        style={{
          padding: '14px',
          borderRadius: '10px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-gold)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 'bold', letterSpacing: '0.5px' }}>复古漆封信</span>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8a1c1c' }} />
        </div>
        <h4 style={{ fontSize: '13px', fontWeight: 600 }}>致远方的你手札</h4>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          温暖复古怀旧色调，附带深红立体浮雕火漆蜡印。
        </p>
      </div>

      {/* Preset 3 */}
      <div
        onClick={() => handlePresetSelect('cyberpunk')}
        style={{
          padding: '14px',
          borderRadius: '10px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-gold)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 'bold', letterSpacing: '0.5px' }}>数字通行证</span>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#166534' }} />
        </div>
        <h4 style={{ fontSize: '13px', fontWeight: 600 }}>赛博网格身份卡</h4>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          全息炫彩折射光泽，高饱和色彩与硬朗的条码方章。
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Header Navigation */}
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap', flexShrink: 0 }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--accent-violet) 0%, var(--accent-pink) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: 'white',
              fontSize: '18px',
              fontFamily: 'var(--font-stamp)',
              boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)'
            }}
          >
            E
          </div>
          <div className="app-header-logo-text">
            <h1 style={{ fontSize: '18px', margin: 0, fontWeight: 700, letterSpacing: '1px' }}>
              ECHO CARD <span style={{ color: 'var(--accent-gold)' }}>3D</span>
            </h1>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '2px' }}>
              3D 互动印章与卡片定制器
            </p>
          </div>
        </div>

        {/* Global actions */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ padding: '8px 14px', fontSize: '13px' }}
            onClick={handleFlip}
          >
            <RotateCw size={14} />
            翻转卡片
          </button>
          
          <button 
            type="button" 
            className="btn btn-primary" 
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download size={14} />
            {isExporting ? '导出中...' : '导出 PNG'}
          </button>
        </div>
      </header>

      {/* Main Panel Area */}
      <main className="app-main-layout">
        {/* Left Panel: Adjustments & Typography */}
        <section className="app-sidebar-left glass-panel">
          {/* Tab selectors */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', gap: '16px', flexWrap: 'wrap' }}>
            {isMobile && (
              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: activeTab === 'presets' ? 'var(--text-bright)' : 'var(--text-muted)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  position: 'relative',
                  paddingBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Bookmark size={14} style={{ color: activeTab === 'presets' ? 'var(--accent-violet)' : 'inherit' }} />
                推荐预设
                {activeTab === 'presets' && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'var(--accent-violet)' }} />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('card')}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeTab === 'card' ? 'var(--text-bright)' : 'var(--text-muted)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                position: 'relative',
                paddingBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Layers size={14} style={{ color: activeTab === 'card' ? 'var(--accent-violet)' : 'inherit' }} />
              卡片设置
              {activeTab === 'card' && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'var(--accent-violet)' }} />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('stamp')}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeTab === 'stamp' ? 'var(--text-bright)' : 'var(--text-muted)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                position: 'relative',
                paddingBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Palette size={14} style={{ color: activeTab === 'stamp' ? 'var(--accent-violet)' : 'inherit' }} />
              印章设计
              {activeTab === 'stamp' && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'var(--accent-violet)' }} />
              )}
            </button>
          </div>

          <div style={{ flexGrow: 1 }}>
            {activeTab === 'presets' && isMobile ? (
              renderPresetsList()
            ) : activeTab === 'card' ? (
              <Sidebar
                config={config}
                onChange={handleConfigChange}
                onRandomize={handleRandomize}
                onReset={handleReset}
              />
            ) : (
              <StampDesigner
                config={config}
                onChange={handleConfigChange}
              />
            )}
          </div>
        </section>

        {/* Center Panel: Interactive 3D Card Canvas */}
        <section className="app-preview-stage">
          {downloadSuccess && (
            <div
              style={{
                position: 'absolute',
                top: '20px',
                background: 'rgba(22, 101, 52, 0.9)',
                border: '1px solid #15803d',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                zIndex: 200,
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                animation: 'fadeIn 0.3s ease'
              }}
            >
              ✓ 卡片已成功导出为 PNG 图片！
            </div>
          )}

          {/* Interactive Card Canvas Wrapper */}
          <CardPreview
            config={config}
            onChange={handleConfigChange}
            exportRef={exportAreaRef}
          />

          {/* Guidance text */}
          <div className="guidance-container">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Smartphone size={14} /> {isMobile ? '触控拖动可 3D 旋转卡片' : '鼠标悬浮并移动可 3D 旋转卡片'}
            </span>
            <span className="guidance-divider" style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border-color)' }} />
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} /> 点击“翻转卡片”查看背面防伪详情
            </span>
          </div>
        </section>

        {/* Right Panel: Curated Presets Column */}
        <section className="app-sidebar-right glass-panel">
          <h3 style={{ fontSize: '16px', color: 'var(--text-bright)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bookmark size={16} style={{ color: 'var(--accent-gold)' }} />
            推荐预设卡片
          </h3>
          
          {renderPresetsList()}

          {/* QR Code Scan Card */}
          <div 
            className="qr-code-card"
            style={{
              padding: '14px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginTop: '10px'
            }}
          >
            <div style={{ width: '64px', height: '64px', background: 'white', padding: '4px', borderRadius: '6px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="56" height="56" viewBox="0 0 29 29" fill="black">
                <path d="M0 0h7v7H0zm1 1v5h5V1zm1 1h3v3H1zM0 22h7v7H0zm1 1v5h5V22zm1 1h3v3H1zM22 0h7v7h-7zm1 1v5h5V1zm1 1h3v3H1z" />
                <path d="M9 0h2v1H9zm4 0h1v2h-1zm3 0h2v1h-2zm4 0h1v1h-1zm-10 2h1v1H9zm3 0h1v1h-1zm2 0h1v1h-1zm1 0h1v2h-1zm3 0h1v1h-1zm-8 2h3v1H9zm4 0h1v1h-1zm2 0h2v1h-2zm-6 2h1v1H9zm2 0h1v2h-1zm2 0h2v1h-2zm4 0h1v1h-1zm-8 2h1v1H9zm2 0h1v1h-1zm3 0h1v1h-1zm2 0h1v1h-1zm1 0h1v1h-1zm-10 2h1v1H9zm3 0h1v1h-1zm1 0h1v1h-1zm2 0h1v2h-1zm3 0h1v1h-1z" />
                <path d="M0 9h1v1H0zm2 0h1v2H2zm2 0h3v1H4zm5 0h1v1H9zm1 0h1v1h-1zm3 0h1v1h-1zm2 0h2v1h-2zm3 0h1v1h-1zm2 0h2v1h-2zm5 0h1v1h-1zm-24 2h1v1H0zm3 0h1v1H3zm3 0h1v1H6zm2 0h1v1H8zm2 0h2v1H10zm4 0h1v1h-1zm1 0h1v1h-1zm3 0h1v2h-1zm2 0h1v1h-1zm2 0h1v1h-1zm2 0h1v1h-1zm-20 2h1v1H0zm2 0h2v1H2zm4 0h1v1H6zm4 0h1v1H10zm3 0h1v1h-1zm3 0h2v1h-2zm4 0h1v2h-1zm4 0h1v1h-1zm-22 2h2v1H0zm3 0h1v1H3zm2 0h1v1H5zm2 0h1v1H7zm2 0h1v1H9zm2 0h1v1H11zm3 0h1v1h-1zm2 0h1v1h-1zm3 0h1v1h-1zm2 0h2v1h-2zm3 0h1v1h-1zm-20 2h1v1H0zm2 0h1v1H2zm2 0h2v1H4zm5 0h1v1H9zm1 0h1v1h-1zm2 0h1v1h-1zm3 0h1v1h-1zm2 0h1v1h-1zm1 0h1v1h-1zm2 0h2v1h-2zm4 0h1v1h-1z" />
                <path d="M9 22h1v1H9zm2 0h1v1h-1zm3 0h1v1h-1zm1 0h2v1h-2zm3 0h1v1h-1zm2 0h1v1h-1zm-10 2h1v1H9zm2 0h1v1h-1zm3 0h1v1h-1zm3 0h2v1h-2zm3 0h1v1h-1zm-10 2h2v1H9zm4 0h1v1h-1zm2 0h1v1h-1zm2 0h1v1h-1zm2 0h1v1h-1z" />
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-gold)' }}>手机扫码体验</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                使用手机扫描二维码，可随时随地访问此 WebApp 并体验 3D 重力感应！
              </span>
            </div>
          </div>

          {/* Tips / Instructions */}
          <div style={{ marginTop: 'auto', padding: '12px', background: 'rgba(226, 176, 76, 0.03)', borderRadius: '10px', border: '1px solid rgba(226, 176, 76, 0.15)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', color: 'var(--accent-gold)', fontSize: '12px', fontWeight: 600 }}>
              <Sparkles size={14} /> 创意设计说明
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              本工具使用网页标准的 SVG 噪点滤镜，动态模拟油墨在纸张上自然磨损、侵蚀的真实质感。在 Chromium 内核浏览器中显示效果最佳。
            </p>
          </div>
        </section>
      </main>

      {/* Footer info */}
      <footer 
        style={{ 
          marginTop: 'auto', 
          borderTop: '1px solid var(--border-color)', 
          padding: '16px 40px', 
          textAlign: 'center', 
          fontSize: '12px', 
          color: 'var(--text-muted)',
          background: 'rgba(10, 11, 13, 0.2)'
        }}
      >
        Echo Card 3D 生成器 • 创意设计沙盒 • 保留所有权利
      </footer>
    </div>
  );
}

export default App;
