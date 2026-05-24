import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, ToggleLeft, ToggleRight, Check, X, AlertOctagon, 
  Send, Bot, Play, Pause, Calendar, Plus, Trash2, Sliders, Users, 
  HelpCircle, MessageCircle, AlertCircle, Edit, Star, Compass, Sparkles, Lock 
} from 'lucide-react';

interface Section {
  id: string;
  name: string;
  active: boolean;
  title?: string;
  subtitle?: string;
}

interface Module {
  id: string;
  name: string;
  active: boolean;
}

interface OwnerConfig {
  homepageSections: Section[];
  dashboardModules: Module[];
  featuredDesigner: string;
  featuredBrand: string;
  systemRoles: { name: string; permission: string }[];
  automationSettings: {
    autoApproveDesigns: boolean;
    autoApproveModels: boolean;
    autoRespondSupportWithAI: boolean;
    scheduledPublishInterval: string;
  };
}

interface TicketReply {
  id: string;
  user: string;
  text: string;
  timestamp: string;
}

interface Ticket {
  id: string;
  user: string;
  email: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'pending' | 'resolved' | 'closed' | 'answered';
  category: string;
  aiSuggestion: string;
  timestamp: string;
  replies: TicketReply[];
}

interface UserLog {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  metric: string;
  timestamp: string;
}

interface Announcement {
  id: string;
  title: string;
  text: string;
  priority: string;
  timestamp: string;
}

// Default/Fallback Config during API outages or static deployments
const DEFAULT_OWNER_CONFIG: OwnerConfig = {
  homepageSections: [
    {
      id: "hero",
      name: "Dynamic Brand Header Slider",
      active: true,
      title: "STRIKE THE AURA OF SHAKTIYUG",
      subtitle: "A NEW COSMIC VEIL UNFOLDS"
    },
    {
      id: "analytics",
      name: "Aura Analytics Prediction Sensor",
      active: true
    },
    {
      id: "featured_slider",
      name: "Live Showreels Banner Slider",
      active: true
    },
    {
      id: "curated_gallery",
      name: "Archival Photo Database Grid",
      active: true
    }
  ],
  dashboardModules: [
    {
      id: "trends",
      name: "Couture Trend Board",
      active: true
    },
    {
      id: "uploads",
      name: "Behance-Style Portfolio System",
      active: true
    },
    {
      id: "university",
      name: "Registered Colleges Runway Shows",
      active: true
    },
    {
      id: "admin",
      name: "Backstage Verification Desk",
      active: true
    }
  ],
  featuredDesigner: "Akash Soni",
  featuredBrand: "Lotus Collective",
  systemRoles: [
    {
      name: "Owner / Master",
      permission: "Full Backstage Oversight"
    },
    {
      name: "Student Creator",
      permission: "Sketch & Blueprint Sharing"
    },
    {
      name: "Model Companion",
      permission: "Video Audition Upload"
    }
  ],
  automationSettings: {
    autoApproveDesigns: false,
    autoApproveModels: false,
    autoRespondSupportWithAI: true,
    scheduledPublishInterval: "Immediate"
  }
};

const DEFAULT_TICKETS: Ticket[] = [
  {
    id: "t-1",
    user: "Kabir Mehta",
    email: "kabir@vogue.in",
    subject: "Holographic calibration error",
    message: "When uploading my collection draft, the fiber-optic light response preview is locked into sRGB instead of the deep magenta gamut. Please check the backstage renderer configurations.",
    priority: "high",
    status: "open",
    category: "Technical Support",
    aiSuggestion: "Reset sRGB canvas render scale and force DCI-P3 cosmic spectrum profiles inside the backstage video encoder.",
    timestamp: "May 23, 2026, 09:15 AM",
    replies: []
  },
  {
    id: "t-2",
    user: "Aarti Roy",
    email: "aarti@nift.edu",
    subject: "Show schedule slot mismatch",
    message: "Our runway slot show 'Lotus Resonance' is scheduled for 18:00 IST but our rehearsal group is only arriving by 17:30. Is there any way to delay the opener sequence by 15 minutes?",
    priority: "medium",
    status: "pending",
    category: "Schedule Request",
    aiSuggestion: "Re-schedule opener sequence with a 15 min buffer, shifting opening video to 18:15 IST.",
    timestamp: "May 22, 2026, 03:30 PM",
    replies: [
      {
        id: "tr-1",
        user: "Backstage Automator",
        text: "Under review by the chief administrator.",
        timestamp: "May 22, 2026, 04:00 PM"
      }
    ]
  }
];

const DEFAULT_USERS: UserLog[] = [
  {
    id: "u-1",
    name: "Aarav Sharma",
    email: "aarav@gmail.com",
    role: "Collector / Student",
    status: "Active",
    metric: "3 Designs Uploaded",
    timestamp: "Today, 11:15 AM"
  },
  {
    id: "u-2",
    name: "Rhea Sen",
    email: "rhea@vogue.co",
    role: "Model Companion",
    status: "Approval Queue",
    metric: "Audition video pending approval",
    timestamp: "Today, 10:14 AM"
  },
  {
    id: "u-3",
    name: "Dev Malhotra",
    email: "dev@malhotra.style",
    role: "Model Companion",
    status: "Active",
    metric: "Audition Video Live",
    timestamp: "Yesterday, 04:22 PM"
  }
];

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "a-1",
    title: "Vedic Design Blueprint Lock-in Deadline",
    text: "All sketch submissions for the NIFT Delhi runway must be finalized on the portfolio wall by May 28, 2026.",
    priority: "high",
    timestamp: "Today, 10:00 AM"
  },
  {
    id: "a-2",
    title: "Global Audition Loop Streaming Live",
    text: "Backstage admin stream feeds are now calibrated to auto-loop approved models during runway commercial interludes.",
    priority: "normal",
    timestamp: "Yesterday"
  }
];

