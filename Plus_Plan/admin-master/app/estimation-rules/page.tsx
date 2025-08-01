"use client";

import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Plus, Eye, ChevronDown, Search, Filter } from "lucide-react";
import { EstimationRuleDialog } from "@/components/dialogs/estimation-rule-dialog";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { EstimationRuleView } from "@/components/dialogs/estimation-rule-view";
import {
  fetchEstimationRules,
  updateEstimationRule,
  deleteEstimationRule,
} from "@/redux/slices/adminSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import type {
  EstimationRule,
  EstimationRuleListParams,
} from "@/services/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import DateRangePicker from "@/components/ui/date-range-picker";

interface RuleFilters {
  status: "all" | "active" | "inactive";
  type: string;
  search?: string;
  dateRange: {
    start: string;
    end: string;
  };
}

// Estimation rules filters component
const RuleFilters = ({
  filters,
  setFilters,
}: {
  filters: RuleFilters;
  setFilters: (filters: RuleFilters) => void;
}) => {
  return (
    <div className="bg-card p-6 rounded-lg shadow-sm space-y-4 mb-6 border border-[#635bff]/20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg font-semibold text-[#635bff]">Filters</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setFilters({
              status: "all",
              type: "all",
              search: undefined,
              dateRange: {
                start: new Date().toISOString(),
                end: new Date().toISOString(),
              },
            })
          }
          className="w-full sm:w-auto border-[#635bff]/20 text-[#635bff] hover:bg-[#635bff]/10"
        >
          Reset Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-[#635bff]">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rules..."
              className="pl-8 w-full border-[#635bff]/20 focus:border-[#635bff] transition-colors"
              value={filters.search || ""}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-[#635bff]">
            Status
          </label>
          <Select
            value={filters.status}
            onValueChange={(value: "all" | "active" | "inactive") =>
              setFilters({ ...filters, status: value })
            }
          >
            <SelectTrigger className="w-full border-[#635bff]/20 focus:border-[#635bff] transition-colors">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-[#635bff]">
            Rule Type
          </label>
          <Select
            value={filters.type}
            onValueChange={(value) => setFilters({ ...filters, type: value })}
          >
            <SelectTrigger className="w-full border-[#635bff]/20 focus:border-[#635bff] transition-colors">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="base_rate_adjustment">
                Base Rate Adjustment
              </SelectItem>
              <SelectItem value="hazard_multiplier">
                Hazard Multiplier
              </SelectItem>
              <SelectItem value="location_modifier">
                Location Modifier
              </SelectItem>
              <SelectItem value="dismantling_fee_adjustment">
                Dismantling Fee Adjustment
              </SelectItem>
              <SelectItem value="volume_estimation">
                Volume Estimation
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-[#635bff]">
            Date Range
          </label>
          <DateRangePicker
            value={{
              from: filters.dateRange.start
                ? new Date(filters.dateRange.start)
                : undefined,
              to: filters.dateRange.end
                ? new Date(filters.dateRange.end)
                : undefined,
            }}
            onChange={(range) =>
              setFilters({
                ...filters,
                dateRange: {
                  start: range?.from?.toISOString() || new Date().toISOString(),
                  end: range?.to?.toISOString() || new Date().toISOString(),
                },
              })
            }
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default function EstimationRulesPage() {
  const dispatch = useAppDispatch();

  const { loading, error, rules } = useAppSelector((state) => ({
    loading: state.admin.loading.estimationRules === "pending",
    error: state.admin.error.estimationRules,
    rules: state.admin.estimationRules || []
  }));

  const [filters, setFilters] = React.useState<RuleFilters>({
    status: "all",
    type: "all",
    search: undefined,
    dateRange: {
      start: new Date().toISOString(),
      end: new Date().toISOString(),
    },
  });

  const [selectedRule, setSelectedRule] = React.useState<EstimationRule | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">(
    "create"
  );
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isTogglingActive, setIsTogglingActive] = React.useState<string | null>(
    null
  );
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const [sortField, setSortField] =
    React.useState<keyof EstimationRule>("updated_at");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    "desc"
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = React.useState<boolean>(false);

  // Fetch estimation rules on component mount and when filters change
  useEffect(() => {
    const params: EstimationRuleListParams = {
      limit: itemsPerPage,
      status: filters.status === "all" ? undefined : filters.status,
      rule_type: filters.type === "all" ? undefined : filters.type,
      search: filters.search,
      date_from: filters.dateRange.start,
      date_to: filters.dateRange.end,
      sort_by: sortField,
      sort_direction: sortDirection,
    };

    dispatch(fetchEstimationRules(params));
  }, [dispatch, currentPage, itemsPerPage, filters, sortField, sortDirection]);

  const handleBulkUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/estimation-rules/bulk-upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload rules");

      toast.success("Rules uploaded successfully");
      dispatch(fetchEstimationRules());
    } catch (error) {
      toast.error("Failed to upload rules");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCreateRule = () => {
    setSelectedRule(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEdit = (rule: EstimationRule) => {
    setSelectedRule(rule);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedRule) return;

    try {
      setIsDeleting(true);
      await dispatch(deleteEstimationRule(selectedRule.id)).unwrap();

      const params: EstimationRuleListParams = {
        limit: itemsPerPage,
        status: filters.status === "all" ? undefined : filters.status,
        rule_type: filters.type === "all" ? undefined : filters.type,
        search: filters.search,
        date_from: filters.dateRange.start,
        date_to: filters.dateRange.end,
        sort_by: sortField,
        sort_direction: sortDirection,
      };

      toast.success("Rule deleted successfully");
      setDeleteDialogOpen(false);
      dispatch(fetchEstimationRules(params));
    } catch (error) {
      toast.error("Failed to delete rule");
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (rule: EstimationRule) => {
    try {
      setIsTogglingActive(rule.id);
      const params: EstimationRuleListParams = {
        limit: itemsPerPage,
        status: filters.status === "all" ? undefined : filters.status,
        rule_type: filters.type === "all" ? undefined : filters.type,
        search: filters.search,
        date_from: filters.dateRange.start,
        date_to: filters.dateRange.end,
        sort_by: sortField,
        sort_direction: sortDirection,
      };

      await dispatch(
        updateEstimationRule({
          ruleId: rule.id,
          ruleData: { active: !rule.active },
        })
      ).unwrap();

      toast.success(
        `Rule ${rule.active ? "deactivated" : "activated"} successfully`
      );

      dispatch(fetchEstimationRules(params));
    } catch (error) {
      toast.error("Failed to update rule status");
      console.error("Toggle active error:", error);
    } finally {
      setIsTogglingActive(null);
    }
  };

  const handleExport = async (): Promise<void> => {
    try {
      setIsExporting(true);
      const headers = [
        "Rule Name",
        "Rule Type",
        "Description",
        "Min Value",
        "Max Value",
        "Multiplier",
        "Status",
        "Created At",
      ];

      if (!rules || !Array.isArray(rules)) {
        throw new Error("Estimation rules data is not available");
      }

      const csvData = rules.map((rule: EstimationRule) => [
        rule.rule_name,
        rule.rule_type.replace(/_/g, " "),
        rule.rule_description || "N/A",
        rule.min_value !== null ? rule.min_value.toString() : "N/A",
        rule.max_value !== null ? rule.max_value.toString() : "N/A",
        rule.multiplier.toString(),
        rule.active ? "Active" : "Inactive",
        format(new Date(rule.created_at), "PPp"),
      ]);

      const csvContent = [headers, ...csvData]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `estimation-rules-${format(new Date(), "yyyy-MM-dd")}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Estimation rules data exported successfully");
    } catch (error) {
      toast.error("Failed to export estimation rules data");
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#635bff]">
            Estimation Rules
          </h1>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Quick Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-wrap gap-4 mb-6">
          <Skeleton className="h-10 flex-1 min-w-[200px]" />
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[150px]" />
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto">
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center justify-center text-red-500 p-6">
            <p className="text-lg">Error loading estimation rules: {error}</p>
          </div>
          <div className="flex justify-center">
            <Button
              onClick={() => dispatch(fetchEstimationRules())}
              variant="outline"
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Pagination logic
  const indexOfLastRule = currentPage * itemsPerPage;
  const indexOfFirstRule = indexOfLastRule - itemsPerPage;
  const currentRules = rules.slice(indexOfFirstRule, indexOfLastRule);
  const totalPages = Math.ceil(rules.length / itemsPerPage);

  const activeRulesCount = rules.filter((rule: EstimationRule) => rule.active).length;
  const totalRulesCount = rules.length;

  const lastUpdatedDate =
    rules.length > 0
      ? format(
          new Date(
            Math.max(
              ...rules.map((rule: EstimationRule) =>
                new Date(rule.updated_at).getTime()
              )
            )
          ),
          "MMM d, yyyy"
        )
      : "No rules";

  return (
    <div className="p-6 px-12 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#635bff]">
            Estimation Rules
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage pricing rules and estimation logic
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
            className="border-[#635bff]/20 text-[#635bff] hover:bg-[#635bff]/10"
          >
            <Download
              className={cn("w-4 h-4 mr-2", isExporting && "animate-spin")}
            />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="gap-2 border-[#635bff]/20 text-[#635bff] hover:bg-[#635bff]/10"
          >
            <Plus className={cn("w-4 h-4", isUploading && "animate-spin")} />
            {isUploading ? "Uploading..." : "Bulk Upload"}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv,.xlsx"
            onChange={handleBulkUpload}
          />
          <Button
            onClick={handleCreateRule}
            className="gap-2 bg-[#635bff] hover:bg-[#635bff]/90"
          >
            <Plus className="w-4 h-4" />
            Create Rule
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6 border-[#635bff]/20 hover:border-[#635bff]/40 transition-colors">
          <h3 className="font-medium text-[#635bff]">Active Rules</h3>
          <p className="text-2xl font-bold">{activeRulesCount}</p>
        </Card>
        <Card className="p-6 border-[#635bff]/20 hover:border-[#635bff]/40 transition-colors">
          <h3 className="font-medium text-[#635bff]">Total Rules</h3>
          <p className="text-2xl font-bold">{totalRulesCount}</p>
        </Card>
        <Card className="p-6 border-[#635bff]/20 hover:border-[#635bff]/40 transition-colors">
          <h3 className="font-medium text-[#635bff]">Last Updated</h3>
          <p className="text-2xl font-bold">{lastUpdatedDate}</p>
        </Card>
      </div>

      <RuleFilters filters={filters} setFilters={setFilters} />

      <div className="border rounded-lg bg-card border-[#635bff]/20 shadow-sm">
        <Table>
          <TableHeader className="bg-[#635bff]/5">
            <TableRow>
              <TableHead className="font-semibold">Rule Name</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Value Range</TableHead>
              <TableHead className="font-semibold">Multiplier</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="text-right font-semibold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRules.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No rules found matching your filters
                </TableCell>
              </TableRow>
            ) : (
              currentRules.map((rule: EstimationRule) => (
                <TableRow
                  key={rule.id}
                  className="hover:bg-[#635bff]/5 transition-colors"
                >
                  <TableCell className="font-medium">
                    {rule.rule_name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="capitalize border-[#635bff]/20 text-[#635bff]"
                    >
                      {rule.rule_type.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {rule.min_value !== null && rule.max_value !== null
                      ? `${rule.min_value} - ${rule.max_value} ${rule.currency}`
                      : "N/A"}
                  </TableCell>
                  <TableCell>×{rule.multiplier}</TableCell>
                  <TableCell>
                    <Badge
                      variant={rule.active ? "default" : "secondary"}
                      className={cn(
                        rule.active && "bg-[#635bff] text-white",
                        !rule.active && "bg-gray-100 text-gray-800"
                      )}
                    >
                      {rule.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedRule(rule);
                        setViewDialogOpen(true);
                      }}
                      className="text-[#635bff] hover:bg-[#635bff]/10 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(rule)}
                      className="text-[#635bff] hover:bg-[#635bff]/10 transition-colors"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => {
                        setSelectedRule(rule);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="border-[#635bff]/20 text-[#635bff] hover:bg-[#635bff]/10"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="border-[#635bff]/20 text-[#635bff] hover:bg-[#635bff]/10"
          >
            Next
          </Button>
        </div>
      </div>

      <EstimationRuleView
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        rule={selectedRule}
        onEdit={handleEdit}
      />

      <EstimationRuleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        rule={selectedRule}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Rule"
        description="Are you sure you want to delete this rule? This action cannot be undone."
      />
    </div>
  );
}
