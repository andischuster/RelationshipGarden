import { useState, useEffect } from "react";
import {
  Heart,
  Sprout,
  Sun,
  Flower,
  Leaf,
  ShoppingCart,
  Shield,
  Star,
  Gift,
  TriangleAlert,
  Truck,
  Users,
  Mail,
  HelpCircle,
  Instagram,
  Clover,
  Check,
  X,
  ChevronDown,
  Send,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertPreorderSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Blob from "@/components/Blob";

// Import card images
import elephantCard from "@assets/Elephant in the Room_1749555023557.png";
import sunflowerCard from "@assets/Late Bloomer_1749555037913.png";
import lemonsCard from "@assets/Life's Lemons_1749555039716.png";
import foolCard from "@assets/Early Bird_1749555043033.png";
import growingUsCard from "@assets/Background Deck Card_1749555051172.png";
import magicBeanCard from "@assets/Magic Bean_1749555057354.png";
import writeActivityIcon from "@assets/write activity_1751684867775.png";

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
    hasUnderline: true,
  },
  {
    id: 1,
    title: "Elephant in the Room",
    description: "Playfully speak about friction",
    image: elephantCard,
    gradient: "from-deep-teal to-soft-tangerine",
    hasUnderline: true,
  },
  {
    id: 2,
    title: "The Sunflower",
    description: "Reflect about how far you've come",
    image: sunflowerCard,
    gradient: "from-sunflower to-deep-teal",
    hasUnderline: true,
  },
  {
    id: 3,
    title: "Early Bird",
    description: "Learn more about how you differ",
    image: foolCard,
    gradient: "from-soft-tangerine to-deep-teal",
    hasUnderline: true,
  },
  {
    id: 4,
    title: "Magic Bean",
    description: "Leave something behind that grows",
    image: magicBeanCard,
    gradient: "from-deep-teal to-sunflower",
    hasUnderline: true,
  },
];

