"use client";

import { useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function ApiManagementPage() {
  const [open, setOpen] = useState(false);
  const [perm, setPerm] = useState("read");

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <span>Dashboard</span>
        <span>&gt;</span>
        <span className="font-medium">API Management</span>
      </div>

      {/* Heading */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">API Management</h1>
        <p className="text-muted-foreground">
          Manage API keys, mobile integration, and external service connections
        </p>
      </div>

      <Tabs defaultValue="keys" className="space-y-6">
        <TabsList>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="mobile">Mobile Integration</TabsTrigger>
          <TabsTrigger value="external">External Services</TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="keys" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  + Create API Key
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Key Name
                    </label>
                    <Input placeholder="e.g., Mobile App API Key" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Permissions
                    </label>
                    <Select value={perm} onValueChange={setPerm}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select permissions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="read">Read Only</SelectItem>
                        <SelectItem value="write">Read & Write</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Expiration Date (Optional)
                    </label>
                    <Input type="date" />
                  </div>

                  <Button className="w-full">Create API Key</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Table */}
          <Card className="p-0 border">
            <div className="p-6 border-b">
              <h2 className="font-semibold flex items-center gap-2">
                <span className="inline-flex items-center gap-1">
                  <span className="text-lg">🔑</span> API Keys
                </span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage external API access keys for your application
              </p>
            </div>
            <div className="p-6 text-sm text-muted-foreground">
              No API keys found. Create your first API key to get started.
            </div>
          </Card>
        </TabsContent>

        {/* Mobile Integration Tab */}
        <TabsContent value="mobile">
          <Card className="p-6 text-sm text-muted-foreground">
            Mobile integration settings will be available here.
          </Card>
        </TabsContent>

        {/* External Services Tab */}
        <TabsContent value="external">
          <Card className="p-6 text-sm text-muted-foreground">
            External service connections will be managed here.
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
