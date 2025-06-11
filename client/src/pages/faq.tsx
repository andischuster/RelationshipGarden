import { Link } from "wouter";
import { ChevronLeft, ChevronDown, ChevronRight, Flower, Heart } from "lucide-react";
import { useState } from "react";
import Blob from "@/components/Blob";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is Growing Us?",
    answer: "Growing Us is a relationship card game designed to help couples deepen their connection through meaningful conversations. Each card contains thoughtfully crafted questions that encourage vulnerability, understanding, and intimacy."
  },
  {
    question: "How many cards are included in the game?",
    answer: "The complete Growing Us game includes 150 cards divided into different categories: Getting to Know You, Dreams & Aspirations, Past & Present, and Deep Connection cards."
  },
  {
    question: "Is this suitable for all relationship stages?",
    answer: "Yes! Growing Us is designed for couples at any stage of their relationship - from newly dating to married for decades. The cards are organized by depth level, so you can choose questions that feel comfortable for your current relationship stage."
  },
  {
    question: "How do we play the game?",
    answer: "Simply shuffle the deck and take turns drawing cards. Read the question aloud and both partners answer. There's no winning or losing - the goal is connection and understanding. You can play for 15 minutes or hours, depending on your preference."
  },
  {
    question: "What makes Growing Us different from other relationship games?",
    answer: "Our questions are specifically designed by relationship experts to promote emotional intimacy and genuine connection. We focus on building understanding rather than just entertainment, with questions that help you learn new things about each other even after years together."
  },
  {
    question: "When will the game be available for purchase?",
    answer: "We're currently in the final stages of production and expect to launch in early 2025. Join our waitlist to be notified as soon as pre-orders are available and to receive exclusive early-bird pricing."
  },
  {
    question: "What will the game cost?",
    answer: "The complete Growing Us card game will be priced at $29.99. Waitlist members will receive a special early-bird discount of 20% off the retail price."
  },
  {
    question: "Will there be digital versions available?",
    answer: "Currently, we're focused on the physical card game experience, as we believe the tactile nature of drawing cards together enhances the intimacy of the experience. However, we may explore digital options in the future based on customer feedback."
  },
  {
    question: "Can we play this game with friends or in groups?",
    answer: "Growing Us is specifically designed for couples and focuses on intimate, personal questions that are best shared between two people. For group settings, the questions might be too personal or create uncomfortable situations."
  },
  {
    question: "Do you ship internationally?",
    answer: "We plan to start with shipping within the United States and will expand to international shipping based on demand. International customers can still join our waitlist to stay updated on availability in their region."
  }
];

function FAQAccordion({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-4 border-deep-black rounded-3xl mb-6 overflow-hidden shadow-lg hover-lift">
      <button
        className="w-full px-6 py-6 text-left bg-warm-white hover:bg-sunflower/20 transition-colors duration-200 flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-deep-green pr-4 text-lg">{item.question}</span>
        {isOpen ? (
          <ChevronDown className="h-6 w-6 text-deep-teal flex-shrink-0" />
        ) : (
          <ChevronRight className="h-6 w-6 text-deep-teal flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 py-6 bg-sunflower/10 border-t-4 border-deep-black">
          <p className="text-deep-green/80 leading-relaxed">{item.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="bg-warm-white text-deep-green font-sans leading-relaxed relative overflow-hidden min-h-screen">
      {/* Background blobs */}
      <Blob color="#FFC700" className="top-0 -left-20 w-[600px] h-[600px] animate-float" />
      <Blob color="#F9A870" className="-bottom-40 -right-20 w-[550px] h-[550px] animate-float delay-1000" />
      <Blob color="#008080" className="bottom-[5%] -left-20 w-[500px] h-[500px] animate-float delay-2000" />
      <Blob color="#2F4858" className="top-1/3 -right-28 w-[400px] h-[400px] animate-float delay-3000" />
      <Blob color="#F9A870" className="top-2/3 left-1/4 w-[300px] h-[300px] animate-float delay-4000" />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl relative">
        {/* Header with back button */}
        <div className="mb-12">
          <Link 
            href="/" 
            className="inline-flex items-center text-deep-teal hover:text-deep-green transition-colors duration-200 mb-8 font-medium"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Home
          </Link>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Flower className="text-deep-teal mr-3 h-8 w-8" />
              <h1 className="font-serif text-4xl md:text-6xl font-bold text-deep-green">
                Frequently Asked Questions
              </h1>
            </div>
            <p className="text-xl text-deep-green/80 max-w-2xl mx-auto leading-relaxed">
              Everything you need to know about Growing Us and how it can help strengthen your relationship.
            </p>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          {faqData.map((item, index) => (
            <FAQAccordion key={index} item={item} />
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 bg-warm-white rounded-3xl border-4 border-deep-black shadow-lg hover-lift max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl font-bold text-deep-green mb-4">
            Still have questions?
          </h2>
          <p className="text-deep-green/80 mb-8 text-lg leading-relaxed">
            Join our waitlist to stay updated and be the first to know when Growing Us becomes available.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center bg-sunflower text-deep-green px-8 py-4 rounded-full font-semibold hover:bg-soft-tangerine transition-colors duration-200 border-4 border-deep-black shadow-lg hover-lift"
          >
            <Heart className="w-5 h-5 mr-2" />
            Join Waitlist
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-4 bg-deep-green text-warm-white relative">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-8">
            <h3 className="font-serif text-3xl font-bold mb-4">Growing Us</h3>
            <p className="text-warm-white/80">
              Every connection needs care, space, and warmth.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 mb-8">
            <Link href="/" className="text-warm-white/80 hover:text-sunflower transition-colors flex items-center">
              <Heart className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
          
          <div className="text-warm-white/60 text-sm">
            © 2024 Growing Us. Made with love for growing relationships.
          </div>
        </div>
      </footer>
    </div>
  );
}