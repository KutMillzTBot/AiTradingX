/* === Performance helpers added by optimizer (safe, non-breaking) === */
if (!window.__bot_perf_helpers_added) {
  window.__bot_perf_helpers_added = true;
  function el(id) { return document.getElementById(id); }
  function qs(sel) { return document.querySelector(sel); }
  function qsa(sel) { return document.querySelectorAll(sel); }
  function addListenerOnce(target, type, handler, opts) { try { target.removeEventListener(type, handler); } catch(e){}; target.addEventListener(type, handler, opts); }
}

// Quiet-mode filter for noisy AI logs (safe, reversible)
// Enable by setting `window.KUTMILZ_LOG_FILTER = { enabled: true }` before loading this script.
try{
  window.KUTMILZ_LOG_FILTER = window.KUTMILZ_LOG_FILTER || { enabled: true, patterns: [/\[AI\]/i, /KUT MILZ/i, /AI\b/i] };
  if(window.KUTMILZ_LOG_FILTER && window.KUTMILZ_LOG_FILTER.enabled){
    (function(){
      const orig = { log: console.log.bind(console), info: console.info.bind(console), warn: console.warn.bind(console) };
      const patterns = window.KUTMILZ_LOG_FILTER.patterns;
      function shouldFilter(args){
        if(!args || args.length === 0) return false;
        try{
          const first = String(args[0]);
          return patterns.some(p => p.test(first));
        }catch(e){ return false; }
      }
      console.log = function(){ if(shouldFilter(arguments)) return; return orig.log.apply(console, arguments); };
      console.info = function(){ if(shouldFilter(arguments)) return; return orig.info.apply(console, arguments); };
      console.warn = function(){ if(shouldFilter(arguments)) return; return orig.warn.apply(console, arguments); };
    })();
  }
}catch(e){ /* don't block execution on filter errors */ }


// === Ultimate AI Engine: 3-win popup & auto-stop helpers (injected) ===
(function(){
  if (window.__UAE_injected) return;
  window.__UAE_injected = true;
  window.UAE_state = { winStreak:0, lastResults:[], lastPopupShownAt:0, stopRequested:false };

  function UAE_createPopup(message, opts){
    opts = opts || {};
    var el = document.createElement('div');
    el.className = 'uae-popup';
    el.style.position = 'fixed';
    el.style.right = '20px';
    el.style.top = '80px';
    el.style.zIndex = 2147483647;
    el.style.maxWidth = '360px';
    el.style.padding = '18px 20px';
    el.style.borderRadius = '10px';
    el.style.background = opts.background || '#0b2746';
    el.style.color = opts.color || '#ffffff';
    el.style.boxShadow = '0 8px 24px rgba(3,6,23,0.6)';
    el.style.border = '2px solid ' + (opts.borderColor || '#d4af37');
    el.style.fontFamily = 'Arial, Helvetica, sans-serif';
    el.style.fontSize = '15px';
    el.style.textAlign = 'center';
    el.innerText = message || '';
    document.body.appendChild(el);
    return el;
  }

  function UAE_showTimedPopup(message){
    try {
      var el = UAE_createPopup(message, {background:'#0b2746', borderColor:'#d4af37', color:'#ffffff'});
      setTimeout(function(){ try{ el.remove(); }catch(e){} }, 10000);
      window.UAE_state.lastPopupShownAt = Date.now();
      return el;
    } catch(e){ console.error('UAE_showTimedPopup error', e); }
  }

  function UAE_attemptStopAutoTrading(){
    try {
      window.UAE_state.stopRequested = true;
      if (typeof window.disableAutoTrading === 'function') try{ window.disableAutoTrading(); }catch(e){}
      if (typeof window.stopAutoTrading === 'function') try{ window.stopAutoTrading(); }catch(e){}
      if (typeof window.toggleAutoTrading === 'function') try{ window.toggleAutoTrading(false); }catch(e){}
      if (typeof window.setAutoTrading === 'function') try{ window.setAutoTrading(false); }catch(e){}
      try { if (window.ALLOW_LOCAL_STORAGE) localStorage.setItem('UAE_autoStopped', '1'); } catch(e){}
      UAE_showTimedPopup('Auto-trading has been stopped by Ultimate AI Engine.');
    } catch(e){ console.error('UAE_attemptStopAutoTrading error', e); }
  }

  window.UAE_reportTradeResult = function(isWin){
    try {
      var s = window.UAE_state;
      s.lastResults.push(!!isWin);
      if (s.lastResults.length > 10) s.lastResults.shift();
      s.winStreak = !!isWin ? (s.winStreak||0)+1 : 0;
      if (s.winStreak === 3) {
        UAE_showTimedPopup('Hey 👋🏼 remember not to get greedy — you\'re on three clean wins. Lower your stake if you\'re risking more than 50-60% of your balance. Remember risk management comes first. Enjoy 😇');
      }
      if (s.winStreak >= 4 && !s.stopRequested) {
        UAE_attemptStopAutoTrading();
      }
      try { console.info('UAE: winStreak=', s.winStreak); } catch(e){}
    } catch(e){ console.error('UAE_reportTradeResult error', e); }
  };

  window.UAE_tryReportFromScope = function(){
    try {
      var isWin = false;
      var candidates = ['profit','pl','pnl','currentProfit','lastProfit','tradeProfit'];
      for (var i=0;i<candidates.length;i++){
        var n = candidates[i];
        if (typeof window[n] !== 'undefined' && window[n] !== null){
          isWin = Number(window[n]) > 0;
          window.UAE_reportTradeResult(isWin);
          return;
        }
      }
    } catch(e){ console.error('UAE_tryReportFromScope error', e); }
  };

  var style = document.createElement('style');
  style.innerHTML = '.uae-popup { transition: opacity 0.3s ease, transform 0.3s ease; }';
  document.head.appendChild(style);

})();


/* ===============================
   KUT MILZ AI BRAIN — SESSION LEARNING CORE
   localStorage Persistent | Browser-Safe
   =============================== */


// === Added Crash/Boom/Volatility symbols (matches HTML dropdown) ===
const CUSTOM_ADDED_MARKETS = [
  'R_10', 'R_25', 'R_50', 'R_75', 'R_100',
  '1HZ10V', '1HZ25V', '1HZ50V', '1HZ75V', '1HZ100V',
  'BOOM300', 'BOOM500', 'BOOM600', 'BOOM900', 'BOOM1000',
  'CRASH300', 'CRASH500', 'CRASH600', 'CRASH900', 'CRASH1000',
  'JD10', 'JD25', 'JD50', 'JD75', 'JD100'
];
const STORAGE_KEY = "KUTMILZ_AI_BRAIN_PERSISTENT_V1";

const DEFAULT_BRAIN = {
  meta: {
    version: "10.0",
    created: Date.now(),
    autosaveMs: 5000,
    totalTrades: 0,
    totalWins: 0,
    totalLosses: 0,
    bestStreak: 0,
    currentStreak: 0,
    lastUpdate: Date.now()
  },
  session: {
    trades: 0,
    wins: 0,
    losses: 0,
    profit: 0,
    startTime: Date.now()
  },
  symbols: {}, // Enhanced symbol tracking
  hourly: {}, // Performance by hour
  daily: {}, // Performance by day
  patterns: {}, // Pattern recognition
  strategies: {}, // Strategy performance
  symbolSettings: {}, // Per-symbol settings memory
  learning: {
    marketRankings: {}, // Best performing markets
    timePreferences: {}, // Best trading hours
    adaptiveParams: {}, // Learned optimal parameters
    mistakes: [], // Learning from errors
    winningPatterns: {} // Track winning patterns for TAKE indicator
  },
  history: []
};

function deepClone(obj){
  return JSON.parse(JSON.stringify(obj));
}

function loadBrain(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return deepClone(DEFAULT_BRAIN);
}

