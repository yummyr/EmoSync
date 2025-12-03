import React, { useEffect, useState } from "react";
import {
  faSearch,
  faPlus,
  faFileExport,
  faEdit,
  faEye,
  faTrash,
  faStop,
  faCheck,
  faTimes,
  faCrown,
  faUser,
  faCheckCircle,
  faBan,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import api from "@/api";

// Simple notification system
const notifications = {
  success: (message) => {
    const notification = document.createElement("div");
    notification.className =
      "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse";
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  },
  error: (message) => {
    const notification = document.createElement("div");
    notification.className =
      "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse";
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  },
};

// Simple modal system
const confirmModal = (
  title,
  content,
  onOk,
  okText = "OK",
  cancelText = "Cancel",
  okType = "primary"
) => {
  const modalOverlay = document.createElement("div");
  modalOverlay.className =
    "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

  const modalContent = document.createElement("div");
  modalContent.className = "bg-white rounded-lg p-6 max-w-md w-full mx-4";

  modalContent.innerHTML = `
    <h3 class="text-lg font-bold mb-4">${title}</h3>
    <p class="mb-6">${content}</p>
    <div class="flex justify-end gap-3">
      <button id="cancel-btn" class="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
        ${cancelText}
      </button>
      <button id="confirm-btn" class="px-4 py-2 rounded ${
        okType === "danger"
          ? "bg-red-500 hover:bg-red-600"
          : "bg-blue-500 hover:bg-blue-600"
      } text-white">
        ${okText}
      </button>
    </div>
  `;

  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);

  const closeModal = () => {
    if (document.body.contains(modalOverlay)) {
      document.body.removeChild(modalOverlay);
    }
  };

  modalContent
    .querySelector("#cancel-btn")
    .addEventListener("click", closeModal);
  modalContent.querySelector("#confirm-btn").addEventListener("click", () => {
    onOk();
    closeModal();
  });

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });
};

