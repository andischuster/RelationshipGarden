import { useState, useEffect } from 'react';
import { Heart, Sprout, Sun, Flower, Leaf, ShoppingCart, Shield, Star, Gift, TriangleAlert, Truck, Users, Mail, HelpCircle, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
}

const cardData: CardData[] = [
  {
    id: 0,
    title: "Better Half",
    description: "Speak about how you complement each other",
    image: growingUsCard,
    gradient: "from-soft-tangerine to-sunflower"
  },
  {
    id: 1,
    title: "Elephant in the Room",
    description: "Speak about issues you know you should",
    image: elephantCard,
    gradient: "from-deep-teal to-soft-tangerine"
  },
  {
    id: 2,
    title: "The Sunflower",
    description: "Reflect about how far you've come",
    image: sunflowerCard,
    gradient: "from-sunflower to-deep-teal"
  },
  {
    id: 3,
    title: "Early Bird",
    description: "Learn more about how you differ",
    image: foolCard,
    gradient: "from-soft-tangerine to-deep-teal"
  },
  {
    id: 4,
    title: "Magic Bean",
    description: "Leave something behind that grows over time",
    image: magicBeanCard,
    gradient: "from-deep-teal to-sunflower"
  }
];

export default function Home() {
  const [currentCard, setCurrentCard] = useState(0);
  const [isIntersecting, setIsIntersecting] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCard((prev) => (prev + 1) % cardData.length);
    }, 4000);

    return () => clearInterval(interval);
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
    <div className="bg-warm-white text-deep-green font-sans leading-relaxed">
      {/* Hero Section */}
      <section id="section-hero" className="min-h-screen flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl text-center">
          
          {/* Hero Cards Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 -z-10">
            <div className="grid grid-cols-3 gap-8 transform rotate-12 scale-150">
              <div className="w-32 h-48 bg-sunflower rounded-lg border-4 border-deep-black"></div>
              <div className="w-32 h-48 bg-soft-tangerine rounded-lg border-4 border-deep-black"></div>
              <div className="w-32 h-48 bg-deep-teal rounded-lg border-4 border-deep-black"></div>
            </div>
          </div>
          
          {/* Main Title */}
          <h1 className={`font-serif text-5xl md:text-7xl font-bold text-deep-green mb-4 ${isIntersecting['section-hero'] ? 'fade-in' : ''}`}>
            Growing Us
          </h1>
          
          {/* Tagline */}
          <p className={`text-xl md:text-2xl text-deep-green/80 mb-8 max-w-3xl mx-auto ${isIntersecting['section-hero'] ? 'fade-in' : ''}`} style={{animationDelay: '0.2s'}}>
            Every connection needs care, space, and warmth. These prompts help you nurture your relationship garden.
          </p>
          
          {/* Interactive Card Carousel */}
          <div className={`mb-12 ${isIntersecting['section-hero'] ? 'fade-in staggered-animation' : ''}`}>
            {/* Stacked Card Carousel */}
            <div className="relative mb-8 flex justify-center">
              <div className="relative w-96 h-[500px] sm:w-[500px] sm:h-[600px] md:w-[600px] md:h-[700px]">
                {cardData.map((card, index) => {
                  const isSelected = index === currentCard;
                  const stackOffset = (index - currentCard) * 8;
                  const rotationOffset = (index - currentCard) * 3;
                  const zIndex = isSelected ? 50 : 40 - Math.abs(index - currentCard);
                  
                  return (
                    <div 
                      key={card.id}
                      onClick={() => setCurrentCard(index)}
                      className="absolute cursor-pointer transition-all duration-500"
                      style={{ 
                        left: '50%',
                        top: '50%',
                        transform: `
                          translate(-50%, -50%) 
                          translateX(${stackOffset}px) 
                          translateY(${stackOffset * 0.5}px)
                          rotate(${isSelected ? 0 : rotationOffset}deg) 
                          scale(${isSelected ? 1.1 : 1})
                        `,
                        zIndex: zIndex,
                        transformOrigin: 'center center'
                      }}
                    >
                      <div className="card-wobble-container">
                        <img 
                          src={card.image} 
                          alt={`${card.title} card`} 
                          className="carousel-card rounded-2xl object-cover border-4 border-deep-black transition-all duration-300"
                          style={{
                            boxShadow: isSelected 
                              ? '10px 10px 0px 0px rgba(44, 82, 52, 1)' 
                              : '6px 6px 0px 0px rgba(44, 82, 52, 0.7)',
                            filter: isSelected ? 'none' : 'brightness(0.8)'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Card Description */}
            <div className="text-center max-w-md mx-auto mb-8">
              <p className="text-xl md:text-2xl text-deep-green/90 font-medium italic">
                "{cardData[currentCard].description}"
              </p>
            </div>
            
            {/* Carousel Navigation */}
            <div className="flex justify-center space-x-3">
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
          </div>
          
          {/* Primary CTA */}
          <div className={`${isIntersecting['section-hero'] ? 'fade-in' : ''}`} style={{animationDelay: '0.6s'}}>
            <Button 
              onClick={handlePurchase}
              className="btn-primary text-deep-green font-semibold text-xl px-12 py-4 rounded-full hover-lift"
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
      
      {/* How To Play Section */}
      <section id="section-howto" className="py-20 px-4 bg-warm-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className={`font-serif text-4xl md:text-5xl font-bold text-deep-green mb-6 ${isIntersecting['section-howto'] ? 'fade-in' : ''}`}>
              How To Play
            </h2>
            <p className={`text-lg text-deep-green/80 max-w-2xl mx-auto ${isIntersecting['section-howto'] ? 'fade-in' : ''}`}>
              Simple steps to nurture your relationship through playful conversation.
            </p>
          </div>
          
          <div className={`grid gap-8 max-w-4xl mx-auto ${isIntersecting['section-howto'] ? 'staggered-animation' : ''}`}>
            {/* Step 1 */}
            <div className={`flex items-start space-x-4 hover-lift ${isIntersecting['section-howto'] ? 'fade-in' : ''}`}>
              <div className="flex-shrink-0 w-16 h-16 bg-sunflower rounded-full border-4 border-deep-black flex items-center justify-center">
                <span className="font-serif text-2xl font-bold text-deep-green">1</span>
              </div>
              <div className="flex-grow">
                <h3 className="font-serif text-2xl font-bold text-deep-green mb-3">
                  <Sprout className="inline w-6 h-6 text-soft-tangerine mr-3" />
                  Tend The Ground
                </h3>
                <p className="text-deep-green/80 text-lg">
                  Find a safe space where honesty can grow and set aside 20–30 minutes. Place the numbered rule cards openly and draw 5 playing cards each.
                </p>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className={`flex items-start space-x-4 hover-lift ${isIntersecting['section-howto'] ? 'fade-in' : ''}`}>
              <div className="flex-shrink-0 w-16 h-16 bg-soft-tangerine rounded-full border-4 border-deep-black flex items-center justify-center">
                <span className="font-serif text-2xl font-bold text-deep-green">2</span>
              </div>
              <div className="flex-grow">
                <h3 className="font-serif text-2xl font-bold text-deep-green mb-3">
                  <Heart className="inline w-6 h-6 text-sunflower mr-3" />
                  Cultivate Connection
                </h3>
                <p className="text-deep-green/80 text-lg">
                  Take turns drawing a card, reflect quietly, then share your heart. Let them know how it matters to you.
                </p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className={`flex items-start space-x-4 hover-lift ${isIntersecting['section-howto'] ? 'fade-in' : ''}`}>
              <div className="flex-shrink-0 w-16 h-16 bg-deep-teal rounded-full border-4 border-deep-black flex items-center justify-center">
                <span className="font-serif text-2xl font-bold text-warm-white">3</span>
              </div>
              <div className="flex-grow">
                <h3 className="font-serif text-2xl font-bold text-deep-green mb-3">
                  <Sun className="inline w-6 h-6 text-sunflower mr-3" />
                  Sunflower Speak
                </h3>
                <p className="text-deep-green/80 text-lg">
                  Use "I feel…" to shine light on your truth, not blame. Speak from the heart, and your partner will lean toward the warmth.
                </p>
              </div>
            </div>
            
            {/* Step 4 */}
            <div className={`flex items-start space-x-4 hover-lift ${isIntersecting['section-howto'] ? 'fade-in' : ''}`}>
              <div className="flex-shrink-0 w-16 h-16 bg-sunflower rounded-full border-4 border-deep-black flex items-center justify-center">
                <span className="font-serif text-2xl font-bold text-deep-green">4</span>
              </div>
              <div className="flex-grow">
                <h3 className="font-serif text-2xl font-bold text-deep-green mb-3">
                  <Flower className="inline w-6 h-6 text-soft-tangerine mr-3" />
                  Let Love Bloom
                </h3>
                <p className="text-deep-green/80 text-lg">
                  End each conversation on a positive: love, laughter, a thank you. Validation grows safety, even without perfect agreement.
                </p>
              </div>
            </div>
            
            {/* Step 5 */}
            <div className={`flex items-start space-x-4 hover-lift ${isIntersecting['section-howto'] ? 'fade-in' : ''}`}>
              <div className="flex-shrink-0 w-16 h-16 bg-soft-tangerine rounded-full border-4 border-deep-black flex items-center justify-center">
                <span className="font-serif text-2xl font-bold text-deep-green">5</span>
              </div>
              <div className="flex-grow">
                <h3 className="font-serif text-2xl font-bold text-deep-green mb-3">
                  <Leaf className="inline w-6 h-6 text-deep-teal mr-3" />
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
      
      {/* Pricing Section */}
      <section id="section-pricing" className="py-20 px-4 bg-gradient-to-b from-sunflower/10 to-warm-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className={`font-serif text-4xl md:text-5xl font-bold text-deep-green mb-8 ${isIntersecting['section-pricing'] ? 'fade-in' : ''}`}>
            Ready to Grow Together?
          </h2>
          
          <div className={`bg-warm-white rounded-3xl border-4 border-deep-black p-8 md:p-12 shadow-lg hover-lift max-w-2xl mx-auto ${isIntersecting['section-pricing'] ? 'fade-in' : ''}`}>
            <div className="mb-8">
              <span className="text-6xl font-serif font-bold text-deep-green">$25</span>
              <div className="text-lg text-deep-green/80 mt-2">
                50 beautifully illustrated prompt cards
              </div>
            </div>
            
            <div className="bg-sunflower/20 rounded-2xl p-6 mb-8 border-2 border-sunflower">
              <h3 className="font-serif text-2xl font-bold text-deep-green mb-2">
                <Gift className="inline w-6 h-6 text-sunflower mr-2" />
                Special Offer
              </h3>
              <p className="text-deep-green/80 text-lg">
                Free shipping on orders of 2+ games
              </p>
            </div>
            
            <div className="mb-8">
              <p className="text-deep-green/70 text-sm mb-4">
                <TriangleAlert className="inline w-4 h-4 text-soft-tangerine mr-2" />
                Limited first print run available!
              </p>
              <Button 
                onClick={handlePurchase}
                className="btn-primary text-deep-green font-semibold text-xl px-12 py-4 rounded-full hover-lift w-full md:w-auto"
              >
                Let's Grow Together – Buy Now
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section id="section-testimonials" className="py-20 px-4 bg-warm-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className={`font-serif text-4xl md:text-5xl font-bold text-deep-green mb-6 ${isIntersecting['section-testimonials'] ? 'fade-in' : ''}`}>
              What Couples Are Saying
            </h2>
          </div>
          
          <div className={`grid md:grid-cols-3 gap-8 ${isIntersecting['section-testimonials'] ? 'staggered-animation' : ''}`}>
            {/* Testimonial 1 */}
            <div className={`bg-warm-white p-8 rounded-3xl border-4 border-deep-black shadow-lg hover-lift ${isIntersecting['section-testimonials'] ? 'fade-in' : ''}`}>
              <div className="flex items-center mb-6">
                <div className="flex text-sunflower">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-deep-green/80 text-lg mb-6 italic">
                "My partner and I are both software engineers, and we spend all day problem-solving. This game helped us switch gears and connect on a totally different level. It's like a playful team retrospective."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-soft-tangerine rounded-full border-2 border-deep-black flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-deep-green" />
                </div>
                <div>
                  <div className="font-semibold text-deep-green">Alex & Jordan</div>
                  <div className="text-deep-green/70 text-sm">Software Engineers</div>
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className={`bg-warm-white p-8 rounded-3xl border-4 border-deep-black shadow-lg hover-lift ${isIntersecting['section-testimonials'] ? 'fade-in' : ''}`}>
              <div className="flex items-center mb-6">
                <div className="flex text-sunflower">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-deep-green/80 text-lg mb-6 italic">
                "I was skeptical about a 'relationship game,' but this is different. It's not awkward at all—it's just really well-designed and the prompts led to conversations we didn't even know we needed to have."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-deep-teal rounded-full border-2 border-deep-black flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-warm-white" />
                </div>
                <div>
                  <div className="font-semibold text-deep-green">Sam & Riley</div>
                  <div className="text-deep-green/70 text-sm">Creative Professionals</div>
                </div>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className={`bg-warm-white p-8 rounded-3xl border-4 border-deep-black shadow-lg hover-lift ${isIntersecting['section-testimonials'] ? 'fade-in' : ''}`}>
              <div className="flex items-center mb-6">
                <div className="flex text-sunflower">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-deep-green/80 text-lg mb-6 italic">
                "It's like relationship therapy, but in a cozy hoodie. A retro for the heart."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-sunflower rounded-full border-2 border-deep-black flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-deep-green" />
                </div>
                <div>
                  <div className="font-semibold text-deep-green">Casey & Morgan</div>
                  <div className="text-deep-green/70 text-sm">Design & Tech</div>
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
  );
}
