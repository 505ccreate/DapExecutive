import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SectionLabel, SectionTitle, Button } from "../components/Layout";
import {
  Cpu, User, Navigation, Calendar, Briefcase, ChevronRight,
  Power, CheckCircle2, AlertCircle, Car, Clock, MapPin, MessageSquare,
} from "lucide-react";
import { useGeminiLive } from "../hooks/useGeminiLive";
import { BookingDetails } from "../types";

const COLORS = {
  IDLE:      { r: 160, g: 174, b: 192 },
  LISTENING: { r: 0,   g: 255, b: 136 },
  SPEAKING:  { r: 212, g: 175, b: 55  },
};

class Fiber {
  id: number; alphaMod: number; speedMod: number;
  constructor(i: number) {
    this.id = i;
    this.alphaMod = 0.2 + Math.random() * 0.4;
    this.speedMod = 0.5 + Math.random() * 0.5;
  }
  draw(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, colorStr: string, amp: number, freq: number, speed: number, isSpeaking: boolean, userIntensity: number) {
    const cx = width / 2, cy = height / 2;
    ctx.beginPath();
    ctx.strokeStyle = colorStr;
    ctx.globalAlpha = this.alphaMod * (isSpeaking || userIntensity > 0.06 ? 1 : 0.4);
    ctx.lineWidth = 0.8;
    ctx.moveTo(0, cy);
    for (let x = 0; x <= width; x += 15) {
      const d = Math.abs(x - cx) / cx;
      const fade = Math.pow(Math.max(0, 1 - d), 2);
      const noise = Math.sin(time * 0.4 + this.id) * 4;
      const y = Math.sin(x * freq + time * speed * this.speedMod + this.id) * (amp + noise) * fade;
      const spread = userIntensity > 0.06 ? Math.sin(time + this.id) * (userIntensity * 50) * fade : 0;
      ctx.lineTo(x, cy + y + spread);
    }
    ctx.stroke();
  }
}

type VehicleId = "" | "sedan" | "suv" | "sprinter";

