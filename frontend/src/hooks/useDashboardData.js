import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

export default function useDashboardData(isAdmin) {
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const requests = [
        api.get('/incidents'),
        api.get('/incidents/stats')
      ];
      if (isAdmin) requests.push(api.get('/auth/users'), api.get('/groups'));

      const [incidentResult, statsResult, usersResult, groupsResult] = await Promise.all(requests);
      setIncidents(incidentResult.data.incidents || []);
      setStats(statsResult.data || null);
      setUsers(usersResult?.data?.users || []);
      setGroups(groupsResult?.data?.groups || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load incidents right now.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = useCallback(async (id, status) => {
    await api.patch('/incidents/' + id, { status });
    await load();
  }, [load]);

  return {
    error,
    groups,
    incidents,
    loading,
    reload: load,
    stats,
    updateStatus,
    users
  };
}
