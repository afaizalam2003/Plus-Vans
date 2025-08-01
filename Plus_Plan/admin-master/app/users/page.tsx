"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserProfile } from "@/services/types";
import { getAllUsers, createUser, updateUser, deleteUser } from "@/services/admin";
import { Pencil, Trash, Plus, Search } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from "@/components/ui/pagination";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users as UsersIcon, UserPlus, UserCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { isAfter, subDays, startOfMonth, startOfQuarter, startOfToday } from "date-fns";

const UsersPage = ({ roleFilter }: { roleFilter?: "customer" | "admin" | "ops" | "support" } = {}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("joinDate");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "customer" as "customer" | "admin" | "ops" | "support",
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const itemsPerPage = 10;

  // --- User statistics ---
  const totalUsers = users.length;
  const today = new Date().toISOString().slice(0, 10);
  const newTodayCount = users.filter(
    (u) => (u as any).createdAt?.slice(0, 10) === today
  ).length;
  const activeUsersCount = users.filter((u) => {
    const lastActive = (u as any).lastActive;
    if (!lastActive) return false;
    const last = new Date(lastActive);
    const thirtyAgo = new Date();
    thirtyAgo.setDate(thirtyAgo.getDate() - 30);
    return last >= thirtyAgo;
  }).length;
  // -----------------------

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      await createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
      });
      toast({
        title: "Success",
        description: "User created successfully",
      });
      setShowCreateDialog(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
      console.error(err);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      await updateUser(selectedUser.id, {
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
      });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setShowEditDialog(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
      console.error(err);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      setShowDeleteDialog(false);
      fetchUsers();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "customer",
    });
    setSelectedUser(null);
  };

  const openEditDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // We don't show or edit password during updates
      phone: user.phone || "",
      role: user.role,
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const getFromDate = (range: string): Date | null => {
    const now = new Date();
    switch (range) {
      case "today":
        return startOfToday();
      case "week":
        return subDays(now, 7);
      case "month":
        return startOfMonth(now);
      case "quarter":
        return startOfQuarter(now);
      default:
        return null; // 'all'
    }
  };

  const filteredUsers = users.filter((user) => {
    // role filter if provided
    if (roleFilter && user.role !== roleFilter) return false;
    // status filter (active/inactive)
    if (statusFilter !== "all") {
      const lastActive = (user as any).lastActive;
      const isActive = lastActive && isAfter(new Date(lastActive), subDays(new Date(), 30));
      if (statusFilter === "active" && !isActive) return false;
      if (statusFilter === "inactive" && isActive) return false;
    }
    // date range filter based on createdAt/created_at
    const fromDate = getFromDate(dateRange);
    if (fromDate) {
      const created = new Date((user as any).created_at || user.createdAt || 0);
      if (isAfter(fromDate, created)) return false;
    }
    // search term filter
    if (
      !(
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm))
      )
    ) {
      return false;
    }
    return true;
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginationRange = () => {
    const range = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          range.push(i);
        }
        range.push("ellipsis");
        range.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        range.push(1);
        range.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          range.push(i);
        }
      } else {
        range.push(1);
        range.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          range.push(i);
        }
        range.push("ellipsis");
        range.push(totalPages);
      }
    }

    return range;
  };

  const handleUserSelect = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map((u) => u.id));
    }
  };

  // Currency helper
  const gbp = (n: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);

  // ---------------- User Filters Component ----------------
  type UserFiltersState = {
    search: string;
    status: string;
    dateRange: string;
    sortBy: string;
  };

  const UserFilters: React.FC<{
    filters: UserFiltersState;
    onFiltersChange: (f: UserFiltersState) => void;
  }> = ({ filters, onFiltersChange }) => {
    const handleChange = (key: keyof UserFiltersState, value: string) => {
      onFiltersChange({
        ...filters,
        [key]: value,
      });
    };

    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search Users</Label>
              <Input
                id="search"
                placeholder="Name, email, or phone..."
                value={filters.search}
                onChange={(e) => handleChange("search", e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Activity Status</Label>
              <Select
                value={filters.status}
                onValueChange={(v) => handleChange("status", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select
                value={filters.dateRange}
                onValueChange={(v) => handleChange("dateRange", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select
                value={filters.sortBy}
                onValueChange={(v) => handleChange("sortBy", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Join Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="joinDate">Join Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  // --------------------------------------------------------

  return (
    <div className="container px-12 mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-black">
            Customer Management
            </h1>
            <p className="text-muted-foreground mt-1 text-[#64748b]">
            Manage customer accounts, view customer activity, and analyze customer data
            </p>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">All registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Today</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{newTodayCount}</div>
              <p className="text-xs text-muted-foreground">Registered today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{activeUsersCount}</div>
              <p className="text-xs text-muted-foreground">Active in last 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <UserFilters
          filters={{
            search: searchTerm,
            status: statusFilter,
            dateRange,
            sortBy,
          }}
          onFiltersChange={(f) => {
            setSearchTerm(f.search);
            setStatusFilter(f.status);
            setDateRange(f.dateRange);
            setSortBy(f.sortBy);
          }}
        />

        {/* Card List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#635bff]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive font-medium">Error loading users</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Users ({filteredUsers.length})</CardTitle>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">Select All</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {paginatedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 p-4 border-b last:border-b-0 hover:bg-muted/50"
                >
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => handleUserSelect(user.id)}
                  />

                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {(user.name || "U")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{user.name || "Unknown"}</h3>
                      <Badge
                        className={cn(
                          "capitalize",
                          user.role === "admin" && "bg-red-100 text-red-800",
                          user.role === "ops" && "bg-blue-100 text-blue-800",
                          user.role === "support" && "bg-yellow-100 text-yellow-800",
                          user.role === "customer" && "bg-green-100 text-green-800"
                        )}
                      >
                        {user.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    {user.phone && (
                      <p className="text-sm text-muted-foreground">{user.phone}</p>
                    )}
                  </div>

                  <div className="text-right space-y-1 hidden md:block">
                    <div className="text-sm font-medium">0 bookings</div>
                    <div className="text-sm text-muted-foreground">{gbp(0)} spent</div>
                    <div className="text-xs text-muted-foreground">
                      Joined {new Date(user.created_at || user.createdAt || "").toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`#`}> {/* TODO: user detail route */}
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    {user.email && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`mailto:${user.email}`}>
                          <Mail className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {user.phone && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`tel:${user.phone}`}>
                          <Phone className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="mt-6 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of{" "}
              {filteredUsers.length} users
            </p>
            <Pagination>
              <PaginationContent>
                {paginationRange().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === "ellipsis" ? (
                      <PaginationEllipsis />
                    ) : (
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page as number)}
                        className={cn(
                          "min-w-[2.5rem]",
                          currentPage === page
                            ? "bg-[#635bff] hover:bg-[#635bff]/90"
                            : "border-[#635bff]/20 text-[#635bff] hover:bg-[#635bff]/10"
                        )}
                      >
                        {page}
                      </Button>
                    )}
                  </PaginationItem>
                ))}
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Create User Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-[#635bff] text-xl">
                Create New User
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right font-medium">
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="col-span-3 border-[#635bff]/20 focus:border-[#635bff]"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="col-span-3 border-[#635bff]/20 focus:border-[#635bff]"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="col-span-3 border-[#635bff]/20 focus:border-[#635bff]"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right font-medium">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="col-span-3 border-[#635bff]/20 focus:border-[#635bff]"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right font-medium">
                  Role
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      role: value as "customer" | "admin" | "ops" | "support",
                    })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="ops">Operations</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="border-[#635bff]/20 text-[#635bff] hover:bg-[#635bff]/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateUser}
                className="bg-[#635bff] hover:bg-[#635bff]/90 text-white"
              >
                Create User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-[#635bff] text-xl">
                Edit User
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right font-medium">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="col-span-3 border-[#635bff]/20 focus:border-[#635bff]"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right font-medium">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="col-span-3 border-[#635bff]/20 focus:border-[#635bff] opacity-50"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-phone" className="text-right font-medium">
                  Phone
                </Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="col-span-3 border-[#635bff]/20 focus:border-[#635bff]"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right font-medium">
                  Role
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      role: value as "customer" | "admin" | "ops" | "support",
                    })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="ops">Operations</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                className="border-[#635bff]/20 text-[#635bff] hover:bg-[#635bff]/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateUser}
                className="bg-[#635bff] hover:bg-[#635bff]/90 text-white"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete User Dialog */}
        <DeleteDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete User"
          description={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
          onConfirm={handleDeleteUser}
        />
      </div>
    </div>
  );
};

export default UsersPage;