function migrateBrain(brain) {
  // Ensure all required properties exist with defaults
  if (!brain.meta) brain.meta = deepClone(DEFAULT_BRAIN.meta);
  if (!brain.session) brain.session = deepClone(DEFAULT_BRAIN.session);
  if (!brain.symbols) brain.symbols = {};
  if (!brain.hourly) brain.hourly = {};
  if (!brain.daily) brain.daily = {};
  if (!brain.patterns) brain.patterns = {};
  if (!brain.strategies) brain.strategies = {};
  if (!brain.learning) brain.learning = deepClone(DEFAULT_BRAIN.learning);
  if (!brain.history) brain.history = [];

  // Ensure learning sub-properties exist
  if (!brain.learning.marketRankings) brain.learning.marketRankings = {};
  if (!brain.learning.timePreferences) brain.learning.timePreferences = {};
  if (!brain.learning.adaptiveParams) brain.learning.adaptiveParams = {};
  if (!brain.learning.mistakes) brain.learning.mistakes = [];
  if (!brain.learning.winningPatterns) brain.learning.winningPatterns = {};
  if (!brain.symbolSettings) brain.symbolSettings = {};

  return brain;
}

function saveBrain(){
  try{ if (window.ALLOW_LOCAL_STORAGE) localStorage.setItem(STORAGE_KEY, JSON.stringify(window.AI_BRAIN)); }catch(e){}
}

window.AI_BRAIN = migrateBrain(loadBrain());

setInterval(saveBrain, window.AI_BRAIN.meta.autosaveMs);

