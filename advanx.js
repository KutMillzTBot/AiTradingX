/* AdvanX - Analysis-only module
   - Non-invasive UI and API for market analysis
   - Does NOT place trades or modify execution logic
   - Usage: call AdvanX.update(data) with market snapshot objects
*/
(function(global){
  const AdvanX = {};

  // Internal state
  const state = {
    lastTimestamp: 0,
    active: false,
    smoothing: 0.12, // ema smoothing for confidence
    blendedConfidenceEMA: null,
    lastReport: null,
    modelWeights: { stat: 0.35, pattern: 0.30, regime: 0.20, anomaly: 0.15 },
    historyWindow: [],
    maxHistory: 256
  };

  // Helpers
  function clamp01(v){ return Math.max(0, Math.min(1, v)); }
  function pct(v){ return Math.round(clamp01(v)*100); }

  // 1) Market Context Detection (simple heuristics)
  function detectMarketState(data){
    // data: { ticks: [{price,ts}], volatility, market_type }
    const vol = (data.volatility == null) ? 0 : clamp01(data.volatility);
    // tick velocity: normalized by recent price changes
    let vel = 0;
    if (data.ticks && data.ticks.length >= 2){
      const recent = data.ticks.slice(-8);
      let sum = 0;
      for (let i=1;i<recent.length;i++) sum += Math.abs(recent[i].price - recent[i-1].price);
      vel = clamp01(sum / (recent[0].price||1) );
    }

    // simple anomaly heuristic: very high vol + high vel
    // Provide compatibility shims so existing `index.html` calls work with the new AdvanX API
    (function(global){
      if (!global.AdvanX) return;
      const adv = global.AdvanX;

      // Lightweight buffers for tick ingestion
      const _buf = { ticks: [], digits: [], max: 512 };

      // Mode for compatibility: 'ACCU' or 'DIGITS' or null
      let _mode = null;

      function _pushTick(t){
        if (!t || typeof t.price !== 'number') return;
        _buf.ticks.push({ price: t.price, ts: t.time || Date.now() });
        if (typeof t.digit === 'number'){
          _buf.digits.push(t.digit|0);
          if (_buf.digits.length > _buf.max) _buf.digits.shift();
        }
        if (_buf.ticks.length > _buf.max) _buf.ticks.shift();
      }

      // onTick: called by existing code per tick; we build a simple snapshot and call adv.update()
      adv.onTick = function(tick){
        try{
          _pushTick(tick);
          // Build snapshot
          const lastN = _buf.ticks.slice(-32).map(x=>({price:x.price, ts:x.ts}));
          const digitCounts = new Array(10).fill(0);
          for (const d of _buf.digits.slice(-128)) if (Number.isInteger(d) && d>=0 && d<=9) digitCounts[d]++;
          const volatility = (tick.volatility != null) ? clamp01(tick.volatility) : null;
          const snap = { ticks: lastN, volatility: volatility, digit_counts: digitCounts, barrier_sensitivity: 0, pattern_persistence: 0, ts: tick.time || Date.now() };
          adv.update(snap);
        }catch(e){ console.warn('AdvanX.onTick shim error', e); }
        return adv;
      };

      // setMode compatibility
      adv.setMode = function(m){ _mode = m; return adv; };

      adv.pushDigits = function(arr){ try{ if (!Array.isArray(arr)) return adv; for(const d of arr) if (typeof d === 'number') _buf.digits.push(d|0); return adv; }catch(e){return adv;} };

      // getState: return simplified state for older UI hooks
      adv.getState = function(){
        const rep = adv.getReport() || {};
        const ai_conf = rep.ai_confidence || {};
        return {
          confidenceScore: (ai_conf.score != null) ? (ai_conf.score/100) : 0,
          marketState: (rep.market_state || 'NEUTRAL'),
          entryBias: (ai_conf.bias || 'Neutral').toUpperCase(),
          riskFlags: (rep.model_agreement && rep.model_agreement.anomaly_risk) ? [rep.model_agreement.anomaly_risk] : [],
          mode: _mode,
          lastUpdate: (rep.header) ? Date.now() : 0
        };
      };

      adv.getBuffers = function(){ return { ticks: _buf.ticks.slice(), digits: _buf.digits.slice() }; };

      adv.clear = function(){ _buf.ticks.length = 0; _buf.digits.length = 0; _mode = null; return adv; };

      // expose clamp helper to this scope
      function clamp01(v){ return Math.max(0, Math.min(1, v)); }

    })(window);

    // Internal feeder: privately sample available globals (`tickHistory`, `appState`) and feed adv.update()
    (function(){
      if (!window.AdvanX || typeof window.AdvanX.update !== 'function') return;
      function buildAndSendSnapshot(){
        try{
          const prices = (window.tickHistory && Array.isArray(window.tickHistory)) ? window.tickHistory.slice() : (window.appState && Array.isArray(window.appState.tickBuffer) ? window.appState.tickBuffer.slice() : []);
          const maxN = 64; const recent = prices.slice(-maxN).map(p => Number(p)).filter(x=>!isNaN(x));
          const lastTickAt = (window.appState && window.appState.lastTickAt) ? Number(window.appState.lastTickAt) : Date.now();
          const ticks = recent.map((p,i)=>({ price: p, ts: Number(lastTickAt) - (recent.length - 1 - i) * 1000 }));

          // simple volatility estimate
          let vol = 0;
          if (recent.length >= 2){
            const diffs = [];
            for (let i=1;i<recent.length;i++) diffs.push(Math.abs(recent[i] - recent[i-1]));
            const mean = diffs.reduce((a,b)=>a+b,0)/diffs.length || 0;
            const variance = diffs.reduce((a,b)=>a+(b-mean)*(b-mean),0)/diffs.length || 0;
            const std = Math.sqrt(variance);
            const avgPrice = recent.reduce((a,b)=>a+b,0)/recent.length || 1;
            vol = clamp01((std / Math.max(1,avgPrice)) * 10);
          }

          // digits
          const digits = (window.appState && Array.isArray(window.appState.lastDigits)) ? window.appState.lastDigits.slice(-200) : [];
          const digit_counts = new Array(10).fill(0);
          digits.forEach(d=>{ if (Number.isInteger(d) && d>=0 && d<=9) digit_counts[d]++; });

          const snapshot = {
            ticks: ticks,
            volatility: vol,
            digit_counts: digit_counts,
            barrier_sensitivity: (window.appState && typeof window.appState.barrierSensitivity === 'number') ? Number(window.appState.barrierSensitivity) : 0,
            pattern_persistence: (window.appState && typeof window.appState.patternPersistence === 'number') ? Number(window.appState.patternPersistence) : 0,
            ts: Date.now()
          };

          window.AdvanX.update(snapshot);
        }catch(e){ /* keep silent to avoid polluting console */ }
      }

      // Run quietly in background if environment present — internal only
      try{ buildAndSendSnapshot(); setInterval(buildAndSendSnapshot, 1000); }catch(e){ }
    })();
    const out = buildOutput(marketState, models, filtered);
    state.lastReport = out;

    // Update UI if present
    try{ if (global.AdvanXUI && typeof global.AdvanXUI.render === 'function') global.AdvanXUI.render(out); }catch(e){}

    return out;
  };

  AdvanX.getReport = function(){ return state.lastReport; };

  AdvanX.reset = function(){ state.historyWindow = []; state.blendedConfidenceEMA = null; state.lastReport = null; state.active = false; };

  // expose to global
  global.AdvanX = AdvanX;
})(window);