export default function Reserve() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [liveBooking, setLiveBooking] = useState<BookingDetails>({});

  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const intensityRef  = useRef({ voice: 0, target: 0, user: 0, userTarget: 0 });
  const timeRef       = useRef(0);
  const currentRGBRef = useRef({ r: 160, g: 174, b: 192 });
  const fibersRef     = useRef<Fiber[]>([]);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    pickup:      params.get("pickup")      || "",
    destination: params.get("destination") || "",
    dateTime:    params.get("dateTime")    || "",
    passengers:  params.get("passengers")  || "1",
    vehicleType: "" as VehicleId,
    notes: "",
  });

  const handleBookingUpdate = useCallback((updates: Partial<BookingDetails>) => {
    setLiveBooking(prev => ({ ...prev, ...updates }));
    setFormData(prev => ({
      ...prev,
      firstName:   updates.customer_name?.split(" ")[0] || prev.firstName,
      lastName:    updates.customer_name?.split(" ").slice(1).join(" ") || prev.lastName,
      email:       updates.customer_email  || prev.email,
      phone:       updates.customer_phone  || prev.phone,
      pickup:      updates.pickup_address  || prev.pickup,
      destination: updates.dropoff_address || prev.destination,
      dateTime:    updates.pickup_date ? `${updates.pickup_date} ${updates.pickup_time || ""}` : prev.dateTime,
      passengers:  updates.passenger_count?.toString() || prev.passengers,
      vehicleType: (updates.vehicle_type?.toLowerCase() as VehicleId) || prev.vehicleType,
      notes:       updates.special_requests || prev.notes,
    }));
  }, []);

  const handleBookingSubmit = useCallback(() => {
    setIsSubmitted(true);
    setTimeout(() => { setIsSubmitted(false); setLiveBooking({}); }, 5000);
  }, []);

  const handleIntensityUpdate = useCallback((voice: number, user: number) => {
    intensityRef.current.target     = voice;
    intensityRef.current.userTarget = user;
  }, []);

  const { status, connect, disconnect, transcript } = useGeminiLive(
    handleBookingUpdate, handleBookingSubmit, handleIntensityUpdate
  );

  useEffect(() => { const t = setTimeout(() => connect(), 300); return () => clearTimeout(t); }, []);

  const isActive   = status !== "offline";
  const isSpeaking = status === "speaking";

  useEffect(() => { fibersRef.current = Array.from({ length: 45 }, (_, i) => new Fiber(i)); }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    const animate = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr, h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);
      timeRef.current += 0.012;
      const int = intensityRef.current;
      int.voice += (int.target    - int.voice) * 0.12;
      int.user  += (int.userTarget - int.user)  * 0.12;
      if (isActive) {
        let tc, amp, freq, speed;
        if (isSpeaking)         { tc = COLORS.SPEAKING;  amp = 12 + int.voice * 130; freq = 0.012; speed = 3.5; }
        else if (int.user>0.06) { tc = COLORS.LISTENING; amp = 18 + int.user * 90;   freq = 0.01;  speed = 2.2; }
        else                    { tc = COLORS.IDLE;       amp = 7 + Math.sin(timeRef.current)*4; freq=0.007; speed=0.7; }
        const c = currentRGBRef.current;
        c.r += (tc.r - c.r) * 0.06; c.g += (tc.g - c.g) * 0.06; c.b += (tc.b - c.b) * 0.06;
        const cs = `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, 1)`;
        ctx.globalCompositeOperation = "screen";
        fibersRef.current.forEach(f => f.draw(ctx, w, h, timeRef.current, cs, amp, freq, speed, isSpeaking, int.user));
      }
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, [isActive, isSpeaking]);

  useEffect(() => {
    const resize = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const dpr  = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width  = rect.width  * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    };
    const t = setTimeout(resize, 100);
    window.addEventListener("resize", resize);
    return () => { clearTimeout(t); window.removeEventListener("resize", resize); };
  }, []);

  const vehicles: { id: VehicleId; name: string; image: string }[] = [
    { id: "sedan",    name: "Executive Sedan", image: "https://dap-executive-site.vercel.app/Images/luxury_sedan_1772672459884.png" },
    { id: "suv",      name: "Premium SUV",     image: "https://dap-executive-site.vercel.app/Images/cadellac%201.png" },
    { id: "sprinter", name: "VIP Sprinter",    image: "https://dap-executive-site.vercel.app/Images/chauffeur-car.png" },
  ];

  const currentVehicle = vehicles.find(v => v.id === formData.vehicleType);
  const latestCamText  = [...transcript].reverse().find(m => m.role === "model")?.text ?? "";

  return (
    <div className="min-h-screen pt-32 pb-12 w-full lg:w-[calc(100%-68px)]">
      <div className="container mx-auto px-[5%]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* LEFT */}
          <div className="space-y-6">

            {/* CAM Stage */}
            <div className="glass-panel rounded-sm relative overflow-hidden flex flex-col border border-white/5" style={{ minHeight: 420 }}>
              {/* Header */}
              <div className="flex items-center justify-between px-7 pt-6 pb-4 relative z-10 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-dap-gold/10 rounded-full flex items-center justify-center text-dap-gold border border-dap-gold/20">
                    <Cpu size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${isActive ? "bg-emerald-400 animate-pulse" : "bg-white/15"}`} />
                      <span className={`text-[0.5rem] uppercase tracking-[2.5px] font-medium transition-colors duration-500 ${status === 'error' ? 'text-red-400' : isActive ? "text-emerald-400" : "text-dap-cream/25"}`}>
                        {!isActive ? "System Standby"
                        : status === "connecting" ? "Connecting..."
                        : status === "listening"  ? "Listening"
                        : status === "speaking"   ? "Speaking"
                        : status === "error"      ? "Connection Error"
                        : "Live Agent Active"}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (status === 'error' || status === 'offline') {
                      connect();
                    } else {
                      setShowEndConfirmation(true);
                    }
                  }}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-full border transition-all duration-300 ${
                    status === 'error' ? "border-red-500/40 bg-red-500/5 text-red-400" :
                    isActive ? "border-dap-gold/40 bg-dap-gold/5 text-dap-gold" : 
                    "border-white/10 text-dap-cream/25 hover:border-white/20"
                  }`}
                >
                  <Power size={9} className={isActive && status !== 'error' && status !== 'connecting' ? "animate-pulse" : ""} />
                  <span className="text-[0.55rem] font-bold uppercase tracking-[2px]">
                    {status === 'error' ? "Retry" : 
                     status === 'connecting' ? "Connecting" :
                     isActive ? "Active" : "Offline"}
                  </span>
                </button>
              </div>

              {/* Full-width fiber canvas stage */}
              <div className="relative w-full flex-1 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,#051020_0%,#010409_100%)]" style={{ minHeight: 220 }}>
                <div className="absolute inset-0 opacity-[0.025]"
                  style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #C9A84C 1px, transparent 0)`, backgroundSize: "28px 28px" }} />
                <motion.div animate={{ opacity: isActive ? [0.12, 0.22, 0.12] : 0.04 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.12)_0%,transparent_65%)]" />
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"
                  style={{ filter: "blur(0.4px)", mixBlendMode: "screen" }} />
              </div>

              {/* Transcript */}
              <div className="relative z-10 min-h-[80px] flex flex-col items-center justify-center text-center px-8 py-5 border-t border-white/5">
                <AnimatePresence mode="wait">
                  {isActive ? (
                    <motion.div key={status + latestCamText.slice(0,20)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }} className="max-w-[88%]">
                      <div className="font-display text-[0.55rem] tracking-[3px] uppercase text-dap-gold/40 mb-1.5">CAM</div>
                      <p className="text-[0.85rem] leading-relaxed text-dap-cream/90 font-serif italic">
                        {latestCamText}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-dap-cream/15 text-[0.6rem] uppercase tracking-[4px]">
                      Awaiting transmission...
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Generated UI Area */}
            <div className="space-y-6">
              {/* Quick Summary Card */}
              <AnimatePresence>
                {Object.keys(liveBooking).length > 0 && !isSubmitted && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="glass-panel p-6 rounded-sm border border-dap-gold/10 bg-dap-gold/5 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <SectionLabel>Journey Summary</SectionLabel>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-dap-gold animate-pulse" />
                        <span className="text-[0.5rem] uppercase tracking-widest text-dap-gold/60 font-bold">Live Sync</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {liveBooking.pickup_address && (
                        <div className="flex items-start gap-3">
                          <MapPin size={12} className="text-dap-gold mt-0.5" />
                          <div>
                            <p className="text-[0.5rem] uppercase tracking-widest text-dap-gold/40 font-bold">Pickup</p>
                            <p className="text-[0.75rem] text-dap-cream font-medium">{liveBooking.pickup_address}</p>
                          </div>
                        </div>
                      )}
                      {liveBooking.dropoff_address && (
                        <div className="flex items-start gap-3">
                          <Navigation size={12} className="text-dap-gold mt-0.5" />
                          <div>
                            <p className="text-[0.5rem] uppercase tracking-widest text-dap-gold/40 font-bold">Destination</p>
                            <p className="text-[0.75rem] text-dap-cream font-medium">{liveBooking.dropoff_address}</p>
                          </div>
                        </div>
                      )}
                      {(liveBooking.pickup_date || liveBooking.pickup_time) && (
                        <div className="flex items-start gap-3">
                          <Calendar size={12} className="text-dap-gold mt-0.5" />
                          <div>
                            <p className="text-[0.5rem] uppercase tracking-widest text-dap-gold/40 font-bold">Schedule</p>
                            <p className="text-[0.75rem] text-dap-cream font-medium">
                              {liveBooking.pickup_date || ""} {liveBooking.pickup_time || ""}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Fleet / Vehicle Preview */}
              <div className="glass-panel p-7 rounded-sm space-y-5 border border-white/5">
                <div className="flex items-center justify-between">
                  <SectionLabel>Selected Fleet</SectionLabel>
                  {formData.vehicleType && (
                    <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                      className="text-[0.6rem] text-dap-gold uppercase tracking-[2px] flex items-center gap-1">
                      <CheckCircle2 size={10} /> Confirmed
                    </motion.span>
                  )}
                </div>
                <div className="relative aspect-video rounded-sm overflow-hidden border border-white/10 bg-dap-navy-light flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {currentVehicle ? (
                      <motion.div key={currentVehicle.id} initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="w-full h-full">
                        <img src={currentVehicle.image} alt={currentVehicle.name} className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-dap-navy-dark to-transparent">
                          <h4 className="text-xl font-serif">{currentVehicle.name}</h4>
                          <p className="text-[0.65rem] text-dap-gold uppercase tracking-[2px]">Premium Class Secured</p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
                        <div className="w-14 h-14 border border-white/10 rounded-full flex items-center justify-center mx-auto text-white/10">
                          <AlertCircle size={28} />
                        </div>
                        <p className="text-[0.7rem] text-dap-cream/25 uppercase tracking-[3px]">Awaiting Vehicle Selection</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {vehicles.map(v => (
                    <button key={v.id} onClick={() => setFormData(p => ({ ...p, vehicleType: v.id }))}
                      className={`p-3 border transition-all relative group ${formData.vehicleType === v.id ? "border-dap-gold bg-dap-gold/5" : "border-white/5 hover:border-white/20"}`}>
                      <img src={v.image} alt={v.name} className="w-full h-10 object-cover mb-1.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                      <span className={`text-[0.5rem] uppercase tracking-wider block text-center ${formData.vehicleType === v.id ? "text-dap-gold" : "text-dap-cream/35"}`}>{v.name}</span>
                      {formData.vehicleType === v.id && <div className="absolute top-1 right-1 text-dap-gold"><CheckCircle2 size={9} /></div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Confirmation / Status Modules */}
              <AnimatePresence>
                {isSubmitted && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="bg-emerald-500/10 border border-emerald-500/30 p-8 rounded-sm backdrop-blur-xl text-center">
                    <CheckCircle2 className="text-emerald-400 mx-auto mb-4" size={40} />
                    <h3 className="text-lg font-serif italic text-white">Reservation Confirmed</h3>
                    <p className="text-white/50 text-xs mt-1">Your executive transport has been arranged.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT: form */}
          <div className="glass-panel p-8 lg:p-12 rounded-sm">
            <SectionLabel>Reservation Details</SectionLabel>
            <SectionTitle className="text-3xl mb-8">Secure Your Journey</SectionTitle>
            <form className="space-y-6" onSubmit={e => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-display text-[0.7rem] font-semibold text-dap-gold uppercase tracking-wider">First Name</label>
                  <input type="text" value={formData.firstName} onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))}
                    className="bg-dap-navy-light border border-white/10 p-3 text-dap-cream font-sans text-[0.9rem] w-full gold-border-focus" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="font-display text-[0.7rem] font-semibold text-dap-gold uppercase tracking-wider">Last Name</label>
                  <input type="text" value={formData.lastName} onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))}
                    className="bg-dap-navy-light border border-white/10 p-3 text-dap-cream font-sans text-[0.9rem] w-full gold-border-focus" placeholder="Doe" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-display text-[0.7rem] font-semibold text-dap-gold uppercase tracking-wider">Email Address</label>
                  <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    className="bg-dap-navy-light border border-white/10 p-3 text-dap-cream font-sans text-[0.9rem] w-full gold-border-focus" placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="font-display text-[0.7rem] font-semibold text-dap-gold uppercase tracking-wider">Phone Number</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                    className="bg-dap-navy-light border border-white/10 p-3 text-dap-cream font-sans text-[0.9rem] w-full gold-border-focus" placeholder="+1 (555) 000-0000" />
                </div>
              </div>
              <div className="space-y-6 pt-4 border-t border-white/5">
                <div className="space-y-2">
                  <label className="font-display text-[0.7rem] font-semibold text-dap-gold uppercase tracking-wider flex items-center gap-2"><Navigation size={12} /> Pickup Address</label>
                  <input type="text" value={formData.pickup} onChange={e => setFormData(p => ({ ...p, pickup: e.target.value }))}
                    className="bg-dap-navy-light border border-white/10 p-3 text-dap-cream font-sans text-[0.9rem] w-full gold-border-focus" placeholder="Street Address" />
                </div>
                <div className="space-y-2">
                  <label className="font-display text-[0.7rem] font-semibold text-dap-gold uppercase tracking-wider flex items-center gap-2"><ChevronRight size={12} /> Drop-off Address</label>
                  <input type="text" value={formData.destination} onChange={e => setFormData(p => ({ ...p, destination: e.target.value }))}
                    className="bg-dap-navy-light border border-white/10 p-3 text-dap-cream font-sans text-[0.9rem] w-full gold-border-focus" placeholder="Street Address" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <div className="space-y-2">
                  <label className="font-display text-[0.7rem] font-semibold text-dap-gold uppercase tracking-wider flex items-center gap-2"><Calendar size={12} /> Pickup Date / Time</label>
                  <input type="text" value={formData.dateTime} onChange={e => setFormData(p => ({ ...p, dateTime: e.target.value }))}
                    className="bg-dap-navy-light border border-white/10 p-3 text-dap-cream font-sans text-[0.9rem] w-full gold-border-focus" placeholder="e.g. Tomorrow, 6:00 PM" />
                </div>
                <div className="space-y-2">
                  <label className="font-display text-[0.7rem] font-semibold text-dap-gold uppercase tracking-wider flex items-center gap-2"><User size={12} /> Passengers</label>
                  <select value={formData.passengers} onChange={e => setFormData(p => ({ ...p, passengers: e.target.value }))}
                    className="bg-dap-navy-light border border-white/10 p-3 text-dap-cream font-sans text-[0.9rem] w-full gold-border-focus">
                    <option>1</option><option>2</option><option>3</option><option>4+</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t border-white/5">
                <label className="font-display text-[0.7rem] font-semibold text-dap-gold uppercase tracking-wider flex items-center gap-2"><Briefcase size={12} /> Vehicle Type</label>
                <select value={formData.vehicleType} onChange={e => setFormData(p => ({ ...p, vehicleType: e.target.value as VehicleId }))}
                  className="bg-dap-navy-light border border-white/10 p-3 text-dap-cream font-sans text-[0.9rem] w-full gold-border-focus">
                  <option value="">Select a vehicle...</option>
                  <option value="sedan">Executive Sedan</option>
                  <option value="suv">Premium SUV</option>
                  <option value="sprinter">VIP Sprinter</option>
                </select>
              </div>
              <div className="space-y-2 pt-4">
                <label className="font-display text-[0.7rem] font-semibold text-dap-gold uppercase tracking-wider">Special Requests / Notes</label>
                <textarea value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                  className="bg-dap-navy-light border border-white/10 p-3 text-dap-cream font-sans text-[0.9rem] w-full gold-border-focus"
                  rows={3} placeholder="Flight numbers, child seats, preferred routes..." />
              </div>
              <div className="pt-6">
                <Button className="w-full text-sm py-5" disabled={isSubmitted}>
                  {isSubmitted ? "RESERVATION CONFIRMED" : "CONFIRM RESERVATION"}
                </Button>
                <p className="text-center text-[0.6rem] text-dap-cream/25 mt-4 uppercase tracking-[2px]">
                  By confirming, you agree to our terms of service and luxury standards.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* End session modal */}
      <AnimatePresence>
        {showEndConfirmation && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 16 }}
              className="glass-panel p-10 max-w-sm w-full border border-dap-gold/20 shadow-[0_0_50px_rgba(201,168,76,0.08)]">
              <div className="flex flex-col items-center text-center space-y-8">
                <div className="w-14 h-14 bg-dap-gold/10 rounded-full flex items-center justify-center text-dap-gold border border-dap-gold/20">
                  <AlertCircle size={28} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-serif italic text-dap-gold">End Session?</h3>
                  <p className="text-sm text-dap-cream/55 leading-relaxed">This will disconnect Cam and stop the voice interface.</p>
                </div>
                <div className="flex flex-col w-full gap-4">
                  <button onClick={() => { disconnect(); setShowEndConfirmation(false); }}
                    className="w-full py-4 bg-dap-gold text-dap-navy-dark font-display text-[0.7rem] font-bold uppercase tracking-[2px] hover:bg-dap-gold-light transition-all">
                    Yes, End Session
                  </button>
                  <button onClick={() => setShowEndConfirmation(false)}
                    className="w-full py-4 bg-transparent border border-white/10 text-dap-cream/40 font-display text-[0.7rem] font-bold uppercase tracking-[2px] hover:border-white/30 hover:text-dap-cream transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
