import * as XLSX from 'xlsx'

/**
 * Excel export utility class
 * Features: Provides unified Excel export functionality with support for custom headers and data formatting
 */

/**
 * Export data to Excel file
 * @param {Array} data - Data array to export
 * @param {Array} columns - Column configuration array, format: [{key: 'field', title: 'Column Title', formatter?: (value) => formattedValue}]
 * @param {string} filename - Filename (without extension)
 * @param {string} sheetName - Worksheet name
 */
export function exportToExcel(data, columns, filename = 'Export Data', sheetName = 'Sheet1') {
  try {
    // Build headers
    const headers = columns.map(col => col.title)
    
    // Build data rows
    const rows = data.map(item => {
      return columns.map(col => {
        let value = item[col.key]
        // If custom formatter function exists, use it to process data
        if (col.formatter && typeof col.formatter === 'function') {
          value = col.formatter(value, item)
        }
        return value || ''
      })
    })
    
    // Merge headers and data
    const worksheetData = [headers, ...rows]
    
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    // Set column widths
    const colWidths = columns.map(col => ({
      wch: col.width || 15
    }))
    worksheet['!cols'] = colWidths
    
    // Create workbook
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // Export file
    const fileName = `${filename}_${formatDate(new Date(), 'YYYY-MM-DD_HH-mm-ss')}.xlsx`
    XLSX.writeFile(workbook, fileName)
    
    return {
      success: true,
      message: 'Export successful',
      filename: fileName
    }
  } catch (error) {
    console.error('Excel export failed:', error)
    return {
      success: false,
      message: 'Export failed: ' + error.message
    }
  }
}

/**
 * Export user data to Excel
 * @param {Array} userData - User data array
 * @param {string} filename - Filename
 */
export function exportUserData(userData, filename = 'User Data') {
  const columns = [
    { key: 'id', title: 'User ID', width: 10 },
    { key: 'username', title: 'Username', width: 15 },
    { key: 'nickname', title: 'Nickname', width: 15 },
    { key: 'email', title: 'Email', width: 25 },
    { key: 'phone', title: 'Phone', width: 15 },
    {
      key: 'gender',
      title: 'Gender',
      width: 8,
      formatter: (value) => {
        if (value === 1) return 'Male'
        if (value === 0) return 'Female'
        return 'Unknown'
      }
    },
    { key: 'birthday', title: 'Birthday', width: 12 },
    {
      key: 'userType',
      title: 'User Type',
      width: 12,
      formatter: (value) => {
        return value === 2 ? 'Admin' : 'User'
      }
    },
    {
      key: 'status',
      title: 'Status',
      width: 8,
      formatter: (value) => {
        return value === 1 ? 'Active' : 'Disabled'
      }
    },
    {
      key: 'createdAt',
      title: 'Registration Time',
      width: 20,
      formatter: (value) => {
        return formatDateTime(value)
      }
    },
    {
      key: 'updatedAt',
      title: 'Update Time',
      width: 20,
      formatter: (value) => {
        return formatDateTime(value)
      }
    }
  ]

  return exportToExcel(userData, columns, filename, 'User List')
}

/**
 * Simple date formatting function
 * @param {Date|string} date - Date object or date string
 * @param {string} format - Format string, supports YYYY-MM-DD_HH-mm-ss
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
 * Date and time formatting
 * @param {Date|string} date - Date
 */
function formatDateTime(date) {
  if (!date) return ''
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss')
}