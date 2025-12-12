import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faCalendar,
  faPenFancy,
  faSyncAlt,
  faBookOpen,
} from "@fortawesome/free-solid-svg-icons";
import api from "@/api";
import Pagination from "@/components/Pagination";

export default function FavoritesPage() {
   // State management
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [searchParams, setSearchParams] = useState({
    currentPage: 1,
    size: 8
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [articleToRemove, setArticleToRemove] = useState(null);

  // Fetch favorites list
  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await api.get("/knowledge/favorite/page",{
        params: {
          currentPage: searchParams.currentPage,
          size: searchParams.size,
        },
      });
      setArticles(res.data.data.records || []);
      setTotal(res.data.data.total || 0);
      setSearchParams(prev => ({
        ...prev,
        currentPage: res.current || 1,
        size: res.size || 8
      }));
    } catch (error) {
      console.error('Failed to fetch favorites list:', error);
      alert('Failed to fetch favorites list');
    } finally {
      setLoading(false);
    }
  };


  // Utility functions
  const formatDateString = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString('en-US');
  };

  const fetchFavoriteCount = async () => {
    try {
      const res = await api.get("/knowledge/favorite/count");
      setFavoriteCount(res.data.data || 0);
    } catch (error) {
      console.error('Failed to fetch favorite count:', error);
      alert('Failed to fetch favorite count');
    }
  }
  const getAutoSummary = (content) => {
    if (!content) return '';
    const plainText = content.replace(/<[^>]+>/g, '');
    return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
  };

  const formatReadCount = (count) => {
    if (!count) return '0';
    if (count < 1000) return count.toString();
    if (count < 10000) return (count / 1000).toFixed(1) + 'k';
    return (count / 10000).toFixed(1) + 'w';
  };

  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  };

  // Page handlers
  const handlePageChange = (page) => {
    setSearchParams(prev => ({ ...prev, currentPage: page }));
  };

  const handleSizeChange = (size) => {
    setSearchParams({ currentPage: 1, size });
  };

  const viewArticle = (articleId) => {
    console.log('View article:', articleId);
    alert(`View article ID: ${articleId}`);
    // Actual project use: navigate(`/knowledge/article/${articleId}`)
  };

  const confirmRemoveFavorite = (article) => {
    setArticleToRemove(article);
    setShowConfirmDialog(true);
  };

  // favorite article
  const addFavorite = async (articleId) => {
    try {
      await api.post(`/knowledge/favorite/${articleId}`);
      alert('Added to favorites successfully');
      fetchFavorites();
      fetchFavoriteCount();
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      alert('Failed to add to favorites');
    }
  };

  // unfavorite article
  const removeFavorite = async () => {
    if (!articleToRemove) return;
    
    try {
      await api.delete(`/knowledge/favorite/${articleToRemove.id}`);
      alert('Removed from favorites successfully');
      setShowConfirmDialog(false);
      setArticleToRemove(null);
      fetchFavorites();
      fetchFavoriteCount();
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      alert('Failed to remove from favorites');
    }
  };

  const goToKnowledge = () => {
    console.log('Navigate to knowledge base');
    alert('Navigate to knowledge base');
    // Actual project use: navigate('/knowledge')
  };

  const refreshList = () => {
    fetchFavorites();
    fetchFavoriteCount();
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
                <h2 className="text-3xl md:text-4xl font-bold mb-2">My Favorites</h2>
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
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh List
              </button>
              
              <button
                onClick={goToKnowledge}
                className="px-4 md:px-6 py-2 md:py-3 rounded-lg bg-transparent border-2 border-white/30 hover:bg-white/10 hover:border-white/50 transition-all hover:-translate-y-0.5 flex items-center gap-2 text-sm md:text-base"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
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
              {articles.map(article => (
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
                      <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
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
                          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Favorited on {formatDateString(article.favoriteTime)}
                        </span>
                        <span className="flex items-center gap-2 text-xs text-gray-500">
                          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {formatReadCount(article.readCount)} reads
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => viewArticle(article.id)}
                          className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs md:text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        <button
                          onClick={() => confirmRemoveFavorite(article)}
                          className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs md:text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
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
              <p className="text-lg md:text-xl mb-2">No favorite articles yet</p>
              <p className="text-sm opacity-80">
                You haven't favorited any articles yet, go to the
                <button
                  onClick={goToKnowledge}
                  className="text-amber-500 hover:underline mx-1 font-medium"
                >
                  Knowledge Base
                </button>
                to bookmark interesting content!
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
                <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-800">Remove Favorite</h3>
            </div>
            
            <p className="text-sm md:text-base text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to remove article <span className="font-semibold text-gray-800">"{articleToRemove?.title}"</span> from favorites?
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

          </div>
  );
};

