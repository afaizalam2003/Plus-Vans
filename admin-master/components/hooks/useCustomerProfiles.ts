import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useCustomerProfiles = () => {
  return useQuery({
    queryKey: ["customer-profiles"],
    queryFn: async () => {
      console.log("Fetching customer profiles...");
      const { data, error } = await supabase
        .from("customer_pricing_profiles")
        .select(
          `
          *,
          pricing_templates(template_name, template_type)
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching customer profiles:", error);
        throw error;
      }

      console.log("Customer profiles fetched:", data);
      return data;
    },
  });
};

export const useMembershipTiers = () => {
  return useQuery({
    queryKey: ["membership-tiers"],
    queryFn: async () => {
      console.log("Fetching membership tiers...");
      const { data, error } = await supabase
        .from("membership_tiers")
        .select("*")
        .eq("is_active", true)
        .order("tier_level", { ascending: true });

      if (error) {
        console.error("Error fetching membership tiers:", error);
        throw error;
      }

      console.log("Membership tiers fetched:", data);
      return data;
    },
  });
};

export const useCustomerSubscriptions = () => {
  return useQuery({
    queryKey: ["customer-subscriptions"],
    queryFn: async () => {
      console.log("Fetching customer subscriptions...");
      const { data, error } = await supabase
        .from("customer_subscriptions")
        .select(
          `
          *,
          membership_tiers(tier_name, tier_level, monthly_fee, annual_fee)
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching customer subscriptions:", error);
        throw error;
      }

      console.log("Customer subscriptions fetched:", data);
      return data;
    },
  });
};

export const useTradePricingTemplates = () => {
  return useQuery({
    queryKey: ["trade-pricing-templates"],
    queryFn: async () => {
      console.log("Fetching trade pricing templates...");
      const { data, error } = await supabase
        .from("trade_pricing_templates")
        .select("*")
        .eq("is_active", true)
        .order("template_name", { ascending: true });

      if (error) {
        console.error("Error fetching trade pricing templates:", error);
        throw error;
      }

      console.log("Trade pricing templates fetched:", data);
      return data;
    },
  });
};

export const useCreateCustomerProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (profileData: any) => {
      console.log("Creating customer profile:", profileData);

      const { data, error } = await supabase
        .from("customer_pricing_profiles")
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error("Error creating customer profile:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-profiles"] });
      toast({
        title: "Customer profile created",
        description: "Customer pricing profile has been created successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating customer profile:", error);
      toast({
        title: "Error",
        description: "Failed to create customer profile",
        variant: "destructive",
      });
    },
  });
};

export const useCalculateCustomerPrice = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      items_data,
      pickup_postcode,
      customer_email = null,
      access_difficulty = "normal",
      collection_datetime = null,
    }: {
      items_data: any[];
      pickup_postcode: string;
      customer_email?: string | null;
      access_difficulty?: string;
      collection_datetime?: string | null;
    }) => {
      console.log("Calculating customer price with profile:", {
        items_data,
        pickup_postcode,
        customer_email,
        access_difficulty,
        collection_datetime,
      });

      const { data, error } = await supabase.rpc(
        "calculate_customer_profile_price",
        {
          items_data: items_data,
          pickup_postcode: pickup_postcode,
          customer_email: customer_email,
          access_difficulty: access_difficulty,
          collection_datetime: collection_datetime,
        }
      );

      if (error) {
        console.error("Error calculating customer price:", error);
        throw error;
      }

      console.log("Customer price calculation result:", data);
      return data;
    },
    onError: (error) => {
      console.error("Error calculating customer price:", error);
      toast({
        title: "Error",
        description: "Failed to calculate customer price",
        variant: "destructive",
      });
    },
  });
};

