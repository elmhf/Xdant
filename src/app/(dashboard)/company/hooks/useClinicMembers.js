import { useState, useEffect, useMemo } from 'react';
import useUserStore from '../../../component/profile/store/userStore';

export const useClinicMembers = () => {
  const [clinicMembers, setClinicMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get current clinic from userStore
  const currentClinic = useUserStore(state => state.getCurrentClinic());
  const currentClinicId = useUserStore(state => state.currentClinicId);

  // Fetch clinic members
  const fetchMembers = async () => {
    if (!currentClinic?.id) {
      setClinicMembers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const clinics = await useUserStore.getState().fetchMyClinics();
      
      
      const result = await useUserStore.getState().fetchClinicMembers(currentClinic.id);
      
      if (result.success) {
        
        
        // Transform server data to match our table format
        const transformedMembers = result.members.map(member => ({
          id: member.id,
          user_id: member.user_id,
          first_name: member.user?.firstName || '',
          last_name: member.user?.lastName || '',
          name: `${member.user?.firstName || ''} ${member.user?.lastName || ''}`.trim(),
          email: member.user?.email || '',
          role: member.role || 'Unknown',
          status: member.status || 'Active',
          joinDate: member.joinedAt ? new Date(member.joinedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          profilePhotoUrl: member.user?.profilePhotoUrl,
          invitedBy: member.invitedBy,
          createdAt: member.createdAt
        }));
        
        setClinicMembers(transformedMembers);
      } else {
        console.error('Failed to fetch clinic members:', result.message);
        setError(result.message);
        setClinicMembers([]);
      }
    } catch (error) {
      console.error('Error fetching clinic members:', error);
      setError('Erreur lors du chargement des membres');
      setClinicMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // Refetch when clinic changes
  useEffect(() => {
    fetchMembers();
  }, [currentClinicId]);

  return {
    clinicMembers,
    loading,
    error,
    refetch: fetchMembers,
    currentClinic
  };
}; 