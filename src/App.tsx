/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "motion/react";
import { 
  Instagram, 
  Twitter, 
  Github, 
  ChevronDown,
  Palette,
  ExternalLink,
  X,
  ArrowRight,
  ArrowDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import gsap from "gsap";

// --- Types ---
interface Project {
  id: number;
  title: string;
  category: string;
  image: string;
  video?: string;
  gallery?: string[];
  workflowImage?: string;
  hasCustomWorkflow?: boolean;
  description: string;
  detailDescription?: string;
  tags: string[];
  prompt?: string;
}

interface TimelineItem {
  id: number;
  year: string;
  title: string;
  content: string;
  type: "education" | "experience";
}

// --- Mock Data ---
const PROJECTS: Project[] = [
  {
    id: 1,
    title: "AI Video - 第六次航行",
    category: "Generative Cinematography",
    image: "/brush.jpg",
    video: "https://my.feishu.cn/file/R9Unb0sTRoohkGxXI41chiihnIb",
    workflowImage: "/vw.png",
    description: "该作品通过 AIGC 全链路技术重构了传统文化叙事。核心难点在于在大跨度的转场中保持视觉资产的效果一致性。通过 Dreamina 模型的深度应用并结合 IP-Adapter 技术，实现了从二维水墨意象到三维写实光影的平滑过渡。",
    detailDescription: "内容介绍：中国留学生周航因毕设瓶颈和延毕压力倍感焦虑。他在唐招提寺礼拜鉴真像时深受感动，从大师历经六次东渡、双目失明仍不懈努力的精神中汲取灵感，创作出作品《第六次东渡》，最终化解危机，顺利毕业。",
    tags: ["Runway Gen-3", "Dreamina Pro", "Video Consistency", "IP-Adapter"],
    prompt: "A traditional Chinese ink wash painting transitions into a high-detail 3D cinematic landscape, giant waves crashing like a dragon, ethereal spirit energy, hyper-realistic water physics, 8k resolution, Ukiyo-e influence."
  },
  {
    id: 2,
    title: "AI Manga - 公园20分钟",
    category: "AI Comic Pipeline",
    image: "/page1.jpg",
    gallery: ["/page1.jpg", "/page2.jpg", "/page3.jpg"],
    workflowImage: "/mw.jpg",
    description: "探索 AI 漫画工业化出图的标准流程。利用 Dreamina 的智能画布功能精准控制人物体态与构图，辅以特定角色的一致性训练，解决了 AIGC 创作中‘角色脸崩’的痛点，实现了单人一天完成 3 页黑白漫画的高效产能。",
    detailDescription: "内容介绍：刚来日本留学的女孩阳菜（Hina），面对周围的一切都感到陌生而孤独。一天，她想起曾读过的“20分钟公园理论”，便决定去附近的公园坐坐。就在那时，一位素不相识的日本女孩突然走上前，想给他拍一张照片。看着这张照片，阳菜第一次产生了一种归属感，并下定决心不再消极等待，而是要主动出击，去拥抱这座陌生的城市。",
    tags: ["Dreamina", "Character Consistency", "Workflow Design", "Manga Script"],
    prompt: "Seinen manga style, highly detailed line art, screentones, young woman walking in a serene urban park, afternoon sunlight filtering through trees, cinematic perspective, emotional atmosphere."
  },
  {
    id: 3,
    title: "AI Exhibition - 360imx展览",
    category: "Tech-Art Integration",
    image: "/ra.jpg",
    video:"https://my.feishu.cn/file/MplRbibUno2SwUxpZaycAcwOnRe?from=from_copylink",
    hasCustomWorkflow: true,
    description: "人机协作开发的典型案例。通过与 Claude 4.0 的深度沟通，利用代码驱动 WebGL 渲染，在 AIGC 生成的视觉母版基础上，注入了动态的时间轴系统。该项目展示了如何将 AI 从单一的绘图工具，转化为协同解决复杂前端交互的‘研发伙伴’。",
    tags: ["Claude Code Gen", "WebGL / Canvas", "Prompt Engineering", "Interactive Web"],
    prompt: "Immersive digital art exhibition, data visualization flowing in 3D space, dark ambient lighting, glowing neon particles, interconnected nodes representing neural networks, futuristic tech-art aesthetic."
  },
];

const TIMELINE: TimelineItem[] = [
  { 
    id: 1, 
    year: "08/2025 - Present", 
    title: "National University of Singapore", 
    content: "Master of Arts in Japanese Visual Culture\n新加坡国立大学（硕士）\n日本视觉文化", 
    type: "education" 
  },
  { 
    id: 2, 
    year: "09/2020 - 06/2024", 
    title: "Yanbian University", 
    content: "Bachelor of Arts in Japanese Language and Literature (Minor in Law)\n延边大学（学士）\n日语语言文学-法学（双学位）", 
    type: "education" 
  },
  { id: 3, year: "2025 Nov - Dec", title: "AI Visual Creation Intern", content: "Participated in AIGC project creation, assisted in script writing, character setting, and model training.", type: "experience" },
];

// --- Basic Follower Cursor ---
const BasicCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Hide custom cursor on touch devices for better UX
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) {
      setIsVisible(false);
      // Ensure default cursor shows if we previously set it to none via CSS
      document.body.style.cursor = 'auto';
      return;
    } else {
      setIsVisible(true);
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.tagName === "A" || 
                           target.tagName === "BUTTON" || 
                           target.closest("button") || 
                           target.closest("a") ||
                           target.classList.contains("cursor-pointer") ||
                           target.closest(".cursor-pointer");
      
      setIsHovering(!!isInteractive);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  const springConfig = { damping: 30, stiffness: 250 };
  const followerX = useSpring(mousePosition.x, springConfig);
  const followerY = useSpring(mousePosition.y, springConfig);

  if (!isVisible) return null;

  return (
    <>
      <motion.div
        className="cursor-dot"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
        }}
      />
      <motion.div
        className="cursor-follower"
        style={{
          x: followerX,
          y: followerY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          backgroundColor: isHovering ? "rgba(255, 215, 0, 0.05)" : "transparent",
          borderColor: isHovering ? "rgba(255, 215, 0, 0.4)" : "rgba(0, 0, 0, 0.2)",
        }}
      />
    </>
  );
};

