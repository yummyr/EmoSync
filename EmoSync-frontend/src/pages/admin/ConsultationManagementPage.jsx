import React, { useEffect, useState } from "react";
import {
  faSearch,
  faRotateRight,
  faEye,
  faBan,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import api from "@/api";
import Pagination from "@/components/Pagination";

const emotionOptions = [
  { label: "Anxiety", value: "anxiety" },
  { label: "Stress", value: "stress" },
  { label: "Depression", value: "depression" },
  { label: "Anger", value: "anger" },
  { label: "Loneliness", value: "loneliness" },
  { label: "Confusion", value: "confusion" },
];

const ConsultationManagementPage = () => {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);

  // Filters
  const [emotion, setEmotion] = useState("");
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const INITIAL_SESSION_DETAIL = {
    id: "",
    userId: "",
    userNickname: "",
    userAvatar: "",
    sessionTitle: "",
    messages: [],
    startedAt: "",
    durationMinutes: 0,
    messageCount: 0,
    emotionTags: [],
    lastMessageContent: "",
    lastMessageTime: "",
    primaryEmotion: "",
  };
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const [sessionDetail, setSessionDetail] = useState(INITIAL_SESSION_DETAIL);
  const [showSessionDetail, setShowSessionDetail] = useState(false);
  const handleCloseDetail = () => {
    setShowSessionDetail(false);
    setSessionDetail(INITIAL_SESSION_DETAIL);
  };

  const getSessionDetail = async (sessionId) => {
    try {
      const res = await api.get(`/psychological-chat/sessions/${sessionId}`);
      console.log("Loaded session detail:", res);
      const sessionData = res.data.data;
      console.log("Session data:", sessionData);
      if (sessionData) {
        setSessionDetail({
          ...sessionData,
        });
      }

      setShowSessionDetail(true);
    } catch (err) {
      console.error("Failed to load session detail:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/psychological-chat/sessions/${id}`);
      loadData();
    } catch (err) {
      console.error("Failed to delete session", err);
    }
  };

  const handleUpdateTitle = async (id) => {
    const record = records.find((rec) => rec.id === id);
    if (record) {
      const newTitle = prompt("Enter new title:", record.sessionTitle);
      if (newTitle !== null && newTitle.trim() !== "") {
        try {
          console.log("Updating session title to:", newTitle);
          await api.put(`/psychological-chat/sessions/${id}/title`, {
            sessionTitle: newTitle.trim(),
          });
          // Refresh the data to show the updated title
          loadData();
        } catch (err) {
          console.error("Failed to update session title:", err);
          alert("Failed to update title. Please try again.");
        }
      }
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/psychological-chat/sessions", {
        params: {
          emotion,
          keyword,
          startDate,
          endDate,
          currentPage,
          size: pageSize,
        },
      });

      console.log("Loaded consultation records:", res);

      const { total, records } = res.data.data;
      console.log("Total records:", total);
      console.log("Records array:", records);

      setRecords(records);
      setTotal(total);
    } catch (err) {
      console.error("Failed to load consultation records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage, pageSize]);

  const handleSearch = () => {
    setCurrentPage(1);
    loadData();
  };

  const handleReset = () => {
    setEmotion("");
    setKeyword("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    loadData();
  };

  return (
    <div className="w-full px-6 py-8">
      {/* Page Header */}

      {/* Search Filters */}
      <div className="bg-white p-5 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-6 items-center">
          {/* Emotion Filter */}
          <div className="flex items-center">
            <span className="text-gray-700 mr-2">Emotion Tag</span>
            <select
              className="border rounded-lg px-3 py-2 w-48"
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
            >
              <option value="">Select Emotion</option>
              {emotionOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="flex items-center">
            <span className="text-gray-700 mr-2">Date Range</span>
            <input
              type="date"
              className="border rounded-lg px-3 py-2"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="mx-2 text-gray-600">to</span>
            <input
              type="date"
              className="border rounded-lg px-3 py-2"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Keyword */}
          <div className="flex items-center">
            <span className="text-gray-700 mr-2">Keyword</span>
            <input
              type="text"
              placeholder="Search user or content"
              className="border rounded-lg px-3 py-2 w-60"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          {/* Search Button */}
          <button
            className="px-5 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
            onClick={handleSearch}
          >
            <FontAwesomeIcon icon={faSearch} className="h-5 w-5" />
            Search
          </button>

          {/* Reset Button */}
          <button
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
        <div className="mb-8 flex justify-end items-center">
          <button
            className="px-4 py-2 bg-gradient-to-r from-orange-200 via-pink-200 to-pink-300 hover:bg-gray-200 text-gray-900 rounded-lg flex items-center gap-2"
            onClick={loadData}
          >
            <FontAwesomeIcon icon={faRotateRight} className="h-5 w-5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="p-4 text-center">User Info</th>
              <th className="p-4 text-center">Session Title</th>
              <th className="p-4 text-center">Messages count</th>
              <th className="p-4 text-center">Duration(mins)</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="text-gray-800">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : !records || records.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-500">
                  No consultation records found
                </td>
              </tr>
            ) : (
              records.map((rec) => (
                <tr key={rec.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-center">
                    <div className="font-semibold">
                      {rec.userNickname || "-"}
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    <div className="line-clamp-2 text-gray-700">
                      {rec.sessionTitle || "-"}
                    </div>
                  </td>

                  <td className="p-4 text-center">{rec.messageCount}</td>

                  <td className="p-4 text-center">{rec.durationMinutes}</td>

                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => getSessionDetail(rec.id)}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <FontAwesomeIcon icon={faEye} className="h-5 w-5" />
                        View
                      </button>
                      <button
                        onClick={() => handleUpdateTitle(rec.id)}
                        className="text-pink-300 hover:underline flex items-center gap-1"
                      >
                        <FontAwesomeIcon icon={faEdit} className="h-5 w-5" />
                        Update
                      </button>
                      <button
                        onClick={() => handleDelete(rec.id)}
                        className="text-red-600 hover:underline flex items-center gap-1"
                      >
                        <FontAwesomeIcon icon={faBan} className="h-5 w-5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Component */}
        <Pagination
          totalItems={total}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[10, 20, 50]}
          showInfo={true}
        />
      </div>
      {showSessionDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-3/4 max-h-full overflow-y-auto p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
              onClick={handleCloseDetail}
            >
              Close
            </button>
            <h2 className="text-2xl font-bold mb-4 text-blue-600">
              Session Detail
            </h2>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-pink-500">
                {sessionDetail.sessionTitle}
              </h3>
              <p className="text-gray-600 mb-4">
                User: {sessionDetail.userNickname || "-"}
              </p>
              <p className="text-gray-600 mb-4">
                Avatar: {sessionDetail.userAvatar || "-"}
              </p>
              <div className="space-y-4">
                <p className="text-gray-600">Session ID: {sessionDetail.id}</p>
                <p className="text-gray-600">
                  Message Count: {sessionDetail.messageCount || "-"}
                </p>
                <p className="text-gray-600">
                  Duration: {sessionDetail.durationMinutes || "-"} minutes
                </p>
                <p className="text-gray-600">
                  Started At: {sessionDetail.startedAt || "-"}
                </p>
                <p className="text-gray-600">
                  Last message content:{" "}
                  {sessionDetail.lastMessageContent || "-"}
                </p>
                <p className="text-gray-600">
                  Last message time: {sessionDetail.lastMessageTime || "-"}
                </p>

                <p className="text-gray-600">
                  Emotion Tags: {sessionDetail.emotionTags?.join(", ") || "-"}
                </p>
                <p className="text-gray-600">
                  Primary Emotion: {sessionDetail.primaryEmotion || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationManagementPage;