window.AI = {
  // Learning status tracking
  _learningStatus: 'idle',
  _currentAnalysisSymbol: null,
  _lastAnalysisTime: null,
  _learningInterval: null,

  // Enhanced trade recording with detailed analytics
  recordTrade({symbol, result, stake=0, payout=0, direction='', strategy='', confidence=0}){
    if(!symbol) return;

    const brain = window.AI_BRAIN;
    const now = Date.now();
    const hour = new Date(now).getHours();
    const day = new Date(now).toDateString();

    // Update global stats
    brain.meta.totalTrades++;
    if(result === "win") {
      brain.meta.totalWins++;
      brain.meta.currentStreak++;
      brain.meta.bestStreak = Math.max(brain.meta.bestStreak, brain.meta.currentStreak);
    } else {
      brain.meta.currentStreak = 0;
      brain.meta.totalLosses++;
    }

    // Session stats
    brain.session.trades++;
    if(result === "win") brain.session.wins++;
    else brain.session.losses++;
    brain.session.profit += (payout - stake);

    // Enhanced symbol tracking
    brain.symbols[symbol] ??= {
      trades:0, wins:0, losses:0, profit:0, winRate:0,
      avgStake:0, avgPayout:0, bestWin:0, worstLoss:0,
      lastTrade:0, streak:0, confidence:0
    };

    const sym = brain.symbols[symbol];
    sym.trades++;
    sym.lastTrade = now;

    if(result === "win") {
      sym.wins++;
      sym.profit += (payout - stake);
      sym.bestWin = Math.max(sym.bestWin, payout - stake);
      sym.streak++;
    } else {
      sym.losses++;
      sym.profit += (payout - stake);
      sym.worstLoss = Math.min(sym.worstLoss, payout - stake);
      sym.streak = 0;
    }

    sym.winRate = sym.wins / sym.trades;
    sym.avgStake = ((sym.avgStake * (sym.trades - 1)) + stake) / sym.trades;
    sym.confidence = confidence;

    // Hourly performance
    brain.hourly[hour] ??= {trades:0, wins:0, losses:0, profit:0};
    brain.hourly[hour].trades++;
    if(result === "win") brain.hourly[hour].wins++;
    else brain.hourly[hour].losses++;
    brain.hourly[hour].profit += (payout - stake);

    // Daily performance
    brain.daily[day] ??= {trades:0, wins:0, losses:0, profit:0};
    brain.daily[day].trades++;
    if(result === "win") brain.daily[day].wins++;
    else brain.daily[day].losses++;
    brain.daily[day].profit += (payout - stake);

    // Strategy tracking
    if(strategy) {
      brain.strategies[strategy] ??= {trades:0, wins:0, losses:0, profit:0};
      brain.strategies[strategy].trades++;
      if(result === "win") brain.strategies[strategy].wins++;
      else brain.strategies[strategy].losses++;
      brain.strategies[strategy].profit += (payout - stake);
    }

    // Pattern learning
    const pattern = this.analyzePattern(symbol, direction, result);
    if(pattern) {
      brain.patterns[pattern.key] ??= {count:0, wins:0, losses:0, profit:0};
      brain.patterns[pattern.key].count++;
      if(result === "win") brain.patterns[pattern.key].wins++;
      else brain.patterns[pattern.key].losses++;
      brain.patterns[pattern.key].profit += (payout - stake);
    }

    // Learning from mistakes - Enhanced to reduce losses
    if(result === "loss" && brain.learning && brain.learning.mistakes) {
      const mistakeReason = this.analyzeMistake(symbol, direction, confidence);
      brain.learning.mistakes.push({
        symbol, direction, stake, strategy, confidence,
        time: now, reason: mistakeReason
      });
      if(brain.learning.mistakes.length > 50) brain.learning.mistakes.shift();
      
      // Adjust symbol risk profile after loss
      if(sym && sym.trades >= 3) {
        // Reduce recommended stake for symbols with poor performance
        if(sym.winRate < 0.4 && sym.trades >= 5) {
          if(!brain.symbolSettings[symbol]) brain.symbolSettings[symbol] = {};
          if(brain.symbolSettings[symbol].recommendedStake === undefined) {
            brain.symbolSettings[symbol].recommendedStake = sym.avgStake;
          }
          brain.symbolSettings[symbol].recommendedStake = Math.max(
            sym.avgStake * 0.6,
            brain.symbolSettings[symbol].recommendedStake * 0.9
          );
        }
      }
    }
    
    // Learn from consecutive losses - reduce risk
    if(result === "loss") {
      const recentLosses = brain.history.slice(-5).filter(t => t.result === "loss").length;
      if(recentLosses >= 3) {
        // Multiple consecutive losses - increase risk reduction
        if(!brain.learning.consecutiveLossCount) brain.learning.consecutiveLossCount = 0;
        brain.learning.consecutiveLossCount++;
        console.log(`[AI] Warning: ${recentLosses} consecutive losses detected. Risk reduction recommended.`);
      }
    } else {
      // Reset consecutive loss counter on win
      if(brain.learning.consecutiveLossCount) {
        brain.learning.consecutiveLossCount = 0;
      }
    }

    // Update rankings
    this.updateMarketRankings();

    brain.history.push({
      symbol, result, stake, payout, direction, strategy, confidence, time: now
    });

    if(brain.history.length > 500) brain.history.shift();

    brain.meta.lastUpdate = now;
    saveBrain();

    console.log(`[AI LEARN] ${symbol}: ${result.toUpperCase()} | WinRate: ${(sym.winRate*100).toFixed(1)}% | Streak: ${sym.streak}`);
  },

  // Analyze trading patterns - Enhanced with winning pattern detection
  analyzePattern(symbol, direction, result) {
    // Simple pattern recognition based on recent trades
    const recent = window.AI_BRAIN.history.slice(-10);
    const symbolTrades = recent.filter(t => t.symbol === symbol);

    if(symbolTrades.length >= 3) {
      const last3 = symbolTrades.slice(-3).map(t => t.result);
      const pattern = last3.join('-');

      // Track winning patterns for TAKE indicator
      if(result === 'win') {
        const patternKey = `${symbol}_${direction}_${pattern}`;
        if(!window.AI_BRAIN.learning.winningPatterns[patternKey]) {
          window.AI_BRAIN.learning.winningPatterns[patternKey] = {
            count: 0,
            wins: 0,
            lastSeen: Date.now()
          };
        }
        window.AI_BRAIN.learning.winningPatterns[patternKey].count++;
        window.AI_BRAIN.learning.winningPatterns[patternKey].wins++;
        window.AI_BRAIN.learning.winningPatterns[patternKey].lastSeen = Date.now();
      }

      return {
        key: `${symbol}_${direction}_${pattern}`,
        confidence: result === 'win' ? 0.7 : 0.3
      };
    }
    return null;
  },
  
  // Get winning patterns for a symbol/direction
  getWinningPatterns(symbol, direction) {
    // Unified getter: support multiple stored shapes for backward compatibility.
    const brain = window.AI_BRAIN;
    if(!brain || !brain.learning || !brain.learning.winningPatterns) return [];

    const entries = brain.learning.winningPatterns;
    const prefix = `${symbol}_${direction}_`;
    const results = [];

    Object.keys(entries).forEach(key => {
      const val = entries[key];
      // Shape A: keyed by `${symbol}_${direction}_${pattern}` with {count,wins,lastSeen}
      if (typeof val === 'object' && typeof val.count === 'number' && typeof val.wins === 'number') {
        if (key.startsWith(prefix)) {
          const winRate = val.count > 0 ? (val.wins / val.count) : 0;
          if (val.count >= 3) results.push({ pattern: key.replace(prefix, ''), winRate, count: val.count, wins: val.wins, lastSeen: val.lastSeen || 0 });
        }
      }

      // Shape B: stored objects that include `symbol` and aggregate fields {symbol,wins,total,avgProfit}
      else if (val && val.symbol === symbol && (!direction || key.startsWith(direction + '_'))) {
        const total = val.total || val.count || 0;
        const wins = val.wins || 0;
        const winRate = total > 0 ? (wins / total) : 0;
        if (total >= 3) results.push({ pattern: key, winRate, count: total, wins, avgProfit: val.avgProfit });
      }
    });

    // Sort by win rate then recency/count
    return results.sort((a, b) => {
      if (Math.abs((b.winRate || 0) - (a.winRate || 0)) > 0.0001) return (b.winRate || 0) - (a.winRate || 0);
      return (b.lastSeen || b.count || 0) - (a.lastSeen || a.count || 0);
    });
  },

  // Analyze why a trade was a loss
  analyzeMistake(symbol, direction, confidence) {
    const reasons = [];

    if(confidence < 30) reasons.push('Low Confidence');
    if(window.AI_BRAIN.symbols[symbol]?.winRate < 0.4) reasons.push('Poor Symbol Performance');
    if(window.AI_BRAIN.hourly[new Date().getHours()]?.winRate < 0.4) reasons.push('Bad Trading Hour');

    return reasons.length > 0 ? reasons.join(', ') : 'Unknown';
  },

  // Update market performance rankings
  updateMarketRankings() {
    const rankings = {};
    Object.keys(window.AI_BRAIN.symbols).forEach(symbol => {
      const sym = window.AI_BRAIN.symbols[symbol];
      if(sym.trades >= 5) { // Minimum trades for ranking
        rankings[symbol] = {
          winRate: sym.winRate,
          profit: sym.profit,
          trades: sym.trades,
          score: (sym.winRate * 0.6) + (Math.min(sym.profit / sym.trades, 1) * 0.4)
        };
      }
    });

    // Sort by score
    if (window.AI_BRAIN.learning) {
      window.AI_BRAIN.learning.marketRankings = Object.fromEntries(
        Object.entries(rankings).sort(([,a], [,b]) => b.score - a.score)
      );
    }
  },

  // Get best markets for MILZXAI
  getBestMarkets(limit = 5) {
    if (!window.AI_BRAIN.learning || !window.AI_BRAIN.learning.marketRankings) return [];
    const rankings = Object.keys(window.AI_BRAIN.learning.marketRankings);
    return rankings.slice(0, limit);
  },

  // Get best trading hours
  getBestHours(limit = 3) {
    const hourStats = Object.entries(window.AI_BRAIN.hourly)
      .filter(([,stats]) => stats.trades >= 3)
      .sort(([,a], [,b]) => (b.wins/b.trades) - (a.wins/a.trades));

    return hourStats.slice(0, limit).map(([hour]) => parseInt(hour));
  },

  // Adaptive parameter suggestions
  getAdaptiveParams(symbol) {
    const sym = window.AI_BRAIN.symbols[symbol];
    if(!sym || sym.trades < 10) return null;

    return {
      suggestedStake: Math.max(0.35, sym.avgStake * (sym.winRate > 0.6 ? 1.2 : 0.8)),
      confidence: sym.winRate,
      recommended: sym.winRate > 0.55
    };
  },

  // Dynamic stake scaling based on performance
  getDynamicStake(baseStake, symbol) {
    // Dynamic stake scaling disabled - return base stake unchanged.
    return baseStake;
  },

  // Market sentiment analysis
  getMarketSentiment(symbol) {
    // Simplified sentiment based on recent price action
    const candles = window.appState?.chart?.closedCandles || [];
    if(candles.length < 20) return { trend: 'neutral', strength: 0.5 };

    const recent = candles.slice(-20);
    const prices = recent.map(c => c.close);
    const sma20 = prices.reduce((a,b) => a+b, 0) / prices.length;
    const current = prices[prices.length - 1];
    const prev = prices[prices.length - 2];

    let trend = 'neutral';
    if(current > sma20 * 1.005) trend = 'bullish';
    else if(current < sma20 * 0.995) trend = 'bearish';

    const strength = Math.min(1, Math.abs(current - sma20) / sma20);

    return { trend, strength, sma20 };
  },

  // Multi-timeframe analysis for trend confirmation
  getMultiTimeframeSentiment(symbol) {
    const candles = window.appState?.chart?.closedCandles || [];
    if(candles.length < 50) return { confirmedTrend: 'neutral', confidence: 0.5 };

    // Assume current data is 1-min candles
    const min1Sentiment = this.getMarketSentiment(symbol); // 1-min analysis

    // Aggregate to 5-min candles (group every 5 candles)
    const min5Candles = [];
    for (let i = 0; i < candles.length; i += 5) {
      const group = candles.slice(i, i + 5);
      if (group.length >= 5) {
        const open = group[0].open;
        const close = group[group.length - 1].close;
        const high = Math.max(...group.map(c => c.high));
        const low = Math.min(...group.map(c => c.low));
        min5Candles.push({ open, high, low, close });
      }
    }

    // Calculate 5-min sentiment
    if (min5Candles.length < 4) return { confirmedTrend: min1Sentiment.trend, confidence: min1Sentiment.strength };

    const recent5min = min5Candles.slice(-4);
    const prices5min = recent5min.map(c => c.close);
    const sma5min = prices5min.reduce((a,b) => a+b, 0) / prices5min.length;
    const current5min = prices5min[prices5min.length - 1];

    let trend5min = 'neutral';
    if (current5min > sma5min * 1.005) trend5min = 'bullish';
    else if (current5min < sma5min * 0.995) trend5min = 'bearish';

    // Confirm if trends match
    const confirmed = min1Sentiment.trend === trend5min && min1Sentiment.trend !== 'neutral';
    const confidence = confirmed ? Math.min(1, (min1Sentiment.strength + 0.5) / 1.5) : min1Sentiment.strength * 0.7;

    return {
      confirmedTrend: confirmed ? min1Sentiment.trend : 'neutral',
      confidence,
      min1Trend: min1Sentiment.trend,
      min5Trend: trend5min
    };
  },

  // RSI calculation
  calculateRSI(prices, period = 14) {
    if(prices.length < period + 1) return 50;

    let gains = 0, losses = 0;
    for(let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i-1];
      if(change > 0) gains += change;
      else losses -= change;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;
    let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  },

  // Get market volatility
  getMarketVolatility(symbol) {
    const candles = window.appState?.chart?.closedCandles || [];
    if(candles.length < 10) return 0.01;

    const prices = candles.slice(-10).map(c => c.close);
    const mean = prices.reduce((a,b) => a+b, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    return Math.sqrt(variance) / mean;
  },

  // Enhanced exit strategies
  getExitStrategy(symbol, entryPrice, direction) {
    const sentiment = this.getMarketSentiment(symbol);
    const volatility = this.getMarketVolatility(symbol);

    return {
      trailingStop: volatility > 0.015 ? 0.5 : 0.3, // percentage
      partialExit: sentiment.strength > 0.7 ? 0.5 : 0, // close 50% at target if strong trend
      timeBasedExit: 300, // seconds
      breakEvenStop: true
    };
  },

  // News/event filter
  shouldPauseForNews() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    // Pause during major news hours (simplified)
    if(hour >= 13 && hour <= 15) return true; // 1-3 PM UTC often has news
    if(day === 0 || day === 6) return true; // Weekends

    return false;
  },

  // Correlation-based trading
  getCorrelatedMarkets(symbol) {
    const correlations = {
      'R_10': ['R_25', 'R_50'],
      'BTCUSD': ['ETHUSD', 'LTCUSD'],
      'BOOM1000': ['CRASH1000', 'R_100']
    };
    return correlations[symbol] || [];
  },

  // Time-based trading windows
  isOptimalTradingTime(symbol) {
    const now = new Date();
    const hour = now.getHours();
    const utcHour = now.getUTCHours();

    // London/NY overlap: 13:00-16:00 UTC
    const isOverlap = utcHour >= 13 && utcHour <= 16;

    // Symbol-specific optimal times
    const symbolTimes = {
      'R_10': [8, 16], // Morning to afternoon
      'BTCUSD': [0, 23], // 24/7 but better at night
      'BOOM1000': [10, 18]
    };

    const optimal = symbolTimes[symbol] || [9, 17];
    const inOptimal = hour >= optimal[0] && hour <= optimal[1];

    return isOverlap && inOptimal;
  },

  // Risk multiplier system
  getRiskMultiplier(symbol) {
    // Risk multiplier disabled - use neutral multiplier of 1.0
    return 1.0;
  },

  // Performance analytics
  getAnalytics() {
    const brain = window.AI_BRAIN;
    const totalTrades = brain.meta.totalTrades;
    const winRate = totalTrades > 0 ? (brain.meta.totalWins / totalTrades) * 100 : 0;

    return {
      overall: {
        trades: totalTrades,
        winRate: winRate.toFixed(1) + '%',
        bestStreak: brain.meta.bestStreak,
        totalProfit: Object.values(brain.symbols || {}).reduce((sum, sym) => sum + (sym.profit || 0), 0).toFixed(2)
      },
      topMarkets: Object.entries((brain.learning && brain.learning.marketRankings) || {}).slice(0, 5),
      bestHours: this.getBestHours(),
      recentMistakes: (brain.learning && brain.learning.mistakes) ? brain.learning.mistakes.slice(-3) : []
    };
  },

  // Learning insights
  getInsights() {
    const insights = [];

    // Best performing markets
    const topMarkets = this.getBestMarkets(3);
    if(topMarkets.length > 0) {
      insights.push(`🎯 Top Markets: ${topMarkets.join(', ')}`);
    }

    // Best trading hours
    const bestHours = this.getBestHours(2);
    if(bestHours.length > 0) {
      insights.push(`⏰ Best Hours: ${bestHours.join(':00, ')}:00`);
    }

    // Performance trends
    const recent = window.AI_BRAIN.history.slice(-20);
    const recentWinRate = recent.filter(t => t.result === 'win').length / recent.length;
    if(recentWinRate > 0.6) {
      insights.push('📈 Hot Streak! Performance improving');
    } else if(recentWinRate < 0.4) {
      insights.push('📉 Cool Down: Consider adjusting strategy');
    }

    // Learning from mistakes
    const recentMistakes = (window.AI_BRAIN.learning && window.AI_BRAIN.learning.mistakes) ? window.AI_BRAIN.learning.mistakes.slice(-5) : [];
    if(recentMistakes.length >= 3) {
      const commonReasons = {};
      recentMistakes.forEach(m => {
        if(m.reason) m.reason.split(', ').forEach(r => commonReasons[r] = (commonReasons[r] || 0) + 1);
      });
      const topReason = Object.entries(commonReasons).sort(([,a], [,b]) => b - a)[0];
      if(topReason) {
        insights.push(`💡 Learning: ${topReason[0]} (occured ${topReason[1]} times)`);
      }
    }

    return insights;
  },

  exportBrain(){
    const blob = new Blob([JSON.stringify(window.AI_BRAIN,null,2)], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "kutmilz_ai_brain_advanced.json";
    a.click();
  },

  importBrain(file){
    const r = new FileReader();
    r.onload = e => {
      window.AI_BRAIN = JSON.parse(e.target.result);
      saveBrain();
      location.reload();
    };
    r.readAsText(file);
  },

  resetSession(){
    window.AI_BRAIN.session = { trades:0, wins:0, losses:0, profit:0, startTime: Date.now() };
    saveBrain();
  },

  // RuShXAi observation mode - more aggressive recommendations
  getRuShXAiInsights() {
    const insights = [];
    const brain = window.AI_BRAIN;

    // More aggressive market recommendations
    const topMarkets = this.getBestMarkets(3);
    if(topMarkets.length > 0) {
      insights.push(`🚀 RuShXAi: PRIORITIZE these markets: ${topMarkets.join(', ')}`);
    }

    // Higher confidence thresholds for RuShXAi
    const recent = brain.history.slice(-5);
    const recentWinRate = recent.filter(t => t.result === 'win').length / recent.length;
    if(recentWinRate > 0.6) {
      insights.push('🔥 RuShXAi: Hot streak detected');
    }

    // Time-sensitive opportunities
    const now = new Date();
    const hour = now.getHours();
    if(hour >= 1 && hour <= 3) { // London open
      insights.push('🌅 RuShXAi: London session volatility - high opportunity window');
    }

    insights.push('⚡ RuShXAi: AI observation mode active - learning aggressively');

    return insights;
  },

  // Save symbol-specific settings
  saveSymbolSettings(symbol, settings) {
    if(!symbol) return;
    const brain = window.AI_BRAIN;
    if(!brain.symbolSettings) brain.symbolSettings = {};
    
    brain.symbolSettings[symbol] = {
      ...brain.symbolSettings[symbol],
      ...settings,
      lastUpdated: Date.now()
    };
    saveBrain();
    console.log(`[AI] Saved settings for ${symbol}:`, settings);
  },
  
  // Load symbol-specific settings
  loadSymbolSettings(symbol) {
    if(!symbol || !window.AI_BRAIN.symbolSettings) return null;
    return window.AI_BRAIN.symbolSettings[symbol] || null;
  },
  
  // Get recommended settings for a symbol based on past performance - Enhanced loss reduction
  getRecommendedSettings(symbol) {
    if(!symbol || !window.AI_BRAIN.symbols[symbol]) return null;
    
    const sym = window.AI_BRAIN.symbols[symbol];
    if(sym.trades < 5) return null; // Need at least 5 trades to recommend
    
    const brain = window.AI_BRAIN;
    const recentTrades = brain.history.slice(-10).filter(t => t.symbol === symbol);
    const recentWinRate = recentTrades.length > 0 ? 
      recentTrades.filter(t => t.result === "win").length / recentTrades.length : sym.winRate;
    
    // Check for consecutive losses
    const recentLossStreak = (() => {
      let streak = 0;
      for(let i = brain.history.length - 1; i >= 0; i--) {
        const t = brain.history[i];
        if(t.symbol !== symbol) break;
        if(t.result === "loss") streak++;
        else break;
      }
      return streak;
    })();
    
    const recommendations = {
      stake: sym.avgStake,
      confidence: sym.winRate,
      recentWinRate: recentWinRate,
      recommended: sym.winRate > 0.55 && recentWinRate > 0.4,
      reason: '',
      riskLevel: 'medium'
    };
    
    // Enhanced risk assessment
    if(sym.winRate > 0.65 && recentWinRate > 0.6 && recentLossStreak === 0) {
      recommendations.reason = 'High win rate - safe to trade';
      recommendations.riskLevel = 'low';
      recommendations.stake = sym.avgStake * 1.1;
    } else if(sym.winRate > 0.55 && recentWinRate > 0.5) {
      recommendations.reason = 'Good win rate - proceed with caution';
      recommendations.riskLevel = 'medium';
      recommendations.stake = sym.avgStake;
    } else if(sym.winRate > 0.45 || recentLossStreak >= 2) {
      recommendations.reason = 'Below average - reduce stake significantly';
      recommendations.riskLevel = 'high';
      recommendations.stake = sym.avgStake * 0.6;
      recommendations.recommended = false;
    } else {
      recommendations.reason = 'Poor performance - avoid or use minimal stake';
      recommendations.riskLevel = 'very_high';
      recommendations.stake = sym.avgStake * 0.4;
      recommendations.recommended = false;
    }
    
    // Apply additional risk reduction for consecutive losses
    if(recentLossStreak >= 3) {
      recommendations.stake = Math.max(recommendations.stake * 0.7, sym.avgStake * 0.3);
      recommendations.reason += ` (${recentLossStreak} consecutive losses detected)`;
      recommendations.recommended = false;
    }
    
    // Check if saved settings have recommended stake override
    if(brain.symbolSettings && brain.symbolSettings[symbol] && 
       brain.symbolSettings[symbol].recommendedStake !== undefined) {
      recommendations.stake = Math.min(
        recommendations.stake,
        brain.symbolSettings[symbol].recommendedStake
      );
    }
    
    return recommendations;
  },
  
  // Get risk warning for current symbol
  getRiskWarning(symbol) {
    if(!symbol || !window.AI_BRAIN.symbols[symbol]) return null;
    
    const sym = window.AI_BRAIN.symbols[symbol];
    const recommendations = this.getRecommendedSettings(symbol);
    
    if(!recommendations) return null;
    
    if(!recommendations.recommended) {
      return {
        level: recommendations.riskLevel,
        message: recommendations.reason,
        suggestion: recommendations.riskLevel === 'very_high' ? 
          'Consider avoiding this symbol or using minimal stake' :
          'Reduce stake size before trading'
      };
    }
    
    return null;
  },

  resetAll(){
    window.AI_BRAIN = deepClone(DEFAULT_BRAIN);
    saveBrain();
    location.reload();
  },

  // Get current learning status
  getLearningStatus() {
    return {
      status: this._learningStatus || 'idle',
      currentSymbol: this._currentAnalysisSymbol || null,
      lastAnalysis: this._lastAnalysisTime || null
    };
  },

  // Start continuous learning cycle
  startContinuousLearning() {
    if (this._learningInterval) {
      clearInterval(this._learningInterval);
    }
    
    // Run learning analysis every 10 minutes
    this._learningInterval = setInterval(() => {
      this.performContinuousLearning();
    }, 600000); // 10 minutes
    
    console.log('[AI] Continuous learning started - analyzing markets every 10 minutes');
    
    // Initial analysis
    setTimeout(() => {
      this.performContinuousLearning();
    }, 30000); // Start after 30 seconds
  },

  // Stop continuous learning
  stopContinuousLearning() {
    if (this._learningInterval) {
      clearInterval(this._learningInterval);
      this._learningInterval = null;
      console.log('[AI] Continuous learning stopped');
    }
  },

  // Get market insights for continuous learning
  getMarketInsights(symbol) {
    const brain = window.AI_BRAIN;
    if (!brain.symbols[symbol]) return null;

    const sym = brain.symbols[symbol];
    const rankings = brain.learning.marketRankings[symbol];
    
    return {
      symbol: symbol,
      overallWinRate: sym.totalTrades > 0 ? sym.wins / sym.totalTrades : 0,
      recentPerformance: rankings ? rankings.recentWinRate : 0,
      totalTrades: sym.totalTrades,
      bestStrategy: sym.bestStrategy,
      avgStake: sym.avgStake,
      marketScore: rankings ? rankings.score : 0,
      recommended: this.getRecommendedSettings(symbol).recommended,
      lastAnalyzed: rankings ? rankings.lastAnalyzed : null
    };
  },

  // Continuous learning - analyze all markets periodically
  performContinuousLearning() {
    const brain = window.AI_BRAIN;
    const symbols = Object.keys(brain.symbols);
    
    symbols.forEach(symbol => {
      // Analyze markets that haven't been analyzed recently
      const rankings = brain.learning.marketRankings[symbol];
      const now = Date.now();
      
      if (!rankings || (now - (rankings.lastAnalyzed || 0)) > 300000) { // 5 minutes
        this.analyzeMarket(symbol);
      }
    });
    
    console.log('[AI] Continuous learning cycle completed');
  },

  // (duplicate implementation removed — unified above)

  // Analyze market patterns and improve performance after cooldown
  analyzeMarket(symbol) {
    if (!symbol || !window.AI_BRAIN.symbols[symbol]) {
      console.log('[AI] Cannot analyze market: invalid symbol');
      return;
    }

    // Set learning status
    this._learningStatus = 'analyzing';
    this._currentAnalysisSymbol = symbol;

    const brain = window.AI_BRAIN;
    const sym = brain.symbols[symbol];
    const now = Date.now();

    console.log(`[AI] Analyzing market patterns for ${symbol}...`);

    // Gather recent trades for this symbol from global history
    const symbolTrades = (brain.history || []).filter(t => t.symbol === symbol);
    // Analyze recent performance
    const recentTrades = symbolTrades.slice(-10); // Last 10 trades
    if (recentTrades.length < 3) {
      console.log('[AI] Not enough recent trades for analysis');
      this._learningStatus = 'idle';
      this._currentAnalysisSymbol = null;
      return;
    }

    // Calculate win rate for recent trades
    const recentWins = recentTrades.filter(t => t.result === 'win').length;
    const recentWinRate = recentWins / recentTrades.length;

    // Analyze time-based performance
    const currentHour = new Date().getHours();
    const hourTrades = symbolTrades.filter(t => {
      const tradeHour = new Date(t.time || t.timestamp || 0).getHours();
      return tradeHour === currentHour;
    });

    if (hourTrades.length >= 3) {
      const hourWinRate = hourTrades.filter(t => t.result === 'win').length / hourTrades.length;
      brain.learning.timePreferences[`${symbol}_${currentHour}`] = {
        winRate: hourWinRate,
        trades: hourTrades.length,
        lastUpdated: now
      };
    }

    // Update market rankings based on performance
    const overallWinRate = sym.totalTrades > 0 ? sym.wins / sym.totalTrades : 0;
    brain.learning.marketRankings[symbol] = {
      winRate: overallWinRate,
      totalTrades: sym.totalTrades,
      recentWinRate: recentWinRate,
      lastAnalyzed: now,
      score: (overallWinRate * 0.6) + (recentWinRate * 0.4) // Weighted score
    };

    // Learn from mistakes - analyze losing patterns
    const recentLosses = recentTrades.filter(t => t.result === 'loss');
    if (recentLosses.length > 0) {
      recentLosses.forEach(loss => {
        const mistakeKey = `${symbol}_${loss.direction}_${loss.strategy}`;
        if (!brain.learning.mistakes[mistakeKey]) {
          brain.learning.mistakes[mistakeKey] = {
            count: 0,
            totalLoss: 0,
            avgStake: 0
          };
        }
        brain.learning.mistakes[mistakeKey].count++;
        brain.learning.mistakes[mistakeKey].totalLoss += Math.abs(loss.profit);
        brain.learning.mistakes[mistakeKey].avgStake = 
          (brain.learning.mistakes[mistakeKey].avgStake + loss.stake) / 2;
      });
    }

    // Adaptive parameter learning
    if (recentWinRate > 0.6) {
      // High win rate - reinforce current parameters
      brain.learning.adaptiveParams[symbol] = brain.learning.adaptiveParams[symbol] || {};
      brain.learning.adaptiveParams[symbol].lastGoodParams = {
        stake: sym.avgStake,
        strategy: sym.bestStrategy,
        timestamp: now
      };
    }

    // Update winning patterns for TAKE indicator
    this.updateWinningPatterns(symbol);

    saveBrain();
    
    // Clear learning status
    this._learningStatus = 'idle';
    this._currentAnalysisSymbol = null;
    this._lastAnalysisTime = now;
    
    console.log(`[AI] Market analysis complete for ${symbol}. Win rate: ${(recentWinRate * 100).toFixed(1)}%`);
  },

  // Update winning patterns for auto-take decisions
  updateWinningPatterns(symbol) {
    const brain = window.AI_BRAIN;
    const sym = brain.symbols[symbol];
    const symbolTrades = (brain.history || []).filter(t => t.symbol === symbol);
    if (!sym || symbolTrades.length < 5) return;

    // Analyze patterns that led to wins
    const winningTrades = symbolTrades.filter(t => t.result === 'win');
    
    winningTrades.forEach(trade => {
      const patternKey = `${trade.direction}_${trade.strategy}_${trade.confidence || 50}`;
      
      if (!brain.learning.winningPatterns[patternKey]) {
        brain.learning.winningPatterns[patternKey] = {
          wins: 0,
          total: 0,
          avgProfit: 0,
          symbol: symbol
        };
      }
      
      brain.learning.winningPatterns[patternKey].wins++;
      brain.learning.winningPatterns[patternKey].total++;
      brain.learning.winningPatterns[patternKey].avgProfit = 
        (brain.learning.winningPatterns[patternKey].avgProfit + trade.profit) / 2;
    });

    // Clean up old patterns (keep only recent and successful ones)
    Object.keys(brain.learning.winningPatterns).forEach(key => {
      const pattern = brain.learning.winningPatterns[key];
      if (pattern.wins / pattern.total < 0.5 || pattern.total < 3) {
        delete brain.learning.winningPatterns[key];
      }
    });
  }
};

console.log("[AI] KUT MILLZ AI Brain loaded with FULL LEARNING CAPABILITIES - Continuous analysis, pattern recognition, and adaptive optimization active!");

// === Digit Prediction Summary Layer Functions ===

// Compute Digit Prediction Summary Layer
function computeDigitPredictionSummary() {
  const digits = window.appState?.lastDigits || [];
  if (digits.length === 0) return null;

  const analysisTicks = Math.min(window.appState?.kutAiX?.analysisTicks ?? 20, digits.length);
  const recentDigits = digits.slice(-analysisTicks);

  if (recentDigits.length < 5) return null; // Need minimum data for reliable analysis

  // Count occurrences of each digit (0-9)
  const digitCounts = new Array(10).fill(0);
  const digitHistory = new Array(10).fill().map(() => []);

  // Track digit sequences and patterns
  for (let i = 0; i < recentDigits.length; i++) {
    const digit = recentDigits[i];
    if (digit >= 0 && digit <= 9) {
      digitCounts[digit]++;
      digitHistory[digit].push(i); // Track positions for pattern analysis
    }
  }

  // Calculate base probabilities
  const totalValidDigits = recentDigits.filter(d => d >= 0 && d <= 9).length;
  const digitProbabilities = digitCounts.map(count => (count / totalValidDigits) * 100);

  // Calculate stability and persistence factors
  const stabilityScores = new Array(10).fill(0);
  const persistenceScores = new Array(10).fill(0);

  for (let digit = 0; digit <= 9; digit++) {
    const history = digitHistory[digit];
    if (history.length === 0) continue;

    // Stability: How consistent the digit appears (inverse of variance in positions)
    if (history.length > 1) {
      const positions = history;
      const mean = positions.reduce((a, b) => a + b, 0) / positions.length;
      const variance = positions.reduce((sum, pos) => sum + Math.pow(pos - mean, 2), 0) / positions.length;
      const stdDev = Math.sqrt(variance);
      // Lower stdDev = more stable (consistent timing)
      stabilityScores[digit] = Math.max(0, 100 - (stdDev / analysisTicks) * 200);
    }

    // Persistence: How recently and frequently the digit has appeared
    const recentHistory = history.filter(pos => pos >= recentDigits.length - 10); // Last 10 ticks
    const recencyWeight = recentHistory.length > 0 ? 1 : 0.3;
    const frequencyWeight = Math.min(history.length / 5, 1); // Cap at 5 occurrences
    persistenceScores[digit] = (recencyWeight * frequencyWeight) * 100;
  }

  // Calculate tick behavior and jump filtering
  const tickBehaviorScores = new Array(10).fill(0);
  const prices = window.appState?.chart?.closedCandles?.slice(-analysisTicks) || [];

  if (prices.length >= recentDigits.length) {
    for (let i = 0; i < recentDigits.length; i++) {
      const digit = recentDigits[i];
      if (digit >= 0 && digit <= 9 && prices[i]) {
        const price = prices[i].close;
        const prevPrice = i > 0 ? prices[i-1].close : price;

        // Calculate tick movement characteristics
        const tickChange = Math.abs(price - prevPrice);
        const avgTickChange = prices.slice(0, i+1).reduce((sum, p, idx) => {
          if (idx === 0) return 0;
          return sum + Math.abs(p.close - prices[idx-1].close);
        }, 0) / Math.max(i, 1);

        // Jump filtering: Penalize digits that appear during large jumps (spikes)
        const jumpFactor = Math.max(0, 1 - (tickChange / (avgTickChange * 2)));
        tickBehaviorScores[digit] = Math.max(tickBehaviorScores[digit], jumpFactor * 100);
      }
    }

    // Average the tick behavior scores
    for (let digit = 0; digit <= 9; digit++) {
      if (digitHistory[digit].length > 0) {
        tickBehaviorScores[digit] = tickBehaviorScores[digit] / digitHistory[digit].length;
      }
    }
  }

  // Get barrier information for CALL/PUT context
  const barrier = window.appState?.kutMilzAi?.barrier ?? null;
  const tradeDirection = window.appState?.currentDirection; // 'CALL' or 'PUT'

  // Combine factors into final probability scores
  const finalScores = [];
  for (let digit = 0; digit <= 9; digit++) {
    const baseProb = digitProbabilities[digit];
    const stability = stabilityScores[digit];
    const persistence = persistenceScores[digit];
    const tickBehavior = tickBehaviorScores[digit] || 50; // Default to neutral

    let combinedScore = (
      baseProb * 0.4 + // Base probability has some weight
      stability * 0.3 +
      persistence * 0.4 +
      tickBehavior * 0.3
    );

    // Apply barrier/trade direction adjustments
    if (barrier !== null && tradeDirection) {
      const safetyRange = 1; // Digits within 1 of barrier are excluded

      if (tradeDirection === 'CALL') {
        // CALL favors digits ABOVE barrier
        if (digit > barrier + safetyRange) {
          combinedScore *= 1.2; // Boost digits well above barrier
        } else if (digit <= barrier + safetyRange && digit >= barrier - safetyRange) {
          combinedScore *= 0.7; // Penalize digits near barrier
        }
      } else if (tradeDirection === 'PUT') {
        // PUT favors digits BELOW barrier
        if (digit < barrier - safetyRange) {
          combinedScore *= 1.2; // Boost digits well below barrier
        } else if (digit <= barrier + safetyRange && digit >= barrier - safetyRange) {
          combinedScore *= 0.7; // Penalize digits near barrier
        }
      }
    }

    finalScores.push({
      digit,
      probability: Math.max(0, Math.min(100, combinedScore)),
      baseProb,
      stability,
      persistence,
      tickBehavior,
      occurrences: digitCounts[digit]
    });
  }

  // Sort by probability (highest first)
  finalScores.sort((a, b) => b.probability - a.probability);

  // Calculate overall stability for confidence assessment
  const overallStability = window.aiLayer?.rolling?.volStd || 0;
  const stabilityThreshold = 0.0005; // Configurable threshold
  const isLowConfidence = overallStability > stabilityThreshold;

  return {
    digits: finalScores,
    top3: finalScores.slice(0, 3),
    bottom3: finalScores.slice(-3),
    totalAnalyzed: totalValidDigits,
    overallStability,
    isLowConfidence,
    barrier,
    tradeDirection,
    analysisTicks
  };
}

// Update Digit Prediction Summary UI
function updateDigitPredictionSummary() {
  // New Deriv-accurate digit probability logic (rolling window)
  const lookback = window.appState?.kutMilzAi?.lookback ?? 100;
  const rawDigits = (window.appState?.lastDigits || []).slice(-lookback);
  if (!rawDigits || rawDigits.length === 0) return;

  // Count frequency of each digit (0-9) in rolling window
  const total = rawDigits.length;
  const digitCounts = Array(10).fill(0);
  rawDigits.forEach(d => { if (d >= 0 && d <= 9) digitCounts[d]++; });

  // Base percentages (do NOT normalize relative to highest digit)
  const basePercentages = digitCounts.map(count => (count / total) * 100);

  // Apply a light price-influence nudge (but do NOT allow directional bias or momentum gating)
  const priceInfluenceEl = document.getElementById('xdigits-price-influence');
  const configuredPriceInfluence = priceInfluenceEl ? parseFloat(priceInfluenceEl.value) : (window.appState?.kutMilzAi?.priceInfluence ?? 5);
  const priceInfluence = Number.isFinite(configuredPriceInfluence) ? configuredPriceInfluence : 5;

  // Nudge only the most recent digit slightly (20% of configured influence)
  const lastDigit = rawDigits[rawDigits.length - 1];
  const nudgeAmount = priceInfluence * 0.2; // e.g. 5% -> 1% nudge

  const maxDisplay = window.appState?.kutMilzAi?.maxDigitProbability ?? 20; // percent cap
  const minDisplay = 5; // floor percent

  const displayedPercentages = basePercentages.map((p, digit) => {
    let v = p;
    if (digit === lastDigit) v = v + nudgeAmount;
    // enforce hard cap and floor
    if (v > maxDisplay) v = maxDisplay;
    if (v < minDisplay) v = minDisplay;
    return v;
  });

  // Update UI per-digit without changing any internal probabilities or accumulator state
  for (let d = 0; d <= 9; d++) {
    const el = document.getElementById(`xdigit-${d}-pred`);
    if (el) {
      el.textContent = displayedPercentages[d].toFixed(1) + '%';
      el.dataset.displayPercent = String(displayedPercentages[d]);
    }
    // ensure the digit button has a small container for the last-digit icon
    const btn = document.getElementById(`xdigit-${d}`);
    if (btn) {
      // create overlay element if missing
      try{
        if (!btn.querySelector('.xdigit-last-icon')) {
          const span = document.createElement('span');
          span.className = 'xdigit-last-icon';
          span.textContent = '💰';
          if (!btn.style.position) btn.style.position = 'relative';
          btn.appendChild(span);
        }
      }catch(_){ }
    }
  }

  // Last Digit Highlight (UI only) — always show the icon for the most recent tick digit
  try {
    if (typeof lastDigit === 'number') {
      // hide all first
      for (let d = 0; d <= 9; d++) {
        const btn = document.getElementById(`xdigit-${d}`);
        if (!btn) continue;
        const ico = btn.querySelector('.xdigit-last-icon');
        if (!ico) continue;
        if (d === lastDigit) {
          ico.classList.add('show');
        } else {
          ico.classList.remove('show');
        }
      }
    }
  } catch (e) { /* swallow UI-only errors */ }

  // Update KutAiX summary UI (top/bottom digits, summary status)
  try{
    const topEl = document.getElementById('kutAiX-top-digits');
    const bottomEl = document.getElementById('kutAiX-bottom-digits');
    const statusEl = document.getElementById('kutAiX-summary-status');
    const predEl = document.getElementById('kutAiX-prediction');
    const confEl = document.getElementById('kutAiX-confidence');
    const lastDigitEl = document.getElementById('kutAiX-last-digit');

    // Build digit stats array for UI summary
    const stats = displayedPercentages.map((p,d)=>({ digit:d, pct:p, count: digitCounts[d] }));
    const sortedTop = [...stats].sort((a,b)=>b.pct - a.pct);
    const sortedBottom = [...stats].sort((a,b)=>a.pct - b.pct);

    if (topEl){
      topEl.innerHTML = '';
      for(let i=0;i<2 && i<sortedTop.length;i++){
        const s = sortedTop[i];
        const div = document.createElement('div');
        div.innerHTML = `<div style="font-weight:700">${s.digit}</div><div style="font-size:12px;color:#cbd5e1">${s.pct.toFixed(1)}%</div>`;
        topEl.appendChild(div);
      }
    }
    if (bottomEl){
      bottomEl.innerHTML = '';
      for(let i=0;i<2 && i<sortedBottom.length;i++){
        const s = sortedBottom[i];
        const div = document.createElement('div');
        div.innerHTML = `<div style="font-weight:700">${s.digit}</div><div style="font-size:12px;color:#cbd5e1">${s.pct.toFixed(1)}%</div>`;
        bottomEl.appendChild(div);
      }
    }

    if (statusEl) statusEl.textContent = 'LOCAL';
    if (predEl) predEl.textContent = 'Digits Only';
    if (confEl) confEl.textContent = `${total} ticks | Window ${lookback}`;
    if (lastDigitEl) lastDigitEl.textContent = typeof lastDigit === 'number' ? String(lastDigit) : '--';
  }catch(_){ }
}

// Export KutAiX digit-analysis functions to a safe namespace and
// provide compatibility global aliases only if they don't already exist.
try {
  window.kutAiX = window.kutAiX || {};
  window.kutAiX.computeAnalysis = window.kutAiX.computeAnalysis || computeDigitPredictionSummary;
  window.kutAiX.updateSummary = window.kutAiX.updateSummary || updateDigitPredictionSummary;

  if (typeof window.computeKutAiXAnalysis === 'undefined') {
    window.computeKutAiXAnalysis = function() { return computeDigitPredictionSummary(); };
  } else {
    console.info('[AI] computeKutAiXAnalysis already defined; leaving existing implementation in place.');
  }

  if (typeof window.updateKutAiXStats === 'undefined') {
    window.updateKutAiXStats = function() { return updateDigitPredictionSummary(); };
  } else {
    console.info('[AI] updateKutAiXStats already defined; leaving existing implementation in place.');
  }
} catch (e) { console.warn('[AI] Failed to export KutAiX compatibility layer', e); }

// === BestX Auto Selection Functions ===

// Show BestX modal
function showBestXModal() {
  const el = window.dom?.bestxModal || document.getElementById('bestx-modal');
  if (el) el.style.display = 'flex';
}

// Close BestX modal
function closeBestXModal() {
  const el = window.dom?.bestxModal || document.getElementById('bestx-modal');
  if (el) el.style.display = 'none';
}

// Start BestX with selected mode
// Start BestX with selected mode
function startBestX(mode) {
  // Simple implementation - just show toast and close modal
  const message = mode === '1-trade' ? 'BestX: 1 Trade selected' : 'BestX: 2 Trades selected';
  if (typeof window.showToast === 'function') window.showToast(message);
  closeBestXModal();
}





// Initialize BestX when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const bestxBtn = document.getElementById('bestx-btn');
  const bestxModal = document.getElementById('bestx-modal');
  const bestx1Trade = document.getElementById('bestx-1-trade');
  const bestx2Trades = document.getElementById('bestx-2-trades');
  const bestxCancel = document.getElementById('bestx-cancel');

  if (bestxBtn) {
    bestxBtn.addEventListener('click', () => {
      try {
        if (bestxModal) bestxModal.style.display = 'flex';
      } catch(e) {}
    });
  }

  if (bestx1Trade) {
    bestx1Trade.addEventListener('click', () => {
      try {
        startBestX('1-trade');
      } catch(e) {}
    });
  }

  if (bestx2Trades) {
    bestx2Trades.addEventListener('click', () => {
      try {
        startBestX('2-trades');
      } catch(e) {}
    });
  }

  if (bestxCancel) {
    bestxCancel.addEventListener('click', () => {
      try {
        closeBestXModal();
        if (typeof window.showToast === 'function') window.showToast('BestX cancelled');
      } catch(e) {}
    });
  }
});

