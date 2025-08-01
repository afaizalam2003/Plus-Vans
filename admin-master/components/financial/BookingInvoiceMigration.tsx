'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Database, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { AutomaticInvoiceService } from './AutomaticInvoiceService';
import { useToast } from '@/components/ui/use-toast';

interface MigrationResult {
  success: number;
  failed: number;
  skipped: number;
  completed: boolean;
  isRunning: boolean;
}

export const BookingInvoiceMigration: React.FC = () => {
  const [migrationResult, setMigrationResult] = useState<MigrationResult>({
    success: 0,
    failed: 0,
    skipped: 0,
    completed: false,
    isRunning: false,
  });

  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const runMigration = async () => {
    setMigrationResult(prev => ({ ...prev, isRunning: true }));
    setProgress(10);

    try {
      toast({
        title: "Starting invoice migration...",
        description: "Processing all existing bookings"
      });
      
      const result = await AutomaticInvoiceService.generateInvoicesForAllBookings();
      
      setProgress(100);
      setMigrationResult({
        ...result,
        completed: true,
        isRunning: false,
      });

      if (result.success > 0) {
        toast({
          title: "Migration completed!",
          description: `Generated ${result.success} invoices.`
        });
      } else if (result.failed > 0) {
        toast({
          title: "Migration failed",
          description: `${result.failed} bookings couldn't be processed.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Migration completed",
          description: "No new invoices were needed."
        });
      }
    } catch (error) {
      console.error('Migration error:', error);
      setMigrationResult(prev => ({
        ...prev,
        failed: prev.failed + 1,
        completed: true,
        isRunning: false,
      }));
      setProgress(100);
      toast({
        title: "Migration failed",
        description: "Please check the console for details.",
        variant: "destructive"
      });
    }
  };

  const resetMigration = () => {
    setMigrationResult({
      success: 0,
      failed: 0,
      skipped: 0,
      completed: false,
      isRunning: false,
    });
    setProgress(0);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Booking Invoice Migration
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Automatically generate invoices for all existing bookings in the system.
          This will create invoice records for bookings that don&apos;t already have them.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status */}
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">Status:</div>
          <div className="flex items-center gap-1">
            {migrationResult.isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-blue-500">Running...</span>
              </>
            ) : migrationResult.completed ? (
              migrationResult.failed === 0 ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-500">Completed</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-500">Completed with errors</span>
                </>
              )
            ) : (
              <>
                <div className="h-4 w-4 rounded-full bg-gray-300" />
                <span className="text-gray-500">Ready</span>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {migrationResult.isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Results */}
        {migrationResult.completed && (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {migrationResult.success}
              </div>
              <div className="text-sm text-green-700">Generated</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {migrationResult.skipped}
              </div>
              <div className="text-sm text-blue-700">Skipped</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {migrationResult.failed}
              </div>
              <div className="text-sm text-red-700">Failed</div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={runMigration}
            disabled={migrationResult.isRunning}
            className="flex items-center gap-2"
          >
            {migrationResult.isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            {migrationResult.isRunning ? 'Running...' : 'Start Migration'}
          </Button>

          {migrationResult.completed && (
            <Button variant="outline" onClick={resetMigration}>
              Reset
            </Button>
          )}
        </div>

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <div className="font-medium mb-1">Important:</div>
              <p>
                This operation will create new database records. Make sure you have 
                backed up your data before proceeding. The system will automatically
                skip bookings that already have invoices.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 