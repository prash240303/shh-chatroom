import React from "react";
import classNames from "classnames";

interface ChatBubbleProps {
  message: string;
  isSender: boolean; // Indicates if the message is sent by the current user
  userName: string;  // User's name to display for the receiver
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isSender, userName }) => {
  return (
    <div
      className={classNames("flex mb-2", {
        "justify-end": isSender,
        "justify-start": !isSender,
      })}
    >
      <div
        className={classNames("p-3 rounded-lg max-w-xs break-words", {
          "bg-blue-500 text-white": isSender,
          "bg-gray-300 text-black": !isSender,
        })}
      >
        {!isSender && <div className="text-sm font-semibold mb-1">{userName}</div>}
        <div>{message}</div>
      </div>
    </div>
  );
};

export default ChatBubble;
