import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faSearch } from "@fortawesome/free-solid-svg-icons";

export default function KnowledgeArticlePage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Knowledge Articles</h2>
        <p className="text-gray-500">Explore articles about emotional wellness and mental health.</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-6 shadow mb-6">
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search knowledge articles..."
            className="flex-1 border-none outline-none text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faBook} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Understanding Emotions</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Learn about the science behind human emotions and how they affect our daily lives.
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>5 min read</span>
              <span>Mental Health</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}