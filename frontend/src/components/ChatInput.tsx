import React from "react";
import { ArrowUp } from "lucide-react";

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
        className="p-2 rounded-full flex items-center justify-center 
        bg-white text-black hover:bg-neutral-400 hover:text-white 
        dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-600 dark:hover:text-neutral-200 
        transition-colors duration-300"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </form>
  );
};

export default ChatInput;
