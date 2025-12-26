import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faCalendar,
  faPenFancy,
  faSyncAlt,
  faBookOpen,
  faRefresh,
  faEye,
  faTrash,
  faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";
import api from "@/api";
import Pagination from "@/components/Pagination";
import error_default_img from "@/assets/images/error_default_img.png";
import ArticleDetailPage from "./components/ArticleDetailPage";

export default function FavoritesPage() {
  const navigate = useNavigate();
  // State management
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [searchParams, setSearchParams] = useState({
    currentPage: 1,
    size: 8,
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [articleToRemove, setArticleToRemove] = useState(null);

  const [showArticlePage, setShowArticlePage] = useState(false);
  const [article, setArticle] = useState(null);
  // Fetch favorites list
  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await api.get("/knowledge/favorite/page", {
        params: {
          currentPage: searchParams.currentPage,
          size: searchParams.size,
        },
      });
      console.log("Fetched favorites response:", res);
      setArticles(res.data.data.records || []);
      setTotal(res.data.data.total || 0);
      setSearchParams((prev) => ({
        ...prev,
        currentPage: res.current || 1,
        size: res.size || 8,
      }));
    } catch (error) {
      console.error("Failed to fetch favorites list:", error);
      alert("Failed to fetch favorites list");
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const formatDateString = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString("en-US");
  };

  const fetchFavoriteCount = async () => {
    try {
      const res = await api.get("/knowledge/favorite/count");
      setFavoriteCount(res.data.data || 0);
    } catch (error) {
      console.error("Failed to fetch favorite count:", error);
      alert("Failed to fetch favorite count");
    }
  };
  const getAutoSummary = (content) => {
    if (!content) return "";
    const plainText = content.replace(/<[^>]+>/g, "");
    return plainText.length > 150
      ? plainText.substring(0, 150) + "..."
      : plainText;
  };

  const formatReadCount = (count) => {
    if (!count) return "0";
    if (count < 1000) return count.toString();
    if (count < 10000) return (count / 1000).toFixed(1) + "k";
    return (count / 10000).toFixed(1) + "w";
  };

  const handleImageError = (e) => {
    e.target.src = error_default_img;
  };

  // Page handlers
  const handlePageChange = (page) => {
    setSearchParams((prev) => ({ ...prev, currentPage: page }));
  };

  const handleSizeChange = (size) => {
    setSearchParams({ currentPage: 1, size });
  };

  const viewArticle = async (articleId) => {
    console.log("View article:", articleId);
    try {
      // Fetch article details
      const response = await api.get(`/knowledge/article/${articleId}`);
      console.log("View article:", response);
      setArticle(response?.data?.data);
      setShowArticlePage(true);
    } catch (error) {
      console.error("Failed to load article:", error);
      alert("Failed to load article details");
    }
  };

  const confirmRemoveFavorite = (article) => {
    setArticleToRemove(article);
    setShowConfirmDialog(true);
  };

  // favorite article
  const addFavorite = async (articleId) => {
    try {
      await api.post(`/knowledge/favorite/${articleId}`);
      alert("Added to favorites successfully");
      fetchFavorites();
      fetchFavoriteCount();
    } catch (error) {
      console.error("Failed to add to favorites:", error);
      alert("Failed to add to favorites");
    }
  };

  // unfavorite article
  const removeFavorite = async () => {
    if (!articleToRemove) return;

    try {
      await api.delete(`/knowledge/favorite/${articleToRemove.id}`);
      alert("Removed from favorites successfully");
      setShowConfirmDialog(false);
      setArticleToRemove(null);
      fetchFavorites();
      fetchFavoriteCount();
    } catch (error) {
      console.error("Failed to remove from favorites:", error);
      alert("Failed to remove from favorites");
    }
  };

  const goToKnowledge = () => {
    console.log("Navigate to knowledge articles page");
    navigate("/user/knowledge");
  };

  const refreshList = () => {
    fetchFavorites();
    fetchFavoriteCount();
  };
  const handleOnClose = () => {
    setShowArticlePage(false);
    setArticle(null);
    fetchFavorites();
  };
  // Load data on mount and when searchParams change
  useEffect(() => {
    fetchFavorites();
  }, [searchParams.currentPage, searchParams.size]);

  useEffect(() => {
    fetchFavoriteCount();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-amber-500 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 text-center md:text-left">
              <div className="text-6xl animate-pulse">
                <FontAwesomeIcon icon={faHeart} className="text-white" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">
                  My Favorites
                </h2>
                <p className="text-base md:text-lg opacity-90">
                  {favoriteCount || 0} favorite articles
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
              <button
                onClick={refreshList}
                className="px-4 md:px-6 py-2 md:py-3 rounded-lg bg-white/20 border-2 border-white/30 hover:bg-white/30 hover:border-white/50 transition-all hover:-translate-y-0.5 flex items-center gap-2 text-sm md:text-base"
              >
                <FontAwesomeIcon icon={faRefresh} className="text-white" />
                Refresh List
              </button>

              <button
                onClick={goToKnowledge}
                className="px-4 md:px-6 py-2 md:py-3 rounded-lg bg-transparent border-2 border-white/30 hover:bg-white/10 hover:border-white/50 transition-all hover:-translate-y-0.5 flex items-center gap-2 text-sm md:text-base"
              >
                <FontAwesomeIcon icon={faBookOpen} />
                Browse All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
          )}

          {/* Articles Grid */}
          {!loading && articles.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-8">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Cover Image */}
                  <div
                    className="relative h-48 overflow-hidden group cursor-pointer"
                    onClick={() => viewArticle(article.id)}
                  >
                    {article.coverImage ? (
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        onError={handleImageError}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center text-white text-5xl">
                        📄
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white">
                      <FontAwesomeIcon icon={faEye} className="text-3xl" />
                      <span className="text-sm font-medium">View Details</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 md:p-6">
                    <h3
                      onClick={() => viewArticle(article.id)}
                      className="text-base md:text-lg font-semibold text-gray-800 mb-3 hover:text-amber-500 transition-colors cursor-pointer line-clamp-2 leading-snug"
                    >
                      {article.title}
                    </h3>

                    <p className="text-xs md:text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                      {article.summary || getAutoSummary(article.content)}
                    </p>

                    {/* Meta Info */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex flex-col gap-2 mb-4">
                        <span className="flex items-center gap-2 text-xs text-gray-500">
                         <FontAwesomeIcon icon={faCalendar} className="text-md" />
                          Favorited on {formatDateString(article.favoriteTime)}
                        </span>
                        <span className="flex items-center gap-2 text-xs text-gray-500">
                         <FontAwesomeIcon icon={faEye} className="text-md" />
                          {formatReadCount(article.readCount)} reads
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => viewArticle(article.id)}
                          className="flex-1 px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-xs md:text-sm font-medium flex items-center justify-center gap-2"
                        >
                         <FontAwesomeIcon icon={faEye} className="text-md" />
                          View Favorite
                        </button>
                        <button
                          onClick={() => confirmRemoveFavorite(article)}
                          className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-xs md:text-sm font-medium flex items-center justify-center gap-2"
                        >
                         <FontAwesomeIcon icon={faTrash} className="text-md" />
                          Remove Favorite
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && articles.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <div className="text-6xl mb-4 opacity-50">💔</div>
              <p className="text-lg md:text-xl mb-2">
                No favorite articles yet
              </p>
              <p className="text-sm opacity-80">
                You haven't favorited any articles yet, go to the
                <button
                  onClick={goToKnowledge}
                  className="text-amber-500 hover:underline mx-1 font-medium"
                >
                  Knowledge Articles
                </button>
                to browse interesting content!
              </p>
            </div>
          )}

          {/* Pagination */}
          {total > 0 && (
            <Pagination
              totalItems={total}
              pageSize={searchParams.size}
              currentPage={searchParams.currentPage}
              onPageChange={handlePageChange}
              onPageSizeChange={handleSizeChange}
              pageSizeOptions={[6, 12, 18, 24]}
              showInfo={true}
            />
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="text-2xl text-yellow-500"
                />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-800">
                Remove Favorite
              </h3>
            </div>

            <p className="text-sm md:text-base text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to remove article{" "}
              <span className="font-semibold text-gray-800">
                "{articleToRemove?.title}"
              </span>{" "}
              from favorites?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setArticleToRemove(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={removeFavorite}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium text-sm md:text-base"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showArticlePage && (
        <ArticleDetailPage
          selectedArticle={article}
          onClose={() => handleOnClose()}
        />
      )}
    </div>
  );
}
