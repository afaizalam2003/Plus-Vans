import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface StaffRota {
  id: string;
  staff_id: string;
  week_start_date: string;
  shift_data: {
    monday?: { start: string; end: string; break_minutes?: number };
    tuesday?: { start: string; end: string; break_minutes?: number };
    wednesday?: { start: string; end: string; break_minutes?: number };
    thursday?: { start: string; end: string; break_minutes?: number };
    friday?: { start: string; end: string; break_minutes?: number };
    saturday?: { start: string; end: string; break_minutes?: number };
    sunday?: { start: string; end: string; break_minutes?: number };
  };
  total_hours: number;
  overtime_hours: number;
  status: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  staff?: {
    first_name: string;
    last_name: string;
    role: string;
  };
}

export interface StaffAbsence {
  id: string;
  staff_id: string;
  absence_type: string;
  start_date: string;
  end_date: string;
  status: string;
  reason?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  staff?: {
    first_name: string;
    last_name: string;
  };
}

export interface StaffCertification {
  id: string;
  staff_id: string;
  certification_name: string;
  certification_type: string;
  issued_date: string;
  expiry_date?: string;
  issuing_authority?: string;
  certificate_number?: string;
  status: string;
  document_url?: string;
  created_at: string;
  updated_at: string;
  staff?: {
    first_name: string;
    last_name: string;
  };
}

export interface RotaTemplate {
  id: string;
  template_name: string;
  template_type: string;
  shift_pattern: any;
  applicable_roles: string[];
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useStaffRotas = (weekStartDate?: string) => {
  return useQuery({
    queryKey: ["staff-rotas", weekStartDate],
    queryFn: async (): Promise<StaffRota[]> => {
      console.log("Fetching staff rotas for week:", weekStartDate);

      let query = supabase
        .from("staff_rotas")
        .select(
          `
          *,
          staff (first_name, last_name, role)
        `
        )
        .order("created_at", { ascending: false });

      if (weekStartDate) {
        query = query.eq("week_start_date", weekStartDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching staff rotas:", error);
        throw error;
      }

      return (data || []) as StaffRota[];
    },
  });
};

export const useStaffAbsences = () => {
  return useQuery({
    queryKey: ["staff-absences"],
    queryFn: async (): Promise<StaffAbsence[]> => {
      console.log("Fetching staff absences");

      const { data, error } = await supabase
        .from("staff_absences")
        .select(
          `
          *,
          staff (first_name, last_name)
        `
        )
        .order("start_date", { ascending: false });

      if (error) {
        console.error("Error fetching staff absences:", error);
        throw error;
      }

      return (data || []) as StaffAbsence[];
    },
  });
};

export const useStaffCertifications = () => {
  return useQuery({
    queryKey: ["staff-certifications"],
    queryFn: async (): Promise<StaffCertification[]> => {
      console.log("Fetching staff certifications");

      const { data, error } = await supabase
        .from("staff_certifications")
        .select(
          `
          *,
          staff (first_name, last_name)
        `
        )
        .order("expiry_date", { ascending: true });

      if (error) {
        console.error("Error fetching staff certifications:", error);
        throw error;
      }

      return (data || []) as StaffCertification[];
    },
  });
};

export const useRotaTemplates = () => {
  return useQuery({
    queryKey: ["rota-templates"],
    queryFn: async (): Promise<RotaTemplate[]> => {
      console.log("Fetching rota templates");

      const { data, error } = await supabase
        .from("rota_templates")
        .select("*")
        .eq("is_active", true)
        .order("template_name");

      if (error) {
        console.error("Error fetching rota templates:", error);
        throw error;
      }

      return (data || []) as RotaTemplate[];
    },
  });
};

export const useCreateStaffRota = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      rotaData: Omit<StaffRota, "id" | "created_at" | "updated_at">
    ) => {
      console.log("Creating staff rota:", rotaData);

      const { data, error } = await supabase
        .from("staff_rotas")
        .insert(rotaData)
        .select()
        .single();

      if (error) {
        console.error("Error creating staff rota:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-rotas"] });
      toast({
        title: "Rota Created",
        description: "Staff rota has been successfully created",
      });
    },
    onError: (error) => {
      console.error("Error creating staff rota:", error);
      toast({
        title: "Error",
        description: "Failed to create staff rota",
        variant: "destructive",
      });
    },
  });
};

export const useCreateStaffAbsence = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      absenceData: Omit<StaffAbsence, "id" | "created_at" | "updated_at">
    ) => {
      console.log("Creating staff absence:", absenceData);

      const { data, error } = await supabase
        .from("staff_absences")
        .insert(absenceData)
        .select()
        .single();

      if (error) {
        console.error("Error creating staff absence:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-absences"] });
      toast({
        title: "Absence Recorded",
        description: "Staff absence has been successfully recorded",
      });
    },
    onError: (error) => {
      console.error("Error creating staff absence:", error);
      toast({
        title: "Error",
        description: "Failed to record staff absence",
        variant: "destructive",
      });
    },
  });
};

