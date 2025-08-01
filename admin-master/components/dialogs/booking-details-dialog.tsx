"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import Image from "next/image";
import { Booking } from "@/services/types";
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookingQuickActions from "@/components/bookings/BookingQuickActions";
import BookingNotesPanel from "@/components/bookings/BookingNotesPanel";

interface BookingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
}

export function BookingDetailsDialog({
  open,
  onOpenChange,
  booking,
}: BookingDetailsDialogProps) {
  const [activeImageSet, setActiveImageSet] = useState<{
    urls: string[];
    index: number;
    uploadIndex: number;
  } | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Combine all image URLs from all media uploads into a single array
  const allImages = useMemo(() => {
    if (!booking?.media_uploads) return [];
    
    const images: Array<{
      url: string;
      uploadIndex: number;
      imageIndex: number;
    }> = [];
    
    booking.media_uploads.forEach((upload, uploadIndex) => {
      if (upload.image_urls) {
        upload.image_urls.forEach((url, imageIndex) => {
          images.push({
            url,
            uploadIndex,
            imageIndex,
          });
        });
      }
    });
    
    return images;
  }, [booking]);

  if (!booking) return null;

  const openImageCarousel = (uploadIndex: number, imageIndex: number) => {
    if (
      booking.media_uploads &&
      booking.media_uploads[uploadIndex] &&
      booking.media_uploads[uploadIndex].image_urls
    ) {
      // Find the global index in the combined array
      const globalIndex = allImages.findIndex(
        img => img.uploadIndex === uploadIndex && img.imageIndex === imageIndex
      );
      
      setActiveImageSet({
        urls: allImages.map(img => img.url),
        index: globalIndex !== -1 ? globalIndex : 0,
        uploadIndex,
      });
      setCurrentImageIndex(globalIndex !== -1 ? globalIndex : 0);
    }
  };

  const closeImageCarousel = () => {
    setActiveImageSet(null);
    setIsZoomed(false);
  };

  const nextImage = () => {
    if (!activeImageSet) return;
    const newIndex = (currentImageIndex + 1) % activeImageSet.urls.length;
    setCurrentImageIndex(newIndex);
  };

  const prevImage = () => {
    if (!activeImageSet) return;
    const newIndex =
      (currentImageIndex - 1 + activeImageSet.urls.length) %
      activeImageSet.urls.length;
    setCurrentImageIndex(newIndex);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Booking Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-8">
          {/* Quick Actions & Notes */}
          <div className="grid sm:grid-cols-4 gap-6">
            <div className="sm:col-span-3 space-y-8">
              <div className="grid grid-cols-2 gap-8 p-6 bg-secondary rounded-lg">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Booking ID</p>
                      <p className="font-medium">{booking.id}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Postcode</p>
                      <p className="font-medium">{booking.postcode}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p
                        className={`font-medium capitalize ${
                          booking.status === "confirmed"
                            ? "text-green-600 dark:text-green-400"
                            : booking.status === "cancelled"
                            ? "text-red-600 dark:text-red-400"
                            : booking.status === "completed"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-yellow-600 dark:text-yellow-400"
                        }`}
                      >
                        {booking.status}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Details</p>
                    <p className="font-medium">{booking.address}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Collection Time</p>
                    <p className="font-medium">
                      {booking.collection_time
                        ? format(new Date(booking.collection_time), "PPP p")
                        : "Not scheduled"}
                    </p>
                  </div>
                </div>

                {booking.quote && booking.quote.breakdown && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">
                      Quote Details
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Volume</p>
                          <p className="font-medium">
                            {booking.quote.breakdown.volume || "N/A"}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Material Risk
                          </p>
                          <p className="font-medium">
                            {booking.quote.breakdown.material_risk || "N/A"}
                          </p>
                        </div>
                      </div>
                      {booking.quote.breakdown.price_components && (
                        <div className="bg-background p-4 rounded-md shadow-sm">
                          <h4 className="font-medium mb-3">Price Breakdown</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Base Rate</span>
                              <span>
                                £
                                {booking.quote.breakdown.price_components.base_rate.toFixed(
                                  2
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Hazard Surcharge</span>
                              <span>
                                £
                                {booking.quote.breakdown.price_components.hazard_surcharge.toFixed(
                                  2
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Access Fee</span>
                              <span>
                                £
                                {booking.quote.breakdown.price_components.access_fee.toFixed(
                                  2
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Dismantling Fee</span>
                              <span>
                                £
                                {booking.quote.breakdown.price_components.dismantling_fee.toFixed(
                                  2
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between font-semibold pt-2 border-t">
                              <span>Total</span>
                              <span>
                                £
                                {booking.quote.breakdown.price_components.total.toFixed(
                                  2
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {booking.media_uploads && booking.media_uploads.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">
                    Media Uploads
                  </h3>
                  <div className="grid grid-cols-3 gap-6">
                    {booking.media_uploads.map((upload, uploadIndex) => (
                      <div
                        key={uploadIndex}
                        className="bg-background p-4 rounded-lg shadow-sm"
                      >
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {upload.image_urls &&
                            upload.image_urls.map((url, imgIndex) => (
                              <div
                                key={imgIndex}
                                className="relative aspect-square cursor-pointer group"
                                onClick={() => openImageCarousel(uploadIndex, imgIndex)}
                              >
                                <Image
                                  src={url}
                                  alt={`Upload ${uploadIndex + 1} Image ${imgIndex + 1}`}
                                  className="object-cover rounded-md transition-transform group-hover:scale-105"
                                  fill
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <ZoomIn className="text-white w-8 h-8" />
                                </div>
                              </div>
                            ))}
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Location:</span>
                            <span className="font-medium">
                              {upload.waste_location || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              Access Restricted:
                            </span>
                            <span className="font-medium">
                              {upload.access_restricted ? "Yes" : "No"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              Dismantling Required:
                            </span>
                            <span className="font-medium">
                              {upload.dismantling_required ? "Yes" : "No"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="sm:col-span-1 space-y-6">
              <BookingQuickActions booking={booking} onClose={() => onOpenChange(false)} />
              <BookingNotesPanel bookingId={booking.id} />
            </div>
          </div>

          {/* Image Carousel Modal */}
          {activeImageSet && (
            <div className="fixed inset-0 z-[100] bg-black bg-opacity-90 flex items-center justify-center">
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 text-white z-[110]"
                  onClick={closeImageCarousel}
                >
                  <X className="w-6 h-6" />
                </Button>
                
                <div className="relative w-full max-w-4xl h-[70vh] flex items-center justify-center">
                  <div 
                    className={`relative w-full h-full ${isZoomed ? 'cursor-zoom-out overflow-auto' : 'cursor-zoom-in'}`}
                    onClick={toggleZoom}
                  >
                    <div className={`relative ${isZoomed ? 'w-[200%] h-[200%] z-[105]' : 'w-full h-full'}`}>
                      <Image
                        src={activeImageSet.urls[currentImageIndex]}
                        alt={`Image ${currentImageIndex + 1}`}
                        className="object-contain"
                        fill
                        sizes="100vw"
                        priority
                      />
                    </div>
                  </div>
                </div>
                
                <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 p-4 z-[110]">
                  <div className="bg-black bg-opacity-50 px-4 py-2 rounded-full text-white">
                    {currentImageIndex + 1} / {activeImageSet.urls.length}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white z-[110]"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white z-[110]"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
                
                <div className="absolute bottom-24 left-0 right-0 flex justify-center gap-2 overflow-x-auto px-4 z-[110]">
                  <div className="flex gap-2 p-2 bg-black bg-opacity-50 rounded-lg">
                    {activeImageSet.urls.map((url, idx) => (
                      <div
                        key={idx}
                        className={`relative w-16 h-16 cursor-pointer ${
                          idx === currentImageIndex ? 'ring-2 ring-white' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(idx);
                        }}
                      >
                        <Image
                          src={url}
                          alt={`Thumbnail ${idx + 1}`}
                          className="object-cover rounded-md"
                          fill
                          sizes="64px"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
