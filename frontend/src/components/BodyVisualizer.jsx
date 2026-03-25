import { useState, useMemo, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';
import './BodyVisualizer.css';

export default function BodyVisualizer({ progressData = [] }) {
  const [viewMode, setViewMode] = useState('current');
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [timelineFilter, setTimelineFilter] = useState('ALL');
  const [gender, setGender] = useState('male');

  const baseSortedData = useMemo(() => {
    if (!progressData || progressData.length === 0) return [];
    return [...progressData].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [progressData]);

  const sortedData = useMemo(() => {
    if (baseSortedData.length === 0) return [];
    if (timelineFilter === 'ALL') return baseSortedData;
    
    const newestDate = new Date(baseSortedData[baseSortedData.length - 1].date);
    return baseSortedData.filter(entry => {
      const diffDays = differenceInDays(newestDate, new Date(entry.date));
      if (timelineFilter === '1W') return diffDays <= 7;
      if (timelineFilter === '1M') return diffDays <= 30;
      return true;
    });
  }, [baseSortedData, timelineFilter]);

  useEffect(() => {
    if (sortedData.length > 0) setTimelineIndex(sortedData.length - 1);
    else setTimelineIndex(0);
  }, [sortedData]);

  const safeRatio = (n, o) => n > 0 && o > 0 ? n / o : 1;
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  const calculateScales = (currentData, baseData) => {
    const defaultScales = { torsoX: 1, armsX: 1, legsX: 1, overallScale: 1 };
    const defaultDiffs = { waist: null, biceps: null, weight: null };

    if (!currentData || !baseData) return { scales: defaultScales, diffs: defaultDiffs };

    let torsoX = safeRatio(currentData.waist, baseData.waist);
    let armsX = safeRatio(currentData.biceps, baseData.biceps);
    let legsX = safeRatio(currentData.thighs, baseData.thighs);
    let overallScale = safeRatio(currentData.weight, baseData.weight);

    // If only weight is provided, map it to a gentle organic expansion
    if (!currentData.waist && currentData.weight) {
      const damp = 1 + ((overallScale - 1) * 0.6);
      torsoX = damp; armsX = damp; legsX = damp;
    }

    return {
      scales: {
        torsoX: clamp(torsoX, 0.7, 1.6),
        armsX: clamp(armsX, 0.7, 1.6),
        legsX: clamp(legsX, 0.7, 1.6),
        overallScale: clamp(overallScale, 0.85, 1.3)
      },
      diffs: {
        waist: currentData.waist && baseData.waist ? currentData.waist - baseData.waist : null,
        biceps: currentData.biceps && baseData.biceps ? currentData.biceps - baseData.biceps : null,
        weight: currentData.weight && baseData.weight ? currentData.weight - baseData.weight : null
      }
    };
  };

  const { currentScales, currentDiffs, oldestData, newestData, timelineData, achievements } = useMemo(() => {
    const oldest = baseSortedData[0] || null;
    const newest = baseSortedData[baseSortedData.length - 1] || null;
    let tData = sortedData[timelineIndex] || newest;
    if (!tData) tData = null;

    const { scales: curScales, diffs: curDiffs } = calculateScales(newest, oldest);
    
    const foundAchievements = [];
    if (curDiffs.waist && curDiffs.waist <= -2.5) {
      foundAchievements.push({ text: `Great Physique! Waist reduced by ${Math.abs(curDiffs.waist).toFixed(1)}cm! ✨`, type: 'success' });
    }
    if (curDiffs.weight && curDiffs.weight <= -2.0) {
      foundAchievements.push({ text: `Substantial progress! Dropped ${Math.abs(curDiffs.weight).toFixed(1)}kg! 📉`, type: 'success' });
    }
    if (curDiffs.biceps && curDiffs.biceps >= 1.0) {
      foundAchievements.push({ text: `Muscle Gains! Biceps grew by ${curDiffs.biceps.toFixed(1)}cm! 💪`, type: 'primary' });
    }

    return {
      currentScales: curScales, currentDiffs: curDiffs,
      oldestData: oldest, newestData: newest,
      timelineData: tData, achievements: foundAchievements
    };
  }, [baseSortedData, sortedData, timelineIndex]);

  // High-Quality Modern 2D Anatomy Scan Component
  const PremiumAnatomyMask = ({ scales, highlights = null, label = '' }) => {
    // Highly detailed anatomical silhouettes simulating real human proportions
    const maleSilhouette = "M 120 15 C 105 15 102 35 102 50 C 102 65 106 70 108 75 C 90 78 68 85 55 105 C 45 120 40 150 45 180 C 50 210 52 240 55 260 C 58 275 62 265 65 250 C 68 230 72 200 78 190 C 80 185 82 230 85 260 C 88 300 85 360 88 410 C 90 460 92 485 100 490 C 108 495 110 480 112 450 C 115 410 115 360 118 310 L 122 310 C 125 360 125 410 128 450 C 130 480 132 495 140 490 C 148 485 150 460 152 410 C 155 360 152 300 155 260 C 158 230 160 185 162 190 C 168 200 172 230 175 250 C 178 265 182 275 185 260 C 188 240 190 210 195 180 C 200 150 195 120 185 105 C 172 85 150 78 132 75 C 134 70 138 65 138 50 C 138 35 135 15 120 15 Z";
    const femaleSilhouette = "M 120 20 C 108 20 106 40 106 55 C 106 65 108 72 110 75 C 95 80 75 92 65 110 C 55 130 52 165 58 190 C 62 215 65 240 68 255 C 70 268 75 260 78 245 C 80 225 82 205 85 195 C 88 192 86 230 88 260 C 92 290 85 330 85 360 C 85 410 88 470 98 485 C 105 495 112 480 112 445 C 112 400 115 350 118 310 L 122 310 C 125 350 128 400 128 445 C 128 480 135 495 142 485 C 152 470 155 410 155 360 C 155 330 148 290 152 260 C 154 230 152 192 155 195 C 158 205 160 225 162 245 C 165 260 170 268 172 255 C 175 240 178 215 182 190 C 188 165 185 130 175 110 C 165 92 145 80 130 75 C 132 72 134 65 134 55 C 134 40 132 20 120 20 Z";

    const path = gender === 'male' ? maleSilhouette : femaleSilhouette;

    return (
      <div className="premium-avatar-wrapper animate-fade">
        {label && <h4 className="avatar-label">{label}</h4>}
        
        <svg viewBox="0 0 240 500" className="premium-svg-body">
          <defs>
            {/* High-quality metallic / glassmorphism gradient fill */}
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4dabf7" />
              <stop offset="40%" stopColor="#1c7ed6" />
              <stop offset="100%" stopColor="#0b2b54" />
            </linearGradient>

            {/* Glowing aura filter for modern medical-scan aesthetic */}
            <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
              <feComponentTransfer in="blur" result="glow">
                <feFuncA type="linear" slope="0.8" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Internal 3D shadow for depth */}
            <filter id="innerDepth" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="-2" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Morphing Group wrapped with safe transformations */}
          <g 
            className="body-morph-layer"
            style={{ 
              transform: `scaleX(${scales.torsoX}) scaleY(${scales.overallScale})`, 
              transformOrigin: '120px 250px' 
            }}
            filter="url(#neonGlow)"
          >
            <path 
              d={path} 
              fill="url(#bodyGradient)" 
              filter="url(#innerDepth)"
              className="anatomical-path"
            />

            {/* Subtle anatomical contour lines for realism */}
            <g className="contour-lines" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none">
              <path d="M 120 75 L 120 480" /> {/* Center line */}
              <path d="M 90 120 Q 120 150 150 120" /> {/* Chest */}
              <path d="M 100 240 Q 120 250 140 240" /> {/* Waist */}
            </g>

            {/* Highlight Rings based on progress */}
            {highlights?.waist && Math.abs(highlights.waist) > 1 && (
              <ellipse cx="120" cy="240" rx="45" ry="15" className={`highlight-ring ${highlights.waist < 0 ? 'good' : 'alert'}`} />
            )}
            {highlights?.weight && Math.abs(highlights.weight) > 2 && (
              <ellipse cx="120" cy="150" rx="55" ry="75" className={`highlight-ring ${highlights.weight < 0 ? 'good' : 'warning'}`} />
            )}
          </g>
        </svg>
      </div>
    );
  };

  return (
    <div className="body-visualizer-container premium-scan-mode">
      
      {/* Control Panel */}
      <div className="bv-controls-wrapper">
        <div className="bv-controls">
          <button className={`btn-pill ${viewMode === 'current' ? 'active' : ''}`} onClick={() => setViewMode('current')}>Current Scan</button>
          <button className={`btn-pill ${viewMode === 'compare' ? 'active' : ''}`} onClick={() => setViewMode('compare')} disabled={baseSortedData.length < 2}>Before/After</button>
          <button className={`btn-pill ${viewMode === 'timeline' ? 'active' : ''}`} onClick={() => setViewMode('timeline')} disabled={baseSortedData.length < 2}>Timeline</button>
        </div>
        
        {/* Gender Toggle for anatomical accuracy */}
        <div className="gender-toggle">
          <button className={`btn-slim ${gender === 'male' ? 'active' : ''}`} onClick={() => setGender('male')}>Male</button>
          <button className={`btn-slim ${gender === 'female' ? 'active' : ''}`} onClick={() => setGender('female')}>Female</button>
        </div>
      </div>

      {baseSortedData.length === 0 ? (
        <div className="empty-state-visualizer">
          <p className="muted empty-msg">Log progress metrics to unlock your modern anatomical scan!</p>
        </div>
      ) : (
        <div className="bv-viewport">
          
          {viewMode === 'timeline' && sortedData.length > 0 && (
             <div className="timeline-filters">
                <button className={`btn-slim ${timelineFilter === '1W' ? 'active' : ''}`} onClick={() => setTimelineFilter('1W')}>1 Week</button>
                <button className={`btn-slim ${timelineFilter === '1M' ? 'active' : ''}`} onClick={() => setTimelineFilter('1M')}>1 Month</button>
                <button className={`btn-slim ${timelineFilter === 'ALL' ? 'active' : ''}`} onClick={() => setTimelineFilter('ALL')}>All Time</button>
             </div>
          )}

          <div className="visualizer-stage-premium">
            {viewMode === 'current' && (
              <div className="view-mode-current layout-split-premium">
                <div className="svg-column-premium">
                  {/* High quality realistic scan masking */}
                  <PremiumAnatomyMask scales={currentScales} highlights={currentDiffs} />
                </div>
                
                <div className="stats-column">
                  <h4 className="section-title">Anatomy Scan Analysis</h4>
                  <p className="hint-text">Intelligent tracking detects structural body modifications over time.</p>
                  
                  <div className="diff-badges">
                    {currentDiffs.weight !== null && (
                      <span className={`badge ${currentDiffs.weight <= 0 ? 'success' : 'primary'}`}>
                        Mass: {currentDiffs.weight > 0 ? '+' : ''}{currentDiffs.weight.toFixed(1)} kg
                      </span>
                    )}
                    {currentDiffs.waist !== null && (
                      <span className={`badge ${currentDiffs.waist <= 0 ? 'success' : 'neutral'}`}>
                        Core: {currentDiffs.waist > 0 ? '+' : ''}{currentDiffs.waist.toFixed(1)} cm
                      </span>
                    )}
                    {currentDiffs.biceps !== null && (
                      <span className={`badge ${currentDiffs.biceps >= 0 ? 'primary' : 'neutral'}`}>
                        Arms: {currentDiffs.biceps > 0 ? '+' : ''}{currentDiffs.biceps.toFixed(1)} cm
                      </span>
                    )}
                  </div>

                  {achievements.length > 0 && (
                    <div className="achievements-card animate-fade">
                      <h4 className="achievements-title">Transformation Milestones ⭐️</h4>
                      {achievements.map((ach, idx) => (
                        <div key={idx} className={`achievement-item ${ach.type}`}>
                          {ach.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {viewMode === 'compare' && baseSortedData.length >= 2 && (
              <div className="view-mode-compare">
                <div className="canvas-wrapper">
                   <h4 className="avatar-label">Initial Scan <br/><small>{format(new Date(oldestData.date), 'MMM d, yy')}</small></h4>
                   <PremiumAnatomyMask scales={{ torsoX: 1, armsX: 1, legsX: 1, overallScale: 1 }} />
                </div>
                
                <div className="compare-divider">
                  <span>VS</span>
                </div>
                
                <div className="canvas-wrapper">
                   <h4 className="avatar-label">Current Scan <br/><small>{format(new Date(newestData.date), 'MMM d, yy')}</small></h4>
                   <PremiumAnatomyMask scales={currentScales} highlights={currentDiffs} />
                </div>
              </div>
            )}

            {viewMode === 'timeline' && timelineData ? (
              <div className="view-mode-timeline">
                <h3 className="timeline-date">{format(new Date(timelineData.date), 'MMMM d, yyyy')}</h3>
                
                <div className="svg-column-premium single-viewport">
                  <PremiumAnatomyMask scales={calculateScales(timelineData, oldestData).scales} />
                </div>
                
                <div className="timeline-scrubber realistic-scrubber">
                  <input 
                    type="range" 
                    min="0" 
                    max={sortedData.length - 1} 
                    value={timelineIndex} 
                    onChange={(e) => setTimelineIndex(parseInt(e.target.value))}
                    className="slider enhanced-slider"
                  />
                  <div className="slider-labels">
                    <span>{sortedData.length > 0 ? format(new Date(sortedData[0].date), 'MMM d') : ''}</span>
                    <span>{sortedData.length > 0 ? format(new Date(sortedData[sortedData.length - 1].date), 'MMM d') : ''}</span>
                  </div>
                </div>
              </div>
            ) : viewMode === 'timeline' && (!timelineData || sortedData.length === 0) ? (
               <p className="muted empty-msg">Insufficient data frames for this period.</p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