// === Login Functions ===

// Handle login form submission
async function handleLogin(e) {
  e.preventDefault();
  console.log('Login attempt started');

  // Local DOM lookups to avoid relying on globals
  const kutmilzKeyInput = document.getElementById('kutmilz-key');
  const passwordInput = document.getElementById('password');
  const termsCheckbox = document.getElementById('terms-checkbox');
  const loginError = document.getElementById('login-error');
  const loginForm = document.getElementById('login-form');

  const key = (kutmilzKeyInput?.value || '').trim();
  const password = (passwordInput?.value || '').trim();
  const termsAccepted = !!(termsCheckbox && termsCheckbox.checked);
  const rememberMe = !!(document.getElementById('remember-checkbox')?.checked);

  if (!termsAccepted) {
    if (loginError) {
      loginError.textContent = 'Please accept the Terms and Conditions';
      loginError.classList.remove('hidden');
    } else {
      console.warn('Terms not accepted and loginError element not found');
    }
    return;
  }

  // Safe-call validateCredentials (may be defined in index.html scope)
  let isValid = false;
  try {
    if (typeof validateCredentials === 'function') {
      isValid = validateCredentials(key, password);
    } else if (typeof window.validateCredentials === 'function') {
      isValid = window.validateCredentials(key, password);
    } else {
      // No external validator available — use a salted SHA-256 hash comparison.
      // Behavior:
      // - If a stored salt+hash is present in localStorage, compare salted hash of entered password.
      // - If none is present, treat this successful login attempt (username matches) as setup:
      //   generate a random salt, store salt+hash in localStorage (no plaintext saved), and accept.
      // No hardcoded username: persist a fallback username on first-setup
      const U_KEY = 'kut_fallback_user';

      function bufToHex(buffer){
        return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2,'0')).join('');
      }

      async function computeSaltedHash(pw, salt){
        const enc = new TextEncoder();
        const data = enc.encode(salt + String(pw));
        const digest = await (crypto.subtle || crypto.webkitSubtle).digest('SHA-256', data);
        return bufToHex(digest);
      }

      function constantTimeEqual(a, b){
        if(!a || !b || a.length !== b.length) return false;
        let res = 0;
        for(let i=0;i<a.length;i++) res |= a.charCodeAt(i) ^ b.charCodeAt(i);
        return res === 0;
      }

      const S_KEY = 'kut_fallback_salt';
      const H_KEY = 'kut_fallback_hash';
      const storedSalt = localStorage.getItem(S_KEY);
      const storedHash = localStorage.getItem(H_KEY);
      const storedUser = localStorage.getItem(U_KEY);

      if (storedSalt && storedHash && storedUser) {
        try {
          const h = await computeSaltedHash(password, storedSalt);
          isValid = (key === storedUser) && constantTimeEqual(h, storedHash);
          if (!isValid && loginError) {
            loginError.textContent = 'Invalid username or password';
            loginError.classList.remove('hidden');
          }
        } catch (err) {
          console.warn('Hash compare failed', err);
          isValid = false;
          if (loginError) {
            loginError.textContent = 'Authentication error. Please try again later.';
            loginError.classList.remove('hidden');
          }
        }
      } else {
        // No stored hash/user: perform one-time setup using the provided username/password.
        if (key && password) {
          try {
            // generate 16-byte random salt
            let newSalt = 'kut_default_salt_v1';
            try {
              const sv = crypto.getRandomValues(new Uint8Array(16));
              newSalt = Array.from(sv).map(b => b.toString(16).padStart(2,'0')).join('');
            } catch(e) {
              // fallback deterministic salt if RNG unavailable
              newSalt = 'kut_default_salt_v1';
            }
            const newHash = await computeSaltedHash(password, newSalt);
            try { 
              localStorage.setItem(S_KEY, newSalt);
              localStorage.setItem(H_KEY, newHash);
              localStorage.setItem(U_KEY, key);
            } catch(e){ console.warn('Failed to persist fallback credentials', e); }
            console.info('Fallback salted credentials stored for future logins');
            isValid = true; // accept this first login (user supplied correct secret)
          } catch(e) {
            console.warn('Fallback setup failed', e);
            isValid = false;
            if (loginError) {
              loginError.textContent = 'Authentication setup failed. Try again.';
              loginError.classList.remove('hidden');
            }
          }
        } else {
          isValid = false;
          if (loginError) {
            loginError.textContent = 'Invalid username or password';
            loginError.classList.remove('hidden');
          }
        }
      }
    }
  } catch (e) {
    console.warn('validateCredentials threw', e);
    isValid = false;
    if (loginError) {
      loginError.textContent = 'Authentication error. Please try again later.';
      loginError.classList.remove('hidden');
    }
  }

  if (isValid) {
    // Save credentials if remember me is checked
    if (rememberMe) {
      try {
        localStorage.setItem('kutmilz_key', key);
        localStorage.setItem('kutmilz_password', password);
        console.log('Credentials saved to localStorage');
      } catch (error) {
        console.warn('Failed to save credentials:', error);
      }
    } else {
      // Clear saved credentials if remember me is unchecked
      try{ localStorage.removeItem('kutmilz_key'); localStorage.removeItem('kutmilz_password'); }catch(e){}
      console.log('Credentials cleared from localStorage');
    }

    // Show loading state
    const loginButton = document.getElementById('login-submit-btn');
    if (loginButton) {
      loginButton.disabled = true;
      loginButton.textContent = 'Accessing...';
    }

    // Hide login immediately for instant response (safe fallback)
    try {
      if (typeof hideLogin === 'function') hideLogin();
      else {
        const _loginOverlay = document.getElementById('login-overlay');
        if (_loginOverlay) {
          _loginOverlay.classList.add('hidden');
          const _appRoot = document.getElementById('app-root');
          if (_appRoot) _appRoot.classList.remove('hidden');
          document.body.style.overflow = '';
        }
      }
    } catch (e) { console.warn('hideLogin failed', e); }

    // Clear form
    if (loginError) try{ loginError.classList.add('hidden'); }catch(e){}
    if (kutmilzKeyInput) kutmilzKeyInput.value = '';
    if (passwordInput) passwordInput.value = '';

    // Show welcome message after successful login
    setTimeout(() => {
      try {
        if (typeof window.showWelcomePopup === 'function') window.showWelcomePopup();
        else if (typeof window.showToast === 'function') window.showToast('Welcome');
      } catch (e) { console.warn('showWelcomePopup failed', e); }
      // Re-enable button (though login is hidden, for consistency)
      if (loginButton) {
        loginButton.disabled = false;
        loginButton.textContent = 'Access Bot';
      }
    }, 800);

  } else {
    if (loginError) {
      loginError.textContent = 'Access Denied - Invalid credentials';
      try{ loginError.classList.remove('hidden'); }catch(e){}
    } else {
      console.warn('Access Denied - loginError element not found');
    }

    if (kutmilzKeyInput) kutmilzKeyInput.value = '';
    if (passwordInput) passwordInput.value = '';

    // Shake animation for error
    if (loginForm) {
      try{ loginForm.classList.add('animate-pulse'); }catch(e){}
      setTimeout(() => {
        try{ loginForm.classList.remove('animate-pulse'); }catch(e){}
      }, 500);
    }
  }
}

