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
  const INIT_SESSION_EMOTION = {
    primaryEmotion: "Neutral",
    emotionScore: 50,
    isNegative: false,
    riskLevel: 0,
    keywords: [],
    suggestion: "Keep observing your feelings gently.",
    icon: "😐",
    label: "Calm",
    riskDescription: "Stable emotional state",
    improvementSuggestions: [],
    timestamp: Date.now(),
  };
  const INIT_CONSULTATION_SESSION_QUERY = {
    page: 1,
    size: 10,
    userId: "",
    emotionTag: "",
    startDate: "",
    endDate: "",
    keyword: "",
  };
  // Session related
  const [consultationSessionQuery, setConsultationSessionQuery] = useState(
    INIT_CONSULTATION_SESSION_QUERY
  );
  const [sessionList, setSessionList] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sessionListLoading, setSessionListLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [hasMoreSessions, setHasMoreSessions] = useState(true);
  const [sessionTotalPages, setSessionTotalPages] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);

  const [currentSession, setCurrentSession] = useState(null); // { sessionId: "session_xxx", dbId, title }

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

  // Auto scroll to bottom ✅ (C)
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
    loadSessionMessages(currentSession.dbId);
    loadSessionEmotion(currentSession.sessionId);
    startEmotionPolling(currentSession.sessionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSession?.dbId, currentSession?.sessionId]);

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
    const { records, total, pages } = await loadSessionList(true);
    console.log("Session list refresh completed:", {
      recordsCount: records.length,
      total,
      pages,
    });
    return { records, total, pages };
  };

  // Load more sessions
  const loadMoreSessions = async () => {
    if (hasMoreSessions && !loadingMore) {
      setConsultationSessionQuery((prev) => ({
        ...prev,
        currentPage: prev.currentPage + 1,
      }));
      const { records, total, pages } = await loadSessionList(false);
      console.log("Load more sessions completed:", {
        recordsCount: records.length,
        total,
        pages,
      });
      return { records, total, pages };
    }
    return { records: [], total: 0, pages: 0 };
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

      // Only add non-empty query conditions
      if (consultationSessionQuery.userId) {
        params.userId = consultationSessionQuery.userId;
      }
      if (consultationSessionQuery.emotionTag) {
        params.emotionTag = consultationSessionQuery.emotionTag;
      }
      if (consultationSessionQuery.startDate) {
        params.startDate = consultationSessionQuery.startDate;
      }
      if (consultationSessionQuery.endDate) {
        params.endDate = consultationSessionQuery.endDate;
      }
      if (consultationSessionQuery.keyword) {
        params.keyword = consultationSessionQuery.keyword;
      }

      console.log("Sending query parameters:", params);
      const response = await api.get("/psychological-chat/sessions", {
        params: {
          ...params,
        },
      });

      console.log("Session list response:", response);

      const { code, data } = response.data;

      if (code === 200) {
        // Extract data from different possible response structures
        const responseData = result || response.data.data || response.data;
        const { records = [], total = 0, pages = 1 } = responseData;

        console.log("Session list retrieved successfully:", {
          recordsCount: records.length,
          total,
          pages,
          currentPage: params.currentPage,
        });

        // Update session list
        if (reset) {
          setSessionList(records);
          setConsultationSessionQuery((prev) => ({ ...prev, currentPage: 1 }));
        } else {
          setSessionList((prev) => [...prev, ...records]);
        }

        // Update pagination info
        setSessionTotalPages(pages);
        setSessionTotal(total);
        setHasMoreSessions(params.currentPage < pages);

        return { records, data };
      }
    } catch (error) {
      console.error("Failed to load session list:", error);

      if (error.response) {
        const { data: errorData, status } = error.response;
        console.error("Error response data:", errorData);

        if (status === 401) {
          alert("Login expired, please login again");
        } else {
          alert(`Failed to load session list: ${errorData.message || "Server error"}`);
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        alert("Network connection failed, please check your network and try again");
      } else {
        console.error("Request configuration error:", error.message);
        alert(`Request failed: ${error.message}`);
      }
    } finally {
      setSessionListLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSwitchSession = async (session) => {
    if (currentSession && currentSession.dbId === session.id) return;
    const sessionIdStr = `session_${session.id}`;
    const newSession = {
      sessionId: sessionIdStr,
      dbId: session.id,
      title: session.sessionTitle || "Untitled session",
      status: "ACTIVE",
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
      if (currentSession && currentSession.dbId === session.id) {
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
      const msgs = res.data.data;
      const formatted = (msgs || []).map((m) => ({
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

    // Already have formal session, direct streaming conversation
    await startAIResponse(currentSession.sessionId, text);
  };
  const startAIResponse = async (sessionId, userText) => {
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
    const cleanup = (complete = true, errorMessage = null) => {
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
      if (complete && currentSession?.sessionId) {
        startEmotionPolling(currentSession.sessionId);
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

          onmessage: (event) => {
            console.log("SSE MESSAGE:", event.event, event.data);

            if (!event.data) return;

            // ✅ Handle done event
            if (event.event === "done") {
              console.log("SSE DONE received");
              cleanup(true);
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

          onclose: () => {
            console.log("SSE CLOSED");
            // ✅ Also cleanup on normal close
            cleanup(true);
          },
        }
      );
    } catch (err) {
      console.error("SSE failed:", err);

      // ✅ Final fallback: ensure state cleanup
      cleanup(false, err.message || "Connection failed");

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
    stopEmotionPolling();
    if (!sessionId) return;

    // Immediately fetch once
    loadSessionEmotion(sessionId);

    let count = 0;
    pollTimerRef.current = setInterval(() => {
      count += 1;
      setEmotionPollingCount(count);
      if (count >= maxEmotionPollingCount) {
        stopEmotionPolling();
        return;
      }
      loadSessionEmotion(sessionId);
    }, 4000);
  };

  const loadSessionEmotion = async (sessionId) => {
    try {
      if (!sessionId) return;
      const res = await api.get(
        `/psychological-chat/session/${sessionId}/emotion`
      );
      const result = res.data.data;
      setEmotion((prev) => {
        if (!prev || (result?.timestamp || 0) > (prev.timestamp || 0)) {
          return result;
        }
        return prev;
      });
      // If latest result is received, can stop polling
      if (emotionPollingCount > 0) {
        stopEmotionPolling();
      }
    } catch (err) {
      // First time without result, give default value
      if (!emotion) {
        setEmotion(INIT_SESSION_EMOTION);
      }
    }
  };
  // Add in component
  const forceResetInputState = () => {
    setIsAiTyping(false);
    setIsLoading(false);
    if (sseAbortRef.current) {
      sseAbortRef.current.abort();
      sseAbortRef.current = null;
    }
    toast.success("Input state reset");
  };

  // // Add button in UI (for debugging only)
  // {(isAiTyping || isLoading) && (
  //   <button
  //     onClick={forceResetInputState}
  //     className="text-xs text-red-500 underline"
  //   >
  //     Force Reset (Debug)
  //   </button>
  // )}
  // ===================== Title Editing (B) =====================

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
      await api.put(`/psychological-chat/sessions/${currentSession.id}/title`, {
        sessionTitle: newTitle || null,
      });
      setCurrentSession((prev) =>
        prev ? { ...prev, title: newTitle || prev.title } : prev
      );
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSession.dbId
            ? { ...s, sessionTitle: newTitle || s.sessionTitle }
            : s
        )
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
              sessionId={currentSession?.sessionId}
              initialEmotionData={emotion}
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
                    onClick={() => loadSessionList(true)}
                    title="Refresh"
                  >
                    ⟳
                  </button>
                </div>
              </div>

              <div className="custom-scrollbar flex-1 space-y-2 overflow-y-auto">
                {sessionsLoading && (
                  <div className="py-6 text-center text-xs text-slate-400">
                    Loading sessions...
                  </div>
                )}
                {!sessionsLoading && sessions.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-6 text-xs text-slate-400">
                    <FontAwesomeIcon
                      icon={faComments}
                      className="mb-2 text-xl text-slate-200"
                    />
                    <p>No sessions yet.</p>
                  </div>
                )}

                {sessions.map((s) => {
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
              </div>
            </div>

            {/* Messages */}
            <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto px-6 py-4 bg-gradient-to-br from-white/40 to-orange-50/40">
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
                  disabled={isLoading || isAiTyping}
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
