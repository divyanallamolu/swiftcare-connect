import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Hospital, Emergency } from '@/types/hospital';
import { useEffect } from 'react';

export function useHospitals() {
  const queryClient = useQueryClient();

  const { data: hospitals, isLoading, error } = useQuery({
    queryKey: ['hospitals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Hospital[];
    },
  });

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('hospitals-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hospitals' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['hospitals'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { hospitals: hospitals || [], isLoading, error };
}

export function useHospital(id: string) {
  return useQuery({
    queryKey: ['hospital', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Hospital | null;
    },
    enabled: !!id,
  });
}

export function useUpdateHospitalQueue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      hospitalId, 
      emergencyQueue, 
      generalQueue 
    }: { 
      hospitalId: string; 
      emergencyQueue?: number; 
      generalQueue?: number;
    }) => {
      const updates: Partial<Hospital> = {
        last_queue_update: new Date().toISOString(),
      };
      
      if (emergencyQueue !== undefined) updates.emergency_queue = emergencyQueue;
      if (generalQueue !== undefined) updates.general_queue = generalQueue;

      const { data, error } = await supabase
        .from('hospitals')
        .update(updates)
        .eq('id', hospitalId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
    },
  });
}

export function useEmergencies(hospitalId?: string) {
  const queryClient = useQueryClient();

  const { data: emergencies, isLoading, error } = useQuery({
    queryKey: ['emergencies', hospitalId],
    queryFn: async () => {
      let query = supabase
        .from('emergencies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (hospitalId) {
        query = query.eq('hospital_id', hospitalId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Emergency[];
    },
  });

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('emergencies-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'emergencies' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['emergencies'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { emergencies: emergencies || [], isLoading, error };
}

export function useCreateEmergency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (emergency: Omit<Emergency, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('emergencies')
        .insert(emergency)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencies'] });
    },
  });
}

export function useUpdateEmergency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Emergency['status'] }) => {
      const { data, error } = await supabase
        .from('emergencies')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencies'] });
    },
  });
}
