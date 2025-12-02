import React from 'react'
import { Outlet } from 'react-router-dom'
import "./HomeLayout.css"

const HomeLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
  
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary-400">
                EmoSync - Your AI companion for every emotion.
              </h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-900 hover:text-primary-400 px-3 py-2 text-sm font-medium">
                Home
              </a>
              <a href="/knowledge" className="text-gray-500 hover:text-primary-400 px-3 py-2 text-sm font-medium">
                Knowledge
              </a>
            
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
            
                <div className="flex space-x-4">
                  <a href="/auth/login" className="text-gray-500 hover:text-primary-400 px-3 py-2 text-sm font-medium">
                    Login
                  </a>
                  <a href="/auth/register" className="btn btn-primary bg-blue-500">
                    Register
                  </a>
                </div>
             
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            © 2025 Mental Health Assistant. All rights reserved. 
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomeLayout