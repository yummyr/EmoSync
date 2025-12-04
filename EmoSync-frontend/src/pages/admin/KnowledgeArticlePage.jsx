import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faEye,
  faArrowsRotate,
  faCirclePlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import ReactQuill from "react-quill";
import api from "@/api";

const KnowledgeArticlePage = () => {
  // Filters
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");
  const [author, setAuthor] = useState("");
  const [openEditForm, setOpenEditForm] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [categoriesMap, setCategoriesMap] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/knowledge/category/all");
        console.log("Fetched categories map:", res.data.data);
        setCategoriesMap(res.data.data || []);
      } catch (e) {
        console.error("Failed to fetch categories", e);
      }
    };
    fetchCategories();
  }, []);

  // Edit Form Data
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    categoryId: "",
    authorId: "",
    status: "",
    tags: "",
    coverImage: "",
  });
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleSave = async (id) => {
    try {
      if (isEditMode) {
        const res = await api.put(`/knowledge/article/${id}`, formData);
        alert("Article updated successfully.");
      } else {
        const res = await api.post("/knowledge/article", formData);
        alert("Article added successfully."); 
      }
      setOpenEditForm(false);
      loadArticles();
    } catch (e) {
      console.error("Failed to save article changes", e);
      alert("Failed to save changes.");
    }
  }

  // Add Article
  const handleOpenAddForm = () => {
    setIsEditMode(false);
    setOpenEditForm(true);
    setFormData({
      title: "",
      summary: "",
      content: "",
      categoryId: "",
      authorId: "",
      status: "",
      tags: "",
      coverImage: "",
    });
  }


  // Safe HTML rendering component
  const SafeHTMLRenderer = ({ htmlContent }) => {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: htmlContent || "" }}
        className="text-sm line-clamp-3"
      />
    );
  };

  // Data
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);

  // Pagination
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  // Batch selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Load article list
  const loadArticles = async () => {
    try {
      const res = await api.get("/knowledge/article/page", {
        params: {
          title,
          categoryId,
          status,
          authorId: author,
          currentPage: page,
          size,
        },
      });

      const data = res.data.data;
      console.log("Loaded articles from /knowledge/article/page:", data);
      setArticles(data.records || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error("Failed to load articles", e);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [page, size]);

  // Reset filters
  const resetFilters = () => {
    setTitle("");
    setCategoryId("");
    setStatus("");
    setAuthor("");
    setPage(1);
    loadArticles();
  };
  // Edit Article
  const editArticle = async (id) => {
    setOpenEditForm(true);
    setIsEditMode(true);
    const res = await api.get(`/knowledge/article/${id}`);
    const article = res.data.data;
    console.log("Editing article:", article);
    if (!article) {
      alert("Article not found");
      return;
    }
    setFormData({
      title: article.title,
      summary: article.summary,
      categoryId: article.categoryId,
      authorId: article.authorId,
      status: article.status,
      tags: article.tags,
      content: article.content,
      coverImage: article.coverImage,
    });
  };

    const previewArticle =async (id) => {
    console.log("Preview article:", id);
    setOpenPreview(true);

    const res = await api.get(`/knowledge/article/${id}`);
    const article = res.data.data;
    if (!article) {
      alert("Article not found");
      return;
    }
    setFormData({
      title: article.title,
      summary: article.summary,
      categoryId: article.categoryId,
      authorId: article.authorId,
      status: article.status,
      tags: article.tags,
      content: article.content,
      coverImage: article.coverImage,
    });
  };
  const handleClosePreview = () => {
    setOpenPreview(false);
    setFormData({});
  }

  const handleCloseEditForm = () => {
    setOpenEditForm(false);
    setFormData({});
  }
  // Delete a single article
  const deleteArticle = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?"))
      return;

    await api.delete(`/knowledge/article/${id}`);
    loadArticles();
  };

  // Offline Article
  const changeArticleStatus = async (id) => {
    console.log("Offline article:", id);
    const status = articles.find((a) => a.id === id)?.status;
    if (status !== 1) {
      window.confirm("Are you sure you want to publish this article?");
      await api.post(`/knowledge/article/${id}/publish`);
      loadArticles();
    } else {
      window.confirm("Are you sure you want to offline this article?");
      await api.post(`/knowledge/article/${id}/offline`);
      loadArticles();
    }
  };

  return (
    <div className="p-6">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Knowledge Articles</h1>
        <p className="text-gray-600 mt-2">
          Manage and review knowledge article content
        </p>
      </div>

      {/* Search Filters */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            value={title || ""}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title"
            className="border border-gray-300 rounded-lg px-3 py-2"
          />

          <input
            value={categoryId || ""}
            placeholder="Category ID"
            onChange={(e) => setCategoryId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />

          <select
            value={status || ""}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Select status</option>
            <option value="1">Published</option>
            <option value="0">Offline</option>
          </select>

          <input
            type="text"
            value={author || ""}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author name"
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        {/* Search / Reset Buttons */}
        <div className="mt-4 flex gap-4">
          <button
            onClick={() => {
              setPage(1);
              loadArticles();
            }}
            className="px-5 py-2 bg-blue-400 text-white rounded-lg"
          >
            Search
          </button>

          <button
            onClick={resetFilters}
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg"
          >
            Reset
          </button>

          <div className="flex-grow"></div>

          <button onClick={handleOpenAddForm} className="px-5 py-2 bg-blue-400 text-white rounded-lg flex items-center gap-2">
            <FontAwesomeIcon icon={faCirclePlus} className="w-5 h-5" /> New
            Article
          </button>
          <button className="px-5 py-2 bg-pink-400 text-white rounded-lg flex items-center gap-2">
            <FontAwesomeIcon icon={faXmark} className="w-5 h-5" /> Delete
            Selected
          </button>
          <button
            onClick={() => loadArticles()}
            className="px-5 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faArrowsRotate} className="w-5 h-5" />{" "}
            Refresh
          </button>
        </div>
      </div>

      {/* Article Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setSelectedIds(
                      e.target.checked ? articles.map((a) => a.id) : []
                    )
                  }
                />
              </th>
              <th className="p-3">ID</th>
              <th className="p-3">Title</th>
              <th className="p-3">Category</th>
              <th className="p-3">Author</th>
              <th className="p-3">Views</th>

              <th className="p-3">Published</th>
              <th className="p-3">Created</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(article.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds([...selectedIds, article.id]);
                      } else {
                        setSelectedIds(
                          selectedIds.filter((id) => id !== article.id)
                        );
                      }
                    }}
                  />
                </td>

                <td className="p-3 text-gray-500">
                  {article.id.slice(0, 6)}...
                </td>

                <td className="p-3 font-medium">
                  <div>
                    <div className="text-gray-900 font-semibold">
                      {article.title || "UnTitled"}
                    </div>
                   
                  </div>
                </td>

                <td className="p-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-lg">
                    {article.categoryName || "Unknown"}
                  </span>
                </td>

                <td className="p-3">{article.authorName || "Unknown"}</td>

                <td className="p-3 text-green-600 font-semibold">
                  {article.readCount > 1000
                    ? (article.readCount / 1000).toFixed(1) + "k"
                    : article.readCount}
                </td>

                <td className="p-3 text-gray-600">{article.publishedAt}</td>
                <td className="p-3 text-gray-600">{article.createdAt}</td>

                <td className="p-3 flex gap-3 text-sm hover:underline items-center">
                  <button onClick={() => editArticle(article.id)}>
                    <FontAwesomeIcon icon={faEdit} className="w-4 h-4" /> Edit
                  </button>

                  <button
                    onClick={() => changeArticleStatus(article.id)}
                    className={
                      article.status === 1
                        ? "bg-blue-300 rounded-md   hover:underline"
                        : "bg-pink-300 rounded-md hover:underline"
                    }
                  >
                    {article.status === 1 ? (
                      <div className="flex items-center p-1 gap-1">Published</div>
                    ) : (
                      <div className="flex items-center p-1 gap-1">Offline</div>
                    )}
                  </button>

                  <button onClick={() => previewArticle(article.id)} className="text-gray-600 hover:underline flex items-center gap-1">
                    <FontAwesomeIcon icon={faEye} className="w-4 h-4" /> Preview
                  </button>

                  <button
                    onClick={() => deleteArticle(article.id)}
                    className="text-red-600 hover:underline flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />{" "}
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="p-4 flex items-center justify-between bg-gray-50">
          <div className="text-gray-600">Total {total} articles</div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              Prev
            </button>

            <span className="px-3">{page}</span>

            <button
              disabled={page * size >= total}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              Next
            </button>

            <select
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="border rounded px-2 py-1"
            >
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
            </select>
          </div>
        </div>
      </div>

      {openEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-3/4 max-w-3xl p-6 relative">
            <h2 className="text-2xl font-bold mb-4 text-blue-500">
              Edit Article
            </h2>
            <button
              onClick={handleCloseEditForm}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
            >
              <FontAwesomeIcon
                icon={faXmark}
                className="w-6 h-6 text-red-600 p-4"
              />
            </button>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block font-bold text-pink-500 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-bold text-pink-500 mb-1">
                  Category
                </label>
                <select
                  value={formData.categoryId || ""}
                  onChange={(e) =>
                    handleInputChange("categoryId", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(categoriesMap).map(([key, value]) => (
                    <option key={key} value={key}>
                      {`id: ${key}`} - {value}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-pink-500 mb-1">
                  Summary
                </label>
                <input
                  type="text"
                  value={formData.summary || ""}
                  onChange={(e) => handleInputChange("summary", e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-bold text-pink-500 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  value={formData.tags || ""}
                  onChange={(e) => handleInputChange("tags", e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-bold text-pink-500 mb-1">
                  Image Cover
                </label>
                <input
                  type="text"
                  value={formData.coverImage || ""}
                  onChange={(e) =>
                    handleInputChange("coverImage", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-bold text-pink-500 mb-1">
                  Content
                </label>
                <div className="bg-white rounded-lg border border-blue-300">
                  <ReactQuill
                    theme="snow"
                    value={formData.content || ""}
                    onChange={(value) => handleInputChange("content", value)}
                    style={{ height: "400px" }}
                    placeholder="Enter article content"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseEditForm}
                className="flex-1 px-4 py-2 border bg-pink-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSave(formData.id);
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {openPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-3/4 max-w-3xl p-6 relative">
            <h2 className="text-2xl font-bold mb-4 text-blue-500">
              Preview Article
            </h2>
            <button
              onClick={handleClosePreview}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
            >
              <FontAwesomeIcon
                icon={faXmark}
                className="w-6 h-6 text-red-600 p-4"
              />
            </button>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <img
                  src={formData.coverImage || ""}
                  alt="Cover Image"
                  className="w-full h-auto mb-4"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                 {formData.title || "Untitled"}
                </h3>

                <p className="text-gray-700 mb-4">
                summary:  {formData.summary || "No summary available."}
                </p>
              </div>
              <div>
                Content:<SafeHTMLRenderer htmlContent={formData.content || "<p>No content available.</p>"} />
              </div>
            </div>
          </div>
        </div>
      )}  
    </div>
  );
};

export default KnowledgeArticlePage;