// --- Twinkling Stars Effect for Dark Sections ---
const TwinklingStars = () => {
  const stars = useMemo(() => [...Array(150)].map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 4 + 2,
    duration: 3 + Math.random() * 5,
    delay: Math.random() * 10,
    rotation: Math.random() * 360
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((s) => (
        <motion.div
          key={s.id}
          initial={{ opacity: 0.1, scale: 0.5, rotate: s.rotation }}
          animate={{ 
            opacity: [0.1, 0.7, 0.1],
            scale: [0.5, 1.2, 0.5],
            rotate: s.rotation + 45
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            delay: s.delay,
            ease: "easeInOut"
          }}
          className="absolute bg-white"
          style={{ 
            left: s.left, 
            top: s.top, 
            width: s.size, 
            height: s.size,
            clipPath: "polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%)",
            boxShadow: "0 0 10px rgba(255, 255, 255, 0.8)"
          }}
        />
      ))}
    </div>
  );
};

// --- Reusable Scroll Button ---
const ScrollButton = ({ targetId, isDark = false, label = "Scroll" }: { targetId: string, isDark?: boolean, label?: string }) => (
  <motion.button 
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    onClick={() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    }}
    className="flex flex-col items-center gap-4 group absolute bottom-12 left-1/2 -translate-x-1/2 lg:left-auto lg:right-12 lg:translate-x-0 z-20"
  >
    <span className={`text-[10px] uppercase tracking-[0.5em] ${isDark ? 'text-white/40 group-hover:text-white' : 'text-black/40 group-hover:text-black'} transition-colors font-bold`}>{label}</span>
    <div className="relative">
      <div className={`w-[1px] h-12 ${isDark ? 'bg-white/10 group-hover:bg-white' : 'bg-black/10 group-hover:bg-black'} transition-colors`} />
      <ArrowDown size={14} className={`absolute -bottom-1 left-1/2 -translate-x-1/2 ${isDark ? 'text-white/40 group-hover:text-white' : 'text-black/40 group-hover:text-black'} transition-colors animate-bounce`} />
    </div>
  </motion.button>
);

class Star {
  x: number; y: number; size: number; opacity: number;
  constructor(width: number, height: number) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.size = Math.random() * 1.5 + 0.5;
    this.opacity = Math.random() * 0.5;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = `rgba(0, 0, 0, ${this.opacity})`;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
  }
}

// --- Components ---

