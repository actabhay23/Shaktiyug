import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tv, Eye, Heart, Flame, Sparkles, Smile, MessageSquare, Send, 
  Share2, Trophy, Clock, Volume2, AlertCircle, Sparkle 
} from 'lucide-react';

interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: string;
  avatar: string;
}

interface LiveConfig {
  isLive: boolean;
  platform: string;
  streamUrl: string;
  viewerCount: number;
  title: string;
  description: string;
  countdownEnd: string;
  replayUrl: string;
  reactions: { type: string; count: number }[];
  comments: Comment[];
}

const DEFAULT_LIVE_CONFIG: LiveConfig = {
  isLive: true,
  platform: "YouTube Live",
  streamUrl: "https://www.youtube.com/embed/5qap5aO4i9A",
  viewerCount: 1420,
  title: "SHAKTIYUG COUTURE REVELATION - LIVE AT NIFT",
  description: "Witness the live convergence of premium silk drapes with active neon sensor systems and real-time holographic lasers.",
  countdownEnd: "2026-05-30T18:00:00Z",
  replayUrl: "https://www.youtube.com/embed/5qap5aO4i9A",
  reactions: [
    { type: "🔥", count: 254 },
    { type: "✨", count: 182 },
    { type: "❤️", count: 313 },
    { type: "😮", count: 98 }
  ],
  comments: [
    {
      id: "lc-1",
      user: "RampQueen_99",
      text: "Look at the high-contrast glowing drapes!",
      timestamp: "12s ago",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=128"
    },
    {
      id: "lc-2",
      user: "CoutureArchitect",
      text: "Truly a majestic digital-physical design hybridity.",
      timestamp: "8s ago",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=128"
    }
  ]
};

