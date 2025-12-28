import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  Camera,
  Bell,
  Shield,
  CheckCircle,
  ArrowRight,
  Users,
  Clock,
  BarChart3,
  Smartphone,
  Sparkles,
  Zap,
  TrendingUp,
  Trophy,
  Star,
  Play,
  ChevronRight,
} from 'lucide-react';

// Randomized content pools
const heroHeadlines = [
  { main: "See Where Every Dollar Goes.", highlight: "In Real-Time." },
  { main: "Team Finances Made", highlight: "Crystal Clear." },
  { main: "Budget Transparency", highlight: "Parents Love." },
  { main: "No More Spreadsheet", highlight: "Nightmares." },
  { main: "Your Team's Money.", highlight: "Finally Visible." },
];

const heroSubtitles = [
  "Stop the texts. End the spreadsheet chaos. Give your youth sports team complete financial transparency that parents actually trust.",
  "Transform chaotic team finances into a beautiful dashboard. Parents see exactly where their fees go—in real-time.",
  "Finally, a budget tool built for youth sports. No accounting degree required. Just clarity, transparency, and happy parents.",
  "The days of \"where did the money go?\" are over. Real-time tracking that brings peace to your team.",
];

const ctaTexts = [
  "Start Your Free Demo",
  "Try Free for 14 Days",
  "Get Started Free",
  "See It In Action",
];

const floatingIcons = [
  { Icon: DollarSign, color: 'text-green-400' },
  { Icon: Trophy, color: 'text-yellow-400' },
  { Icon: Star, color: 'text-purple-400' },
  { Icon: Zap, color: 'text-blue-400' },
  { Icon: TrendingUp, color: 'text-emerald-400' },
  { Icon: Sparkles, color: 'text-pink-400' },
];

