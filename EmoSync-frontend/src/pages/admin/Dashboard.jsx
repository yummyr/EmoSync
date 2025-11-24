import React from 'react'

const Dashboard = () => {
  return (
    <div>
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900">数据分析</h3>
        <p className="text-gray-600 mt-2">查看平台运营数据和分析报告</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总用户数</p>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600">💬</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">今日咨询</p>
                <p className="text-2xl font-bold text-gray-900">56</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">今日日记</p>
                <p className="text-2xl font-bold text-gray-900">89</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600">📚</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">知识文章</p>
                <p className="text-2xl font-bold text-gray-900">456</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="card-header">
            <h4 className="text-lg font-medium text-gray-900">用户增长趋势</h4>
          </div>
          <div className="card-body">
            <div className="h-64 flex items-center justify-center text-gray-500">
              图表组件待实现
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h4 className="text-lg font-medium text-gray-900">访问统计</h4>
          </div>
          <div className="card-body">
            <div className="h-64 flex items-center justify-center text-gray-500">
              图表组件待实现
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard