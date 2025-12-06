import React from "react";

const EmotionDiaryPage = () => {
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
          {/* User Search */}
          <div className="flex items-center">
            <span className="text-gray-700 mr-2">User Search</span>
            <input
              type="text"
              placeholder="Enter username or nickname"
              className="border rounded-lg px-3 py-2 w-56"
            />
          </div>

          {/* User ID */}
          <div className="flex items-center">
            <span className="text-gray-700 mr-2">User ID</span>
            <input
              type="text"
              placeholder="Enter user ID"
              className="border rounded-lg px-3 py-2 w-40"
            />
          </div>

          {/* Date Range */}
          <div className="flex items-center">
            <span className="text-gray-700 mr-2">Date Range</span>
            <input type="date" className="border rounded-lg px-3 py-2" />
            <span className="mx-2 text-gray-600">to</span>
            <input type="date" className="border rounded-lg px-3 py-2" />
          </div>

          {/* Emotion Score */}
          <div className="flex items-center">
            <span className="text-gray-700 mr-2">Emotion Score</span>
            <select className="border rounded-lg px-3 py-2 w-48">
              <option value="">Select score range</option>
              <option value="1-3">1 - 3</option>
              <option value="4-6">4 - 6</option>
              <option value="7-10">7 - 10</option>
            </select>
          </div>

          {/* Primary Emotion */}
          <div className="flex items-center">
            <span className="text-gray-700 mr-2">Primary Emotion</span>
            <select className="border rounded-lg px-3 py-2 w-48">
              <option value="">Select emotion</option>
              <option value="happy">Happy</option>
              <option value="sad">Sad</option>
              <option value="angry">Angry</option>
              <option value="stressed">Stressed</option>
              <option value="anxious">Anxious</option>
              <option value="lonely">Lonely</option>
            </select>
          </div>

          {/* Buttons */}
          <button className="px-5 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-lg">
            Search
          </button>
          <button className="px-5 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg">
            Reset
          </button>
        </div>
      </div>

      <div className="flex justify-end px-6 py-4 gap-3 text-sm">
        <button className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg">
          Batch AI Analysis (0)
        </button>
        <button className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg">
          Batch Delete (0)
        </button>
      </div>
      {/* Table Section */}
      <div className="bg-white rounded-lg shadow mt-6 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">User Info</th>
              <th className="p-4">Diary Date</th>
              <th className="p-4">Emotion Score</th>
              <th className="p-4">Primary Emotion</th>
              <th className="p-4">Lifestyle Indicator</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody className="text-gray-800">
            <tr>
              <td colSpan="7" className="text-center py-10 text-gray-500">
                No diary entries found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmotionDiaryPage;
