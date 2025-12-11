import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

export default function FavoritesPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">My Favorites</h2>
        <p className="text-gray-500">Your saved articles and resources.</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-700">Favorite Items</h3>
          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
            0 items
          </span>
        </div>

        <div className="text-center py-12">
          <FontAwesomeIcon icon={faHeart} className="text-4xl text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg mb-2">No favorites yet</p>
          <p className="text-gray-400">Start saving your favorite knowledge articles and resources</p>
        </div>
      </div>
    </div>
  );
}