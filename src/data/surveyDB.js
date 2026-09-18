import { JOBS, ITEM_DB } from '../game/index.js';
export const ARCHETYPES = Object.values(JOBS).map(job => ({ id: job.key, title: job.title, quote: job.desc, stats: job.baseStats, portraits: { M: job.imgM, F: job.imgF }, items: job.startItems.map(id => ITEM_DB[id]) }));
