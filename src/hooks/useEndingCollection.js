import { useEffect, useSyncExternalStore } from 'react';
import { ENDING_STORAGE_KEY, parseEndingCollection } from '../utils/endingCollection.js';
import { ENDING_DEFINITIONS } from '../data/endingDB.js';

const eventName = 'subway-ending-collected';
const read = () => { try { return localStorage.getItem(ENDING_STORAGE_KEY) ?? '[]'; } catch { return '[]'; } };
let session = '[]';
const snapshot = () => {
  const ids = [...new Set([...parseEndingCollection(read()), ...parseEndingCollection(session)])];
  return JSON.stringify(ids);
};
const subscribe = (callback) => {
  window.addEventListener('storage', callback);
  window.addEventListener(eventName, callback);
  return () => { window.removeEventListener('storage', callback); window.removeEventListener(eventName, callback); };
};
const saveCollection = (ids) => {
  const updated = JSON.stringify(ids);
  session = updated;
  try { localStorage.setItem(ENDING_STORAGE_KEY, updated); } catch { /* Session collection remains available. */ }
  window.dispatchEvent(new Event(eventName));
};
const unlockAllEndings = () => {
  if (import.meta.env.DEV) saveCollection(Object.keys(ENDING_DEFINITIONS));
};
export function useEndingCollection(endingData) {
  const raw = useSyncExternalStore(subscribe, snapshot, () => '[]');
  useEffect(() => {
    if (!endingData?.id) return;
    const ids = parseEndingCollection(snapshot());
    if (ids.includes(endingData.id)) return;
    saveCollection([...ids, endingData.id]);
  }, [endingData]);
  return { collected: parseEndingCollection(raw), unlockAllEndings };
}
