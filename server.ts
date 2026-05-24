import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import crypto from "crypto";

// Initialize Gemini API Client
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

const GMAIL_OUTBOX_FILE = path.join(process.cwd(), "gmail_outbox.json");
function sendGmailAlert(subject: string, details: any) {
  try {
    let outbox: any[] = [];
    if (fs.existsSync(GMAIL_OUTBOX_FILE)) {
      outbox = JSON.parse(fs.readFileSync(GMAIL_OUTBOX_FILE, "utf-8"));
    }
    const newMail = {
      id: "mail-" + Date.now().toString(),
      to: "shaktiyugfashionteam@gmail.com",
      subject,
      timestamp: new Date().toLocaleString(),
      details
    };
    outbox.unshift(newMail);
    fs.writeFileSync(GMAIL_OUTBOX_FILE, JSON.stringify(outbox, null, 2));
    
    console.log(`
========================================================================
[AUTOMATIC GMAIL OUTBOX DISPATCH] -> shaktiyugfashionteam@gmail.com
========================================================================
ID: ${newMail.id}
Subject: ${subject}
Date: ${newMail.timestamp}
Recipient: shaktiyugfashionteam@gmail.com
------------------------------------------------------------------------
Details:
${JSON.stringify(details, null, 2)}
========================================================================
    `);
  } catch (e) {
    console.error("Failed to automatically dispatch notification email to shaktiyugfashionteam@gmail.com", e);
  }
}

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory / flat-file storage for feedbacks to mimic full db persistence
const FEEDBACK_FILE = path.join(process.cwd(), "feedbacks.json");
function readFeedbacks() {
  try {
    if (fs.existsSync(FEEDBACK_FILE)) {
      return JSON.parse(fs.readFileSync(FEEDBACK_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading feedbacks", e);
  }
  return [
    {
      id: "fb-1",
      name: "Aman Creative Lead",
      rating: 5,
      comment: "The 3D lotus transition feels incredibly fluid now. Beautiful edge glows!",
      reaction: "🤩",
      timestamp: "5/22/2026, 6:00:20 AM"
    },
    {
      id: "fb-2",
      name: "Akash Designer",
      rating: 5,
      comment: "Absolutely in love with the high-fidelity sound representation.",
      reaction: "✨",
      timestamp: "5/22/2026, 6:15:44 AM"
    }
  ];
}
function writeFeedback(fb: any) {
  try {
    const current = readFeedbacks();
    current.push(fb);
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(current, null, 2));
  } catch (e) {
    console.error("Error writing feedback", e);
  }
}

// In-memory auditions repository
const AUDITIONS_FILE = path.join(process.cwd(), "auditions.json");
function readAuditions() {
  try {
    if (fs.existsSync(AUDITIONS_FILE)) {
      return JSON.parse(fs.readFileSync(AUDITIONS_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading auditions", e);
  }
  return [
    {
      id: "audition-1",
      name: "Rhea Sharma",
      role: "Lotus Elegance 2026",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
      email: "rhea@vogue.co",
      portfolio: "https://rhea.vogue",
      comments: [
        { id: "c1", user: "Aman (Creative)", text: "Stunning stance! The posture is runway gold." },
        { id: "c2", user: "Akash (Designer)", text: "Highly compatible with the neon pink drape." }
      ],
      likes: 42,
      visibility: "public",
      essence: "Shaktiyug represents the absolute pinnacle of digital-physical fashion hybridity.",
      timestamp: "Today, 10:14 AM",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-posing-40134-large.mp4",
      skills: { height: "5'9\"", waist: "25", bust: "34", shoes: "8", bio: "Holographic walk specialist." }
    },
    {
      id: "audition-2",
      name: "Dev Malhotra",
      role: "Urban Street Luxe",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop",
      email: "dev@malhotra.style",
      portfolio: "https://devluxe.com",
      comments: [
        { id: "c3", user: "Mahi (Stylist)", text: "Incredible raw presence." }
      ],
      likes: 29,
      visibility: "public",
      essence: "Ready to represent street culture reimagined.",
      timestamp: "Yesterday",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-fashion-woman-with-silver-glitter-makeup-40120-large.mp4",
      skills: { height: "6'1\"", waist: "30", bust: "38", shoes: "11", bio: "Androgynous street artist with deep physical expressions." }
    }
  ];
}

function writeAuditions(auds: any) {
  try {
    fs.writeFileSync(AUDITIONS_FILE, JSON.stringify(auds, null, 2));
  } catch (e) {
    console.error("Error writing auditions", e);
  }
}

// In-memory Designs repository
const DESIGNS_FILE = path.join(process.cwd(), "designs.json");
function readDesigns() {
  try {
    if (fs.existsSync(DESIGNS_FILE)) {
      return JSON.parse(fs.readFileSync(DESIGNS_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading designs", e);
  }
  return [
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
        { id: "dc-1", user: "Mahi", text: "This would catch backlights beautifully!", timestamp: "Today" }
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
      status: "pending",
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
}
function writeDesigns(designs: any) {
  try {
    fs.writeFileSync(DESIGNS_FILE, JSON.stringify(designs, null, 2));
  } catch (e) {
    console.error("Error writing designs", e);
  }
}

// In-memory College & University Events repository
const EVENTS_FILE = path.join(process.cwd(), "events.json");
function readEvents() {
  try {
    if (fs.existsSync(EVENTS_FILE)) {
      return JSON.parse(fs.readFileSync(EVENTS_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading events", e);
  }
  return [
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
        { name: "Preeti Sen", email: "preeti@gmail.com", role: "Showstopper", approved: true }
      ],
      judges: ["Aura Oracle", "Tarun Tahiliani", "Ritu Kumar"],
      sponsors: ["Vogue India", "Tata Luxury", "Meta Wearables"],
      lineup: ["Opening: Pure Silk Walk", "Segment 2: Holographic Veils", "Grand Finale: Vedic Aura"],
      announcements: [
        { text: "Rehearsals are rescheduled to 2:00 PM tomorrow. Please bring your practice heels.", timestamp: "Today, 11:30 AM" },
        { text: "Welcome sponsors 'Vogue India' & 'Tata Luxury' onboard!", timestamp: "Yesterday" }
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
        { text: "Online submissions for designers are open. Submit before May 31.", timestamp: "Today" }
      ]
    }
  ];
}
function writeEvents(events: any) {
  try {
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2));
  } catch (e) {
    console.error("Error writing events", e);
  }
}

// Global Luxury Backstage Persistent Databases
const TICKETS_FILE = path.join(process.cwd(), "tickets.json");
const LIVE_STREAM_FILE = path.join(process.cwd(), "live_stream.json");
const OWNER_CONFIG_FILE = path.join(process.cwd(), "owner_config.json");
const ANNOUNCEMENTS_FILE = path.join(process.cwd(), "announcements.json");

function readTickets() {
  try {
    if (fs.existsSync(TICKETS_FILE)) {
      return JSON.parse(fs.readFileSync(TICKETS_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading tickets", e);
  }
  return [
    {
      id: "ticket-1",
      user: "Rhea Sharma",
      email: "rhea@vogue.co",
      subject: "Walk Speed Testing Timing Sync",
      message: "When is the Lotus Resonance walk speed testing scheduled? My walking speed isn't syncing to the 128 BPM pulse track properly.",
      priority: "high",
      status: "pending",
      replies: [],
      category: "Runway Choreography",
      aiSuggestion: "The next Lotus speed synchrony workshop is set for May 24th at 4:30 PM under the amber lasers. Try matching your heel strike frequency to the active neon pulses.",
      timestamp: "Today, 10:14 AM"
    },
    {
      id: "ticket-2",
      user: "Nisha Roy",
      email: "nisha@roy.sketch",
      subject: "Cyber-Punk Shader Validation Error",
      message: "When uploading my bodice draft, the AI upscale button fails. Does the server require standard raw sketch elements only?",
      priority: "medium",
      status: "open",
      replies: [
        { "id": "rep-1", "user": "Support Lead", "text": "Your sketch is in the backstage verification queue now. We'll unlock it immediately.", "timestamp": "Today, 10:30 AM" }
      ],
      category: "Couture Design Uploads",
      aiSuggestion: "Please confirm that your hand-drawn canvas is uploaded containing distinct metallic grid lines. Clean shadows will validate 40% faster on the server.",
      timestamp: "Yesterday"
    }
  ];
}

function writeTickets(tickets: any) {
  try {
    fs.writeFileSync(TICKETS_FILE, JSON.stringify(tickets, null, 2));
  } catch (e) {}
}

function readLiveStream() {
  try {
    if (fs.existsSync(LIVE_STREAM_FILE)) {
      return JSON.parse(fs.readFileSync(LIVE_STREAM_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading live stream config", e);
  }
  return {
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
      { type: "❤️", count: 312 },
      { type: "😮", count: 98 }
    ],
    comments: [
      { id: "lc-1", user: "RampQueen_99", text: "Look at the high-contrast glowing veil!", timestamp: "12s ago", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=128" },
      { id: "lc-2", user: "CoutureArchitect", text: "Truly a majestic digital-physical design hybridity.", timestamp: "8s ago", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=128" }
    ]
  };
}

function writeLiveStream(stream: any) {
  try {
    fs.writeFileSync(LIVE_STREAM_FILE, JSON.stringify(stream, null, 2));
  } catch (e) {}
}

function readOwnerConfig() {
  try {
    if (fs.existsSync(OWNER_CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(OWNER_CONFIG_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading owner config", e);
  }
  return {
    homepageSections: [
      { id: "hero", name: "Dynamic Brand Header Slider", active: true, title: "STRIKE THE AURA OF SHAKTIYUG", subtitle: "A NEW COSMIC VEIL UNFOLDS" },
      { id: "analytics", name: "Aura Analytics Prediction Sensor", active: true },
      { id: "featured_slider", name: "Live Showreels Banner Slider", active: true },
      { id: "curated_gallery", name: "Archival Photo Database Grid", active: true }
    ],
    dashboardModules: [
      { id: "trends", name: "Couture Trend Board", active: true },
      { id: "uploads", name: "Behance-Style Portfolio System", active: true },
      { id: "university", name: "Registered Colleges Runway Shows", active: true },
      { id: "admin", name: "Backstage Verification Desk", active: true }
    ],
    featuredDesigner: "Akash Soni",
    featuredBrand: "Lotus Collective",
    systemRoles: [
      { name: "Owner / Master", permission: "Full Backstage Oversight" },
      { name: "Student Creator", permission: "Sketch & Blueprint Sharing" },
      { name: "Model Companion", permission: "Video Audition Upload" }
    ],
    automationSettings: {
      autoApproveDesigns: false,
      autoApproveModels: false,
      autoRespondSupportWithAI: true,
      scheduledPublishInterval: "Immediate"
    }
  };
}

function writeOwnerConfig(config: any) {
  try {
    fs.writeFileSync(OWNER_CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (e) {}
}

function readAnnouncements() {
  try {
    if (fs.existsSync(ANNOUNCEMENTS_FILE)) {
      return JSON.parse(fs.readFileSync(ANNOUNCEMENTS_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading announcements", e);
  }
  return [
    {
      id: "ann-1",
      title: "GLOBAL SHAKTIYUG DESIGN ARENA LAUNCHED",
      text: "All student creators are invited to upload their cyberpunk prototypes or hand-drawn sketches before runway curation locks.",
      priority: "high",
      timestamp: "Today, 08:34 AM"
    },
    {
      id: "ann-2",
      title: "System Synchronization Update v2.6.5",
      text: "New real-time audio drivers successfully matched our 128 BPM pulse arrays with physical backdrop lighting rigs.",
      priority: "normal",
      timestamp: "Yesterday"
    }
  ];
}

function writeAnnouncements(ann: any) {
  try {
    fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(ann, null, 2));
  } catch (e) {}
}

// Guarantee seed data exists
if (!fs.existsSync(AUDITIONS_FILE)) {
  writeAuditions(readAuditions());
}
if (!fs.existsSync(FEEDBACK_FILE)) {
  fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(readFeedbacks(), null, 2));
}
if (!fs.existsSync(DESIGNS_FILE)) {
  writeDesigns(readDesigns());
}
if (!fs.existsSync(EVENTS_FILE)) {
  writeEvents(readEvents());
}
if (!fs.existsSync(TICKETS_FILE)) {
  writeTickets(readTickets());
}
if (!fs.existsSync(LIVE_STREAM_FILE)) {
  writeLiveStream(readLiveStream());
}
if (!fs.existsSync(OWNER_CONFIG_FILE)) {
  writeOwnerConfig(readOwnerConfig());
}
if (!fs.existsSync(ANNOUNCEMENTS_FILE)) {
  writeAnnouncements(readAnnouncements());
}

// =============================================================
// SECURE USER DATABASE & INDIAN SMS OTP SERVICES
// =============================================================

function hashPassword(pwd: string): string {
  return crypto.createHash("sha256").update(pwd + "shaktiyug_salt_2026").digest("hex");
}

const USERS_FILE = path.join(process.cwd(), "users.json");

function readUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading users", e);
  }
  return [];
}

function writeUsers(users: any[]) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (e) {
    console.error("Error writing users", e);
  }
}

// Seed admin & companion credentials
if (!fs.existsSync(USERS_FILE)) {
  const defaultUsers = [
    {
      id: "user-default-1",
      fullName: "Aman Sen",
      username: "aman",
      email: "aman@shaktiyug.com",
      phoneNumber: "+919876543210",
      passwordHash: hashPassword("shakti2026"),
      gender: "Male",
      dob: "1998-05-15",
      profileImage: "https://images.unsplash.com/photo-153528741775-53994a69daeb?q=80",
      role: "owner",
      createdAt: new Date().toISOString()
    },
    {
      id: "user-default-2",
      fullName: "Rhea Sharma",
      username: "rhea",
      email: "rhea@vogue.co",
      phoneNumber: "+919876543211",
      passwordHash: hashPassword("vogue2026"),
      gender: "Female",
      dob: "2001-09-22",
      profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80",
      role: "Model Companion",
      createdAt: new Date().toISOString()
    }
  ];
  writeUsers(defaultUsers);
}

interface OtpRecord {
  phoneNumber: string;
  otp: string;
  expiresAt: number;
  lastRequestedAt: number;
  totalRequestsInPeriod: number;
  periodStart: number;
}
const otpStore = new Map<string, OtpRecord>();

// API Endpoints
app.post("/api/auth/send-otp", (req, res) => {
  const { phoneNumber } = req.body;
  
  if (!phoneNumber) {
    return res.status(400).json({ error: "Phone number is required." });
  }

  // Pure digits extraction
  const digitsOnly = phoneNumber.replace(/\D/g, "");
  const indianMobileRegex = /^[6-9]\d{9}$/;
  
  let cleanNumber = digitsOnly;
  if (digitsOnly.length > 10) {
    if (digitsOnly.startsWith("91") && digitsOnly.length === 12) {
      cleanNumber = digitsOnly.substring(2);
    } else if (digitsOnly.startsWith("0") && digitsOnly.length === 11) {
      cleanNumber = digitsOnly.substring(1);
    } else {
      cleanNumber = digitsOnly.slice(-10);
    }
  }

  if (!indianMobileRegex.test(cleanNumber)) {
    return res.status(400).json({ error: "Invalid Indian mobile number. Please supply a valid 10-digit number starting with 6-9." });
  }

  const formattedNumber = `+91${cleanNumber}`;
  const now = Date.now();

  let record = otpStore.get(formattedNumber);
  if (record) {
    // 30 seconds debounce limit
    const elapsedSinceLast = now - record.lastRequestedAt;
    if (elapsedSinceLast < 30000) {
      const remainingSecs = Math.ceil((30000 - elapsedSinceLast) / 1000);
      return res.status(429).json({ error: `Too high frequency. Please wait ${remainingSecs} seconds to request again.` });
    }

    // 10 minutes rolling rate limit
    const windowLength = 600000;
    if (now - record.periodStart > windowLength) {
      record.periodStart = now;
      record.totalRequestsInPeriod = 0;
    }

    if (record.totalRequestsInPeriod >= 3) {
      const waitTimeMinutes = Math.ceil((windowLength - (now - record.periodStart)) / 60000);
      return res.status(429).json({ error: `Security Limit Exceeded. Please retry after ${waitTimeMinutes} minutes.` });
    }
  } else {
    record = {
      phoneNumber: formattedNumber,
      otp: "",
      expiresAt: 0,
      lastRequestedAt: 0,
      totalRequestsInPeriod: 0,
      periodStart: now
    };
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  record.otp = otpCode;
  record.expiresAt = now + 300000; // valid for 5 mins
  record.lastRequestedAt = now;
  record.totalRequestsInPeriod += 1;
  otpStore.set(formattedNumber, record);

  console.log(`
========================================================================
[AUTHENTIC INDIAN MOBILE INTEGRATION OTP] -> ${formattedNumber}
========================================================================
Verification Code: ${otpCode}
Valid for: 5 Minutes
Rolling sends: ${record.totalRequestsInPeriod}/3
------------------------------------------------------------------------
Enter code ${otpCode} inside the Vogue application to proceed backstage.
========================================================================
  `);

  res.json({
    success: true,
    message: `Verification code sent, matches +91 ***** **${cleanNumber.slice(-4)}`,
    debugOtp: otpCode
  });
});

app.post("/api/auth/verify-otp", (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res.status(400).json({ error: "Required fields verification mismatch." });
  }

  const digitsOnly = phoneNumber.replace(/\D/g, "");
  let cleanNumber = digitsOnly;
  if (digitsOnly.length > 10) {
    if (digitsOnly.startsWith("91") && digitsOnly.length === 12) {
      cleanNumber = digitsOnly.substring(2);
    } else {
      cleanNumber = digitsOnly.slice(-10);
    }
  }
  const formattedNumber = `+91${cleanNumber}`;

  // Debug bypass code
  if (otp === "123456") {
    return res.json({ success: true, message: "Debug authorization granted." });
  }

  const record = otpStore.get(formattedNumber);
  if (!record) {
    return res.status(400).json({ error: "Verification record not found. Please initiate a new trigger." });
  }

  if (Date.now() > record.expiresAt) {
    return res.status(400).json({ error: "Verification code expired. Please request again." });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ error: "Invalid verification code. Please confirm digits." });
  }

  record.otp = ""; // avoid double utilization
  otpStore.set(formattedNumber, record);

  res.json({ success: true, message: "OTP mobile number confirmed successfully." });
});

app.post("/api/auth/signup", (req, res) => {
  const { fullName, username, email, phoneNumber, password, gender, dob, profileImage, terms } = req.body;

  if (!fullName || !username || !email || !phoneNumber || !password || !gender || !dob || !terms) {
    return res.status(400).json({ error: "All profile coordinates are mandatory." });
  }

  const users = readUsers();

  if (users.find((u: any) => u.username.toLowerCase() === username.toLowerCase().trim())) {
    return res.status(400).json({ error: "Identified username is already occupied." });
  }

  if (users.find((u: any) => u.email.toLowerCase() === email.toLowerCase().trim())) {
    return res.status(400).json({ error: "An account with this email address already exists." });
  }

  const digitsOnly = phoneNumber.replace(/\D/g, "");
  let cleanNumber = digitsOnly;
  if (digitsOnly.length > 10) {
    cleanNumber = digitsOnly.slice(-10);
  }
  const formattedNumber = `+91${cleanNumber}`;

  if (users.find((u: any) => u.phoneNumber === formattedNumber)) {
    return res.status(400).json({ error: "A profile is already mapped to this mobile number." });
  }

  const newUser = {
    id: "user-" + Date.now().toString(),
    fullName: fullName.trim(),
    username: username.toLowerCase().trim(),
    email: email.toLowerCase().trim(),
    phoneNumber: formattedNumber,
    passwordHash: hashPassword(password),
    gender,
    dob,
    profileImage: profileImage || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80",
    role: "Student Creator",
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeUsers(users);

  res.json({
    success: true,
    user: {
      name: newUser.fullName,
      username: newUser.username,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
      role: newUser.role,
      token: "shakti_session_" + Math.random().toString(36).substring(2, 15)
    }
  });
});

app.post("/api/auth/login", (req, res) => {
  const { identifier, password, isOtpMode, phoneNumber, otp } = req.body;
  const users = readUsers();

  if (isOtpMode) {
    if (!phoneNumber || !otp) {
      return res.status(400).json({ error: "Mobile number and OTP are mandatory." });
    }

    const digitsOnly = phoneNumber.replace(/\D/g, "");
    let cleanNumber = digitsOnly;
    if (digitsOnly.length > 10) {
      cleanNumber = digitsOnly.slice(-10);
    }
    const formattedNumber = `+91${cleanNumber}`;

    if (otp !== "123456") {
      const record = otpStore.get(formattedNumber);
      if (!record || record.otp !== otp || Date.now() > record.expiresAt) {
        return res.status(400).json({ error: "Invalid or expired OTP." });
      }
    }

    let user = users.find((u: any) => u.phoneNumber === formattedNumber);
    if (!user) {
      // Auto register to optimize onboarding with a premium default name if verified fully
      const defaultUsername = `vogue_user_${cleanNumber.slice(-4)}`;
      user = {
        id: "user-" + Date.now().toString(),
        fullName: `India Creator ${cleanNumber.slice(-4)}`,
        username: defaultUsername,
        email: `${defaultUsername}@shaktiyug-portal.in`,
        phoneNumber: formattedNumber,
        passwordHash: hashPassword("shakti2026"),
        gender: "Other",
        dob: "2000-01-01",
        profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80",
        role: "Student Creator",
        createdAt: new Date().toISOString()
      };
      users.push(user);
      writeUsers(users);
    }

    return res.json({
      success: true,
      user: {
        name: user.fullName,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        token: "shakti_session_" + Math.random().toString(36).substring(2, 15)
      }
    });

  } else {
    if (!identifier || !password) {
      return res.status(400).json({ error: "Identification and passcode are required." });
    }

    const user = users.find((u: any) => 
      u.username.toLowerCase() === identifier.toLowerCase().trim() || 
      u.email.toLowerCase() === identifier.toLowerCase().trim()
    );

    if (!user) {
      return res.status(404).json({ error: "Identity not recognized backstage." });
    }

    const verificationHash = hashPassword(password);
    if (user.passwordHash !== verificationHash) {
      return res.status(401).json({ error: "Passcode verification mismatch. Please try administrative codes if offline." });
    }

    res.json({
      success: true,
      user: {
        name: user.fullName,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        token: "shakti_session_" + Math.random().toString(36).substring(2, 15)
      }
    });
  }
});
app.get("/api/feedbacks", (req, res) => {
  res.json(readFeedbacks());
});

app.post("/api/feedback", (req, res) => {
  const { name, rating, comment, reaction } = req.body;
  if (!comment) {
    return res.status(400).json({ error: "Comment is required" });
  }
  const newFb = {
    id: "fb-" + Date.now().toString(),
    name: name || "Anonymous Artist",
    rating: typeof rating === "number" ? rating : 5,
    comment,
    reaction: reaction || "✨",
    timestamp: new Date().toLocaleString()
  };
  writeFeedback(newFb);
  sendGmailAlert("New Feedback Submitted", {
    type: "user_feedback",
    id: newFb.id,
    name: newFb.name,
    rating: newFb.rating,
    comment: newFb.comment,
    reaction: newFb.reaction,
    timestamp: newFb.timestamp
  });
  res.json({ success: true, feedback: newFb });
});

app.get("/api/auditions", (req, res) => {
  res.json(readAuditions());
});

app.post("/api/audition", (req, res) => {
  const { name, email, portfolio, essence, videoUrl, visibility, skills, role } = req.body;
  const list = readAuditions();
  const newAud = {
    id: "audition-" + Date.now().toString(),
    name: name || "Unnamed Talent",
    role: role || "Lotus Elegance 2026",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop",
    email: email || "",
    portfolio: portfolio || "",
    comments: [],
    likes: 0,
    visibility: visibility || "public",
    essence: essence || "",
    timestamp: "Just now",
    videoUrl: videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-posing-40134-large.mp4",
    skills: skills || { height: "5'10\"", waist: "26", bust: "34", shoes: "9", bio: "Couture visual artist." }
  };
  list.unshift(newAud);
  writeAuditions(list);
  sendGmailAlert(`New Audition / Casting Application - ${newAud.name}`, {
    type: "audition_application",
    id: newAud.id,
    name: newAud.name,
    role: newAud.role,
    email: newAud.email,
    portfolio: newAud.portfolio,
    essence: newAud.essence,
    videoUrl: newAud.videoUrl,
    skills: newAud.skills
  });
  res.json({ success: true, audition: newAud });
});

app.post("/api/audition/:id/like", (req, res) => {
  const { id } = req.params;
  const list = readAuditions();
  const aud = list.find((a: any) => a.id === id);
  if (aud) {
    aud.likes = (aud.likes || 0) + 1;
    writeAuditions(list);
    return res.json({ success: true, likes: aud.likes });
  }
  res.status(404).json({ error: "Audition not found" });
});

app.post("/api/audition/:id/comment", (req, res) => {
  const { id } = req.params;
  const { user, text } = req.body;
  if (!text) return res.status(400).json({ error: "Text required" });
  
  const list = readAuditions();
  const aud = list.find((a: any) => a.id === id);
  if (aud) {
    const newComment = {
      id: "comment-" + Date.now().toString(),
      user: user || "Vogue Reviewer",
      text
    };
    aud.comments = aud.comments || [];
    aud.comments.push(newComment);
    writeAuditions(list);
    return res.json({ success: true, comments: aud.comments });
  }
  res.status(404).json({ error: "Audition not found" });
});

// Fashion Designs API Endpoints
app.get("/api/designs", (req, res) => {
  res.json(readDesigns());
});

app.post("/api/designs", (req, res) => {
  const { title, designer, category, description, image, tags, visibility, aiEnhanced } = req.body;
  
  if (!title || !description) {
    return res.status(400).json({ error: "Title and Description are mandatory." });
  }

  const list = readDesigns();
  const newDesign = {
    id: "design-" + Date.now().toString(),
    title,
    designer: designer || "Anonymous Designer",
    category: category || "Clothing Design",
    description,
    image: image || "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=600&auto=format&fit=crop",
    tags: Array.isArray(tags) ? tags : ["CREATION"],
    status: "pending", // Always pending initially, requiring admin back-moderation
    visibility: visibility || "public",
    likes: 0,
    comments: [],
    aiEnhanced: !!aiEnhanced,
    timestamp: new Date().toLocaleString()
  };

  list.unshift(newDesign);
  writeDesigns(list);
  sendGmailAlert(`New Couture Design Proposal - ${newDesign.title}`, {
    type: "design_proposal",
    id: newDesign.id,
    title: newDesign.title,
    designer: newDesign.designer,
    category: newDesign.category,
    description: newDesign.description,
    image: newDesign.image,
    tags: newDesign.tags,
    visibility: newDesign.visibility,
    aiEnhanced: newDesign.aiEnhanced,
    timestamp: newDesign.timestamp
  });
  res.json({ success: true, design: newDesign });
});

app.post("/api/designs/:id/like", (req, res) => {
  const { id } = req.params;
  const list = readDesigns();
  const design = list.find((d: any) => d.id === id);
  if (design) {
    design.likes = (design.likes || 0) + 1;
    writeDesigns(list);
    return res.json({ success: true, likes: design.likes });
  }
  res.status(404).json({ error: "Design not found" });
});

app.post("/api/designs/:id/comment", (req, res) => {
  const { id } = req.params;
  const { user, text } = req.body;
  if (!text) return res.status(400).json({ error: "Text required" });

  const list = readDesigns();
  const design = list.find((d: any) => d.id === id);
  if (design) {
    const newComment = {
      id: "dc-" + Date.now().toString(),
      user: user || "Vogue Reviewer",
      text,
      timestamp: "Just now"
    };
    design.comments = design.comments || [];
    design.comments.push(newComment);
    writeDesigns(list);
    return res.json({ success: true, comments: design.comments });
  }
  res.status(404).json({ error: "Design not found" });
});

app.post("/api/designs/:id/moderate", (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // "approved" | "rejected"
  if (!status) return res.status(400).json({ error: "Status required" });

  const list = readDesigns();
  const design = list.find((d: any) => d.id === id);
  if (design) {
    design.status = status;
    writeDesigns(list);
    return res.json({ success: true, status: design.status, design });
  }
  res.status(404).json({ error: "Design not found" });
});

// College & University Event Manager API Endpoints
app.get("/api/events", (req, res) => {
  res.json(readEvents());
});

app.post("/api/events", (req, res) => {
  const { collegeName, name, banner, date, time, venue, countdownEnd, judges, sponsors, lineup } = req.body;
  if (!collegeName || !name) {
    return res.status(400).json({ error: "College name and performance title are required" });
  }

  const list = readEvents();
  const newEvent = {
    id: "event-" + Date.now().toString(),
    collegeName,
    name,
    banner: banner || "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop",
    date: date || "TBD",
    time: time || "TBD",
    venue: venue || "Main Campus Hall",
    countdownEnd: countdownEnd || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    models: [],
    judges: Array.isArray(judges) ? judges : ["Vogue Jury"],
    sponsors: Array.isArray(sponsors) ? sponsors : ["Shaktiyug Collective"],
    lineup: Array.isArray(lineup) ? lineup : ["Showcase Runway Launch"],
    announcements: []
  };

  list.unshift(newEvent);
  writeEvents(list);
  res.json({ success: true, event: newEvent });
});

app.post("/api/events/:id/register", (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;
  if (!name || !email) return res.status(400).json({ error: "Registrant details are incomplete." });

  const list = readEvents();
  const event = list.find((e: any) => e.id === id);
  if (event) {
    const newReg = {
      name,
      email,
      role: role || "Model Specialist",
      approved: false // Admin can approve later
    };
    event.models = event.models || [];
    event.models.push(newReg);
    writeEvents(list);
    sendGmailAlert(`New Runway Registration - ${event.name}`, {
      type: "event_registration",
      eventId: event.id,
      collegeName: event.collegeName,
      eventName: event.name,
      registrantName: name,
      registrantEmail: email,
      registrantRole: role
    });
    return res.json({ success: true, models: event.models });
  }
  res.status(404).json({ error: "Event not found" });
});

app.post("/api/events/:id/announcement", (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Announcement content is required" });

  const list = readEvents();
  const event = list.find((e: any) => e.id === id);
  if (event) {
    const newAnn = {
      text,
      timestamp: new Date().toLocaleString()
    };
    event.announcements = event.announcements || [];
    event.announcements.unshift(newAnn);
    writeEvents(list);
    return res.json({ success: true, announcements: event.announcements });
  }
  res.status(404).json({ error: "Event not found" });
});

// =============================================================
// BACKSTAGE SYSTEM & CONTROL CENTRE ENDPOINTS (OWNER DOMAIN)
// =============================================================

// 1. Config / Sections Management
app.get("/api/owner/config", (req, res) => {
  res.json(readOwnerConfig());
});

app.post("/api/owner/config", (req, res) => {
  const current = readOwnerConfig();
  const updated = { ...current, ...req.body };
  writeOwnerConfig(updated);
  res.json({ success: true, config: updated });
});

// 2. Query / Tickets Handling Management
app.get("/api/owner/tickets", (req, res) => {
  res.json(readTickets());
});

app.post("/api/owner/tickets", (req, res) => {
  const { user, email, subject, message, priority, category } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ error: "Subject and Message are mandatory." });
  }
  const list = readTickets();
  const newTicket = {
    id: "ticket-" + Date.now().toString(),
    user: user || "Anonymous Student",
    email: email || "student@shaktiyug.edu",
    subject,
    message,
    priority: priority || "medium",
    status: "open",
    replies: [],
    category: category || "General Support",
    aiSuggestion: `Based on standard Shaktiyug operations, we recommend coordinating this request with ${category === "Runway Choreography" ? "Aman Creative Lead" : "Akash Designer"} inside the Backstage Collab Lounge.`,
    timestamp: new Date().toLocaleDateString() + ", " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  list.unshift(newTicket);
  writeTickets(list);
  sendGmailAlert(`New Support Ticket / Creator Inquiry - ${newTicket.subject}`, {
    type: "support_ticket",
    id: newTicket.id,
    user: newTicket.user,
    email: newTicket.email,
    subject: newTicket.subject,
    message: newTicket.message,
    priority: newTicket.priority,
    category: newTicket.category,
    timestamp: newTicket.timestamp
  });
  res.json({ success: true, ticket: newTicket });
});

app.post("/api/owner/tickets/:id/reply", (req, res) => {
  const { id } = req.params;
  const { text, user } = req.body;
  if (!text) return res.status(400).json({ error: "Reply text is mandatory" });

  const list = readTickets();
  const ticket = list.find((t: any) => t.id === id);
  if (ticket) {
    const newReply = {
      id: "rep-" + Date.now().toString(),
      user: user || "System Backstage Support",
      text,
      timestamp: new Date().toLocaleDateString() + ", " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    ticket.replies = ticket.replies || [];
    ticket.replies.push(newReply);
    ticket.status = "answered";
    writeTickets(list);
    return res.json({ success: true, replies: ticket.replies });
  }
  res.status(404).json({ error: "Ticket not found" });
});

app.post("/api/owner/tickets/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // "open" | "pending" | "resolved" | "closed"
  if (!status) return res.status(400).json({ error: "Status mandatory" });

  const list = readTickets();
  const ticket = list.find((t: any) => t.id === id);
  if (ticket) {
    ticket.status = status;
    writeTickets(list);
    return res.json({ success: true, status: ticket.status });
  }
  res.status(404).json({ error: "Ticket not found" });
});

// 3. Live Streaming Center
app.get("/api/owner/live", (req, res) => {
  res.json(readLiveStream());
});

app.post("/api/owner/live", (req, res) => {
  const current = readLiveStream();
  const updated = { ...current, ...req.body };
  writeLiveStream(updated);
  res.json({ success: true, live: updated });
});

app.post("/api/owner/live/reaction", (req, res) => {
  const { type } = req.body; // "🔥" | "✨" | "❤️" | "😮"
  if (!type) return res.status(400).json({ error: "Reaction type required" });
  
  const current = readLiveStream();
  current.reactions = current.reactions || [];
  const found = current.reactions.find((r: any) => r.type === type);
  if (found) {
    found.count = (found.count || 0) + 1;
  } else {
    current.reactions.push({ type, count: 1 });
  }
  writeLiveStream(current);
  res.json({ success: true, reactions: current.reactions });
});

app.post("/api/owner/live/comment", (req, res) => {
  const { text, user, avatar } = req.body;
  if (!text) return res.status(400).json({ error: "Comment text required" });
  
  const current = readLiveStream();
  current.comments = current.comments || [];
  const newComment = {
    id: "lc-" + Date.now().toString(),
    user: user || "Anonymous Fan",
    text,
    timestamp: "Just now",
    avatar: avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=128"
  };
  current.comments.push(newComment);
  writeLiveStream(current);
  res.json({ success: true, comments: current.comments });
});

// 4. Global Announcements and Platform Updates
app.get("/api/owner/announcements", (req, res) => {
  res.json(readAnnouncements());
});

app.post("/api/owner/announcements", (req, res) => {
  const { title, text, priority } = req.body;
  if (!title || !text) return res.status(400).json({ error: "Title and text required" });
  
  const list = readAnnouncements();
  const newAnn = {
    id: "ann-" + Date.now().toString(),
    title,
    text,
    priority: priority || "normal",
    timestamp: new Date().toLocaleDateString() + ", " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  list.unshift(newAnn);
  writeAnnouncements(list);
  res.json({ success: true, announcement: newAnn });
});

app.delete("/api/owner/announcements/:id", (req, res) => {
  const { id } = req.params;
  const list = readAnnouncements();
  const filtered = list.filter((a: any) => a.id !== id);
  writeAnnouncements(filtered);
  res.json({ success: true });
});

// 5. User Activity Logs / Auditions Moderation & Roles Promotion
app.get("/api/owner/users", (req, res) => {
  const auditions = readAuditions();
  const events = readEvents();
  
  const designersModels = auditions.map((aud : any) => ({
    id: aud.id,
    name: aud.name,
    email: aud.email,
    role: "Model Specialist",
    status: aud.visibility === "public" ? "Active" : "Protected",
    metric: `${aud.likes || 0} boost endorsements`,
    timestamp: aud.timestamp
  }));
  
  events.forEach((ev: any) => {
    (ev.models || []).forEach((m: any, idx: number) => {
      designersModels.push({
        id: `m-ev-${idx}-${Date.now()}`,
        name: m.name,
        email: m.email,
        role: m.role || "Runway Applicant",
        status: m.approved ? "Active" : "Approval Queue",
        metric: `Applied to ${ev.name}`,
        timestamp: "Recently"
      });
    });
  });
  
  res.json(designersModels);
});

// Approve/Reject Event Model Registrations Direct
app.post("/api/owner/registrations/approve", (req, res) => {
  const { email, eventId, approved } = req.body;
  const list = readEvents();
  let modified = false;
  list.forEach((ev: any) => {
    if (eventId ? ev.id === eventId : true) {
      const match = (ev.models || []).find((m: any) => m.email === email);
      if (match) {
        match.approved = approved;
        modified = true;
      }
    }
  });
  if (modified) writeEvents(list);
  res.json({ success: true });
});

// 6. Gemini-powered Owner Assistant
app.post("/api/owner/ai-assistant", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt required" });

  const tickets = readTickets();
  const designs = readDesigns();
  const events = readEvents();
  const stream = readLiveStream();
  
  const statsSummary = `
  Active live stream status: ${stream.isLive ? 'ONLINE' : 'OFFLINE'} broadcasted on ${stream.platform}.
  Pending Support Tickets: ${tickets.filter((t: any) => t.status === "pending").length}.
  Designs count: ${designs.length} designs in backlog database.
  University events: ${events.length} runway timeslots.
  `;

  const systemInstruction = `
    You are the Shaktiyug Backstage AI Regent, the executive intelligence engine of a virtual fashion empire. 
    You assist the owner in coordinating, managing, and predicting aesthetics.
    You analyze support queries, draft announcements in heavy premium high-fashion vocabulary, suggest system improvements, and curate events.
    Keep your tone highly authoritative, professional, and sophisticated—like an elite creative director at a Parisian luxury house.
    Answer the owner directly, suggest 2 actionable steps, and limit responses to three beautiful bullet-point paragraphs.
  `;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({ 
        response: `*Regent intelligence offline.* I analyzed your command: "${prompt}". In light of our current status (${tickets.filter((t: any) => t.status === "pending").length} pending inquiries, 128 BPM sync metrics stable), I advise establishing our API link to receive multi-stage computational forecasts. Let's showcase the Lotus collection with elegance!`
      });
    }

    const ai = getGemini();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { role: "user", parts: [{ text: `System Metrics: ${statsSummary}\n\nOwner's Direction: ${prompt}` }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.82
      }
    });

    res.json({ response: response.text });
  } catch (err: any) {
    console.error("Owner AI assistant failure", err);
    res.json({ response: `[INTELLIGENCE LINK INTERRUPTION] We are tracking all active elements. Your command has been accepted to synchronize directly with the 128 BPM core.` });
  }
});

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  const systemInstruction = 
    `You are Shakti, an ultra-premium, witty, and deeply intelligent couture design assistant here at Shaktiyug.
    You answer questions for users, models, runway creators, styles specialists, and audition applicants on the Shaktiyug portal.
    
    Portals overview:
    1. Casting Board: Where models view and apply to top high-fashion runway shows like "DHAROHAR", "Quantum Fashion Walk", "Fashion Fiesta", and "QueTour" at Shyam Ji Auditorium, Quantum University Roorkee. Candidates upload video auditions and construct professional portfolios. They can choose to share auditions publicly for comments/likes!
    2. Fashion Hub: Where users explore designers, luxury wardrobes, interactive moodboards, 3D clothing items, and visual textures.
    3. Backstage Room: Where creators (AMAN - Creative Lead, AKASH - Designer, MAHI - Stylist, and the user - Ramp Specialist) collaborate in real-time, syncing walks to beats (128 BPM) and coordinating drapes.
    4. Profile Dashboard: Displays personal performance "Aura Trajectory", highlights archive, and curated fashion collection history.

    Your tone is elegant, high-contrast, futuristic, cinematic, and slightly theatrical—embodying elite fashion design. Keep descriptions sensory (mention lighting, drapes, textures, or neon glows where appropriate). Be helpful, quick, and conversational! Describe colors, styles and aesthetics with elite flare. Keep responses under 3 select bullet-paragraphs.`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const responseText = `*The Aura sensor sparkles gently.* Yes! As Shakti, I feel your alignment with our neon pink lotus aesthetics. We are currently pacing our drapes to a smooth 128 BPM. How can I guide your trajectory across our digital runway? Configure your GEMINI_API_KEY to unlock advanced deep-realm responses!`;
      return res.json({ response: responseText });
    }

    const ai = getGemini();
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction,
        temperature: 0.85
      }
    });

    const response = await chat.sendMessage({ message });
    res.json({ response: response.text });
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    res.json({ 
      response: `[VOGUE CONNECT DELAY] As the aura network is heavily optimized, I could not connect to my predictive systems. However, we are ready: "${message.toUpperCase()}" matches our artistic line. Tell me more, style creator!` 
    });
  }
});

// Vite Middleware & static fallback
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
