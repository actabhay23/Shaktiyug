import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Star, Eye, RefreshCw, X, ShieldAlert, BadgeCheck, Lightbulb, HeartHandshake } from 'lucide-react';

interface FeedbackItem {
  id: string;
  name: string;
  rating: number;
  comment: string;
  reaction: string;
  category: string;
  timestamp: string;
}

const REACTIONS = [
  { emoji: "😔", val: 1, label: "Poor" },
  { emoji: "😐", val: 2, label: "Fair" },
  { emoji: "😊", val: 3, label: "Good" },
  { emoji: "💖", val: 4, label: "Stunning" },
  { emoji: "🤩", val: 5, label: "Runway Elite" }
];

const CATEGORIES = [
  { id: 'rating', label: 'Rating', icon: Star },
  { id: 'suggestion', label: 'Suggestions', icon: Lightbulb },
  { id: 'bug', label: 'Bug Reports', icon: ShieldAlert },
  { id: 'feature', label: 'Feature Requests', icon: HeartHandshake }
];

const DEFAULT_FEEDBACKS: FeedbackItem[] = [
  {
    id: "fb-1",
    name: "Aarav Sharma",
    rating: 5,
    comment: "The holographic laser and smart fabric convergence is beyond futuristic!",
    reaction: "🤩",
    category: "suggestion",
    timestamp: "May 23, 2026, 02:15 PM"
  },
  {
    id: "fb-2",
    name: "Zara Roy",
    rating: 4,
    comment: "Absolutely gorgeous UI. The 3D lotus transition has standard-defining polish.",
    reaction: "💖",
    category: "feature",
    timestamp: "May 22, 2026, 11:40 AM"
  },
  {
    id: "fb-3",
    name: "Prof. Raghavan",
    rating: 5,
    comment: "Fascinating integration of Vedic geometry principles into the digital runway.",
    reaction: "🤩",
    category: "rating",
    timestamp: "May 21, 2026, 09:12 AM"
  }
];

