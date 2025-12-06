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
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    categoryName: "",
    description: "",
    sortOrder: 0,
    status: 1,
  });
  const [openEditForm, setOpenEditForm] = useState(false);

  const handleOpenEditForm = (id) => {
    setIsEditMode(true);
    setOpenEditForm(true);
    const category = records.find((item) => item.id === id);

    setFormData({
      id: category.id,
      categoryName: category.categoryName,
      description: category.description,
      sortOrder: category.sortOrder,
      status: category.status,
    });
  };

  const handleCloseEditForm = () => {
    setIsEditMode(false);
    setOpenEditForm(false);
    setFormData({
      id: "",
      categoryName: "",
      description: "",
      sortOrder: "",
      status: "",
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }
  const handleAdd = () => {
    setIsEditMode(false);
    setOpenEditForm(true);
  };

  const handleSubmitForm = async () => {
    try {
      const dataToSubmit = {
        categoryName: formData.categoryName,
        description: formData.description,
        sortOrder: Number(formData.sortOrder),
        status: Number(formData.status),
      };
      if (isEditMode) {
        // Update existing category
        await api.put(`/knowledge/category/${formData.id}`, dataToSubmit);
      } else {
        // Create new category
        await api.post("/knowledge/category", dataToSubmit);
      }
      handleCloseEditForm();
      loadData();
    } catch (err) {
      console.error("Failed to submit form", err);
    }
  }
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // filters
  const [categoryName, setCategoryName] = useState("");
  const [status, setStatus] = useState("");

  const handleStatusChange = async (id) => {
    try {
      await api.put(`/knowledge/category/status/${id}`);
      loadData();
    } catch (err) {
      console.error("Failed to change category status", err);
    }
  };
  const handleDelete = async (id) => {
    try {
      await api.delete(`/knowledge/category/${id}`);
      loadData();
    } catch (err) {
      console.error("Failed to delete category", err);
    }
  };
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
      if (err.code !== "ERR_CANCELED") {
        console.error("Failed to load category list", err);
      }
    } finally {
      setLoading(false);
    }
  };

  /** initial load */
  useEffect(() => {
    loadData();
  }, [currentPage, categoryName, status]);

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
        <h3 className="text-2xl font-bold text-gray-900">
          Category Management
        </h3>
        <p className="text-gray-600 mt-2">
          View and manage knowledge categories
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mb-6">
        <button onClick={handleAdd} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2">
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
                    <button onClick={() => handleOpenEditForm(item.id)} className="text-indigo-600 hover:underline flex items-center gap-1">
                      <FontAwesomeIcon icon={faEdit} className="h-5 w-5" />
                      Edit
                    </button>

                    <button
                      onClick={() => handleStatusChange(item.id)}
                      className={
                        item.status === 1
                          ? "bg-pink-400  text-white text-sm rounded-md p-1  hover:underline"
                          : "bg-gray-600 text-white text-sm rounded-md p-1  hover:underline"
                      }
                    >
                      {item.status === 1 ? "Disable" : "Enable"}
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:underline flex items-center gap-1"
                    >
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

            <span className="text-indigo-600 font-semibold">{currentPage}</span>

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
      {/* Edit Form Modal - To be implemented */}
      {openEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              {isEditMode ? "Edit Category" : "Create Category"}
            </h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Category Name</label>
              <input
                type="text"
                name="categoryName"
                value={formData.categoryName}
                onChange={handleFormChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                className="w-full border rounded px-3 py-2"
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Sort Order</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleFormChange}
                  className="flex-1 border rounded px-3 py-2"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, sortOrder: Number(prev.sortOrder) - 10 }))}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                  title="Decrease by 10"
                >
                  -10
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, sortOrder: Number(prev.sortOrder) + 10 }))}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                  title="Increase by 10"
                >
                  +10
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value={1}>Enabled</option>
                <option value={0}>Disabled</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseEditForm}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitForm}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                {isEditMode ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagementPage;
