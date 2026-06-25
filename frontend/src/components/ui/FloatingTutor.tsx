import { useState, useRef, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { aiService } from "../../services/aiService";

interface FloatingTutorProps {
  persona: string | null;
  documentId?: string | null; // Active document the student is studying
}

export function FloatingTutor({ persona, documentId }: FloatingTutorProps) {
  const location = useLocation();
  const isVisualLab = location.pathname.endsWith("/lab");
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const constraintsRef = useRef(null);

  const getTutorVibe = () => {
    switch (persona) {
      case "kid":
        return {
          avatar: "🚀",
          name: "Cogni-Guide",
          color: "bg-pink-500",
          text: "Hey! Drop a book in the center and let's play! 🎉",
        };
      case "secondary":
        return {
          avatar: "🧠",
          name: "Study Coach",
          color: "bg-emerald-500",
          text: "Syllabus looking heavy? Let's break it down together.",
        };
      case "casual":
        return {
          avatar: "⚡",
          name: "Upskill Node",
          color: "bg-cobalt-600",
          text: "Ready to upskill? Ask me anything.",
        };
      case "university":
      default:
        return {
          avatar: "🤖",
          name: "CogniFlow AI",
          color: "bg-abyss-800",
          text: "Upload your research. I will cross-examine your understanding.",
        };
    }
  };

  const vibe = getTutorVibe();

  const [messages, setMessages] = useState([
    { role: "assistant", text: vibe.text },
  ]);

  if (!persona) return null;

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // If no document is active, tell the student to upload one first
    if (!documentId) {
      setMessages((prev) => [
        ...prev,
        { role: "user", text: input },
        {
          role: "assistant",
          text: "Please upload a document first so I know what you are studying. Go to the Upload page and add your notes or textbook.",
        },
      ]);
      setInput("");
      return;
    }

    const userText = input;
    setInput("");
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userText },
      { role: "assistant", text: "..." },
    ]);

    try {
      const response = await aiService.tutorChat(documentId, userText, {
        sessionId,
        languageCode: language,
        persona: persona ?? "university",
      });

      // Save session_id from backend (uses underscore not camelCase)
      if (response.session_id && !sessionId) {
        setSessionId(response.session_id);
      }

      // Backend returns reply field
      const replyText = response.reply ?? "Sorry, I could not get a response. Please try again.";

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", text: replyText };
        return updated;
      });
    } catch (error) {
      console.error("Tutor error:", error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          text: "My connection dropped. Check your internet and try again.",
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div ref={constraintsRef} className="pointer-events-none fixed inset-4 z-40" />

      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        className={cn(
          "fixed z-50 flex flex-col items-end gap-3 pointer-events-auto transition-all duration-300",
          isVisualLab ? "bottom-28 right-8" : "bottom-8 right-8"
        )}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.5 }}
      >
        {/* CHAT WINDOW */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="relative flex h-[420px] w-[320px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-silver-200 dark:bg-abyss-950 dark:border-white/10 cursor-auto"
              onPointerDownCapture={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={cn("flex items-center justify-between px-4 py-3 text-white", vibe.color)}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{vibe.avatar}</span>
                  <span className="font-display font-bold text-sm">{vibe.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-black/20 text-white text-xs font-medium rounded-md px-2 py-1 outline-none border-none cursor-pointer appearance-none"
                  >
                    <option value="en">English</option>
                    <option value="yo">Yoruba</option>
                    <option value="ha">Hausa</option>
                    <option value="ig">Igbo</option>
                    <option value="tw">Twi</option>
                    <option value="sw">Swahili</option>
                    <option value="pcm">Pidgin</option>
                    <option value="fr">Français</option>
                    <option value="ar">العربية</option>
                    <option value="genZ">Gen Z</option>
                  </select>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-full bg-white/20 p-1 hover:bg-white/30 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Document context indicator */}
              {documentId && (
                <div className="px-4 py-1.5 bg-gold-50 dark:bg-abyss-800 border-b border-gold-100 dark:border-white/5">
                  <p className="text-xs text-gold-700 dark:text-gold-400">
                    Studying your uploaded document
                  </p>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-silver-50 dark:bg-abyss-900/50">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex w-full",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                        msg.role === "user"
                          ? "bg-gold-500 text-abyss-950 rounded-br-none"
                          : "bg-white border border-silver-200 text-abyss-900 dark:bg-abyss-800 dark:border-white/5 dark:text-silver-300 rounded-bl-none"
                      )}
                    >
                      {msg.text === "..." ? (
                        <span className="flex gap-1">
                          <span className="animate-bounce">•</span>
                          <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>•</span>
                          <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>•</span>
                        </span>
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <form
                onSubmit={handleSendMessage}
                className="border-t border-silver-200 bg-white p-3 dark:border-white/10 dark:bg-abyss-950"
              >
                <div className="relative flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask your AI Tutor..."
                    disabled={isLoading}
                    className="w-full rounded-full border border-silver-300 bg-silver-50 px-4 py-2 text-sm outline-none focus:border-gold-500 dark:border-white/10 dark:bg-abyss-900 dark:text-white disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-500 text-abyss-950 disabled:opacity-50 transition-transform active:scale-95"
                  >
                    <Send className="h-4 w-4 ml-0.5" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FLOATING BUTTON */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.2)] border-4 border-white dark:border-abyss-900 text-3xl cursor-grab active:cursor-grabbing",
            vibe.color
          )}
        >
          <span className="drop-shadow-md z-10">{vibe.avatar}</span>
          {!isOpen && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white/40"
              animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