// Minimal UI bridge (optional global) — index.html will provide AdvanXUI.render
 // AdvanX — Advanced Market Intelligence Engine (lightweight, passive analyzer)
// Exposes `window.AdvanX` with non-invasive analysis following the system prompt.
(function(){
  'use strict';
  if (window.AdvanX) return;

  const DEFAULT = {
    mode: null, // 'ACCU' or 'DIGITS'
    confidenceScore: 0,
    marketState: 'NEUTRAL',
    entryBias: 'HOLD',
    riskFlags: [],
    analysisIntegrity: 'RAW',
    lastUpdate: 0
  };

  const state = Object.assign({}, DEFAULT);

  // Internal buffers (kept short and raw only)
  const buffers = {
    ticks: [], // raw tick prices or last-digit entries, depending on mode
    digits: []
  };

  // Config
  const cfg = {
    maxTicks: 256,
    digitWindow: 100,
    minTicksForAnalysis: 3
  };

  function setMode(m){
    if (m !== 'ACCU' && m !== 'DIGITS' && m !== null) return;
    state.mode = m;
    clearBuffers();
    state.confidenceScore = 0;
    state.marketState = 'NEUTRAL';
    state.entryBias = 'HOLD';
    state.riskFlags = [];
    state.lastUpdate = Date.now();
  }

  function clearBuffers(){ buffers.ticks.length = 0; buffers.digits.length = 0; }

  // Ingest one tick (raw market data). tick should be {price: number, time: ms}
  function onTick(tick){
    try{
      if(!tick || typeof tick.price !== 'number') return;
      buffers.ticks.push({p: tick.price, t: tick.time || Date.now()});
      if (buffers.ticks.length > cfg.maxTicks) buffers.ticks.shift();
      // If DIGITS mode and tick includes digit, push to digits buffer
      if (typeof tick.digit === 'number'){
        buffers.digits.push(tick.digit|0);
        if (buffers.digits.length > cfg.digitWindow) buffers.digits.shift();
      }
      // Recompute internal state every tick when active
      if (state.mode) recompute();
    }catch(e){ console.warn('AdvanX onTick error', e); }
  }

  // Recompute analysis based only on raw buffers and the configured mode
  function recompute(){
    try{
      state.riskFlags = [];
      state.analysisIntegrity = 'RAW';
      state.lastUpdate = Date.now();
      if (state.mode === 'ACCU') return recomputeAccu();
      if (state.mode === 'DIGITS') return recomputeDigits();
      // inactive
      state.confidenceScore = 0;
      state.marketState = 'NEUTRAL';
      state.entryBias = 'HOLD';
      return;
    }catch(e){ console.warn('AdvanX recompute error', e); }
  }

  function recomputeAccu(){
    // Market structure: use tick price series
    const series = buffers.ticks.slice(-Math.max(1, cfg.minTicksForAnalysis));
    if (!series.length){ state.confidenceScore = 0; state.entryBias='HOLD'; state.marketState='NEUTRAL'; return; }

    // Compute simple directional consistency and volatility
    let up=0, down=0, changes=[];
    for (let i=1;i<series.length;i++){ const d = series[i].p - series[i-1].p; changes.push(d); if (d>0) up++; else if (d<0) down++; }
    const totalMoves = Math.max(1, up+down);
    const dirConsistency = Math.max(up,down) / totalMoves; // 0.5..1.0

    // volatility: std dev of changes
    const mean = changes.reduce((a,b)=>a+b,0)/Math.max(1,changes.length);
    const variance = changes.reduce((a,b)=>a+Math.pow(b-mean,2),0)/Math.max(1,changes.length);
    const std = Math.sqrt(variance);

    // Spike detection: large instantaneous moves relative to std
    const spike = changes.some(c=> Math.abs(c) > Math.max(1e-8, 6 * std));
    if (spike) state.riskFlags.push('VOLATILITY_SPIKE');

    // Directional decay: compare recent consistency vs earlier
    const half = Math.max(1, Math.floor(series.length/2));
    let up1=0, down1=0, up2=0, down2=0;
    for (let i=1;i<series.length;i++){
      const d = series[i].p - series[i-1].p;
      if (i<=half){ if (d>0) up1++; else if(d<0) down1++; }
      else { if (d>0) up2++; else if(d<0) down2++; }
    }
    const early = Math.max(up1,down1)/Math.max(1, up1+down1);
    const recent = Math.max(up2,down2)/Math.max(1, up2+down2);
    if (recent < early * 0.7) state.riskFlags.push('PATTERN_DECAY');

    // Confidence scoring: combine dirConsistency and low volatility
    // Map to 0..1 without clamping or forced minimums
    let raw = dirConsistency * (1/(1+std));
    if (!isFinite(raw) || raw<=0) raw = 0;
    // normalize roughly to 0..1 using a heuristic
    const score = Math.min(1, raw);
    state.confidenceScore = Number(score.toFixed(4));

    // MarketState mapping
    if (state.confidenceScore < 0.40) state.marketState='UNSTABLE';
    else if (state.confidenceScore < 0.60) state.marketState='NEUTRAL';
    else if (state.confidenceScore < 0.80) state.marketState='FAVORABLE';
    else state.marketState='STRONG';

    // Entry bias conservative mapping
    state.entryBias = state.confidenceScore >= 0.6 ? (state.confidenceScore >= 0.8 ? 'READY' : 'WAIT') : 'HOLD';
  }

  function recomputeDigits(){
    const digits = buffers.digits.slice(-cfg.digitWindow);
    if (!digits.length){ state.confidenceScore = 0; state.entryBias='HOLD'; state.marketState='NEUTRAL'; return; }

    // frequency distribution
    const counts = new Array(10).fill(0);
    for(const d of digits){ if (Number.isInteger(d) && d>=0 && d<=9) counts[d]++; }
    const total = counts.reduce((a,b)=>a+b,0) || 1;
    const freqs = counts.map(c=> c/total);

    // Over-representation detection: top freq vs expected 0.1
    const maxFreq = Math.max(...freqs);
    const meanDev = freqs.reduce((a,b)=>a+Math.abs(b-0.1),0)/10; // deviation from uniform

    // clustering detection: measure runs of repeated digits
    let maxRun = 1, curRun = 1;
    for(let i=1;i<digits.length;i++){ if (digits[i]===digits[i-1]) curRun++; else { maxRun = Math.max(maxRun, curRun); curRun = 1; } }
    maxRun = Math.max(maxRun, curRun);
    if (maxRun/digits.length > 0.25) state.riskFlags.push('FAKE_STREAK');

    // volatility in timing not available here (caller may pass timing), so keep simple

    // Confidence heuristic: prefer distributions close to uniform being low confidence; over/under patterns increase confidence but penalize clustering
    let raw = Math.max(0, (maxFreq - 0.1) * 5); // scale so small overrepresentation maps to 0..1
    raw = raw * (1 - Math.min(0.7, maxRun/digits.length));
    if (!isFinite(raw) || raw<=0) raw = 0;
    const score = Math.min(1, raw);
    state.confidenceScore = Number(score.toFixed(4));

    if (state.confidenceScore < 0.40) state.marketState='UNSTABLE';
    else if (state.confidenceScore < 0.60) state.marketState='NEUTRAL';
    else if (state.confidenceScore < 0.80) state.marketState='FAVORABLE';
    else state.marketState='STRONG';

    state.entryBias = state.confidenceScore >= 0.6 ? (state.confidenceScore >= 0.8 ? 'READY' : 'WAIT') : 'HOLD';
  }

  // Public API
  window.AdvanX = {
    init(options){ Object.assign(cfg, options||{}); return window.AdvanX; },
    setMode(mode){ setMode(mode); return window.AdvanX; },
    onTick(tick){ onTick(tick); return window.AdvanX; },
    pushDigits(arr){ try{ if(!Array.isArray(arr)) return; for(const d of arr){ if (typeof d === 'number') buffers.digits.push(d|0); if (buffers.digits.length>cfg.digitWindow) buffers.digits.shift(); } recompute(); }catch(e){} return window.AdvanX; },
    getState(){ return Object.assign({}, state); },
    getBuffers(){ return { ticks: buffers.ticks.slice(), digits: buffers.digits.slice() }; },
    clear(){ clearBuffers(); setMode(null); return window.AdvanX; }
  };

})();