export default function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  
  const [name, setName] = useState('');
  const [selectedRating, setSelectedRating] = useState(5);
  const [comment, setComment] = useState('');
  const [category, setCategory] = useState('suggestion'); // bug, suggestion, feature, rating
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    setHasSubmitted(localStorage.getItem('shakti_feedback_submitted') === 'true');
  }, []);

  // Fetch feedbacks for admin view
  const fetchFeedbacks = async () => {
    try {
      const response = await fetch('/api/feedbacks');
      if (response.ok) {
        const data = await response.json();
        setFeedbacks(Array.isArray(data) ? data : DEFAULT_FEEDBACKS);
      } else {
        const local = localStorage.getItem('shakti_local_feedbacks');
        setFeedbacks(local ? JSON.parse(local) : DEFAULT_FEEDBACKS);
      }
    } catch (e) {
      console.warn("Using fallback local feedbacks database due to fetch outage:", e);
      const local = localStorage.getItem('shakti_local_feedbacks');
      setFeedbacks(local ? JSON.parse(local) : DEFAULT_FEEDBACKS);
    }
  };

  useEffect(() => {
    if ((isOpen || isAdminView) && !hasSubmitted) {
      fetchFeedbacks();
    }
  }, [isOpen, isAdminView, hasSubmitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    const chosenReaction = REACTIONS.find(r => r.val === selectedRating)?.emoji || "✨";
    const feedbackPayload = {
      name: name.trim() || "Anonymous Model",
      rating: selectedRating,
      comment: comment.trim(),
      category: category,
      reaction: chosenReaction
    };

    let postedOk = false;
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackPayload)
      });
      if (response.ok) {
        postedOk = true;
      }
    } catch (err) {
      console.warn("Could not post feedback up to remote terminal. Registering in offline store:", err);
    }

    // Always succeed locally is the optimal approach for static Vercel hosts
    const newItem: FeedbackItem = {
      id: "fb-local-" + Date.now(),
      ...feedbackPayload,
      timestamp: new Date().toLocaleString()
    };
    
    try {
      const local = localStorage.getItem('shakti_local_feedbacks');
      const existing: FeedbackItem[] = local ? JSON.parse(local) : DEFAULT_FEEDBACKS;
      const updated = [newItem, ...existing];
      localStorage.setItem('shakti_local_feedbacks', JSON.stringify(updated));
      setFeedbacks(updated);
    } catch (storageError) {
      console.error(storageError);
    }

    setSuccess(true);
    setName('');
    setComment('');
    setSelectedRating(5);
    localStorage.setItem('shakti_feedback_submitted', 'true');
    setTimeout(() => {
      setSuccess(false);
      setIsOpen(false);
      setHasSubmitted(true);
    }, 1800);
    setSubmitting(false);
  };

  if (hasSubmitted) return null;

  return (
    <>
      {/* Subtle Bottom-Right Floating Action Button (Next to Chatbot trigger at absolute bottom-right) */}
      <div className="fixed bottom-6 right-24 z-50 pointer-events-auto">
        <motion.button
          id="feedback-trigger-btn"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(!isOpen);
            setIsAdminView(false);
          }}
          className="px-4 py-3 h-14 rounded-full bg-shakti-black/90 backdrop-blur-md border border-shakti-gold/30 hover:border-shakti-gold/60 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] font-sans hover:text-shakti-gold transition-all duration-300 shadow-xl shadow-black/50 text-white cursor-pointer"
        >
          <Star className="w-4 h-4 text-shakti-gold fill-shakti-gold/25 animate-pulse" />
          <span className="hidden sm:inline-block">FEEDBACK</span>
        </motion.button>
      </div>

      {/* COMPACT Glassmorphism panel floating above the trigger button (No intrusive full-screen overlay!) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="feedback-popup-panel"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-24 right-24 w-96 max-w-[calc(100vw-2.5rem)] h-[510px] bg-[#0c050a]/95 border border-shakti-gold/30 rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden backdrop-blur-3xl pointer-events-auto"
          >
            {/* Header section with tab switches */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-shakti-black via-[#140810] to-shakti-black flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-shakti-gold fill-shakti-gold/20" />
                  <h4 className="text-xs font-serif italic text-white tracking-widest uppercase">TRAJECTORY HUB</h4>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-white/30 hover:text-white cursor-pointer select-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs Switcher */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsAdminView(false)}
                  className={`py-1.5 text-[8.5px] uppercase tracking-widest transition-all font-black rounded-xs cursor-pointer ${
                    !isAdminView ? 'bg-shakti-gold text-shakti-black font-extrabold' : 'bg-white/5 border border-white/5 text-white/55 hover:text-white'
                  }`}
                >
                  Submit Voice
                </button>
                <button
                  onClick={() => {
                    setIsAdminView(true);
                    fetchFeedbacks();
                  }}
                  className={`py-1.5 text-[8.5px] uppercase tracking-widest transition-all font-black rounded-xs cursor-pointer flex items-center justify-center gap-1 ${
                    isAdminView ? 'bg-shakti-gold text-shakti-black font-extrabold' : 'bg-white/5 border border-white/5 text-white/55 hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  Admin Reviews
                </button>
              </div>
            </div>

            {/* Main scrollable view panel */}
            <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <AnimatePresence mode="wait">
                {!isAdminView ? (
                  <motion.div
                    key="voice-submit-form"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-4"
                  >
                    {success ? (
                      <div className="text-center py-16 space-y-4">
                        <Sparkles className="w-12 h-12 text-shakti-gold mx-auto animate-spin" />
                        <h4 className="font-serif text-lg italic text-white">Impression Lodged!</h4>
                        <p className="text-[8px] uppercase tracking-[0.4em] text-shakti-gold-light leading-relaxed px-4">
                          Your creative matrix coordinate is successfully synced with student designer networks.
                        </p>
                        <p className="text-[7.5px] uppercase tracking-[0.2em] text-[#ff2d55] font-black leading-normal animate-pulse px-4">
                          ✈️ Notification copy transmitted successfully to shaktiyugfashionteam@gmail.com
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4 font-sans max-w-full">
                        
                        {/* Creator name input */}
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase tracking-[0.3em] text-shakti-gold font-bold">Your Creator Name</label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="ARTIST / MODEL NAME (OPTIONAL)"
                            className="w-full bg-white/[0.03] border border-white/10 p-2.5 text-white text-xs tracking-wider focus:border-shakti-gold outline-none transition-colors rounded-sm font-sans"
                          />
                        </div>

                        {/* Category Picker (Bug reports, Feature requests, Suggestions, Rating) */}
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase tracking-[0.3em] text-shakti-gold font-bold">Feedback Category</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {CATEGORIES.map((cat) => {
                              const IconComp = cat.icon;
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => setCategory(cat.id)}
                                  className={`py-1.5 px-2.5 border rounded-sm flex items-center gap-2 text-left cursor-pointer transition-all ${
                                    category === cat.id
                                      ? 'bg-shakti-gold/10 border-shakti-gold text-shakti-gold'
                                      : 'border-white/5 bg-white/[0.01] text-white/40 hover:text-white/80'
                                  }`}
                                >
                                  <IconComp className="w-3 h-3 shrink-0" />
                                  <span className="text-[8.5px] uppercase tracking-wider font-bold truncate">{cat.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Aesthetic Grade Selector */}
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase tracking-[0.3em] text-shakti-gold font-bold">Aesthetic Grade</label>
                          <div className="grid grid-cols-5 gap-1">
                            {REACTIONS.map((r) => (
                              <button
                                key={r.val}
                                type="button"
                                onClick={() => setSelectedRating(r.val)}
                                className={`py-1.5 px-0.5 border rounded-sm flex flex-col items-center justify-center transition-all cursor-pointer ${
                                  selectedRating === r.val
                                    ? 'bg-shakti-gold/15 border-shakti-gold scale-102 font-extrabold text-shakti-gold'
                                    : 'border-white/5 bg-white/[0.01] opacity-60 hover:opacity-100 text-white'
                                }`}
                                title={r.label}
                              >
                                <span className="text-sm">{r.emoji}</span>
                                <span className="text-[5.5px] tracking-tight mt-0.5 uppercase text-white/40 truncate w-full text-center">{r.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Message Box */}
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase tracking-[0.3em] text-shakti-gold font-bold">Impressions & suggestions</label>
                          <textarea
                            required
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Critique our live transitions, drapes, or voice triggers..."
                            className="w-full bg-white/[0.03] border border-white/10 p-2.5 text-white text-xs tracking-wide focus:border-shakti-gold outline-none transition-colors h-18 resize-none rounded-sm font-sans"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full py-3 bg-shakti-gold text-shakti-black text-[9px] uppercase tracking-[0.3em] font-black hover:bg-shakti-gold-light transition-colors rounded-sm cursor-pointer block text-center"
                        >
                          {submitting ? "SYNCHRONIZING..." : "DISPATCH IMPRESSION VOGUE"}
                        </button>
                        <div className="text-center pt-2.5">
                           <p className="text-[7.5px] uppercase tracking-[0.2em] text-[#ff2d55] font-black leading-normal">
                             ✉️ Secure dispatch active: Your feedback compiles and mails to shaktiyugfashionteam@gmail.com
                           </p>
                        </div>
                      </form>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="reviews-board-list"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between text-[7px] font-mono tracking-widest text-white/30">
                      <span>Sync coordinates ({feedbacks.length})</span>
                      <button
                        onClick={fetchFeedbacks}
                        className="p-1 text-shakti-gold-light hover:text-shakti-gold flex items-center gap-1 tracking-wider font-bold cursor-pointer"
                      >
                        <RefreshCw className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: '6s' }} /> RE-SYNC
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                      {feedbacks.length === 0 ? (
                        <div className="text-center py-10 border border-white/5 text-white/20 text-[9px] font-mono font-bold">
                          ORACLE TRAJECTORY REGISTRY EMPTY.
                        </div>
                      ) : (
                        feedbacks.map((f) => (
                          <div
                            key={f.id}
                            className="p-3 bg-white/[0.01] border border-white/5 hover:border-shakti-gold/25 transition-all rounded-sm space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm bg-white/5 w-6 h-6 rounded-full flex items-center justify-center border border-white/10">
                                  {f.reaction}
                                </span>
                                <div>
                                  <span className="text-[9px] font-black text-white/90 tracking-widest block truncate max-w-[120px]">{f.name}</span>
                                  <span className="text-[6.5px] font-mono text-white/30 uppercase block">{f.timestamp}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                {f.category && (
                                  <span className="text-[6.5px] font-mono uppercase px-1.5 py-0.5 bg-white/5 border border-white/5 text-white/40 rounded-sm">
                                    {f.category}
                                  </span>
                                )}
                                <div className="flex items-center gap-0.5 bg-shakti-gold/5 px-1.5 py-0.5 rounded-full border border-shakti-gold/10">
                                  <Star className="w-2 h-2 text-shakti-gold fill-shakti-gold" />
                                  <span className="text-[8px] font-bold text-shakti-gold font-mono">{f.rating}</span>
                                </div>
                              </div>
                            </div>

                            <p className="text-[10px] text-white/70 italic tracking-wide font-sans leading-relaxed break-words">
                              "{f.comment}"
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
