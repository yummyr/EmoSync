import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faEye,
  faArrowsRotate,
  faCirclePlus,
  faBan,
} from "@fortawesome/free-solid-svg-icons";
import api from "@/api";

const KnowledgeArticlePage = () => {
  // Filters
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");
  const [author, setAuthor] = useState("");

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

  // Delete a single article
  const deleteArticle = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;

    await api.delete(`/knowledge/article/${id}`);
    loadArticles();
  };

  // Offline Article
  const offlineArticle = async (id) => {
    await api.post(`/knowledge/article/${id}/offline`);
    loadArticles();
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title"
            className="border border-gray-300 rounded-lg px-3 py-2"
          />

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Select category</option>
            <option value="1">Stress</option>
            <option value="2">Anxiety</option>
            <option value="3">Sleep</option>
            {/* TODO replace with API categoryList */}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Select status</option>
            <option value="1">Published</option>
            <option value="0">Offline</option>
          </select>

          <input
            type="text"
            value={author}
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

          <button className="px-5 py-2 bg-blue-400 text-white rounded-lg flex items-center gap-2">
            <FontAwesomeIcon icon={faCirclePlus} className="w-5 h-5" /> New Article
          </button>
            <button className="px-5 py-2 bg-pink-400 text-white rounded-lg flex items-center gap-2">
            <FontAwesomeIcon icon={faBan} className="w-5 h-5" /> Delete Selected
          </button>
          <button
            onClick={() => loadArticles()}
            className="px-5 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faArrowsRotate} className="w-5 h-5" /> Refresh
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

                <td className="p-3 text-gray-500">{article.id.slice(0, 6)}...</td>

                <td className="p-3 font-medium">{article.title}</td>

                <td className="p-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-lg">
                    {article.categoryName || "Unknown"}
                  </span>
                </td>

                <td className="p-3">{article.authorName || "Unknown"}</td>

                <td className="p-3 text-green-600 font-semibold">
                  {article.viewCount > 1000
                    ? (article.viewCount / 1000).toFixed(1) + "k"
                    : article.viewCount}
                </td>

                <td className="p-3 text-gray-600">{article.publishedAt}</td>
                <td className="p-3 text-gray-600">{article.createdAt}</td>

                <td className="p-3 flex gap-3 text-sm">
                  <button className="text-blue-600 hover:underline flex items-center gap-1">
                    <FontAwesomeIcon icon={faEdit} className="w-4 h-4" /> Edit
                  </button>

                  <button
                    onClick={() => offlineArticle(article.id)}
                    className="text-yellow-600 hover:underline"
                  >
                    Offline
                  </button>

                  <button className="text-gray-600 hover:underline flex items-center gap-1">
                    <FontAwesomeIcon icon={faEye} className="w-4 h-4" /> Preview
                  </button>

                  <button
                    onClick={() => deleteArticle(article.id)}
                    className="text-red-600 hover:underline flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" /> Delete
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
    </div>
  );
};

export default KnowledgeArticlePage;
