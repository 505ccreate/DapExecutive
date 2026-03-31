import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { SITE_CONTENT } from "../constants/content";
import { Button, SectionLabel, SectionTitle, IconMap } from "../components/Layout";
import { Navigation, Cloud, User, Cpu, Star } from "lucide-react";

export default function Home() {
  const [weather, setWeather] = useState<{ temp: number; condition: string } | null>(null);
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [passengers, setPassengers] = useState("1");

  const handleContinue = () => {
    const params = new URLSearchParams({
      pickup,
      destination,
      dateTime,
      passengers,
    });
    window.history.pushState({}, "", `/reserve?${params.toString()}`);
  };

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch('/api/weather');
        const data = await response.json();
        if (data && data.current_weather) {
          // Simple mapping for demonstration
          const code = data.current_weather.weathercode;
          let condition = "SUNNY";
          if (code >= 1 && code <= 3) condition = "PARTLY CLOUDY";
          if (code >= 45) condition = "FOGGY";
          if (code >= 51) condition = "RAINY";
          if (code >= 71) condition = "SNOWY";
          if (code >= 95) condition = "THUNDERSTORM";

          setWeather({
            temp: Math.round((data.current_weather.temperature * 9/5) + 32), // Convert C to F
            condition
          });
        }
      } catch (error) {
        console.error("Failed to fetch weather:", error);
      }
    };
    fetchWeather();
  }, []);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section id="home" className="min-h-screen lg:h-[calc(100vh-54px)] w-full lg:w-[calc(100%-68px)] flex flex-col lg:flex-row relative overflow-hidden">
        {/* Left Panel - Booking Form */}
        <div 
          className="w-full lg:w-[460px] flex-shrink-0 pt-28 pb-10 px-10 lg:pt-[68px] lg:px-[38px] lg:pb-[38px] flex flex-col justify-start lg:justify-center items-center border-r border-dap-gold/35 relative z-10"
          style={{ background: 'linear-gradient(155deg, #06090f 0%, #0d1526 100%)' }}
        >
          <div className="mb-[18px] w-full flex justify-center">
            <img src="https://dap-executive-site.vercel.app/Images/daplogo.png" alt="DAP Executive" className="h-[130px] w-auto" />
          </div>
          
          <svg className="herowave" viewBox="0 0 800 52" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="wg" x1="0" y1="0" x2="800" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#8B6914" stopOpacity="0" />
                <stop offset="15%" stopColor="#C9A84C" stopOpacity="0.85" />
                <stop offset="40%" stopColor="#E2C46A" stopOpacity="1" />
                <stop offset="65%" stopColor="#C9A84C" stopOpacity="1" />
                <stop offset="85%" stopColor="#E2C46A" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#8B6914" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 26 Q100 6 200 26 Q300 46 400 26 Q500 6 600 26 Q700 46 800 26" stroke="url(#wg)" strokeWidth="2.5" fill="none">
              <animate attributeName="d" dur="6s" repeatCount="indefinite" values="M0 26 Q100 6 200 26 Q300 46 400 26 Q500 6 600 26 Q700 46 800 26;
                    M0 26 Q100 46 200 26 Q300 6 400 26 Q500 46 600 26 Q700 6 800 26;
                    M0 26 Q100 6 200 26 Q300 46 400 26 Q500 6 600 26 Q700 46 800 26" />
            </path>
            <path d="M0 34 Q120 14 240 34 Q360 54 480 34 Q600 14 720 34 Q770 40 800 34" stroke="url(#wg)" strokeWidth="1.4" fill="none" opacity="0.55">
              <animate attributeName="d" dur="8s" repeatCount="indefinite" values="M0 34 Q120 14 240 34 Q360 54 480 34 Q600 14 720 34 Q770 40 800 34;
                    M0 34 Q120 54 240 34 Q360 14 480 34 Q600 54 720 34 Q770 28 800 34;
                    M0 34 Q120 14 240 34 Q360 54 480 34 Q600 14 720 34 Q770 40 800 34" />
            </path>
            <path d="M0 20 Q200 36 400 20 Q600 4 800 20" stroke="url(#wg)" strokeWidth="0.8" fill="none" opacity="0.28">
              <animate attributeName="d" dur="10s" repeatCount="indefinite" values="M0 20 Q200 36 400 20 Q600 4 800 20;
                    M0 20 Q200 4 400 20 Q600 36 800 20;
                    M0 20 Q200 36 400 20 Q600 4 800 20" />
            </path>
          </svg>
          
          <h1 className="font-serif text-[44px] font-light leading-[1.1] mb-8 text-center">
            WHERE TO,<br /><em className="italic text-dap-gold-light font-serif">COMMANDER?</em>
          </h1>

          <div className="w-full space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-display text-[0.62rem] text-dap-gold-light tracking-[1.5px] uppercase">Departure</label>
                <input 
                  type="text" 
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="bg-white/5 border border-dap-cream/15 p-3 text-dap-cream font-sans text-[0.86rem] w-full outline-none focus:border-dap-gold" 
                  placeholder="e.g. Midtown, NY" 
                />
              </div>
              <div className="space-y-1">
                <label className="font-display text-[0.62rem] text-dap-gold-light tracking-[1.5px] uppercase">Destination</label>
                <input 
                  type="text" 
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="bg-white/5 border border-dap-cream/15 p-3 text-dap-cream font-sans text-[0.86rem] w-full outline-none focus:border-dap-gold" 
                  placeholder="e.g. EWR Terminal C" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-display text-[0.62rem] text-dap-gold-light tracking-[1.5px] uppercase">Date / Time</label>
                <input 
                  type="text" 
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="bg-white/5 border border-dap-cream/15 p-3 text-dap-cream font-sans text-[0.86rem] w-full outline-none focus:border-dap-gold" 
                  placeholder="Tomorrow, 6:00 PM" 
                />
              </div>
              <div className="space-y-1">
                <label className="font-display text-[0.62rem] text-dap-gold-light tracking-[1.5px] uppercase">Passengers</label>
                <select 
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  className="bg-white/5 border border-dap-cream/15 p-3 text-dap-cream font-sans text-[0.86rem] w-full outline-none focus:border-dap-gold"
                >
                  <option>1</option><option>2</option><option>3</option><option>4+</option>
                </select>
              </div>
            </div>

            <div className="text-[0.75rem] text-dap-cream/50 mt-1 mb-4 flex items-center gap-2">
              <span className="text-dap-gold-light">AI Status:</span> Ready to route {pickup || "Midtown"} to {destination || "EWR"}
            </div>

            <Button className="w-full tracking-[3px]" onClick={handleContinue}>
              CONTINUE WITH AGENT
            </Button>
          </div>
        </div>

        {/* Right Panel - Video & Fleet Preview */}
        <div className="flex-1 relative overflow-hidden flex flex-col justify-between">
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover z-0">
            <source src={SITE_CONTENT.hero.videoUrl} type="video/mp4" />
          </video>
          
          <div className="relative z-10 p-5 mt-20 flex flex-wrap gap-3 justify-between">
            <div className="flex items-center gap-3 bg-dap-navy/60 backdrop-blur-md p-3 border border-dap-cream/10 rounded-sm">
              <Navigation size={14} className="text-dap-gold" />
              <div>
                <span className="font-display text-[0.58rem] text-dap-cream/50 tracking-[1px] block uppercase">LIVE FLIGHT TRACKING</span>
                <span className="text-[0.8rem] font-medium">UA 112 | ON TIME (Est. 6:45 PM)</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-dap-navy/60 backdrop-blur-md p-3 border border-dap-cream/10 rounded-sm">
              <Cloud size={14} className="text-dap-gold" />
              <div>
                <span className="font-display text-[0.58rem] text-dap-cream/50 tracking-[1px] block uppercase">DESTINATION WEATHER</span>
                <span className="text-[0.8rem] font-medium">
                  PHL | {weather ? `${weather.temp}°F ${weather.condition}` : '68°F SUNNY'}
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 p-5 flex flex-wrap gap-4 justify-center lg:justify-end items-end">
            {SITE_CONTENT.fleet.slice(0, 2).map((car) => (
              <div key={car.id} className="bg-dap-navy-dark/82 backdrop-blur-xl border border-dap-gold/40 p-4 w-full max-w-[255px] rounded-sm transition-all hover:border-dap-gold hover:-translate-y-1 shadow-2xl space-y-2">
                <div className="font-sans font-semibold text-[0.86rem] uppercase tracking-[1.5px]">{car.name}</div>
                <div className="text-[0.68rem] text-dap-cream/50">{car.description.split('.')[0]}</div>
                <img src={car.image} alt={car.name} className="w-full h-[88px] object-cover rounded-sm" />
                <Button variant="outline" className="w-full p-2 text-[0.7rem]" onClick={() => window.location.href = '/reserve'}>
                  BOOK THIS VEHICLE
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="w-full lg:w-[calc(100%-68px)] bg-dap-navy-dark py-4 overflow-hidden flex border-y border-dap-gold/20">
        <div className="flex gap-20 animate-marquee whitespace-nowrap">
          {['Philadelphia', 'King of Prussia', 'Main Line', 'Wilmington', 'New York Transfers', 'PHL Airport'].map((city, i) => (
            <span key={i} className="font-serif text-lg text-dap-gold italic flex items-center gap-2">
              {city} <Star size={13} fill="currentColor" />
            </span>
          ))}
        </div>
        <div className="flex gap-20 animate-marquee whitespace-nowrap" aria-hidden="true">
          {['Philadelphia', 'King of Prussia', 'Main Line', 'Wilmington', 'New York Transfers', 'PHL Airport'].map((city, i) => (
            <span key={i} className="font-serif text-lg text-dap-gold italic flex items-center gap-2">
              {city} <Star size={13} fill="currentColor" />
            </span>
          ))}
        </div>
      </div>

      {/* About Section */}
      <section id="about" className="py-24 bg-dap-navy-light/50 w-full lg:w-[calc(100%-68px)]">
        <div className="container mx-auto px-[5%]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <SectionLabel>{SITE_CONTENT.about.label}</SectionLabel>
              <SectionTitle>{SITE_CONTENT.about.title}</SectionTitle>
              {SITE_CONTENT.about.description.map((p, i) => (
                <p key={i} className="mb-4 text-dap-cream/60 font-light text-lg">{p}</p>
              ))}
              <div className="pl-5 border-l-2 border-dap-gold my-6 font-serif italic text-xl text-dap-gold-light">
                "{SITE_CONTENT.about.quote}"
              </div>
              <ul className="flex flex-wrap gap-2 mb-6">
                {SITE_CONTENT.about.tags.map((tag, i) => (
                  <li key={i} className="font-display text-[0.68rem] px-3 py-1.5 bg-dap-gold/10 border-l-2 border-dap-gold tracking-[0.8px]">
                    {tag}
                  </li>
                ))}
              </ul>
              <Button variant="outline" onClick={() => document.getElementById('fleet')?.scrollIntoView({ behavior: 'smooth' })}>
                Explore Fleet
              </Button>
            </motion.div>
            <div className="relative p-4 group">
              <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-dap-gold group-hover:w-16 group-hover:h-16 transition-all duration-300"></div>
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-dap-gold group-hover:w-16 group-hover:h-16 transition-all duration-300"></div>
              <img src="https://dap-executive-site.vercel.app/Images/rahim-suit1.png" alt="DAP Executive" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Section */}
      <section id="fleet" className="py-24 w-full lg:w-[calc(100%-68px)]">
        <div className="container mx-auto px-[5%]">
          <div className="text-center mb-12">
            <SectionLabel>Our Collection</SectionLabel>
            <SectionTitle>The Executive Fleet</SectionTitle>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SITE_CONTENT.fleet.map((car, i) => (
              <motion.div 
                key={car.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-dap-navy-light border border-dap-cream/10 p-8 relative group transition-all hover:border-dap-gold hover:-translate-y-2 hover:shadow-2xl"
              >
                <span className="absolute top-0 right-0 bg-dap-navy-dark border-l border-b border-dap-cream/10 px-3 py-1.5 font-display text-[0.6rem] text-dap-gold tracking-[1px]">
                  {car.class}
                </span>
                <img src={car.image} alt={car.name} className="w-full h-48 object-cover mb-6 rounded-sm transition-transform duration-500 group-hover:scale-105" />
                <h3 className="text-2xl mb-2">{car.name}</h3>
                <div className="flex gap-4 text-dap-cream/60 text-[0.86rem] mb-4 font-medium">
                  <span className="flex items-center gap-1.5"><IconMap.User size={14} /> {car.passengers} Passengers</span>
                  <span className="flex items-center gap-1.5"><IconMap.Briefcase size={14} /> {car.luggage} Luggages</span>
                </div>
                <p className="text-dap-cream/60 text-[0.9rem] mb-6 leading-relaxed">{car.description}</p>
                <Button variant="outline" className="w-full" onClick={() => window.location.href = '/reserve'}>Reserve</Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="relative py-24 w-full lg:w-[calc(100%-68px)] bg-cover bg-center bg-fixed" style={{ backgroundImage: 'url(https://picsum.photos/seed/philly/1920/1080)' }}>
        <div className="absolute inset-0 bg-dap-navy/88 z-0"></div>
        <div className="container mx-auto px-[5%] relative z-10">
          <div className="mb-12">
            <SectionLabel>Expertise</SectionLabel>
            <SectionTitle>Tailored Services</SectionTitle>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SITE_CONTENT.services.map((svc, i) => {
              const Icon = IconMap[svc.icon];
              return (
                <motion.div 
                  key={svc.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-9 bg-dap-navy-dark/72 backdrop-blur-md border border-dap-cream/10 relative overflow-hidden group transition-all hover:-translate-y-1"
                >
                  <div className="absolute bottom-0 left-0 w-0 h-[3px] bg-dap-gold transition-all duration-400 group-hover:w-full"></div>
                  <Icon size={37} className="text-dap-gold mb-5" />
                  <h3 className="text-xl mb-3">{svc.title}</h3>
                  <p className="text-dap-cream/60 text-[0.9rem]">{svc.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section id="ai" className="py-24 w-full lg:w-[calc(100%-68px)]">
        <div className="container mx-auto px-[5%]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative rounded-sm overflow-hidden border-2 border-dap-gold/50 shadow-2xl aspect-[4/3]">
              <video autoPlay muted loop playsInline className="w-full h-full object-cover grayscale-[30%] sepia-[15%] brightness-[0.75]">
                <source src="https://dap-executive-site.vercel.app/Videos/aiorb-agent.mp4" type="video/mp4" />
              </video>
              <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-dap-gold rounded-full shadow-[0_0_12px_#C9A84C,0_0_24px_#C9A84C] animate-pulse"></div>
              
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[88%] bg-dap-navy-dark/94 border border-dap-gold/35 border-t-2 border-t-dap-gold p-5 rounded-sm shadow-2xl">
                <div className="flex gap-2 mb-3">
                  <div className="w-7 h-7 bg-dap-navy-light rounded-full flex items-center justify-center text-dap-gold flex-shrink-0"><User size={13} /></div>
                  <div className="bg-white/5 p-2 rounded-tr-lg rounded-br-lg rounded-bl-lg text-[0.79rem] text-dap-cream border border-white/10">Adjust pick-up 45 mins earlier, traffic is bad on I-95.</div>
                </div>
                <div className="flex gap-2">
                  <div className="w-7 h-7 bg-dap-gold/10 rounded-full flex items-center justify-center text-dap-gold flex-shrink-0"><Cpu size={13} /></div>
                  <div className="bg-white/5 p-2 rounded-tr-lg rounded-br-lg rounded-bl-lg text-[0.79rem] text-dap-cream/60 border border-white/10">Done. ETA now 4:15 PM. Driver rerouted around congestion zone.</div>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <SectionLabel>{SITE_CONTENT.ai.label}</SectionLabel>
              <SectionTitle>{SITE_CONTENT.ai.title}</SectionTitle>
              <p className="text-dap-cream/60 text-lg mb-8">{SITE_CONTENT.ai.description}</p>
              <ul className="space-y-6">
                {SITE_CONTENT.ai.features.map((feat, i) => {
                  const Icon = IconMap[feat.icon];
                  return (
                    <li key={i} className="flex gap-4">
                      <Icon size={24} className="text-dap-gold flex-shrink-0 mt-1" />
                      <div>
                        <strong className="font-sans font-medium text-base block mb-1">{feat.title}</strong>
                        <p className="text-dap-cream/60 text-[0.9rem]">{feat.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Booking CTA Section */}
      <section id="booking" className="py-24 bg-dap-navy-light w-full lg:w-[calc(100%-68px)]">
        <div className="container mx-auto px-[5%] text-center">
          <SectionLabel>Reservation</SectionLabel>
          <SectionTitle>Schedule Your Ride</SectionTitle>
          <div className="max-w-2xl mx-auto bg-dap-navy p-12 border border-dap-gold shadow-2xl">
            <p className="text-lg mb-8 text-dap-cream/70">Experience the future of executive travel with our AI-powered concierge booking system.</p>
            <Button className="w-full md:w-auto px-12" onClick={() => window.location.href = '/reserve'}>
              START RESERVATION
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
