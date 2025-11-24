import * as XLSX from 'xlsx'

/**
 * Excel导出工具类
 * 功能：提供统一的Excel导出功能，支持自定义表头和数据格式化
 */

/**
 * 导出数据到Excel文件
 * @param {Array} data - 要导出的数据数组
 * @param {Array} columns - 列配置数组，格式：[{key: 'field', title: '列标题', formatter?: (value) => formattedValue}]
 * @param {string} filename - 文件名（不含扩展名）
 * @param {string} sheetName - 工作表名称
 */
export function exportToExcel(data, columns, filename = '导出数据', sheetName = 'Sheet1') {
  try {
    // 构建表头
    const headers = columns.map(col => col.title)
    
    // 构建数据行
    const rows = data.map(item => {
      return columns.map(col => {
        let value = item[col.key]
        // 如果有自定义格式化函数，使用格式化函数处理数据
        if (col.formatter && typeof col.formatter === 'function') {
          value = col.formatter(value, item)
        }
        return value || ''
      })
    })
    
    // 合并表头和数据
    const worksheetData = [headers, ...rows]
    
    // 创建工作表
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    
    // 设置列宽
    const colWidths = columns.map(col => ({
      wch: col.width || 15
    }))
    worksheet['!cols'] = colWidths
    
    // 创建工作簿
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
    
    // 导出文件
    const fileName = `${filename}_${formatDate(new Date(), 'YYYY-MM-DD_HH-mm-ss')}.xlsx`
    XLSX.writeFile(workbook, fileName)
    
    return {
      success: true,
      message: '导出成功',
      filename: fileName
    }
  } catch (error) {
    console.error('Excel导出失败:', error)
    return {
      success: false,
      message: '导出失败：' + error.message
    }
  }
}

/**
 * 导出用户数据到Excel
 * @param {Array} userData - 用户数据数组
 * @param {string} filename - 文件名
 */
export function exportUserData(userData, filename = '用户数据') {
  const columns = [
    { key: 'id', title: '用户ID', width: 10 },
    { key: 'username', title: '用户名', width: 15 },
    { key: 'nickname', title: '昵称', width: 15 },
    { key: 'email', title: '邮箱', width: 25 },
    { key: 'phone', title: '手机号', width: 15 },
    { 
      key: 'gender', 
      title: '性别', 
      width: 8,
      formatter: (value) => {
        if (value === 1) return '男'
        if (value === 0) return '女'
        return '未知'
      }
    },
    { key: 'birthday', title: '生日', width: 12 },
    { 
      key: 'userType', 
      title: '用户类型', 
      width: 12,
      formatter: (value) => {
        return value === 2 ? '管理员' : '普通用户'
      }
    },
    { 
      key: 'status', 
      title: '状态', 
      width: 8,
      formatter: (value) => {
        return value === 1 ? '正常' : '禁用'
      }
    },
    { 
      key: 'createdAt', 
      title: '注册时间', 
      width: 20,
      formatter: (value) => {
        return formatDateTime(value)
      }
    },
    { 
      key: 'updatedAt', 
      title: '更新时间', 
      width: 20,
      formatter: (value) => {
        return formatDateTime(value)
      }
    }
  ]
  
  return exportToExcel(userData, columns, filename, '用户列表')
}

/**
 * 简单的日期格式化函数
 * @param {Date|string} date - 日期对象或日期字符串
 * @param {string} format - 格式字符串，支持 YYYY-MM-DD_HH-mm-ss
 */
function formatDate(date, format = 'YYYY-MM-DD') {
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 日期时间格式化
 * @param {Date|string} date - 日期
 */
function formatDateTime(date) {
  if (!date) return ''
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss')
}