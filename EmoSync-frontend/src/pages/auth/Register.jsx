import React from 'react'

const Register = () => {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Register an Account
        </h2>
        <p className="mt-2 text-gray-600">
          Already have an account？
          <a href="/auth/login" className="text-primary-600 hover:text-primary-500 font-medium">
            Login
          </a>
        </p>
      </div>

      <form className="space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            className="input"
            placeholder="Input your username"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="input"
            placeholder="Input your email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password" 
            className="input"
            placeholder="Input your password"
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            id="confirm-password"
            name="confirm-password"
            type="password"
            required
            className="input"
            placeholder="Input your password again"
          />
        </div>

        <div>
          <button type="submit" className="w-full btn btn-primary">
            Submit
          </button>
        </div>
      </form>
    </div>
  )
}

export default Register