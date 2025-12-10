import React from "react";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faTrash,
  faTimes,
  faUser,
  faList,
  faBrain,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";

import api from "@/api";

const EmotionDiaryPage = () => {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    size: 10,
  });
  const [diaryDetail, setDiaryDetail] = useState(null);
  const [showDiaryDetail, setShowDiaryDetail] = useState(false);
  const INIT_FILTERS = {
    startDate: null,
    endDate: null,
    minMoodScore: null,
    maxMoodScore: null,
    dominantEmotion: null,
    sleepQuality: null,
    stressLevel: null,
  };
  // Filters
  const [filters, setFilters] = useState({
    INIT_FILTERS,
  });
  // Batch selection
  const [selectedIds, setSelectedIds] = useState([]);
  // Batch delete selected emotion diaries
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one diary entry to delete.");
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} selected diary entries? This action cannot be undone.`
      )
    ) {
      return;
    }
    try {
      for (const id of selectedIds) {
        await api.delete(`/emotion-diary/admin/${id}`);
      }
      alert("Selected diary entries deleted successfully.");
      setSelectedIds([]);
      fetchDiaries();
    } catch (error) {
      console.error("Error deleting selected diary entries:", error);
      alert("Failed to delete selected diary entries.");
    }
  };
  // Batch AI analysis selected emotion diaries
  const handleAiAnalysisSelected = async () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one diary entry for AI analysis.");
      return;
    }
    if (selectedIds.length > 100) {
      alert("Cannot process more than 100 entries at once.");
      return;
    }
    try {
      await api.post("/emotion-diary/admin/batch-ai-analysis", selectedIds);

      alert("Selected diary entries submitted for AI analysis successfully.");
      setSelectedIds([]);
      fetchDiaries();
    } catch (error) {
      console.error(
        "Error submitting selected diary entries for AI analysis:",
        error
      );
      alert("Failed to submit selected diary entries for AI analysis.");
    }
  };
  useEffect(() => {
    fetchDiaries();
  }, [pagination.current, pagination.size]);

  // fetch emotion diary details
  const hanledViewDetails = async (id) => {
    try {
      const res = await api.get(`/emotion-diary/${id}`);
      console.log("Fetched diary details:", res);
      const detail = res.data.data;
      setDiaryDetail(detail);
      console.log("Diary detail:", detail);
      setShowDiaryDetail(true);
    } catch (error) {
      console.error("Error fetching diary details:", error);
    }
  };

  const handleAiAnalysis = async (id) => {
    try {
      await api.post(`/emotion-diary/admin/${id}/ai-analysis`);
      alert("Diary entry submitted for AI analysis successfully.");
      fetchDiaries();
    } catch (error) {
      console.error("Error submitting diary entry for AI analysis:", error);
      alert("Failed to submit diary entry for AI analysis.");
    }
  };


  // fetch emotion diaries
  const fetchDiaries = async () => {
    setLoading(true);
    try {
      const params = {
        current: pagination.current,
        size: pagination.size,
        // 只添加非 null 的参数
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.minMoodScore !== null && {
          minMoodScore: filters.minMoodScore,
        }),
        ...(filters.maxMoodScore !== null && {
          maxMoodScore: filters.maxMoodScore,
        }),
        ...(filters.dominantEmotion && {
          dominantEmotion: filters.dominantEmotion,
        }),
        ...(filters.sleepQuality !== null && {
          sleepQuality: filters.sleepQuality,
        }),
        ...(filters.stressLevel !== null && {
          stressLevel: filters.stressLevel,
        }),
      };
      console.log("Fetching diary page with Request params:", params);

      // API call logic here
      const res = await api.get("/emotion-diary/page", {
        params,
      });
      console.log("Fetched diary page response:", res);
      const data = res.data.data;
      setRecords(data.records || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching diary entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "" ? null : value, // set empty string to null
    }));
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 })); // reset to first page
    fetchDiaries();
  };

  const handleReset = () => {
    setFilters({
      INIT_FILTERS,
    });
    setPagination({ current: 1, size: 10 });
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, current: page }));
  };
  return (
    <div className="py-8 px-4 mb-8">
      {/* Page Header */}
      <h3 className="text-2xl font-bold text-gray-900">
        Emotion Diary Management
      </h3>
      <p className="text-gray-600 mt-2">
        View and manage user emotion diary entries
      </p>

      {/* Search Filters */}
      <div className="bg-white p-5 rounded-lg shadow mt-6">
        <div className="flex flex-wrap gap-6 items-center">
          {/* Date Range */}
          <div className="flex items-center">
            <span className="text-gray-700 mr-2">Date Range</span>
            <input
              type="date"
              value={filters.startDate || ""}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
            <span className="mx-2 text-gray-600">to</span>
            <input
              type="date"
              value={filters.endDate || ""}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
          </div>
          {/* Emotion Score Range */}
          <div className="flex items-center">
            <span className="text-gray-700 mr-2">Emotion Score</span>
            <input
              type="number"
              min="1"
              max="10"
              placeholder="Min"
              value={filters.minMoodScore || ""}
              onChange={(e) =>
                handleFilterChange(
                  "minMoodScore",
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              className="border rounded-lg px-3 py-2 w-20"
            />
            <span className="mx-2 text-gray-600">-</span>
            <input
              type="number"
              min="1"
              max="10"
              placeholder="Max"
              value={filters.maxMoodScore || ""}
              onChange={(e) =>
                handleFilterChange(
                  "maxMoodScore",
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              className="border rounded-lg px-3 py-2 w-20"
            />
          </div>

          {/* Primary Emotion */}
          <div className="flex items-center">
            <span className="text-gray-700 mr-2">Primary Emotion</span>
            <select
              value={filters.dominantEmotion || ""}
              onChange={(e) =>
                handleFilterChange("dominantEmotion", e.target.value)
              }
              className="border rounded-lg px-3 py-2 w-48"
            >
              <option value="">Select emotion</option>
              <option value="happy">Happy</option>
              <option value="sad">Sad</option>
              <option value="angry">Angry</option>
              <option value="stressed">Stressed</option>
              <option value="anxious">Anxious</option>
              <option value="lonely">Lonely</option>
            </select>
          </div>

          {/* Sleep Quality */}
          <div className="flex items-center">
            <span className="text-gray-700 mr-2">Sleep Quality</span>
            <select
              value={filters.sleepQuality || ""}
              onChange={(e) =>
                handleFilterChange(
                  "sleepQuality",
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              className="border rounded-lg px-3 py-2 w-32"
            >
              <option value="">Select</option>
              <option value="1">1 - Very Poor</option>
              <option value="2">2 - Poor</option>
              <option value="3">3 - Fair</option>
              <option value="4">4 - Good</option>
              <option value="5">5 - Excellent</option>
            </select>
          </div>

          {/* Stress Level */}
          <div className="flex items-center">
            <span className="text-gray-700 mr-2">Stress Level</span>
            <select
              value={filters.stressLevel || ""}
              onChange={(e) =>
                handleFilterChange(
                  "stressLevel",
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              className="border rounded-lg px-3 py-2 w-32"
            >
              <option value="">Select</option>
              <option value="1">1 - Very Low</option>
              <option value="2">2 - Low</option>
              <option value="3">3 - Moderate</option>
              <option value="4">4 - High</option>
              <option value="5">5 - Very High</option>
            </select>
          </div>

          {/* Buttons */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-5 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
          >
            {loading ? "Loading..." : (
              <>
                <FontAwesomeIcon icon={faSearch} className="mr-2" />
                Search
              </>
            )}
          </button>
          <button
            onClick={handleReset}
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            <FontAwesomeIcon icon={faUndo} className="mr-2" />
            Reset
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow mt-6 overflow-hidden">
        <div className="flex justify-between lg:col-span-2 sm:col-span-1 p-2">
          <h2 className="text-xl font-semibold text-pink-500 p-5 border-b">
            <FontAwesomeIcon icon={faList} className="mr-2 text-pink-500" />
            Emotion Diary List ({total} entries)
          </h2>

          <div className="p-2 lg:col-span-2 sm:col-span-1 gap-2  text-gray-600 ">
            <button
              onClick={handleAiAnalysisSelected}
              className="px-5 py-2 m-2 bg-green-300 hover:bg-gray-200 rounded-lg"
            >
              <FontAwesomeIcon icon={faBrain} className="mr-2" />
              Batch AiAnalysis({selectedIds.length})
            </button>
            <button
              onClick={handleDeleteSelected}
              className="px-5 py-2 m-2 bg-red-300 hover:bg-gray-200 rounded-lg"
            >
              <FontAwesomeIcon icon={faTrash} className="mr-2" />
              Batch Delete({selectedIds.length})
            </button>
          </div>
        </div>
        <table className="w-full ">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="p-3">
                <input
                  type="checkbox"
                  checked={
                    selectedIds.length > 0 &&
                    selectedIds.length === records.length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(records.map((record) => record.id));
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                />
              </th>
              <th className="p-4 text-center min-w-[60px]">ID</th>
              <th className="p-4 text-center min-w-[120px]">User Info</th>
              <th className="p-4 text-center min-w-[140px]">Diary Date</th>
              <th className="p-4 text-center min-w-[80px]">Emotion Score</th>
              <th className="p-4 text-center min-w-[100px]">Primary Emotion</th>
              <th className="p-4 text-center min-w-[100px]">
                Lifestyle Indicator
              </th>
              <th className="p-4 text-center min-w-[160px]">Actions</th>
            </tr>
          </thead>

          <tbody className="text-gray-800">
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-10">
                  Loading...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-500">
                  No diary entries found
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(record.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds([...selectedIds, record.id]);
                        } else {
                          setSelectedIds(
                            selectedIds.filter((id) => id !== record.id)
                          );
                        }
                      }}
                    />
                  </td>
                  <td className="p-4 text-center">{record.id}</td>
                  <td className="p-4 text-center text-wrap">
                    <div>User ID: {record.userId}</div>
                    <div className="text-sm text-gray-500 text-center">
                      <FontAwesomeIcon icon={faUser} className="mr-1" />
                      {record.nickname || record.username || "N/A"}
                    </div>
                  </td>
                  <td className="p-4 text-center">{record.diaryDate}</td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-2 py-1 text-center rounded ${
                        record.moodScore >= 7
                          ? "bg-green-100 text-green-800"
                          : record.moodScore >= 4
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {record.moodScore}/10
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {record.dominantEmotion || "N/A"}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex flex-col gap-1">
                      <span>Sleep: {record.sleepQuality || "N/A"}/5</span>
                      <span>Stress: {record.stressLevel || "N/A"}/5</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => hanledViewDetails(record.id)}
                      className="m-1 px-3 py-1 bg-blue-100 text-blue-700 rounded mr-2 hover:bg-blue-200"
                    >
                      View
                    </button>
                    <button onClick={() => handleAiAnalysis(record.id)} className="m-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">
                      AI Analysis
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* 分页控件 */}
      {total > 0 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-gray-600">
            Showing {records.length} of {total} records
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.current - 1)}
              disabled={pagination.current === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">Page {pagination.current}</span>
            <button
              onClick={() => handlePageChange(pagination.current + 1)}
              disabled={records.length < pagination.size}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Diary Detail Modal */}
      {showDiaryDetail && diaryDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-3/4 max-h-full overflow-y-auto p-6 relative">
            <button
              className="absolute top-4 right-4 text-red-600 hover:text-gray-900"
              onClick={() => setShowDiaryDetail(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
              Close
            </button>
            <h2 className="text-2xl font-bold mb-4 text-pink-400">Diary Entry Details</h2>
            <div className="space-y-4">
              <div>
                <strong className="text-blue-600 ">User ID:</strong> {diaryDetail.userId}
              </div>
              <div>
                <strong className="text-blue-600 ">Username:</strong> {diaryDetail.username}
              </div>
              <div>
                <strong className="text-blue-600 ">Diary Date:</strong> {diaryDetail.diaryDate}
              </div>
              <div>
                <strong className="text-blue-600 ">Mood Score:</strong> {diaryDetail.moodScore}/10
              </div>
              <div>
                <strong className="text-blue-600 ">Dominant Emotion:</strong>{" "}
                {diaryDetail.dominantEmotion || "N/A"}
              </div>
           
              <div>
                <strong className="text-blue-600 ">Sleep Quality:</strong>{" "}
                {diaryDetail.sleepQuality || "N/A"}
              </div>
              <div>
                <strong className="text-blue-600 ">Stress Level:</strong>{" "}
                {diaryDetail.stressLevel || "N/A"}
              </div>
               
              <div>
                <strong className="text-blue-600 ">Domain Emotion:</strong> {diaryDetail.domainEmotion || "N/A"}
              </div>
              <div>
                <strong className="text-blue-600 ">Diary Content:</strong> {diaryDetail.diaryContent || "N/A"}
              </div>
              
              <div>
                <strong className="text-blue-600 ">Emotion Triggers:</strong> {diaryDetail.emotionTriggers || "N/A"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmotionDiaryPage;
