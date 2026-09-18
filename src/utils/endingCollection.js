import { ENDING_DEFINITIONS } from '../data/endingDB.js';

export const ENDING_STORAGE_KEY = 'subway_0037_endings';
export function parseEndingCollection(raw) {
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? [...new Set(value.filter((id) => typeof id === 'string' && Object.hasOwn(ENDING_DEFINITIONS, id)))] : [];
  } catch { return []; }
}
