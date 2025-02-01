import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ChatBubbleProps {
  message: string
  isSender: boolean
  userName: string
  timestamp: Date
  avatarUrl?: string
  isFirstMessageInGroup: boolean // Tracks the first message in a group
}

export function ChatBubble({
  message,
  isSender,
  userName,
  timestamp,
  avatarUrl,
  isFirstMessageInGroup,
}: ChatBubbleProps) {
  const [isTooltipVisible, setIsTooltipVisible] = React.useState(false)
  const theme = "dark"

  const bubbleColors = {
    sender: {
      light: 'bg-neutral-100 text-white',
      dark: 'bg-neutral-300 text-black',
    },
    receiver: {
      light: 'bg-neutral-200 text-neutral-900',
      dark: 'bg-neutral-700 text-neutral-100',
    },
  }

  const bubbleColor = isSender
    ? (theme === 'dark' ? bubbleColors.sender.dark : bubbleColors.sender.light)
    : (theme === 'dark' ? bubbleColors.receiver.dark : bubbleColors.receiver.light)

  return (
    <motion.div
      className={`flex items-start transition-all duration-200 ease-in-out space-x-2 ${isSender ? 'justify-end' : 'justify-start'} mb-1`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Render Avatar only for the first message in the group */}
      {!isSender && isFirstMessageInGroup && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={avatarUrl} alt={userName} />
          <AvatarFallback>{userName[0]}</AvatarFallback>
        </Avatar>
      )}

      <div className={`flex group flex-col ${isSender ? 'items-end' : 'items-start'}`}>
        {/* Render username only for the first message in the group */}
        {isFirstMessageInGroup && !isSender && (
          <div className="text-xs font-medium text-neutral-300 mb-1">{userName}</div>
        )}

        <div className={`max-w-md rounded-3xl px-4 py-2 shadow-md ${bubbleColor}`}>
          <p className="text-sm leading-relaxed break-words">{message}</p>
        </div>

        {/* Render timestamp only for the first message in the group */}
        {isFirstMessageInGroup && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.time
                  className="text-xs group-hover:flex hidden text-muted-foreground mt-1 cursor-pointer"
                  onHoverStart={() => setIsTooltipVisible(true)}
                  onHoverEnd={() => setIsTooltipVisible(false)}
                >
                  {format(timestamp, 'HH:mm')}
                </motion.time>
              </TooltipTrigger>
              <AnimatePresence>
                {isTooltipVisible && (
                  <TooltipContent asChild forceMount>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                    >
                      <p>{format(timestamp, 'PPpp')}</p>
                    </motion.div>
                  </TooltipContent>
                )}
              </AnimatePresence>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Render Avatar for sender only for the first message in the group */}
      {isSender && isFirstMessageInGroup && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={avatarUrl} alt={userName} />
          <AvatarFallback>{userName[0].toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  )
}
