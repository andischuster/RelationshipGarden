import { useState, useEffect } from 'react';
import { Heart, Sprout, Sun, Flower, Leaf, ShoppingCart, Shield, Star, Gift, TriangleAlert, Truck, Users, Mail, HelpCircle, Instagram, Clover } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    description: "Speak about issues you know you should",
    image: elephantCard,
    gradient: "from-deep-teal to-soft-tangerine",
    hasUnderline: true
  },
  {
    id: 2,
    title: "The Sunflower",
    description: "Reflect about how far you've come",
    image: sunflowerCard,
    gradient: "from-sunflower to-deep-teal",
    hasUnderline: true
  },
  {
    id: 3,
    title: "Early Bird",
    description: "Learn more about how you differ",
    image: foolCard,
    gradient: "from-soft-tangerine to-deep-teal",
    hasUnderline: true
  },
  {
    id: 4,
    title: "Magic Bean",
    description: "Leave something behind that grows",
    image: magicBeanCard,
    gradient: "from-deep-teal to-sunflower",
    hasUnderline: true
  }
];

export default function Home() {
  const [currentCard, setCurrentCard] = useState(0);
  const [isIntersecting, setIsIntersecting] = useState<{ [key: string]: boolean }>({});
  const [scrolled, setScrolled] = useState(false);

  // Removed auto-cycling - cards now change only on click

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
          setIsIntersecting(prev => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting
          }));
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('[id^="section-"]');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handlePurchase = () => {
    console.log('Purchase initiated for Growing Us card game');
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
            <Flower className="text-deep-teal mr-2 flex-shrink-0" />
            <h1 className="font-serif text-sm sm:text-lg md:text-xl font-bold text-deep-green whitespace-nowrap">Relationship Game</h1>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <button className="cta-button text-sm sm:text-base px-4 sm:px-8 py-2 sm:py-4" onClick={handlePurchase}>Play Now</button>
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
            {/* Card Stack Container */}
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
                        left: '-160px',
                        top: '-240px'
                      }}
                    >
                      <img
                        src={card.image}
                        alt={card.title}
                        className="card-stack-item rounded-2xl border-4 border-deep-black shadow-2xl transition-all duration-300"
                        style={{
                          width: '320px',
                          height: 'auto',
                          filter: isActive ? 'none' : 'brightness(0.85)',
                          opacity: isActive ? 1 : 0.9
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Carousel Navigation */}
            <div className="flex justify-center space-x-3 mb-4">
              {cardData.map((card, index) => (
                <button 
                  key={index}
                  onClick={() => setCurrentCard(index)}
                  className={`w-4 h-4 rounded-full border-2 border-deep-black transition-all duration-300 hover:scale-110 ${
                    index === currentCard ? 'bg-sunflower scale-110' : 'bg-deep-green/30 hover:bg-deep-green/50'
                  }`}
                  aria-label={`View ${card.title} card`}
                />
              ))}
            </div>
            
            {/* Card Description */}
            <div className="text-center max-w-md mx-auto px-4">
              <p className="text-lg sm:text-xl md:text-2xl text-deep-green/90 font-medium italic">
                {cardData[currentCard].hasUnderline ? (
                  <span className="squiggly-underline">{cardData[currentCard].description}</span>
                ) : (
                  cardData[currentCard].description
                )}
              </p>
            </div>
          </div>
          
          {/* Primary CTA */}
          <div className={`${isIntersecting['section-hero'] ? 'fade-in' : ''}`} style={{animationDelay: '0.6s'}}>
            <Button 
              onClick={handlePurchase}
              className="btn-primary text-deep-green font-semibold text-lg sm:text-xl px-8 sm:px-12 py-3 sm:py-4 rounded-full hover-lift"
            >
              Let's Grow Together – $25
            </Button>
            <p className="text-sm text-deep-green/70 mt-3">
              <Truck className="inline w-4 h-4 text-sunflower mr-2" />
              Free shipping on orders of 2+ games
            </p>
          </div>
        </div>
      </section>
      {/* Section Divider */}
      <div className="section-divider">
        <div className="section-divider-icon">
          <Flower className="w-6 h-6 text-deep-teal" />
        </div>
      </div>
      {/* How To Play Section */}
      <section id="section-howto" className="py-15 px-4 bg-gradient-to-b from-warm-white to-soft-tangerine/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className={`font-serif text-4xl md:text-5xl font-bold text-deep-green mb-5 ${isIntersecting['section-howto'] ? 'fade-in' : ''}`}>
              How To Play
            </h2>
            <p className={`text-lg text-deep-green/80 max-w-2xl mx-auto ${isIntersecting['section-howto'] ? 'fade-in' : ''}`}>
              Simple steps to nurture your relationship through playful conversation.
            </p>
          </div>
          
          <div className={`grid gap-6 max-w-4xl mx-auto ${isIntersecting['section-howto'] ? 'staggered-animation' : ''}`}>
            {/* Step 1 */}
            <div className={`flex items-start space-x-4 hover-lift bg-sunflower/5 p-6 rounded-2xl ${isIntersecting['section-howto'] ? 'fade-in' : ''}`}>
              <div className="flex-shrink-0 w-16 h-16 bg-sunflower rounded-full border-4 border-deep-black flex items-center justify-center">
                <Sprout className="w-8 h-8 text-deep-green" />
              </div>
              <div className="flex-grow">
                <h3 className="font-serif text-2xl font-bold text-deep-green mb-3">
                  <span className="font-serif text-2xl font-bold text-soft-tangerine mr-3">1</span>
                  Tend The Ground
                </h3>
                <p className="text-deep-green/80 text-lg">
                  Find a safe space where honesty can grow and set aside 20–30 minutes. Place the numbered rule cards openly and draw 5 playing cards each.
                </p>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className={`flex items-start space-x-4 hover-lift bg-soft-tangerine/8 p-6 rounded-2xl ${isIntersecting['section-howto'] ? 'fade-in' : ''}`}>
              <div className="flex-shrink-0 w-16 h-16 bg-sunflower rounded-full border-4 border-deep-black flex items-center justify-center">
                <Heart className="w-8 h-8 text-deep-green" />
              </div>
              <div className="flex-grow">
                <h3 className="font-serif text-2xl font-bold text-deep-green mb-3">
                  <span className="font-serif text-2xl font-bold text-soft-tangerine mr-3">2</span>
                  Cultivate Connection
                </h3>
                <p className="text-deep-green/80 text-lg">
                  Take turns drawing a card, reflect quietly, then share your heart. Let them know how it matters to you.
                </p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className={`flex items-start space-x-4 hover-lift bg-deep-teal/8 p-6 rounded-2xl ${isIntersecting['section-howto'] ? 'fade-in' : ''}`}>
              <div className="flex-shrink-0 w-16 h-16 bg-sunflower rounded-full border-4 border-deep-black flex items-center justify-center">
                <Sun className="w-8 h-8 text-deep-green" />
              </div>
              <div className="flex-grow">
                <h3 className="font-serif text-2xl font-bold text-deep-green mb-3">
                  <span className="font-serif text-2xl font-bold text-soft-tangerine mr-3">3</span>
                  Sunflower Speak
                </h3>
                <p className="text-deep-green/80 text-lg">
                  Use "I feel…" to shine light on your truth, not blame. Speak from the heart, and your partner will lean toward the warmth.
                </p>
              </div>
            </div>
            
            {/* Step 4 */}
            <div className={`flex items-start space-x-4 hover-lift bg-sunflower/8 p-6 rounded-2xl ${isIntersecting['section-howto'] ? 'fade-in' : ''}`}>
              <div className="flex-shrink-0 w-16 h-16 bg-sunflower rounded-full border-4 border-deep-black flex items-center justify-center">
                <Flower className="w-8 h-8 text-deep-green" />
              </div>
              <div className="flex-grow">
                <h3 className="font-serif text-2xl font-bold text-deep-green mb-3">
                  <span className="font-serif text-2xl font-bold text-soft-tangerine mr-3">4</span>
                  Let Love Bloom
                </h3>
                <p className="text-deep-green/80 text-lg">
                  End each conversation on a positive: love, laughter, a thank you. Validation grows safety, even without perfect agreement.
                </p>
              </div>
            </div>
            
            {/* Step 5 */}
            <div className={`flex items-start space-x-4 hover-lift bg-soft-tangerine/5 p-6 rounded-2xl ${isIntersecting['section-howto'] ? 'fade-in' : ''}`}>
              <div className="flex-shrink-0 w-16 h-16 bg-sunflower rounded-full border-4 border-deep-black flex items-center justify-center">
                <Leaf className="w-8 h-8 text-deep-green" />
              </div>
              <div className="flex-grow">
                <h3 className="font-serif text-2xl font-bold text-deep-green mb-3">
                  <span className="font-serif text-2xl font-bold text-soft-tangerine mr-3">5</span>
                  Plant a Promise
                </h3>
                <p className="text-deep-green/80 text-lg">
                  At the end of each session plant an intention. Write it, draw it, or say it aloud, and come back to see how it's blossomed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Section Divider */}
      <div className="section-divider">
        <div className="section-divider-icon">
          <Heart className="w-6 h-6 text-deep-teal" />
        </div>
      </div>
      {/* Pricing Section */}
      <section id="section-pricing" className="py-20 px-4 bg-gradient-to-b from-sunflower/10 to-warm-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left side - What's Included */}
            <div className={`${isIntersecting['section-pricing'] ? 'fade-in' : ''}`}>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-deep-green mb-4">
                What's Included
              </h2>
              
              {/* Squiggly underline */}
              <div className="w-64 h-2 mb-8">
                <svg width="256" height="8" viewBox="0 0 256 8" className="w-full">
                  <path d="M0,4 Q32,1 64,4 T128,4 T192,4 T256,4" stroke="#FFC700" strokeWidth="3" fill="none" strokeLinecap="round"/>
                </svg>
              </div>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-sunflower/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-6 h-6 bg-deep-teal rounded-sm"></div>
                  </div>
                  <p className="text-lg text-deep-green/80 leading-relaxed">
                    50 beautifully illustrated prompt cards
                  </p>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-sunflower/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-6 h-6 bg-deep-teal rounded-sm"></div>
                  </div>
                  <p className="text-lg text-deep-green/80 leading-relaxed">
                    5 instruction cards with gameplay rules
                  </p>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-sunflower/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-6 h-6 bg-deep-teal rounded-sm"></div>
                  </div>
                  <p className="text-lg text-deep-green/80 leading-relaxed">
                    3 bonus "Magic Bean" cards for special moments
                  </p>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-sunflower/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-6 h-6 bg-deep-teal rounded-sm"></div>
                  </div>
                  <p className="text-lg text-deep-green/80 leading-relaxed">
                    A custom-designed box with magnetic closure
                  </p>
                </div>
              </div>
              
              <div className="mb-8">
                <div className="text-4xl font-serif font-bold text-deep-green mb-2">$25 per deck</div>
                <p className="text-deep-green/70 text-lg mb-6">
                  Free shipping on orders of two or more games
                </p>
                
                <button 
                  onClick={handlePurchase}
                  className="cta-button flex items-center justify-center"
                >
                  <Gift className="w-5 h-5 mr-2" />
                  Buy Now
                </button>
              </div>
            </div>
            
            {/* Right side - Card visual */}
            <div className={`flex justify-center ${isIntersecting['section-pricing'] ? 'fade-in' : ''}`}>
              <div className="relative">
                <img 
                  src={magicBeanCard} 
                  alt="Magic Bean card example" 
                  style={{
                    width: '320px',
                    height: 'auto'
                  }}
                  className="rounded-2xl border-4 border-deep-black shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Section Divider */}
      <div className="section-divider">
        <div className="section-divider-icon">
          <Sprout className="w-6 h-6 text-deep-teal" />
        </div>
      </div>
      {/* Testimonials Section */}
      <section id="section-testimonials" className="py-20 px-4 bg-gradient-to-b from-deep-teal/5 to-warm-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className={`font-serif text-4xl md:text-5xl font-bold text-deep-green mb-6 ${isIntersecting['section-testimonials'] ? 'fade-in' : ''}`}>
              What Couples Are Saying
            </h2>
          </div>
          
          <div className={`grid md:grid-cols-3 gap-8 ${isIntersecting['section-testimonials'] ? 'staggered-animation' : ''}`}>
            {/* Testimonial 1 */}
            <div className={`bg-warm-white p-8 rounded-3xl border-4 border-deep-black shadow-lg hover-lift ${isIntersecting['section-testimonials'] ? 'fade-in' : ''}`}>
              <p className="text-deep-green/80 text-lg mb-6 italic">
                "My partner and I are both software engineers, and we spend all day problem-solving. This game helped us switch gears and connect on a totally different level. It's like a playful team retrospective."
              </p>
              <div className="flex justify-center">
                <div className="flex text-sunflower">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className={`bg-warm-white p-8 rounded-3xl border-4 border-deep-black shadow-lg hover-lift ${isIntersecting['section-testimonials'] ? 'fade-in' : ''}`}>
              <p className="text-deep-green/80 text-lg mb-6 italic">
                "I was skeptical about a 'relationship game,' but this is different. It's not awkward at all—it's just really well-designed and the prompts led to conversations we didn't even know we needed to have."
              </p>
              <div className="flex justify-center">
                <div className="flex text-sunflower">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className={`bg-warm-white p-8 rounded-3xl border-4 border-deep-black shadow-lg hover-lift ${isIntersecting['section-testimonials'] ? 'fade-in' : ''}`}>
              <p className="text-deep-green/80 text-lg mb-6 italic">
                "It's like relationship therapy, but in a cozy hoodie. A retro for the heart."
              </p>
              <div className="flex justify-center">
                <div className="flex text-sunflower">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Final CTA Section */}
      <section id="section-final-cta" className="py-20 px-4 bg-gradient-to-b from-warm-white to-sunflower/20">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className={`font-serif text-4xl md:text-5xl font-bold text-deep-green mb-6 ${isIntersecting['section-final-cta'] ? 'fade-in' : ''}`}>
            Your Relationship Garden Awaits
          </h2>
          <p className={`text-xl text-deep-green/80 mb-12 max-w-2xl mx-auto ${isIntersecting['section-final-cta'] ? 'fade-in' : ''}`}>
            Don't let meaningful conversations wither. Start growing deeper connections today.
          </p>
          
          <div className={`bg-warm-white rounded-3xl border-4 border-deep-black p-8 shadow-lg hover-lift max-w-lg mx-auto ${isIntersecting['section-final-cta'] ? 'fade-in' : ''}`}>
            <div className="mb-6">
              <span className="text-4xl font-serif font-bold text-deep-green">$25</span>
              <div className="text-deep-green/80 mt-1">Free shipping on 2+ games</div>
            </div>
            
            <Button 
              onClick={handlePurchase}
              className="btn-primary text-deep-green font-semibold text-xl px-12 py-4 rounded-full hover-lift w-full mb-4"
            >
              <Heart className="w-5 h-5 mr-2" />
              Let's Grow Together
            </Button>
            
            <p className="text-deep-green/70 text-sm">
              <Shield className="inline w-4 h-4 text-deep-teal mr-2" />
              30-day love-it-or-return guarantee
            </p>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="py-12 px-4 bg-deep-green text-warm-white">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-8">
            <h3 className="font-serif text-3xl font-bold mb-4">Growing Us</h3>
            <p className="text-warm-white/80">
              Every connection needs care, space, and warmth.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 mb-8">
            <a href="#" className="text-warm-white/80 hover:text-sunflower transition-colors flex items-center">
              <Instagram className="w-4 h-4 mr-2" />
              Follow Our Journey
            </a>
            <a href="#" className="text-warm-white/80 hover:text-sunflower transition-colors flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              Contact Us
            </a>
            <a href="#" className="text-warm-white/80 hover:text-sunflower transition-colors flex items-center">
              <HelpCircle className="w-4 h-4 mr-2" />
              FAQ
            </a>
          </div>
          
          <div className="text-warm-white/60 text-sm">
            © 2024 Growing Us. Made with love for growing relationships.
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
