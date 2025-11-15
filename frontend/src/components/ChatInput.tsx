import React from "react";
import { ArrowUp, Send } from "lucide-react";

interface ChatInputProps {
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: () => void;
}

const ChatInput = ({ message, setMessage, sendMessage }: ChatInputProps) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        sendMessage();
      }}
      className="flex items-center max-w-5xl gap-2 
        border border-neutral-300 bg-neutral-100 text-black 
        dark:border-neutral-700 dark:bg-neutral-900 dark:text-white 
        rounded-full mb-6 py-2 pl-8 pr-2 w-full 
        transition-colors duration-300"
    >
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 bg-transparent text-black placeholder-neutral-500 
        dark:text-white dark:placeholder-neutral-400 border-none outline-none"
      />
      <button
        type="submit"
        className="relative p-5 rounded-full flex items-center justify-center 
    bg-primary text-primary-foreground hover:bg-primary/90
    transition-colors duration-300"
      >
        {/* Up Arrow (default) */}
        <ArrowUp
          className={`h-5 w-5 absolute transition-all duration-300 
            ${message.trim().length > 0 ? "opacity-0 scale-50 -translate-y-1 rotate-45"   // hide with motion
              : "opacity-100 scale-100 translate-y-0 rotate-0" // show cleanly
            }
    `}
        />

        {/* Send Arrow (shown when typing) */}
        <Send
          className={` h-4 w-4 absolute transition-all duration-300
      ${message.trim().length > 0
              ? "opacity-100 scale-100 translate-y-0 rotate-0"  // reveal smoothly
              : "opacity-0 scale-50 translate-y-1 -rotate-45"   // hide smoothly
            }
    `}
        />
      </button>


    </form>
  );
};

export default ChatInput;