const IntroAnimation = ({ onComplete }: { onComplete: () => void }) => {
  const lineRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars: any[] = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        opacity: Math.random()
      });
    }

    const shootingStars: any[] = [];
    const triggerShootingStar = () => {
      shootingStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height / 2),
        len: 100 + Math.random() * 150,
        speed: 15 + Math.random() * 10,
        opacity: 1
      });
    };

    let frame: number;
    const render = () => {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = "white";
      stars.forEach(s => {
        ctx.globalAlpha = s.opacity;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill();
      });

      shootingStars.forEach((ss, i) => {
        const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.len, ss.y - ss.len * 0.5);
        grad.addColorStop(0, `rgba(255,255,255,${ss.opacity})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(ss.x, ss.y); ctx.lineTo(ss.x - ss.len, ss.y - ss.len * 0.5); ctx.stroke();
        ss.x += ss.speed; ss.y += ss.speed * 0.5; ss.opacity -= 0.01;
        if (ss.opacity <= 0) shootingStars.splice(i, 1);
      });

      frame = requestAnimationFrame(render);
    };
    render();

    const tl = gsap.timeline({ onComplete });
    
    // Sequence: Stars -> Shooting Stars -> Line -> Text
    tl.to({}, { duration: 1 }) // Wait for stars
      .call(() => { for(let i=0; i<5; i++) setTimeout(triggerShootingStar, i * 200); })
      .to({}, { duration: 1.5 }) // Wait for shooting stars
      .fromTo(lineRef.current, { width: 0 }, { width: "100%", duration: 1.5, ease: "power4.inOut" })
      .fromTo(textRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, "-=0.5")
      .to(".intro-container", { opacity: 0, duration: 1, ease: "power2.inOut", delay: 1 })
      .call(() => cancelAnimationFrame(frame));

    return () => cancelAnimationFrame(frame);
  }, [onComplete]);

  return (
    <div className="intro-container fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      <div ref={textRef} className="mb-8 overflow-hidden relative z-10">
        <h2 className="font-serif text-2xl tracking-[0.5em] uppercase text-white">Welcome to my AI World</h2>
      </div>
      <div className="w-64 h-px bg-white/10 relative z-10">
        <div ref={lineRef} className="absolute inset-0 bg-white" />
      </div>
    </div>
  );
};

const TimelineCard = ({ item, index }: { item: TimelineItem; index: number; key?: any }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.9]);

  return (
    <motion.div
      ref={cardRef}
      style={{ rotateX, opacity, scale }}
      className="perspective-1000 mb-12"
    >
      <motion.div 
        whileHover={{ y: -10, backgroundColor: "rgba(0,0,0,0.02)", boxShadow: "0 20px 40px rgba(0,0,0,0.05)" }}
        className="glass-morphism p-8 rounded-2xl transition-all duration-500 group"
      >
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs font-mono text-black/40 uppercase tracking-widest">{item.year}</span>
          <div className="w-2 h-2 rounded-full bg-black/10 group-hover:bg-black transition-colors" />
        </div>
        <h3 className="font-serif text-xl mb-4">{item.title}</h3>
        <p className="text-sm text-black/60 leading-relaxed font-light whitespace-pre-line">{item.content}</p>
      </motion.div>
    </motion.div>
  );
};

export default function App() {
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [isExplored, setIsExplored] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailPage, setIsDetailPage] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const stars: Star[] = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars.length = 0;
      for (let i = 0; i < 200; i++) stars.push(new Star(canvas.width, canvas.height));
    };
    window.addEventListener("resize", resize);
    resize();

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => s.draw(ctx));
      requestAnimationFrame(render);
    };
    render();
    return () => window.removeEventListener("resize", resize);
  }, []);

  if (isDetailPage && selectedProject) {
    const handleNext = () => {
      if (selectedProject.gallery) {
        setCurrentGalleryIndex((prev) => (prev + 1) % selectedProject.gallery!.length);
      }
    };

    const handlePrev = () => {
      if (selectedProject.gallery) {
        setCurrentGalleryIndex((prev) => (prev - 1 + selectedProject.gallery!.length) % selectedProject.gallery!.length);
      }
    };

    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="min-h-screen bg-white p-12 lg:p-24 selection:bg-black selection:text-white"
      >
        {/* Basic Cursor */}
        <BasicCursor />
        <button 
          onClick={() => {
            setIsDetailPage(false);
            setCurrentGalleryIndex(0);
            // After closing detail page, ensure we return to the works section
            setTimeout(() => {
              const worksSection = document.getElementById('works');
              if (worksSection) {
                worksSection.scrollIntoView({ behavior: 'auto' });
              }
            }, 50);
          }} 
          className="fixed top-12 left-12 z-50 flex items-center gap-2 text-xs uppercase tracking-widest hover:opacity-50 transition-opacity"
        >
          <X size={16} /> Back
        </button>

        <AnimatePresence>
          {showWorkflow && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center p-8 lg:p-24 overflow-y-auto"
            >
              <button 
                onClick={() => setShowWorkflow(false)}
                className="fixed top-12 right-12 text-white hover:opacity-50 transition-opacity z-10 p-4"
              >
                <X size={32} />
              </button>

              {selectedProject.hasCustomWorkflow && selectedProject.id === 3 ? (
                <div className="max-w-4xl w-full flex flex-col gap-12 py-24">
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex flex-col gap-8 bg-white/5 p-8 lg:p-12 rounded-3xl border border-white/10"
                  >
                    <div className="space-y-4">
                      <h3 className="text-white text-2xl font-serif">我们先来看一下现场的一些照片</h3>
                      <p className="text-white/60 font-light">展览在一个360°的空间内展开</p>
                    </div>
                    <div className="w-full overflow-x-auto horizontal-scroll-container pb-4 rounded-2xl shadow-xl">
                       <img src="/whole.jpg" className="h-[300px] lg:h-[450px] max-w-none object-contain" referrerPolicy="no-referrer" />
                    </div>
                  </motion.div>

                  <div className="flex justify-center">
                    <ArrowDown className="text-white/20 animate-bounce" size={40} />
                  </div>

                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex flex-col gap-8 bg-white/5 p-8 lg:p-12 rounded-3xl border border-white/10"
                  >
                    <div className="space-y-4">
                      <h3 className="text-white text-2xl font-serif">动态设计效果-时间轴，火焰，金箔</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                        <img src="/dyna.jpg" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                        <img src="/flame.jpg" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    </div>
                  </motion.div>

                  <div className="flex justify-center">
                    <ArrowDown className="text-white/20 animate-bounce" size={40} />
                  </div>

                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex flex-col gap-8 bg-white/5 p-8 lg:p-12 rounded-3xl border border-white/10"
                  >
                    <div className="space-y-4">
                      <p className="text-white/60 font-light">这些动态效果的展示全部借助claude coding功能完成</p>
                    </div>
                    <div className="w-full overflow-x-auto horizontal-scroll-container pb-4 rounded-2xl shadow-xl">
                       <img src="/code.png" className="h-[300px] lg:h-[450px] max-w-none object-contain" referrerPolicy="no-referrer" />
                    </div>
                  </motion.div>
                </div>
              ) : (
                selectedProject.workflowImage && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative max-w-5xl w-full h-full bg-black/20 rounded-3xl overflow-hidden shadow-2xl"
                  >
                    <img 
                      src={selectedProject.workflowImage} 
                      alt="Workflow" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                )
              )}
              <p className="mt-8 text-white/40 text-[10px] uppercase tracking-[0.5em] pb-12">Workflow Visualization</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div layoutId={`img-${selectedProject.id}`} className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-black relative group">
            {selectedProject.video ? (
              <div className="w-full h-full">
                 {selectedProject.video.includes('drive.google.com') || selectedProject.video.includes('feishu.cn') ? (
                  <iframe
                    src={selectedProject.video}
                    className="w-full h-full border-0"
                    allow="autoplay; fullscreen; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                   />
                ) : (
                  <>
                    <video 
                      src={selectedProject.video} 
                      className="w-full h-full object-cover" 
                      controls 
                      autoPlay 
                      muted
                      loop 
                      playsInline
                      onError={() => {
                        const errorMsg = document.getElementById('video-error');
                        if (errorMsg) errorMsg.style.display = 'flex';
                      }}
                    />
                    <div id="video-error" className="absolute inset-0 hidden flex-col items-center justify-center p-8 text-center bg-zinc-900">
                      <p className="text-white/60 text-sm mb-4">视频加载失败</p>
                      <p className="text-white/40 text-[10px] leading-relaxed">
                        可能是由于网络限制或链接失效。<br />
                        如果视频无法加载，请点击下方链接下载观看。
                      </p>
                      <a 
                        href={selectedProject.video} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="mt-6 text-[10px] uppercase tracking-widest text-white/60 hover:text-white underline"
                      >
                        点击下载/原始地址
                      </a>
                    </div>
                  </>
                )}
              </div>
            ) : selectedProject.gallery ? (
              <div className="w-full h-full relative">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentGalleryIndex}
                    src={selectedProject.gallery[currentGalleryIndex]}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </AnimatePresence>
                
                {/* Navigation Arrows */}
                <button 
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/5 backdrop-blur-md flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/10"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/5 backdrop-blur-md flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/10"
                >
                  <ChevronRight size={20} />
                </button>

                {/* Pagination Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {selectedProject.gallery.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentGalleryIndex ? 'bg-black w-4' : 'bg-black/20'}`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <img src={selectedProject.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            )}
          </motion.div>
          <div>
            <span className="text-xs uppercase tracking-[0.5em] text-black/40 mb-6 block">{selectedProject.category}</span>
            <h1 className="font-serif text-6xl md:text-8xl mb-12 leading-tight">{selectedProject.title}</h1>
            <p className="text-black/60 leading-relaxed mb-12 text-lg font-light">{selectedProject.detailDescription || selectedProject.description}</p>
            <div className="flex flex-wrap gap-4 mb-12">
              {selectedProject.tags.map(tag => (
                <span key={tag} className="px-4 py-2 bg-black/5 rounded-full text-[10px] uppercase tracking-widest">{tag}</span>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mb-24">
              <button 
                onClick={() => {
                  if (selectedProject.workflowImage || selectedProject.hasCustomWorkflow) {
                    setShowWorkflow(true);
                  }
                }}
                className="px-8 py-5 bg-black text-white rounded-full text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-transform flex-1"
              >
                Click here to see the workflow
              </button>
              {selectedProject.id !== 3 && (
                <button 
                  onClick={() => setShowPrompt(true)}
                  className="px-8 py-5 border border-black text-black rounded-full text-[10px] uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all flex-1"
                >
                  Click here to see the prompt
                </button>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showPrompt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-white/98 backdrop-blur-2xl flex items-center justify-center p-6 lg:p-12 overflow-y-auto"
            >
              <button 
                onClick={() => setShowPrompt(false)}
                className="fixed top-8 right-8 text-black hover:opacity-50 transition-opacity z-[120] p-4 bg-white/50 backdrop-blur rounded-full"
              >
                <X size={24} />
              </button>

              {selectedProject.id === 1 ? (
                /* Special Layout for Project 1 - Horizontal Distribution */
                <motion.div 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-stretch"
                >
                  {/* Left Column: Visuals */}
                  <div className="flex flex-col gap-6">
                    <div className="rounded-3xl overflow-hidden shadow-2xl bg-black aspect-video relative">
                      <video 
                        src="/v1.mp4" 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-4 left-4 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[8px] uppercase tracking-widest text-white border border-white/20">AIGC Result Preview</div>
                    </div>
                    <div className="rounded-3xl overflow-hidden shadow-xl border border-black/5 bg-zinc-50 flex items-center justify-center aspect-video">
                      <img 
                        src="/prompt.png" 
                        alt="Prompt visualization" 
                        className="max-w-full max-h-full object-contain p-4"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://picsum.photos/seed/prompt/800/600";
                        }}
                      />
                    </div>
                  </div>

                  {/* Right Column: Stationery Style Content */}
                  <div className="relative p-8 lg:p-12 bg-[#fdfaf2] rounded-3xl shadow-lg border border-[#e8dcc8] flex flex-col items-start overflow-hidden text-left">
                    {/* Stationery Lines Decorative Background */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px)', backgroundSize: '100% 2.8rem' }} />
                    
                    <div className="relative z-10 w-full h-full flex flex-col">
                      <div className="flex items-center gap-4 mb-8 w-full pb-4 border-b border-[#e8dcc8]">
                        <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                          <Palette size={18} className="text-[#8b7355]" />
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.5em] text-[#8b7355] font-bold">Creative Manuscript</span>
                      </div>

                      <div className="space-y-8 text-[#4a4036]">
                        <div className="space-y-4">
                          <h4 className="flex items-center gap-3 font-serif text-xl font-bold">
                            <span className="text-2xl">🎬</span> 整体风格与镜头语言
                          </h4>
                          <div className="bg-white/40 p-5 rounded-2xl border border-white/60 italic font-serif leading-relaxed text-sm lg:text-base">
                            Camera & Tone: <br />
                            &lt;整体叙事风格&gt; &lt;镜头控制角度&gt; &lt;主体人物+动作&gt; &lt;画幅规定&gt;
                          </div>
                        </div>

                        <div className="space-y-6">
                          <h4 className="flex items-center gap-3 font-serif text-xl font-bold">
                            <span className="text-2xl">💡</span> 技术难点与解决思路
                          </h4>
                          
                          <div className="grid gap-5">
                            {[
                              { 
                                num: "①", 
                                title: "跨时空叙事的视觉锚点 (Match Cut)", 
                                content: "为了将“鉴真东渡的历史孤寂感”与“现代学术研究的受挫感”进行时空链接，我设计了从“真实海浪水珠”到“二维波浪图纸”的 Match Cut 转场。" 
                              },
                              { 
                                num: "②", 
                                title: "攻克 AI 形变不可控性", 
                                content: "AI 视频生成中最难的是控制物体的平滑形变。我没有依赖单纯的文本抽卡，而是启用了 Dreamina 的 首尾帧生成模式 (First and Last frames)，并在 Prompt 中极其精确地定义了物理特征的过渡（“变扁、变直、变干”）和色彩的褪变（“半透明海蓝到纯白”），强行引导模型完成从 3D 液体到 2D 固体的几何演变。" 
                              },
                              { 
                                num: "③", 
                                title: "情绪色彩的冷暖过渡", 
                                content: "在视觉要求中严格规定了从“狂暴深蓝色调”到“办公室明亮冷调”的色彩映射，确保转场在情绪传达上的连贯性。" 
                              }
                            ].map((item, idx) => (
                              <div key={idx} className="relative pl-8 text-left">
                                <span className="absolute left-0 top-0.5 text-[#8b7355] font-bold text-lg">{item.num}</span>
                                <h5 className="font-bold mb-1 text-sm lg:text-base">{item.title}</h5>
                                <p className="text-xs lg:text-sm text-[#6b5e50] leading-relaxed font-light">
                                  {item.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 pt-6 flex justify-end w-full border-t border-[#e8dcc8]/30">
                        <div className="text-right">
                          <div className="w-16 h-px bg-[#8b7355]/20 mb-2 ml-auto" />
                          <span className="text-[9px] uppercase tracking-[0.3em] text-[#8b7355]/60">Technological Aesthetics / AIGC 2026</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : selectedProject.id === 2 ? (
                /* Special Layout for Project 2 - Horizontal Distribution */
                <motion.div 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-stretch"
                >
                  {/* Left Column: Image */}
                  <div className="rounded-3xl overflow-hidden shadow-2xl bg-zinc-100 flex items-center justify-center">
                    <img 
                      src="/eye.png" 
                      alt="Eye close-up" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://picsum.photos/seed/eye/800/800";
                      }}
                    />
                  </div>

                  {/* Right Column: Stationery Style Content */}
                  <div className="relative p-8 lg:p-12 bg-[#fdfaf2] rounded-3xl shadow-lg border border-[#e8dcc8] flex flex-col items-start overflow-hidden text-left">
                    {/* Stationery Lines Decorative Background */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px)', backgroundSize: '100% 2.8rem' }} />
                    
                    <div className="relative z-10 w-full h-full flex flex-col">
                      <div className="flex items-center gap-4 mb-8 w-full pb-4 border-b border-[#e8dcc8]">
                        <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                          <Palette size={18} className="text-[#8b7355]" />
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.5em] text-[#8b7355] font-bold">Manga Script Analysis</span>
                      </div>

                      <div className="space-y-8 text-[#4a4036]">
                        <div className="space-y-4">
                          <h4 className="flex items-center gap-3 font-serif text-xl font-bold">
                            <span className="text-2xl">📝</span> CORE SCRIPT PROMPT
                          </h4>
                          <div className="grid gap-4">
                            {[
                              { title: "① Style & Composition", content: "黑白漫画风格，特写画面仅保留女孩的眼睛。" },
                              { title: "② Narrative Trigger", content: "眼神瞬间亮了起来，瞳孔中映射出那张鲜花照片。" },
                              { title: "③ Cultural Modifier (关键修饰)", content: "启用少女漫画标志性视觉手法：眼睛超大比例畸变，内部闪烁无数星星符号（夸张大眼与高光），以极端的视觉化手法体现人物被美好事物瞬间唤醒的心流状态。" }
                            ].map((item, idx) => (
                              <div key={idx} className="bg-white/40 p-4 rounded-xl border border-white/60">
                                <h5 className="font-bold text-xs uppercase tracking-wider mb-1 text-[#8b7355]">{item.title}</h5>
                                <p className="text-sm font-light leading-relaxed">{item.content}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="flex items-center gap-3 font-serif text-xl font-bold">
                            <span className="text-2xl">💡</span> DESIGNER'S INSIGHT
                          </h4>
                          <p className="text-[13px] lg:text-sm text-[#6b5e50] leading-relaxed font-light text-justify bg-white/30 p-6 rounded-2xl border border-white/40 italic">
                            优秀的 AIGC 视觉创作绝非简单的物理特征堆堆砌，而是设计师文化积淀的精准投射。在生成特定艺术风格时，仅靠直白的文本描述往往难以触及灵魂。例如在此次漫画风格的生成中，我没有停留在“画一双眼睛”的表层，而是提取了“少女漫 (Shōjo Manga)”这一品类独有的视觉修辞——通过刻意强化“夸张的大眼 (Dekame)”与满溢的“瞳孔高光 (Sparkling Eyes)”，将角色的情绪唤醒具象化。只有深谙并驾驭这些潜藏的媒介特征，才能写出直击 AI 核心的 Prompt，赋予数字生成物地道的文化质感。
                          </p>
                        </div>
                      </div>

                      <div className="mt-8 pt-6 flex justify-end w-full border-t border-[#e8dcc8]/30">
                        <div className="text-right">
                          <div className="w-16 h-px bg-[#8b7355]/20 mb-2 ml-auto" />
                          <span className="text-[9px] uppercase tracking-[0.3em] text-[#8b7355]/60">Visual culture research / AIGC 2026</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Default Layout for other projects */
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="max-w-2xl w-full text-center"
                >
                  <span className="text-xs uppercase tracking-[0.6em] text-black/40 mb-8 block">Ai Generation Prompt</span>
                  <div className="bg-black/5 p-12 rounded-3xl relative">
                    <p className="font-serif text-2xl lg:text-3xl leading-relaxed text-black italic">
                      "{selectedProject.prompt || "No prompt available for this project."}"
                    </p>
                    <div className="absolute -top-4 -left-4 text-6xl text-black/5 font-serif">“</div>
                    <div className="absolute -bottom-12 -right-4 text-6xl text-black/5 font-serif">”</div>
                  </div>
                  <button 
                    onClick={() => {
                      if (selectedProject.prompt) {
                        navigator.clipboard.writeText(selectedProject.prompt);
                      }
                    }}
                    className="mt-12 text-[10px] uppercase tracking-[0.4em] font-bold text-black border-b border-black pb-1 hover:opacity-50 transition-opacity"
                  >
                    Copy to clipboard
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }


  return (
    <div className="relative min-h-screen bg-white text-black selection:bg-black selection:text-white font-sans overflow-x-hidden">
      <AnimatePresence>
        {!isIntroComplete && <IntroAnimation onComplete={() => setIsIntroComplete(true)} />}
      </AnimatePresence>

      <canvas ref={canvasRef} id="star-canvas" />

      {/* Navigation */}
      <nav className="fixed top-6 left-6 right-6 lg:top-12 lg:left-12 lg:right-12 z-50 flex justify-between items-center mix-blend-difference text-white lg:text-black lg:mix-blend-normal">
        <div className="font-serif text-xl tracking-tighter">Ellen.</div>
        <div className="hidden lg:flex gap-12 text-[10px] uppercase tracking-[0.3em] font-medium">
          {["Home", "About", "Works", "Contact"].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="hover:opacity-50 transition-opacity">{item}</a>
          ))}
        </div>
      </nav>

      {/* Section 1: Cover */}
      <section id="home" className="relative h-screen flex items-center justify-center px-6 lg:px-24 overflow-hidden bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full max-w-7xl">
          <div className="relative z-10 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start">
              <div className="overflow-hidden">
                <motion.h1 
                  initial={{ opacity: 0, y: 80 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 1.8, 
                    delay: 2.2, 
                    ease: [0.16, 1, 0.3, 1] 
                  }}
                  className="font-serif text-[18vw] lg:text-[10vw] leading-[0.8] tracking-tighter mb-8 lg:mb-12"
                >
                  POR<br />TFO<br />LIO
                </motion.h1>
              </div>

              {/* NEW: Connecting Elements in the Gutter - Physically in the center of the gap */}
              <div className="hidden lg:block ml-24 lg:ml-48 mt-6">
                <div className="flex flex-col items-center gap-12">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: 150 }}
                    transition={{ delay: 3, duration: 1.5 }}
                    className="w-[1.5px] bg-gradient-to-b from-transparent via-black/20 to-transparent"
                  />
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3.5 }}
                    className="writing-mode-vertical-rl rotate-180 text-[11px] tracking-[1em] font-medium text-black/30 whitespace-nowrap"
                  >
                    DIGITAL GENESIS
                  </motion.span>
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: 150 }}
                    transition={{ delay: 3, duration: 1.5 }}
                    className="w-[1.5px] bg-gradient-to-b from-transparent via-black/20 to-transparent"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row justify-center lg:justify-start gap-8 items-center text-[10px] uppercase tracking-[0.5em] text-black/40">
              <div className="flex items-center gap-8">
                <span>Liu Haonan</span>
                <div className="w-12 h-px bg-black/20" />
                <span>AIGC 2026</span>
              </div>
            </div>

            {/* Wandering Particles */}
            <div className="hidden lg:block absolute top-1/2 -right-12 transform -translate-y-1/2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    x: [0, 40, 0],
                    y: [0, -60, 0],
                    opacity: [0, 0.5, 0]
                  }}
                  transition={{
                    duration: 5 + i,
                    repeat: Infinity,
                    delay: i * 2,
                    ease: "easeInOut"
                  }}
                  className="absolute top-1/2 left-0 w-1 h-1 bg-black/10 rounded-full blur-[1px]"
                />
              ))}
            </div>
          </div>
          
          <div className="flex items-end justify-center lg:justify-start gap-2 lg:gap-4 h-[45vh] lg:h-[80vh] w-full max-w-5xl overflow-visible">
            {[
              { src: "/imput_file_0.png", seed: "girl-coffee", alt: "Girl with coffee", char: "A" },
              { src: "/imput_file-1.png", seed: "reading", alt: "Person reading", char: "I" },
              { src: "/imput_file_2.jpg", seed: "walking", alt: "Person walking", char: "G" },
              { src: "/imput_file_3.jpg", seed: "running", alt: "Person running", char: "C" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -800 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 40,
                  damping: 10,
                  mass: 1,
                  delay: 0.5 + i * 0.2
                }}
                className={`relative group cursor-pointer flex-1 ${i === 3 ? "min-w-[120px] lg:min-w-[250px]" : "min-w-[60px] lg:min-w-[100px]"} ${i === 2 ? "-mr-4 lg:-mr-16 z-10" : ""}`}
                style={{ height: `${55 + i * 15}%` }}
              >
                {/* Artistic Letter */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5 + i * 0.2, type: "spring" }}
                  className={`absolute ${
                    i === 0 ? "-top-14 lg:-top-20" : 
                    i === 1 ? "-top-10 lg:-top-14" : 
                    i === 2 ? "-top-6 lg:-top-10" : 
                    "-top-2 lg:-top-4"
                  } left-1/2 -translate-x-1/2 pointer-events-none`}
                >
                  <span className="font-serif italic text-6xl lg:text-9xl text-black/5 select-none transition-colors group-hover:text-black/20">
                    {item.char}
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-serif text-2xl lg:text-4xl text-black group-hover:scale-125 transition-transform duration-500">
                      {item.char}
                    </span>
                  </div>
                </motion.div>

                <motion.img 
                  initial={{ filter: "grayscale(100%)" }}
                  animate={{ filter: "grayscale(0%)" }}
                  transition={{ duration: 1, delay: 2.5 + i * 0.2 }}
                  src={item.src} 
                  alt={item.alt}
                  className="absolute inset-0 w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('picsum')) {
                      target.src = `https://picsum.photos/seed/${item.seed}/600/800`;
                    }
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* 90-degree Guide Bar */}
        <ScrollButton targetId="about" />
      </section>

      {/* Section 2: Personal */}
      <section id="about" className="relative py-20 lg:py-32 px-6 lg:px-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32">
          {/* Left: Profile */}
          <div className="h-full flex flex-col">
            <div className="lg:sticky lg:top-32 flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="w-64 h-64 mb-12 relative flex-shrink-0">
                <div className="blob-avatar w-full h-full bg-black/5 relative z-10">
                  <img src="/imput4.jpg" className="w-full h-full object-cover opacity-90" referrerPolicy="no-referrer" />
                </div>
                <div className="absolute inset-0 border border-black/10 blob-avatar scale-110 -rotate-12" />
              </div>
              
              <h2 className="font-serif text-5xl mb-8">About <span className="italic">Liu Haonan</span></h2>
              <div className="text-black/60 leading-relaxed mb-12 font-light text-balance space-y-6">
                <p>
                  Hello! I'm Haonan or you can call me Ellen! I'm a visual culture researcher and AI artist currently pursuing my Master's at NUS, specializing in Japanese visual culture. My work explores the intersection of AI-generated imagery and manga/anime aesthetics — translating cultural theory into creative practice through comics, video, and exhibition-based storytelling.
                </p>
                <p>
                  新加坡国立大学日本视觉文化硕士在读，同时也是一名 AI 创作者。我的作品横跨漫画、生成视频与展览装置，探索 AI 如何重新定义视觉叙事与文化表达。
                </p>
              </div>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                {[
                  { name: "Dreamina / CapCut", color: "hover:border-purple-200" },
                  { name: "Visual Consistency", color: "hover:border-blue-200" },
                  { name: "Motion AIGC", color: "hover:border-green-200" },
                  { name: "Claude Coding", color: "hover:border-orange-200" },
                  { name: "Digital Curation", color: "hover:border-pink-200" }
                ].map(skill => (
                  <motion.div
                    key={skill.name}
                    whileHover={{ scale: 1.05 }}
                    className={`flex items-center gap-2 px-6 py-3 border border-black/10 rounded-full text-[10px] uppercase tracking-widest transition-all cursor-default ${skill.color} hover:bg-black hover:text-white`}
                  >
                    <Palette size={12} />
                    {skill.name}
                  </motion.div>
                ))}
              </div>

              </div>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-auto pt-20 lg:pt-0 w-[80%] max-w-[320px] self-center lg:self-start mix-blend-multiply"
            >
              <img 
                src="/p2.jpg" 
                alt="Detail sketch" 
                className="w-full h-auto" 
                referrerPolicy="no-referrer" 
              />
            </motion.div>
          </div>

          {/* Right: Timeline */}
          <div>
            <div className="mb-12">
              <h3 className="text-xs uppercase tracking-[0.5em] text-black/40 mb-4">Education</h3>
              <div className="w-12 h-px bg-black/20" />
            </div>
            
            <div className="space-y-6">
              {[
                {
                  school: "National University of Singapore",
                  date: "08/2025 - Present",
                  degree: "Master of Arts in Japanese Visual Culture",
                  chinese: "新加坡国立大学（硕士）\n日本视觉文化"
                },
                {
                  school: "Yanbian University",
                  date: "09/2020 - 06/2024",
                  degree: "Bachelor of Arts in Japanese Language and Literature (Minor in Law)",
                  chinese: "延边大学（学士）\n日语语言文学-法学（双学位）"
                }
              ].map((edu, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 border border-black/5 bg-black/[0.02] rounded-2xl hover:bg-black/5 transition-colors group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-serif text-xl group-hover:translate-x-1 transition-transform">{edu.school}</h4>
                    <span className="text-[10px] uppercase tracking-widest text-black/40">{edu.date}</span>
                  </div>
                  <p className="text-sm text-black/60 font-light mb-2">{edu.degree}</p>
                  <p className="text-xs text-black/40 font-light whitespace-pre-line">{edu.chinese}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-24 mb-12">
              <h3 className="text-xs uppercase tracking-[0.5em] text-black/40 mb-4">EXPERIENCES WITH AI</h3>
              <div className="w-12 h-px bg-black/20" />
            </div>
            
            <div className="space-y-6">
              {[
                {
                  title: "AI 视频创作 (Dreamina and Kling)",
                  img: "/video.jpg",
                  content: "擅长利用 Dreamina 精准构筑动态光影，将静止的视觉概念转化为兼具叙事张力与电影质感的短篇影像。"
                },
                {
                  title: "AI 漫画 (Nanobanana & Midjourney)",
                  img: "/manga.jpg",
                  content: "深度整合 Midjourney 的美学表现力与 Nanobanana 的角色一致性管理，构建出一套从分镜设计到工业化出图的 AI 漫画全链路方案。"
                },
                {
                  title: "交互展览设计 (Claude & Coding)",
                  img: "/exhibition.jpg",
                  content: "借助 Claude 的逻辑编程能力辅助前端开发，将传统的策展理念转化为具有交互深度与沉浸感的数字化数字展演空间。"
                }
              ].map((exp, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 border border-black/5 bg-black/[0.02] rounded-2xl flex gap-6 items-start hover:bg-black/5 transition-all group"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-black/5">
                    <img src={exp.img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg mb-2 group-hover:translate-x-1 transition-transform">{exp.title}</h4>
                    <p className="text-sm text-black/60 font-light leading-relaxed">{exp.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <ScrollButton targetId="works" />
      </section>

      {/* Section 3: Works (Curated Gallery) */}
      <section id="works" className="relative bg-black text-white py-20 lg:py-32 overflow-hidden">
        <TwinklingStars />
        
        <div className="relative z-10 px-6 lg:px-24 mb-16 lg:mb-24">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-xs uppercase tracking-[0.8em] text-white/40 mb-8 block"
          >
            Selected Works
          </motion.span>
          <div className="relative inline-block group">
            <h2 className="font-serif text-7xl md:text-9xl tracking-tighter">Portfolio.</h2>
            {/* Tooltip Signboard */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="hidden lg:flex items-center gap-3 absolute -top-12 -right-32 bg-white text-black px-4 py-2 rounded-xl shadow-2xl border-l-4 border-black group-hover:scale-105 transition-transform"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest whitespace-nowrap">点击图片进行详细观看</span>
              <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white rotate-45 -z-10" />
            </motion.div>
          </div>
        </div>

        <div className="flex flex-col gap-20 lg:gap-32 px-6 lg:px-24 max-w-7xl mx-auto relative z-10">
          {PROJECTS.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: "circOut" }}
              className={`flex flex-col ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-12 lg:gap-24 items-center`}
            >
              {/* Image Container */}
              <div 
                className="relative w-full lg:w-3/5 aspect-[4/3] overflow-hidden cursor-pointer group"
                onClick={() => setSelectedProject(project)}
              >
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-12">
                  <div className="flex items-center gap-4 text-xs uppercase tracking-widest">
                    <span>View Project</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <div className="w-full lg:w-2/5">
                <span className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-4 block">0{i + 1} / {project.category}</span>
                <h3 className="font-serif text-4xl md:text-5xl mb-8 leading-tight">{project.title}</h3>
                <p className="text-white/50 font-light leading-relaxed mb-12 text-balance">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-3">
                  {project.tags.map(tag => (
                    <span key={tag} className="px-4 py-2 border border-white/10 rounded-full text-[9px] uppercase tracking-widest text-white/60">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
        
        <ScrollButton targetId="contact" isDark />
      </section>

      {/* Section 4: Contact */}
      <section id="contact" className="py-20 lg:py-32 px-6 lg:px-24 text-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto flex flex-col items-center relative z-10"
        >
          <h2 className="font-hand text-[10vw] lg:text-8xl mb-16 lg:mb-24 tracking-tight text-center">
            Thanks for watching my AI world!
          </h2>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="bg-[#fdfbf7] p-8 lg:p-16 rounded-sm shadow-xl border border-black/5 mb-20 text-left relative overflow-hidden"
          >
            {/* Paper Texture/Fold Effect */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white via-white/50 to-transparent shadow-sm" />
            
            <p className="font-serif text-lg lg:text-2xl leading-relaxed text-black/80 mb-6 lg:mb-8 indent-8 italic">
              在这个人机协作的时代，AI 浪潮更迭迅速，但我认为 AI 并非创造力的替代品，而是深度参与视觉叙事与代码开发的“外脑”。在未来的前行中，我将继续在人的感性直觉与机器的理性运算之间，探寻最完美的协作平衡点。
            </p>
            <p className="font-serif text-lg lg:text-2xl leading-relaxed text-black/80 mb-6 lg:mb-8 italic">
              我的 AI 世界未完待续......
            </p>
            <p className="font-serif text-lg lg:text-2xl leading-relaxed text-black/80 italic text-right">
              感谢您的访问！
            </p>
          </motion.div>

          <div className="space-y-12">
            <p className="text-black/60 text-sm tracking-widest uppercase">
              如果您对我的作品有兴趣，下面是我的联系方式
            </p>
            
            <div>
              <h3 className="font-serif text-4xl md:text-6xl mb-8 tracking-tighter uppercase">
                LET’S CONNECT!
              </h3>
              <div className="flex flex-col gap-4 text-lg font-light">
                <a href="tel:18653638337" className="hover:text-black/40 transition-colors">电话：18653638337</a>
                <a href="mailto:1312940267@qq.com" className="hover:text-black/40 transition-colors">邮箱：1312940267@qq.com</a>
                <p className="text-black/30 text-[10px] uppercase tracking-widest mt-8">
                  （此网站设计内容均由Google AI Studio生成）
                </p>
              </div>
            </div>

          </div>
        </motion.div>

        {/* Small version of final.jpg in the bottom left corner */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="absolute bottom-12 left-12 w-32 md:w-48 h-auto rounded-xl overflow-hidden shadow-lg z-0 transition-opacity duration-500"
        >
          <img 
            src="/final.jpg" 
            alt="Mini Final Impression" 
            className="w-full h-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Small version of right.jpg in the bottom right corner */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="absolute bottom-12 right-12 w-32 md:w-48 h-auto rounded-xl overflow-hidden shadow-lg z-0 transition-opacity duration-500"
        >
          <img 
            src="/right.jpg" 
            alt="Mini Right Impression" 
            className="w-full h-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </section>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && !isDetailPage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 lg:p-12"
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setSelectedProject(null)} />
            <motion.div 
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="relative bg-white w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row"
            >
              <div className="lg:w-1/2 h-[40vh] lg:h-auto">
                <img src={selectedProject.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="lg:w-1/2 p-12 lg:p-20 flex flex-col justify-center">
                <button onClick={() => setSelectedProject(null)} className="absolute top-8 right-8 text-black/20 hover:text-black transition-colors">
                  <X size={24} />
                </button>
                <span className="text-[10px] uppercase tracking-[0.5em] text-black/40 mb-4 block">{selectedProject.category}</span>
                <h3 className="font-serif text-4xl lg:text-6xl mb-8">{selectedProject.title}</h3>
                <p className="text-black/60 leading-relaxed mb-12 font-light">{selectedProject.detailDescription || selectedProject.description}</p>
                <button 
                  onClick={() => setIsDetailPage(true)}
                  className="group flex items-center gap-4 text-xs uppercase tracking-[0.3em] font-medium"
                >
                  View Live Project
                  <div className="w-12 h-px bg-black/20 group-hover:w-20 transition-all" />
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Basic Cursor */}
      <BasicCursor />

      {/* Footer */}
      <footer className="py-12 px-12 border-t border-black/5 text-center text-[10px] uppercase tracking-[0.5em] text-black/20">
        © 2026 Ellen's AI World | Built with Passion
      </footer>
    </div>
  );
}
