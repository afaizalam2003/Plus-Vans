import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  MessageSquare,
  Mail,
  Phone,
  Send,
  Calendar,
  AlertCircle,
} from "lucide-react";
import {
  useCustomerCommunications,
  useCreateCustomerCommunication,
} from "@/components/hooks/useCustomerIntelligence";

interface CustomerCommunicationPanelProps {
  customerEmail?: string;
}

const CustomerCommunicationPanel: React.FC<CustomerCommunicationPanelProps> = ({
  customerEmail,
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCommunication, setNewCommunication] = useState({
    customer_email: customerEmail || "",
    communication_type: "email",
    direction: "outbound",
    subject: "",
    content: "",
    response_required: false,
    tags: [],
    metadata: {},
  });

  const { data: communications = [], isLoading } =
    useCustomerCommunications(customerEmail);
  const createCommunication = useCreateCustomerCommunication();

  const handleCreateCommunication = async () => {
    if (!newCommunication.customer_email || !newCommunication.content) return;

    try {
      await createCommunication.mutateAsync({
        ...newCommunication,
        status: "sent",
      });

      setIsCreateDialogOpen(false);
      setNewCommunication({
        customer_email: customerEmail || "",
        communication_type: "email",
        direction: "outbound",
        subject: "",
        content: "",
        response_required: false,
        tags: [],
        metadata: {},
      });
    } catch (error) {
      console.error("Failed to create communication:", error);
    }
  };

  const getCommunicationIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "phone":
        return <Phone className="h-4 w-4" />;
      case "sms":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "read":
        return "bg-purple-100 text-purple-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDirectionColor = (direction: string) => {
    return direction === "inbound"
      ? "bg-orange-100 text-orange-800"
      : "bg-blue-100 text-blue-800";
  };

  if (isLoading) {
    return <div>Loading communications...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Customer Communications</h3>
          <p className="text-muted-foreground">
            Track and manage customer communication history
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Log Communication
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Log Customer Communication</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Customer Email</Label>
                  <Input
                    id="email"
                    value={newCommunication.customer_email}
                    onChange={(e) =>
                      setNewCommunication({
                        ...newCommunication,
                        customer_email: e.target.value,
                      })
                    }
                    placeholder="customer@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Communication Type</Label>
                  <Select
                    value={newCommunication.communication_type}
                    onValueChange={(value) =>
                      setNewCommunication({
                        ...newCommunication,
                        communication_type: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone Call</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="system">System Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="direction">Direction</Label>
                  <Select
                    value={newCommunication.direction}
                    onValueChange={(value) =>
                      setNewCommunication({
                        ...newCommunication,
                        direction: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="outbound">Outbound</SelectItem>
                      <SelectItem value="inbound">Inbound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="response_required"
                    checked={newCommunication.response_required}
                    onChange={(e) =>
                      setNewCommunication({
                        ...newCommunication,
                        response_required: e.target.checked,
                      })
                    }
                  />
                  <Label htmlFor="response_required">Response Required</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={newCommunication.subject}
                  onChange={(e) =>
                    setNewCommunication({
                      ...newCommunication,
                      subject: e.target.value,
                    })
                  }
                  placeholder="Communication subject..."
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newCommunication.content}
                  onChange={(e) =>
                    setNewCommunication({
                      ...newCommunication,
                      content: e.target.value,
                    })
                  }
                  placeholder="Communication content..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCommunication}
                  disabled={
                    !newCommunication.customer_email ||
                    !newCommunication.content ||
                    createCommunication.isPending
                  }
                >
                  {createCommunication.isPending
                    ? "Logging..."
                    : "Log Communication"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {communications.map((communication) => (
          <Card key={communication.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  {getCommunicationIcon(communication.communication_type)}
                  {communication.subject ||
                    `${communication.communication_type} communication`}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge className={getDirectionColor(communication.direction)}>
                    {communication.direction}
                  </Badge>
                  <Badge className={getStatusColor(communication.status)}>
                    {communication.status}
                  </Badge>
                  {communication.response_required && (
                    <Badge
                      variant="destructive"
                      className="flex items-center gap-1"
                    >
                      <AlertCircle className="h-3 w-3" />
                      Response Required
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Details</h4>
                  <div className="text-sm">
                    <p>
                      <span className="text-muted-foreground">Customer:</span>{" "}
                      {communication.customer_email}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Type:</span>{" "}
                      {communication.communication_type}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Date:</span>{" "}
                      {new Date(communication.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Content</h4>
                  <p className="text-sm text-muted-foreground">
                    {communication.content?.substring(0, 150)}
                    {communication.content &&
                      communication.content.length > 150 &&
                      "..."}
                  </p>
                </div>
              </div>

              {communication.tags && communication.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {communication.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {communication.response_deadline && (
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <Calendar className="h-4 w-4" />
                  Response deadline:{" "}
                  {new Date(
                    communication.response_deadline
                  ).toLocaleDateString()}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {communications.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              No Communications Found
            </h3>
            <p className="text-muted-foreground mb-4">
              {customerEmail
                ? `No communications found for ${customerEmail}`
                : "Enter a customer email to view communications or log a new one."}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Send className="h-4 w-4 mr-2" />
              Log First Communication
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomerCommunicationPanel;
