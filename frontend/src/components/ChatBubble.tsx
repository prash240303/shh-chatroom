import * as React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
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
  const [isTooltipVisible, setIsTooltipVisible] = React.useState(false);
  return (
    <motion.div
      className={`flex items-start transition-all duration-50 ease-in-out space-x-2 mb-1 mt-2 ${isSender ? "justify-end" : "justify-start"
        }`}
      style={{
        paddingLeft: !isSender && !isFirstMessageInGroup ? "2.5rem" : "0",
        paddingRight: isSender && !isFirstMessageInGroup ? "2.5rem" : "0",
      }}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 25,
        mass: 0.3,
      }}

    >
      {!isSender && isFirstMessageInGroup && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={avatarUrl} alt={userName} />
          <AvatarFallback className="bg-primary/10 text-primary">
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
          <div className="text-xs font-medium text-foreground mb-1">{userName}</div>
        )}

        <div
          className={`max-w-md rounded-3xl px-4 py-2 transition-colors ${isSender ? " bg-chatPrimary text-primary-foreground dark:text-white" : "bg-primary/10 text-foreground"}`}
        >
          <p className="text-sm leading-relaxed break-words">{message}</p>
        </div>

        {isFirstMessageInGroup && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  className="overflow-hidden"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={
                    isTooltipVisible
                      ? { opacity: 1, scale: 1, display: "block" }
                      : { opacity: 0, scale: 0.95, display: "none" }
                  }
                  transition={{ duration: 0.3, delay: 0.2, ease: "easeInOut" }}
                  layout
                >
                  <motion.time className="text-xs mt-1 cursor-pointer text-muted-foreground">
                    {format(timestamp, "HH:mm")}
                  </motion.time>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent asChild forceMount>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 8 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    y: 8,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 240,
                    damping: 20,
                  }}

                  className="bg-popover text-popover-foreground border border-border p-2 rounded-md shadow-lg"
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
          <AvatarFallback className="bg-primary/10 text-primary ">
            {userName[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
}