export default function Home() {
  const [currentCard, setCurrentCard] = useState(0);
  const [isIntersecting, setIsIntersecting] = useState<{
    [key: string]: boolean;
  }>({});
  const [scrolled, setScrolled] = useState(false);
  const [isPreorderModalOpen, setIsPreorderModalOpen] = useState(false);
  const [activityGeneratorState, setActivityGeneratorState] = useState({
    isFlipped: false,
    currentStep: "partner1" as
      | "partner1"
      | "partner2"
      | "generation"
      | "result"
      | "email",
    partner1Input: "",
    partner2Input: "",
    generatedActivity: null as any,
    emailCaptured: false,
    email: "",
  });
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(insertPreorderSchema),
    defaultValues: {
      email: "",
    },
  });

  const preorderMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      // Check if we're in static deployment mode
      const isStatic =
        !import.meta.env.VITE_GOOGLE_FORM_URL &&
        !import.meta.env.VITE_GOOGLE_SHEET_ID;

      if (import.meta.env.VITE_GOOGLE_FORM_URL) {
        // Use Google Forms submission for static deployment
        const formData = new FormData();
        const emailFieldId =
          import.meta.env.VITE_GOOGLE_FORM_EMAIL_FIELD || "entry.1234567890";
        formData.append(emailFieldId, data.email);

        await fetch(import.meta.env.VITE_GOOGLE_FORM_URL, {
          method: "POST",
          mode: "no-cors",
          body: formData,
        });

        return { success: true };
      } else if (
        import.meta.env.VITE_GOOGLE_SHEET_ID &&
        import.meta.env.VITE_GOOGLE_SHEETS_API_KEY
      ) {
        // Use Google Sheets API for static deployment
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${import.meta.env.VITE_GOOGLE_SHEET_ID}/values/Sheet1:append?valueInputOption=RAW&key=${import.meta.env.VITE_GOOGLE_SHEETS_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              values: [[data.email, new Date().toISOString()]],
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to save email");
        }

        return { success: true };
      } else {
        // Static deployment fallback - try to use Google Forms with hardcoded values
        console.log("No environment variables set, using static fallback");

        // You can either:
        // 1. Set up Google Forms environment variables, or
        // 2. Use a hardcoded Google Form URL here
        // For now, let's simulate success and log the email
        console.log("Email submitted:", data.email);

        // In a real static deployment, you'd want to either:
        // - Set VITE_GOOGLE_FORM_URL in your environment variables
        // - Or use a service like Formspree, Netlify Forms, etc.

        return { success: true, message: "Email recorded (static mode)" };
      }
    },
    onSuccess: () => {
      toast({
        title: "Pre-order Confirmed!",
        description:
          "You'll receive 25% off when we launch. We'll email you soon!",
      });
      setIsPreorderModalOpen(false);
      form.reset();
    },
    onError: async (error: any) => {
      let message = "Something went wrong. Please try again.";

      if (error instanceof Response) {
        try {
          const errorData = await error.json();
          message = errorData.error || message;
        } catch {
          message = `Server error (${error.status})`;
        }
      } else if (error.message) {
        message = error.message;
      }

      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: { email: string }) => {
    preorderMutation.mutate(data);
  };

  // Activity Generator Mutations
  const generateActivityMutation = useMutation({
    mutationFn: async (inputs: {
      partner1Input: string;
      partner2Input: string;
    }) => {
      const response = await apiRequest(
        "POST",
        "/api/activities/generate",
        inputs,
      );
      return response.json();
    },
    onSuccess: (data) => {
      setActivityGeneratorState((prev) => ({
        ...prev,
        generatedActivity: data.activity,
        currentStep: "result",
      }));
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate activity. Please try again.",
        variant: "destructive",
      });
    },
  });

  const emailCaptureMutation = useMutation({
    mutationFn: async (data: { email: string; activityId: string }) => {
      const response = await apiRequest("POST", "/api/activities/email", data);
      return response.json();
    },
    onSuccess: () => {
      setActivityGeneratorState((prev) => ({ ...prev, emailCaptured: true }));
      toast({
        title: "Activity Sent!",
        description: "Check your email for your personalized activity.",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Removed auto-cycling - cards now change only on click

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsIntersecting((prev) => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting,
          }));
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    const elements = document.querySelectorAll('[id^="section-"]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handlePurchase = () => {
    setIsPreorderModalOpen(true);
  };

  // Activity Generator Step Handlers
  const handlePartner1Submit = () => {
    if (!activityGeneratorState.partner1Input.trim()) {
      toast({
        title: "Required Field",
        description:
          "Please share what you'd like to improve in your relationship.",
        variant: "destructive",
      });
      return;
    }
    setActivityGeneratorState((prev) => ({ ...prev, currentStep: "partner2" }));
  };

  const handlePartner2Submit = () => {
    if (!activityGeneratorState.partner2Input.trim()) {
      toast({
        title: "Required Field",
        description: "Please share what your partner might want to improve.",
        variant: "destructive",
      });
      return;
    }
    setActivityGeneratorState((prev) => ({
      ...prev,
      currentStep: "generation",
    }));
    generateActivityMutation.mutate({
      partner1Input: activityGeneratorState.partner1Input,
      partner2Input: activityGeneratorState.partner2Input,
    });
  };

  const handleEmailSubmit = () => {
    if (!activityGeneratorState.email.trim()) {
      toast({
        title: "Required Field",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    if (!activityGeneratorState.generatedActivity) return;

    emailCaptureMutation.mutate({
      email: activityGeneratorState.email,
      activityId: activityGeneratorState.generatedActivity.id,
    });
  };

  // Render Activity Generator Content
  const renderActivityGeneratorContent = () => {
    switch (activityGeneratorState.currentStep) {
      case "partner1":
        return (
          <div className="flex flex-col h-full p-3">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="mb-4">
                <div className="relative">
                  <textarea
                    placeholder="Tell us what you would like to improve about your relationship..."
                    value={activityGeneratorState.partner1Input}
                    onChange={(e) =>
                      setActivityGeneratorState((prev) => ({
                        ...prev,
                        partner1Input: e.target.value,
                      }))
                    }
                    className="w-full p-1 border-none rounded-none text-lg font-bold focus:outline-none bg-transparent placeholder:text-black/50 text-left resize-none"
                    style={{
                      backgroundColor: "transparent",
                      color: "#000",
                      textAlign: "left",
                    }}
                    rows={4}
                    maxLength={300}
                  />
                  {!activityGeneratorState.partner1Input && (
                    <span className="absolute top-0 left-[1px] animate-blink text-xl font-bold text-black pointer-events-none">
                      |
                    </span>
                  )}
                </div>
              </div>
            </div>
            {/* Bottom Button - Header Style */}
            <div className="text-center text-[1A1A1A]">
              <h2
                className="text-xl font-black text-black mb-2 tracking-wide cursor-pointer hover:text-black/80 transition-colors yellow-squiggly-underline inline-flex items-center gap-2"
                onClick={handlePartner1Submit}
                style={{
                  opacity: !activityGeneratorState.partner1Input.trim()
                    ? 1
                    : 1,
                  pointerEvents: !activityGeneratorState.partner1Input.trim()
                    ? "none"
                    : "auto",
                }}
              >
                CONTINUE
                <Send className="w-5 h-6 text-black" />
              </h2>
            </div>
          </div>
        );

      case "partner2":
        return (
          <div className="flex flex-col h-full p-3">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="mb-4">
                <div className="relative">
                  <textarea
                    placeholder="What would your partner like to improve about your relationship..."
                    value={activityGeneratorState.partner2Input}
                    onChange={(e) =>
                      setActivityGeneratorState((prev) => ({
                        ...prev,
                        partner2Input: e.target.value,
                      }))
                    }
                    className="w-full p-1 border-none rounded-none text-lg font-bold focus:outline-none bg-transparent placeholder:text-black/50 text-left resize-none"
                    style={{
                      backgroundColor: "transparent",
                      color: "#000",
                      textAlign: "left",
                    }}
                    rows={4}
                    maxLength={300}
                  />
                  {!activityGeneratorState.partner2Input && (
                    <span className="absolute top-0 left-[1px] animate-blink text-xl font-bold text-black pointer-events-none">
                      |
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Button - Header Style */}
            <div className="text-center">
              <h2
                className="text-xl font-black text-black mb-2 tracking-wide cursor-pointer hover:text-black/80 transition-colors yellow-squiggly-underline inline-flex items-center gap-2"
                onClick={handlePartner2Submit}
                style={{
                  opacity: !activityGeneratorState.partner2Input.trim()
                    ? 1
                    : 1,
                  pointerEvents: !activityGeneratorState.partner2Input.trim()
                    ? "none"
                    : "auto",
                }}
              >
                DISCOVER MORE
                <Send className="w-5 h-5 text-deep-teal" />
              </h2>
            </div>
          </div>
        );

      case "generation":
        return (
          <div className="flex flex-col h-full p-3 cursor-pointer">
            {/* Centered content area matching conversation starter layout */}
            <div className="flex-1 flex flex-col justify-center items-center mb-3">
              <img 
                src={writeActivityIcon}
                alt="Creating activity"
                className="w-48 h-48 mx-auto mb-3"
                style={{
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                }}
              />
              <h5 className="font-black text-black mb-1 text-lg px-4">
                Creating Your Activity
              </h5>
              <p className="text-base font-medium text-black/80 italic">
                Crafting something special for you both...
              </p>
            </div>
          </div>
        );

      case "result":
        if (!activityGeneratorState.generatedActivity) return null;

        return (
          <div className="flex flex-col h-full p-3">
            {/* Centered activity description */}
            <div className="flex-1 flex items-center justify-center mb-3">
              <p className="text-base font-medium text-black/80 leading-relaxed px-1 text-center">
                {activityGeneratorState.generatedActivity.description}
              </p>
            </div>

            {/* Conversation starter moved to bottom */}
            {activityGeneratorState.generatedActivity.conversationPrompts
              ?.length > 0 && (
              <div className="mb-3">
                <h5 className="font-black text-black mb-1 text-lg px-4">
                  Conversation Starter
                </h5>
                <p className="text-base font-medium text-black/80 italic">
                  "
                  {
                    activityGeneratorState.generatedActivity
                      .conversationPrompts[0]
                  }
                  "
                </p>
              </div>
            )}

            <Button
              onClick={() =>
                setActivityGeneratorState((prev) => ({
                  ...prev,
                  currentStep: "email",
                }))
              }
              className="w-full py-2 bg-gradient-to-r from-sunflower to-soft-tangerine hover:from-sunflower/90 hover:to-soft-tangerine/90 text-deep-green font-bold text-lg hover-lift rounded-full"
            >
              SEND TO E-MAIL
            </Button>
          </div>
        );

      case "email":
        return (
          <div className="flex flex-col h-full p-3">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email address..."
                    value={activityGeneratorState.email}
                    onChange={(e) =>
                      setActivityGeneratorState((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full p-1 border-none rounded-none text-lg font-bold focus:outline-none bg-transparent placeholder:text-black/50 text-left"
                    style={{
                      backgroundColor: "transparent",
                      color: "#000",
                      textAlign: "left",
                    }}
                    autoFocus
                  />
                  {!activityGeneratorState.email && (
                    <span className="absolute top-0 left-[1px] animate-blink text-xl font-bold text-black pointer-events-none">
                      |
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Button - Header Style */}
            <div className="text-center">
              <h2
                className="text-xl font-black text-black mb-2 tracking-wide cursor-pointer hover:text-black/80 transition-colors yellow-squiggly-underline inline-flex items-center gap-2"
                onClick={handleEmailSubmit}
                style={{
                  opacity: !activityGeneratorState.email.trim()
                    ? 1
                    : 1,
                  pointerEvents: !activityGeneratorState.email.trim()
                    ? "none"
                    : "auto",
                }}
              >
                {emailCaptureMutation.isPending
                  ? "SENDING..."
                  : "SEND ACTIVITY"}
                <Send className="w-5 h-5 text-deep-teal" />
              </h2>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-warm-white text-deep-green font-sans leading-relaxed relative overflow-hidden">
      {/* Background blobs */}
      <Blob
        color="#FFC700"
        className="top-0 -left-20 w-[600px] h-[600px] animate-float"
      />
      <Blob
        color="#F9A870"
        className="-bottom-40 -right-20 w-[550px] h-[550px] animate-float delay-1000"
      />
      <Blob
        color="#008080"
        className="bottom-[5%] -left-20 w-[500px] h-[500px] animate-float delay-2000"
      />
      <Blob
        color="#2F4858"
        className="top-1/3 -right-28 w-[400px] h-[400px] animate-float delay-3000"
      />
      <Blob
        color="#F9A870"
        className="top-2/3 left-1/4 w-[300px] h-[300px] animate-float delay-4000"
      />
      <div className="container mx-auto px-4 py-12 relative">
        {/* Header/Navigation */}
        <header
          className={`flex justify-between items-center sticky top-0 z-50 py-3 px-4 sm:py-4 sm:px-8 transition-all duration-300 ${scrolled ? "bg-warm-white/90 backdrop-blur-md shadow-md rounded-full" : ""}`}
        >
          <div className="flex items-center min-w-0">
            <Flower className="text-deep-teal mr-2 flex-shrink-0" />
            <h1 className="font-serif text-sm sm:text-lg md:text-xl font-bold text-deep-green whitespace-nowrap">
              Relationship Game
            </h1>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <button
              className="cta-button sm:text-base px-4 sm:px-8 py-2 sm:py-4 text-[16px]"
              onClick={handlePurchase}
            >
              Play Now
            </button>
          </div>
        </header>
        {/* Hero Section */}
        <section
          id="section-hero"
          className="min-h-screen flex flex-col justify-center items-center px-2 sm:px-4 py-8 pt-20 sm:pt-24 relative overflow-hidden"
        >
          <div className="mx-auto text-center w-full">
            {/* Main Title */}
            <h1
              className={`font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-deep-green mb-6 max-w-6xl mx-auto leading-tight ${isIntersecting["section-hero"] ? "fade-in" : ""}`}
            >
              Growing Us
            </h1>

            {/* Tagline */}
            <p
              className={`text-lg sm:text-xl md:text-2xl text-deep-green/80 mb-4 max-w-4xl mx-auto leading-relaxed px-4 ${isIntersecting["section-hero"] ? "fade-in" : ""}`}
              style={{ animationDelay: "0.2s" }}
            >
              Every connection needs care, space, and warmth. These prompts help
              you nurture your relationship garden.
            </p>

            {/* Sub-Tagline */}
            <p
              className={`text-base sm:text-lg text-deep-green/70 mb-8 max-w-3xl mx-auto leading-relaxed px-4 ${isIntersecting["section-hero"] ? "fade-in" : ""}`}
              style={{ animationDelay: "0.4s" }}
            ></p>

            {/* Interactive Card Stack with Flip */}
            <div
              className={`mb-5 ${isIntersecting["section-hero"] ? "fade-in staggered-animation" : ""}`}
            >
              {/* Card Flip Container */}
              <div
                className="relative flex justify-center items-center mb-8"
                style={{ height: "500px" }}
              >

                {/* Card Stack Container */}
                <div className="card-stack">
                  {cardData.map((card, index) => {
                    const offset = index - currentCard;
                    const isTopCard = index === currentCard;
                    const isVisible = Math.abs(offset) <= 2;

                    if (!isVisible) return null;

                    return (
                      <div
                        key={card.id}
                        className={`card-stack-item ${
                          isTopCard && !activityGeneratorState.isFlipped
                            ? "cursor-pointer hover:scale-110 transition-all duration-300 ease-out"
                            : "transition-all duration-1000 ease-out"
                        }`}
                        style={{
                          position: "absolute",
                          width: "288px",
                          height: "432px",
                          left: "50%",
                          top: "50%",
                          marginLeft: "-144px",
                          marginTop: "-216px",
                          zIndex: isTopCard
                            ? 10
                            : Math.max(0, 5 - Math.abs(offset)),
                          transform: `
                          translateX(${offset * 8}px)
                          translateY(${offset * 4}px)
                          rotate(${offset * 3}deg)
                          scale(${isTopCard ? 1 : 0.95})
                        `,
                          opacity: isTopCard ? 1 : 0.9,
                          filter: isTopCard ? "none" : "brightness(0.85)",
                          pointerEvents: isTopCard ? "auto" : "none",
                        }}
                        onClick={
                          isTopCard && !activityGeneratorState.isFlipped
                            ? () => {
                                setCurrentCard(
                                  (currentCard + 1) % cardData.length,
                                )
                                // Immediately focus when card is selected
                                setTimeout(() => {
                                  if (activityGeneratorState.currentStep === 'partner1') {
                                    const textarea = document.querySelector('textarea[placeholder="Tell us what you would like to improve about your relationship..."]') as HTMLTextAreaElement;
                                    textarea?.focus();
                                  } else if (activityGeneratorState.currentStep === 'partner2') {
                                    const textarea = document.querySelector('textarea[placeholder="What would your partner like to improve about your relationship..."]') as HTMLTextAreaElement;
                                    textarea?.focus();
                                  }
                                }, 100);
                              }
                            : undefined
                        }
                      >
                        {/* Card Flip Container - Only for top card */}
                        {isTopCard ? (
                          <div
                            className="card-flip-container w-full h-full"
                            style={{
                              perspective: "1000px",
                              transformStyle: "preserve-3d",
                            }}
                          >
                            <div
                              className="card-flip-inner w-full h-full"
                              style={{
                                transition:
                                  "transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)",
                                transformStyle: "preserve-3d",
                                transform: activityGeneratorState.isFlipped
                                  ? "rotateY(180deg)"
                                  : "rotateY(0deg)",
                              }}
                            >
                              {/* Front - Card Image */}
                              <div
                                className="card-front w-full h-full rounded-2xl border-4 border-[#1A1A1A] overflow-hidden"
                                style={{
                                  backfaceVisibility: "hidden",
                                  position: "absolute",
                                  boxShadow:
                                    "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                                }}
                              >
                                <img
                                  src={card.image}
                                  alt={card.title}
                                  loading="eager"
                                  decoding="async"
                                  className="w-full h-full object-cover"
                                  style={{
                                    transition: "opacity 0.3s ease-in-out"
                                  }}
                                />
                              </div>

                              {/* Back - Chatbox Interface */}
                              <div
                                className="card-back w-full h-full"
                                style={{
                                  backfaceVisibility: "hidden",
                                  transform: "rotateY(180deg)",
                                  position: "absolute",
                                }}
                              >
                                <div
                                  className={`flex flex-col w-full h-full rounded-2xl shadow-2xl overflow-hidden ${
                                    activityGeneratorState.currentStep === "generation" ? "pulse-loading" : ""
                                  }`}
                                  style={{
                                    backgroundColor: "#e3cca1",
                                    border: "4px solid #1A1A1A",
                                  }}
                                >
                                  {/* Header */}
                                  <div
                                    className="text-center py-2 border-b-2"
                                    style={{
                                      backgroundColor: "transparent",
                                      color: "#FEFBF6",
                                      borderColor: "#1A1A1A",
                                    }}
                                  >
                                    <h3 className="font-bold tracking-wide text-[#171717] text-[18px]">
                                      {activityGeneratorState.currentStep ===
                                        "result" &&
                                      activityGeneratorState.generatedActivity
                                        ? activityGeneratorState
                                            .generatedActivity.title.length > 23
                                          ? activityGeneratorState.generatedActivity.title.substring(
                                              0,
                                              23,
                                            )
                                          : activityGeneratorState
                                              .generatedActivity.title
                                        : "GROW TOGETHER"}
                                    </h3>
                                  </div>

                                  {/* Content Area */}
                                  <div
                                    className="flex-1 p-2"
                                    style={{ backgroundColor: "#e3cca1" }}
                                  >
                                    {renderActivityGeneratorContent()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Regular card for non-top cards */
                          <div className="w-full h-full rounded-2xl border-4 border-[#1A1A1A] shadow-2xl overflow-hidden">
                            <img
                              src={card.image}
                              alt={card.title}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover"
                              style={{
                                transition: "opacity 0.3s ease-in-out"
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card Description */}
              <div className="text-center max-w-md mx-auto px-4">
                <p className="text-lg sm:text-xl md:text-2xl text-deep-green/90 font-medium italic">
                  {activityGeneratorState.isFlipped ? (
                    "Get your personalized activity suggestion"
                  ) : (
                    <span className="squiggly-underline mt-[16px] mb-[16px]">
                      Discover Your Next Meaningful Moment Together.
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Primary CTA - Start Activity Generator */}
            <div
              className={`${isIntersecting["section-hero"] ? "fade-in" : ""}`}
              style={{ animationDelay: "0.6s" }}
            >
              <Button
                onClick={() =>
                  setActivityGeneratorState((prev) => ({
                    ...prev,
                    isFlipped: true,
                  }))
                }
                className="bg-gradient-to-r from-sunflower to-soft-tangerine hover:from-sunflower/90 hover:to-soft-tangerine/90 text-deep-green font-semibold text-lg sm:text-xl px-8 sm:px-12 py-3 sm:py-4 rounded-full hover-lift shadow-lg"
              >
                Start Growing For Free
              </Button>
            </div>

            {/* Secondary CTA - Card Game */}
            <div
              className={`mt-8 ${isIntersecting["section-hero"] ? "fade-in" : ""}`}
              style={{ animationDelay: "0.8s" }}
            >
              <Button
                onClick={handlePurchase}
                variant="outline"
                className="text-deep-green border-deep-green hover:bg-deep-green hover:text-white font-semibold text-lg px-8 py-3 rounded-full"
              >
                Order Card Game – $25
              </Button>
              <p className="text-sm text-deep-green/70 mt-3">
                <Gift className="inline w-4 h-4 text-sunflower mr-2" />
                Free shipping notice
              </p>
            </div>
          </div>
        </section>
        {/* Section Divider */}
        <div className="section-divider">
          <svg width="100%" height="24">
            <path d="M0,12 Q20,4 40,12 T80,12 T120,12 T160,12 T200,12 T240,12 T280,12 T320,12 T360,12 T400,12 T440,12 T480,12 T520,12 T560,12 T600,12 T640,12 T680,12 T720,12 T760,12 T800,12 T840,12 T880,12 T920,12 T960,12 T1000,12" stroke="#008080" strokeWidth="2" fill="none" />
          </svg>
        </div>
        {/* How To Play Section */}
        <section
          id="section-howto"
          className="py-15 px-4 bg-gradient-to-b from-warm-white to-soft-tangerine/10"
        >
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2
                className={`font-serif text-4xl md:text-5xl font-bold text-deep-green mb-5 ${isIntersecting["section-howto"] ? "fade-in" : ""}`}
              >
                How To Play
              </h2>
              <p
                className={`text-lg text-deep-green/80 max-w-2xl mx-auto ${isIntersecting["section-howto"] ? "fade-in" : ""}`}
              >
                Simple steps to nurture your relationship through playful
                conversation.
              </p>
            </div>

            <div
              className={`grid gap-6 max-w-4xl mx-auto ${isIntersecting["section-howto"] ? "staggered-animation" : ""}`}
            >
              {/* Step 1 */}
              <div
                className={`flex items-start space-x-4 hover-lift bg-sunflower/5 p-6 rounded-2xl ${isIntersecting["section-howto"] ? "fade-in" : ""}`}
              >
                <div className="flex-shrink-0 w-16 h-16 bg-sunflower rounded-full border-4 border-deep-black flex items-center justify-center">
                  <Sprout className="w-8 h-8 text-deep-green" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-serif text-2xl font-bold text-deep-green mb-3">
                    <span className="font-serif text-2xl font-bold text-soft-tangerine mr-3">
                      1
                    </span>
                    Tend The Ground
                  </h3>
                  <p className="text-deep-green/80 text-lg">
                    Find a safe space where honesty can grow and set aside 20–30
                    minutes. Place the numbered rule cards openly and draw 5
                    playing cards each.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div
                className={`flex items-start space-x-4 hover-lift bg-soft-tangerine/8 p-6 rounded-2xl ${isIntersecting["section-howto"] ? "fade-in" : ""}`}
              >
                <div className="flex-shrink-0 w-16 h-16 bg-sunflower rounded-full border-4 border-deep-black flex items-center justify-center">
                  <Heart className="w-8 h-8 text-deep-green" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-serif text-2xl font-bold text-deep-green mb-3">
                    <span className="font-serif text-2xl font-bold text-soft-tangerine mr-3">
                      2
                    </span>
                    Cultivate Connection
                  </h3>
                  <p className="text-deep-green/80 text-lg">
                    Take turns drawing a card, reflect quietly, then share your
                    heart. Let them know how it matters to you.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div
                className={`flex items-start space-x-4 hover-lift bg-deep-teal/8 p-6 rounded-2xl ${isIntersecting["section-howto"] ? "fade-in" : ""}`}
              >
                <div className="flex-shrink-0 w-16 h-16 bg-sunflower rounded-full border-4 border-deep-black flex items-center justify-center">
                  <Sun className="w-8 h-8 text-deep-green" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-serif text-2xl font-bold text-deep-green mb-3">
                    <span className="font-serif text-2xl font-bold text-soft-tangerine mr-3">
                      3
                    </span>
                    Sunflower Speak
                  </h3>
                  <p className="text-deep-green/80 text-lg">
                    Use "I feel…" to shine light on your truth, not blame. Speak
                    from the heart, and your partner will lean toward the
                    warmth.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div
                className={`flex items-start space-x-4 hover-lift bg-sunflower/8 p-6 rounded-2xl ${isIntersecting["section-howto"] ? "fade-in" : ""}`}
              >
                <div className="flex-shrink-0 w-16 h-16 bg-sunflower rounded-full border-4 border-deep-black flex items-center justify-center">
                  <Flower className="w-8 h-8 text-deep-green" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-serif text-2xl font-bold text-deep-green mb-3">
                    <span className="font-serif text-2xl font-bold text-soft-tangerine mr-3">
                      4
                    </span>
                    Let Love Bloom
                  </h3>
                  <p className="text-deep-green/80 text-lg">
                    End each conversation on a positive: love, laughter, a thank
                    you. Validation grows safety, even without perfect
                    agreement.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div
                className={`flex items-start space-x-4 hover-lift bg-soft-tangerine/5 p-6 rounded-2xl ${isIntersecting["section-howto"] ? "fade-in" : ""}`}
              >
                <div className="flex-shrink-0 w-16 h-16 bg-sunflower rounded-full border-4 border-deep-black flex items-center justify-center">
                  <Leaf className="w-8 h-8 text-deep-green" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-serif text-2xl font-bold text-deep-green mb-3">
                    <span className="font-serif text-2xl font-bold text-soft-tangerine mr-3">
                      5
                    </span>
                    Plant a Promise
                  </h3>
                  <p className="text-deep-green/80 text-lg">
                    At the end of each session plant an intention. Write it,
                    draw it, or say it aloud, and come back to see how it's
                    blossomed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Section Divider */}
        <div className="section-divider">
          <svg width="100%" height="24">
            <path d="M0,12 Q20,4 40,12 T80,12 T120,12 T160,12 T200,12 T240,12 T280,12 T320,12 T360,12 T400,12 T440,12 T480,12 T520,12 T560,12 T600,12 T640,12 T680,12 T720,12 T760,12 T800,12 T840,12 T880,12 T920,12 T960,12 T1000,12" stroke="#008080" strokeWidth="2" fill="none" />
          </svg>
        </div>
        {/* Pricing Section */}
        <section
          id="section-pricing"
          className="py-20 px-4 bg-gradient-to-b from-sunflower/10 to-warm-white"
        >
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left side - What's Included */}
              <div
                className={`${isIntersecting["section-pricing"] ? "fade-in" : ""}`}
              >
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-deep-green mb-4">
                  What's Included
                </h2>

                {/* Squiggly underline */}
                <div className="w-64 h-2 mb-8">
                  <svg
                    width="256"
                    height="8"
                    viewBox="0 0 256 8"
                    className="w-full"
                  >
                    <path
                      d="M0,4 Q32,1 64,4 T128,4 T192,4 T256,4"
                      stroke="#FFC700"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-sunflower/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Check className="w-6 h-6 text-deep-teal" />
                    </div>
                    <p className="text-lg text-deep-green/80 leading-relaxed">
                      50 beautifully illustrated cards
                    </p>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-sunflower/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Check className="w-6 h-6 text-deep-teal" />
                    </div>
                    <p className="text-lg text-deep-green/80 leading-relaxed">
                      5 instruction cards
                    </p>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-sunflower/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Check className="w-6 h-6 text-deep-teal" />
                    </div>
                    <p className="text-lg text-deep-green/80 leading-relaxed">
                      3 bonus cards for special moments
                    </p>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-sunflower/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Check className="w-6 h-6 text-deep-teal" />
                    </div>
                    <p className="text-lg text-deep-green/80 leading-relaxed">
                      1 custom box with closure
                    </p>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="text-4xl font-serif font-bold text-deep-green mb-2">
                    $25 per deck
                  </div>
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
              <div
                className={`flex justify-center ${isIntersecting["section-pricing"] ? "fade-in" : ""}`}
              >
                <div className="relative">
                  <img
                    src={magicBeanCard}
                    alt="Magic Bean card example"
                    loading="lazy"
                    decoding="async"
                    style={{
                      width: "320px",
                      height: "auto"
                    }}
                    className="rounded-2xl border-4 border-deep-black shadow-2xl transform rotate-3 hover:rotate-[20deg] hover:scale-105 transition-all duration-300 animate-float"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Section Divider */}
        <div className="section-divider">
          <svg width="100%" height="24">
            <path d="M0,12 Q20,4 40,12 T80,12 T120,12 T160,12 T200,12 T240,12 T280,12 T320,12 T360,12 T400,12 T440,12 T480,12 T520,12 T560,12 T600,12 T640,12 T680,12 T720,12 T760,12 T800,12 T840,12 T880,12 T920,12 T960,12 T1000,12" stroke="#008080" strokeWidth="2" fill="none" />
          </svg>
        </div>
        {/* Testimonials Section */}
        <section
          id="section-testimonials"
          className="py-20 px-4 bg-gradient-to-b from-deep-teal/5 to-warm-white"
        >
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2
                className={`font-serif text-4xl md:text-5xl font-bold text-deep-green mb-6 ${isIntersecting["section-testimonials"] ? "fade-in" : ""}`}
              >
                What Couples Are Saying
              </h2>
            </div>

            <div
              className={`grid md:grid-cols-3 gap-8 ${isIntersecting["section-testimonials"] ? "staggered-animation" : ""}`}
            >
              {/* Testimonial 1 */}
              <div
                className={`bg-warm-white p-8 rounded-3xl border-4 border-deep-black shadow-lg hover-lift ${isIntersecting["section-testimonials"] ? "fade-in" : ""}`}
              >
                <p className="text-deep-green/80 text-lg mb-6 italic">
                  "My partner and I are both software engineers, and we spend
                  all day problem-solving. This game helped us switch gears and
                  connect on a totally different level. It's like a playful team
                  retrospective."
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
              <div
                className={`bg-warm-white p-8 rounded-3xl border-4 border-deep-black shadow-lg hover-lift ${isIntersecting["section-testimonials"] ? "fade-in" : ""}`}
              >
                <p className="text-deep-green/80 text-lg mb-6 italic">
                  "I was skeptical about a 'relationship game,' but this is
                  different. It's not awkward at all—it's just really
                  well-designed and the prompts led to conversations we didn't
                  even know we needed to have."
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
              <div
                className={`bg-warm-white p-8 rounded-3xl border-4 border-deep-black shadow-lg hover-lift ${isIntersecting["section-testimonials"] ? "fade-in" : ""}`}
              >
                <p className="text-deep-green/80 text-lg mb-6 italic">
                  "It's like relationship therapy, but in a cozy hoodie. A retro
                  for the heart."
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
        <section
          id="section-final-cta"
          className="py-20 px-4 bg-gradient-to-b from-warm-white to-sunflower/20"
        >
          <div className="container mx-auto max-w-4xl text-center">
            <h2
              className={`font-serif text-4xl md:text-5xl font-bold text-deep-green mb-6 ${isIntersecting["section-final-cta"] ? "fade-in" : ""}`}
            >
              Your Relationship Garden Awaits
            </h2>
            <p
              className={`text-xl text-deep-green/80 mb-12 max-w-2xl mx-auto ${isIntersecting["section-final-cta"] ? "fade-in" : ""}`}
            >
              Don't let meaningful conversations wither. Start growing deeper
              connections today.
            </p>

            <div
              className={`bg-warm-white rounded-3xl border-4 border-deep-black p-8 shadow-lg hover-lift max-w-lg mx-auto ${isIntersecting["section-final-cta"] ? "fade-in" : ""}`}
            >
              <div className="mb-6">
                <span className="text-4xl font-serif font-bold text-deep-green">
                  $25
                </span>
                <div className="text-deep-green/80 mt-1">
                  Free shipping on 2+ games
                </div>
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
        {/* Section Divider */}
        <div className="section-divider">
          <svg width="100%" height="24">
            <path d="M0,12 Q20,4 40,12 T80,12 T120,12 T160,12 T200,12 T240,12 T280,12 T320,12 T360,12 T400,12 T440,12 T480,12 T520,12 T560,12 T600,12 T640,12 T680,12 T720,12 T760,12 T800,12 T840,12 T880,12 T920,12 T960,12 T1000,12" stroke="#008080" strokeWidth="2" fill="none" />
          </svg>
        </div>
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
              <a
                href="#"
                className="text-warm-white/80 hover:text-sunflower transition-colors flex items-center"
              >
                <Instagram className="w-4 h-4 mr-2" />
                Follow Our Journey
              </a>
              <a
                href="#"
                className="text-warm-white/80 hover:text-sunflower transition-colors flex items-center"
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact Us
              </a>
              <Link
                href="/faq"
                className="text-warm-white/80 hover:text-sunflower transition-colors flex items-center"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                FAQ
              </Link>
            </div>

            <div className="text-warm-white/60 text-sm">
              © 2024 Growing Us. Made with love for growing relationships.
            </div>
          </div>
        </footer>
      </div>
      {/* Pre-order Modal */}
      <Dialog open={isPreorderModalOpen} onOpenChange={setIsPreorderModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-warm-white border-deep-green">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-deep-green">
              Pre-Order Growing Us
            </DialogTitle>
            <DialogDescription className="text-deep-green/80">
              Get early access with 25% off the regular price. We'll email you
              when it's ready to ship!
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-deep-green font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...form.register("email")}
                className="border-deep-green/30 focus:border-deep-teal"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="bg-sunflower/10 p-4 rounded-lg border border-sunflower/30">
              <div className="flex items-center space-x-2 mb-2">
                <Gift className="w-5 h-5 text-deep-teal" />
                <span className="font-semibold text-deep-green">
                  Pre-Order Benefits
                </span>
              </div>
              <ul className="text-sm text-deep-green/80 space-y-1">
                <li>• 25% discount ($18.75 instead of $25)</li>
                <li>• First access when we launch</li>
                <li>• Free shipping included</li>
                <li>• Early bird exclusive updates</li>
              </ul>
            </div>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPreorderModalOpen(false)}
                className="flex-1 border-deep-green text-deep-green hover:bg-deep-green/10"
              >
                Maybe Later
              </Button>
              <Button
                type="submit"
                disabled={preorderMutation.isPending}
                className="flex-1 bg-sunflower hover:bg-sunflower/90 text-deep-green font-semibold"
              >
                {preorderMutation.isPending ? "Saving..." : "Reserve My Copy"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}