// Animated counter component
function AnimatedCounter({ end, duration = 2, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration, isInView]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// Floating particle component
function FloatingParticle({ delay, duration, size, left, icon: Icon, color }: {
  delay: number;
  duration: number;
  size: number;
  left: string;
  icon: typeof DollarSign;
  color: string;
}) {
  return (
    <motion.div
      className={`absolute ${color} opacity-20`}
      style={{ left, top: '100%' }}
      animate={{
        y: [0, -window.innerHeight - 200],
        x: [0, Math.random() * 100 - 50],
        rotate: [0, 360],
        opacity: [0, 0.3, 0.3, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <Icon size={size} />
    </motion.div>
  );
}

// Animated gradient orb
function GradientOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-30 ${className}`}
      animate={{
        scale: [1, 1.2, 1],
        x: [0, 30, -30, 0],
        y: [0, -30, 30, 0],
      }}
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

// Feature card with 3D effect
function FeatureCard({ feature, index }: { feature: { icon: typeof DollarSign; title: string; description: string }; index: number }) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX((y - centerY) / 10);
    setRotateY((centerX - x) / 10);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transformStyle: 'preserve-3d',
      }}
      className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-2xl hover:border-primary-300 transition-all duration-300 cursor-pointer"
    >
      <motion.div
        className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center mb-4 shadow-lg"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <feature.icon className="text-white" size={28} />
      </motion.div>
      <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-primary-600 transition-colors">
        {feature.title}
      </h3>
      <p className="text-gray-600">{feature.description}</p>
    </motion.div>
  );
}

// Testimonial carousel
function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const testimonials = [
    {
      quote: "I went from spending 5 hours every month on budget reports to 5 minutes. Parents actually thank me now!",
      author: 'Mike Rodriguez',
      role: 'Baseball Team Treasurer',
      location: 'Austin, TX',
      avatar: 'MR',
      rating: 5,
    },
    {
      quote: 'The Facebook group drama stopped overnight. When parents can see where their fees went, questions disappear.',
      author: 'Jennifer Park',
      role: 'Soccer League Admin',
      location: 'Portland, OR',
      avatar: 'JP',
      rating: 5,
    },
    {
      quote: "Finally understand our team's finances. No more wondering where the fundraising money went.",
      author: 'David Thompson',
      role: 'Hockey Parent',
      location: 'Minneapolis, MN',
      avatar: 'DT',
      rating: 5,
    },
    {
      quote: "Game changer for our travel team. Tournament expenses are now 100% transparent.",
      author: 'Sarah Mitchell',
      role: 'Basketball Team Manager',
      location: 'Chicago, IL',
      avatar: 'SM',
      rating: 5,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className="relative max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100"
        >
          <div className="flex gap-1 mb-6">
            {[...Array(testimonials[current].rating)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Star className="text-yellow-400 fill-yellow-400" size={24} />
              </motion.div>
            ))}
          </div>
          <p className="text-2xl md:text-3xl text-gray-800 font-medium mb-8 leading-relaxed">
            "{testimonials[current].quote}"
          </p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg">
              {testimonials[current].avatar}
            </div>
            <div>
              <p className="font-bold text-gray-900">{testimonials[current].author}</p>
              <p className="text-gray-500">{testimonials[current].role} • {testimonials[current].location}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === current ? 'bg-primary-600 w-8' : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  // Randomize content on mount
  const randomContent = useMemo(() => ({
    headline: heroHeadlines[Math.floor(Math.random() * heroHeadlines.length)],
    subtitle: heroSubtitles[Math.floor(Math.random() * heroSubtitles.length)],
    cta: ctaTexts[Math.floor(Math.random() * ctaTexts.length)],
  }), []);

  const features = [
    {
      icon: Smartphone,
      title: 'Real-Time Parent Portal',
      description: 'Parents see a live feed of team finances. No more midnight texts asking where the money went.',
    },
    {
      icon: Camera,
      title: 'Smart Receipt Scanner',
      description: 'Snap a photo, and AI categorizes it instantly. Receipt management on autopilot.',
    },
    {
      icon: CheckCircle,
      title: 'Automatic Collections',
      description: "Track who's paid and who hasn't. Gentle reminders keep everyone on track.",
    },
    {
      icon: BarChart3,
      title: 'One-Click Reports',
      description: 'Generate season summaries and tournament breakdowns in seconds, not hours.',
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Budget alerts and expense updates keep the whole team informed automatically.',
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your financial data protected with 256-bit encryption. Peace of mind included.',
    },
  ];

  const painPoints = [
    {
      emoji: '😤',
      title: 'The 11PM Text Storm',
      description: 'Parents demanding answers about their $500 registration—while you\'re trying to sleep',
    },
    {
      emoji: '📊',
      title: 'The Excel Nightmare',
      description: 'Juggling receipts, spreadsheets, and Venmo screenshots that never add up',
    },
    {
      emoji: '😠',
      title: 'The Trust Crisis',
      description: 'Facebook group arguments because nobody can see where the money goes',
    },
    {
      emoji: '⏰',
      title: 'The Time Drain',
      description: 'Sunday afternoons lost creating budget reports nobody reads',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <GradientOrb className="w-[600px] h-[600px] bg-primary-400 -top-48 -right-48" />
        <GradientOrb className="w-[500px] h-[500px] bg-purple-400 top-1/3 -left-48" delay={2} />
        <GradientOrb className="w-[400px] h-[400px] bg-emerald-400 bottom-0 right-1/4" delay={4} />

        {/* Floating particles */}
        {floatingIcons.map((item, i) => (
          <FloatingParticle
            key={i}
            delay={i * 2}
            duration={15 + Math.random() * 10}
            size={24 + Math.random() * 24}
            left={`${10 + i * 15}%`}
            icon={item.Icon}
            color={item.color}
          />
        ))}
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-xl z-50 border-b border-gray-200/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                TeamBudget
              </span>
            </motion.div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all"
                >
                  Start Free Trial
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center"
      >
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-8"
            >
              <Sparkles size={16} />
              <span>Trusted by 2,847+ youth sports teams</span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {randomContent.headline.main}
              </motion.span>
              <br />
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-primary-600 via-purple-600 to-primary-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient"
              >
                {randomContent.headline.highlight}
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto mb-10"
            >
              {randomContent.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="group inline-flex items-center bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-lg px-8 py-4 rounded-2xl font-semibold shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all"
                >
                  {randomContent.cta}
                  <motion.span
                    className="ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <ArrowRight size={20} />
                  </motion.span>
                </Link>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                <div className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center">
                  <Play size={20} className="text-primary-600 ml-1" />
                </div>
                Watch Demo
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Animated Stats */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: 2847, suffix: '+', label: 'Teams', icon: Users },
              { value: 4.2, suffix: 'M', label: 'Tracked', icon: DollarSign, prefix: '$' },
              { value: 92, suffix: '%', label: 'Less Questions', icon: Clock },
              { value: 4.9, suffix: '/5', label: 'Rating', icon: Star },
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg mb-3">
                  <stat.icon className="text-primary-600" size={24} />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {stat.prefix}<AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 rounded-full border-2 border-gray-400 flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ opacity: [1, 0, 1], y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1.5 h-1.5 rounded-full bg-gray-400"
            />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Pain Points Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Sound Familiar?
            </h2>
            <p className="text-xl text-gray-600">
              These problems end today.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {painPoints.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, rotate: -2 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10, rotate: 2 }}
                className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden group"
              >
                <div className="absolute -right-4 -top-4 text-8xl opacity-10 group-hover:opacity-20 transition-opacity">
                  {item.emoji}
                </div>
                <span className="text-4xl mb-4 block">{item.emoji}</span>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>

                {/* Strike-through effect on hover */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-500/5 origin-left"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section with Steps */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-100 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get Started in
              <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent"> 3 Simple Steps</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-24 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200" />

            {[
              { step: '01', title: 'Connect Your Team', desc: 'Import roster or sync with TeamSnap in 2 minutes', icon: Users },
              { step: '02', title: 'Track Everything', desc: 'Snap receipts, log expenses, collect fees—one place', icon: Camera },
              { step: '03', title: 'Parents Stay Happy', desc: 'Automatic updates, zero manual reports', icon: CheckCircle },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-500/30 relative z-10"
                >
                  <item.icon className="text-white" size={36} />
                </motion.div>
                <span className="text-6xl font-bold text-gray-100 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-0">
                  {item.step}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600">
              Purpose-built for youth sports teams
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FeatureCard key={i} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-100 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Loved by Teams Everywhere
            </h2>
          </motion.div>

          <TestimonialCarousel />
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">Start free, upgrade when you're ready</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '$24',
                period: '/month',
                description: 'Perfect for single teams',
                features: ['1 team', 'Unlimited parents', 'Real-time updates', 'Receipt scanning', 'Basic reports'],
                cta: 'Start Free Trial',
                popular: false,
              },
              {
                name: 'Pro',
                price: '$49',
                period: '/month',
                description: 'For multi-team treasurers',
                features: ['Up to 3 teams', 'Advanced analytics', 'Priority support', 'Custom categories', 'API integrations'],
                cta: 'Start Free Trial',
                popular: true,
              },
              {
                name: 'League',
                price: 'Custom',
                period: '',
                description: 'For leagues and organizations',
                features: ['Unlimited teams', 'White-label options', 'Dedicated onboarding', 'Admin dashboard', 'Custom features'],
                cta: 'Contact Sales',
                popular: false,
              },
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className={`relative bg-white p-8 rounded-3xl shadow-xl border-2 ${
                  plan.popular ? 'border-primary-500' : 'border-gray-100'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-600 to-purple-600 text-white text-sm font-medium px-6 py-1.5 rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-2">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 ml-1">{plan.period}</span>
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <motion.li
                      key={j}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 + j * 0.05 }}
                      className="flex items-center gap-3 text-gray-600"
                    >
                      <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
                      {feature}
                    </motion.li>
                  ))}
                </ul>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/register"
                    className={`block w-full text-center py-4 rounded-xl font-semibold transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-purple-600 to-primary-600 bg-[length:200%_100%] animate-gradient" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNncmlkKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-30" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to End the Chaos?
          </h2>
          <p className="text-xl text-white/80 mb-10">
            Join thousands of teams enjoying stress-free budget management. Your parents will thank you.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/register"
              className="inline-flex items-center bg-white text-primary-600 text-lg px-10 py-5 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all"
            >
              Start Your Free 14-Day Trial
              <ChevronRight size={24} className="ml-2" />
            </Link>
          </motion.div>
          <p className="text-white/60 mt-6 text-sm">
            No credit card required • Cancel anytime • 30-day money-back guarantee
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">T</span>
                </div>
                <span className="font-bold text-xl text-white">TeamBudget</span>
              </div>
              <p className="text-sm">
                Financial transparency for youth sports teams. Making budget management simple.
              </p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'API'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { title: 'Support', links: ['Help Center', 'Contact', 'Privacy', 'Terms'] },
            ].map((section, i) => (
              <div key={i}>
                <h4 className="text-white font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2 text-sm">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="hover:text-white transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} TeamBudget. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Add gradient animation keyframes */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 8s ease infinite;
        }
      `}</style>
    </div>
  );
}
