import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900">
          Page Not Found
        </h2>
        <p className="mt-2 text-gray-600">
          Sorry, the page you are looking for could not be found.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="btn btn-primary"
          >
           Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound