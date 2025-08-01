import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Download, Calendar as CalendarIcon, FileSpreadsheet, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface ExportConfig {
  format: "csv" | "xlsx" | "pdf";
  dateRange: { from: Date; to: Date };
  includeFields: string[];
  filterStatus: string[];
}

interface Props {
  onExport: (config: ExportConfig) => void;
}

export default function BookingExportDialog({ onExport }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ExportConfig>({
    format: "csv",
    dateRange: { from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() },
    includeFields: ["id", "address", "status", "created_at", "quote"],
    filterStatus: ["all"],
  });

  const fields = [
    { id: "id", label: "Booking ID" },
    { id: "address", label: "Address" },
    { id: "postcode", label: "Postcode" },
    { id: "status", label: "Status" },
    { id: "created_at", label: "Created Date" },
    { id: "collection_time", label: "Collection Time" },
    { id: "quote", label: "Quote Amount" },
    { id: "customer_name", label: "Customer Name" },
  ];

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const formatIcons = { csv: FileSpreadsheet, xlsx: FileSpreadsheet, pdf: FileText } as const;
  const FormatIcon = formatIcons[config.format];

  const toggleField = (id: string) => {
    setConfig((p) => ({ ...p, includeFields: p.includeFields.includes(id) ? p.includeFields.filter((f) => f !== id) : [...p.includeFields, id] }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" /> Export Bookings
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* format */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={config.format} onValueChange={(v) => setConfig((p) => ({ ...p, format: v as any }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="xlsx">Excel</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* date range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["from", "to"] as const).map((key) => (
                <Popover key={key}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("justify-start text-left font-normal", !config.dateRange[key] && "text-muted-foreground")}> <CalendarIcon className="mr-2 h-4 w-4" /> {config.dateRange[key] ? format(config.dateRange[key], "MMM dd") : key === "from" ? "From" : "To"} </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={config.dateRange[key]} onSelect={(d) => d && setConfig((p) => ({ ...p, dateRange: { ...p.dateRange, [key]: d } }))} initialFocus />
                  </PopoverContent>
                </Popover>
              ))}
            </div>
          </div>
          {/* status filter */}
          <div className="space-y-2">
            <Label>Status Filter</Label>
            <Select value={config.filterStatus[0]} onValueChange={(v) => setConfig((p) => ({ ...p, filterStatus: [v] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {statusOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          {/* fields */}
          <div className="space-y-3">
            <Label>Include Fields</Label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {fields.map((f) => (
                <div key={f.id} className="flex items-center space-x-2">
                  <Checkbox id={f.id} checked={config.includeFields.includes(f.id)} onCheckedChange={() => toggleField(f.id)} />
                  <Label htmlFor={f.id} className="text-sm">{f.label}</Label>
                </div>
              ))}
            </div>
          </div>
          <Button className="w-full" onClick={() => { onExport(config); setIsOpen(false); }}>
            <FormatIcon className="h-4 w-4 mr-2" /> Export as {config.format.toUpperCase()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
