import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Image,
  Shield,
  Wrench,
  MapPin,
  Eye,
  Download,
  MoreHorizontal,
  ZoomIn,
} from "lucide-react";
import { format } from "date-fns";

interface CustomerMediaGalleryProps {
  mediaUploads: any[];
}

const CustomerMediaGallery: React.FC<CustomerMediaGalleryProps> = ({
  mediaUploads,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<
    "all" | "restricted" | "dismantling"
  >("all");

  const filteredUploads = mediaUploads.filter((upload) => {
    switch (filterType) {
      case "restricted":
        return upload.access_restricted;
      case "dismantling":
        return upload.dismantling_required;
      default:
        return true;
    }
  });

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex gap-2">
        <Button
          variant={filterType === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("all")}
        >
          All Media
        </Button>
        <Button
          variant={filterType === "restricted" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("restricted")}
        >
          <Shield className="h-4 w-4 mr-2" />
          Access Restricted
        </Button>
        <Button
          variant={filterType === "dismantling" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("dismantling")}
        >
          <Wrench className="h-4 w-4 mr-2" />
          Dismantling Required
        </Button>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUploads.map((upload) => (
          <Card key={upload.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  Upload #{upload.id.slice(-8)}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {format(new Date(upload.created_at), "MMM d")}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {upload.waste_location}
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Image Previews */}
              {upload.image_urls &&
              Array.isArray(upload.image_urls) &&
              upload.image_urls.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {upload.image_urls
                    .slice(0, 4)
                    .map((url: string, index: number) => (
                      <div
                        key={index}
                        className="relative aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedImage(url)}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Image className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ZoomIn className="h-6 w-6 text-white" />
                        </div>
                        {index === 3 && upload.image_urls.length > 4 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              +{upload.image_urls.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Image className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No images</p>
                  </div>
                </div>
              )}

              {/* Upload Details */}
              <div className="space-y-2">
                <div className="flex gap-1 flex-wrap">
                  {upload.access_restricted && (
                    <Badge variant="secondary" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      Access Restricted
                    </Badge>
                  )}
                  {upload.dismantling_required && (
                    <Badge variant="secondary" className="text-xs">
                      <Wrench className="h-3 w-3 mr-1" />
                      Dismantling Required
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  Booking: {upload.bookingAddress}
                </div>

                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUploads.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No media found for the selected filter
            </p>
          </CardContent>
        </Card>
      )}

      {/* Image Preview Dialog */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-auto">
            {selectedImage && (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <Image className="h-16 w-16 text-muted-foreground" />
                <span className="sr-only">Image preview placeholder</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerMediaGallery;