export default function LiveExperience() {
  const [config, setConfig] = useState<LiveConfig | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [inputText, setInputText] = useState('');
  const [countdownStr, setCountdownStr] = useState('00:00:00:00');
  const [floatingReactions, setFloatingReactions] = useState<{ id: number; char: string; x: number; y: number }[]>([]);
  const [donationAmount, setDonationAmount] = useState('50');
  const [successMsg, setSuccessMsg] = useState('');
  
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const reactionIdCounter = useRef(0);

  // Fetch from live config initially & periodically
  const fetchLiveStatus = async () => {
    try {
      const res = await fetch('/api/owner/live');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        setComments(data.comments || []);
      } else {
        setConfig(prev => prev || DEFAULT_LIVE_CONFIG);
        setComments(prev => prev.length > 0 ? prev : DEFAULT_LIVE_CONFIG.comments);
      }
    } catch (e) {
      console.warn("Using fallback live config:", e);
      setConfig(prev => prev || DEFAULT_LIVE_CONFIG);
      setComments(prev => prev.length > 0 ? prev : DEFAULT_LIVE_CONFIG.comments);
    }
  };

  useEffect(() => {
    fetchLiveStatus();
    const interval = setInterval(fetchLiveStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer logic
  useEffect(() => {
    if (!config || !config.countdownEnd) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(config.countdownEnd).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setCountdownStr('00:00:00:00');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      const dStr = days.toString().padStart(2, '0');
      const hStr = hours.toString().padStart(2, '0');
      const mStr = mins.toString().padStart(2, '0');
      const sStr = secs.toString().padStart(2, '0');

      setCountdownStr(`${dStr}:${hStr}:${mStr}:${sStr}`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [config]);

  // Scroll to bottom of comments overlay
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userComment = inputText.trim();
    setInputText('');

    // Pre-insert for immediate reactivity
    const tempId = 'temp-' + Date.now().toString();
    const mockComment: Comment = {
      id: tempId,
      user: 'You (Model Specialist)',
      text: userComment,
      timestamp: 'Just now',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=128'
    };

    setComments(prev => [...prev, mockComment]);

    try {
      const res = await fetch('/api/owner/live/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: userComment,
          user: 'You (Model Specialist)'
        })
      });

      if (res.ok) {
        const updated = await res.json();
        if (updated && updated.comments) {
          setComments(updated.comments);
        }
      }
    } catch (e) {
      console.warn('Post comment endpoint offline, keeping reactive comment locally:', e);
    }
  };

  const triggerReaction = async (reactionChar: string) => {
    // Spawn floating anim element
    const id = reactionIdCounter.current++;
    const x = Math.random() * 60 + 20; // percent offset from center
    const y = 80; // starts at bottom

    setFloatingReactions(prev => [...prev, { id, char: reactionChar, x, y }]);
    
    // Auto-remove after animation
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== id));
    }, 2800);

    try {
      await fetch('/api/owner/live/reaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: reactionChar })
      });
    } catch (e) {}
  };

  const handleSupportDonation = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(`GRAV-TRANSFER COMPLETE. $${donationAmount} BOOSTER SENT TO SHAKTIYUG SHOWRUNNERS.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-xs text-shakti-gold">
        <Sparkles className="w-5 h-5 animate-spin mr-3" />
        LOADING DYNAMIC STREAM MATRIX ROUTER...
      </div>
    );
  }

  return (
    <section className="min-h-screen py-24 px-4 md:px-8 container mx-auto">
      {/* Immersive Cinematic Background Header */}
      <div className="relative mb-12">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-lotus-pink/10 border border-lotus-pink/30 rounded-full mb-3">
          <Tv className="w-3 h-3 text-lotus-pink animate-pulse" />
          <span className="text-[8px] uppercase tracking-[0.3em] font-black text-soft-pink">
            Shaktiyug Hologram Stream Node
          </span>
          {config.isLive && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </div>
        
        <h2 className="font-serif text-5xl md:text-7xl italic text-white leading-none">
          Live <span className="gold-text">Experience</span>
        </h2>
        <p className="text-[10px] uppercase tracking-[0.5em] text-white/35 font-bold mt-2">
          REAL-TIME AURA FEEDBACK • VIRTUAL RAMP LASERS • METALLIC FLUIDS
        </p>
      </div>

      {/* Main Broadcast Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-16">
        
        {/* Stream View Column */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="relative aspect-video rounded-xs overflow-hidden border border-white/10 bg-shakti-black shadow-2xl">
            {/* Stream Popup Alert Banner */}
            {config.isLive && (
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-shakti-black/80 backdrop-blur-md rounded-xs border border-white/5 shadow-lg">
                <span className="w-2.5 h-2.5 bg-red-500 animate-ping rounded-full shrink-0" />
                <span className="text-[9px] uppercase tracking-[0.25em] font-black font-sans text-red-400">
                  LIVE NOW AT CAMPUS
                </span>
                <span className="mx-1.5 h-3 w-px bg-white/15" />
                <Eye className="w-3.5 h-3.5 text-white/50" />
                <span className="text-[10px] font-mono font-bold text-white/80">{config.viewerCount} VIEWER LABS</span>
              </div>
            )}

            {config.isLive ? (
              <iframe 
                src={config.streamUrl}
                title={config.title}
                className="w-full h-full border-0 absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                referrerPolicy="no-referrer"
                allowFullScreen
              />
            ) : (
              (() => {
                const isScheduled = config.countdownEnd ? new Date(config.countdownEnd).getTime() > Date.now() : false;
                if (isScheduled) {
                  return (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-6 bg-gradient-to-br from-[#0e070d] to-shakti-black">
                      <div className="w-12 h-12 bg-shakti-gold/10 border border-shakti-gold/35 rounded-full flex items-center justify-center text-shakti-gold relative animate-pulse">
                        <Clock className="w-6 h-6" />
                      </div>
                      
                      <div className="space-y-1.5 max-w-sm">
                        <span className="text-[9px] uppercase tracking-[0.4em] text-shakti-gold font-black px-3 py-1 bg-shakti-gold/5 border border-shakti-gold/15 rounded-full inline-block">
                          LIVE SOON • BROADCAST PINNED
                        </span>
                        <h4 className="font-serif text-2xl italic text-white pt-2">{config.title || 'Upcoming Virtual Showcase'}</h4>
                        <p className="text-white/40 text-[10.5px] leading-relaxed">
                          The official countdown is active. Virtual lasers and sensor matrices will ignite automatically when scheduled.
                        </p>
                      </div>

                      <div className="px-6 py-4 bg-white/[0.02] border border-white/5 rounded-xs inline-block">
                        <span className="text-[7.5px] uppercase tracking-widest text-lotus-pink block font-black">Couture Laser Sync Countdown</span>
                        <span className="text-3xl font-bold font-mono text-white tracking-widest block mt-1">{countdownStr}</span>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="absolute inset-0 w-full h-full bg-shakti-black flex flex-col items-stretch relative">
                      {/* Interactive Archival Showcase Container */}
                      {config.replayUrl ? (
                        <iframe 
                          src={config.replayUrl}
                          title="Archival Showcase & Teasers"
                          className="w-full h-full border-0 absolute inset-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          referrerPolicy="no-referrer"
                          allowFullScreen
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-shakti-black to-[#1a0c16]">
                          <Tv className="w-12 h-12 text-white/20 mb-4" />
                          <h4 className="font-serif text-lg italic text-white/50">Couture Showcase Suspended</h4>
                          <p className="text-white/40 text-xs mt-2 max-w-xs">{config.description}</p>
                        </div>
                      )}
                      
                      {/* Top subtle overlay badge explaining this is a replay / cinematic feature */}
                      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-shakti-black/90 backdrop-blur-sm rounded-xs border border-white/5 shadow-lg">
                        <span className="w-2 h-2 bg-shakti-gold rounded-full" />
                        <span className="text-[8.5px] uppercase tracking-[0.3em] font-black font-sans text-shakti-gold-light">
                          CINEMATIC ARCHIVAL SHOWCASE ACTIVE
                        </span>
                      </div>
                    </div>
                  );
                }
              })()
            )}

            {/* FLOATING NEON REACTIONS RENDERING */}
            <AnimatePresence>
              {floatingReactions.map(fr => (
                <motion.span
                  key={fr.id}
                  initial={{ opacity: 0, y: 150, x: `${fr.x}%`, scale: 0.5 }}
                  animate={{ opacity: [0, 1, 1, 0], y: -100, scale: [0.5, 2.0, 1.5, 0.8] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2.5, ease: 'easeOut' }}
                  className="absolute bottom-10 z-30 select-none text-4xl drop-shadow-[0_0_15px_rgba(224,17,95,0.7)]"
                >
                  {fr.char}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          {/* Under player controls */}
          <div className="luxury-card rounded-xs p-6 border border-white/5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl italic text-white leading-tight">{config.title || 'Untitled Couture stream'}</h3>
                <p className="text-white/50 text-xs leading-relaxed max-w-2xl font-light mt-1">
                  {config.description || 'No direct broadcast details active.'}
                </p>
              </div>

              {/* Floating Reaction Launcher */}
              <div className="flex items-center bg-white/[0.02] border border-white/5 py-1 px-3 rounded-md gap-3 shrink-0">
                <span className="text-[8px] uppercase tracking-wider text-white/30 font-bold">REACTION BUZZ:</span>
                <div className="flex gap-2">
                  {['🔥', '✨', '❤️', '😮'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => triggerReaction(emoji)}
                      className="text-lg hover:scale-135 transition-transform duration-300 transform-gpu cursor-pointer active:scale-95"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Lounge Chat Column */}
        <div className="lg:col-span-4 flex flex-col items-stretch">
          <div className="luxury-card rounded-xs border border-white/5 overflow-hidden flex flex-col h-[520px] relative max-h-[70vh] lg:max-h-none lg:h-full">
            
            {/* Live Chat Title bar */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-shakti-gold" />
                <span className="text-[9px] uppercase tracking-widest font-black text-white/80">Ramp Lounge Chat</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-shakti-gold/10 border border-shakti-gold/20 rounded-full">
                <Eye className="w-3 h-3 text-shakti-gold" />
                <span className="text-[8px] uppercase font-mono font-bold text-shakti-gold-light">{config.viewerCount}</span>
              </div>
            </div>

            {/* Comments Output Stream Container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="flex items-start gap-3 text-xs">
                  <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-white/10 mt-0.5">
                    <img src={c.avatar} alt={c.user} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <span className="font-bold text-shakti-gold-light text-[10px] tracking-wide">{c.user}</span>
                      <span className="text-[7.5px] uppercase text-white/35 font-mono">{c.timestamp}</span>
                    </div>
                    <p className="text-white/80 font-light mt-0.5 leading-relaxed break-words">{c.text}</p>
                  </div>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            {/* Message Input Form */}
            <form onSubmit={handlePostComment} className="p-3 border-t border-white/5 bg-white/[0.01] flex items-center gap-2">
              <input
                type="text"
                placeholder="Synchronize comments..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                maxLength={140}
                className="flex-1 bg-white/[0.02] border border-white/10 rounded-sm py-2 px-3 text-xs text-white fill-none outline-none focus:border-lotus-pink/60 transition-colors"
                id="live-chat-input"
              />
              <button
                type="submit"
                className="w-10 h-10 bg-shakti-gold hover:bg-shakti-gold-light active:scale-95 text-shakti-black flex items-center justify-center rounded-sm transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Supplementary Action Widgets Row: Support Booster Slider & Upcoming Shows Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* Support Booster widget */}
        <div className="luxury-card rounded-xs p-8 relative overflow-hidden group">
          <div className="absolute -right-36 -bottom-36 w-80 h-80 bg-lotus-pink/5 blur-[120px] rounded-full" />
          
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-shakti-gold" />
              <h4 className="font-serif text-2xl italic text-white">Backstage Couture Booster</h4>
            </div>
            <p className="text-white/40 text-xs leading-relaxed font-light">
              Directly sponsor the student artisans compiling physical laser wear in the Indian craft sector. 100% of proceeds go to procurement and tech modules.
            </p>

            <form onSubmit={handleSupportDonation} className="space-y-4 pt-2">
              <div>
                <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-widest text-white/50 mb-2">
                  <span>booster size:</span>
                  <span className="text-shakti-gold-light font-bold">${donationAmount} USD</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  className="w-full accent-shakti-gold cursor-pointer"
                  id="booster-range-slider"
                />
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  className="fashion-button rounded-sm text-[10px] w-full py-3"
                >
                  DISPATCH BOOSTER AURA
                </button>
              </div>
            </form>

            <AnimatePresence>
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-shakti-gold/10 border border-shakti-gold/30 rounded-xs text-[10px] text-shakti-gold font-mono uppercase tracking-wider flex items-center gap-2"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Dynamic Event Calendar Schedule */}
        <div className="luxury-card rounded-xs p-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-soft-pink" />
                <h4 className="font-serif text-2xl italic text-white">Showcase Chronology</h4>
              </div>
              <span className="text-[8px] uppercase tracking-widest font-mono text-white/30 font-bold">STATION TIMES (IST)</span>
            </div>

            <div className="space-y-4">
              {[
                { time: 'May 30 • 18:00', title: 'Shaktiyug Couture Revelation', loc: 'Main Campus Hall', state: 'Interactive lasers' },
                { time: 'June 05 • 20:30', title: 'Metallic Cyber Draperies Pt 2', loc: 'Digital Runway Annex', state: '128 BPM pulse arrays' },
                { time: 'June 18 • 16:00', title: 'Bloom of Saffron Golds', loc: 'Atrium Lounge Studio', state: 'Aman curated choreo' }
              ].map((sch, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 bg-white/[0.01] border border-white/5 hover:border-white/10 rounded-xs transition-all">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-shakti-gold">{sch.time}</span>
                    <h5 className="font-serif text-sm italic text-white">{sch.title}</h5>
                    <p className="text-white/40 text-[10px] leading-none shrink-0">{sch.loc}</p>
                  </div>
                  <span className="text-[8px] uppercase tracking-wider font-mono px-2 py-1 bg-white/5 border border-white/5 text-white/60 rounded-xs shrink-0 self-start mt-0.5">
                    {sch.state}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </section>
  );
}
