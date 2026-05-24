import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Shield, User, Sparkles, Key, Mail, Lock, 
  CheckCircle, Phone, Clock, ArrowRight, Check, 
  Upload, AlertCircle 
} from 'lucide-react';

interface VogueLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string; role: string; phoneNumber?: string }) => void;
}

export default function VogueLoginModal({ isOpen, onClose, onLoginSuccess }: VogueLoginModalProps) {
  // Primary Tabs: Sign In (Assemble Session) vs Sign Up (Register Identity)
  const [isSignUp, setIsSignUp] = useState(false);

  // Login Option: Credentials vs India OTP Login
  const [loginWithPhone, setLoginWithPhone] = useState(false);

  // Profile fields (General)
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('Female');
  const [dob, setDob] = useState('2001-01-01');
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Credentials Login fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Indian Phone & OTP state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  
  const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(''));
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // General Status Alerts
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Drag-and-drop simulated file upload state
  const [isDragging, setIsDragging] = useState(false);

  // Autofocus input refs for OTP fields
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdowns for OTP Resend window
  useEffect(() => {
    if (otpTimer <= 0) return;
    const timer = setInterval(() => {
      setOtpTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpTimer]);

  // Handle Indian mobile validation
  const handlePhoneChange = (val: string) => {
    // Keep digits only
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(cleaned);
    setOtpSent(false);
    setOtpVerified(false);
    setOtpCode(Array(6).fill(''));

    if (cleaned.length === 0) {
      setPhoneError('Indian Mobile coordination is required.');
      setIsPhoneValid(false);
      return;
    }

    // Validate 10-digit format starting with 6-9
    const regex = /^[6-9]\d{9}$/;
    if (!regex.test(cleaned)) {
      setPhoneError('Must contain exactly 10 digits starting with 6, 7, 8 or 9.');
      setIsPhoneValid(false);
    } else {
      setPhoneError('');
      setIsPhoneValid(true);
    }
  };

  // Dispatch OTP Service
  const triggerSendOtp = async () => {
    if (!isPhoneValid) return;
    setError('');
    setIsSendingOtp(true);
    
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Too many OTP requests. Please wait.');
      }

      setOtpSent(true);
      setOtpTimer(30); // 30 sec resend timer
      setSuccess(`A 6-digit confirmation key has been dispatched to +91 ***** **${phoneNumber.slice(-4)}`);
      
      // Auto populate first box
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 300);

      // If debug OTP exists in response, we display it to console/window for smooth verification
      if (resData.debugOtp) {
        console.log(`[Vogue Debug] Target Verification Key: ${resData.debugOtp}`);
      }
    } catch (err: any) {
      setError(err.message || 'OTP server network delay. Try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verification process of OTP keys
  const verifyEnteredOtp = async (inputCode: string) => {
    setError('');
    setIsVerifyingOtp(true);
    
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp: inputCode })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Verification mismatch.');
      }

      setOtpVerified(true);
      setSuccess('Indian Contact verified backstage!');
    } catch (err: any) {
      setError(err.message || 'Verification token mismatch.');
      // Flush inputs to correct errors
      setOtpCode(Array(6).fill(''));
      otpInputRefs.current[0]?.focus();
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Watch for complete digits typing
  const handleOtpBoxChange = (index: number, val: string) => {
    if (/[^\d]/.test(val)) return;
    const newCode = [...otpCode];
    newCode[index] = val.slice(-1);
    setOtpCode(newCode);

    // Focus hopping
    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto verify when fully filled
    const fullCode = newCode.join('');
    if (fullCode.length === 6) {
      verifyEnteredOtp(fullCode);
    }
  };

  const handleOtpKeydown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Simulated image upload drag-drop
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Only image credentials are admitted.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Unified submission
  const handleSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isSignUp) {
      // Validate sign up variables
      if (!fullName || !username || !email || !password) {
        setError('Please supply all required identity fields.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passcode verification and confirm passcode must match.');
        setLoading(false);
        return;
      }
      if (!otpVerified) {
        setError('Indian Mobile OTP verification is mandatory.');
        setLoading(false);
        return;
      }
      if (!termsAccepted) {
        setError('Accepting Terms & Conditions is required.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName,
            username,
            email,
            phoneNumber,
            password,
            gender,
            dob,
            profileImage: profilePreview,
            terms: termsAccepted
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Form submission failed.');
        }

        setSuccess('Cohesive identity successfully established!');
        localStorage.setItem('shakti_vogue_user', JSON.stringify({
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          phoneNumber: data.user.phoneNumber,
          avatar: profilePreview || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80"
        }));

        window.dispatchEvent(new Event('vogue-auth-change'));
        
        setTimeout(() => {
          onLoginSuccess(data.user);
          onClose();
        }, 1200);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }

    } else {
      // Login submission
      try {
        const payload = loginWithPhone 
          ? { isOtpMode: true, phoneNumber, otp: otpCode.join('') }
          : { isOtpMode: false, identifier: loginIdentifier, password: loginPassword };

        if (!loginWithPhone && (!loginIdentifier || !loginPassword)) {
          setError('Identification ID and password are required.');
          setLoading(false);
          return;
        }

        if (loginWithPhone && !otpVerified) {
          setError('Must verify OTP to log in backstage.');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Authentication rejected.');
        }

        setSuccess('Backstage access granted. Session registered.');
        
        const avatarToSave = data.user.role === 'owner' 
          ? "https://images.unsplash.com/photo-153528741775-53994a69daeb?q=80"
          : "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80";

        localStorage.setItem('shakti_vogue_user', JSON.stringify({
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          phoneNumber: data.user.phoneNumber,
          avatar: avatarToSave
        }));

        window.dispatchEvent(new Event('vogue-auth-change'));

        setTimeout(() => {
          onLoginSuccess(data.user);
          onClose();
        }, 1200);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Social login OAuth simulation triggered with luxury design
  const triggerSocialLogin = async (platformName: string) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      setSuccess(`Connecting secure OAuth bridge to official ${platformName} servers...`);
      await new Promise(r => setTimeout(r, 1500));
      
      const parsedUser = {
        name: `${platformName} Creator Space`,
        email: `oauth.${platformName.toLowerCase()}@shaktiyug.com`,
        role: 'Student Creator',
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80"
      };

      setSuccess(`Welcome backstage via ${platformName} authorization!`);
      localStorage.setItem('shakti_vogue_user', JSON.stringify(parsedUser));
      window.dispatchEvent(new Event('vogue-auth-change'));

      setTimeout(() => {
        onLoginSuccess(parsedUser);
        onClose();
      }, 1000);

    } catch (err) {
      setError(`OAuth interaction with ${platformName} encountered network interference.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Dark luxury backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#090308]/94 backdrop-blur-lg"
          />

          {/* Modal Card wrapper */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -20 }}
            transition={{ type: "spring", stiffness: 350, damping: 27 }}
            className="relative w-full max-w-lg max-h-[90vh] bg-[#0c050a]/95 border border-shakti-gold/30 rounded-sm shadow-2xl p-6 md:p-8 overflow-y-auto font-sans z-10 custom-scrollbar"
          >
            {/* Ambient luxury lights */}
            <div className="absolute -left-20 -top-20 w-44 h-44 bg-shakti-gold/10 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -right-20 -bottom-20 w-44 h-44 bg-[#ff2d55]/10 blur-3xl rounded-full pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-all cursor-pointer p-1.5 border border-white/5 hover:border-white/10 rounded-full"
              title="Close Authentication Node"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Logo and Titles */}
            <div className="flex flex-col items-center text-center mb-6 pt-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#ff2d55] to-shakti-gold p-[1px] mb-3 animate-pulse">
                <div className="w-full h-full rounded-full bg-shakti-black flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-shakti-gold" />
                </div>
              </div>
              <h3 className="font-serif text-3xl italic text-white leading-none">
                {isSignUp ? 'Establish Identity Matrix' : 'Synchronize Backstage Area'}
              </h3>
              <p className="text-[10px] uppercase tracking-[0.4em] text-shakti-gold font-black mt-2">
                Shaktiyug Authentic Multi-Factor Vault
              </p>
            </div>

            {/* Section Tab Selectors */}
            <div className="grid grid-cols-2 border-b border-white/10 pb-0.5 mb-6 text-center">
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setError(''); setSuccess(''); }}
                className={`text-[10.5px] uppercase tracking-[0.2em] font-black transition-all pb-3 border-b-2 cursor-pointer ${
                  !isSignUp ? 'border-shakti-gold text-shakti-gold' : 'border-transparent text-white/40 hover:text-white'
                }`}
              >
                Assemble Session
              </button>
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setError(''); setSuccess(''); }}
                className={`text-[10.5px] uppercase tracking-[0.2em] font-black transition-all pb-3 border-b-2 cursor-pointer ${
                  isSignUp ? 'border-shakti-gold text-shakti-gold' : 'border-transparent text-white/40 hover:text-white'
                }`}
              >
                Register Identity
              </button>
            </div>

            {/* Session Type (Only inside Login/Assemble Session tab) */}
            {!isSignUp && (
              <div className="flex bg-[#070206] p-1 border border-white/5 rounded-xs justify-center mb-6">
                <button
                  type="button"
                  onClick={() => { setLoginWithPhone(false); setError(''); }}
                  className={`flex-1 text-[9px] uppercase tracking-wider py-1.5 font-bold transition-all rounded-xs cursor-pointer ${
                    !loginWithPhone ? 'bg-shakti-gold/10 border border-shakti-gold/30 text-shakti-gold' : 'text-white/40 hover:text-white'
                  }`}
                >
                  Credentials Profile
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginWithPhone(true); setError(''); }}
                  className={`flex-1 text-[9px] uppercase tracking-wider py-1.5 font-bold transition-all rounded-xs cursor-pointer ${
                    loginWithPhone ? 'bg-shakti-gold/10 border border-shakti-gold/30 text-shakti-gold' : 'text-white/40 hover:text-white'
                  }`}
                >
                  Indian Mobile + OTP
                </button>
              </div>
            )}

            {/* Validation Alerts */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-mono rounded-xs uppercase tracking-wider text-center flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-mono rounded-xs uppercase tracking-wider text-center flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </motion.div>
            )}

            {/* Core Identity Forms */}
            <form onSubmit={handleSessionSubmit} className="space-y-4">
              
              {/* --- 1. SIGN IN BY CREDENTIALS FLOW --- */}
              {!isSignUp && !loginWithPhone && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-white/40 font-black block">Alias or Email coordinates</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/20">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <input
                        required
                        type="text"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="ENTER USERNAME OR EMAIL"
                        className="w-full bg-white/[0.03] border border-white/10 focus:border-shakti-gold rounded-xs py-2 px-3 pl-10 text-xs text-white placeholder:text-white/20 outline-none uppercase font-mono tracking-wider transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-white/40 font-black block">Secure Passcode</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/20">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <input
                        required
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-white/[0.03] border border-white/10 focus:border-shakti-gold rounded-xs py-2 px-3 pl-10 text-xs text-white placeholder:text-white/20 outline-none font-mono transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* --- 2. SIGN IN BY INDIAN PHONE OTP FLOW --- */}
              {!isSignUp && loginWithPhone && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-white/40 font-black block">Indian Mobile Link</label>
                    <div className="relative flex">
                      <span className="inline-flex items-center px-3 border border-r-0 border-white/10 bg-white/[0.03] text-white/50 text-xs font-mono rounded-l-xs">
                        +91
                      </span>
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/20">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <input
                          required
                          type="text"
                          pattern="[0-9]*"
                          inputMode="numeric"
                          value={phoneNumber}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          placeholder="ENTER 10 DIGIT NUMBER"
                          className="w-full bg-white/[0.03] border border-white/10 focus:border-shakti-gold rounded-r-xs py-2 px-3 pl-10 text-xs text-white placeholder:text-white/20 outline-none font-mono tracking-widest transition-colors"
                        />
                      </div>
                    </div>

                    {/* Verified state and ticks */}
                    {phoneError ? (
                      <span className="text-[8px] text-red-400 block font-mono">{phoneError}</span>
                    ) : (
                      phoneNumber.length === 10 && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {otpVerified ? (
                            <motion.div 
                              initial={{ scale: 0 }} 
                              animate={{ scale: 1 }}
                              className="flex items-center gap-1 text-[8.5px] text-green-400 font-mono"
                            >
                              <CheckCircle className="w-3 h-3" /> Verified Number
                            </motion.div>
                          ) : (
                            <span className="text-[8px] text-shakti-gold/60 block font-mono">Format Approved • Prepend +91 internally</span>
                          )}
                        </div>
                      )
                    )}
                  </div>

                  {/* Send OTP button appears dynamically when valid phone exists */}
                  {isPhoneValid && !otpVerified && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-1"
                    >
                      <button
                        type="button"
                        onClick={triggerSendOtp}
                        disabled={isSendingOtp}
                        className="py-1 px-3 bg-shakti-gold/10 hover:bg-shakti-gold/20 border border-shakti-gold/30 rounded-xs text-[9px] text-shakti-gold font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                      >
                        {isSendingOtp ? (
                          <div className="w-2.5 h-2.5 border-2 border-shakti-gold border-t-transparent rounded-full animate-spin" />
                        ) : 'Send OTP verification code'}
                      </button>
                    </motion.div>
                  )}

                  {/* 6 Digit Verification Field Section */}
                  {otpSent && !otpVerified && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2 bg-white/[0.01] p-4 border border-white/5 rounded-xs"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[9px] uppercase tracking-widest text-[#ff2d55] font-black block flex items-center gap-1.5">
                          <Clock className="w-3 h-3 animate-pulse" /> Confirm OTP digits
                        </label>
                        {otpTimer > 0 ? (
                          <span className="text-[8px] text-white/30 font-mono">Resend in {otpTimer}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={triggerSendOtp}
                            className="text-[8.5px] text-shakti-gold uppercase tracking-wider underline cursor-pointer hover:text-white"
                          >
                            Resend OTP code
                          </button>
                        )}
                      </div>

                      {/* 6 Digital Box Layout */}
                      <div className="flex justify-between gap-2">
                        {otpCode.map((char, idx) => (
                          <input
                            key={idx}
                            ref={el => { otpInputRefs.current[idx] = el; }}
                            type="text"
                            maxLength={1}
                            pattern="[0-9]*"
                            inputMode="numeric"
                            value={char}
                            onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeydown(idx, e)}
                            className="w-10 h-11 text-center bg-white/[0.04] border border-white/15 focus:border-[#ff2d55] text-sm text-shakti-gold font-bold font-mono rounded-xs focus:ring-1 focus:ring-[#ff2d55]/30 outline-none transition-colors"
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* --- 3. THE SIGN UP MATRIX FLOW --- */}
              {isSignUp && (
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                  
                  {/* Avatar Upload Container */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-white/40 font-black block">Passport Avatar</label>
                    <div 
                      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={e => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleImageFile(e.dataTransfer.files[0]); }}
                      className={`relative h-20 border border-dashed rounded-xs flex items-center justify-center p-3 transition-colors cursor-pointer ${
                        isDragging ? 'border-shakti-gold bg-shakti-gold/5' : 'border-white/10 hover:border-white/20 bg-white/[0.01]'
                      }`}
                      onClick={() => {
                        const fileInput = document.createElement('input');
                        fileInput.type = 'file';
                        fileInput.accept = 'image/*';
                        fileInput.onchange = (e: any) => {
                          if (e.target.files && e.target.files[0]) handleImageFile(e.target.files[0]);
                        };
                        fileInput.click();
                      }}
                    >
                      {profilePreview ? (
                        <div className="flex items-center gap-3">
                          <img src={profilePreview} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-shakti-gold" />
                          <span className="text-[9px] text-green-400 font-mono">Image coordinates logged</span>
                        </div>
                      ) : (
                        <div className="text-center space-y-1">
                          <Upload className="w-4 h-4 mx-auto text-white/30" />
                          <p className="text-[8.5px] text-white/40 uppercase tracking-widest font-black">Drag or Click to attach image</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Full Name and Username Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-white/40 font-black block">Full Name</label>
                      <input
                        required
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. AMAN SEN"
                        className="w-full bg-white/[0.03] border border-white/10 focus:border-shakti-gold rounded-xs py-2 px-3 text-xs text-white placeholder:text-white/20 outline-none uppercase font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-white/40 font-black block">Unique Alias (Username)</label>
                      <input
                        required
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. amansen"
                        className="w-full bg-white/[0.03] border border-white/10 focus:border-shakti-gold rounded-xs py-2 px-3 text-xs text-white placeholder:text-white/20 outline-none lowercase font-mono"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-white/40 font-black block">Email Coordinates</label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="creator@shaktiyug.co"
                      className="w-full bg-white/[0.03] border border-white/10 focus:border-shakti-gold rounded-xs py-2 px-3 text-xs text-white placeholder:text-white/20 outline-none font-mono"
                    />
                  </div>

                  {/* Indian Mobile Number (MANDATORY IN SIGNUP) */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-white/40 font-black block">Required Indian Mobile</label>
                    <div className="relative flex">
                      <span className="inline-flex items-center px-3 border border-r-0 border-white/10 bg-white/[0.03] text-white/50 text-xs font-mono rounded-l-xs">
                        +91
                      </span>
                      <div className="relative flex-1">
                        <input
                          required
                          type="text"
                          pattern="[0-9]*"
                          inputMode="numeric"
                          value={phoneNumber}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          placeholder="REQUIRED 10 DIGIT NUMBER"
                          className="w-full bg-white/[0.03] border border-white/10 focus:border-shakti-gold rounded-r-xs py-2 px-3 text-xs text-white placeholder:text-white/20 outline-none font-mono tracking-widest"
                        />
                      </div>
                    </div>

                    {phoneError ? (
                      <span className="text-[8px] text-red-400 block font-mono">{phoneError}</span>
                    ) : (
                      phoneNumber.length === 10 && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {otpVerified ? (
                            <motion.div 
                              initial={{ scale: 0 }} 
                              animate={{ scale: 1 }}
                              className="flex items-center gap-1 text-[8.5px] text-green-400 font-mono"
                            >
                              <CheckCircle className="w-3 h-3" /> Verified Number
                            </motion.div>
                          ) : (
                            <span className="text-[8px] text-shakti-gold/60 block font-mono">Format Approved • Prepend +91 internally</span>
                          )}
                        </div>
                      )
                    )}
                  </div>

                  {/* Dynamic verification send button */}
                  {isPhoneValid && !otpVerified && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-1"
                    >
                      <button
                        type="button"
                        onClick={triggerSendOtp}
                        disabled={isSendingOtp}
                        className="py-1.5 px-3 bg-shakti-gold/10 hover:bg-shakti-gold/20 border border-shakti-gold/30 rounded-xs text-[9px] text-shakti-gold font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                      >
                        {isSendingOtp ? (
                          <div className="w-2.5 h-2.5 border-2 border-shakti-gold border-t-transparent rounded-full animate-spin" />
                        ) : 'Verify Mobile via SMS OTP'}
                      </button>
                    </motion.div>
                  )}

                  {/* 6 Digit Box layout on send */}
                  {otpSent && !otpVerified && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2 bg-white/[0.01] p-4 border border-white/5 rounded-xs"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[9px] uppercase tracking-widest text-[#ff2d55] font-black block flex items-center gap-1.5">
                          <Clock className="w-3 h-3 animate-pulse" /> Confirm OTP digits
                        </label>
                        {otpTimer > 0 ? (
                          <span className="text-[8px] text-white/30 font-mono">Resend in {otpTimer}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={triggerSendOtp}
                            className="text-[8.5px] text-shakti-gold uppercase tracking-wider underline cursor-pointer hover:text-white"
                          >
                            Resend OTP code
                          </button>
                        )}
                      </div>

                      <div className="flex justify-between gap-1.5">
                        {otpCode.map((char, idx) => (
                          <input
                            key={idx}
                            ref={el => { otpInputRefs.current[idx] = el; }}
                            type="text"
                            maxLength={1}
                            pattern="[0-9]*"
                            inputMode="numeric"
                            value={char}
                            onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeydown(idx, e)}
                            className="w-10 h-11 text-center bg-white/[0.04] border border-white/15 focus:border-[#ff2d55] text-sm text-shakti-gold font-bold font-mono rounded-xs focus:ring-1 focus:ring-[#ff2d55]/30 outline-none"
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Passcode Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-white/40 font-black block">Passcode</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/20">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                        <input
                          required
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-white/[0.03] border border-white/10 focus:border-shakti-gold rounded-xs py-2 px-3 pl-10 text-xs text-white placeholder:text-white/20 outline-none font-mono"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-white/40 font-black block">Confirm passcode</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/20">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                        <input
                          required
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-white/[0.03] border border-white/10 focus:border-shakti-gold rounded-xs py-2 px-3 pl-10 text-xs text-white placeholder:text-white/20 outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gender and Date of Birth */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-white/40 font-black block">Gender Identity</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full bg-shakti-black border border-white/10 focus:border-shakti-gold text-white text-xs rounded-xs py-2 px-3 outline-none cursor-pointer"
                      >
                        <option value="Female">Brand Model Companion (Female)</option>
                        <option value="Male">Brand Model Companion (Male)</option>
                        <option value="Non-Binary">Non-Binary Aesthetic Architect</option>
                        <option value="Other">Custom Aesthetic Node (Other)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-white/40 font-black block">Date of Birth</label>
                      <input
                        required
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 focus:border-shakti-gold text-white text-xs rounded-xs py-1.5 px-3 outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-start gap-2.5 pt-2">
                    <input
                      id="termsBox"
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 rounded-sm bg-shakti-black border-white/10 text-shakti-gold focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="termsBox" className="text-[9px] text-white/55 tracking-wide leading-relaxed cursor-pointer select-none">
                      I authorize the backstage syndicate to record my physical qualifications, metrics reports, and video audition archives according to standard terms of high couture publication codes.
                    </label>
                  </div>
                </div>
              )}

              {/* Remember me & Forgot Passcode line on Sign-In Credentials */}
              {!isSignUp && !loginWithPhone && (
                <div className="flex items-center justify-between text-[10px] select-none pt-1">
                  <label className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded-sm bg-shakti-black border-white/10 text-shakti-gold focus:ring-0"
                    />
                    Remember Node Status
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setSuccess("Password recovery tokens have been dispatched. Check your mail index!");
                    }}
                    className="text-shakti-gold hover:text-shakti-gold-light italic tracking-wider transition-colors outline-none cursor-pointer font-serif"
                  >
                    Forgot Passcode?
                  </button>
                </div>
              )}

              {/* Submit Buttons */}
              <button
                type="submit"
                disabled={loading || (loginWithPhone && !otpVerified) || (isSignUp && !otpVerified)}
                className="w-full py-3 bg-gradient-to-r from-[#ff2d55] to-shakti-gold rounded-xs text-shakti-black text-[10px] uppercase tracking-[0.25em] font-black hover:opacity-90 active:scale-95 transition-all outline-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-45 disabled:pointer-events-none"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-shakti-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isSignUp ? 'Construct Core Identity' : 'Suture Backstage Link'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Premium Social Login Divider */}
            <div className="relative flex py-5 items-center">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 text-[8px] text-white/20 uppercase tracking-[0.3em] font-bold">OR ENGANGE SOCIAL INTEGRATIONS</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            {/* Social Logins Buttons with Brand Colors and Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* google */}
              <button
                type="button"
                onClick={() => triggerSocialLogin('Google')}
                disabled={loading}
                className="py-2.5 px-4 bg-white/[0.01] hover:bg-white/[0.04] border border-white/10 hover:border-shakti-gold/30 rounded-xs flex items-center justify-center gap-2.5 transition-all duration-300 group cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="text-[9px] uppercase tracking-wider text-white/60 group-hover:text-white font-bold">Google</span>
              </button>

              {/* x (twitter) */}
              <button
                type="button"
                onClick={() => triggerSocialLogin('X')}
                disabled={loading}
                className="py-2.5 px-4 bg-white/[0.01] hover:bg-white/[0.04] border border-white/10 hover:border-shakti-gold/30 rounded-xs flex items-center justify-center gap-2.5 transition-all duration-300 group cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="text-[9px] uppercase tracking-wider text-white/60 group-hover:text-white font-bold">X Corp</span>
              </button>

              {/* facebook */}
              <button
                type="button"
                onClick={() => triggerSocialLogin('Facebook')}
                disabled={loading}
                className="py-2.5 px-4 bg-white/[0.01] hover:bg-white/[0.04] border border-white/10 hover:border-shakti-gold/30 rounded-xs flex items-center justify-center gap-2.5 transition-all duration-300 group cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current text-blue-500" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-[9px] uppercase tracking-wider text-white/60 group-hover:text-white font-bold">Facebook</span>
              </button>
            </div>

            {/* System Tagline */}
            <p className="text-center text-[7.5px] text-white/20 uppercase tracking-[0.35em] mt-7 select-none leading-relaxed">
              Infinite Threads • Decisive Security • Backstage Synchronization
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
