import { Link } from "wouter";
import { ChevronLeft, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

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
    <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
      <button
        className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-gray-900 pr-4">{item.question}</span>
        {isOpen ? (
          <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-gray-700 leading-relaxed">{item.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header with back button */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 mb-6"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Home
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
        <div className="text-center mt-12 p-8 bg-white rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-600 mb-6">
            Join our waitlist to stay updated and be the first to know when Growing Us becomes available.
          </p>
          <Link 
            href="/"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            Join Waitlist
          </Link>
        </div>
      </div>
    </div>
  );
}