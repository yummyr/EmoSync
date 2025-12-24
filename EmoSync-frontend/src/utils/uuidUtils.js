/**
 * @description UUID utility function module
 * @author system
 */

/**
 * @description Generate UUID utility function
 * @returns {string} Generated UUID string
 */
export function generateUUID() {
  // Use crypto.randomUUID() (modern browser support)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback: Use Math.random()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * @description Verify if UUID format is correct
 * @param {string} uuid - UUID string to verify
 * @returns {boolean} Whether it's a valid UUID format
 */
export function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * @description Generate short UUID (remove hyphens)
 * @returns {string} Generated short UUID string
 */
export function generateShortUUID() {
  return generateUUID().replace(/-/g, '');
}

/**
 * @description Format UUID (add hyphens)
 * @param {string} shortUuid - UUID without hyphens
 * @returns {string} Formatted UUID
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



