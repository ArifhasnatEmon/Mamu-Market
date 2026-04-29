import { safeGet, safeSet } from './storage';

export const pushNotif = (userId: string, title: string, message: string): void => {
  const key = `mamu_notifs_${userId}`;
  const notifs = safeGet(key, []);
  notifs.unshift({
    id: 'n_' + Date.now(),
    title,
    message,
    read: false,
    createdAt: new Date().toISOString()
  });
  safeSet(key, notifs.slice(0, 50)); // last 50 রাখো
};
