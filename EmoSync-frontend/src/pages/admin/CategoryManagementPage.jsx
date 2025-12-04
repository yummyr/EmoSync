import React, { useEffect, useState } from "react";
import {
  faSearch,
  faEdit,
  faTrash,
  faPlus,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import api from "@/api";

const CategoryManagementPage = () => {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // filters
  const [categoryName, setCategoryName] = useState("");
  const [status, setStatus] = useState("");

  /** Load category list */
  const loadData = async () => {
    setLoading(true);

    try {
      const response = await api.get("/knowledge/category/page", {
        params: {
          categoryName,
          status,
          currentPage,
          size: pageSize,
        },
      });

      const { total, records } = response.data.data;

      setRecords(records);
      setTotal(total);
    } catch (err) {
      console.error("Failed to load category list", err);
    } finally {
      setLoading(false);
    }
  };

  /** initial load */
  useEffect(() => {
    loadData();
  }, [currentPage]);

  /** search */
  const handleSearch = () => {
    setCurrentPage(1);
    loadData();
  };

  /** reset */
  const handleReset = () => {
    setCategoryName("");
    setStatus("");
    setCurrentPage(1);
    loadData();
  };

  return (
    <div className="w-full px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900">Category Management</h3>
        <p className="text-gray-600 mt-2">View and manage knowledge categories</p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mb-6">
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2">
          <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
          Create Category
        </button>

        <button
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg flex items-center gap-2"
          onClick={loadData}
        >
          <FontAwesomeIcon icon={faRotateRight} className="h-5 w-5" />
          Refresh
        </button>
      </div>

      {/* Search Filters */}
      <div className="bg-white p-5 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Category Name */}
          <div>
            <span className="text-gray-700 mr-2">Category Name</span>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category name"
              className="border rounded-lg px-3 py-2 w-52 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Status */}
          <div>
            <span className="text-gray-700 mr-2">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border rounded-lg px-3 py-2 w-40 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Status</option>
              <option value="1">Enabled</option>
              <option value="0">Disabled</option>
            </select>
          </div>

          {/* Buttons */}
          <button
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
            onClick={handleSearch}
          >
            <FontAwesomeIcon icon={faSearch} className="h-5 w-5" />
            Search
          </button>

          <button
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Category Name</th>
              <th className="p-4 w-1/4">Description</th>
              <th className="p-4">Order</th>
              <th className="p-4">Status</th>
              <th className="p-4">Article Count</th>
              <th className="p-4">Created At</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody className="text-gray-800">
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-10 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : !records || records.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-10 text-gray-500">
                  No categories found
                </td>
              </tr>
            ) : (
              records.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{item.id}</td>
                  <td className="p-4">📁 {item.categoryName}</td>
                  <td className="p-4">{item.description}</td>
                  <td className="p-4">{item.sortOrder}</td>
                  <td className="p-4">
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${
                        item.status === 1 ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></span>
                  </td>
                  <td className="p-4 text-blue-600 font-semibold">
                    {item.articleCount}
                  </td>
                  <td className="p-4">
                    {item.createdAt?.split("T")[0] ?? "--"}
                  </td>
                  <td className="p-4 flex gap-3">
                    <button className="text-indigo-600 hover:underline flex items-center gap-1">
                      <FontAwesomeIcon icon={faEdit} className="h-5 w-5" />
                      Edit
                    </button>

                    <button className="text-yellow-600 hover:underline">
                      {item.status === 1 ? "Disable" : "Enable"}
                    </button>

                    <button className="text-red-500 hover:underline flex items-center gap-1">
                      <FontAwesomeIcon icon={faTrash} className="h-5 w-5" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center px-6 py-4 text-gray-600 text-sm">
          <div>
            {total} records, {pageSize} per page
          </div>

          <div className="flex items-center gap-3">
            <button
              className="px-2"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              {"<"}
            </button>

            <span className="text-indigo-600 font-semibold">
              {currentPage}
            </span>

            <button
              className="px-2"
              disabled={currentPage * pageSize >= total}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              {">"}
            </button>

            <span>Go to</span>
            <input
              type="number"
              className="w-14 border rounded px-2 py-1"
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
            />
            <span>page</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagementPage;
