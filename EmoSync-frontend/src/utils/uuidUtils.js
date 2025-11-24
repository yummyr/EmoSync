/**
 * @description UUID工具函数模块
 * @author system
 */

/**
 * @description 生成UUID工具函数
 * @returns {string} 生成的UUID字符串
 */
export function generateUUID() {
  // 使用crypto.randomUUID()（现代浏览器支持）
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // 降级方案：使用Math.random()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * @description 验证UUID格式是否正确
 * @param {string} uuid - 待验证的UUID字符串
 * @returns {boolean} 是否为有效的UUID格式
 */
export function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * @description 生成短UUID（去除连字符）
 * @returns {string} 生成的短UUID字符串
 */
export function generateShortUUID() {
  return generateUUID().replace(/-/g, '');
}

/**
 * @description 格式化UUID（添加连字符）
 * @param {string} shortUuid - 不带连字符的UUID
 * @returns {string} 格式化后的UUID
 */
export function formatUUID(shortUuid) {
  if (!shortUuid || shortUuid.length !== 32) {
    return shortUuid;
  }
  
  return [
    shortUuid.slice(0, 8),
    shortUuid.slice(8, 12),
    shortUuid.slice(12, 16),
    shortUuid.slice(16, 20),
    shortUuid.slice(20, 32)
  ].join('-');
}



