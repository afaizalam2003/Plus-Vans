import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Customer } from "@/types/customer";

interface CustomerDetailHeaderProps {
  customer: Customer & {
    bookings?: any[];
    total_bookings?: number;
    total_spent?: number;
    average_rating?: number;
  };
}

const CustomerDetailHeader: React.FC<CustomerDetailHeaderProps> = ({
  customer,
}) => {
  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <Button variant="outline" asChild>
        <Link to="/admin/customers">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Link>
      </Button>

      {/* Customer Profile */}
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-xl">
              {customer.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div>
            <h1 className="text-2xl font-bold">
              {customer.name || "Unknown Customer"}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={customer.role === "admin" ? "default" : "secondary"}
              >
                {customer.role}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Member since {format(new Date(customer.created_at), "MMM yyyy")}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Contact Actions */}
        <div className="flex items-center gap-2 md:ml-auto">
          {customer.email && (
            <Button variant="outline" size="sm" asChild>
              <a href={`mailto:${customer.email}`}>
                <Mail className="h-4 w-4 mr-2" />
                Email
              </a>
            </Button>
          )}
          {customer.phone && (
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${customer.phone}`}>
                <Phone className="h-4 w-4 mr-2" />
                Call
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <span>{customer.email || "No email provided"}</span>
        </div>
        {customer.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span>{customer.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>
            Joined {format(new Date(customer.created_at), "MMM d, yyyy")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailHeader;
