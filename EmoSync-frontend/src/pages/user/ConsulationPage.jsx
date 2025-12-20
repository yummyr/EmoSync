import React, { useEffect, useRef, useState } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import {
  faRobot,
  faComments,
  faClock,
  faTrash,
  faEdit,
  faPlus,
  faHeart,
  faPaperPlane,
  faPhone,
  faStop,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import api from "@/api";

import EmotionGarden from "./components/EmotionGarden";
import EmergencyDialog from "./components/EmergencyDialog";
import ChatMessageBubble from "./components/ChatMessageBubble";

// Simple toast, using browser alert as replacement
const toast = {
  success: (msg) => console.log(msg),
  error: (msg) => console.error(msg),
  info: (msg) => console.log(msg),
};

// Get authentication token
function getAuthToken() {
  return localStorage.getItem("token") || "";
}

export default function ConsultationPage() {
  // Session related
  const [consultationSessionQuery, setConsultationSessionQuery] = useState({
    currentPage: 1,
    size: 10,
  });
  const [sessionList, setSessionList] = useState([]);

  const [sessionListLoading, setSessionListLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreSessions, setHasMoreSessions] = useState(true);
  const [currentSession, setCurrentSession] = useState({
    sessionId: null,
    dbId: null,
    title: null,
    status: null,
  });

  // Chat messages
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Header title editing
  const [isEditingHeaderTitle, setIsEditingHeaderTitle] = useState(false);
  const [headerTitleEdit, setHeaderTitleEdit] = useState("");

  // Emotion state
  const [emotion, setEmotion] = useState(null);
  const [emotionPollingCount, setEmotionPollingCount] = useState(0);

  // Emergency help
  const [showEmergency, setShowEmergency] = useState(false);

  // refs
  const messagesEndRef = useRef(null);
  const pollTimerRef = useRef(null);
  const sseAbortRef = useRef(null);

  const maxEmotionPollingCount = 10;

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages]);

  // Page initialization: load session list
  useEffect(() => {
    loadSessionList(true);
    // Create a frontend temporary session
    createNewFrontendSession(false);

    return () => {
      stopEmotionPolling();
      if (sseAbortRef.current) {
        sseAbortRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load messages & emotion when switching session
  useEffect(() => {
    if (!currentSession || !currentSession.dbId) return;
    console.log("Effect: session dbId changed:", currentSession);
    loadSessionMessages(currentSession.dbId);
    // Only load emotion and start polling for valid session IDs (not temp sessions)
    if (
      currentSession.sessionId &&
      currentSession.sessionId.startsWith("session_")
    ) {
      stopEmotionPolling();
      // Start emotion polling after emotion is loaded
      loadSessionEmotion(currentSession.sessionId);
      startEmotionPolling(currentSession.sessionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSession?.dbId, currentSession.sessionId]);

  // ===================== Session Related =====================

  const createNewFrontendSession = (showMsg = true) => {
    const temp = {
      sessionId: `temp_${Date.now()}`,
      dbId: null,
      title: "New conversation",
      status: "TEMP",
    };
    setCurrentSession(temp);
    setMessages([]);
    setEmotion(null);
    stopEmotionPolling();
    if (showMsg) {
      toast.success("New conversation created, you can start talking now.");
    }
  };
  // Refresh session list (reset to first page)
  const refreshSessionList = async () => {
    setConsultationSessionQuery((prev) => ({ ...prev, currentPage: 1 }));
    await loadSessionList(true);
  };

  // Load more sessions
  const loadMoreSessions = async () => {
    if (hasMoreSessions && !loadingMore) {
      setConsultationSessionQuery((prev) => ({
        ...prev,
        currentPage: prev.currentPage + 1,
      }));
      await loadSessionList(false);
    }
  };

  // Get session list
  const loadSessionList = async (reset = true) => {
    if (reset) {
      setSessionListLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      // Build query parameter object
      const params = {
        currentPage: reset ? 1 : consultationSessionQuery.currentPage,
        size: consultationSessionQuery.size,
      };

      console.log("Sending query parameters:", params);
      const response = await api.get("/psychological-chat/sessions", {
        params: {
          ...params,
        },
      });

      const code = response.data.code;
      const payload = response.data.data;

      if (code === 200 || code === "200") {
        const { records } = payload;
        // Update pagination info
        if (reset) {
          setSessionList(records);
        } else {
          setSessionList((prev) => [...prev, ...records]);
        }

        setHasMoreSessions(records.length >= params.size);
      }
    } catch (error) {
      console.error("Failed to load session list:", error);
      toast.error("Failed to load session list");
    } finally {
      setSessionListLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSwitchSession = async (session) => {
    if (currentSession && currentSession.dbId === session.id) return;
    stopEmotionPolling();

    const newSession = {
      sessionId: `session_${session.id}`,
      dbId: session.id,
      title: session.sessionTitle || "Untitled session",
      status: session.status || "ACTIVE",
    };
    setCurrentSession(newSession);
    toast.success(`Switched to session: ${newSession.title}`);
  };

  const handleDeleteSession = async (session) => {
    if (
      !window.confirm(`Delete session "${session.sessionTitle || "Untitled"}"?`)
    ) {
      return;
    }
    try {
      await api.delete(`/psychological-chat/sessions/${session.id}`);
      toast.success("Session deleted");
      if (currentSession?.dbId === session.id) {
        createNewFrontendSession(false);
      }
      loadSessionList(true);
    } catch (err) {
      console.error("Failed to delete session:", err);
      toast.error(err.message || "Failed to delete session");
    }
  };

  // ===================== Message Related =====================

  const formatTimeLabel = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "";
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60_000) return "Just now";
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} h ago`;
    return date.toLocaleString();
  };

  const loadSessionMessages = async (dbSessionId) => {
    try {
      const res = await api.get(`/psychological-chat/${dbSessionId}/messages`);
      console.log("Loaded messages:", res);
      const msgs = res.data.data || [];
      const formatted = msgs.map((m) => ({
        id: m.id,
        senderType: m.senderType === 1 ? 1 : 2, // 1: user, 2: ai
        content: m.messageContent,
        createdAt: m.createdAt,
        isComplete: true,
        isTyping: false,
        isError: false,
        timeLabel: formatTimeLabel(m.createdAt),
      }));
      setMessages(formatted);
    } catch (err) {
      console.error("Failed to load messages:", err);
      toast.error(err.message || "Failed to load messages");
    }
  };

  const sendMessage = async () => {
    console.log("Sending message:", userMessage);
    const text = userMessage.trim();
    if (!text) return;
    if (isAiTyping) {
      toast.info("Please wait for AI to finish typing.");
      return;
    }
    setUserMessage("");

    // Add user message first
    setMessages((prev) => [
      ...prev,
      {
        id: `user_${Date.now()}`,
        senderType: 1,
        content: text,
        createdAt: new Date().toISOString(),
        isComplete: true,
        isTyping: false,
        isError: false,
        timeLabel: "Just now",
      },
    ]);

    // If current is temporary session, call startChatSession first
    if (
      !currentSession ||
      currentSession.status === "TEMP" ||
      !currentSession.sessionId.startsWith("session_")
    ) {
      try {
        setIsLoading(true);
        const dto = {
          initialMessage: text,
          sessionTitle:
            (currentSession && currentSession.title !== "New conversation"
              ? currentSession.title
              : null) || `EmoSync - ${new Date().toLocaleString()}`,
        };
        console.log("Creating session:", dto);
        const res = await api.post("/psychological-chat/session/start", dto);
        const session = res.data.data;
        console.log("Created session:", session);
        const newSession = {
          sessionId: session.sessionId,
          dbId: parseInt(session.sessionId.replace("session_", ""), 10),
          title: session.sessionTitle || "Untitled session",
          status: "ACTIVE",
        };
        setCurrentSession(newSession);
        await loadSessionList(true);
        await startAIResponse(session.sessionId, text);
      } catch (err) {
        console.error("Failed to create session:", err);
        toast.error(err.message || "Failed to create session");
        setIsLoading(false);
      }
      return;
    }
    console.log("①Current session to start ai response:", currentSession);

    // Already have formal session, direct streaming conversation
    await startAIResponse(currentSession.sessionId, text);
  };
  const startAIResponse = async (sessionId, userText) => {
    console.log("②Starting AI response for session:", sessionId);
    const token = getAuthToken();
    if (!sessionId) {
      toast.error("Invalid session");
      return;
    }

    // 🔥 Force stop old SSE
    if (sseAbortRef.current) {
      console.log("Closing previous SSE connection...");
      sseAbortRef.current.abort();
      sseAbortRef.current = null;
    }

    const abort = new AbortController();
    sseAbortRef.current = abort;

    // Place AI typing placeholder message
    const aiMessageId = `ai_${Date.now()}`;
    setIsAiTyping(true);

    setMessages((prev) => [
      ...prev,
      {
        id: aiMessageId,
        senderType: 2,
        content: "",
        createdAt: new Date().toISOString(),
        isTyping: true,
        isComplete: false,
        isError: false,
        isRiskWarning: false,
        timeLabel: "",
      },
    ]);

    // ✅ Unified cleanup function - ensures execution
    const cleanup = async (complete = true, errorMessage = null) => {
      console.log("Cleaning up SSE connection, complete:", complete);

      // ✅ 1. Reset AI input state (most critical)
      setIsAiTyping(false);
      setIsLoading(false);

      // ✅ 2. Update message status
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessageId
            ? {
                ...m,
                isTyping: false,
                isComplete: complete,
                isError: !complete && !!errorMessage,
                content: errorMessage || m.content || "No response from AI",
                timeLabel: formatTimeLabel(m.createdAt),
              }
            : m
        )
      );

      // ✅ 3. Start emotion polling (only on success)
      if (complete && sessionId.startsWith("session_")) {
        console.log(
          "Starting emotion polling...after AI response success with sessionId:",
          sessionId
        );
        await loadSessionEmotion(sessionId);
        startEmotionPolling(sessionId);
      }

      // ✅ 4. Close SSE
      if (sseAbortRef.current) {
        sseAbortRef.current.abort();
        sseAbortRef.current = null;
      }
    };

    // ----------- Utility Functions -----------
    const append = (fragment) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessageId ? { ...m, content: m.content + fragment } : m
        )
      );
    };

    const pushWarning = (text) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `risk_${Date.now()}`,
          senderType: 2,
          content: text,
          createdAt: new Date().toISOString(),
          isRiskWarning: true,
          isTyping: false,
          isComplete: true,
          timeLabel: "Just now",
        },
      ]);
    };

    // ============ 🔥 Actual SSE Request ============
    try {
      console.log(
        "Connecting SSE → http://localhost:8080/api/psychological-chat/stream"
      );

      await fetchEventSource(
        "http://localhost:8080/api/psychological-chat/stream",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream",
          },
          body: JSON.stringify({
            sessionId,
            userMessage: userText,
          }),
          signal: abort.signal,

          onopen: async (response) => {
            console.log("SSE OPEN:", response.status, response.statusText);

            if (!response.ok) {
              // ✅ Immediate cleanup on HTTP error
              const errorText = await response.text();
              console.error("SSE connection failed:", errorText);
              cleanup(false, `Connection failed: ${response.status}`);
              throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
              );
            }

            // Check Content-Type
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("text/event-stream")) {
              console.error("Invalid content type:", contentType);
              cleanup(false, "Invalid response type");
              throw new Error("Response is not SSE stream");
            }
          },

          onmessage: async (event) => {
            console.log("SSE MESSAGE:", event.event, event.data);

            if (!event.data) return;

            // ✅ Handle done event
            if (event.event === "done") {
              console.log("SSE DONE received");
              await cleanup(true);
              return;
            }

            let payload;
            try {
              payload = JSON.parse(event.data);
            } catch (e) {
              console.error("JSON parse failed:", event.data);
              return;
            }

            // ✅ Check response code
            if (payload.code !== 200 && payload.code !== "200") {
              console.error("AI error response:", payload);
              append(
                "\n❌ AI error: " + (payload.message || "Unknown error") + "\n"
              );
              cleanup(false, payload.message);
              return;
            }

            const content = payload?.data?.content || "";

            // Risk warning
            if (event.event === "risk-warning") {
              pushWarning(content);
              return;
            }
            // Normal streaming message
            append(content);
          },

          onerror: (err) => {
            console.error("SSE ERROR:", err);
            cleanup(false, "Connection error");
            throw err; // Let fetchEventSource stop continuing
          },

          onclose: async () => {
            console.log("SSE CLOSED");
            // ✅ Also cleanup on normal close
            await cleanup(true);
          },
        }
      );
    } catch (err) {
      console.error("SSE failed:", err);

      // ✅ Final fallback: ensure state cleanup
     await cleanup(false, err.message || "Connection failed");

      // Friendly error messages
      if (err.message?.includes("404") || err.message?.includes("Not Found")) {
        toast.error(
          "SSE endpoint not found. Please check if backend is running."
        );
      } else if (err.message?.includes("Failed to fetch")) {
        toast.error("Network error. Please check your connection.");
      } else if (
        err.message?.includes("401") ||
        err.message?.includes("Unauthorized")
      ) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error("Connection failed: " + err.message);
      }
    }
  };

  // Use ref to store latest messages for use in SSE callbacks
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // ===================== Emotion Polling =====================

  const stopEmotionPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    setEmotionPollingCount(0);
  };

  const startEmotionPolling = (sessionId) => {
    console.log("Starting emotion polling for session:", sessionId);

    if (!sessionId || !sessionId.startsWith("session_")) {
      return;
    }
    stopEmotionPolling();

    let count = 0;
    pollTimerRef.current = setInterval(() => {
      console.log("Polling emotion count=:", count);
      count+=1;
      setEmotionPollingCount(count);
      if (count >= maxEmotionPollingCount) {
        console.log("Reached max polling count, stopEmotionPolling()");
        stopEmotionPolling();
        return;
      }
      console.log("Polling emotion for session:", sessionId, "count:", count);
      loadSessionEmotion(sessionId);
    }, 2000);
  };

  const loadSessionEmotion = async (sessionId) => {
    try {
      if (!sessionId || !sessionId.startsWith("session_")) return;

      const res = await api.get(
        `/psychological-chat/session/${sessionId}/emotion`
      );

      // Check if the response indicates an error
      const responseData = res.data;
      if (responseData && responseData.code === "-1") {
        console.error("Backend error:", responseData.message);
        return;
      }

      // Handle different possible response structures
      const result = responseData.data;

      console.log("Emotion data extracted:", result); // Debug log to see what we're extracting

      if (result) {
        setEmotion(result);
      } else {
        console.warn("No valid emotion data found in response");
      }
    } catch (err) {
      console.error("Error loading session emotion:", err);
      // Stop polling on error to avoid continuous failed requests
      if (emotionPollingCount > 0) {
        stopEmotionPolling();
      }
    }
  };

  const endChat = async () => {
    if (!currentSession || !currentSession.sessionId) {
      toast.error("No active chat to end.");
      return;
    }

    if (!window.confirm("Are you sure you want to end this chat session?")) {
      return;
    }

    try {
      // Stop SSE stream if running
      if (sseAbortRef.current) {
        sseAbortRef.current.abort();
        sseAbortRef.current = null;
      }

      setIsAiTyping(false);
      setIsLoading(false);

      const sessionId = currentSession.sessionId;

      console.log("Ending session:", sessionId);

      await api.post("/psychological-chat/session/end", null, {
        params: {
          sessionId,
        },
      });

      toast.success("Chat session ended.");

      // update UI
      setCurrentSession((prev) => (prev ? { ...prev, status: "ENDED" } : prev));
      setEmotion(null);
      stopEmotionPolling();
      loadSessionList(true);

      setMessages((prev) => [
        ...prev,
        {
          id: `ended_${Date.now()}`,
          senderType: 2,
          content: "This session has ended. Thank you for sharing with me. 💛",
          createdAt: new Date().toISOString(),
          isTyping: false,
          isComplete: true,
          isError: false,
          isEndedNotice: true,
          timeLabel: "Just now",
        },
      ]);

      createNewFrontendSession(false);
      toast.success("Chat session ended.");
    } catch (err) {
      console.error("Failed to end chat session:", err);
      toast.error(err.message || "Failed to end chat session");
    }
  };

  const handleStartEditHeaderTitle = () => {
    if (!currentSession) {
      toast.info("Please select a session first.");
      return;
    }
    setIsEditingHeaderTitle(true);
    setHeaderTitleEdit(currentSession.title || "");
  };

  const handleSaveHeaderTitle = async () => {
    if (!currentSession) return;
    const newTitle = headerTitleEdit.trim();
    if (currentSession.status === "TEMP") {
      // Local temporary session, only change frontend
      setCurrentSession((prev) =>
        prev ? { ...prev, title: newTitle || "New conversation" } : prev
      );
      setIsEditingHeaderTitle(false);
      toast.success("Title updated (will be saved when session starts).");
      return;
    }

    try {
      await api.put(
        `/psychological-chat/sessions/${currentSession.dbId}/title`,
        {
          sessionTitle: newTitle || null,
        }
      );
      setCurrentSession((prev) =>
        prev ? { ...prev, title: newTitle || prev.title } : prev
      );
      toast.success("Title updated.");
    } catch (err) {
      toast.error(err.message || "Failed to update title");
    } finally {
      setIsEditingHeaderTitle(false);
    }
  };

  const handleKeyDownHeaderTitle = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveHeaderTitle();
    } else if (e.key === "Escape") {
      setIsEditingHeaderTitle(false);
    }
  };

  // ===================== Input Box Send =====================

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ===================== Emergency Help =====================

  const openEmergencyDialog = () => setShowEmergency(true);
  const closeEmergencyDialog = () => setShowEmergency(false);

  // ===================== JSX =====================

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/60 to-slate-100 py-5">
      {/* Background soft light */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,207,232,0.4),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(191,219,254,0.4),transparent_55%)]" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-4 px-4">
        <div className="grid min-h-[calc(100vh-60px)] grid-cols-[320px_minmax(0,1fr)] gap-4">
          {/* Left sidebar */}
          <div className="flex flex-col gap-4">
            {/* AI assistant info */}
            <div className="rounded-2xl border border-orange-200/60 bg-gradient-to-br from-white/95 to-orange-50/90 p-4 shadow-[0_10px_30px_rgba(251,146,60,0.12)] backdrop-blur-md">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-3">
                  <div className="breathing-circle flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-400 text-white shadow-[0_6px_24px_rgba(251,146,60,0.35)]">
                    <FontAwesomeIcon icon={faRobot} className="text-2xl" />
                  </div>
                </div>
                <h3 className="mb-1 text-base font-semibold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                  EmoSync AI Assistant -Sunny
                </h3>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                  <span className="status-dot" />
                  Online · here with you
                </div>
              </div>
            </div>

            {/* Emotion Garden （D） */}
            <EmotionGarden
              emotion={emotion}
              onRefresh={() => {
                if (currentSession?.sessionId?.startsWith("session_")) {
                  loadSessionEmotion(currentSession.sessionId);
                }
              }}
              isRefreshing={false}
            />

            {/* Session history */}
            <div className="flex min-h-[260px] flex-col rounded-2xl bg-white/95 p-4 shadow-lg">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-800">
                  Conversation history
                </h4>
                <div className="flex items-center gap-1">
                  <button
                    className="rounded-md px-2 py-1 text-[11px] font-medium text-sky-600 hover:bg-sky-50"
                    onClick={() => createNewFrontendSession(true)}
                    title="New conversation"
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-1" />
                    New
                  </button>
                  <button
                    className="rounded-md items-center px-2 py-1 text-2xl  font-medium text-slate-500 hover:bg-slate-50"
                    onClick={() => refreshSessionList()}
                    title="Refresh"
                  >
                    ⟳
                  </button>
                </div>
              </div>

              <div className="custom-scrollbar flex-1 space-y-2 overflow-y-auto">
                {sessionListLoading && (
                  <div className="py-6 text-center text-xs text-slate-400">
                    Loading sessions...
                  </div>
                )}
                {!sessionListLoading &&
                  (!sessionList || sessionList.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-6 text-xs text-slate-400">
                      <FontAwesomeIcon
                        icon={faComments}
                        className="mb-2 text-xl text-slate-200"
                      />
                      <p>No sessions yet.</p>
                    </div>
                  )}

                {(sessionList || []).map((s) => {
                  const isActive =
                    currentSession && currentSession.dbId === s.id;
                  return (
                    <div
                      key={s.id}
                      className={`flex cursor-pointer items-start justify-between gap-2 rounded-xl border px-3 py-2 text-xs transition-all ${
                        isActive
                          ? "border-sky-400 bg-sky-50 shadow-sm"
                          : "border-slate-100 bg-white hover:border-sky-200 hover:bg-sky-50/60"
                      }`}
                      onClick={() => handleSwitchSession(s)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex items-center justify-between gap-2">
                          <div className="truncate font-medium text-slate-800">
                            {s.sessionTitle || "Untitled session"}
                            {s.status === "ENDED" && (
                              <span className="text-[10px] text-slate-400 ml-1">
                                🔒 Ended
                              </span>
                            )}
                          </div>
                          <span className="whitespace-nowrap text-[10px] text-slate-400">
                            {formatTimeLabel(s.startedAt)}
                          </span>
                        </div>
                        <div className="mb-0.5 truncate text-[11px] text-slate-500">
                          {s.lastMessageContent || "No messages yet"}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <FontAwesomeIcon icon={faComments} />
                            {s.messageCount || 0}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <FontAwesomeIcon icon={faClock} />
                            {s.durationMinutes || 0} min
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          className="rounded-md px-1.5 py-0.5 text-[10px] text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditingHeaderTitle(true);
                            setHeaderTitleEdit(
                              s.sessionTitle || "Untitled session"
                            );
                            setCurrentSession((prev) =>
                              prev && prev.dbId === s.id
                                ? prev
                                : {
                                    sessionId: `session_${s.id}`,
                                    dbId: s.id,
                                    title: s.sessionTitle || "Untitled session",
                                    status: "ACTIVE",
                                  }
                            );
                          }}
                          title="Edit title"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          className="rounded-md px-1.5 py-0.5 text-[10px] text-red-400 hover:bg-red-50 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(s);
                          }}
                          title="Delete"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {hasMoreSessions && (
                  <div className="py-2 text-center">
                    <button
                      className="rounded-full bg-slate-50 px-3 py-1 text-[11px] text-slate-500 hover:bg-slate-100"
                      onClick={loadMoreSessions}
                    >
                      Load more...
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency help */}
            <div className="rounded-2xl border border-red-200/70 bg-gradient-to-br from-rose-50 to-red-50/90 p-4 shadow-[0_8px_24px_rgba(248,113,113,0.25)]">
              <h4 className="mb-1 text-sm font-semibold text-red-600">
                Emergency help
              </h4>
              <p className="mb-3 text-[11px] text-red-500">
                If you are in crisis or considering self-harm, please seek
                professional help immediately.
              </p>
              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-400 to-red-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:translate-y-[1px] hover:shadow-xl"
                onClick={openEmergencyDialog}
              >
                <FontAwesomeIcon icon={faPhone} />
                Crisis hotlines
              </button>
            </div>
          </div>

          {/* Right chat area */}
          <div className="flex h-[calc(100vh-60px)] flex-col rounded-2xl border border-orange-200/70 bg-gradient-to-br from-white/95 to-orange-50/95 shadow-[0_16px_45px_rgba(251,146,60,0.18)] backdrop-blur-md">
            {/* Header */}
            <div className="relative flex items-center justify-between px-6 py-4 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-300 text-white shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 shadow-md">
                  <FontAwesomeIcon icon={faHeart} className="text-xl" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    {!isEditingHeaderTitle && (
                      <h2
                        className="cursor-pointer text-lg font-bold hover:text-sky-100"
                        onDoubleClick={handleStartEditHeaderTitle}
                      >
                        {currentSession?.title || "EmoSync AI companion"}
                      </h2>
                    )}
                    {isEditingHeaderTitle && (
                      <input
                        className="w-52 rounded-md border border-white/60 bg-white/90 px-2 py-1 text-sm text-slate-800 shadow-sm focus:border-sky-400 focus:outline-none"
                        value={headerTitleEdit}
                        onChange={(e) => setHeaderTitleEdit(e.target.value)}
                        onBlur={handleSaveHeaderTitle}
                        onKeyDown={handleKeyDownHeaderTitle}
                        autoFocus
                      />
                    )}
                    {!isEditingHeaderTitle && (
                      <button
                        className="rounded-md bg-white/10 px-2 py-1 text-[11px] hover:bg-white/20"
                        onClick={handleStartEditHeaderTitle}
                        title="Edit title"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-orange-50">
                    Professional · Accompaniment · Understanding
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium hover:bg-white/25"
                  onClick={() => createNewFrontendSession(true)}
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-1" />
                  New chat
                </button>

                <button
                  className="rounded-full bg-pink-400 px-3 py-1 text-xs font-medium text-white hover:bg-white/25 hover:text-red-400"
                  onClick={endChat}
                  disabled={
                    !currentSession || currentSession.status !== "ACTIVE"
                  }
                  title="End this chat session"
                >
                  <FontAwesomeIcon icon={faStop} className="mr-1" />
                  End chat
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto px-6 py-4 bg-gradient-to-br from-white/40 to-orange-50/40">
              {currentSession?.status === "ENDED" && (
                <div className="mx-auto mb-4 max-w-xl rounded-2xl border border-slate-300 bg-slate-100/80 px-4 py-2 text-center text-sm text-slate-600">
                  This session has ended. Start a new conversation anytime.
                </div>
              )}

              {/* Welcome message */}
              {messages.length === 0 && (
                <div className="mb-4 max-w-xl rounded-2xl border border-orange-100 bg-white/90 p-3 shadow-sm">
                  <ChatMessageBubble
                    message={{
                      senderType: 2,
                      content:
                        "Hi, my name is Sunny, your AI mental health companion. I'm here to listen and support you. How are you feeling today? 💛",
                      createdAt: new Date().toISOString(),
                      isComplete: true,
                      isTyping: false,
                      isError: false,
                      timeLabel: "Just now",
                    }}
                  />
                </div>
              )}

              {messages.map((m) => (
                <ChatMessageBubble key={m.id} message={m} />
              ))}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex items-end gap-3 border-t border-orange-200/60 bg-gradient-to-br from-white/85 to-orange-50/90 px-6 py-3">
              <div className="flex-1">
                <textarea
                  className="message-input w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-800 shadow-sm outline-none ring-0 focus:border-sky-400 focus:ring-1 focus:ring-sky-200 custom-scrollbar resize-none"
                  rows={3}
                  placeholder="Share anything on your mind..."
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  disabled={
                    isLoading ||
                    isAiTyping ||
                    currentSession?.status === "ENDED"
                  }
                />
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Press Enter to send · Shift + Enter for new line</span>
                  <span
                    className={userMessage.length > 500 ? "text-red-400" : ""}
                  >
                    {userMessage.length}/500
                  </span>
                </div>
              </div>
              <button
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-amber-400 text-white shadow-lg transition-all hover:translate-y-[1px] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                onClick={sendMessage}
                disabled={
                  currentSession?.status === "ENDED" ||
                  !userMessage.trim() ||
                  userMessage.length > 500 ||
                  isLoading ||
                  isAiTyping
                }
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency modal */}
      {showEmergency && (
        <EmergencyDialog open={showEmergency} onClose={closeEmergencyDialog} />
      )}
    </div>
  );
}
