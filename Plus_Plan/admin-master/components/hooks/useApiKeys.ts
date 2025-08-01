import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface ApiKey {
  id: string;
  key_name: string;
  api_key: string;
  permissions: string[];
  is_active: boolean;
  last_used_at?: string;
  expires_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiUsageLog {
  id: string;
  api_key_id: string;
  endpoint: string;
  method: string;
  status_code?: number;
  response_time_ms?: number;
  request_data?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export const useApiKeys = () => {
  return useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      console.log("Fetching API keys...");

      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ApiKey[];
    },
  });
};

export const useCreateApiKey = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      key_name: string;
      permissions: string[];
      expires_at?: string;
    }) => {
      console.log("Creating API key:", data);

      const apiKey = `api_${crypto.randomUUID().replace(/-/g, "")}`;

      const { data: newKey, error } = await supabase
        .from("api_keys")
        .insert({
          key_name: data.key_name,
          api_key: apiKey,
          permissions: data.permissions,
          expires_at: data.expires_at,
        })
        .select()
        .single();

      if (error) throw error;
      return newKey;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast({
        title: "API Key Created",
        description: "New API key has been created successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating API key:", error);
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateApiKey = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<ApiKey>;
    }) => {
      console.log("Updating API key:", { id, updates });

      const { data, error } = await supabase
        .from("api_keys")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast({
        title: "API Key Updated",
        description: "API key has been updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating API key:", error);
      toast({
        title: "Error",
        description: "Failed to update API key",
        variant: "destructive",
      });
    },
  });
};

export const useApiUsageLogs = (apiKeyId?: string) => {
  return useQuery({
    queryKey: ["api-usage-logs", apiKeyId],
    queryFn: async () => {
      console.log("Fetching API usage logs for key:", apiKeyId);

      let query = supabase
        .from("api_usage_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (apiKeyId) {
        query = query.eq("api_key_id", apiKeyId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ApiUsageLog[];
    },
  });
};

