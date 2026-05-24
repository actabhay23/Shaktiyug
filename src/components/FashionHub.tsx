import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Star, MessageSquare, Heart, Info, Sparkles, Upload, Eye, EyeOff, 
  Layers, Plus, Trash2, Calendar, Clock, MapPin, Users, Award, 
  Megaphone, Shield, Check, X, RefreshCw, Compass, ArrowRight, Grid,
  Lock, Unlock, Bookmark, LogOut, Key, Database
} from 'lucide-react';
import ImageSlideshow from './ImageSlideshow';
import ImageGallery from './ImageGallery';

const PRESETS = [
  { id: 1, title: "Paris Fashion Week", platform: "Live Stream", rating: 4.9, reviews: 4500, image: "https://i.pinimg.com/736x/91/4e/5c/914e5ce81a91641e98b32a9fedc10b61.jpg" },
  { id: 2, title: "Vogue Masters", platform: "Editorial", rating: 4.8, reviews: 1200, image: "https://i.pinimg.com/736x/0e/cb/8f/0ecb8f55928b79272ec4f96809c594d0.jpg" },
  { id: 3, title: "Ramp Rivals S3", platform: "Reality TV", rating: 4.6, reviews: 3300, image: "https://i.pinimg.com/736x/a0/48/74/a0487433b4ebdf1cce006bbae18dfd76.jpg" },
  { id: 4, title: "Silk & Soul", platform: "Documentary", rating: 4.7, reviews: 890, image: "https://i.pinimg.com/736x/5f/da/94/5fda94b82b9329f84d918f07cb9fa2b8.jpg" }
];

const CATEGORIES = ["Clothing Design", "Hand-drawn Sketch", "Moodboard", "Concept Art"];
const UNSPLASH_POOL = [
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop"
];

const DEFAULT_DESIGNS = [
  {
    id: "design-1",
    title: "Holographic Lotus Drape",
    designer: "Akash Soni",
    category: "Clothing Design",
    description: "Fusion of premium silk with integrated light-emitting threads responsive to body rhythm.",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=600&auto=format&fit=crop",
    tags: ["LOTUS", "HOLOGRAM", "SILK", "FUTURE"],
    status: "approved",
    visibility: "public",
    likes: 58,
    comments: [
      {
        id: "dc-1",
        user: "Mahi",
        text: "This would catch backlights beautifully!",
        timestamp: "Today"
      }
    ],
    aiEnhanced: true,
    timestamp: "Today, 10:00 AM"
  },
  {
    id: "design-2",
    title: "Vedic Cyber-Punk Bodice",
    designer: "Nisha Roy",
    category: "Hand-drawn Sketch",
    description: "Hand-drawn blueprint sketch translating ancient armor geometries into flexible fiber-optic layers.",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop",
    tags: ["SKETCH", "VEDIC", "CYBERPUNK"],
    status: "approved",
    visibility: "public",
    likes: 12,
    comments: [],
    aiEnhanced: false,
    timestamp: "3 hours ago"
  },
  {
    id: "design-3",
    title: "Shakti Aura Moodboard",
    designer: "Aman Sen",
    category: "Moodboard",
    description: "Visual triggers with high-contrast crimson and metallic brass color paths.",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=600&auto=format&fit=crop",
    tags: ["MOODBOARD", "CRIMSON", "BRASS"],
    status: "approved",
    visibility: "public",
    likes: 34,
    comments: [],
    aiEnhanced: false,
    timestamp: "Yesterday"
  }
];

const DEFAULT_EVENTS = [
  {
    id: "event-1",
    collegeName: "NIFT Delhi Fashion Alliance",
    name: "Lotus Resonance 2026",
    banner: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop",
    date: "May 30, 2026",
    time: "18:00 IST",
    venue: "NIFT Amphitheatre, New Delhi",
    countdownEnd: "2026-05-30T18:00:00Z",
    models: [
      {
        name: "Preeti Sen",
        email: "preeti@gmail.com",
        role: "Showstopper",
        approved: true
      }
    ],
    judges: ["Aura Oracle", "Tarun Tahiliani", "Ritu Kumar"],
    sponsors: ["Vogue India", "Tata Luxury", "Meta Wearables"],
    lineup: ["Opening: Pure Silk Walk", "Segment 2: Holographic Veils", "Grand Finale: Vedic Aura"],
    announcements: [
      {
        text: "Rehearsals are rescheduled to 2:00 PM tomorrow. Please bring your practice heels.",
        timestamp: "Today, 11:30 AM"
      },
      {
        text: "Welcome sponsors 'Vogue India' & 'Tata Luxury' onboard!",
        timestamp: "Yesterday"
      }
    ]
  },
  {
    id: "event-2",
    collegeName: "IIT Bombay Mood Indigo Fashion Wing",
    name: "Cyber-Vogue Ramp Rivals",
    banner: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800&auto=format&fit=crop",
    date: "June 18, 2026",
    time: "19:30 IST",
    venue: "Convocation Hall, IITB Campus",
    countdownEnd: "2026-06-18T19:30:00Z",
    models: [],
    judges: ["Mahi Kapoor", "Manish Malhotra"],
    sponsors: ["Reliance Brands", "Nothing Tech"],
    lineup: ["Neon-Glow Couture", "Liquidmetal Drapes", "Soma Cyber-Wear"],
    announcements: [
      {
        text: "Online submissions for designers are open. Submit before May 31.",
        timestamp: "Today"
      }
    ]
  }
];

