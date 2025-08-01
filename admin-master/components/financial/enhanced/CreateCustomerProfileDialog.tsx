import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import {
  useCreateCustomerProfile,
  useMembershipTiers,
} from "@/components/hooks/useCustomerProfiles";

interface CreateCustomerProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProfileFormData {
  customer_email: string;
  profile_name: string;
  profile_type: string;
  discount_percentage: number;
  membership_tier: string;
  annual_volume_commitment: number;
  payment_terms: number;
}

const CreateCustomerProfileDialog: React.FC<
  CreateCustomerProfileDialogProps
> = ({ isOpen, onOpenChange }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>();
  const createProfile = useCreateCustomerProfile();
  const { data: membershipTiers } = useMembershipTiers();

  const onSubmit = (data: ProfileFormData) => {
    createProfile.mutate(
      {
        ...data,
        volume_discount_tiers: [],
        subscription_benefits: {},
        special_rates: {},
        is_active: true,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Customer Pricing Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_email">Customer Email *</Label>
              <Input
                id="customer_email"
                type="email"
                {...register("customer_email", {
                  required: "Email is required",
                })}
                placeholder="customer@example.com"
              />
              {errors.customer_email && (
                <p className="text-sm text-destructive">
                  {errors.customer_email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile_name">Profile Name *</Label>
              <Input
                id="profile_name"
                {...register("profile_name", {
                  required: "Profile name is required",
                })}
                placeholder="e.g., ABC Construction Profile"
              />
              {errors.profile_name && (
                <p className="text-sm text-destructive">
                  {errors.profile_name.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile_type">Profile Type</Label>
              <Select
                onValueChange={(value) => setValue("profile_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select profile type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="trade">Trade</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="membership_tier">Membership Tier</Label>
              <Select
                onValueChange={(value) => setValue("membership_tier", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select membership tier" />
                </SelectTrigger>
                <SelectContent>
                  {membershipTiers?.map((tier) => (
                    <SelectItem
                      key={tier.id}
                      value={tier.tier_name.toLowerCase()}
                    >
                      {tier.tier_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount_percentage">
                Discount Percentage (%)
              </Label>
              <Input
                id="discount_percentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                {...register("discount_percentage", { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="annual_volume_commitment">
                Annual Volume Commitment (£)
              </Label>
              <Input
                id="annual_volume_commitment"
                type="number"
                step="0.01"
                min="0"
                {...register("annual_volume_commitment", {
                  valueAsNumber: true,
                })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_terms">Payment Terms (days)</Label>
              <Input
                id="payment_terms"
                type="number"
                min="0"
                {...register("payment_terms", { valueAsNumber: true })}
                placeholder="30"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createProfile.isPending}>
              {createProfile.isPending ? "Creating..." : "Create Profile"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCustomerProfileDialog;
