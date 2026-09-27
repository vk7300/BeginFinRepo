import { useState, useEffect, useCallback } from 'react';
import { db, doc, onSnapshot } from '../firebase';
import type { ServiceStatus, SystemStatusData } from '../components/StatusView';

export interface SystemStatusNotice {
  show: boolean;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
}

const DISMISS_STORAGE_KEY = 'beginfin_status_notice_dismissed';

let activeNoticeKey: string | null = null;
const statusListeners = new Set<() => void>();

function getDismissedKey(): string | null {
  try {
    return sessionStorage.getItem(DISMISS_STORAGE_KEY) || localStorage.getItem(DISMISS_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function dismissCurrentStatusNotice() {
  const key = activeNoticeKey || 'dismissed';
  try {
    sessionStorage.setItem(DISMISS_STORAGE_KEY, key);
    localStorage.setItem(DISMISS_STORAGE_KEY, key);
  } catch {}
  statusListeners.forEach((fn) => fn());
}

export function useSystemStatus() {
  const [overall, setOverall] = useState<ServiceStatus>('Operational');
  const [rawNotice, setRawNotice] = useState<SystemStatusNotice | null>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    const dismissedKey = getDismissedKey();
    return Boolean(dismissedKey);
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync dismissal state across all components and tabs
  useEffect(() => {
    const handleDismissUpdate = () => {
      setIsDismissed(true);
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === DISMISS_STORAGE_KEY) {
        setIsDismissed(true);
      }
    };

    statusListeners.add(handleDismissUpdate);
    window.addEventListener('storage', handleStorage);
    return () => {
      statusListeners.delete(handleDismissUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const statusDocRef = doc(db, 'system', 'status');

    const unsubscribe = onSnapshot(
      statusDocRef,
      (docSnap) => {
        if (!isMounted) return;
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<SystemStatusData>;

          const servicesList = data.services ? Object.values(data.services) : [];
          const allStatuses: ServiceStatus[] = [
            ...servicesList.map((s) => s.status),
            ...(data.customCategory?.enabled ? [data.customCategory.status] : [])
          ];

          let calculatedOverall: ServiceStatus = 'Operational';
          if (allStatuses.includes('Not Operational')) {
            calculatedOverall = 'Not Operational';
          } else if (allStatuses.includes('Issues Observed')) {
            calculatedOverall = 'Issues Observed';
          } else if (data.overall) {
            calculatedOverall = data.overall;
          }

          setOverall(calculatedOverall);

          if (data.showCustomMessage && (data.customMessageTitle || data.customMessage)) {
            const key = `${data.customMessageTitle || ''}:${data.customMessage || ''}`;
            activeNoticeKey = key;
            const dismissed = getDismissedKey() === key;
            setIsDismissed(dismissed);

            setRawNotice({
              show: true,
              title: data.customMessageTitle || '',
              message: data.customMessage || '',
              type: data.customMessageType || 'info'
            });
          } else {
            activeNoticeKey = null;
            setIsDismissed(false);
            setRawNotice(null);
          }
        }
        setIsLoading(false);
      },
      (err) => {
        if (!isMounted) return;
        console.warn('Could not listen to system status doc in Firestore, falling back to /api/status:', err);
        fetch('/api/status')
          .then((res) => res.json())
          .then((json) => {
            if (!isMounted) return;
            if (json?.status) {
              setOverall(json.status === 'Operational' ? 'Operational' : (json.status === 'Issues Observed' ? 'Issues Observed' : 'Not Operational'));
            }
          })
          .catch(() => {})
          .finally(() => {
            if (isMounted) setIsLoading(false);
          });
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const dismissNotice = useCallback(() => {
    dismissCurrentStatusNotice();
    setIsDismissed(true);
  }, []);

  const notice = (!isDismissed && rawNotice) ? rawNotice : null;

  return { overall, notice, rawNotice, isDismissed, dismissNotice, isLoading };
}
