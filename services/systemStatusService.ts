import { useState, useEffect } from 'react';
import { db, doc, onSnapshot } from '../firebase';
import type { ServiceStatus, SystemStatusData } from '../components/StatusView';

export interface SystemStatusNotice {
  show: boolean;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
}

export function useSystemStatus() {
  const [overall, setOverall] = useState<ServiceStatus>('Operational');
  const [notice, setNotice] = useState<SystemStatusNotice | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
            setNotice({
              show: true,
              title: data.customMessageTitle || '',
              message: data.customMessage || '',
              type: data.customMessageType || 'info'
            });
          } else {
            setNotice(null);
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

  return { overall, notice, isLoading };
}
