import React, { useState, useEffect } from 'react';
import api from '@/api';
import { formatDate } from '@/utils/date';
import error_default_img from '@/assets/images/error_default_img.png';

const ArticleDetailPage = ({ selectedArticle, onClose }) => {

  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState([]);

const [article, setArticle] = useState(null);
useEffect(() => {
  if (selectedArticle) {
    setArticle(selectedArticle);
    setIsFavorited(selectedArticle.isFavorited);
    setLoading(false);
  }
}, [selectedArticle]); 
  
  const formatReadCount = (count) => {
    if (!count) return '0';
    if (count < 1000) return count.toString();
    if (count < 10000) return (count / 1000).toFixed(1) + 'k';
    return (count / 10000).toFixed(1) + 'w';
  };

  const handleImageError = (e) => {
    e.target.src = error_default_img;
  };

  const handleToggleFavorite = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      if (window.confirm("You need to login to favorite articles. Go to login page?")) {
        alert("Redirecting to login page");
      }
      return;
    }

    try {
      const newIsFavorited = !isFavorited;
      if (newIsFavorited) {
        await api.post(`/knowledge/favorite/${article.id}`);
      } else {
        await api.delete(`/knowledge/favorite/${article.id}`);
      }
      setIsFavorited(newIsFavorited);
      alert(newIsFavorited ? "Added to favorites" : "Removed from favorites");
    } catch (error) {
      console.error("Favorite operation failed:", error);
      alert("Operation failed");
    }
  };

  const goToRelatedArticle = (relatedArticleId) => {
    // Can open new article detail page or replace current article
    window.open(`/article/${relatedArticleId}`, '_blank');
  };



  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Article Not Found</h3>
          <p className="text-gray-600 mb-6">Sorry, this article could not be found</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white shadow-md z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back to List</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleFavorite}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isFavorited
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill={isFavorited ? 'currentColor' : 'none'}
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
                <span className="font-medium">{isFavorited ? 'Favorited' : 'Favorite'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Article */}
          <article className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Cover Image */}
              {article.coverImage && (
                <div className="w-full h-64 sm:h-96 overflow-hidden">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    onError={handleImageError}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Article Header */}
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                    {article.categoryName}
                  </span>
                  {article.tagArray && article.tagArray.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                  {article.title}
                </h1>

                {article.summary && (
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {article.summary}
                  </p>
                )}

                {/* Article Meta */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{article.authorName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{formatReadCount(article.readCount)} reads</span>
                  </div>
                </div>

                {/* Article Content */}
                <div
                  className="prose prose-lg max-w-none mt-8 [&>h2]:text-[1.75rem] [&>h2]:font-bold [&>h2]:text-gray-800 [&>h2]:mt-8 [&>h2]:mb-4 [&>h3]:text-[1.5rem] [&>h3]:font-semibold [&>h3]:text-gray-700 [&>h3]:mt-6 [&>h3]:mb-3 [&>p]:text-gray-600 [&>p]:leading-7 [&>p]:mb-4 [&>ul]:ml-6 [&>ul]:mb-4 [&>ol]:ml-6 [&>ol]:mb-4 [&>li]:text-gray-600 [&>li]:leading-7 [&>li]:mb-2 [&>ul_li]:list-disc [&>ol_li]:list-decimal [&>strong]:font-semibold [&>strong]:text-gray-800 [&>a]:text-amber-500 [&>a]:underline [&>a:hover]:text-amber-600"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Author Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 ">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                  {article.authorName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{article.authorName}</h3>
                  <p className="text-sm text-gray-500">Author</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Specializing in mental health research and practice, committed to providing the public with scientific and practical mental health knowledge.
              </p>
            </div>

            {/* Related Articles */}
          
             <div className="bg-gradient-to-br from-amber-100 via-white to-amber-300 bg-clip-border rounded-2xl shadow-lg p-6 border border-amber-100">
               <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📚</span>
                  Related Articles
                </h3>
              {relatedArticles.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-6">
               
                <div className="space-y-4">
                  {relatedArticles.map((related) => (
                    <div
                      key={related.id}
                      onClick={() => goToRelatedArticle(related.id)}
                      className="border-l-4 border-amber-500 pl-4 cursor-pointer hover:translate-x-1 transition-transform"
                    >
                      <h4 className="font-medium text-gray-800 text-sm mb-1 line-clamp-2 hover:text-amber-600 transition-colors">
                        {related.title}
                      </h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {formatReadCount(related.readCount)} reads
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ): (
              <p className="text-sm text-gray-600">No related articles found.</p>
            )}
            </div>

            {/* Tips Card */}
            <div className="bg-gradient-to-br from-amber-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-amber-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>💡</span>
                Friendly Reminder
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                If you have any questions during reading or need professional psychological counseling, please feel free to contact our professional team.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPage;