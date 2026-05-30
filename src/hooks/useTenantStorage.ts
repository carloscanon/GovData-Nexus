// src/hooks/useTenantStorage.ts
import { supabase } from '@/lib/supabase';
import { usePlatform } from '@/contexts/PlatformContext';

/**
 * Simple wrapper that mimics the localStorage API but stores data in Supabase
 * in the `tenant_config` table (tenant_id, config_key, config_value).
 * Includes a localStorage fallback if the Supabase table doesn't exist yet.
 */
export function useTenantStorage() {
  const { currentTenant } = usePlatform();
  const tenantId = currentTenant?.id ?? '';

  const getItem = async (key: string): Promise<any | null> => {
    if (!tenantId) return null;
    try {
      const { data, error } = await supabase
        .from('tenant_config')
        .select('config_value')
        .eq('tenant_id', tenantId)
        .eq('config_key', key)
        .single();
        
      if (error) {
        // PGRST205: Table not found, PGRST116: No rows found, 22P02: Invalid UUID
        // Always fallback to local storage on any error
        const local = localStorage.getItem(`govdata_${tenantId}_${key}`);
        return local ? JSON.parse(local) : null;
      }
      return data?.config_value ?? null;
    } catch (e) {
      const local = localStorage.getItem(`govdata_${tenantId}_${key}`);
      return local ? JSON.parse(local) : null;
    }
  };

  const setItem = async (key: string, value: any): Promise<void> => {
    if (!tenantId) return;
    
    // Always save to localStorage as fallback
    localStorage.setItem(`govdata_${tenantId}_${key}`, JSON.stringify(value));

    try {
      const { error } = await supabase
        .from('tenant_config')
        .upsert({ tenant_id: tenantId, config_key: key, config_value: value }, {
          onConflict: 'tenant_id, config_key',
        });
      if (error && error.code !== 'PGRST205') {
        console.error('tenant_config setItem error', key, error);
      }
    } catch (e) {
      // ignore
    }
  };

  return { getItem, setItem };
}
