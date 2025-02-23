import * as React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatBubbleProps {
  message: string;
  isSender: boolean;
  userName: string;
  timestamp: Date;
  avatarUrl?: string;
  isFirstMessageInGroup: boolean;
}

export function ChatBubble({
  message,
  isSender,
  userName,
  timestamp,
  avatarUrl,
  isFirstMessageInGroup,
}: ChatBubbleProps) {
  const { theme } = useTheme();
  const [isTooltipVisible, setIsTooltipVisible] = React.useState(false);

  const bubbleColors = {
    sender: {
      light: "bg-neutral-800 text-white",
      dark: "bg-neutral-300 text-black",
    },
    receiver: {
      light: "bg-neutral-200 text-neutral-900",
      dark: "bg-neutral-700 text-neutral-100",
    },
  };

  const bubbleColor = isSender
    ? theme === "dark"
      ? bubbleColors.sender.dark
      : bubbleColors.sender.light
    : theme === "dark"
      ? bubbleColors.receiver.dark
      : bubbleColors.receiver.light;

  return (
    <motion.div
      className={`flex items-start transition-all duration-200 ease-in-out space-x-2 mb-1 ${isSender ? "justify-end" : "justify-start"
        }`}
      style={{
        paddingLeft: !isSender && !isFirstMessageInGroup ? "2.5rem" : "0",
        paddingRight: isSender && !isFirstMessageInGroup ? "2.5rem" : "0",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!isSender && isFirstMessageInGroup && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={avatarUrl} alt={userName} />
          <AvatarFallback className="bg-neutral-300 text-black dark:bg-neutral-700 dark:text-white">
            {userName[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={`flex flex-col group ${isSender ? "items-end" : "items-start"}`}
        onMouseEnter={() => setIsTooltipVisible(true)}
        onMouseLeave={() => setIsTooltipVisible(false)}
      >
        {isFirstMessageInGroup && !isSender && (
          <div className="text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1">{userName}</div>
        )}

        <div className={`max-w-md rounded-3xl px-4 py-2 transition-colors ${bubbleColor}`}>
          <p className="text-sm leading-relaxed break-words">{message}</p>
        </div>

        {isFirstMessageInGroup && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  className="overflow-hidden" // Prevents layout shift
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={isTooltipVisible ? { opacity: 1, scale: 1, display: "block" } : { opacity: 0, scale: 0.95, display: "none" }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  layout
                >
                  <motion.time
                    className="text-xs mt-1 cursor-pointer text-neutral-500 dark:text-neutral-400"
                  >
                    {format(timestamp, "HH:mm")}
                  </motion.time>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent asChild forceMount>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="bg-neutral-800 text-white p-2 rounded-md shadow-lg"
                >
                  {format(timestamp, "PPpp")}
                </motion.div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {isSender && isFirstMessageInGroup && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={avatarUrl} alt={userName} />
          <AvatarFallback className="bg-neutral-300 text-neutral-800 dark:bg-neutral-700 dark:text-white">
            {userName[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
}