function UserManagementPage() {
  const [loading, setLoading] = useState(false);
  const [userPage, setUserPage] = useState([]);
  const [total, setTotal] = useState(0);
  const [userDetail, setUserDetail] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [openRegisterForm, setOpenRegisterForm] = useState(false);
  const [registerFormData, setRegisterFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
    phone: "",
    gender: "0",
    birthday: "",
    userType: "1",
  });

  // search filters
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState(undefined);
  const [status, setStatus] = useState(undefined);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  /** Fetch user list */
  const fetchUserPage = async () => {
    setLoading(true);
    try {
      const res = await api.get("/user/page", {
        params: {
          username,
          email,
          phone,
          userType,
          status,
          currentPage: page,
          size,
        },
      });

      const data = res.data.data;
      console.log(data);
      console.log(data.records);
      setUserPage(data.records || []);
      setTotal(data.total || 0);
    } catch (err) {
      notifications.error("Failed to load user list.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserPage();
  }, [page, size]);

  const handleAddUser = () => {
    setOpenRegisterForm(true);
  };
  const handleRegisterInputChange = (field, value) => {
    setRegisterFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRegisterFormSubmit = async (e) => {
    e.preventDefault();

    // Verify password match
    if (registerFormData.password !== registerFormData.confirmPassword) {
      notifications.error("Passwords do not match.");
      return;
    }

    // Validate required fields
    if (!registerFormData.email || !registerFormData.password) {
      notifications.error("Please fill in all required fields.");
      return;
    }

    // Build submission data, excluding confirm password field
    const submitData = {
      username: registerFormData.username,
      email: registerFormData.email,
      password: registerFormData.password,
      nickname: registerFormData.nickname || registerFormData.username,
      phone: registerFormData.phone || "",
      gender: parseInt(registerFormData.gender) || 0,
      birthday: registerFormData.birthday || "",
      roleType: parseInt(registerFormData.userType) || 1,
    };

    try {
      const res = await api.post("/user/add", submitData);
      notifications.success("User registered successfully.");
      setOpenRegisterForm(false);
      // Reset form data
      setRegisterFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        nickname: "",
        phone: "",
        gender: 0,
        birthday: "",
        userType: 1,
      });
      fetchUserPage();
    } catch (err) {
      notifications.error("Failed to register user.");
    }
  };
  const openUserDetail = (id, editMode = false) => {
    console.log(editMode ? "Edit user:" : "View user:", id);
    const userDetail = userPage.find((user) => user.id === id);
    console.log(userDetail);

    setUserDetail(userDetail);
    setIsEditMode(editMode);
    setShowUserDetail(true);

    if (editMode && userDetail) {
      // Initialize edit form data with current user data
      setEditFormData({
        username: userDetail.username || "",
        email: userDetail.email || "",
        phone: userDetail.phone || "",
        nickname: userDetail.nickname || "",
        birthday: userDetail.birthday || "",
        gender: userDetail.gender || "",
        avatar: null,
      });
    }
  };

  const handleSaveEdit = async () => {
    try {
      const formData = new FormData();
      formData.append("userId", userDetail.id);
      formData.append("username", editFormData.username);
      formData.append("email", editFormData.email);
      formData.append("phone", editFormData.phone);
      formData.append("nickname", editFormData.nickname);
      formData.append("birthday", editFormData.birthday);
      formData.append("gender", editFormData.gender);

      if (editFormData.avatar && editFormData.avatar instanceof File) {
        formData.append("avatar", editFormData.avatar);
      }

      const res = await api.put(`/user/${userDetail.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.code === "200") {
        notifications.success("User updated successfully.");
        fetchUserPage(); // Refresh user list
        setIsEditMode(false); // Exit edit mode
        // Update userDetail with new data
        setUserDetail({
          ...userDetail,
          ...editFormData,
        });
      } else {
        notifications.error("Failed to update user.");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      notifications.error("Failed to update user.");
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setShowUserDetail(false);

    // Reset form data to original user data
    if (userDetail) {
      setEditFormData({
        username: userDetail.username || "",
        email: userDetail.email || "",
        phone: userDetail.phone || "",
        nickname: userDetail.nickname || "",
        birthday: userDetail.birthday || "",
        gender: userDetail.gender || "",
        avatar: null,
      });
    }
  };

  const handleInputChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditFormData((prev) => ({
        ...prev,
        avatar: file,
      }));
    }
  };

  /** Update user status */
  const updateUserStatus = async (id, newStatus) => {
    try {
      await api.put(`/user/${id}/status`, null, {
        params: { status: newStatus },
      });
      notifications.success("User status updated.");
      fetchUserPage();
    } catch {
      notifications.error("Failed to update status.");
    }
  };

  /** Delete user */
  const deleteUser = async (id) => {
    confirmModal(
      "Confirm Delete",
      "Are you sure you want to delete this user?",
      async () => {
        try {
          await api.delete(`/user/${id}`);
          notifications.success("User deleted.");
          fetchUserPage();
        } catch {
          notifications.error("Failed to delete.");
        }
      },
      "Delete",
      "Cancel",
      "danger"
    );
  };

  /** Table Columns */
  const columns = [
    {
      title: "User Info",
      dataIndex: "nickname",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          {record.avatar ? (
            <img
              src={record.avatar}
              alt={record.nickname || record.username || "User"}
              className="w-10 h-10 rounded-full object-cover shadow-sm border-2 border-white"
              onError={(e) => {
                // Fallback to initial if image fails to load
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm ${
              record.avatar ? "hidden" : ""
            }`}
          >
            {record.nickname
              ? record.nickname.charAt(0).toUpperCase()
              : record.username
              ? record.username.charAt(0).toUpperCase()
              : "U"}
          </div>
          <div>
            <div className="font-semibold">
              {record.nickname || "Unknown User"}
            </div>
            <div className="text-gray-500 text-xs">ID: {record.id}</div>
            <div className="text-gray-400 text-xs">@{record.username}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Contact",
      dataIndex: "email",
      render: (_, r) => (
        <div>
          <div>📧 {r.email}</div>
          <div>📱 {r.phone}</div>
        </div>
      ),
    },
    {
      title: "Personal Info",
      dataIndex: "gender",
      render: (_, r) => (
        <div>
          <div>{r.gender === 1 ? "♂ Male" : "♀ Female"}</div>
          <div className="text-gray-500 text-xs">🎂 {r.birthday}</div>
        </div>
      ),
    },
    {
      title: "User Type",
      dataIndex: "userType",
      render: (type) =>
        type === 2 ? (
          <div className="flex items-center  bg-yellow-100 rounded-md">
            <FontAwesomeIcon icon={faCrown} className="text-yellow-500" />
            <span className="px-2 py-1 text-yellow-800  text-xs font-medium">
              Admin
            </span>
          </div>
        ) : (
          <div className="flex items-center  bg-blue-100 rounded-md">
            <FontAwesomeIcon icon={faUser} className="text-blue-500" />
            <span className="px-2 py-1 text-blue-800  text-xs font-medium">
              Normal User
            </span>
          </div>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) =>
        status === 1 ? (
          <div className="flex items-center bg-green-100 rounded-md">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-green-500 mr-1"
            />
            <span className="px-2 py-1  text-green-800 rounded-full text-xs font-medium">
              Active
            </span>
          </div>
        ) : (
          <div className="flex items-center bg-red-100 rounded-md">
            <FontAwesomeIcon icon={faBan} className="text-red-500 mr-1" />
            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
              Inactive
            </span>
          </div>
        ),
    },
    {
      title: "Register Time",
      dataIndex: "createdAt",
      render: (_, r) => (
        <div>
          <div> {r.createdAt}</div>
        </div>
      ),
    },
    {
      title: "Last Update",
      dataIndex: "updatedAt",
      render: (_, r) => (
        <div>
          <div> {r.updatedAt}</div>
        </div>
      ),
    },
    {
      title: "Actions",
      render: (_, r) => (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => openUserDetail(r.id, false)}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors flex items-center gap-1"
          >
            <FontAwesomeIcon icon={faEye} />
            View
          </button>

          <button
            onClick={() => openUserDetail(r.id, true)}
            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors flex items-center gap-1"
          >
            <FontAwesomeIcon icon={faEdit} />
            Edit
          </button>

          {r.status === 1 ? (
            <button
              onClick={() => updateUserStatus(r.id, 0)}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors flex items-center gap-1"
            >
              <FontAwesomeIcon icon={faStop} />
              Disable
            </button>
          ) : (
            <button
              onClick={() => updateUserStatus(r.id, 1)}
              className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors flex items-center gap-1"
            >
              <FontAwesomeIcon icon={faCheck} />
              Enable
            </button>
          )}

          <button
            onClick={() => deleteUser(r.id)}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors flex items-center gap-1"
          >
            <FontAwesomeIcon icon={faTrash} />
            Delete
          </button>
        </div>
      ),
    },
  ];

  /** Reset filters */
  const reset = () => {
    setUsername("");
    setEmail("");
    setPhone("");
    setUserType(undefined);
    setStatus(undefined);
    setPage(1);

    fetchUserPage();
  };

  /** Search */
  const search = () => {
    setPage(1);
    fetchUserPage();
  };

  return (
    <div className="p-6 relative">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

      {/* Filter Bar */}
      <div className="bg-white p-4 mb-4 rounded shadow flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
        />
        <input
          type="email"
          placeholder="Search email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
        />
        <input
          type="tel"
          placeholder="Search phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
        />

        <select
          value={userType}
          onChange={(e) =>
            setUserType(
              e.target.value === "" ? undefined : parseInt(e.target.value)
            )
          }
          className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
        >
          <option value="">User Type</option>
          <option value="2">Administrator</option>
          <option value="1">Regular User</option>
        </select>

        <select
          value={status}
          onChange={(e) =>
            setStatus(
              e.target.value === "" ? undefined : parseInt(e.target.value)
            )
          }
          className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
        >
          <option value="">Status</option>
          <option value="1">Active</option>
          <option value="0">Disabled</option>
        </select>

        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
          onClick={search}
        >
          <FontAwesomeIcon icon={faSearch} />
          Search
        </button>

        <button
          onClick={reset}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>

        <div className="flex-grow"></div>

        <button
          onClick={handleAddUser}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add User
        </button>
        <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-2">
          <FontAwesomeIcon icon={faFileExport} />
          Export
        </button>
      </div>

      {/* User Table */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      <div className="bg-white rounded shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b"
                  >
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {userPage.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  {columns.map((col, index) => (
                    <td key={index} className="px-4 py-3 border-b text-sm">
                      {col.render
                        ? col.render(record[col.dataIndex], record)
                        : record[col.dataIndex]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(page - 1) * size + 1} to {Math.min(page * size, total)} of{" "}
            {total} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {page} of {Math.ceil(total / size)}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(total / size)}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
            <select
              value={size}
              onChange={(e) => {
                setSize(parseInt(e.target.value));
                setPage(1);
              }}
              className="ml-4 px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Detail Slide-in Panel */}
      {showUserDetail && userDetail && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowUserDetail(false)}
          />

          {/* Slide-in Panel */}
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div
                className={`p-6 ${
                  isEditMode
                    ? "bg-gradient-to-r from-green-500 to-teal-600"
                    : "bg-gradient-to-r from-blue-500 to-purple-600"
                } text-white`}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">
                    {isEditMode ? "Edit User Details" : "User Details"}
                  </h2>
                  <button
                    onClick={() =>
                      isEditMode ? handleCancelEdit() : setShowUserDetail(false)
                    }
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* User Avatar and Basic Info */}
                <div className="flex flex-col items-center mb-6">
                  {isEditMode ? (
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4 overflow-hidden">
                        {editFormData.avatar ? (
                          <img
                            src={URL.createObjectURL(editFormData.avatar)}
                            alt="Avatar preview"
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : editFormData.nickname ? (
                          editFormData.nickname.charAt(0).toUpperCase()
                        ) : editFormData.username ? (
                          editFormData.username.charAt(0).toUpperCase()
                        ) : (
                          "U"
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
                      {userDetail.avatar ? (
                        <img
                          src={userDetail.avatar}
                          alt={
                            userDetail.nickname || userDetail.username || "User"
                          }
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML =
                              userDetail.nickname
                                ? userDetail.nickname.charAt(0).toUpperCase()
                                : userDetail.username
                                ? userDetail.username.charAt(0).toUpperCase()
                                : "U";
                          }}
                        />
                      ) : userDetail.nickname ? (
                        userDetail.nickname.charAt(0).toUpperCase()
                      ) : userDetail.username ? (
                        userDetail.username.charAt(0).toUpperCase()
                      ) : (
                        "U"
                      )}
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editFormData.nickname || ""}
                        onChange={(e) =>
                          handleInputChange("nickname", e.target.value)
                        }
                        className="text-center bg-transparent border-b border-gray-300 text-gray-800 focus:outline-none focus:border-blue-500"
                        placeholder="Enter nickname"
                      />
                    ) : (
                      userDetail.nickname || "Unknown User"
                    )}
                  </h3>
                  <p className="text-gray-500">@{userDetail.username}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    ID: {userDetail.id}
                  </p>
                </div>

                {/* User Information Sections */}
                <div className="space-y-6">
                  {/* Contact Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="text-blue-500"
                      />
                      Contact Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600 text-sm w-20">
                          Email:
                        </span>
                        {isEditMode ? (
                          <input
                            type="email"
                            value={editFormData.email || ""}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Enter email"
                          />
                        ) : (
                          <span className="text-gray-800 text-sm">
                            {userDetail.email || "N/A"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600 text-sm w-20">
                          Phone:
                        </span>
                        {isEditMode ? (
                          <input
                            type="tel"
                            value={editFormData.phone || ""}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Enter phone number"
                          />
                        ) : (
                          <span className="text-gray-800 text-sm">
                            {userDetail.phone || "N/A"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600 text-sm w-20">
                          Birthday:
                        </span>
                        {isEditMode ? (
                          <input
                            type="date"
                            value={editFormData.birthday || ""}
                            onChange={(e) =>
                              handleInputChange("birthday", e.target.value)
                            }
                            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        ) : (
                          <span className="text-gray-800 text-sm">
                            {userDetail.birthday || "N/A"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600 text-sm w-20">
                          Gender:
                        </span>
                        {isEditMode ? (
                          <select
                            value={editFormData.gender ?? ""}
                            onChange={(e) =>
                              handleInputChange("gender", e.target.value)
                            }
                            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            <option value="">Select Gender</option>
                            <option value="1">Male</option>
                            <option value="0">Female</option>
                          </select>
                        ) : (
                          <span className="text-gray-800 text-sm">
                            {userDetail.gender === 1
                              ? "Male"
                              : userDetail.gender === 0
                              ? "Female"
                              : "Not specified"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faCrown}
                        className="text-yellow-500"
                      />
                      Account Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600 text-sm w-20">
                          User Type:
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            userDetail.userType === 2
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {userDetail.userType === 2
                            ? "Administrator"
                            : "Regular User"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600 text-sm w-20">
                          Status:
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            userDetail.status === 1
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {userDetail.status === 1 ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        className="text-green-500"
                      />
                      Timeline Information
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600 text-sm w-20">
                          Registered:
                        </span>
                        <span className="text-gray-800 text-sm">
                          {userDetail.createdAt || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600 text-sm w-20">
                          Last Update:
                        </span>
                        <span className="text-gray-800 text-sm">
                          {userDetail.updatedAt || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-gray-200 p-4 bg-white">
                <div className="flex gap-3">
                  {isEditMode ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <FontAwesomeIcon icon={faCheck} />
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => openUserDetail(userDetail.id, true)}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                        Edit User
                      </button>
                      <button
                        onClick={() => setShowUserDetail(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Close
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register User Modal */}
      {openRegisterForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Register New User</h2>
              <button
                type="button"
                onClick={() => {
                  setOpenRegisterForm(false);
                  // Reset form data
                  setRegisterFormData({
                    username: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    nickname: "",
                    phone: "",
                    gender: "0",
                    birthday: "",
                    userType: "1",
                  });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>
            <form onSubmit={handleRegisterFormSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-gray-700">
                      Username *
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={registerFormData.username}
                      onChange={(e) => handleRegisterInputChange("username", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Input username"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-gray-700">
                      Email *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={registerFormData.email}
                      onChange={(e) => handleRegisterInputChange("email", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Input your email"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-gray-700">
                      Password *
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={registerFormData.password}
                      onChange={(e) => handleRegisterInputChange("password", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Input your password"
                    />
                  </div>
                   <div>
                    <label htmlFor="confirmPassword" className="block text-gray-700">
                      Confirm Password *
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={registerFormData.confirmPassword}
                      onChange={(e) => handleRegisterInputChange("confirmPassword", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirm your password"
                    />
                  </div>
                  <div>
                    <label htmlFor="nickname" className="block text-gray-700">
                      Nickname
                    </label>
                    <input
                      id="nickname"
                      name="nickname"
                      value={registerFormData.nickname}
                      onChange={(e) => handleRegisterInputChange("nickname", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Input your nickname (optional)"
                    />
                  </div>
                   <div>
                    <label htmlFor="phone" className="block text-gray-700">
                     Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      value={registerFormData.phone}
                      onChange={(e) => handleRegisterInputChange("phone", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Input your phone number (optional)"
                    />
                  </div>
                  <div>
                    <label htmlFor="birthday" className="block text-gray-700">
                     Birthday
                    </label>
                    <input
                      id="birthday"
                      name="birthday"
                      type="date"
                      value={registerFormData.birthday}
                      onChange={(e) => handleRegisterInputChange("birthday", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                    <div>
                    <label htmlFor="gender" className="block text-gray-700">
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={registerFormData.gender}
                      onChange={(e) => handleRegisterInputChange("gender", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="0">Unknown</option>
                      <option value="1">Male</option>
                      <option value="2">Female</option>
                    </select>
                </div>
                    <div>
                    <label htmlFor="role" className="block text-gray-700">
                      Role Type
                    </label>
                    <select
                      id="roleType"
                      name="roleType"
                      value={registerFormData.userType}
                      onChange={(e) => handleRegisterInputChange("roleType", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1">Regular User</option>
                      <option value="2">Administrator</option>
                    </select>
                </div>
                 </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenRegisterForm(false);
                      // Reset form data
                      setRegisterFormData({
                        username: "",
                        email: "",
                        password: "",
                        confirmPassword: "",
                        nickname: "",
                        phone: "",
                        gender: "0",
                        birthday: "",
                        userType: "1",
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Register
                  </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagementPage;
