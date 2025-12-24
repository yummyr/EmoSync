import {
  faRobot,
  faComments,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


function ChatMessageBubble({ message }) {
  const isUser = message.senderType === 1 || message.role === "user";
  const isRiskWarning = message.isRiskWarning;

  if (isRiskWarning) {
    return (
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-amber-400 text-white shadow-md">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-sm" />
        </div>
        <div className="max-w-[70%]">
          <div className="risk-warning-bubble">
            <div className="flex items-center gap-2 text-sm font-semibold text-red-900">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="risk-icon"
              />
              <span>Mental health alert</span>
            </div>
            <div className="risk-warning-content text-[13px] leading-relaxed text-red-900/90">
              {message.content}
            </div>
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {message.timeLabel || "Just now"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-3 ${
        isUser ? "flex-row-reverse text-right" : "flex-row"
      }`}
    >
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-white shadow-md ${
          isUser
            ? "bg-gradient-to-br from-slate-500 to-slate-700"
            : "bg-gradient-to-br from-orange-400 to-amber-400"
        }`}
      >
        <FontAwesomeIcon
          icon={isUser ? faComments : faRobot}
          className="text-sm"
        />
      </div>
      <div
        className={`${
          isUser ? "items-end" : "items-start"
        } flex flex-col max-w-[70%]`}
      >
        <div
          className={`message-bubble-base ${
            isUser
              ? "user-message-bubble"
              : message.isTyping
              ? "typing-bubble"
              : "ai-message-bubble"
          }`}
        >
          {/* Typing indicator */}
          {message.isTyping && !message.content && (
            <div className="flex gap-1 py-1">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          )}

          {/* Error message */}
          {message.isError && (
            <div className="flex items-center gap-2 text-sm text-red-800">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <span>{message.content}</span>
            </div>
          )}

          {/* Normal content */}
          {!message.isTyping && !message.isError && message.content && (
            <p
              className="whitespace-pre-wrap text-[13px] leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: message.content.replace(/\n/g, "<br />"),
              }}
            />
          )}
        </div>
        <div className="mt-1 text-xs text-slate-400">
          {message.isTyping ? "Typing..." : message.timeLabel || ""}
        </div>
      </div>
    </div>
  );
}

export default ChatMessageBubble;