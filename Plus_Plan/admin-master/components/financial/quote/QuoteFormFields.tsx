import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { UseFormRegister, FieldErrors } from "react-hook-form";

interface QuoteFormData {
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  postcode: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  notes: string;
}

interface QuoteFormFieldsProps {
  register: UseFormRegister<QuoteFormData>;
  errors: FieldErrors<QuoteFormData>;
  postcode: string;
  onCalculatePrice: () => void;
  isCalculating: boolean;
}

const QuoteFormFields: React.FC<QuoteFormFieldsProps> = ({
  register,
  errors,
  postcode,
  onCalculatePrice,
  isCalculating,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="customer_name">Customer Name</Label>
        <Input
          id="customer_name"
          {...register("customer_name", {
            required: "Customer name is required",
          })}
          placeholder="Enter customer name"
        />
        {errors.customer_name && (
          <p className="text-sm text-red-500">{errors.customer_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer_email">Customer Email</Label>
        <Input
          id="customer_email"
          type="email"
          {...register("customer_email", { required: "Email is required" })}
          placeholder="Enter customer email"
        />
        {errors.customer_email && (
          <p className="text-sm text-red-500">
            {errors.customer_email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer_phone">Phone Number</Label>
        <Input
          id="customer_phone"
          {...register("customer_phone")}
          placeholder="Enter phone number"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          {...register("address", { required: "Address is required" })}
          placeholder="Enter full address"
        />
        {errors.address && (
          <p className="text-sm text-red-500">{errors.address.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="postcode">Postcode</Label>
          <Input
            id="postcode"
            {...register("postcode", { required: "Postcode is required" })}
            placeholder="Enter postcode"
          />
          {errors.postcode && (
            <p className="text-sm text-red-500">{errors.postcode.message}</p>
          )}
        </div>

        <div className="flex items-end">
          <Button
            type="button"
            onClick={onCalculatePrice}
            disabled={!postcode || isCalculating}
            className="w-full"
          >
            <Calculator className="h-4 w-4 mr-2" />
            {isCalculating ? "Calculating..." : "Calculate Price"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subtotal">Subtotal (£)</Label>
          <Input
            id="subtotal"
            type="number"
            step="0.01"
            {...register("subtotal", {
              required: "Subtotal is required",
              valueAsNumber: true,
            })}
            placeholder="0.00"
          />
          {errors.subtotal && (
            <p className="text-sm text-red-500">{errors.subtotal.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax_amount">Tax Amount (£)</Label>
          <Input
            id="tax_amount"
            type="number"
            step="0.01"
            {...register("tax_amount", { valueAsNumber: true })}
            placeholder="0.00"
            defaultValue={0}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="discount_amount">Discount (£)</Label>
          <Input
            id="discount_amount"
            type="number"
            step="0.01"
            {...register("discount_amount", { valueAsNumber: true })}
            placeholder="0.00"
            defaultValue={0}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register("notes")}
          placeholder="Additional notes for this quote"
        />
      </div>
    </div>
  );
};

export default QuoteFormFields;
