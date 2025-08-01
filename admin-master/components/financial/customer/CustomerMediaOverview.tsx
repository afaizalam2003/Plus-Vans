import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Image,
  Shield,
  Wrench,
  MapPin,
  Eye,
  Download,
  MoreHorizontal,
} from "lucide-react";
import { format } from "date-fns";
import CustomerMediaGallery from "./CustomerMediaGallery";
import CustomerMediaAnalysis from "./CustomerMediaAnalysis";

interface CustomerMediaOverviewProps {
  bookings: any[];
}

const CustomerMediaOverview: React.FC<CustomerMediaOverviewProps> = ({
  bookings,
}) => {
  const getAllMediaUploads = () => {
    return (
      bookings?.flatMap(
        (booking) =>
          booking.media_uploads?.map((upload: any) => ({
            ...upload,
            bookingId: booking.id,
            bookingAddress: booking.address,
            bookingStatus: booking.status,
          })) || []
      ) || []
    );
  };

  const mediaUploads = getAllMediaUploads();
  const totalImages = mediaUploads.reduce(
    (acc, upload) =>
      acc + (Array.isArray(upload.image_urls) ? upload.image_urls.length : 0),
    0
  );
  const accessRestrictedCount = mediaUploads.filter(
    (upload) => upload.access_restricted
  ).length;
  const dismantlingRequiredCount = mediaUploads.filter(
    (upload) => upload.dismantling_required
  ).length;

  if (mediaUploads.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Media & Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No media uploads found</p>
            <p className="text-sm text-muted-foreground">
              Media from customer bookings will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Media Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Images</p>
                <p className="text-2xl font-bold">{totalImages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Access Restricted</p>
                <p className="text-2xl font-bold">{accessRestrictedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Dismantling Required</p>
                <p className="text-2xl font-bold">{dismantlingRequiredCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Upload Sessions</p>
                <p className="text-2xl font-bold">{mediaUploads.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Media Tabs */}
      <Tabs defaultValue="gallery" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gallery">Media Gallery</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="gallery">
          <CustomerMediaGallery mediaUploads={mediaUploads} />
        </TabsContent>

        <TabsContent value="analysis">
          <CustomerMediaAnalysis bookings={bookings} />
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Media Upload Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mediaUploads
                  .sort(
                    (a, b) =>
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime()
                  )
                  .map((upload) => (
                    <div
                      key={upload.id}
                      className="flex items-center gap-4 p-3 border rounded-lg"
                    >
                      <div className="p-2 bg-muted rounded-full">
                        <Image className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {Array.isArray(upload.image_urls)
                              ? upload.image_urls.length
                              : 0}{" "}
                            images uploaded
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {upload.waste_location}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Booking: {upload.bookingAddress} •{" "}
                          {format(
                            new Date(upload.created_at),
                            "MMM d, yyyy HH:mm"
                          )}
                        </div>
                        <div className="flex gap-1 mt-1">
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
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerMediaOverview;