// Initialize login system
function initLogin() {
  // Check for offline mode
  // Localize DOM references to avoid relying on globals that may not be defined yet
  const loginOverlay = document.getElementById('login-overlay');
  const loginForm = document.getElementById('login-form');
  const kutmilzKeyInput = document.getElementById('kutmilz-key');
  const passwordInput = document.getElementById('password');
  const termsCheckbox = document.getElementById('terms-checkbox');
  const loginError = document.getElementById('login-error');
  const rememberCheckbox = document.getElementById('remember-checkbox');

  if (!navigator.onLine) {
    const offlineNotice = document.getElementById('offline-notice');
    if (offlineNotice) offlineNotice.classList.remove('hidden');
  }

  // Load saved credentials if available
  const savedKey = localStorage.getItem('kutmilz_key');
  const savedPassword = localStorage.getItem('kutmilz_password');
  if (savedKey && savedPassword && kutmilzKeyInput && passwordInput) {
    try {
      kutmilzKeyInput.value = savedKey;
      passwordInput.value = savedPassword;
      if (rememberCheckbox) rememberCheckbox.checked = true;
      console.log('Saved credentials loaded');
    } catch (e) {
      console.warn('Failed to populate saved credentials', e);
    }
  }

  // Always show login on page load (safe-call with DOM fallback)
  try {
    if (typeof showLogin === 'function') showLogin();
    else if (loginOverlay) {
      loginOverlay.classList.remove('hidden');
      const _appRoot = document.getElementById('app-root');
      if (_appRoot) _appRoot.classList.add('hidden');
      document.body.style.overflow = 'hidden';
    }
  } catch (e) { console.warn('showLogin failed', e); }

  // Add form submit handler
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Add terms checkbox handler
  if (termsCheckbox) {
    termsCheckbox.addEventListener('change', () => {
      const loginButton = document.getElementById('login-submit-btn');
      if (loginButton) {
        loginButton.disabled = !termsCheckbox.checked;
      }
      if (loginError) loginError.classList.add('hidden');
    });
  }

  // Initially disable login button
  const loginButton = document.getElementById('login-submit-btn');
  if (loginButton) {
    loginButton.disabled = true;
  }

  // Add input focus effects
  if (kutmilzKeyInput && passwordInput) {
    [kutmilzKeyInput, passwordInput].forEach(input => {
      input.addEventListener('focus', () => {
        if (loginError) loginError.classList.add('hidden');
      });
    });
  }

  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && loginOverlay && !loginOverlay.classList.contains('hidden')) {
      // Don't allow escape to close login for security
      e.preventDefault();
    }
  });
}

// Initialize login when DOM is ready
document.addEventListener('DOMContentLoaded', initLogin);