export default function BackstageAdmin() {
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('shakti_vogue_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeSubTab, setActiveSubTab] = useState<'modules' | 'users' | 'queries' | 'live' | 'announcements' | 'ai'>('modules');

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
  
  // Data State
  const [config, setConfig] = useState<OwnerConfig | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<UserLog[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [streamConfig, setStreamConfig] = useState<any>(null);

  // Interaction State
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');
  
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnText, setNewAnnText] = useState('');
  const [newAnnPriority, setNewAnnPriority] = useState('normal');

  // Stream Form State
  const [streamIsLive, setStreamIsLive] = useState(false);
  const [streamUrl, setStreamUrl] = useState('');
  const [streamPlatform, setStreamPlatform] = useState('');
  const [streamTitle, setStreamTitle] = useState('');
  const [streamViewerCount, setStreamViewerCount] = useState(1000);
  const [streamCountdown, setStreamCountdown] = useState('');

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiIsTyping, setAiIsTyping] = useState(false);

  // Status Alerts
  const [actionAlert, setActionAlert] = useState('');

  const triggerAlert = (msg: string) => {
    setActionAlert(msg);
    setTimeout(() => setActionAlert(''), 4500);
  };

  // Synchronous Loaders with robust individual endpoint fallbacks
  // Synchronous Loaders with robust individual endpoint fallbacks
  const loadAllAdminData = async () => {
    try {
      // 1. Fetch Config
      try {
        const cfgRes = await fetch('/api/owner/config');
        if (cfgRes.ok) {
          const cfgData = await cfgRes.json();
          setConfig(cfgData);
          localStorage.setItem('shakti_local_owner_config', JSON.stringify(cfgData));
        } else {
          const savedCfg = localStorage.getItem('shakti_local_owner_config');
          setConfig(savedCfg ? JSON.parse(savedCfg) : DEFAULT_OWNER_CONFIG);
        }
      } catch (e) {
        console.warn("Using fallback owner config:", e);
        const savedCfg = localStorage.getItem('shakti_local_owner_config');
        setConfig(savedCfg ? JSON.parse(savedCfg) : DEFAULT_OWNER_CONFIG);
      }

      // 2. Fetch Tickets
      try {
        const ticketsRes = await fetch('/api/owner/tickets');
        if (ticketsRes.ok) {
          const tickData = await ticketsRes.json();
          setTickets(tickData);
          localStorage.setItem('shakti_local_tickets', JSON.stringify(tickData));
        } else {
          const savedTickets = localStorage.getItem('shakti_local_tickets');
          setTickets(savedTickets ? JSON.parse(savedTickets) : DEFAULT_TICKETS);
        }
      } catch (e) {
        console.warn("Could not load support tickets:", e);
        const savedTickets = localStorage.getItem('shakti_local_tickets');
        setTickets(savedTickets ? JSON.parse(savedTickets) : DEFAULT_TICKETS);
      }

      // 3. Fetch Users
      try {
        const usersRes = await fetch('/api/owner/users');
        if (usersRes.ok) {
          const usrData = await usersRes.json();
          setUsers(usrData);
          localStorage.setItem('shakti_local_users', JSON.stringify(usrData));
        } else {
          const savedUsers = localStorage.getItem('shakti_local_users');
          setUsers(savedUsers ? JSON.parse(savedUsers) : DEFAULT_USERS);
        }
      } catch (e) {
        console.warn("Could not load users pool:", e);
        const savedUsers = localStorage.getItem('shakti_local_users');
        setUsers(savedUsers ? JSON.parse(savedUsers) : DEFAULT_USERS);
      }

      // 4. Fetch Announcements
      try {
        const annRes = await fetch('/api/owner/announcements');
        if (annRes.ok) {
          const annData = await annRes.json();
          setAnnouncements(annData);
          localStorage.setItem('shakti_local_announcements', JSON.stringify(annData));
        } else {
          const savedAnn = localStorage.getItem('shakti_local_announcements');
          setAnnouncements(savedAnn ? JSON.parse(savedAnn) : DEFAULT_ANNOUNCEMENTS);
        }
      } catch (e) {
        console.warn("Could not load announcements:", e);
        const savedAnn = localStorage.getItem('shakti_local_announcements');
        setAnnouncements(savedAnn ? JSON.parse(savedAnn) : DEFAULT_ANNOUNCEMENTS);
      }

      // 5. Fetch Stream Configuration & Status
      try {
        const streamRes = await fetch('/api/owner/live');
        if (streamRes.ok) {
          const streamData = await streamRes.json();
          setStreamConfig(streamData);
          setStreamIsLive(streamData.isLive);
          setStreamUrl(streamData.streamUrl);
          setStreamPlatform(streamData.platform);
          setStreamTitle(streamData.title);
          setStreamViewerCount(streamData.viewerCount);
          setStreamCountdown(streamData.countdownEnd);
        } else {
          setStreamIsLive(false);
        }
      } catch (e) {
        console.warn("Could not load stream configuration:", e);
        setStreamIsLive(false);
      }
    } catch (e) {
      console.error("General administrative data sync error:", e);
    } finally {
      // Direct ultimate safeguard to ensure loader is never stuck
      setConfig(prev => prev || DEFAULT_OWNER_CONFIG);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // Sync homepage configuration toggle changes
  const handleToggleSection = async (sectionId: string) => {
    if (!config) return;
    const updatedSections = config.homepageSections.map(s => 
      s.id === sectionId ? { ...s, active: !s.active } : s
    );
    const newConfig = { ...config, homepageSections: updatedSections };
    setConfig(newConfig);
    localStorage.setItem('shakti_local_owner_config', JSON.stringify(newConfig));
    triggerAlert(`HOMEPAGE SECTION "${sectionId.toUpperCase()}" STANCE RE-CALIBRATED.`);

    try {
      await fetch('/api/owner/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
    } catch (e) {}
  };

  const handleToggleModule = async (moduleId: string) => {
    if (!config) return;
    const updatedModules = config.dashboardModules.map(m => 
      m.id === moduleId ? { ...m, active: !m.active } : m
    );
    const newConfig = { ...config, dashboardModules: updatedModules };
    setConfig(newConfig);
    localStorage.setItem('shakti_local_owner_config', JSON.stringify(newConfig));
    triggerAlert(`CORE DASHBOARD UTILITY "${moduleId.toUpperCase()}" STANCE RE-CALIBRATED.`);

    try {
      await fetch('/api/owner/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
    } catch (e) {}
  };

  const handleUpdateAutomation = async (key: string, value: any) => {
    if (!config) return;
    const newConfig = {
      ...config,
      automationSettings: {
        ...config.automationSettings,
        [key]: value
      }
    };
    setConfig(newConfig);
    localStorage.setItem('shakti_local_owner_config', JSON.stringify(newConfig));
    triggerAlert(`AUTOMATION REGENT "${key.toUpperCase()}" TRIGGER ADJUSTED.`);

    try {
      await fetch('/api/owner/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
    } catch (e) {}
  };

  // Support Ticketing Handlers
  const handleUpdateTicketStatus = async (ticketId: string, status: string) => {
    const nextTickets = tickets.map(t => t.id === ticketId ? { ...t, status: status as any } : t);
    setTickets(nextTickets);
    localStorage.setItem('shakti_local_tickets', JSON.stringify(nextTickets));
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, status: status as any } : null);
    }
    triggerAlert(`TICKET STATUS CHANGED TO ${status.toUpperCase()}.`);

    try {
      await fetch(`/api/owner/tickets/${ticketId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (e) {}
  };

  const handleReplyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    const txt = replyText.trim();
    const newReply = {
      id: "tr-" + Date.now(),
      user: 'Owner Backstage Admin',
      text: txt,
      timestamp: "Just now"
    };

    const nextTickets = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: 'answered' as const,
          replies: [...(t.replies || []), newReply]
        };
      }
      return t;
    });

    setTickets(nextTickets);
    localStorage.setItem('shakti_local_tickets', JSON.stringify(nextTickets));
    setSelectedTicket(prev => prev ? {
      ...prev,
      status: 'answered',
      replies: [...(prev.replies || []), newReply]
    } : null);
    setReplyText('');
    triggerAlert(`REPLY DISPATCHED SUCCESSFULLY TO ${selectedTicket.user.toUpperCase()}.`);

    try {
      await fetch(`/api/owner/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: txt,
          user: 'Owner Backstage Admin'
        })
      });
    } catch (e) {}
  };

  // Live stream config handler
  const handleSaveStreamConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerAlert('BROADCAST SHIELD SPECIFICATIONS PERSISTED GLOBALLY.');
    try {
      await fetch('/api/owner/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isLive: streamIsLive,
          streamUrl,
          platform: streamPlatform,
          title: streamTitle,
          viewerCount: Number(streamViewerCount),
          countdownEnd: streamCountdown
        })
      });
    } catch (e) {}
  };

  // Global Announcement Handlers
  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnText.trim()) return;

    const newAnn: Announcement = {
      id: "a-" + Date.now(),
      title: newAnnTitle.trim(),
      text: newAnnText.trim(),
      priority: newAnnPriority,
      timestamp: "Just now"
    };

    const nextAnn = [newAnn, ...announcements];
    setAnnouncements(nextAnn);
    localStorage.setItem('shakti_local_announcements', JSON.stringify(nextAnn));

    try {
      const storedEvents = localStorage.getItem('shakti_local_events');
      if (storedEvents) {
        const events = JSON.parse(storedEvents);
        if (events.length > 0) {
          events[0].announcements = [{ text: `${newAnn.title}: ${newAnn.text}`, timestamp: "Just now" }, ...(events[0].announcements || [])];
          localStorage.setItem('shakti_local_events', JSON.stringify(events));
        }
      }
    } catch (err) {}

    setNewAnnTitle('');
    setNewAnnText('');
    triggerAlert('GLOBAL ANNOUNCEMENT PUBLISHED ON CURRENT SPECTATOR WALL.');

    try {
      await fetch('/api/owner/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newAnnTitle.trim(),
          text: newAnnText.trim(),
          priority: newAnnPriority
        })
      });
    } catch (e) {}
  };

  const handleDeleteAnnouncement = async (id: string) => {
    const nextAnn = announcements.filter(a => a.id !== id);
    setAnnouncements(nextAnn);
    localStorage.setItem('shakti_local_announcements', JSON.stringify(nextAnn));
    triggerAlert('ANNOUNCEMENT TERMINATED.');

    try {
      await fetch(`/api/owner/announcements/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {}
  };

  // Support Approve / Reject users
  const handleApproveModel = async (email: string, eventId?: string) => {
    const nextUsers = users.map(u => u.email === email ? { ...u, status: 'Active' } : u);
    setUsers(nextUsers);
    localStorage.setItem('shakti_local_users', JSON.stringify(nextUsers));
    triggerAlert(`USER "${email}" ACCESS ROLE MODERATED TO ACTIVE.`);

    try {
      await fetch('/api/owner/registrations/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, eventId, approved: true })
      });
    } catch (e) {}
  };

  const handleDeclineModel = async (email: string, eventId?: string) => {
    const nextUsers = users.map(u => u.email === email ? { ...u, status: 'Approval Queue' } : u);
    setUsers(nextUsers);
    localStorage.setItem('shakti_local_users', JSON.stringify(nextUsers));
    triggerAlert(`USER "${email}" GRANTED ACCESS TERMINATED.`);

    try {
      await fetch('/api/owner/registrations/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, eventId, approved: false })
      });
    } catch (e) {}
  };

  // Owner AI executive assistant helper
  const handleQueryOwnerBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    const userCommand = aiPrompt;
    setAiPrompt('');
    setAiIsTyping(true);

    try {
      const res = await fetch('/api/owner/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userCommand })
      });

      if (res.ok) {
        const data = await res.json();
        setAiResponse(data.response);
      }
    } catch (e) {
      setAiResponse('RECONSTRUCTING COGNITIVE FEED MATRIX. LOG IN SECONDS.');
    } finally {
      setAiIsTyping(false);
    }
  };

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-xs text-[#ff2d55]">
        <Shield className="w-5 h-5 animate-spin mr-3 text-[#ff2d55]" />
        SYNCHRONIZING SECURE VIP TERMINAL...
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'owner') {
    return (
      <section className="min-h-screen py-32 px-4 md:px-8 container mx-auto flex items-center justify-center">
        {/* Secure Gated Screen */}
        <div className="max-w-xl w-full p-8 bg-[#090308]/90 border border-shakti-gold/30 rounded-sm relative overflow-hidden text-center space-y-8 shadow-2xl my-6 animate-fade-in font-sans">
          <div className="absolute -right-20 -top-20 w-44 h-44 bg-shakti-gold/5 blur-3xl rounded-full" />
          
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-shakti-gold/10 border border-shakti-gold/40 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Lock className="w-8 h-8 text-shakti-gold" />
            </div>
            <h4 className="font-serif text-3xl italic text-white leading-tight">Master Backstage Gated</h4>
            <p className="text-xs text-white/50 leading-relaxed font-light">
              The Backstage Control Desk contains raw audition entries, digital designs pipelines, and system configuration terminals. Please authenticate as the Platform Owner to proceed.
            </p>
          </div>

          {/* Inline fast passcode unlock */}
          <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xs space-y-4">
            <span className="text-[8px] uppercase tracking-widest text-[#ff2d55] font-black block font-mono">Quick Console Unlock Passcode</span>
            <div className="flex gap-2">
              <input
                required
                type="password"
                placeholder="ENTER PIN CODE (shakti2026)"
                id="admin-quick-passcode-console"
                className="flex-1 bg-white/5 border border-white/10 p-2 text-xs text-white placeholder:text-white/20 outline-none focus:border-shakti-gold text-center font-mono"
              />
              <button
                onClick={() => {
                  const pinEl = document.getElementById("admin-quick-passcode-console") as HTMLInputElement;
                  const pinValue = pinEl?.value;
                  if (pinValue === 'shakti2026' || pinValue === 'admin') {
                    const mockOwner = {
                      name: "Platform Owner",
                      email: "owner@shaktiyug.com",
                      role: "owner"
                    };
                    localStorage.setItem('shakti_vogue_user', JSON.stringify(mockOwner));
                    setCurrentUser(mockOwner);
                    // notify nav
                    window.dispatchEvent(new Event('vogue-auth-change'));
                  } else {
                    alert("Unauthorized Access Code. Passcode validation failed.");
                  }
                }}
                className="px-4 py-2 bg-shakti-gold text-shakti-black text-[9px] uppercase tracking-widest font-black transition-all hover:bg-shakti-gold-light cursor-pointer select-none"
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
                // notify nav
                window.dispatchEvent(new Event('vogue-auth-change'));
              }}
              className="text-[9px] text-shakti-gold uppercase tracking-[0.25em] font-black hover:underline px-4 py-2 border border-shakti-gold/20 bg-shakti-gold/5 w-full transition-all cursor-pointer"
            >
              ⚡ Instant Demo Owner Bypass (1-Click)
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen py-24 px-4 md:px-8 container mx-auto">
      {/* Absolute Admin Frame ID Header */}
      <div className="relative mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#ff2d55]/15 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-red-500/10 border border-red-500/30 rounded-full mb-3">
            <Shield className="w-3 h-3 text-[#ff2d55]" />
            <span className="text-[8px] uppercase tracking-[0.3em] font-black font-sans text-red-400">
              Shaktiyug Executive Overlord Node
            </span>
          </div>
          
          <h2 className="font-serif text-5xl md:text-7xl italic text-white leading-none">
            Backstage <span className="text-[#ff2d55]">Admin Control</span>
          </h2>
          <p className="text-[10px] uppercase tracking-[0.5em] text-white/35 font-bold mt-2">
            GLOBAL CONTENT VERIFICATION, PLATFORM SWITCHBOARD, & AI BUSINESS REGENT
          </p>
        </div>

        {/* Global Alert Notification Drawer */}
        <AnimatePresence>
          {actionAlert && (
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="px-4 py-3 bg-[#16060c] border border-red-500/20 rounded-xs flex items-center gap-3 shadow-2xl shrink-0"
            >
              <AlertCircle className="w-4 h-4 text-[#ff2d55] shrink-0" />
              <div className="text-[9.5px] uppercase font-mono text-red-300 font-bold">
                {actionAlert}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Admin Central Multi-Tiers Control Switcher grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        
        {/* Sub-Navigation Panel (Clipped Left column) */}
        <div className="lg:col-span-3 flex flex-col gap-2 bg-[#0c050a]/90 p-4 border border-white/5 rounded-sm">
          <span className="text-[8px] uppercase text-white/20 tracking-widest font-black px-3.5 pb-2 mb-2 border-b border-white/5 block">
            Vanguard switchboards
          </span>

          {[
            { id: 'modules', label: 'Ecosystem Switches', icon: Sliders },
            { id: 'users', label: 'Artisans & Audits', icon: Users },
            { id: 'queries', label: 'Query Tickets', icon: HelpCircle },
            { id: 'live', label: 'Live Stream Shield', icon: Play },
            { id: 'announcements', label: 'Global Alerts Wall', icon: Calendar },
            { id: 'ai', label: 'AI Regent Intelligence', icon: Bot }
          ].map((subTab) => (
            <button
              key={subTab.id}
              onClick={() => setActiveSubTab(subTab.id as any)}
              className={`flex items-center gap-3.5 py-3 px-4 rounded-sm text-left text-[10px] uppercase font-bold tracking-[0.15em] transition-all cursor-pointer ${
                activeSubTab === subTab.id 
                  ? 'bg-gradient-to-r from-red-600 to-[#e0115f] text-white shadow-lg' 
                  : 'text-white/40 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              <subTab.icon className={`w-4 h-4 ${activeSubTab === subTab.id ? 'text-white animate-pulse' : 'text-white/30'}`} />
              <span>{subTab.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Display Panel (Right multi-grids) */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            
            {/* VIEW 1: HOME SECTIONS & FUNCTIONAL SWITCHES */}
            {activeSubTab === 'modules' && (
              <motion.div
                key="modules"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {/* Homepage Section switches */}
                <div className="luxury-card rounded-xs p-8 space-y-6">
                  <div className="flex flex-col">
                    <h3 className="font-serif text-2xl italic text-white">Dynamic Homepage Blueprint</h3>
                    <p className="text-white/40 text-[10px] uppercase mt-1">Hide/Show landing frames in real-time</p>
                  </div>
                  
                  <div className="space-y-4">
                    {config.homepageSections.map((sec) => (
                      <div key={sec.id} className="flex items-center justify-between p-3.5 bg-white/[0.01] border border-white/5 rounded-xs">
                        <div>
                          <span className="text-[10px] uppercase font-mono tracking-widest text-white/80 font-bold block">{sec.name}</span>
                          <span className="text-[7.5px] font-mono text-white/30 block">DOM TARGET: {sec.id.toUpperCase()}</span>
                        </div>
                        <button
                          onClick={() => handleToggleSection(sec.id)}
                          className="text-white hover:text-[#ff2d55] transition-colors cursor-pointer"
                        >
                          {sec.active ? (
                            <ToggleRight className="w-10 h-10 text-[#ff2d55]" />
                          ) : (
                            <ToggleLeft className="w-10 h-10 text-white/20" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dashboard Utility Switches & Automations */}
                <div className="space-y-8">
                  <div className="luxury-card rounded-xs p-8 space-y-6">
                    <div className="flex flex-col">
                      <h3 className="font-serif text-2xl italic text-white">Feature System Valves</h3>
                      <p className="text-white/40 text-[10px] uppercase mt-1">Calibrate active application modes</p>
                    </div>

                    <div className="space-y-4">
                      {config.dashboardModules.map((mod) => (
                        <div key={mod.id} className="flex items-center justify-between p-3 bg-white/[0.01] border border-white/5 rounded-xs">
                          <div>
                            <span className="text-[10.5px] uppercase font-mono font-bold text-white/80 block">{mod.name}</span>
                            <span className="text-[7.5px] font-mono text-white/30">ROUTE KEY: {mod.id}</span>
                          </div>
                          <button onClick={() => handleToggleModule(mod.id)} className="cursor-pointer">
                            {mod.active ? (
                              <ToggleRight className="w-10 h-10 text-shakti-gold" />
                            ) : (
                              <ToggleLeft className="w-10 h-10 text-white/20" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Smart Automations Card */}
                  <div className="luxury-card rounded-xs p-8 space-y-6 border border-[#e0115f]/15">
                    <div className="flex flex-col">
                      <h3 className="font-serif text-2xl italic text-white">Regent Automations</h3>
                      <p className="text-white/40 text-[10px] uppercase mt-1">Establish robotic rules for model submissions</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-[#110107] border border-red-500/10 rounded-xs">
                        <div>
                          <span className="text-[10px] uppercase font-mono font-bold text-white/80 block">Auto-Approve Sketches</span>
                          <span className="text-[8px] text-white/30 font-mono">Accept custom drawings immediately</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={config.automationSettings.autoApproveDesigns}
                          onChange={(e) => handleUpdateAutomation('autoApproveDesigns', e.target.checked)}
                          className="w-4 h-4 accent-red-500 cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-[#110107] border border-red-500/10 rounded-xs">
                        <div>
                          <span className="text-[10px] uppercase font-mono font-bold text-white/80 block">Auto-Approve Audition Models</span>
                          <span className="text-[8px] text-white/30 font-mono">Bypass review queues instantly</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={config.automationSettings.autoApproveModels}
                          onChange={(e) => handleUpdateAutomation('autoApproveModels', e.target.checked)}
                          className="w-4 h-4 accent-red-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW 2: DESIGNER, MODEL REGISTRANTS & ACCESS LEVELING */}
            {activeSubTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="luxury-card rounded-xs p-8 space-y-6"
              >
                <div className="flex items-baseline justify-between border-b border-white/5 pb-4">
                  <div>
                    <h3 className="font-serif text-2xl italic text-white">Artisans & Auditions Backlog</h3>
                    <p className="text-white/40 text-[10px] uppercase mt-1">Approve or reject talent registers globally</p>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 bg-white/5 border border-white/5 rounded-full text-white/70">
                    {users.length} Active Profiles
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-white/80 font-light border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-[8.5px] uppercase text-white/30 tracking-widest font-mono">
                        <th className="py-4 px-3">Specialist Name</th>
                        <th className="py-4 px-3">Contact Feed</th>
                        <th className="py-4 px-3">Ecosystem Position</th>
                        <th className="py-4 px-3">Performance Data</th>
                        <th className="py-4 px-4 text-right">Moderator actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-4 px-3 font-bold text-white font-sans">{u.name}</td>
                          <td className="py-4 px-3 font-mono text-[10.5px] text-white/55">{u.email}</td>
                          <td className="py-4 px-3">
                            <span className="px-2 py-0.5 bg-shakti-gold/10 border border-shakti-gold/20 text-shakti-gold text-[8px] uppercase tracking-wider rounded-xs font-mono font-bold">
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-[10.5px] font-mono text-white/50">{u.metric}</td>
                          <td className="py-4 px-4 text-right">
                            {u.status === 'Active' ? (
                              <button
                                onClick={() => handleDeclineModel(u.email)}
                                className="px-3 py-1.5 bg-red-900/40 hover:bg-red-800 border border-red-500/20 rounded-xs text-[9px] uppercase tracking-wider font-bold text-red-100 transition-all cursor-pointer"
                              >
                                Revoke role
                              </button>
                            ) : (
                              <button
                                onClick={() => handleApproveModel(u.email)}
                                className="px-3 py-1.5 bg-green-900/40 hover:bg-green-800 border border-green-500/20 rounded-xs text-[9px] uppercase tracking-wider font-bold text-green-100 transition-all cursor-pointer"
                              >
                                Approve entry
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* VIEW 3: INQUIRIES & SUPPORT TICKETING HUB */}
            {activeSubTab === 'queries' && (
              <motion.div
                key="queries"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
              >
                {/* Tickets list column */}
                <div className="lg:col-span-5 luxury-card rounded-xs p-6 space-y-4 max-h-[600px] overflow-y-auto">
                  <h3 className="font-serif text-2xl italic text-white flex items-center justify-between border-b border-white/5 pb-3">
                    Inquiries Feed
                  </h3>
                  
                  <div className="space-y-3">
                    {tickets.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTicket(t)}
                        className={`p-3.5 bg-white/[0.01] border rounded-xs transition-all cursor-pointer relative ${
                          selectedTicket?.id === t.id 
                            ? 'border-[#ff2d55]/80 bg-[#16040b]' 
                            : 'border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] uppercase tracking-widest font-mono font-bold ${
                            t.priority === 'high' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-white/5 text-white/60'
                          }`}>
                            {t.priority} priority
                          </span>
                          <span className="text-[8.5px] font-mono font-bold text-[#ff2d55]">
                            {t.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <h5 className="font-bold text-xs text-white truncate">{t.subject}</h5>
                        <p className="text-white/40 text-[10px] truncate mt-1">{t.message}</p>
                        <p className="text-white/20 text-[8px] uppercase tracking-widest text-right mt-2 font-mono">{t.timestamp}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Ticket Response console */}
                <div className="lg:col-span-7">
                  {selectedTicket ? (
                    <div className="luxury-card rounded-xs p-8 space-y-6 h-full flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-baseline justify-between border-b border-white/5 pb-4">
                          <div>
                            <span className="text-[8.5px] font-mono tracking-widest uppercase text-white/35 block">SUPPORT CARD {selectedTicket.id}</span>
                            <h4 className="font-serif text-2xl italic text-white mt-1">{selectedTicket.subject}</h4>
                          </div>
                          
                          <select
                            value={selectedTicket.status}
                            onChange={(e) => handleUpdateTicketStatus(selectedTicket.id, e.target.value)}
                            className="bg-[#050204] border border-white/10 text-xs py-1 px-3 text-white rounded-xs"
                          >
                            <option value="open">Open</option>
                            <option value="pending">Pending</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>

                        {/* Ticket metadata */}
                        <div className="grid grid-cols-2 gap-4 text-[10.5px] text-white/50 bg-[#050204]/85 p-3 rounded-xs border border-white/5">
                          <div>
                            <span className="text-[7.5px] text-white/20 uppercase tracking-widest font-mono block">Requester Name</span>
                            <span className="text-white font-bold">{selectedTicket.user}</span>
                          </div>
                          <div>
                            <span className="text-[7.5px] text-white/20 uppercase tracking-widest font-mono block">Contact Email</span>
                            <span className="text-[#ff2d55] font-mono truncate block">{selectedTicket.email}</span>
                          </div>
                        </div>

                        {/* Customer Issue */}
                        <div className="space-y-1.5 p-4 bg-white/[0.01] border border-white/5 rounded-xs">
                          <span className="text-[7.5px] text-white/20 uppercase tracking-widest font-mono block">USER MESSAGE DETAILS</span>
                          <p className="text-white/80 text-xs leading-relaxed font-light">{selectedTicket.message}</p>
                        </div>

                        {/* Smart AI assisted Response suggestion */}
                        <div className="space-y-2 p-4 bg-[#110107] border border-red-500/10 rounded-xs">
                          <div className="flex items-center gap-1.5 text-xs text-red-400 font-bold">
                            <Bot className="w-4 h-4" />
                            <span className="text-[9px] uppercase tracking-widest">AI oracle Draft assistant suggestion:</span>
                          </div>
                          <p className="text-red-300 text-xs italic font-light leading-relaxed">
                            "{selectedTicket.aiSuggestion}"
                          </p>
                          <button
                            onClick={() => setReplyText(selectedTicket.aiSuggestion)}
                            className="text-[8.5px] tracking-wide uppercase font-black text-white/60 hover:text-[#ff2d55] transition-colors bg-white/5 px-2 py-0.5 rounded-xs"
                          >
                            Copy Draft proposal
                          </button>
                        </div>

                        {/* Replies Thread */}
                        {selectedTicket.replies.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-white/5">
                            <span className="text-[7.5px] text-white/20 uppercase tracking-widest font-mono block">REPLY OUTPOST FEED</span>
                            <div className="space-y-2">
                              {selectedTicket.replies.map((rep) => (
                                <div key={rep.id} className="p-3 bg-white/[0.01] border border-white/5 text-xs rounded-xs">
                                  <div className="flex justify-between items-center mb-1 text-[9px] font-mono text-white/50">
                                    <span className="font-bold">{rep.user}</span>
                                    <span>{rep.timestamp}</span>
                                  </div>
                                  <p className="text-white/85">{rep.text}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Reply creator Form */}
                      <form onSubmit={handleReplyTicket} className="pt-4 border-t border-white/5 flex gap-2">
                        <input
                          type="text"
                          placeholder="Compose couture reply response..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="flex-1 bg-white/[0.01] border border-white/10 rounded-sm px-3.5 py-2.5 text-xs text-white fill-none outline-none focus:border-[#ff2d55]"
                          id="ticket-reply-text-field"
                        />
                        <button
                          type="submit"
                          className="bg-[#ff2d55] hover:bg-red-600 text-white rounded-sm px-5 flex items-center justify-center transition-colors font-bold text-[10px] uppercase tracking-wider"
                        >
                          Send
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="luxury-card rounded-xs p-8 flex flex-col items-center justify-center text-center text-white/30 h-full min-h-[400px]">
                      <HelpCircle className="w-12 h-12 mb-3.5" />
                      <p className="font-serif text-lg italic text-white/50">Console Standby</p>
                      <p className="text-[10px] leading-wide max-w-xs mt-1">
                        Select any pending support card in the queue to coordinate human interventions or trigger automated suggestions.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* VIEW 4: LIVE BROADCAST SETTINGS SWITCHBOARD */}
            {activeSubTab === 'live' && (
              <motion.div
                key="live"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="luxury-card rounded-xs p-8 space-y-8"
              >
                <div className="flex flex-col">
                  <h3 className="font-serif text-2xl italic text-white flex items-center gap-2">
                    <Star className="w-6 h-6 text-[#ff2d55]" /> Broadcaster Matrix Valves
                  </h3>
                  <p className="text-white/40 text-[10px] uppercase mt-1">Configure active stream channels globally</p>
                </div>

                <form onSubmit={handleSaveStreamConfig} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    
                    <div className="p-4 bg-[#110107] border border-red-500/15 rounded-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10.5px] uppercase font-mono font-bold text-red-300 block">BROADCAST TRANSMISSION</span>
                        <span className="text-[8px] text-white/30">Set Live status tag visible globally</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStreamIsLive(!streamIsLive)}
                        className="cursor-pointer"
                      >
                        {streamIsLive ? (
                          <ToggleRight className="w-11 h-11 text-red-500" />
                        ) : (
                          <ToggleLeft className="w-11 h-11 text-white/20" />
                        )}
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9.5px] font-mono uppercase tracking-widest text-white/40 block">STREAM PLATFORM ORIGIN</label>
                      <input
                        type="text"
                        placeholder="YouTube Live, Twitch, IG Live..."
                        value={streamPlatform}
                        onChange={(e) => setStreamPlatform(e.target.value)}
                        className="input-fashion text-xs font-mono"
                        id="stream-platform-input"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9.5px] font-mono uppercase tracking-widest text-white/40 block">LASER DIAL COUNTS (VIEWERS)</label>
                      <input
                        type="number"
                        placeholder="Viewer Count"
                        value={streamViewerCount}
                        onChange={(e) => setStreamViewerCount(Number(e.target.value))}
                        className="input-fashion text-xs font-mono"
                        id="stream-viewer-count"
                      />
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-[9.5px] font-mono uppercase tracking-widest text-white/40 block">BROADCAST TITLE</label>
                      <input
                        type="text"
                        placeholder="Vogue Reveal showcase..."
                        value={streamTitle}
                        onChange={(e) => setStreamTitle(e.target.value)}
                        className="input-fashion text-xs font-serif italic"
                        id="stream-title-text"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9.5px] font-mono uppercase tracking-widest text-white/40 block">SOURCE SHIELD (IFRAME URL)</label>
                      <input
                        type="text"
                        placeholder="YouTube embed URL..."
                        value={streamUrl}
                        onChange={(e) => setStreamUrl(e.target.value)}
                        className="input-fashion text-xs font-mono"
                        id="stream-url-text"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9.5px] font-mono uppercase tracking-widest text-white/40 block">COUNTDOWN ISO TIMESTAMP</label>
                      <input
                        type="text"
                        placeholder="2026-05-30T18:00:00Z"
                        value={streamCountdown}
                        onChange={(e) => setStreamCountdown(e.target.value)}
                        className="input-fashion text-xs font-mono"
                        id="stream-countdown"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 pt-4">
                    <button
                      type="submit"
                      className="fashion-button rounded-sm w-full py-3.5 text-xs text-red-200 border-red-500/30 hover:bg-gradient-to-r hover:from-red-600 hover:to-[#e0115f]"
                    >
                      COMMIT BROADCAST SWITCHES
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* VIEW 5: ANNOUNCEMENTS MANAGER */}
            {activeSubTab === 'announcements' && (
              <motion.div
                key="announcements"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
              >
                {/* Compose Form */}
                <div className="lg:col-span-5 luxury-card rounded-xs p-6 space-y-6">
                  <h3 className="font-serif text-2xl italic text-white border-b border-white/5 pb-2">Publish Announcement</h3>
                  
                  <form onSubmit={handlePostAnnouncement} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9.5px] font-mono uppercase text-white/40 block">Broadcast Title</label>
                      <input
                        type="text"
                        placeholder="NEW REHEARSAL INSTRUCTIONS..."
                        value={newAnnTitle}
                        onChange={(e) => setNewAnnTitle(e.target.value)}
                        className="input-fashion text-xs"
                        id="ann-title-compose"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9.5px] font-mono uppercase text-white/40 block">Aura message text details</label>
                      <textarea
                        placeholder="State timing specifications, model allocations, or laser sequences."
                        value={newAnnText}
                        onChange={(e) => setNewAnnText(e.target.value)}
                        className="w-full h-24 bg-transparent border-b border-red-500/20 text-xs py-2 outline-none focus:border-red-500 transition-colors resize-none"
                        id="ann-text-compose"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9.5px] font-mono uppercase text-white/40 block">Broadcast priority</label>
                      <select
                        value={newAnnPriority}
                        onChange={(e) => setNewAnnPriority(e.target.value)}
                        className="bg-[#0c050a] border border-white/10 text-xs text-white py-1.5 px-3 rounded-xs outline-none w-full"
                      >
                        <option value="normal">Normal Priority</option>
                        <option value="high">Urgent Priority (Glow Header)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="fashion-button rounded-sm w-full py-3 text-[9.5px]"
                    >
                      PUBLISH INJECT ROUTE
                    </button>
                  </form>
                </div>

                {/* Active Wall list */}
                <div className="lg:col-span-7 luxury-card rounded-xs p-6 space-y-4 max-h-[500px] overflow-y-auto">
                  <h3 className="font-serif text-2xl italic text-white border-b border-white/5 pb-2">Spectator Alerts</h3>
                  
                  <div className="space-y-4">
                    {announcements.map((ann) => (
                      <div key={ann.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-xs relative flex items-start gap-4 justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[7.5px] uppercase tracking-wide font-mono font-bold ${
                              ann.priority === 'high' ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-white/5 text-white/55'
                            }`}>
                              {ann.priority}
                            </span>
                            <span className="text-[9px] font-mono text-white/30">{ann.timestamp}</span>
                          </div>
                          
                          <h5 className="font-bold text-xs text-white uppercase tracking-wider">{ann.title}</h5>
                          <p className="text-white/50 text-xs leading-relaxed max-w-md font-light">{ann.text}</p>
                        </div>

                        <button
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="text-white/20 hover:text-[#ff2d55] p-1.5 hover:bg-red-950/20 rounded-sm transition-all cursor-pointer select-none"
                          title="Terminate Announcement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW 6: VIP COMPANION RELEVATION (AI AGENT TERMINAL) */}
            {activeSubTab === 'ai' && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="luxury-card rounded-xs p-8 mt-2 space-y-6 border border-red-500/15"
              >
                <div className="flex items-center gap-3.5 border-b border-white/5 pb-4">
                  <div className="w-10 h-10 bg-red-600/10 border border-red-500/30 text-red-500 rounded-full flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl italic text-white flex items-center gap-1.5">
                      Backstage AI Regent
                    </h3>
                    <p className="text-white/40 text-[10px] uppercase">Vanguard computing partner at executive tier</p>
                  </div>
                </div>

                {/* Response outputs */}
                <div className="min-h-[200px] bg-[#050204]/90 border border-white/5 rounded-xs p-6 flex flex-col justify-between">
                  {aiResponse ? (
                    <div className="text-xs text-red-200/90 leading-relaxed font-light space-y-4">
                      <div className="whitespace-pre-wrap">{aiResponse}</div>
                      <span className="text-[8px] uppercase font-mono text-white/30 block tracking-widest text-right">M-V-COMPUTE DEPLOYED VIA GEMINI-3.5-FLASH</span>
                    </div>
                  ) : (
                    <div className="text-xs text-white/35 italic font-light text-center py-12 flex flex-col items-center justify-center space-y-3">
                      <Compass className="w-10 h-10 text-white/10 animate-spin" style={{ animationDuration: '20s' }} />
                      <p>VIP Assistant standby. Prompt me to draft announcements, moderate uploads, or forecast trend balances.</p>
                    </div>
                  )}

                  {aiIsTyping && (
                    <div className="flex items-center gap-2 text-[9.5px] font-mono text-red-400 font-bold uppercase animate-pulse pt-4 border-t border-white/5">
                      <Sparkles className="w-3.5 h-3.5 animate-spin mr-1" />
                      Regent formulation active...
                    </div>
                  )}
                </div>

                {/* AI prompt director Form */}
                <form onSubmit={handleQueryOwnerBot} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coordinate announcements, moderate uploads, or request trend ratios..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="flex-1 bg-white/[0.01] border border-white/10 rounded-sm py-3 px-4 text-xs font-mono text-white outline-none focus:border-red-500 transition-colors"
                    id="ai-prompt-input-field"
                  />
                  <button
                    type="submit"
                    className="bg-[#ff2d55] hover:bg-red-600 text-white rounded-sm px-6 flex items-center justify-center transition-colors font-bold text-[10px] uppercase tracking-wider"
                  >
                    DEPLOY REGENT
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </section>
  );
}
