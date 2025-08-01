import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useItemTypes = () => {
  return useQuery({
    queryKey: ["item-types"],
    queryFn: async () => {
      console.log("Fetching item types...");
      const { data, error } = await supabase
        .from("item_types")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true });

      if (error) {
        console.error("Error fetching item types:", error);
        throw error;
      }

      console.log("Item types fetched:", data);
      return data;
    },
  });
};

export const useLoadSizeConfigs = () => {
  return useQuery({
    queryKey: ["load-size-configs"],
    queryFn: async () => {
      console.log("Fetching load size configs...");
      const { data, error } = await supabase
        .from("load_size_configs")
        .select("*")
        .eq("is_active", true)
        .order("max_volume_m3", { ascending: true });

      if (error) {
        console.error("Error fetching load size configs:", error);
        throw error;
      }

      console.log("Load size configs fetched:", data);
      return data;
    },
  });
};

export const useLondonZones = () => {
  return useQuery({
    queryKey: ["london-zones"],
    queryFn: async () => {
      console.log("Fetching London zones...");
      const { data, error } = await supabase
        .from("london_zones")
        .select("*")
        .eq("is_active", true)
        .order("zone_type", { ascending: true });

      if (error) {
        console.error("Error fetching London zones:", error);
        throw error;
      }

      console.log("London zones fetched:", data);
      return data;
    },
  });
};

