import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Customer } from "@/types/customer";

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Customer>;
    }) => {
      console.log("Updating customer:", { id, updates });

      const { data, error } = await supabase
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating customer:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer-stats"] });
      toast({
        title: "Customer Updated",
        description: "Customer information has been updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error in customer update mutation:", error);
      toast({
        title: "Error",
        description: "Failed to update customer information",
        variant: "destructive",
      });
    },
  });
};

