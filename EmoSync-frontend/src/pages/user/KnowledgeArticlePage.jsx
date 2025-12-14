import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen, faSearch } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect, useRef } from "react";
import Pagination from "@/components/Pagination";
import ArticleDetailPage from "./components/ArticleDetailPage";
import api from "@/api";

const KnowledgeArticlePage = () => {
  // State management
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState([]);
  const [totalArticleCount, setTotalArticleCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [recommendArticles, setRecommendArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [searchForm, setSearchForm] = useState({
    keyword: "",
    categoryId: null,
    sortField: "publishedAt",
    sortDirection: "desc",
    currentPage: 1,
    size: 12,
  });

  const [showArticlePage, setShowArticlePage] = useState(false);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const isInitialMount = useRef(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const dailyTip =
    "Deep breathing is the simplest and most effective relaxation technique. When feeling stressed, try the 4-7-8 breathing method: inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds.";

  // Utility functions
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      "Emotional Management": "❤️",
      "Anxiety & Depression": "🧠",
      "Work Stress": "💼",
      "Interpersonal Relationships": "👥",
      "Sleep Health": "🛏️",
      "Child Psychology": "👶",
      "Trauma Recovery": "💔",
      "Relaxation Techniques": "🍃",
    };
    return iconMap[categoryName] || "📖";
  };

  const formatReadCount = (count) => {
    if (!count) return "0";
    if (count < 1000) return count.toString();
    if (count < 10000) return (count / 1000).toFixed(1) + "k";
    return (count / 10000).toFixed(1) + "w";
  };

  const getAutoSummary = (content) => {
    if (!content) return "";
    const plainText = content.replace(/<[^>]+>/g, "");
    return plainText.length > 150
      ? plainText.substring(0, 150) + "..."
      : plainText;
  };

  const handleImageError = (e) => {
    e.target.src =
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = {
        ...searchForm,
        categoryId: selectedCategoryId,
      };

      console.log("searchForm:", searchForm || {});
      const response = await api.get("/knowledge/article/page", {
        params: {
          ...params,
        },
      });
    
      setArticles(response?.data?.data?.records || []);
      setTotal(response?.data?.data?.total || 0);
    } catch (error) {
      console.error("Failed to fetch article list:", error);

      setArticles([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };
    

  const fetchCategories = async () => {
    try {
      const response = await api.get("/knowledge/category/tree");
      const tree = response?.data?.data;
     
      console.log(" Categories tree:", tree);

      if (tree && Array.isArray(tree)) {
      
        const totalArticleCount = tree.reduce(
          (sum, cat) => sum + (cat.articleCount || 0),
          0
        );
        console.log(
          " Total article count from categories:",
          totalArticleCount
        );
        setCategories(tree);
        setTotalArticleCount(totalArticleCount);
      } else {
        setCategories([]);
        setTotalArticleCount(0);
        console.warn("Unexpected categories response structure:", response);
      }
    } catch (error) {
      console.error("Failed to fetch category list:", error);
      setCategories([]);
      setTotalArticleCount(0);
    }
  };

  const fetchRecommendArticles = async () => {
    try {
      const params = {
        sortField: "readCount",
        sortDirection: "desc",
        currentPage: 1,
        size: 3,
      };

      console.log("Requesting recommended articles with params:", params);
      const response = await api.get("/knowledge/article/page", { params : {...params} });
   
      const data = response?.data?.data;
     
      setRecommendArticles(data?.records || []);
    } catch (error) {
      console.error("Failed to fetch recommended articles:", error);
      setRecommendArticles([]);
    }
  };

  // Search history management
  const loadSearchHistory = () => {
    try {
      const saved = localStorage.getItem("knowledge_search_history");
      if (saved) {
        setSearchHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load search history:", error);
    }
  };

  const addSearchHistory = (keyword) => {
    const filteredHistory = searchHistory.filter((item) => item !== keyword);
    const newHistory = [keyword, ...filteredHistory].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem(
      "knowledge_search_history",
      JSON.stringify(newHistory)
    );
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("knowledge_search_history");
    setShowSearchHistory(false);
  };

  const removeHistoryItem = (keyword) => {
    const newHistory = searchHistory.filter((item) => item !== keyword);
    setSearchHistory(newHistory);
    localStorage.setItem(
      "knowledge_search_history",
      JSON.stringify(newHistory)
    );
  };

  const selectHistoryItem = (keyword) => {
    setSearchForm((prev) => ({ ...prev, keyword }));
    handleSearch(keyword);
  };

  // Event handlers
  const handleSearch = (keyword = null) => {
    const searchKeyword = keyword || searchForm.keyword;
    if (searchKeyword && searchKeyword.trim()) {
      addSearchHistory(searchKeyword.trim());
    }
    setShowSearchHistory(false);
    fetchArticles();
  };

  const selectCategory = (categoryId) => {

    setSelectedCategoryId(categoryId);

    // Update both categoryId and reset to first page in a single call
    setSearchForm((prev) => {
      console.log("Updating searchForm from:", prev);
      const newForm = {
        ...prev,
        categoryId: categoryId,
        currentPage: 1, // Reset to first page when changing category
      };
      console.log("To new searchForm:", newForm);
      return newForm;
    });

    // Trigger refresh to ensure useEffect runs
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSortChange = (value) => {
    setSearchForm((prev) => ({ ...prev, sortField: value, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setSearchForm((prev) => ({ ...prev, currentPage: page }));
  };

  const handleSizeChange = (size) => {
    setSearchForm((prev) => ({ ...prev, size, currentPage: 1 }));
  };

  const goToArticle = async (articleId) => {
    console.log("View article:", articleId);
    try {
      // 获取文章详情
      const response = await api.get(`/knowledge/article/${articleId}`);
      setSelectedArticle(response?.data?.data);
      setShowArticlePage(true);

      // 增加阅读量 - 添加延迟和防重复调用
      setTimeout(async () => {
        try {
          await api.post(`/knowledge/article/${articleId}/read`);
          console.log("read article:", response?.data?.data);
        } catch (readError) {
          console.error("Failed to update read count:", readError);
          // 不显示错误，因为这不是关键功能
        }
      }, 500); // 延迟500ms执行，避免与React严格模式的重复执行冲突
    } catch (error) {
      console.error("Failed to load article:", error);
      alert("Failed to load article details");
    }
  };

  const toggleFavorite = async (article) => {
    const token = localStorage.getItem("token");
    if (!token) {
      if (
        window.confirm(
          "You need to login to favorite articles. Go to login page?"
        )
      ) {
        alert("Redirecting to login page");
      }
      return;
    }

    try {
      if (article.isFavorited) {
        await api.delete(`/knowledge/favorite/${article.id}`);
        setArticles((prev) =>
          prev.map((a) =>
            a.id === article.id
              ? {
                  ...a,
                  isFavorited: false,
                  favoriteCount: Math.max(0, (a.favoriteCount || 1) - 1),
                }
              : a
          )
        );
        alert("Removed from favorites");
      } else {
        await api.post(`/knowledge/favorite/${article.id}`);
        setArticles((prev) =>
          prev.map((a) =>
            a.id === article.id
              ? {
                  ...a,
                  isFavorited: true,
                  favoriteCount: (a.favoriteCount || 0) + 1,
                }
              : a
          )
        );
        alert("Added to favorites");
      }
    } catch (error) {
      console.error("Favorite operation failed:", error);
      alert("Operation failed");
    }
  };

  // Effects
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          loadSearchHistory(),
          fetchCategories(),
          
        ]);
        // Initial fetch after categories are loaded
        fetchRecommendArticles();
        fetchArticles();
      } catch (error) {
        console.error("Failed to initialize data:", error);
      } finally {
        isInitialMount.current = false;
      }
    };

    initializeData();
  }, []); // Only run once on mount

  useEffect(() => {
    // Skip the first render to prevent infinite loop
    if (isInitialMount.current || loading) {
      return;
    }

    console.log("useEffect triggered due to dependencies change");
    console.log("searchForm:", searchForm);
    console.log("selectedCategoryId:", selectedCategoryId);

    // Add a small delay to prevent rapid successive calls
    const timeoutId = setTimeout(() => {
      fetchArticles();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [
    searchForm.currentPage,
    searchForm.size,
    searchForm.sortField,
    selectedCategoryId,
    searchForm.keyword,
    searchForm.categoryId, // Explicitly include categoryId
    refreshTrigger, // Include refresh trigger
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-amber-500 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <FontAwesomeIcon
                icon={faBookOpen}
                className="text-6xl animate-pulse "
              />
              <div className="text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Mental Health Articles
                </h2>
              </div>
            </div>

            {/* Search */}
            <div className="w-full md:w-96 relative">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchForm.keyword}
                  onChange={(e) =>
                    setSearchForm((prev) => ({
                      ...prev,
                      keyword: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  onFocus={() => setShowSearchHistory(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSearchHistory(false), 200)
                  }
                  placeholder="Search mental health articles..."
                  className="w-full px-4 py-3 pr-12 rounded-2xl bg-white/10 border-2 border-white/30 text-white placeholder-white/70 focus:bg-white/15 focus:border-white/60 outline-none transition-all"
                />
                <button
                  onClick={() => handleSearch()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>

              {/* Search History Dropdown */}
              {showSearchHistory && searchHistory.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl overflow-hidden z-50">
                  <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-600">
                      Search History
                    </span>
                    <button
                      onClick={clearSearchHistory}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {searchHistory.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer group"
                        onClick={() => selectHistoryItem(item)}
                      >
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="flex-1 text-sm text-gray-700">
                          {item}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeHistoryItem(item);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Categories */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Categories
                </h3>
                <div className="space-y-1">
                  <div
                    onClick={() => selectCategory(null)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
                      selectedCategoryId === null
                        ? "bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-md transform -translate-y-0.5"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-xl">📚</span>
                    <span className="flex-1 font-medium">All Categories</span>
                    <span className="text-sm opacity-70">
                      {totalArticleCount}
                    </span>
                  </div>
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => selectCategory(category.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
                        selectedCategoryId === category.id
                          ? "bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-md transform -translate-y-0.5"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-xl">
                        {getCategoryIcon(category.categoryName)}
                      </span>
                      <span className="flex-1 font-medium">
                        {category.categoryName}
                      </span>
                      <span className="text-sm opacity-70">
                        ({category.articleCount || 0})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Articles */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span>⭐</span>
                  Recommended Reading
                </h3>
                <div className="space-y-4">
                  {recommendArticles.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => goToArticle(article.id)}
                      className="border-l-4 border-amber-500 pl-4 cursor-pointer hover:translate-x-1 transition-transform"
                    >
                      <h4 className="font-medium text-gray-800 text-sm mb-1 line-clamp-2">
                        {article.title}
                      </h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        Read: {formatReadCount(article.readCount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Tip */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span>💡</span>
                  Daily Mental Health Tip
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {dailyTip}
                </p>
              </div>
            </aside>

            {/* Main Content */}
            <main className="space-y-6">
              {/* Filter Bar */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-700 font-medium whitespace-nowrap">
                      Sort by:
                    </span>
                    <select
                      value={searchForm.sortField}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="publishedAt">Latest Published</option>
                      <option value="readCount">Most Read</option>
                      <option value="relevance">Relevance</option>
                    </select>
                  </div>
                  <span className="text-gray-600 whitespace-nowrap">
                    Found <strong className="text-amber-500">{total}</strong>{" "}
                    articles
                  </span>
                </div>
              </div>

              {/* Articles List */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                </div>
              ) : articles.length > 0 ? (
                <div className="space-y-6">
                  {articles.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => goToArticle(article.id)}
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row">
                        {/* Cover Image */}
                        <div
                          className="w-full sm:w-48 h-48 sm:h-auto cursor-pointer overflow-hidden group"
                        
                        >
                          {article.coverImage ? (
                            <img
                              src={article.coverImage}
                              alt={article.title}
                              onError={handleImageError}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center text-white text-5xl">
                              📄
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <h3
                              onClick={() => goToArticle(article.id)}
                              className="text-xl font-semibold text-gray-800 hover:text-amber-500 cursor-pointer transition-colors line-clamp-2"
                            >
                              {article.title}
                            </h3>
                            <button
                              onClick={() => toggleFavorite(article)}
                              className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                                article.isFavorited
                                  ? "text-red-500 bg-red-50"
                                  : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                              }`}
                            >
                              <svg
                                className="w-6 h-6"
                                fill={
                                  article.isFavorited ? "currentColor" : "none"
                                }
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                              </svg>
                            </button>
                          </div>

                          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                            {article.summary || getAutoSummary(article.content)}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
                              {article.categoryName}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              {formatReadCount(article.readCount)} read
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-gray-500">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <p className="text-lg mb-2">No articles found</p>
                  <p className="text-sm opacity-80">
                    Try adjusting search criteria or browsing other categories
                  </p>
                </div>
              )}

              {/* Pagination */}
              {total > 0 && (
                <Pagination
                  totalItems={total}
                  pageSize={searchForm.size}
                  currentPage={searchForm.currentPage}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handleSizeChange}
                  pageSizeOptions={[6, 12, 18, 24]}
                  showInfo={true}
                />
              )}
            </main>
          </div>
        </div>
      </div>
      {showArticlePage && (
        <ArticleDetailPage
          selectedArticle={selectedArticle}
          onClose={() => setShowArticlePage(false)}
        />
      )}
    </div>
  );
};

export default KnowledgeArticlePage;
