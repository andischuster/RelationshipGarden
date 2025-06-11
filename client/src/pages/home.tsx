import { useState, useEffect } from 'react';
import { Heart, Mail, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { insertPreorderSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import Blob from '@/components/Blob';

// Import card images
import elephantCard from "@assets/Elephant in the Room_1749555023557.png";
import sunflowerCard from "@assets/Late Bloomer_1749555037913.png";
import lemonsCard from "@assets/Life's Lemons_1749555039716.png";
import foolCard from "@assets/Early Bird_1749555043033.png";
import growingUsCard from "@assets/Background Deck Card_1749555051172.png";
import magicBeanCard from "@assets/Magic Bean_1749555057354.png";

interface CardData {
  id: number;
  title: string;
  description: string;
  image: string;
  gradient: string;
  hasUnderline?: boolean;
}

const cardData: CardData[] = [
  {
    id: 0,
    title: "Better Half",
    description: "Learn how you complement each other",
    image: growingUsCard,
    gradient: "from-soft-tangerine to-sunflower",
    hasUnderline: true
  },
  {
    id: 1,
    title: "Elephant in the Room",
    description: "Playfully speak about friction",
    image: elephantCard,
    gradient: "from-deep-teal to-soft-tangerine",
    hasUnderline: true
  },
  {
    id: 2,
    title: "Late Bloomer",
    description: "What haven't you unlocked yet?",
    image: sunflowerCard,
    gradient: "from-sunflower to-deep-teal",
    hasUnderline: true
  },
  {
    id: 3,
    title: "Life's Lemons",
    description: "When challenges become sweet",
    image: lemonsCard,
    gradient: "from-deep-green to-sunflower"
  },
  {
    id: 4,
    title: "Early Bird",
    description: "What gets you going first?",
    image: foolCard,
    gradient: "from-soft-tangerine to-deep-green"
  },
  {
    id: 5,
    title: "Magic Bean",
    description: "What would you grow together?",
    image: magicBeanCard,
    gradient: "from-deep-teal to-deep-green"
  }
];

export default function Home() {
  const [currentCard, setCurrentCard] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(insertPreorderSchema)
  });

  const preorderMutation = useMutation({
    mutationFn: (data: { email: string }) => apiRequest("/api/preorders", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've been added to our waitlist.",
      });
      reset();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: { email: string }) => {
    preorderMutation.mutate(data);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCard((prev) => (prev + 1) % cardData.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          setIsIntersecting(prev => ({
            ...prev,
            [id]: entry.isIntersecting
          }));
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('[id^="section-"]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  const handlePurchase = () => {
    setIsDialogOpen(true);
  };

  return (
    <div className="bg-warm-white text-deep-green font-sans leading-relaxed relative overflow-hidden">
      {/* Background blobs */}
      <Blob color="#FFC700" className="top-0 -left-20 w-[600px] h-[600px] animate-float" />
      <Blob color="#F9A870" className="-bottom-40 -right-20 w-[550px] h-[550px] animate-float delay-1000" />
      <Blob color="#008080" className="bottom-[5%] -left-20 w-[500px] h-[500px] animate-float delay-2000" />
      <Blob color="#2F4858" className="top-1/3 -right-28 w-[400px] h-[400px] animate-float delay-3000" />
      <Blob color="#F9A870" className="top-2/3 left-1/4 w-[300px] h-[300px] animate-float delay-4000" />
      
      <div className="container mx-auto px-4 py-12 relative">
        {/* Header/Navigation */}
        <header className={`flex justify-between items-center sticky top-0 z-50 py-3 px-4 sm:py-4 sm:px-8 transition-all duration-300 ${scrolled ? 'bg-warm-white/90 backdrop-blur-md shadow-md rounded-full' : ''}`}>
          <div className="flex items-center min-w-0">
            <Heart className="text-deep-teal mr-2 flex-shrink-0" />
            <h1 className="font-serif text-sm sm:text-lg md:text-xl font-bold text-deep-green whitespace-nowrap">Growing Us</h1>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <button className="cta-button sm:text-base px-4 sm:px-8 py-2 sm:py-4 text-[16px]" onClick={handlePurchase}>Join Waitlist</button>
          </div>
        </header>

        {/* Hero Section */}
        <section id="section-hero" className="min-h-screen flex flex-col justify-center items-center px-2 sm:px-4 py-8 pt-20 sm:pt-24 relative overflow-hidden">
          <div className="mx-auto text-center w-full">
            
            {/* Main Title */}
            <h1 className={`font-serif text-5xl sm:text-6xl md:text-8xl font-bold text-deep-green mb-5 whitespace-nowrap ${isIntersecting['section-hero'] ? 'fade-in' : ''}`}>
              Growing Us
            </h1>
            
            {/* Tagline */}
            <p className={`text-base sm:text-lg md:text-xl text-deep-green/70 mb-6 sm:mb-9 max-w-4xl mx-auto leading-relaxed px-4 ${isIntersecting['section-hero'] ? 'fade-in' : ''}`} style={{animationDelay: '0.2s'}}>
              Every connection needs care, space, and warmth. These prompts help you nurture your relationship garden.
            </p>
            
            {/* Interactive Card Stack */}
            <div className={`mb-5 ${isIntersecting['section-hero'] ? 'fade-in staggered-animation' : ''}`}>
              <div 
                className="flex justify-center items-center cursor-pointer"
                onClick={() => setCurrentCard((currentCard + 1) % cardData.length)}
                style={{ 
                  height: '500px',
                  width: '100%',
                  padding: '20px'
                }}
              >
                <div className="relative">
                  {cardData.map((card, index) => {
                    const offset = index - currentCard;
                    const isActive = index === currentCard;
                    const isVisible = Math.abs(offset) <= 2;
                    
                    if (!isVisible) return null;
                    
                    return (
                      <div
                        key={card.id}
                        className="absolute transition-all duration-1000 ease-out"
                        style={{
                          transform: `
                            translateX(${offset * 8}px)
                            translateY(${offset * 4}px)
                            rotate(${offset * 3}deg)
                            scale(${isActive ? 1 : 0.95})
                          `,
                          zIndex: isActive ? 10 : 10 - Math.abs(offset),
                          left: '-144px',
                          top: '-216px'
                        }}
                      >
                        <div
                          className="card-stack-item rounded-2xl border-4 border-deep-black shadow-2xl transition-all duration-300"
                          style={{
                            width: '288px',
                            height: '432px',
                            backgroundImage: `url(${card.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            filter: isActive ? 'none' : 'brightness(0.85)',
                            opacity: isActive ? 1 : 0.9
                          }}
                          role="img"
                          aria-label={card.title}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Card Description */}
              <div className="text-center max-w-md mx-auto px-4">
                <p className="text-lg sm:text-xl md:text-2xl text-deep-green/90 font-medium italic">
                  {cardData[currentCard].hasUnderline ? (
                    <span className="squiggly-underline mt-[16px] mb-[16px]">{cardData[currentCard].description}</span>
                  ) : (
                    cardData[currentCard].description
                  )}
                </p>
              </div>
            </div>
            
            {/* CTA Section */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 ${isIntersecting['section-hero'] ? 'fade-in' : ''}`} style={{animationDelay: '0.4s'}}>
              <button onClick={handlePurchase} className="cta-button text-lg px-8 py-4">
                Join Our Waitlist
              </button>
            </div>
            
            {/* Feature highlights */}
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 mt-8 ${isIntersecting['section-hero'] ? 'fade-in' : ''}`} style={{animationDelay: '0.6s'}}>
              <div className="flex items-center justify-center sm:justify-start text-deep-green/80">
                <Mail className="text-deep-teal mr-1 flex-shrink-0" size={16} />
                <span className="text-sm">Free shipping</span>
              </div>
              <div className="flex items-center justify-center text-deep-green/80">
                <Heart className="text-deep-teal mr-1 flex-shrink-0" size={16} />
                <span className="text-sm">Designed for couples</span>
              </div>
              <div className="flex items-center justify-center sm:justify-end text-deep-green/80">
                <Heart className="text-deep-teal mr-1 flex-shrink-0" size={16} />
                <span className="text-sm">Thoughtfully crafted</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="section-features" className="py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className={`font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-deep-green text-center mb-12 ${isIntersecting['section-features'] ? 'fade-in' : ''}`}>
              Cultivate Your Connection
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
              <div className={`text-center ${isIntersecting['section-features'] ? 'fade-in' : ''}`} style={{animationDelay: '0.1s'}}>
                <div className="bg-gradient-to-br from-deep-teal to-sunflower w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Heart className="text-deep-teal mr-2 flex-shrink-0" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-deep-green mb-4">Deepen Understanding</h3>
                <p className="text-deep-green/70 leading-relaxed">
                  Thoughtfully crafted prompts help you discover new dimensions of your relationship and understand each other on a deeper level.
                </p>
              </div>
              
              <div className={`text-center ${isIntersecting['section-features'] ? 'fade-in' : ''}`} style={{animationDelay: '0.2s'}}>
                <div className="bg-gradient-to-br from-sunflower to-soft-tangerine w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Heart className="text-deep-teal mr-2 flex-shrink-0" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-deep-green mb-4">Create Sacred Moments</h3>
                <p className="text-deep-green/70 leading-relaxed">
                  Set aside distractions and create intentional spaces for meaningful conversations that strengthen your bond.
                </p>
              </div>
              
              <div className={`text-center ${isIntersecting['section-features'] ? 'fade-in' : ''}`} style={{animationDelay: '0.3s'}}>
                <div className="bg-gradient-to-br from-soft-tangerine to-deep-green w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Heart className="text-deep-teal mr-2 flex-shrink-0" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-deep-green mb-4">Grow Together</h3>
                <p className="text-deep-green/70 leading-relaxed">
                  Navigate life's seasons together with prompts designed to help you evolve as individuals and as a couple.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Email Signup Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="text-deep-teal" size={24} />
              Join Our Waitlist
            </DialogTitle>
            <DialogDescription>
              Be the first to know when Growing Us becomes available. We'll send you updates and early access.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                <X className="mr-2" size={16} />
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={preorderMutation.isPending}
                className="flex-1 bg-deep-teal hover:bg-deep-teal/90"
              >
                {preorderMutation.isPending ? (
                  "Adding..."
                ) : (
                  <>
                    <Check className="mr-2" size={16} />
                    Join Waitlist
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}