import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { LucideIcon, Briefcase, Navigation, Clock, Star, Zap, Calendar, BarChart2, User, Cpu, Home, Settings, ChevronRight, Menu, X, Instagram, Linkedin, Twitter, Phone, Mail, MapPin } from "lucide-react";

export const IconMap: Record<string, LucideIcon> = {
  Briefcase,
  Navigation,
  Clock,
  Star,
  Zap,
  Calendar,
  BarChart2,
  User,
  Cpu,
  Home,
  Settings,
  ChevronRight,
  Menu,
  X,
  Instagram,
  Linkedin,
  Twitter,
  Phone,
  Mail,
  MapPin
};

export const Button = ({ 
  children, 
  variant = 'gold', 
  className = '', 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'gold' | 'outline' }) => {
  const baseStyles = "inline-flex items-center justify-center px-8 py-4 font-display text-xs font-semibold uppercase tracking-[2px] cursor-pointer transition-all duration-400 border-none text-center";
  const variants = {
    gold: "bg-dap-gold text-dap-navy-dark hover:bg-dap-gold-light hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(201,168,76,0.25)]",
    outline: "bg-transparent text-dap-gold border border-dap-gold hover:bg-dap-gold hover:text-dap-navy-dark"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="font-display text-[0.78rem] uppercase tracking-[3px] color-dap-gold mb-4 block font-semibold text-dap-gold">
    {children}
  </span>
);

export const SectionTitle = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <h2 className={`text-[clamp(2.2rem,4vw,3.5rem)] mb-8 leading-[1.1] ${className}`}>
    {children}
  </h2>
);

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/#about' },
    { name: 'Fleet', href: '/#fleet' },
    { name: 'Services', href: '/#services' },
    { name: 'AI Travel', href: '/#ai' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full lg:w-[calc(100%-68px)] px-[4%] py-4 lg:py-4 flex items-center justify-between z-[1000] transition-all duration-400 border-b ${isScrolled ? 'bg-dap-navy/75 py-3 border-dap-gold/25' : 'bg-dap-navy/38 border-dap-gold/14'} backdrop-blur-xl`}>
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="font-display text-[0.75rem] font-semibold uppercase tracking-[1.5px] hover:text-dap-gold-light transition-colors">{link.name}</a>
          ))}
        </div>

        {/* Mobile Hamburger */}
        <button 
          className="lg:hidden text-dap-gold p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <a href="/" className="flex flex-col items-center gap-0.5 leading-none absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
          <span className="font-display text-2xl lg:text-[1.75rem] font-semibold tracking-[7px]">DAP</span>
          <span className="font-display text-[0.5rem] lg:text-[0.62rem] tracking-[3px] text-dap-gold uppercase">Executive Services</span>
        </a>

        <div className="flex items-center gap-4">
          <a href="/reserve" className="bg-dap-gold text-dap-navy-dark px-4 py-2 lg:px-6 lg:py-3 font-display text-[0.7rem] lg:text-[0.76rem] font-semibold uppercase tracking-[1.5px] hover:bg-dap-gold-light transition-all">Book Now</a>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-[999] bg-dap-navy-dark pt-24 px-8 lg:hidden"
        >
          <div className="flex flex-col gap-8 items-center">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-display text-xl font-semibold uppercase tracking-[3px] text-dap-gold hover:text-dap-cream transition-colors"
              >
                {link.name}
              </a>
            ))}
            <a 
              href="/reserve" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center bg-dap-gold text-dap-navy-dark py-4 font-display text-lg font-semibold uppercase tracking-[2px]"
            >
              Book Now
            </a>
          </div>
        </motion.div>
      )}
    </>
  );
};

export const SideNav = () => (
  <aside className="hidden lg:flex fixed top-0 right-0 w-[68px] h-screen gold-gradient flex-col justify-center items-center gap-7 z-[9999] shadow-[-4px_0_18px_rgba(0,0,0,0.45)]">
    {[
      { icon: Home, label: 'Home', href: '/' },
      { icon: Briefcase, label: 'Services', href: '#services' },
      { icon: Navigation, label: 'Fleet', href: '#fleet' },
      { icon: Calendar, label: 'Booking', href: '/reserve' },
      { icon: User, label: 'Account', href: '#' },
      { icon: Settings, label: 'Setup', href: '#' },
    ].map((item, i) => (
      <a key={i} href={item.href} className="text-dap-navy-dark flex flex-col items-center gap-1 font-display text-[0.64rem] font-semibold uppercase tracking-[0.6px] opacity-80 hover:opacity-100 hover:scale-110 transition-all">
        <item.icon size={20} />
        {item.label}
      </a>
    ))}
  </aside>
);

export const Footer = () => (
  <footer className="bg-dap-navy-dark pt-20 pb-8 border-t border-dap-cream/10 w-full lg:w-[calc(100%-68px)]">
    <div className="container mx-auto px-[5%]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        <div>
          <div className="font-display text-[1.45rem] font-semibold tracking-[6px]">DAP</div>
          <span className="font-display text-[0.46rem] tracking-[4px] text-dap-gold uppercase block mt-0.5 mb-4">Executive Services</span>
          <p className="text-dap-cream/50 text-[0.86rem] mb-4">The premier luxury transportation and AI-driven logistics provider serving the greater metropolitan area.</p>
          <div className="flex gap-2">
            {[Instagram, Linkedin, Twitter].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 border border-dap-gold flex items-center justify-center text-dap-gold hover:bg-dap-gold hover:text-dap-navy-dark transition-all">
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>
        
        {[
          { title: 'Company', links: ['About Us', 'Our Fleet', 'Services', 'AI System'] },
          { title: 'Services', links: ['Airport Transfers', 'Corporate Accounts', 'Special Events', 'Hourly Directed'] },
          { title: 'Contact', links: ['1-800-555-0199', 'info@dapexecutive.com', 'Philadelphia, PA'] },
        ].map((col, i) => (
          <div key={i}>
            <h4 className="font-display text-[0.86rem] text-dap-gold uppercase tracking-[2px] mb-4">{col.title}</h4>
            <ul className="space-y-3">
              {col.links.map((link, j) => (
                <li key={j}><a href="#" className="text-dap-cream/50 text-[0.86rem] hover:text-dap-gold-light transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-dap-cream/10 pt-4 text-center text-dap-cream/30 text-[0.76rem]">
        <p>&copy; 2026 DAP Executive. All rights reserved.</p>
      </div>
    </div>
  </footer>
);