export default function FashionHub() {
  const [activeTab, setActiveTab] = useState<'trends' | 'uploads' | 'university' | 'admin'>('trends');
  const [designs, setDesigns] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Login & Saved Concept Bookmarks states
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('shakti_vogue_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAdminMode, setIsAdminMode] = useState(() => {
    const saved = localStorage.getItem('shakti_vogue_user');
    if (saved) {
      const user = JSON.parse(saved);
      return user.role === 'owner';
    }
    return false; // Safely gated for real role differentiation
  });

  const [savedDesigns, setSavedDesigns] = useState<string[]>(() => {
    const savedUser = localStorage.getItem('shakti_vogue_user');
    if (!savedUser) return [];
    const user = JSON.parse(savedUser);
    const saved = localStorage.getItem(`shakti_saved_designs_${user.email || user.name}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Toggle saving designs for future use
  const handleToggleBookmark = (designId: string) => {
    if (!currentUser) {
      setAuthError("Identify your credentials first in the Vogue Login Bar to bookmark this architecture.");
      const element = document.getElementById("vogue-auth-anchor");
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    const userKey = currentUser.email || currentUser.name;
    let savedList = [...savedDesigns];
    const isSaved = savedList.includes(designId);
    if (isSaved) {
      savedList = savedList.filter(id => id !== designId);
    } else {
      savedList.push(designId);
    }
    setSavedDesigns(savedList);
    localStorage.setItem(`shakti_saved_designs_${userKey}`, JSON.stringify(savedList));
  };

  const [uploadsSubTab, setUploadsSubTab] = useState<'all' | 'saved'>('all');

  // Interactive inline login form fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginRole, setLoginRole] = useState('Student Creator');
  const [loginPasscode, setLoginPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Sync state changes when user is updated
  useEffect(() => {
    if (currentUser) {
      const userKey = currentUser.email || currentUser.name;
      const saved = localStorage.getItem(`shakti_saved_designs_${userKey}`);
      setSavedDesigns(saved ? JSON.parse(saved) : []);
      setIsAdminMode(currentUser.role === 'owner');
    } else {
      setSavedDesigns([]);
      setIsAdminMode(false);
      setUploadsSubTab('all');
    }
  }, [currentUser]);

  // Synchronize dynamic login shifts from other components
  useEffect(() => {
    const handleAuthSync = () => {
      const saved = localStorage.getItem('shakti_vogue_user');
      setCurrentUser(saved ? JSON.parse(saved) : null);
    };
    window.addEventListener('vogue-auth-change', handleAuthSync);
    window.addEventListener('storage', handleAuthSync);
    return () => {
      window.removeEventListener('vogue-auth-change', handleAuthSync);
      window.removeEventListener('storage', handleAuthSync);
    };
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!loginName || !loginEmail) {
      setAuthError("Alias Name and Email are mandatory.");
      return;
    }

    if (loginRole === 'owner') {
      if (loginPasscode !== 'shakti2026' && loginPasscode !== 'admin') {
        setAuthError("Incorrect Owner Passcode. Enter 'shakti2026' to unlock the Backstage.");
        return;
      }
    }

    const userData = {
      name: loginName,
      email: loginEmail,
      role: loginRole
    };

    localStorage.setItem('shakti_vogue_user', JSON.stringify(userData));
    setCurrentUser(userData);
    setLoginName('');
    setLoginEmail('');
    setLoginPasscode('');
    setAuthError('');
    // Broadcast auth synchronize events globally
    window.dispatchEvent(new Event('vogue-auth-change'));
  };

  const handleLogout = () => {
    localStorage.removeItem('shakti_vogue_user');
    setCurrentUser(null);
    // Broadcast auth synchronize events globally
    window.dispatchEvent(new Event('vogue-auth-change'));
  };

  // Form states - design creation
  const [designTitle, setDesignTitle] = useState('');
  const [designerName, setDesignerName] = useState('');
  const [designDesc, setDesignDesc] = useState('');
  const [designCategory, setDesignCategory] = useState('Clothing Design');
  const [designTags, setDesignTags] = useState('LOTUS, FUTURE, VOGUE');
  const [designImage, setDesignImage] = useState(UNSPLASH_POOL[0]);
  const [isAiEnhanced, setIsAiEnhanced] = useState(false);
  const [designVisibility, setDesignVisibility] = useState<'public' | 'private'>('public');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  // Form states - show registration
  const [selectedShowForReg, setSelectedShowForReg] = useState<any | null>(null);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('Model Companion');

  // Form states - new show scheduler
  const [newCollegeName, setNewCollegeName] = useState('');
  const [newShowName, setNewShowName] = useState('');
  const [newShowVenue, setNewShowVenue] = useState('');
  const [newShowDate, setNewShowDate] = useState('May 30, 2026');
  const [newShowTime, setNewShowTime] = useState('18:00 IST');

  // Comment input per design card
  const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});

  // Countdown timer trigger
  const [timeRemaining, setTimeRemaining] = useState<string>('00 : 00 : 00 : 00');

  useEffect(() => {
    fetchDesigns();
    fetchEvents();
  }, []);

  useEffect(() => {
    // Elegant countdown tick for premium look
    const val = setInterval(() => {
      const target = new Date("2026-05-30T18:00:00Z").getTime();
      const now = new Date().getTime();
      const diff = target - now;
      if (diff <= 0) {
        setTimeRemaining("00d : 00h : 00m : 00s");
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${days}d : ${hours}h : ${minutes}m : ${seconds}s`);
      }
    }, 1000);
    return () => clearInterval(val);
  }, []);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/designs');
      if (res.ok) {
        const data = await res.json();
        setDesigns(Array.isArray(data) ? data : DEFAULT_DESIGNS);
      } else {
        const local = localStorage.getItem('shakti_local_designs');
        setDesigns(local ? JSON.parse(local) : DEFAULT_DESIGNS);
      }
    } catch (e) {
      console.warn("Using offline fallback designs database:", e);
      const local = localStorage.getItem('shakti_local_designs');
      setDesigns(local ? JSON.parse(local) : DEFAULT_DESIGNS);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : DEFAULT_EVENTS);
      } else {
        const local = localStorage.getItem('shakti_local_events');
        setEvents(local ? JSON.parse(local) : DEFAULT_EVENTS);
      }
    } catch (e) {
      console.warn("Using offline fallback events scheduler:", e);
      const local = localStorage.getItem('shakti_local_events');
      setEvents(local ? JSON.parse(local) : DEFAULT_EVENTS);
    }
  };

  // Drag and drop mocks
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Pick a random beautiful high-res fashion photo to represent the file!
      const randomFashionPic = UNSPLASH_POOL[Math.floor(Math.random() * UNSPLASH_POOL.length)];
      setDesignImage(randomFashionPic);
      setDesignTitle(e.dataTransfer.files[0].name.split('.')[0].toUpperCase());
    }
  };

  const selectRandomAsset = () => {
    const randomFashionPic = UNSPLASH_POOL[Math.floor(Math.random() * UNSPLASH_POOL.length)];
    setDesignImage(randomFashionPic);
  };

  const triggerUploadSimulator = () => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 100;
        }
        return prev + 12;
      });
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setIsUploading(false);
    }, 1300);
  };

  const handleSubmitDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!designTitle || !designDesc) return;

    const parsedTags = designTags.split(',').map(t => t.trim().toUpperCase()).filter(Boolean);
    const payload = {
      title: designTitle,
      designer: designerName || "Anonymous Creator",
      category: designCategory,
      description: designDesc,
      image: designImage || UNSPLASH_POOL[Math.floor(Math.random() * UNSPLASH_POOL.length)],
      tags: parsedTags,
      visibility: designVisibility,
      aiEnhanced: isAiEnhanced
    };

    let postedOk = false;
    try {
      const res = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        postedOk = true;
      }
    } catch (e) {
      console.warn("Could not submit design to server terminal. Backing up locally:", e);
    }

    // High quality client fallback
    const mockNewDesign = {
      id: "design-" + Date.now(),
      ...payload,
      status: "approved",
      likes: 0,
      comments: [],
      timestamp: "Just now"
    };

    try {
      const local = localStorage.getItem('shakti_local_designs');
      const existing = local ? JSON.parse(local) : DEFAULT_DESIGNS;
      const updated = [mockNewDesign, ...existing];
      localStorage.setItem('shakti_local_designs', JSON.stringify(updated));
      setDesigns(updated);
    } catch (err) {
      console.error(err);
    }

    setDesignTitle('');
    setDesignerName('');
    setDesignDesc('');
    setIsAiEnhanced(false);
    setShowFormModal(false);
  };

  const handleLikeDesign = async (id: string) => {
    let postedOk = false;
    try {
      const res = await fetch(`/api/designs/${id}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setDesigns(prev => prev.map(d => d.id === id ? { ...d, likes: data.likes } : d));
        postedOk = true;
      }
    } catch (err) {
      console.warn("Offline like registered", err);
    }

    if (!postedOk) {
      setDesigns(prev => {
        const next = prev.map(d => {
          if (d.id === id) {
            return { ...d, likes: (d.likes || 0) + 1 };
          }
          return d;
        });
        localStorage.setItem('shakti_local_designs', JSON.stringify(next));
        return next;
      });
    }
  };

  const handlePostDesignComment = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    const commentText = commentInputs[id] || '';
    if (!commentText.trim()) return;

    let postedOk = false;
    try {
      const res = await fetch(`/api/designs/${id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: "Vogue Enthusiast", text: commentText })
      });

      if (res.ok) {
        const data = await res.json();
        setDesigns(prev => prev.map(d => d.id === id ? { ...d, comments: data.comments } : d));
        setCommentInputs(prev => ({ ...prev, [id]: '' }));
        postedOk = true;
      }
    } catch (e) {
      console.warn("Failed sending comment. Backing up locally:", e);
    }

    if (!postedOk) {
      setDesigns(prev => {
        const next = prev.map(d => {
          if (d.id === id) {
            const nextComments = [...(d.comments || []), { id: "dc-" + Date.now(), user: "Vogue Enthusiast", text: commentText, timestamp: "Just now" }];
            return { ...d, comments: nextComments };
          }
          return d;
        });
        localStorage.setItem('shakti_local_designs', JSON.stringify(next));
        return next;
      });
      setCommentInputs(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleModerateDesign = async (id: string, status: 'approved' | 'rejected') => {
    let postedOk = false;
    try {
      const res = await fetch(`/api/designs/${id}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        fetchDesigns();
        postedOk = true;
      }
    } catch (e) {
      console.warn("Performing design moderation offline:", e);
    }

    if (!postedOk) {
      setDesigns(prev => {
        const next = prev.map(d => d.id === id ? { ...d, status } : d);
        localStorage.setItem('shakti_local_designs', JSON.stringify(next));
        return next;
      });
    }
  };

  const handleRegisterForShow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShowForReg || !regName || !regEmail) return;

    const payload = { name: regName, email: regEmail, role: regRole };
    let postedOk = false;
    try {
      const res = await fetch(`/api/events/${selectedShowForReg.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        postedOk = true;
      }
    } catch (e) {
      console.warn("Failed endpoint. Syncing registrant locally:", e);
    }

    setEvents(prev => {
      const next = prev.map(ev => {
        if (ev.id === selectedShowForReg.id) {
          const updatedModels = [...(ev.models || []), { name: payload.name, email: payload.email, role: payload.role, approved: true }];
          return { ...ev, models: updatedModels };
        }
        return ev;
      });
      localStorage.setItem('shakti_local_events', JSON.stringify(next));
      return next;
    });

    setRegName('');
    setRegEmail('');
    setSelectedShowForReg(null);
  };

  const handleScheduleShow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollegeName || !newShowName) return;

    const payload = {
      collegeName: newCollegeName,
      name: newShowName,
      venue: newShowVenue || "Virtual Runway",
      date: newShowDate || "Upcoming",
      time: newShowTime || "Evening IST",
      banner: UNSPLASH_POOL[Math.floor(Math.random() * UNSPLASH_POOL.length)],
      judges: ["Aura Maven", "Mahi", "Tarun Tahiliani"],
      sponsors: ["Shaktiyug", "Reliance Brands"],
      lineup: ["Vedic Prelude Walk", "Saffron Core Runway"]
    };

    let postedOk = false;
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        postedOk = true;
      }
    } catch (e) {
      console.warn("Offline show schedule registered:", e);
    }

    const mockNewEvent = {
      id: "event-" + Date.now(),
      ...payload,
      models: [],
      announcements: []
    };

    setEvents(prev => {
      const next = [mockNewEvent, ...prev];
      localStorage.setItem('shakti_local_events', JSON.stringify(next));
      return next;
    });

    setNewCollegeName('');
    setNewShowName('');
    setNewShowVenue('');
  };

  // Stats calculate
  const totalSubmissions = designs.length;
  const approvedDesigns = designs.filter(d => d.status === 'approved').length;
  const pendingDesigns = designs.filter(d => d.status === 'pending').length;
  const activeSponsors = Array.from(new Set(events.flatMap(e => e.sponsors || []))).length;

  return (
    <section className="min-h-screen py-24 px-4 md:px-8 container mx-auto">
      {/* Premium Elegant Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-8 mb-12 border-b border-white/5 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-shakti-gold/10 border border-shakti-gold/30 rounded-full mb-3">
            <Compass className="w-3 h-3 text-shakti-gold animate-spin" style={{ animationDuration: '8s' }} />
            <span className="text-[8px] uppercase tracking-[0.3em] font-black font-sans text-shakti-gold-light">
              Premium Couture Architecture
            </span>
          </div>
          <h2 className="font-serif text-5xl md:text-7xl italic text-white leading-none">
            Digital <span className="gold-text">Vogue Hub</span>
          </h2>
          <p className="text-[10px] uppercase tracking-[0.5em] text-white/35 font-bold mt-2">
            SHAKTIYUG TRENDS, PUBLIC DESIGNS, & CAMPUS RUNWAY TRAJECTORY
          </p>
        </div>

        {/* Custom Tab Switcher Grid */}
        <div className="flex flex-wrap items-center bg-white/[0.02] border border-white/5 p-1 rounded-sm gap-2">
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-4 py-2 text-[9px] uppercase tracking-[0.25em] font-black transition-all ${
              activeTab === 'trends' ? 'bg-shakti-gold text-shakti-black shadow-lg shadow-shakti-gold/15' : 'text-white/50 hover:text-white'
            }`}
          >
            Vogue Analytics
          </button>
          
          <button
            onClick={() => setActiveTab('uploads')}
            className={`px-4 py-2 text-[9px] uppercase tracking-[0.25em] font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'uploads' ? 'bg-shakti-gold text-shakti-black' : 'text-white/50 hover:text-white'
            }`}
          >
            <Grid className="w-3 h-3" /> Creative Uploads
          </button>

          <button
            onClick={() => setActiveTab('university')}
            className={`px-4 py-2 text-[9px] uppercase tracking-[0.25em] font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'university' ? 'bg-shakti-gold text-shakti-black' : 'text-white/50 hover:text-white'
            }`}
          >
            <Calendar className="w-3 h-3 animate-pulse" /> University Shows
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 text-[9px] uppercase tracking-[0.25em] font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'admin' ? 'bg-[#ff2d55] text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            <Shield className="w-3 h-3" /> Backstage Control
          </button>
        </div>
      </div>

      {/* VOGUE LOGIN BAR / SAVED DATA CONTROLLER */}
      <div id="vogue-auth-anchor" className="w-full mb-10 bg-white/[0.01] border border-white/10 p-5 rounded-xs relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="absolute inset-x-0 bottom-0 h-[1.5px] bg-gradient-to-r from-shakti-gold/30 via-lotus-pink/30 to-transparent" />
        
        {currentUser ? (
          // Logged In Status
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between w-full gap-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-shakti-gold/10 border border-shakti-gold/30 flex items-center justify-center shrink-0">
                {currentUser.role === 'owner' ? (
                  <Shield className="w-5 h-5 text-shakti-gold animate-pulse" />
                ) : (
                  <Users className="w-5 h-5 text-shakti-gold" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest text-white font-black">{currentUser.name}</span>
                  <span className={`text-[7px] font-mono uppercase px-2 py-0.5 rounded-full ${
                    currentUser.role === 'owner' ? 'bg-[#ff2d55] text-white' : 'bg-white/5 border border-white/10 text-shakti-gold'
                  }`}>
                    {currentUser.role === 'owner' ? '👑 Master Owner' : currentUser.role}
                  </span>
                </div>
                <span className="text-[10px] text-white/40 block font-mono lowercase mt-0.5">{currentUser.email}</span>
              </div>
            </div>

            {/* Save Data summary & shortcuts */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="px-4 py-2 bg-white/[0.02] border border-white/10 rounded-xs flex items-center gap-3">
                <Bookmark className="w-4 h-4 text-shakti-gold fill-shakti-gold/20" />
                <div className="text-left">
                  <span className="text-[8px] uppercase tracking-widest text-white/30 block font-black">Couture Vault</span>
                  <span className="text-xs font-mono font-bold text-white">{savedDesigns.length} Saved blue-drafts</span>
                </div>
              </div>

              {currentUser.role === 'owner' && (
                <button
                  onClick={() => {
                    setActiveTab('admin');
                  }}
                  className="px-4 py-2 bg-[#ff2d55]/10 border border-[#ff2d55]/40 text-[#ff2d55] hover:bg-[#ff2d55] hover:text-white text-[9px] uppercase tracking-widest font-black transition-all rounded-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Shield className="w-3 h-3" />
                  <span>Configure Console</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="p-2 border border-white/10 hover:border-[#ff2d55] hover:bg-[#ff2d55]/10 text-white/50 hover:text-white rounded-sm transition-colors cursor-pointer"
                title="Log Out Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          // Logged Out / Credentials Selector
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#ff2d55]/15 border border-[#ff2d55]/30 rounded-full">
                <span className="w-1.5 h-1.5 bg-[#ff2d55] rounded-full animate-pulse" />
                <span className="text-[7.5px] font-mono text-white/70 uppercase font-black">Identify to catalog blueprint drafts</span>
              </div>
              <h4 className="font-serif text-lg text-white italic">Vogue Session Interface</h4>
              <p className="text-[9px] uppercase tracking-widest text-white/35">Login to save draft concepts for future use and grant access privileges.</p>
            </div>

            {/* Login form */}
            <form onSubmit={handleLoginSubmit} className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full lg:w-auto">
              <input
                required
                type="text"
                placeholder="ALIAS / USERNAME"
                value={loginName}
                onChange={e => setLoginName(e.target.value)}
                className="bg-white/5 border border-white/10 p-2 text-[10px] tracking-wider text-white placeholder:text-white/20 outline-none focus:border-shakti-gold uppercase rounded-xs"
              />

              <input
                required
                type="email"
                placeholder="EMAIL ADDRESS"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                className="bg-white/5 border border-white/10 p-2 text-[10px] tracking-wider text-white placeholder:text-white/20 outline-none focus:border-shakti-gold rounded-xs"
              />

              <select
                value={loginRole}
                onChange={e => setLoginRole(e.target.value)}
                className="bg-[#0e070d] border border-white/10 p-2 text-[10px] tracking-wider text-white outline-none focus:border-shakti-gold rounded-xs"
              >
                <option value="Student Creator">Student Creator</option>
                <option value="Model Companion">Model Companion</option>
                <option value="owner">Platform Owner</option>
              </select>

              {loginRole === 'owner' && (
                <input
                  required
                  type="password"
                  placeholder="PASSCODE (try: shakti2026)"
                  value={loginPasscode}
                  onChange={e => setLoginPasscode(e.target.value)}
                  className="bg-white/5 border border-[#ff2d55]/40 p-2 text-[10px] tracking-wider text-white placeholder:text-white/20 outline-none focus:border-shakti-gold rounded-xs"
                />
              )}

              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-lotus-pink to-shakti-gold text-shakti-black text-[9px] uppercase tracking-[0.2em] font-black hover:opacity-90 transition-all rounded-xs cursor-pointer"
              >
                Assemble Session
              </button>
            </form>
          </div>
        )}

        {authError && (
          <div className="absolute inset-x-0 top-0 bg-[#ff2d55] text-white py-1.5 px-4 text-center font-mono text-[8px] uppercase tracking-widest flex items-center justify-between z-20">
            <span className="mx-auto">⚠️ Ticker Alert: {authError}</span>
            <button onClick={() => setAuthError('')} className="hover:text-black shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* VIEW 1: VOGUE ANALYTICS / TREND PREDICTION */}
        {activeTab === 'trends' && (
          <motion.div
            key="trends"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-16"
          >
            {/* Predictive Model Card */}
            <div className="luxury-card rounded-sm p-8 md:p-12 relative overflow-hidden group border border-white/5 shadow-2xl">
              <div className="absolute -right-36 -top-36 w-80 h-80 bg-shakti-gold/5 blur-[120px] rounded-full group-hover:bg-shakti-gold/10 transition-all duration-1000" />
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                    <span className="w-2 h-2 bg-shakti-gold animate-ping rounded-full" />
                    <span className="text-[8.5px] uppercase tracking-[0.3em] font-mono text-white/70">Aura Analytics Sensor active</span>
                  </div>
                  <h4 className="font-serif text-3xl md:text-5xl text-white italic leading-tight">
                    "Crimson Saffron" and <span className="gold-text">Lotus-Core Golds</span> predicted to dominate Autumn 2026.
                  </h4>
                  <p className="text-white/40 text-sm leading-relaxed font-light">
                    Our local diagnostic neural net processed 2,400 upcoming drafts, college showreels, and designer moodboards. The convergence of traditional Vedic drape patterns with active physical lighting arrays has driven a <span className="text-shakti-gold font-bold">385% increase in scouting traffic</span>.
                  </p>
                  
                  <div className="pt-4 flex flex-wrap gap-4">
                    <div className="px-5 py-3 bg-white/[0.02] border border-white/5 rounded-xs">
                      <span className="text-[7px] uppercase tracking-widest text-[#ff2d55] block font-black">Scouting Ratio</span>
                      <span className="text-lg font-bold text-white font-mono">9.86 / 10.0</span>
                    </div>
                    <div className="px-5 py-3 bg-white/[0.02] border border-white/5 rounded-xs">
                      <span className="text-[7px] uppercase tracking-widest text-shakti-gold-light block font-black">BPM Integration</span>
                      <span className="text-lg font-bold text-white font-mono">128 BPM Sync</span>
                    </div>
                    <div className="px-5 py-3 bg-white/[0.02] border border-white/5 rounded-xs">
                      <span className="text-[7px] uppercase tracking-widest text-white/30 block font-black">Aura Sensation</span>
                      <span className="text-lg font-bold text-white font-mono">High-Fidelity</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 flex justify-around p-6 bg-white/[0.01] border border-white/5 rounded-sm">
                  {[
                    { label: 'GOLD AURA', val: '94%', color: 'bg-shakti-gold' },
                    { label: 'SILK FLOW', val: '78%', color: 'bg-white/25' },
                    { label: 'NEON CORE', val: '88%', color: 'bg-gradient-to-t from-lotus-pink to-shakti-gold' }
                  ].map((pill, i) => (
                    <div key={i} className="flex flex-col items-center gap-3">
                      <div className="w-12 h-36 bg-white/[0.02] border border-white/5 rounded-full relative overflow-hidden p-[2px] flex items-end">
                         <motion.div 
                           initial={{ height: 0 }}
                           whileInView={{ height: pill.val }}
                           transition={{ duration: 1, ease: 'easeOut' }}
                           className={`w-full rounded-full ${pill.color} shadow-[0_0_20px_rgba(255,45,85,0.2)]`}
                         />
                      </div>
                      <span className="text-[7px] uppercase tracking-widest text-white/40 font-black">{pill.label}</span>
                      <span className="text-xs text-white font-mono font-bold">{pill.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Featured Unsplash slides */}
            <div className="relative aspect-[21/9] rounded-sm overflow-hidden group border border-white/5 bg-shakti-black shadow-2xl">
              <ImageSlideshow className="absolute inset-0 w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#040103] via-[#040103]/25 to-transparent" />
              
              <div className="absolute bottom-12 left-10 md:left-16 max-w-2xl space-y-4 md:space-y-6 z-20">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 bg-shakti-gold text-[8px] text-shakti-black uppercase tracking-widest font-black rounded-xs">
                    Vanguard Media
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.3em] text-white/55 font-bold font-mono">
                    LIVE SHAKTIYUG SHOWREELS
                  </span>
                </div>
                <h3 className="font-serif text-4xl md:text-7xl text-white italic leading-none drop-shadow-xl">
                  Visual Drapes
                </h3>
                <p className="text-white/70 text-xs md:text-sm leading-relaxed max-w-md drop-shadow-md font-light">
                  Capturing raw, physical physical geometries at high speed under multi-layered backdrop lasers.
                </p>
              </div>
            </div>

            {/* Presets and original grid content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {PRESETS.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex flex-col sm:flex-row gap-6 bg-[#0c050a]/90 p-5 rounded-sm border border-white/5 hover:border-shakti-gold/30 hover:bg-white/[0.03] transition-all duration-300"
                >
                  <div className="w-full sm:w-44 aspect-square rounded-xs overflow-hidden shrink-0 border border-white/5">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 brightness-75 group-hover:brightness-100"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col justify-between py-1 flex-1 min-w-0">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] uppercase tracking-[0.3em] text-shakti-gold font-bold">{item.platform}</span>
                        <div className="flex items-center gap-1 text-shakti-gold text-[10px] font-bold font-mono">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{item.rating}</span>
                        </div>
                      </div>
                      <h4 className="font-serif text-2xl text-white group-hover:text-shakti-gold transition-colors">{item.title}</h4>
                      <p className="text-white/40 text-[10px] uppercase tracking-widest">Digital-Physical Runway</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-4">
                      <div className="flex flex-col">
                        <span className="text-[7px] uppercase tracking-[0.2em] text-white/30">SC scouting status</span>
                        <span className="text-[10px] text-shakti-gold font-bold">12 Active Openings</span>
                      </div>
                      <button 
                        onClick={() => setActiveTab('uploads')}
                        className="text-[8.5px] uppercase tracking-[0.25em] font-black py-1.5 px-4 border border-white/10 rounded-sm hover:border-shakti-gold hover:text-shakti-gold transition-all"
                      >
                        Explore Hub
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Retro Unsplash Grid Component */}
            <div className="pt-6">
              <ImageGallery title="Vogue Archival Database" />
            </div>
          </motion.div>
        )}

        {/* VIEW 2: FASHION DESIGN SHARING SYSTEM (Pinterest/Behance Masonry) */}
        {activeTab === 'uploads' && (
          <motion.div
            key="uploads"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-12"
          >
            {/* Spotlight Showcase & Submit Trigger section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white/[0.01] border border-white/5 p-8 rounded-sm">
              <div className="space-y-1">
                <span className="text-[8.5px] uppercase tracking-[0.3em] text-shakti-gold font-black">DESIGNER COUTURE SHOWCASE</span>
                <h3 className="font-serif text-2xl text-white italic">Behance-Inspired Creative Arena</h3>
                <p className="text-white/45 text-xs font-light">Explore blueprints, high-contrast mock prints, hand-drawn design concepts, and interactive moodboards.</p>
              </div>

              <button
                onClick={() => setShowFormModal(true)}
                className="px-6 py-3.5 bg-gradient-to-r from-lotus-pink to-shakti-gold text-shakti-black text-[10.5px] uppercase tracking-[0.2em] font-black hover:opacity-95 transition-all shadow-lg shadow-lotus-pink/5 flex items-center gap-2 rounded-xs select-none shadow-sm"
              >
                <Plus className="w-4 h-4 text-shakti-black stroke-[3]" />
                <span>Upload Design Concept</span>
              </button>
            </div>

            {/* SAVED FILTER TABS */}
            {currentUser && (
              <div className="flex border-b border-white/10 pb-1.5 gap-6">
                <button
                  onClick={() => setUploadsSubTab('all')}
                  className={`text-[10px] uppercase tracking-widest font-black transition-all pb-2 border-b-2 cursor-pointer ${
                    uploadsSubTab === 'all'
                      ? 'border-shakti-gold text-shakti-gold'
                      : 'border-transparent text-white/40 hover:text-white'
                  }`}
                >
                  All Platform Creations ({designs.filter(d => d.visibility === 'public' || isAdminMode).length})
                </button>
                <button
                  onClick={() => setUploadsSubTab('saved')}
                  className={`text-[10px] uppercase tracking-widest font-black transition-all pb-2 border-b-2 flex items-center gap-2 cursor-pointer ${
                    uploadsSubTab === 'saved'
                      ? 'border-shakti-gold text-shakti-gold'
                      : 'border-transparent text-white/40 hover:text-white'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5 fill-current/10" />
                  My Saved Couture Vault ({savedDesigns.length})
                </button>
              </div>
            )}

            {/* Design Masonry Board Grid */}
            {loading ? (
              <div className="text-center py-20">
                <RefreshCw className="w-8 h-8 text-shakti-gold animate-spin mx-auto mb-3" />
                <span className="text-xs uppercase tracking-widest text-white/30 font-mono">SYNCOPANISING DESIGN CORES...</span>
              </div>
            ) : designs.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-white/10 rounded-sm">
                <Compass className="w-12 h-12 text-white/20 mx-auto mb-4 animate-bounce" />
                <h4 className="font-serif text-xl italic text-white/70">No Creative Designs Lodged</h4>
                <p className="text-[10px] uppercase tracking-widest text-white/30 mt-1">Submit your first blueprint sketch to ignite the board.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {designs
                  .filter(d => d.visibility === 'public' || isAdminMode)
                  .filter(d => uploadsSubTab === 'all' || savedDesigns.includes(d.id))
                  .map((item) => {
                    const isPending = item.status === 'pending';
                    const isRejected = item.status === 'rejected';

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      whileHover={{ y: -6 }}
                      className="group bg-[#0d070b] border border-white/5 p-6 rounded-sm relative overflow-hidden flex flex-col justify-between hover:border-shakti-gold/30 transition-all duration-300 shadow-xl"
                    >
                      {/* Top Overlay Badge & Actions */}
                      <div className="space-y-4">
                        <div className="relative aspect-[4/3] rounded-sm overflow-hidden border border-white/10 bg-neutral-900">
                          {/* AI Upscale Glowing Overlay if enhanced */}
                          {item.aiEnhanced && (
                            <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#ff2d55]/30 to-transparent p-2 text-center select-none backdrop-blur-xs font-mono font-black text-[7.5px] text-white uppercase tracking-[0.2em] border-t border-[#ff2d55]/30">
                              ⚡ ULTRA-AI RES_COMPRESS ENHANCED ACTIVATED
                            </div>
                          )}

                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className={`w-full h-full object-cover transition-all duration-500 ease-out transform group-hover:scale-108 ${
                              item.aiEnhanced 
                                ? 'brightness-[1.15] contrast-105 saturate-110 group-hover:brightness-[1.25]' 
                                : 'brightness-85 group-hover:brightness-105'
                            }`}
                            referrerPolicy="no-referrer"
                          />

                          {/* Approval Status indicators */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
                            <span className="px-2 py-0.5 bg-black/85 text-[7px] text-shakti-gold font-black uppercase tracking-widest font-mono border border-white/15">
                              {item.category}
                            </span>
                            {isPending && (
                              <span className="px-2 py-0.5 bg-yellow-400 text-black text-[7px] font-black uppercase tracking-widest font-mono rounded-full self-start">
                                Verification Queue
                              </span>
                            )}
                            {isRejected && (
                              <span className="px-2 py-0.5 bg-[#ff2d55] text-white text-[7px] font-black uppercase tracking-widest font-mono rounded-full self-start">
                                Locked Draft
                              </span>
                            )}
                          </div>

                          <div className="absolute top-2 right-2 z-10 flex gap-1 items-center bg-black/75 px-1.5 py-0.5 border border-white/10 text-[8.5px] text-white/80 font-mono font-bold">
                            {item.visibility === 'public' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-[#ff2d55]" />}
                            <span className="text-[7.5px] uppercase tracking-tighter">{item.visibility}</span>
                          </div>
                        </div>

                        {/* Text description */}
                        <div className="pt-2 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-serif text-xl text-white group-hover:text-shakti-gold transition-colors truncate">
                              {item.title}
                            </h4>
                            <span className="text-[10px] font-semibold text-white/50 shrink-0 font-mono italic">
                              by {item.designer}
                            </span>
                          </div>

                          <p className="text-white/50 text-[11px] leading-relaxed font-light min-h-[50px]">
                            {item.description}
                          </p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {(item.tags || []).map((tag: string, tid: number) => (
                              <span key={tid} className="text-[7.5px] font-mono font-black tracking-widest bg-white/5 border border-white/10 text-white/60 px-1.5 py-0.5 uppercase">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Interactive Controls & Live Comment list */}
                      <div className="mt-6 pt-4 border-t border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleLikeDesign(item.id)}
                              className="flex items-center gap-1.5 text-white/50 hover:text-[#ff2d55] text-[9.5px] uppercase tracking-widest transition-colors font-black font-sans cursor-pointer whitespace-nowrap"
                            >
                              <Heart className="w-3.5 h-3.5 fill-current text-[#ff2d55]/10 hover:text-[#ff2d55]" />
                              <span>AURA BOOSTS ({item.likes || 0})</span>
                            </button>
                            
                            <button
                              onClick={() => handleToggleBookmark(item.id)}
                              className={`flex items-center gap-1.5 text-[9.5px] uppercase tracking-widest transition-colors font-black font-sans cursor-pointer whitespace-nowrap ${
                                savedDesigns.includes(item.id) ? 'text-shakti-gold hover:text-white' : 'text-white/40 hover:text-shakti-gold'
                              }`}
                              title={savedDesigns.includes(item.id) ? "Remove from Saved Vault" : "Save to Couch Vault"}
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${savedDesigns.includes(item.id) ? 'fill-current' : ''}`} />
                              <span>{savedDesigns.includes(item.id) ? 'SAVED' : 'SAVE'}</span>
                            </button>
                          </div>
                          
                          <span className="text-[8.5px] font-mono text-white/30 uppercase shrink-0">{item.timestamp}</span>
                        </div>

                        {/* Compact comments list */}
                        <div className="space-y-1.5 max-h-[105px] overflow-y-auto pr-1">
                          <span className="text-[7px] uppercase tracking-widest text-[#ff2d55] font-black block">Critic Stances ({item.comments?.length || 0})</span>
                          {(item.comments || []).map((comm: any, cIdx: number) => (
                            <div key={comm.id || cIdx} className="text-[11px] leading-relaxed text-white/80 bg-white/[0.01] p-1.5 border border-white/5 rounded-xs">
                              <strong className="text-shakti-gold uppercase text-[7.5px] tracking-wider block font-black mb-0.5">{comm.user}:</strong>
                              <span className="italic block text-white/65">"{comm.text}"</span>
                            </div>
                          ))}
                        </div>

                        {/* Inline Comment submit */}
                        <form onSubmit={(e) => handlePostDesignComment(item.id, e)} className="flex gap-2">
                          <input
                            type="text"
                            required
                            placeholder="State review critique..."
                            value={commentInputs[item.id] || ''}
                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                            className="flex-1 bg-white/[0.02] border border-white/10 p-2 text-xs text-white placeholder:text-white/20 outline-none focus:border-shakti-gold font-light rounded-none"
                          />
                          <button
                            type="submit"
                            className="px-3 bg-shakti-gold text-shakti-black text-[9px] uppercase tracking-widest font-bold hover:bg-shakti-gold-light transition-colors"
                          >
                            POST
                          </button>
                        </form>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* VIEW 3: COLLEGE & UNIVERSITY SHOWS */}
        {activeTab === 'university' && (
          <motion.div
            key="university"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-12"
          >
            {/* Show Highlights / Countdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Countdown panel */}
              <div className="lg:col-span-1 bg-gradient-to-b from-[#1b0a17] to-shakti-black border border-shakti-gold/30 p-8 rounded-sm relative overflow-hidden flex flex-col justify-between shadow-xl">
                <div className="space-y-4">
                  <span className="px-2.5 py-0.5 bg-shakti-gold text-shakti-black text-[7.5px] uppercase tracking-[0.25em] font-black font-sans rounded-xs">
                    NEAREST MAJOR CAMPUS COUTURE SHOW
                  </span>
                  <h4 className="font-serif text-3xl italic text-white leading-tight">Lotus Resonance 2026</h4>
                  <p className="text-[10px] uppercase tracking-widest text-[#ff2d55] font-black font-mono">NIFT Delhi Amphitheatre</p>
                  
                  {/* Digital countdown digits */}
                  <div className="py-6 border-y border-white/10 my-4 text-center">
                    <span className="text-2xl md:text-3xl font-mono tracking-widest font-black text-shakti-gold bg-black/60 px-4 py-2 border border-shakti-gold/20 block rounded-sm">
                      {timeRemaining}
                    </span>
                    <span className="text-[7.5px] uppercase tracking-[0.3em] text-white/35 font-mono block mt-2">D : H : M : S UNTIL LOCKOUT</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <span className="text-[8px] uppercase tracking-widest text-white/30 block">VIP PRESETS AVAILABLE</span>
                  <div className="text-[10.5px] tracking-wide text-white/60 leading-relaxed font-light">
                     Registered model students gain fast-track passage through backstage diagnostics. Use registration below!
                  </div>
                </div>
              </div>

              {/* Event listings database board */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <span className="text-[9px] uppercase tracking-[0.4em] text-white/40 block font-bold font-mono">
                    ACTIVE REGISTERED UNIVERSITIES ({events.length})
                  </span>
                  <span className="px-2.5 py-0.5 bg-white/5 border border-white/10 text-white/60 text-[8px] font-mono">SYNC STATUS: NORMAL</span>
                </div>

                <div className="space-y-6 max-h-[420px] overflow-y-auto pr-2">
                  {events.length === 0 ? (
                    <div className="text-center py-10 border border-white/5 text-white/30 text-xs font-mono">
                      NO SHOW TIMES CURRENTLY ENROLLED in database.
                    </div>
                  ) : (
                    events.map((e) => (
                      <div
                        key={e.id}
                        className="p-6 bg-white/[0.01] border border-white/5 hover:border-shakti-gold/20 rounded-sm transition-all flex flex-col md:flex-row gap-6 justify-between select-none"
                      >
                        <div className="space-y-4 flex-1">
                          <div>
                            <span className="text-[8px] uppercase tracking-widest text-shakti-gold font-black font-mono block mb-1">
                              🏫 {e.collegeName}
                            </span>
                            <h4 className="font-serif text-2xl italic text-white">{e.name}</h4>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-[10.5px] font-sans font-light">
                            <div className="space-y-1 text-white/60">
                              <span className="text-[7px] uppercase tracking-widest text-white/20 block font-mono">VENUE DETAILS</span>
                              <span className="font-bold flex items-center gap-1 text-white/80">
                                <MapPin className="w-3 h-3 text-shakti-gold shrink-0" /> {e.venue}
                              </span>
                            </div>
                            <div className="space-y-1 text-white/60">
                              <span className="text-[7px] uppercase tracking-widest text-white/20 block font-mono">SCHEDULE TIME</span>
                              <span className="font-bold flex items-center gap-1 text-white/80">
                                <Clock className="w-3 h-3 text-shakti-gold shrink-0" /> {e.date} @ {e.time}
                              </span>
                            </div>
                            <div className="space-y-1 text-white/60 col-span-2 md:col-span-1">
                              <span className="text-[7px] uppercase tracking-widest text-white/20 block font-mono">REGISTRANTS</span>
                              <span className="font-bold flex items-center gap-1 text-white/80">
                                <Users className="w-3 h-3 text-shakti-gold shrink-0" /> {(e.models || []).length} applicants
                              </span>
                            </div>
                          </div>

                          {/* Lineups */}
                          <div className="p-3 bg-white/[0.01] border border-white/5 space-y-1 rounded-sm">
                            <span className="text-[7px] uppercase tracking-widest text-[#ff2d55] block font-black">Performance Lineup List</span>
                            <div className="flex flex-wrap gap-2">
                              {(e.lineup || []).map((line: string, i: number) => (
                                <span key={i} className="text-[8.5px] bg-[#160410] border border-white/10 text-white/70 px-2 py-0.5 rounded-xs italic">
                                  {i+1}. {line}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Live announcements marquee */}
                          {(e.announcements || []).length > 0 && (
                            <div className="p-3 bg-[#1e070e] border border-[#ff2d55]/20 text-white/80 text-[10px] space-y-1 rounded-xs">
                              <div className="flex items-center gap-1.5 text-[#ff2d55] font-black uppercase text-[8px] tracking-widest animate-pulse">
                                <Megaphone className="w-3 h-3 text-[#ff2d55] shrink-0" /> DIRECT ANNOUNCEMENT FROM THE DECK:
                              </div>
                              <p className="italic font-sans text-white/90">"{e.announcements[0].text}"</p>
                              <span className="text-[6.5px] text-white/40 block text-right font-mono">{e.announcements[0].timestamp}</span>
                            </div>
                          )}
                        </div>

                        {/* Right column: Action */}
                        <div className="flex flex-col justify-end shrink-0 md:border-l md:border-white/5 md:pl-6">
                          <button
                            onClick={() => setSelectedShowForReg(e)}
                            className="px-5 py-3.5 bg-shakti-gold hover:bg-shakti-gold-light text-shakti-black text-[9.5px] uppercase tracking-widest font-black transition-all flex items-center justify-center gap-2 rounded-xs select-none cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Apply to Participate</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Application Form Modal overlay */}
            {selectedShowForReg && (
              <div className="fixed inset-0 z-[1002] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full max-w-lg bg-[#0e040a] border border-shakti-gold/30 p-8 rounded-sm space-y-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[8.5px] uppercase tracking-widest text-shakti-gold font-bold">CAMPUS AUDITION REGISTRATION</span>
                      <h4 className="font-serif text-3xl italic text-white mt-1">Enroll in {selectedShowForReg.name}</h4>
                    </div>
                    <button 
                      onClick={() => setSelectedShowForReg(null)}
                      className="text-white/40 hover:text-white transition-colors p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleRegisterForShow} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[8.5px] uppercase tracking-widest text-[#ff2d55] font-black">Full Legal Name</label>
                      <input
                        required
                        type="text"
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        placeholder="STUDENT ARTIST NAME"
                        className="w-full bg-white/5 border border-white/10 p-3 text-xs tracking-widest text-white outline-none focus:border-shakti-gold rounded-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[8.5px] uppercase tracking-widest text-[#ff2d55] font-black">Email Endpoint</label>
                      <input
                        required
                        type="email"
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="STUDENT@CAMPUS.EDU"
                        className="w-full bg-white/5 border border-white/10 p-3 text-xs tracking-widest text-white outline-none focus:border-shakti-gold rounded-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[8.5px] uppercase tracking-widest text-[#ff2d55] font-black">Designatory Role Pathway</label>
                      <select
                        value={regRole}
                        onChange={e => setRegRole(e.target.value)}
                        className="w-full bg-neutral-900 border border-white/10 p-3 text-xs tracking-widest text-white outline-none focus:border-shakti-gold rounded-none"
                      >
                        <option value="Model Companion">Ramp walk candidate</option>
                        <option value="Student Designer">Couture Designer</option>
                        <option value="Stylist Assistant">Wardrobe specialist</option>
                        <option value="PR coordinator">Aesthetic coverage</option>
                      </select>
                    </div>

                    <div className="pt-4 flex gap-4">
                      <button
                        type="button"
                        onClick={() => setSelectedShowForReg(null)}
                        className="flex-1 py-3 border border-white/10 text-white/50 text-[9px] uppercase tracking-widest font-bold hover:text-white"
                      >
                        Abort
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-shakti-gold text-shakti-black text-[9px] uppercase tracking-widest font-black"
                      >
                        Confirm Audition Spot
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {/* VIEW 4: ADMIN / OWNER BACKSTAGE MODERATION DESK */}
        {activeTab === 'admin' && (
          <motion.div
            key="admin"
            id="admin-tab-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-12 animate-fade-in"
          >
            {(!currentUser || currentUser.role !== 'owner') ? (
              // Secure Gated Screen
              <div className="max-w-xl mx-auto p-8 bg-[#090308]/90 border border-shakti-gold/30 rounded-sm relative overflow-hidden text-center space-y-8 shadow-2xl my-6">
                <div className="absolute -right-20 -top-20 w-44 h-44 bg-shakti-gold/5 blur-3xl rounded-full" />
                
                <div className="space-y-4 font-sans">
                  <div className="w-16 h-16 rounded-full bg-shakti-gold/10 border border-shakti-gold/40 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Lock className="w-8 h-8 text-shakti-gold" />
                  </div>
                  <h4 className="font-serif text-3xl italic text-white leading-tight">Owner Control Gated</h4>
                  <p className="text-xs text-white/50 leading-relaxed font-light">
                    The Backstage Control Desk contains raw audition entries, digital designs pipelines, and system configuration terminals. Please authenticate as the Platform Owner to proceed.
                  </p>
                </div>

                {/* Inline fast passcode unlock */}
                <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xs space-y-4 font-sans">
                  <span className="text-[8px] uppercase tracking-widest text-[#ff2d55] font-black block">Quick Console Unlock Passcode</span>
                  <div className="flex gap-2">
                    <input
                      required
                      type="password"
                      placeholder="ENTER PIN CODE (shakti2026)"
                      id="admin-quick-passcode"
                      className="flex-1 bg-white/5 border border-white/10 p-2 text-xs text-white placeholder:text-white/20 outline-none focus:border-shakti-gold text-center"
                    />
                    <button
                      onClick={() => {
                        const pinEl = document.getElementById("admin-quick-passcode") as HTMLInputElement;
                        const pinValue = pinEl?.value;
                        if (pinValue === 'shakti2026' || pinValue === 'admin') {
                          const mockOwner = {
                            name: "Platform Owner",
                            email: "owner@shaktiyug.com",
                            role: "owner"
                          };
                          localStorage.setItem('shakti_vogue_user', JSON.stringify(mockOwner));
                          setCurrentUser(mockOwner);
                        } else {
                          setAuthError("Unauthorized Access Code. Passcode validation failed.");
                        }
                      }}
                      className="px-4 py-2 bg-shakti-gold text-shakti-black text-[9px] uppercase tracking-widest font-black transition-all hover:bg-shakti-gold-light cursor-pointer"
                    >
                      Authorize
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <button
                    onClick={() => {
                      const mockOwner = {
                        name: "Demo Owner",
                        email: "owner@shaktiyug.com",
                        role: "owner"
                      };
                      localStorage.setItem('shakti_vogue_user', JSON.stringify(mockOwner));
                      setCurrentUser(mockOwner);
                    }}
                    className="text-[9px] text-shakti-gold uppercase tracking-[0.25em] font-black hover:underline px-4 py-2 border border-shakti-gold/20 bg-shakti-gold/5 w-full transition-all cursor-pointer"
                  >
                    ⚡ Instant Demo Owner Bypass (1-Click)
                  </button>
                </div>
              </div>
            ) : (
              // True Authenticated Owner View
              <>
            {/* Quick stats dashboard cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Submitted Designs', val: totalSubmissions, sub: 'In pipeline database', color: 'text-shakti-gold' },
                { label: 'Active Approved Designs', val: approvedDesigns, sub: 'Public boards visibility', color: 'text-green-400' },
                { label: 'Pending Moderation', val: pendingDesigns, sub: 'Requiring immediate action', color: 'text-yellow-400' },
                { label: 'University Show Anchors', val: events.length, sub: 'Coordinated programs', color: 'text-pink-400' }
              ].map((stat, i) => (
                <div key={i} className="p-5 bg-white/[0.01] border border-white/5 rounded-xs space-y-1.5 shadow-md">
                  <span className="text-[7.5px] uppercase tracking-widest text-white/30 block font-black">{stat.label}</span>
                  <div className={`text-3xl md:text-4xl font-mono font-black ${stat.color}`}>{stat.val}</div>
                  <span className="text-[7.5px] font-mono text-white/40 block uppercase">{stat.sub}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column: Moderating design queue */}
              <div className="bg-[#0b0509] border border-white/5 p-6 md:p-8 rounded-sm space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-shakti-gold" />
                    <span className="text-[9.5px] uppercase tracking-[0.3em] text-white font-black">Moderate Submissions</span>
                  </div>
                  <span className="text-[8px] bg-[#ff2d55] text-white px-2 py-0.5 rounded-full font-mono">{designs.length} TOTAL REGISTERED</span>
                </div>

                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                  <AnimatePresence mode="popLayout">
                    {designs.length === 0 ? (
                      <motion.div
                        key="no-designs"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-12 text-white/30 text-xs font-mono uppercase"
                      >
                        No design submissions found in registry.
                      </motion.div>
                    ) : (
                      designs.map((design) => (
                        <motion.div
                          layout
                          key={design.id}
                          initial={{ opacity: 0, scale: 0.95, y: 15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -15 }}
                          transition={{ type: "spring", stiffness: 350, damping: 28 }}
                          className="p-4 bg-white/[0.01] border border-white/5 hover:border-white/10 rounded-sm flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img 
                              src={design.image} 
                              alt={design.title} 
                              className="w-12 h-12 rounded-sm object-cover shrink-0 border border-white/15" 
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <span className="text-[8px] text-white/40 uppercase tracking-widest font-mono font-bold block">{design.category}</span>
                              <h5 className="font-serif italic text-white text-base truncate leading-tight mt-0.5">{design.title}</h5>
                              <span className="text-[7.5px] text-shakti-gold uppercase tracking-tighter font-mono">by {design.designer} • {design.status}</span>
                            </div>
                          </div>

                          {/* Moderate Buttons approach */}
                          <div className="flex items-center gap-2 shrink-0">
                            {design.status !== 'approved' && (
                              <button
                                onClick={() => handleModerateDesign(design.id, 'approved')}
                                className="p-2 bg-green-500/15 border border-green-500/40 text-green-400 hover:bg-green-500 hover:text-black rounded-sm transition-all focus:scale-110 cursor-pointer"
                                title="Approve Design"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            
                            {design.status !== 'rejected' && (
                              <button
                                onClick={() => handleModerateDesign(design.id, 'rejected')}
                                className="p-2 bg-[#ff2d55]/15 border border-[#ff2d55]/40 text-[#ff2d55] hover:bg-[#ff2d55] hover:text-white rounded-sm transition-all focus:scale-110 cursor-pointer"
                                title="Reject / Draft Mode"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right Column: Scheduling university performance */}
              <div className="bg-[#0b0509] border border-white/5 p-6 md:p-8 rounded-sm space-y-6">
                <div className="pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-shakti-gold" />
                    <span className="text-[9.5px] uppercase tracking-[0.3em] text-white font-black">Create Campus Fashion Show</span>
                  </div>
                </div>

                <form onSubmit={handleScheduleShow} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[8px] uppercase tracking-widest text-[#ff2d55] font-black">College name / Chapter</label>
                    <input
                      required
                      type="text"
                      value={newCollegeName}
                      onChange={e => setNewCollegeName(e.target.value)}
                      placeholder="e.g. NIFT Delhi, IIT Bombay Mood Indigo"
                      className="w-full bg-white/5 border border-white/10 p-2.5 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] uppercase tracking-widest text-[#ff2d55] font-black">Performance Show Theme Title</label>
                    <input
                      required
                      type="text"
                      value={newShowName}
                      onChange={e => setNewShowName(e.target.value)}
                      placeholder="e.g. Lotus Saffron Resonance, Cyber-Vogue Week"
                      className="w-full bg-white/5 border border-white/10 p-2.5 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[8px] uppercase tracking-widest text-white/35 font-bold">Planned Date</label>
                      <input
                        type="text"
                        value={newShowDate}
                        onChange={e => setNewShowDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 p-2 text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] uppercase tracking-widest text-white/35 font-bold">Planned Timing</label>
                      <input
                        type="text"
                        value={newShowTime}
                        onChange={e => setNewShowTime(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 p-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] uppercase tracking-widest text-white/35 font-bold">Venue Campus Location</label>
                    <input
                      type="text"
                      value={newShowVenue}
                      onChange={e => setNewShowVenue(e.target.value)}
                      placeholder="Convocation Hall, Campus Amphitheatre"
                      className="w-full bg-white/5 border border-white/10 p-2.5 text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-[#ff2d55] to-shakti-gold text-white text-[10px] uppercase tracking-widest font-black transition-all hover:opacity-90 mt-4 rounded-xs cursor-pointer"
                  >
                    DEPLOY SHOW SCHEDULE TO DATABASE
                  </button>
                </form>

                {/* Send general announcement box */}
                <div className="pt-6 border-t border-white/5 space-y-4">
                  <span className="text-[9px] uppercase tracking-widest font-mono text-[#ff2d55] font-black block">📢 Dispatch Live Event Announcement</span>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <textarea
                        required
                        id="dispatch-ann-text"
                        placeholder="DISPATCH LIVE CAMPAIGN BROADCAST TICKER TO FRONT-END..."
                        className="flex-1 bg-white/[0.02] border border-white/10 p-3 text-xs tracking-wide text-white h-16 resize-none rounded-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        const el = document.getElementById("dispatch-ann-text") as HTMLTextAreaElement;
                        if (!el || !el.value.trim() || events.length === 0) return;
                        const txt = el.value.trim();
                        let postedOk = false;
                        try {
                          const res = await fetch(`/api/events/${events[0].id}/announcement`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ text: txt })
                          });
                          if (res.ok) {
                            postedOk = true;
                          }
                        } catch (e) {
                          console.warn("Announcement API failed, doing local simulation fallback:", e);
                        }

                        // Ensure action succeeds client side
                        setEvents(prev => {
                          const next = prev.map((ev, idx) => {
                            if (idx === 0) {
                              const announcements = [{ text: txt, timestamp: "Just now" }, ...(ev.announcements || [])];
                              return { ...ev, announcements };
                            }
                            return ev;
                          });
                          localStorage.setItem('shakti_local_events', JSON.stringify(next));
                          return next;
                        });
                        el.value = '';
                      }}
                      className="w-full py-2 border border-[#ff2d55]/40 hover:bg-[#ff2d55]/10 text-white text-[8px] uppercase tracking-widest font-bold"
                    >
                      BROADCAST TO COUTURE MARQUEE
                    </button>
                  </div>
                </div>
              </div>
            </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* DESIGN UPLOAD OVERLAY FORM MODAL (Behance layout) */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-[1002] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.94, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 30, opacity: 0 }}
              className="w-full max-w-2xl bg-[#090307] border border-shakti-gold/30 p-8 md:p-10 rounded-sm relative shadow-2xl my-10"
            >
              <div className="flex items-start justify-between pb-4 border-b border-white/10">
                <div>
                  <span className="text-[8.5px] uppercase tracking-widest text-shakti-gold font-bold">COUTURE STUDIO DESK</span>
                  <h4 className="font-serif text-3xl italic text-gold-glow text-white mt-1">Enroll Concept Blueprint</h4>
                </div>
                <button 
                  onClick={() => setShowFormModal(false)}
                  className="text-white/40 hover:text-white transition-colors p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitDesign} className="space-y-6 pt-6 font-sans">
                {/* Drag and Drop premium Area */}
                <div className="space-y-1.5">
                  <label className="text-[8.5px] uppercase tracking-widest text-[#ff2d55] font-black">Visual Asset / Sketch file</label>
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border border-dashed p-6 text-center transition-all ${
                      dragActive ? 'border-shakti-gold bg-shakti-gold/5' : 'border-white/10 hover:border-shakti-gold/30 bg-white/[0.01]'
                    }`}
                  >
                    <Upload className="w-8 h-8 text-shakti-gold mx-auto mb-3 animate-bounce" />
                    <div>
                      <span className="text-[10px] text-white/80 block uppercase font-bold tracking-wider">
                        Drag & Drop sketch or Drag image above
                      </span>
                      <span className="text-[8px] text-white/30 block uppercase mt-1">
                        High resolution JPG, PNG, WEBP, PDF formats welcome
                      </span>
                    </div>
                  </div>

                  {/* Asset previews and randomizer */}
                  <div className="p-3 bg-white/[0.02] border border-white/10 rounded-xs flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img src={designImage} className="w-12 h-12 object-cover border border-white/15" alt="Active pre-render" referrerPolicy="no-referrer" />
                      <div>
                        <span className="text-[7.5px] uppercase tracking-widest text-[#ff2d55] block font-black">Preselected Asset Preview</span>
                        <span className="text-[9.5px] text-white/60 block font-mono">Dynamic Unsplash Render</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={selectRandomAsset}
                      className="px-3 py-1.5 border border-white/10 text-white/60 hover:text-white hover:border-shakti-gold text-[8px] uppercase tracking-widest transition-all"
                    >
                      Cycle Preview Art
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[8.5px] uppercase tracking-widest text-[#ff2d55] font-black">Design Blueprint Title</label>
                    <input
                      required
                      type="text"
                      value={designTitle}
                      onChange={e => setDesignTitle(e.target.value)}
                      placeholder="e.g. Lotus Saffron Bodice"
                      className="w-full bg-white/5 border border-white/10 p-3 text-xs tracking-widest text-white outline-none focus:border-shakti-gold rounded-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8.5px] uppercase tracking-widest text-[#ff2d55] font-black">Your Artist / Model Alias</label>
                    <input
                      type="text"
                      value={designerName}
                      onChange={e => setDesignerName(e.target.value)}
                      placeholder="ARTIST NAME"
                      className="w-full bg-white/5 border border-white/10 p-3 text-xs tracking-widest text-white outline-none focus:border-shakti-gold rounded-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[8.5px] uppercase tracking-widest text-[#ff2d55] font-black">Creative Category</label>
                    <select
                      value={designCategory}
                      onChange={e => setDesignCategory(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/10 p-3 text-xs tracking-widest text-white outline-none focus:border-shakti-gold rounded-none"
                    >
                      {CATEGORIES.map((cat, ci) => (
                        <option key={ci} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8.5px] uppercase tracking-widest text-[#ff2d55] font-black">Aesthetic Metadata tags (comma separated)</label>
                    <input
                      type="text"
                      value={designTags}
                      onChange={e => setDesignTags(e.target.value)}
                      placeholder="LOTUS, NEON, VEDIC"
                      className="w-full bg-white/5 border border-white/10 p-3 text-xs tracking-widest text-white outline-none focus:border-shakti-gold rounded-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8.5px] uppercase tracking-widest text-[#ff2d55] font-black">Creative Concept / Description / Inspiration</label>
                  <textarea
                    required
                    value={designDesc}
                    onChange={e => setDesignDesc(e.target.value)}
                    placeholder="DESCRIBE THE CORE INSPIRATION AND INTEGRATED MATERIALS..."
                    className="w-full bg-white/5 border border-white/10 p-3.5 text-xs text-white h-24 outline-none focus:border-shakti-gold resize-none rounded-none"
                  />
                </div>

                {/* AI enhancement and visibility settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* AI power switcher */}
                  <div className="p-4 bg-white/[0.01] border border-white/10 rounded-sm flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-white font-bold block">AI Image Upscaler</span>
                      <span className="text-[7px] text-white/40 uppercase block">Apply predictive clarity filters</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAiEnhanced(!isAiEnhanced);
                        if (!isAiEnhanced) {
                          triggerUploadSimulator();
                        }
                      }}
                      className={`px-3 py-1.5 text-[8.5px] uppercase tracking-widest font-black transition-all ${
                        isAiEnhanced ? 'bg-gradient-to-r from-lotus-pink to-shakti-gold text-shakti-black' : 'border border-white/10 text-white/50'
                      }`}
                    >
                      {isAiEnhanced ? 'ACTIVE-GLOW ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="p-4 bg-white/[0.01] border border-white/10 rounded-sm flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-white font-bold block">Visibility Settings</span>
                      <span className="text-[7px] text-white/40 uppercase block">Keep as private sketch or share public</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDesignVisibility('public')}
                        className={`p-1.5 text-[7.5px] font-black uppercase border tracking-tighter ${
                          designVisibility === 'public' ? 'border-shakti-gold text-shakti-gold bg-shakti-gold/5' : 'border-white/10 text-white/40'
                        }`}
                      >
                        Public
                      </button>
                      <button
                        type="button"
                        onClick={() => setDesignVisibility('private')}
                        className={`p-1.5 text-[7.5px] font-black uppercase border tracking-tighter ${
                          designVisibility === 'private' ? 'border-shakti-gold text-shakti-gold bg-shakti-gold/5' : 'border-white/10 text-white/40'
                        }`}
                      >
                        Private
                      </button>
                    </div>
                  </div>
                </div>

                {isUploading && (
                  <div className="space-y-1.5 font-mono">
                    <div className="flex justify-between items-center text-[8.5px] tracking-widest text-shakti-gold">
                      <span>DISSOLVING GRAPHICAL SKETCHES...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-1 bg-white/10 w-full overflow-hidden rounded-full">
                      <div 
                        className="h-full bg-gradient-to-r from-lotus-pink to-shakti-gold"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 flex gap-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="flex-1 py-4 border border-white/10 text-white/50 text-[10px] uppercase tracking-widest font-bold hover:text-white transition-colors"
                  >
                    Discard Concept
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="flex-1 py-4 bg-gradient-to-r from-lotus-pink to-shakti-gold text-shakti-black text-[10px] uppercase tracking-widest font-black transition-colors"
                  >
                    Commit Blueprint to Board
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
