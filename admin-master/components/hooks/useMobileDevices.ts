import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface MobileDevice {
  id: string;
  device_id: string;
  device_name: string;
  device_type: string;
  os_version?: string;
  app_version?: string;
  assigned_staff_id?: string;
  last_sync_at?: string;
  sync_status: string;
  battery_level?: number;
  location_services_enabled: boolean;
  offline_mode_enabled: boolean;
  created_at: string;
  updated_at: string;
  staff?: {
    first_name: string;
    last_name: string;
    role: string;
  };
}

export interface CommunicationLog {
  id: string;
  booking_id?: string;
  staff_id?: string;
  communication_type: string;
  direction: string;
  recipient?: string;
  message?: string;
  status: string;
  sent_at?: string;
  delivered_at?: string;
  metadata: any;
  created_at: string;
}

export const useMobileDevices = () => {
  return useQuery({
    queryKey: ["mobile-devices"],
    queryFn: async (): Promise<MobileDevice[]> => {
      console.log("Fetching mobile devices");

      const { data, error } = await supabase
        .from("mobile_devices")
        .select(
          `
          *,
          staff:assigned_staff_id (first_name, last_name, role)
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching mobile devices:", error);
        throw error;
      }

      return (data || []) as MobileDevice[];
    },
  });
};

export const useCommunicationLogs = (bookingId?: string) => {
  return useQuery({
    queryKey: ["communication-logs", bookingId],
    queryFn: async (): Promise<CommunicationLog[]> => {
      console.log("Fetching communication logs for booking:", bookingId);

      let query = supabase
        .from("communication_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (bookingId) {
        query = query.eq("booking_id", bookingId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching communication logs:", error);
        throw error;
      }

      return (data || []) as CommunicationLog[];
    },
  });
};

export const useCreateMobileDevice = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      deviceData: Omit<
        MobileDevice,
        "id" | "created_at" | "updated_at" | "staff"
      >
    ) => {
      console.log("Creating mobile device:", deviceData);

      const { data, error } = await supabase
        .from("mobile_devices")
        .insert({
          device_id: deviceData.device_id,
          device_name: deviceData.device_name,
          device_type: deviceData.device_type,
          os_version: deviceData.os_version,
          app_version: deviceData.app_version,
          assigned_staff_id: deviceData.assigned_staff_id,
          sync_status: deviceData.sync_status,
          battery_level: deviceData.battery_level,
          location_services_enabled: deviceData.location_services_enabled,
          offline_mode_enabled: deviceData.offline_mode_enabled,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating mobile device:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobile-devices"] });
      toast({
        title: "Device Registered",
        description: "Mobile device has been successfully registered",
      });
    },
    onError: (error) => {
      console.error("Error creating mobile device:", error);
      toast({
        title: "Error",
        description: "Failed to register mobile device",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateMobileDevice = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<MobileDevice>;
    }) => {
      console.log("Updating mobile device:", id, updates);

      const { data, error } = await supabase
        .from("mobile_devices")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating mobile device:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobile-devices"] });
      toast({
        title: "Device Updated",
        description: "Mobile device has been successfully updated",
      });
    },
    onError: (error) => {
      console.error("Error updating mobile device:", error);
      toast({
        title: "Error",
        description: "Failed to update mobile device",
        variant: "destructive",
      });
    },
  });
};

export const useCreateCommunicationLog = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      logData: Omit<CommunicationLog, "id" | "created_at">
    ) => {
      console.log("Creating communication log:", logData);

      const { data, error } = await supabase
        .from("communication_logs")
        .insert(logData)
        .select()
        .single();

      if (error) {
        console.error("Error creating communication log:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communication-logs"] });
      toast({
        title: "Message Logged",
        description: "Communication has been successfully logged",
      });
    },
    onError: (error) => {
      console.error("Error creating communication log:", error);
      toast({
        title: "Error",
        description: "Failed to log communication",
        variant: "destructive",
      });
    },
  });
};

