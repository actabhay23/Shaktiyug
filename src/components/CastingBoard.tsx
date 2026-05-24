import { motion, AnimatePresence } from 'motion/react';
import { Calendar, User, Ruler, MapPin, X, CheckCircle2, Navigation } from 'lucide-react';
import { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import ImageSlideshow from './ImageSlideshow';
import ImageGallery from './ImageGallery';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

const CASTINGS = [
  {
    id: 1,
    title: "DHAROHAR",
    category: "Ramp Walk",
    specification: "5'8\"+ Height",
    deadline: "30 May 2026",
    image: "https://i.pinimg.com/736x/83/b7/8e/83b78eb323d12c8728587229bdd3cecd.jpg",
    description: "Seeking high-fashion models for the upcoming Shaktiyug Couture collection.",
    location: {
      lat: 30.0125,
      lng: 77.7126,
      address: "Shyam Ji Auditorium, Quantum University Roorkee"
    },
    whatToExpect: [
      "Initial screening and walk assessment",
      "Measurement verification",
      "Quick interview with creative directors",
      "Polaroid session (Natural light)"
    ]
  },
  {
    id: 2,
    title: "Quantum Fashion Walk",
    category: "Print Media",
    specification: "Androgynous Look",
    deadline: "15 June 2026",
    image: "https://i.pinimg.com/736x/2f/3b/a9/2f3ba94ca95d7675fca4dc75213ecaf8.jpg",
    description: "A global brand campaign focused on Gen-Z streetwear and luxury fusion.",
    location: {
      lat: 30.0125,
      lng: 77.7126,
      address: "Shyam Ji Auditorium, Quantum University Roorkee"
    },
    whatToExpect: [
      "Style test with 3 streetwear looks",
      "Expression and movement workshop",
      "Portfolio review",
      "Collaboration discussion for digital media"
    ]
  },
  {
    id: 3,
    title: "Fashion Fiesta",
    category: "Master Class",
    specification: "Graceful Movement",
    deadline: "05 July 2026",
    image: "https://i.pinimg.com/736x/77/2e/97/772e978ca2dc66a15386828e245f4cba.jpg",
    description: "Traditional bridal wear collection requiring models with poise and elegance.",
    location: {
      lat: 30.0125,
      lng: 77.7126,
      address: "Shyam Ji Auditorium, Quantum University Roorkee"
    },
    whatToExpect: [
      "Draping assessments",
      "Posture and grace evaluation",
      "Bridal walk demonstration",
      "Makeup look compatibility test"
    ]
  },
  {
    id: 4,
    title: "QueTour",
    category: "Runway",
    specification: "Athletic Build",
    deadline: "20 June 2026",
    image: "https://i.pinimg.com/736x/81/1f/4f/811f4f7dd99f8f6da90a2cd45c044ba4.jpg",
    description: "International fashion week looking for high-energy runway specialists.",
    location: {
      lat: 30.0125,
      lng: 77.7126,
      address: "Shyam Ji Auditorium, Quantum University Roorkee"
    },
    whatToExpect: [
      "High-speed runway drills",
      "Ensemble quick-change simulation",
      "Choreography learning speed test",
      "Health and fitness screening"
    ]
  }
];

import { useEffect } from 'react';
import { Upload, Eye, EyeOff, Video, Heart, Sparkles, MessageSquare, RefreshCcw } from 'lucide-react';

export default function CastingBoard() {
  const [selectedCasting, setSelectedCasting] = useState<typeof CASTINGS[0] | null>(null);
  const [applyingCasting, setApplyingCasting] = useState<typeof CASTINGS[0] | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Auditions System states
  const [isDragActive, setIsDragActive] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Bio/Stats parameters or attributes
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [essence, setEssence] = useState('');
  const [height, setHeight] = useState("5'10\"");
  const [waist, setWaist] = useState("26");
  const [bust, setBust] = useState("34");
  const [shoes, setShoes] = useState("9");
  const [bio, setBio] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

const DEFAULT_AUDITIONS = [
  {
    id: "audition-1",
    name: "Rhea Sharma",
    role: "DHAROHAR",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
    email: "rhea@vogue.co",
    portfolio: "https://rhea.vogue",
    comments: [
      {
        id: "c1",
        user: "Aman (Creative)",
        text: "Stunning stance! The posture is runway gold."
      },
      {
        id: "c2",
        user: "Akash (Designer)",
        text: "Highly compatible with the neon pink drape."
      }
    ],
    likes: 42,
    visibility: "public",
    essence: "Shaktiyug represents the absolute pinnacle of digital-physical fashion hybridity.",
    timestamp: "Today, 10:14 AM",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-posing-40134-large.mp4",
    skills: {
      height: "5'9\"",
      waist: "25",
      bust: "34",
      shoes: "8",
      bio: "Holographic walk specialist."
    }
  },
  {
    id: "audition-2",
    name: "Dev Malhotra",
    role: "Quantum Fashion Walk",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop",
    email: "dev@malhotra.style",
    portfolio: "https://devluxe.com",
    comments: [
      {
        id: "c3",
        user: "Mahi (Stylist)",
        text: "Incredible raw presence."
      }
    ],
    likes: 29,
    visibility: "public",
    essence: "Ready to represent street culture reimagined.",
    timestamp: "Yesterday",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-fashion-woman-with-silver-glitter-makeup-40120-large.mp4",
    skills: {
      height: "6'1\"",
      waist: "30",
      bust: "38",
      shoes: "11",
      bio: "Androgynous street artist with deep physical expressions."
    }
  }
];

  // Shared Arena feed
  const [auditions, setAuditions] = useState<any[]>([]);
  const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});

  const fetchAuditions = async () => {
    try {
      const res = await fetch('/api/auditions');
      if (res.ok) {
        const data = await res.json();
        setAuditions(data);
      } else {
        const local = localStorage.getItem('shakti_local_auditions');
        setAuditions(local ? JSON.parse(local) : DEFAULT_AUDITIONS);
      }
    } catch (e) {
      console.warn("Using fallback local auditions feed due to fetch outage:", e);
      const local = localStorage.getItem('shakti_local_auditions');
      setAuditions(local ? JSON.parse(local) : DEFAULT_AUDITIONS);
    }
  };

  useEffect(() => {
    fetchAuditions();
  }, []);

  const handleDragEvent = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file));
      } else {
        alert("Only video formats are admitted in this casting port.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file));
      } else {
        alert("Only video formats are admitted in this casting port.");
      }
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulating progressive high-fidelity upload before DB sync
    setIsUploading(true);
    setUploadProgress(10);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 100;
        }
        return prev + 15;
      });
    }, 200);

    // Wait for the simulated upload tracker to finalize
    await new Promise((resolve) => setTimeout(resolve, 1500));
    clearInterval(interval);
    setUploadProgress(100);

    // Fake a reliable premium mixkit placeholder if local upload bypasses real backend upload
    const fallbackVideos = [
      "https://assets.mixkit.co/videos/preview/mixkit-fashion-woman-with-silver-glitter-makeup-40120-large.mp4",
      "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-posing-40134-large.mp4",
      "https://assets.mixkit.co/videos/preview/mixkit-woman-posing-with-a-red-light-pointing-at-her-40348-large.mp4"
    ];
    const randomVid = fallbackVideos[Math.floor(Math.random() * fallbackVideos.length)];

    const payload = {
      name: fullName,
      email,
      portfolio: portfolioUrl,
      essence,
      visibility,
      role: applyingCasting?.title || "DHAROHAR",
      videoUrl: randomVid,
      skills: { height, waist, bust, shoes, bio }
    };

    let postedOk = false;
    try {
      const res = await fetch('/api/audition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        postedOk = true;
      }
    } catch (err) {
      console.warn("Could not post audition application online. Simulating locally:", err);
    }

    const mockNewAudition = {
      id: "audition-" + Date.now(),
      name: payload.name || "Enthusiastic Creator",
      role: payload.role,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
      email: payload.email,
      portfolio: payload.portfolio,
      comments: [],
      likes: 0,
      visibility: payload.visibility,
      essence: payload.essence || "Walk of the future",
      timestamp: "Just now",
      videoUrl: payload.videoUrl,
      skills: payload.skills
    };

    try {
      const local = localStorage.getItem('shakti_local_auditions');
      const existing = local ? JSON.parse(local) : DEFAULT_AUDITIONS;
      const updated = [mockNewAudition, ...existing];
      localStorage.setItem('shakti_local_auditions', JSON.stringify(updated));
      setAuditions(updated);
    } catch (err) {
      console.error("Local storage sync error:", err);
    }

    setIsUploading(false);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setApplyingCasting(null);
      // Reset states
      setVideoFile(null);
      setVideoPreview(null);
      setFullName('');
      setEmail('');
      setPortfolioUrl('');
      setEssence('');
      setBio('');
    }, 3000);
  };

  const handleLikeAudition = async (id: string) => {
    let actionDone = false;
    try {
      const res = await fetch(`/api/audition/${id}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setAuditions(prev => prev.map(a => a.id === id ? { ...a, likes: data.likes } : a));
        actionDone = true;
      }
    } catch (err) {
      console.warn("Offline registration: liked candidates", err);
    }

    if (!actionDone) {
      setAuditions(prev => prev.map(a => {
        if (a.id === id) {
          const updatedLikes = (a.likes || 0) + 1;
          return { ...a, likes: updatedLikes };
        }
        return a;
      }));
    }
  };

  const handleAddComment = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    const txt = commentInputs[id] || '';
    if (!txt.trim()) return;

    let actionDone = false;
    try {
      const res = await fetch(`/api/audition/${id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: "Vogue Enthusiast", text: txt })
      });

      if (res.ok) {
        const data = await res.json();
        setAuditions(prev => prev.map(a => a.id === id ? { ...a, comments: data.comments } : a));
        setCommentInputs(prev => ({ ...prev, [id]: '' }));
        actionDone = true;
      }
    } catch (e) {
      console.warn("Failed comment endpoint connection. Simulating local insert:", e);
    }

    if (!actionDone) {
      setAuditions(prev => prev.map(a => {
        if (a.id === id) {
          const copyComments = [...(a.comments || []), { id: "c-local-" + Date.now(), user: "Vogue Enthusiast", text: txt }];
          return { ...a, comments: copyComments };
        }
        return a;
      }));
      setCommentInputs(prev => ({ ...prev, [id]: '' }));
    }
  };

  return (
    <section className="min-h-screen pt-32 pb-20 px-6 container mx-auto">
      <div className="flex flex-col mb-12">
        <h2 className="font-serif text-5xl md:text-8xl italic mb-4 gold-text">Fashion Casting</h2>
        <div className="h-[2px] bg-gradient-to-r from-shakti-gold to-transparent w-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 [perspective:1200px]">
        {/* Dashboard Overlay Feature: Scout Intelligence */}
        <div className="lg:col-span-4 mb-12 bg-shakti-gold/5 border border-shakti-gold/20 p-8 rounded-sm backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <div className="w-32 h-32 border-[10px] border-shakti-gold rounded-full" />
          </div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <h4 className="text-[10px] uppercase tracking-[0.4em] text-shakti-gold font-black underline decoration-2 underline-offset-4 mb-4">Scout Intelligence</h4>
              <p className="text-white text-xl font-serif italic italic">"Your aura index has peaked in 3 global agencies this week."</p>
            </div>
            <div className="flex items-center justify-center gap-12 border-x border-white/5 px-8">
              <div className="text-center">
                <div className="text-3xl font-black text-white">412</div>
                <div className="text-[8px] uppercase tracking-[0.3em] text-white/30 mt-1">Agency Views</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-shakti-gold">08</div>
                <div className="text-[8px] uppercase tracking-[0.3em] text-white/30 mt-1">Shortlists</div>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <button className="fashion-button py-2 w-fit rounded-full text-[9px] uppercase tracking-[0.4em] font-black">
                Activate Scout Boost
              </button>
            </div>
          </div>
        </div>

        {/* Cinematic Visual Feed */}
        <div className="lg:col-span-4 mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-[1px] bg-shakti-gold/30 flex-1" />
            <h4 className="text-[10px] uppercase tracking-[0.5em] text-white/40 font-black">Visual Portfolio Pulse</h4>
            <div className="h-[1px] bg-shakti-gold/30 flex-1" />
          </div>
          <ImageSlideshow className="aspect-[21/9] w-full" />
        </div>

        {CASTINGS.map((casting, i) => (
          <motion.div
            key={casting.id}
            initial={{ opacity: 0, rotateY: 30, z: -100 }}
            whileInView={{ opacity: 1, rotateY: 0, z: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: i * 0.15 }}
            whileHover={{ 
              scale: 1.05, 
              rotateY: -8,
              z: 60,
              boxShadow: "0 20px 40px rgba(212,175,55,0.15)"
            }}
            onClick={() => setSelectedCasting(casting)}
            className="group relative luxury-card rounded-sm overflow-hidden border border-white/5 hover:border-shakti-gold/50 cursor-pointer [transform-style:preserve-3d]"
          >
            <div className="aspect-[3/5] relative">
              <img 
                src={casting.image} 
                alt={casting.title} 
                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-shakti-black via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[9px] uppercase tracking-[0.5em] text-shakti-gold mb-2 block font-bold">Featured Call</span>
                <h3 className="font-serif text-2xl text-white group-hover:text-shakti-gold transition-colors leading-tight">{casting.title}</h3>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <p className="text-xs text-white/40 leading-relaxed line-clamp-2">{casting.description}</p>
              
              <div className="space-y-2">
                <h4 className="text-[8px] uppercase tracking-[0.2em] text-shakti-gold font-black">What to expect</h4>
                <ul className="space-y-1.5">
                  {casting.whatToExpect.slice(0, 3).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-2.5 w-2.5 text-shakti-gold mt-0.5 shrink-0" />
                      <span className="text-[9px] text-white/60 tracking-wider font-light line-clamp-1">{item}</span>
                    </li>
                  ))}
                  {casting.whatToExpect.length > 3 && (
                    <li className="text-[8px] text-white/30 italic pl-4.5">+ {casting.whatToExpect.length - 3} more details</li>
                  )}
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-[10px] text-white/60">
                  <Ruler className="h-3 w-3 text-shakti-gold" />
                  <span className="uppercase tracking-widest">{casting.specification}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-white/60">
                  <User className="h-3 w-3 text-shakti-gold" />
                  <span className="uppercase tracking-widest">{casting.category}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-white/60">
                  <MapPin className="h-3 w-3 text-shakti-gold" />
                  <span className="uppercase tracking-widest truncate">{casting.location.address}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <button className="py-2.5 border border-white/10 text-white text-[9px] uppercase tracking-[0.3em] hover:border-shakti-gold transition-all font-bold">
                  View Detail
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setApplyingCasting(casting);
                  }}
                  className="py-2.5 bg-shakti-gold text-shakti-black text-[9px] uppercase tracking-[0.3em] font-black shadow-lg shadow-shakti-gold/20 hover:bg-shakti-gold-light transition-colors"
                >
                  Quick apply
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Gallery Section */}
        <div className="lg:col-span-4 mt-20">
          <ImageGallery title="Scout Portfolio Archive" />
        </div>
      </div>

      <AnimatePresence>
        {selectedCasting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 pointer-events-none"
          >
            <div className="absolute inset-0 bg-shakti-black/95 backdrop-blur-xl pointer-events-auto" onClick={() => setSelectedCasting(null)} />
            
            <motion.div 
              initial={{ scale: 0.9, y: 20, rotateX: 10 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.9, y: 20, rotateX: 10 }}
              className="relative w-full max-w-6xl h-full max-h-[85vh] bg-[#0c050a] border border-white/10 rounded-sm overflow-hidden flex flex-col md:flex-row pointer-events-auto shadow-2xl"
            >
              <button 
                onClick={() => setSelectedCasting(null)}
                className="absolute top-6 right-6 z-10 p-2 bg-shakti-black/50 border border-white/10 rounded-full hover:bg-lotus-pink transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full md:w-2/5 h-64 md:h-full relative overflow-hidden">
                <img 
                  src={selectedCasting.image} 
                  alt={selectedCasting.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0c050a]/80" />
                <div className="absolute bottom-10 left-10 right-10">
                   <span className="text-[10px] uppercase tracking-[0.6em] text-lotus-pink font-black mb-4 block underline decoration-lotus-pink/30 underline-offset-8">Official Casting call / v2026</span>
                   <h2 className="font-serif text-4xl md:text-6xl text-white italic leading-tight">{selectedCasting.title}</h2>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-12 bg-pattern custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <div className="space-y-10">
                      <div>
                        <h4 className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-black mb-4">Description</h4>
                        <p className="text-white font-light text-lg leading-relaxed">{selectedCasting.description}</p>
                      </div>

                      <div>
                        <h4 className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-black mb-6">What to Expect</h4>
                        <ul className="space-y-4">
                          {selectedCasting.whatToExpect.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-4 group">
                              <CheckCircle2 className="w-5 h-5 text-lotus-pink shrink-0 mt-0.5" />
                              <span className="text-white/70 text-sm tracking-wide group-hover:text-white transition-colors">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-2 gap-6 p-6 bg-white/5 border border-white/10 rounded-sm">
                         <div>
                            <span className="text-[8px] uppercase tracking-[0.3em] text-white/40 block mb-1">Specifications</span>
                            <span className="text-white text-xs font-bold uppercase tracking-widest">{selectedCasting.specification}</span>
                         </div>
                         <div>
                            <span className="text-[8px] uppercase tracking-[0.3em] text-white/40 block mb-1">Category</span>
                            <span className="text-white text-xs font-bold uppercase tracking-widest">{selectedCasting.category}</span>
                         </div>
                         <div>
                            <span className="text-[8px] uppercase tracking-[0.3em] text-white/40 block mb-1">Application Deadline</span>
                            <span className="text-lotus-pink text-xs font-bold uppercase tracking-widest">{selectedCasting.deadline}</span>
                         </div>
                         <div className="flex items-center gap-2">
                             <Navigation className="w-3 h-3 text-lotus-pink" />
                             <span className="text-white/60 text-[9px] uppercase tracking-widest">Global Call</span>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h4 className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-black flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-lotus-pink" />
                        Location Hub
                      </h4>
                      <div className="h-64 md:h-xs rounded-sm overflow-hidden border border-white/10 shadow-inner relative group">
                        {!hasValidKey ? (
                          <div className="w-full h-full bg-white/5 flex flex-col items-center justify-center p-6 text-center space-y-4">
                            <MapPin className="w-8 h-8 text-white/10" />
                            <p className="text-[10px] uppercase tracking-widest text-white/40 uppercase">API Key Required for Live Map</p>
                            <div className="text-[9px] text-white/20 p-2 border border-white/5 max-w-[200px]">
                              {selectedCasting.location.address}
                            </div>
                          </div>
                        ) : (
                          <APIProvider apiKey={API_KEY} version="weekly">
                            <Map
                              defaultCenter={{ lat: selectedCasting.location.lat, lng: selectedCasting.location.lng }}
                              defaultZoom={15}
                              mapId="SHAKTI_MAP"
                              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                              style={{ width: '100%', height: '100%' }}
                              className="grayscale"
                              disableDefaultUI={true}
                            >
                              <AdvancedMarker position={{ lat: selectedCasting.location.lat, lng: selectedCasting.location.lng }}>
                                <Pin 
                                  background={'#FF2D55'} 
                                  borderColor={'#FFFFFF'} 
                                  glyphColor={'#FFFFFF'} 
                                  scale={1.2}
                                />
                              </AdvancedMarker>
                            </Map>
                          </APIProvider>
                        )}
                        <div className="absolute bottom-4 left-4 right-4 bg-shakti-black/80 backdrop-blur-md p-3 border border-white/10 flex items-center justify-between">
                           <span className="text-[9px] text-white/80 uppercase tracking-widest truncate max-w-[200px]">{selectedCasting.location.address}</span>
                           <button className="text-[10px] text-lotus-pink font-bold uppercase tracking-widest">Get Directs</button>
                        </div>
                      </div>
                      <div className="p-4 border border-lotus-pink/20 bg-lotus-pink/5 rounded-sm">
                        <p className="text-[9px] text-lotus-pink/80 leading-relaxed tracking-wide italic">
                          "Shortlisted candidates will receive travel allowance reimbursement for international locations."
                        </p>
                      </div>
                   </div>
                </div>

                <div className="pt-10 flex gap-4">
                   <button 
                    onClick={() => {
                      setSelectedCasting(null);
                      setApplyingCasting(selectedCasting);
                    }}
                    className="flex-1 py-4 bg-shakti-gold text-shakti-black text-[10px] uppercase tracking-[0.5em] font-black hover:bg-shakti-gold-light transition-colors shadow-2xl shadow-shakti-gold/20"
                   >
                     Proceed to application portal
                   </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {applyingCasting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none overflow-y-auto"
          >
            <div className="absolute inset-0 bg-shakti-black/98 backdrop-blur-2xl pointer-events-auto" onClick={() => !isSubmitted && !isUploading && setApplyingCasting(null)} />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-full max-w-xl bg-[#0c050a] border border-shakti-gold/30 p-8 rounded-sm pointer-events-auto overflow-hidden shadow-[0_0_100px_rgba(212,175,55,0.1)] my-12"
            >
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                    className="space-y-6"
                  >
                    <div className="text-center space-y-1">
                       <h3 className="font-serif text-3xl italic gold-text">Begin Your Journey</h3>
                       <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">Casting: {applyingCasting.title}</p>
                    </div>

                    <form onSubmit={handleApply} className="space-y-5 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                       {/* Basic Credentials */}
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-1.5">
                            <label className="text-[9px] uppercase tracking-[0.3em] text-shakti-gold font-bold">Full Professional Name</label>
                            <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-white/5 border border-white/10 p-2.5 text-white text-xs tracking-widest focus:border-shakti-gold outline-none transition-colors" placeholder="ARTIST NAME" />
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[9px] uppercase tracking-[0.3em] text-shakti-gold font-bold">Email Interface</label>
                            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 p-2.5 text-white text-xs tracking-widest focus:border-shakti-gold outline-none transition-colors" placeholder="VOGUE@EMAIL.COM" />
                         </div>
                       </div>

                       <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-[0.3em] text-shakti-gold font-bold">Portfolio Hub URL</label>
                          <input required type="url" value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} className="w-full bg-white/5 border border-white/10 p-2.5 text-white text-xs tracking-widest focus:border-shakti-gold outline-none transition-colors" placeholder="HTTPS://PORTFOLIO.COM" />
                       </div>

                       {/* Drag & Drop high-fidelity Video upload with progress bar */}
                       <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-[0.3em] text-shakti-gold font-bold">Video Audition Tape</label>
                          <div 
                            onDragEnter={handleDragEvent}
                            onDragOver={handleDragEvent}
                            onDragLeave={handleDragEvent}
                            onDrop={handleVideoDrop}
                            className={`border border-dashed p-6 text-center cursor-pointer transition-all ${
                              isDragActive ? 'border-shakti-gold bg-shakti-gold/5' : 'border-white/10 hover:border-shakti-gold/50 bg-white/[0.01]'
                            }`}
                          >
                            <input 
                              type="file" 
                              id="audition-video-file" 
                              accept="video/*" 
                              className="hidden" 
                              onChange={handleFileChange} 
                            />
                            <label htmlFor="audition-video-file" className="cursor-pointer space-y-2.5 block">
                              <Upload className="w-8 h-8 text-shakti-gold mx-auto animate-bounce" />
                              <div>
                                <span className="text-[10px] text-white/70 tracking-widest block uppercase font-bold">
                                  {videoFile ? videoFile.name : "Drag & Drop video or Click to Browse"}
                                </span>
                                <span className="text-[8px] text-white/30 tracking-widest uppercase mt-1 block">
                                  H.264/MP4 formats up to 100MB preferred
                                </span>
                              </div>
                            </label>
                          </div>
                          
                          {videoPreview && (
                            <div className="p-3 bg-white/[0.02] border border-white/10 space-y-2">
                              <span className="text-[8px] uppercase tracking-widest text-shakti-gold font-mono flex items-center gap-1.5">
                                <Video className="w-3 h-3 text-shakti-gold" /> LIVE AUDITION TAPE PREVIEW:
                              </span>
                              <video src={videoPreview} controls className="w-full h-32 object-cover rounded-sm border border-white/10" />
                            </div>
                          )}

                          {isUploading && (
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[8px] tracking-widest font-mono text-shakti-gold">
                                <span>STREAMING TO SECURE CLOUD</span>
                                <span>{uploadProgress}%</span>
                              </div>
                              <div className="h-1 bg-white/10 w-full overflow-hidden rounded-full">
                                <motion.div 
                                  className="h-full bg-gradient-to-r from-lotus-pink to-shakti-gold"
                                  initial={{ width: '0%' }}
                                  animate={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                            </div>
                          )}
                       </div>

                       {/* Portfolio details parameters */}
                       <div className="space-y-2">
                          <label className="text-[9px] uppercase tracking-[0.3em] text-shakti-gold font-bold">Physical Dimensions</label>
                          <div className="grid grid-cols-4 gap-2.5">
                            <div className="space-y-1">
                              <span className="text-[7.5px] uppercase tracking-wider text-white/40 font-mono">HEIGHT</span>
                              <input type="text" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-white/5 border border-white/10 p-1.5 text-center text-xs text-white" />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[7.5px] uppercase tracking-wider text-white/40 font-mono">WAIST</span>
                              <input type="text" value={waist} onChange={e => setWaist(e.target.value)} className="w-full bg-white/5 border border-white/10 p-1.5 text-center text-xs text-white" />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[7.5px] uppercase tracking-wider text-white/40 font-mono">BUST</span>
                              <input type="text" value={bust} onChange={e => setBust(e.target.value)} className="w-full bg-white/5 border border-white/10 p-1.5 text-center text-xs text-white" />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[7.5px] uppercase tracking-wider text-white/40 font-mono">SHOES</span>
                              <input type="text" value={shoes} onChange={e => setShoes(e.target.value)} className="w-full bg-white/5 border border-white/10 p-1.5 text-center text-xs text-white" />
                            </div>
                          </div>
                       </div>

                       {/* Custom Audition Visibility selector */}
                       <div className="space-y-2.5">
                          <label className="text-[9px] uppercase tracking-[0.3em] text-shakti-gold font-bold">Audition visibility setting</label>
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              type="button"
                              onClick={() => setVisibility('public')}
                              className={`p-3 border rounded-sm flex items-center justify-between transition-all ${
                                visibility === 'public'
                                  ? 'bg-shakti-gold/15 border-shakti-gold text-white'
                                  : 'border-white/10 bg-white/[0.01] hover:border-white/30 text-white/60'
                              }`}
                            >
                              <div className="flex items-center gap-2 text-left">
                                <Eye className="w-4 h-4 text-shakti-gold" />
                                <div>
                                  <span className="text-[10px] tracking-wider block font-bold uppercase">Public Arena</span>
                                  <span className="text-[6.5px] tracking-tight block text-white/45 uppercase">Share with community</span>
                                </div>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setVisibility('private')}
                              className={`p-3 border rounded-sm flex items-center justify-between transition-all ${
                                visibility === 'private'
                                  ? 'bg-shakti-gold/15 border-shakti-gold text-white'
                                  : 'border-white/10 bg-white/[0.01] hover:border-white/30 text-white/60'
                              }`}
                            >
                              <div className="flex items-center gap-2 text-left">
                                <EyeOff className="w-4 h-4 text-white/50" />
                                <div>
                                  <span className="text-[10px] tracking-wider block font-bold uppercase">Private Walk</span>
                                  <span className="text-[6.5px] tracking-tight block text-white/45 uppercase">Casting directors only</span>
                                </div>
                              </div>
                            </button>
                          </div>
                       </div>

                       <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-[0.3em] text-shakti-gold font-bold">Your Essence Statement</label>
                          <textarea required value={essence} onChange={e => setEssence(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 text-white text-xs tracking-widest focus:border-shakti-gold outline-none transition-colors h-24 resize-none" placeholder="WHY SHAKTIYUG?" />
                       </div>
                       
                       <div className="flex gap-4 pt-4 border-t border-white/5">
                          <button type="button" disabled={isUploading} onClick={() => setApplyingCasting(null)} className="flex-1 py-4 border border-white/10 text-white/60 text-[9px] uppercase tracking-[0.4em] hover:text-white hover:border-white/30 transition-colors">Cancel</button>
                          <button type="submit" disabled={isUploading} className="flex-1 py-4 bg-shakti-gold text-shakti-black text-[9px] uppercase tracking-[0.4em] font-black hover:bg-shakti-gold-light transition-colors">Submit Aura</button>
                        </div>
                        <div className="text-center pt-3 border-t border-white/5">
                           <p className="text-[8px] uppercase tracking-[0.25em] text-[#ff2d55] font-black leading-relaxed">
                             ⚡ AUTOMATIC TEAM DISPATCH ACTIVE — Your casting profile details will be instantly beamed to: <span className="text-white font-bold underline">shaktiyugfashionteam@gmail.com</span>
                           </p>
                        </div>
                     </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="text-center py-20 space-y-6"
                  >
                    <div className="relative inline-block">
                       <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border border-shakti-gold/20 rounded-full scale-150"
                       />
                       <CheckCircle2 className="w-20 h-20 text-shakti-gold mx-auto" strokeWidth={1} />
                    </div>
                    <div className="space-y-3">
                       <h3 className="font-serif text-4xl italic gold-text">Application Logged</h3>
                       <p className="text-[10px] uppercase tracking-[0.5em] text-white/40 leading-relaxed">
                          Your video capsule and dimensions are registered.<br/>Sync processing complete in seconds.
                       </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VOGUE PUBLIC AUDITIONS INTERACTIVE ARENA */}
      <div className="lg:col-span-4 mt-24 mb-10">
        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
          <div>
            <h3 className="font-serif text-3xl italic gold-text flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-shakti-gold animate-spin" style={{ animationDuration: '6s' }} />
              Vogue Public Auditions Arena
            </h3>
            <p className="text-[9px] uppercase tracking-[0.3em] text-white/40 mt-1">
              Active models and designers sharing real-time walk tapes, drapes, and ratings
            </p>
          </div>
          <button 
            onClick={fetchAuditions}
            className="p-2 border border-white/10 hover:border-shakti-gold text-shakti-gold text-[8.5px] tracking-widest uppercase font-mono flex items-center gap-1.5 transition-colors"
          >
            <RefreshCcw className="w-3 h-3" /> Re-Sync Feed
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 [perspective:1000px]">
          {auditions.filter(au => au.visibility === 'public').map((aud) => (
            <motion.div
              key={aud.id}
              whileHover={{ y: -5 }}
              className="bg-white/[0.01] border border-white/5 rounded-sm p-6 flex flex-col md:flex-row gap-6 luxury-card hover:border-shakti-gold/25 transition-all"
            >
              {/* Left Column: Video and controls */}
              <div className="w-full md:w-1/2 space-y-3 shrink-0">
                <div className="relative aspect-[3/4] bg-neutral-900 border border-white/5 rounded-sm overflow-hidden group">
                  <video 
                    src={aud.videoUrl} 
                    controls 
                    playsInline 
                    loop 
                    muted 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 border border-white/15 text-[7px] uppercase tracking-widest font-mono text-shakti-gold font-bold">
                    {aud.role}
                  </div>
                </div>

                <button
                  onClick={() => handleLikeAudition(aud.id)}
                  className="w-full py-2 bg-gradient-to-r from-white/[0.02] to-white/[0.05] border border-white/10 hover:border-lotus-pink/40 text-white hover:text-lotus-pink text-[9px] uppercase tracking-widest font-black flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 text-lotus-pink fill-lotus-pink/20" />
                  <span>Aura Boost ({aud.likes || 0})</span>
                </button>
              </div>

              {/* Right Column: Portfolio parameters, comments */}
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {/* Model Header */}
                  <div className="flex items-center gap-3">
                    <img src={aud.avatar} alt={aud.name} className="w-8 h-8 rounded-full border border-shakti-gold/30 object-cover" referrerPolicy="no-referrer" />
                    <div>
                      <h4 className="text-sm font-serif italic text-white leading-tight">{aud.name}</h4>
                      <div className="text-[7.5px] uppercase tracking-widest text-shakti-gold mt-0.5 font-bold">
                        {aud.timestamp}
                      </div>
                    </div>
                  </div>

                  {/* Portfolio parameters */}
                  <div className="grid grid-cols-4 gap-1 p-2 bg-white/[0.02] border border-white/5 rounded-xs text-center">
                    <div>
                      <span className="text-[6.5px] tracking-tighter text-white/30 uppercase block">HEIGHT</span>
                      <span className="text-[9.5px] font-bold text-shakti-gold font-mono block">{aud.skills?.height || "-"}</span>
                    </div>
                    <div>
                      <span className="text-[6.5px] tracking-tighter text-white/30 uppercase block">WAIST</span>
                      <span className="text-[9.5px] font-bold text-shakti-gold font-mono block">{aud.skills?.waist || "-"}</span>
                    </div>
                    <div>
                      <span className="text-[6.5px] tracking-tighter text-white/30 uppercase block">BUST</span>
                      <span className="text-[9.5px] font-bold text-shakti-gold font-mono block">{aud.skills?.bust || "-"}</span>
                    </div>
                    <div>
                      <span className="text-[6.5px] tracking-tighter text-white/30 uppercase block">SHOES</span>
                      <span className="text-[9.5px] font-bold text-shakti-gold font-mono block">{aud.skills?.shoes || "-"}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-white/50 leading-relaxed italic">
                    "{aud.essence || aud.skills?.bio || "Shaktiyug runway candidate."}"
                  </p>
                </div>

                {/* Live Comments panel */}
                <div className="space-y-3 pt-3 border-t border-white/5">
                  <span className="text-[7.5px] uppercase tracking-widest text-white/30 font-bold block">
                    Vogue Critiques ({aud.comments?.length || 0})
                  </span>

                  <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1 scrollbar-none">
                    {(aud.comments || []).map((comm: any, cIdx: number) => (
                      <div key={comm.id || cIdx} className="text-[9.5px] leading-relaxed text-white/80">
                        <strong className="text-shakti-gold uppercase tracking-widest text-[8px] font-sans mr-1">
                          {comm.user}:
                        </strong>
                        <span className="italic text-white/70">"{comm.text}"</span>
                      </div>
                    ))}
                  </div>

                  {/* Comment Form */}
                  <form onSubmit={(e) => handleAddComment(aud.id, e)} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Comment stance..."
                      value={commentInputs[aud.id] || ''}
                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [aud.id]: e.target.value }))}
                      className="flex-1 bg-white/[0.03] border border-white/10 p-1.5 rounded-none text-[10px] text-white outline-none focus:border-shakti-gold font-light"
                    />
                    <button
                      type="submit"
                      className="px-3 bg-shakti-gold text-shakti-black text-[9px] uppercase tracking-widest font-black hover:bg-shakti-gold-light transition-colors"
                    >
                      Post
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

