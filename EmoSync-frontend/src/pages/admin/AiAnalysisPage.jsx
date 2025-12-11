// src/pages/AiAnalysisPage.jsx
import React, { useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSyncAlt,
  faClock,
  faTasks,
  faRedo,
  faUser,
  faRobot,
  faHandPointer,
  faUserShield,
  faLayerGroup,
  faArrowDown,
  faMinus,
  faArrowUp,
  faExclamation,
  faCheckCircle,
  faTimesCircle,
  faCog,
  faQuestionCircle,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import api from "@/api";
import Pagination from "@/components/Pagination";

async function getAiAnalysisTaskPage(params) {
  // Expected return: { records, total, current, size, pages }
  return api.get("/ai-analysis-task/page", params);
}

async function getAiAnalysisTaskStatistics() {
  // Expected return:
  // { totalTasks, pendingTasks, processingTasks, completedTasks, failedTasks, retryableTasks, taskTypeStats }
  return api.get("/ai-analysis-task/statistics");
}

async function retryAiAnalysisTask(taskId) {
  return api.post(`/ai-analysis-task/${taskId}/retry`, null);
}

async function batchRetryAiAnalysisTasks(taskIds) {
  // Expected return:
  // { totalCount, successCount, failCount, failReasons }
  return api.post("/ai-analysis-task/batch-retry", taskIds);
}

// ---------------------
// Main Page Component
// ---------------------
const REFRESH_INTERVAL_KEY = "ai_analysis_queue_refresh_interval";

const AiAnalysisPage = () => {
  // Loading & table
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedIds, setSelectedIds] = useState([]);

  // Filters
  const [status, setStatus] = useState("");
  const [taskType, setTaskType] = useState("");
  const [priority, setPriority] = useState(""); // store as string, convert when sending
  const [username, setUsername] = useState("");
  const [failedOnly, setFailedOnly] = useState(false);
  const [retryableOnly, setRetryableOnly] = useState(false);

  // Date range (two datetime-local inputs)
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  // Auto-refresh
  const [refreshInterval, setRefreshInterval] = useState(() => {
    const stored = localStorage.getItem(REFRESH_INTERVAL_KEY);
    return stored ? parseInt(stored, 10) || 10000 : 10000; // default 10s
  });
  const [countdown, setCountdown] = useState(0);

  // Queue statistics
  const [queueStats, setQueueStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    processingTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    retryableTasks: 0,
    taskTypeStats: {},
  });

  const toBackendDateTime = (value) => {
    // HTML datetime-local returns "YYYY-MM-DDTHH:mm"
    if (!value) return "";
    if (value.includes("T")) {
      const [date, time] = value.split("T");
      // Append seconds if missing
      const fullTime = time.length === 5 ? `${time}:00` : time;
      return `${date} ${fullTime}`;
    }
    return value;
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "-";
    const date = new Date(dateTimeStr);
    if (Number.isNaN(date.getTime())) return dateTimeStr;
    return date.toLocaleString("en-US");
  };

  const formatDuration = (ms) => {
    if (!ms) return "-";
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  };

  const getStatusConfig = (statusValue, description) => {
    switch (statusValue) {
      case "PENDING":
        return {
          label: description || "Pending",
          className: "bg-amber-100 text-amber-800 border border-amber-200",
          icon: faClock,
        };
      case "PROCESSING":
        return {
          label: description || "Processing",
          className:
            "bg-sky-100 text-sky-800 border border-sky-200 animate-pulse",
          icon: faCog,
        };
      case "COMPLETED":
        return {
          label: description || "Completed",
          className:
            "bg-emerald-100 text-emerald-800 border border-emerald-200",
          icon: faCheckCircle,
        };
      case "FAILED":
        return {
          label: description || "Failed",
          className: "bg-rose-100 text-rose-800 border border-rose-200",
          icon: faTimesCircle,
        };
      default:
        return {
          label: description || statusValue || "Unknown",
          className: "bg-slate-100 text-slate-700 border border-slate-200",
          icon: faQuestionCircle,
        };
    }
  };

  const getTaskTypeConfig = (typeValue, description) => {
    switch (typeValue) {
      case "AUTO":
        return {
          label: description || "Auto",
          className: "bg-slate-100 text-slate-800 border border-slate-200",
          icon: faRobot,
        };
      case "MANUAL":
        return {
          label: description || "Manual",
          className: "bg-indigo-100 text-indigo-800 border border-indigo-200",
          icon: faHandPointer,
        };
      case "ADMIN":
        return {
          label: description || "Admin",
          className: "bg-amber-100 text-amber-800 border border-amber-200",
          icon: faUserShield,
        };
      case "BATCH":
        return {
          label: description || "Batch",
          className:
            "bg-emerald-100 text-emerald-800 border border-emerald-200",
          icon: faLayerGroup,
        };
      default:
        return {
          label: description || typeValue || "Unknown",
          className: "bg-slate-100 text-slate-700 border border-slate-200",
          icon: faQuestionCircle,
        };
    }
  };

  const getPriorityConfig = (priorityValue, description) => {
    switch (priorityValue) {
      case 1:
        return {
          label: description || "Low",
          className: "bg-slate-100 text-slate-800 border border-slate-200",
          icon: faArrowDown,
        };
      case 2:
        return {
          label: description || "Normal",
          className: "bg-sky-100 text-sky-800 border border-sky-200",
          icon: faMinus,
        };
      case 3:
        return {
          label: description || "High",
          className: "bg-amber-100 text-amber-800 border border-amber-200",
          icon: faArrowUp,
        };
      case 4:
        return {
          label: description || "Urgent",
          className: "bg-rose-100 text-rose-800 border border-rose-200",
          icon: faExclamation,
        };
      default:
        return {
          label: description || "Unknown",
          className: "bg-slate-100 text-slate-700 border border-slate-200",
          icon: faQuestionCircle,
        };
    }
  };

  const fetchQueueStatistics = useCallback(async () => {
    try {
      const stats = await getAiAnalysisTaskStatistics();
      setQueueStats((prev) => ({
        ...prev,
        ...stats,
      }));
    } catch (error) {
      console.error("Failed to fetch queue statistics:", error);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        current: currentPage,
        size: pageSize,
      };

      if (status) params.status = status;
      if (taskType) params.taskType = taskType;
      if (priority && priority !== "") {
        const p = Number(priority);
        if (!Number.isNaN(p)) params.priority = p;
      }
      if (username.trim()) params.username = username.trim();
      if (dateRange.start)
        params.startTime = toBackendDateTime(dateRange.start);
      if (dateRange.end) params.endTime = toBackendDateTime(dateRange.end);
      if (failedOnly) params.failedOnly = true;
      if (retryableOnly) params.retryableOnly = true;

      const page = await getAiAnalysisTaskPage(params);
      setTasks(page.records || []);
      setTotal(page.total || 0);
    } catch (error) {
      console.error("Failed to fetch AI analysis tasks:", error);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    status,
    taskType,
    priority,
    username,
    dateRange,
    failedOnly,
    retryableOnly,
  ]);

  // ---------------------
  // Auto-refresh & countdown
  // ---------------------
  useEffect(() => {
    // On mount + whenever dependencies change, fetch immediately
    fetchQueueStatistics();
    fetchTasks();
  }, [fetchQueueStatistics, fetchTasks]);

  useEffect(() => {
    // Auto refresh timer
    const autoId = setInterval(() => {
      fetchQueueStatistics();
      fetchTasks();
      setCountdown(refreshInterval);
    }, refreshInterval);

    // Countdown timer
    setCountdown(refreshInterval);
    const countdownId = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 100) return 0;
        return prev - 100;
      });
    }, 100);

    return () => {
      clearInterval(autoId);
      clearInterval(countdownId);
    };
  }, [refreshInterval, fetchQueueStatistics, fetchTasks]);

  const handleRefreshNow = () => {
    fetchQueueStatistics();
    fetchTasks();
    setCountdown(refreshInterval);
  };

  const handleRefreshIntervalChange = (e) => {
    const value = Number(e.target.value);
    if (!Number.isNaN(value) && value > 0) {
      setRefreshInterval(value);
      localStorage.setItem(REFRESH_INTERVAL_KEY, value.toString());
      window.alert(`Auto refresh interval updated to ${value / 1000} seconds.`);
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault?.();
    setCurrentPage(1);
    fetchTasks();
  };

  const handleReset = () => {
    setStatus("");
    setTaskType("");
    setPriority("");
    setUsername("");
    setFailedOnly(false);
    setRetryableOnly(false);
    setDateRange({ start: "", end: "" });
    setCurrentPage(1);
    setSelectedIds([]);
    fetchTasks();
  };

  // ---------------------
  // Pagination handlers
  // ---------------------
  const handlePageChange = (newPage) => {
    if (newPage < 1) return;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (size) => {
    if (!Number.isNaN(size) && size > 0) {
      setPageSize(size);
      setCurrentPage(1);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // ---------------------
  // Selection handlers
  // ---------------------
  const isSelected = (id) => selectedIds.includes(id);

  const handleToggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleAllCurrentPage = (e) => {
    const checked = e.target.checked;
    const currentIds = tasks.map((t) => t.id);
    if (checked) {
      setSelectedIds((prev) => {
        const set = new Set(prev);
        currentIds.forEach((id) => set.add(id));
        return Array.from(set);
      });
    } else {
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    }
  };

  const allCurrentSelected =
    tasks.length > 0 && tasks.every((t) => selectedIds.includes(t.id));

  // ---------------------
  // Retry handlers
  // ---------------------
  const handleRetryTask = async (task) => {
    const ok = window.confirm(
      `Are you sure you want to retry task #${task.id}?`
    );
    if (!ok) return;
    try {
      await retryAiAnalysisTask(task.id);
      window.alert("Task retry has been triggered.");
      fetchTasks();
      fetchQueueStatistics();
    } catch (error) {
      console.error("Retry task failed:", error);
      window.alert("Failed to retry task. Please check console for details.");
    }
  };

  const handleBatchRetry = async () => {
    if (selectedIds.length === 0) {
      window.alert("Please select tasks to retry.");
      return;
    }

    const selectedTasks = tasks.filter((t) => selectedIds.includes(t.id));
    const retryableTasks = selectedTasks.filter((t) => t.canRetry);

    if (retryableTasks.length === 0) {
      window.alert("None of the selected tasks can be retried.");
      return;
    }

    const ok = window.confirm(
      `Retry ${retryableTasks.length} retryable task(s)?`
    );
    if (!ok) return;

    const taskIds = retryableTasks.map((t) => t.id);

    try {
      const result = await batchRetryAiAnalysisTasks(taskIds);
      const {
        totalCount = taskIds.length,
        successCount = 0,
        failCount = 0,
        failReasons = [],
      } = result || {};

      let message = `Batch retry finished.\nTotal: ${totalCount}, Success: ${successCount}`;
      if (failCount > 0) {
        message += `, Failed: ${failCount}`;
        if (failReasons.length > 0) {
          message += `\n\nFailure reasons:\n${failReasons
            .slice(0, 3)
            .join("\n")}`;
          if (failReasons.length > 3) {
            message += `\n... and ${failReasons.length - 3} more.`;
          }
        }
      }
      window.alert(message);

      setSelectedIds([]);
      fetchTasks();
      fetchQueueStatistics();
    } catch (error) {
      console.error("Batch retry failed:", error);
      window.alert("Batch retry failed. Please check console for details.");
    } finally {
      fetchQueueStatistics();
    }
  };

  return (
    <div className="ai-analysis-queue px-6 py-8 bg-slate-50 min-h-screen">
      {/* Page Header */}
      <div className="page-header mb-6">
        <div className="header-content flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white rounded-2xl px-6 py-5 shadow-sm">
          <div className="header-actions flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="auto-refresh-controls flex items-center gap-3 px-3 py-2 bg-sky-50 border border-sky-100 rounded-lg">
              <span className="refresh-label flex items-center text-xs sm:text-sm text-slate-600 font-medium whitespace-nowrap">
                <FontAwesomeIcon
                  icon={faSyncAlt}
                  className="mr-1 text-sky-500"
                />
                Auto refresh:
              </span>

              <select
                value={refreshInterval}
                onChange={handleRefreshIntervalChange}
                className="text-xs sm:text-sm border border-slate-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={5000}>Every 5s</option>
                <option value={10000}>Every 10s</option>
                <option value={30000}>Every 30s</option>
                <option value={60000}>Every 1 min</option>
                <option value={120000}>Every 2 min</option>
              </select>

              {countdown > 0 && (
                <span className="countdown-text flex items-center text-xs text-emerald-600 font-semibold whitespace-nowrap">
                  <FontAwesomeIcon icon={faClock} className="mr-1" />
                  Refresh in {Math.ceil(countdown / 1000)}s
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleRefreshNow}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium shadow-sm hover:bg-emerald-600 disabled:bg-emerald-300"
            >
              <FontAwesomeIcon
                icon={faSyncAlt}
                className={loading ? "animate-spin" : ""}
              />
              <span>Refresh Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <div className="stat-card group bg-white rounded-2xl px-5 py-4 shadow-sm flex items-center justify-between">
          <div className="stat-info">
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Total Tasks
            </p>
            <p className="stat-value text-2xl font-semibold text-slate-800 mt-1">
              {queueStats.totalTasks ?? 0}
            </p>
          </div>

          <div className="relative">
            <div className="relative w-12 h-12 rounded-full bg-white flex items-center justify-center z-10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-200 via-indigo-400 to-indigo-600 animate-gradient-flow bg-[length:100%_200%]"></div>
              <FontAwesomeIcon
                icon={faTasks}
                className="text-indigo-700 relative z-10 animate-icon-bounce"
              />
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Pending/Processing */}
        <div className="stat-card group bg-white rounded-2xl px-5 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="stat-info">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Pending / Processing
              </p>
              <p className="stat-value text-2xl font-semibold text-sky-700 mt-1">
                {(queueStats.pendingTasks ?? 0) +
                  (queueStats.processingTasks ?? 0)}
              </p>
            </div>
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faCog}
                  className="w-6 h-6 text-white"
                  style={{ animation: "spin 2s linear infinite" }}
                />
              </div>
              {queueStats.processingTasks > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
              )}
            </div>
          </div>
        </div>

        <div className="stat-card group bg-white rounded-2xl px-5 py-4 shadow-sm flex items-center justify-between">
          <div className="stat-info">
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Completed
            </p>
            <p className="stat-value text-2xl font-semibold text-emerald-700 mt-1">
              {queueStats.completedTasks ?? 0}
            </p>
          </div>
          <div className="stat-icon w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="group-hover:scale-125 transition-transform duration-300"
            />
          </div>
        </div>

        <div className="stat-card group bg-white rounded-2xl px-5 py-4 shadow-sm flex items-center justify-between">
          <div className="stat-info">
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Failed
            </p>
            <p className="stat-value text-2xl font-semibold text-pink-600 mt-1">
              {queueStats.failedTasks ?? 0}
            </p>
          </div>
          <div className="stat-icon w-12 h-12 rounded-full bg-pink-400 flex items-center justify-center text-white">
            <FontAwesomeIcon
              icon={faTimesCircle}
              className="group-hover:animate-ping-slow transition-all duration-300"
            />
          </div>
        </div>

        <div className="stat-card group bg-white rounded-2xl px-5 py-4 shadow-sm flex items-center justify-between">
          <div className="stat-info">
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Retryable
            </p>
            <p className="stat-value text-2xl font-semibold text-amber-600 mt-1">
              {queueStats.retryableTasks ?? 0}
            </p>
          </div>
          <div
            className="stat-icon w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white
            group-hover:bg-amber-600 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300"
          >
            <FontAwesomeIcon
              icon={faRedo}
              className={`group-hover:animate-spin-slow ${
                queueStats.retryableTasks > 0 ? "animate-pulse" : ""
              }`}
            />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="search-area bg-white rounded-2xl px-5 py-4 mb-6 shadow-sm">
        <form
          onSubmit={handleSearch}
          className="search-form flex flex-wrap gap-4 items-end"
        >
          {/* Task Status */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">
              Task Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-40 border border-slate-200 rounded-md px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {/* Task Type */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">
              Task Type
            </label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              className="w-44 border border-slate-200 rounded-md px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="">All</option>
              <option value="AUTO">Auto Trigger</option>
              <option value="MANUAL">Manual Trigger</option>
              <option value="ADMIN">Admin Trigger</option>
              <option value="BATCH">Batch Trigger</option>
            </select>
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-36 border border-slate-200 rounded-md px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="">All</option>
              <option value="1">Low</option>
              <option value="2">Normal</option>
              <option value="3">High</option>
              <option value="4">Urgent</option>
            </select>
          </div>

          {/* Username Search */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">
              User Search
            </label>
            <div className="relative w-56">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username..."
                className="w-full border border-slate-200 rounded-md pl-9 pr-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Time Range */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">
              Time Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="datetime-local"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
                className="border border-slate-200 rounded-md px-2 py-1.5 text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
              />
              <span className="text-xs text-slate-500">to</span>
              <input
                type="datetime-local"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
                className="border border-slate-200 rounded-md px-2 py-1.5 text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Flags */}
          <div className="flex flex-col gap-2 mt-1">
            <label className="text-xs font-medium text-slate-600">
              Filters
            </label>
            <div className="flex flex-wrap gap-3">
              <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={failedOnly}
                  onChange={(e) => setFailedOnly(e.target.checked)}
                  className="rounded border-slate-300 text-rose-500 focus:ring-rose-500"
                />
                Failed only
              </label>
              <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={retryableOnly}
                  onChange={(e) => setRetryableOnly(e.target.checked)}
                  className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                />
                Retryable only
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 ml-auto mt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Table Section */}
      <div className="table-section bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Table Header (title + batch actions) */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <FontAwesomeIcon icon={faTasks} className="text-indigo-500" />
            <span>
              Task Queue{" "}
              <span className="text-slate-400 font-normal">
                ({total} task{total === 1 ? "" : "s"})
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBatchRetry}
              disabled={selectedIds.length === 0}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-emerald-300"
            >
              <FontAwesomeIcon icon={faRedo} />
              <span>Batch Retry ({selectedIds.length})</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={allCurrentSelected}
                    onChange={handleToggleAllCurrentPage}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-4 py-3 text-left w-20">Task ID</th>
                <th className="px-4 py-3 text-left w-56">Diary Info</th>
                <th className="px-4 py-3 text-left w-32">Status</th>
                <th className="px-4 py-3 text-left w-32">Type</th>
                <th className="px-4 py-3 text-left w-32">Priority</th>
                <th className="px-4 py-3 text-left w-32">Retry Info</th>
                <th className="px-4 py-3 text-left min-w-[200px]">
                  Error Message
                </th>
                <th className="px-4 py-3 text-left w-56">Time Info</th>
                <th className="px-4 py-3 text-left w-32">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    <div className="inline-flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faSyncAlt}
                        className="animate-spin text-indigo-500"
                      />
                      <span>Loading tasks...</span>
                    </div>
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    No tasks found. Try adjusting your filters.
                  </td>
                </tr>
              ) : (
                tasks.map((row) => {
                  const statusCfg = getStatusConfig(
                    row.status,
                    row.statusDescription
                  );
                  const typeCfg = getTaskTypeConfig(
                    row.taskType,
                    row.taskTypeDescription
                  );
                  const prioCfg = getPriorityConfig(
                    row.priority,
                    row.priorityDescription
                  );
                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {/* Selection */}
                      <td className="px-4 py-3 align-top">
                        <input
                          type="checkbox"
                          checked={isSelected(row.id)}
                          onChange={() => handleToggleRow(row.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>

                      {/* Task ID */}
                      <td className="px-4 py-3 align-top text-slate-800 font-medium">
                        #{row.id}
                      </td>

                      {/* Diary Info */}
                      <td className="px-4 py-3 align-top">
                        <div className="diary-info text-xs">
                          <p className="diary-id font-semibold text-slate-800">
                            Diary ID: {row.diaryId ?? "-"}
                          </p>
                          <p className="diary-date text-slate-500 mt-0.5">
                            {row.diaryDate || "-"}
                          </p>
                          <p className="user-info text-slate-500 mt-0.5 flex items-center gap-1">
                            <FontAwesomeIcon icon={faUser} />
                            <span>
                              {row.username || "Unknown"}
                              {row.nickname ? ` (${row.nickname})` : ""}
                            </span>
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${statusCfg.className}`}
                        >
                          <FontAwesomeIcon
                            icon={statusCfg.icon}
                            className={
                              row.status === "PROCESSING"
                                ? "text-slate-700"
                                : ""
                            }
                          />
                          <span>{statusCfg.label}</span>
                        </span>
                      </td>

                      {/* Task Type */}
                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${typeCfg.className}`}
                        >
                          <FontAwesomeIcon icon={typeCfg.icon} />
                          <span>{typeCfg.label}</span>
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${prioCfg.className}`}
                        >
                          <FontAwesomeIcon icon={prioCfg.icon} />
                          <span>{prioCfg.label}</span>
                        </span>
                      </td>

                      {/* Retry Info */}
                      <td className="px-4 py-3 align-top">
                        <div className="retry-info text-xs text-slate-600">
                          <p className="retry-count">
                            {row.retryCount ?? 0}/{row.maxRetryCount ?? 0}
                          </p>
                          {row.canRetry && (
                            <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800 border border-amber-200">
                              Retryable
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Error Message */}
                      <td className="px-4 py-3 align-top">
                        <div className="text-xs text-slate-600 max-w-xs truncate">
                          {row.errorMessage || "-"}
                        </div>
                      </td>

                      {/* Time Info */}
                      <td className="px-4 py-3 align-top">
                        <div className="time-info text-[11px] text-slate-500 space-y-0.5">
                          <p>
                            <span className="font-medium">Created:</span>{" "}
                            {formatDateTime(row.createdAt)}
                          </p>
                          {row.startedAt && (
                            <p>
                              <span className="font-medium">Started:</span>{" "}
                              {formatDateTime(row.startedAt)}
                            </p>
                          )}
                          {row.completedAt && (
                            <p>
                              <span className="font-medium">Completed:</span>{" "}
                              {formatDateTime(row.completedAt)}
                            </p>
                          )}
                          {row.processingTimeMs && (
                            <p className="text-emerald-600 font-semibold">
                              Duration: {formatDuration(row.processingTimeMs)}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 align-top">
                        {row.canRetry ? (
                          <button
                            type="button"
                            onClick={() => handleRetryTask(row)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-amber-500 text-white hover:bg-amber-600"
                          >
                            <FontAwesomeIcon icon={faRedo} />
                            <span>Retry</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-500">
                            {row.status === "COMPLETED"
                              ? "Completed"
                              : "Not retryable"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Component */}
        <Pagination
          totalItems={total}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[10, 20, 50, 100]}
          showInfo={true}
        />
      </div>
    </div>
  );
};

export default AiAnalysisPage;
