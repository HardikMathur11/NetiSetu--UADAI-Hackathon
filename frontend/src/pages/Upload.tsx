import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/AppContext';
import { Dataset } from '@/data/demoData';
import { useUploadFile } from '@/hooks/useApi';
import { apiService } from '@/services/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Upload as UploadIcon,
  FileText,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  Database,
  Clock,
  Columns,
  Info,
  Server,
} from 'lucide-react';

interface DetectedSchema {
  timeColumn: string | null;
  regionColumn: string | null;
  metricColumns: string[];
  dataType: 'TIME_SERIES' | 'SNAPSHOT';
  canPredict: boolean;
  predictReason?: string;
  rowCount: number;
  columns: string[];
}

const timeColumnPatterns = ['year', 'month', 'date', 'time', 'period', 'quarter'];
const regionColumnPatterns = ['state', 'district', 'region', 'level', 'area', 'zone', 'location'];

const detectSchema = (headers: string[], data: any[]): DetectedSchema => {
  const normalizedHeaders = headers.map((h) => h.toLowerCase().trim());

  // Detect time column
  const timeColumn = headers.find((h) =>
    timeColumnPatterns.some((p) => h.toLowerCase().includes(p))
  ) || null;

  // Detect region column
  const regionColumn = headers.find((h) =>
    regionColumnPatterns.some((p) => h.toLowerCase().includes(p))
  ) || null;

  // Detect metric columns (numeric columns that aren't time or region)
  const metricColumns = headers.filter((h) => {
    if (h === timeColumn || h === regionColumn) return false;
    // Check if column has numeric values
    const sampleValue = data[0]?.[h];
    return typeof sampleValue === 'number' || !isNaN(parseFloat(sampleValue));
  });

  // Determine data type
  const uniqueTimePoints = timeColumn
    ? [...new Set(data.map((row) => row[timeColumn]))].length
    : 0;

  const dataType: 'TIME_SERIES' | 'SNAPSHOT' = timeColumn && uniqueTimePoints >= 2 ? 'TIME_SERIES' : 'SNAPSHOT';

  // Check prediction eligibility
  const canPredict = dataType === 'TIME_SERIES' && uniqueTimePoints >= 6;
  const predictReason = !canPredict
    ? dataType === 'SNAPSHOT'
      ? 'Snapshot data does not support time-based predictions'
      : `Only ${uniqueTimePoints} time points found. Prediction requires at least 6.`
    : undefined;

  return {
    timeColumn,
    regionColumn,
    metricColumns,
    dataType,
    canPredict,
    predictReason,
    rowCount: data.length,
    columns: headers,
  };
};

const parseCSV = (text: string): { headers: string[]; data: any[] } => {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));

  const data = lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/"/g, ''));
    const row: any = {};
    headers.forEach((header, i) => {
      const value = values[i];
      // Try to parse as number
      const numValue = parseFloat(value);
      row[header] = isNaN(numValue) ? value : numValue;
    });
    return row;
  });

  return { headers, data };
};

export const Upload: React.FC = () => {
  const navigate = useNavigate();


  const {
    setUploadedData,
    setCurrentDataset,
    setCurrentFileId,
    isBackendConnected,
    setIsBackendConnected,
    backendUrl
  } = useApp();

  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [detectedSchema, setDetectedSchema] = useState<DetectedSchema | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [parsedData, setParsedData] = useState<{ headers: string[]; data: any[] } | null>(null);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setErrorMessage('Please upload a CSV file');
      setUploadStatus('error');
      return;
    }

    setFileName(file.name);
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      // ALWAYS use backend API
      apiService.setBaseUrl(backendUrl);
      setUploadProgress(30);

      const uploadResult = await apiService.uploadFile(file);
      setUploadProgress(60);

      const schemaResult = await apiService.getSchema(uploadResult.fileId);
      setUploadProgress(90);

      setUploadedFileId(uploadResult.fileId);

      // Update global context immediately to prevent stale IDs
      setCurrentFileId(uploadResult.fileId);
      setIsBackendConnected(true);

      setDetectedSchema({
        timeColumn: schemaResult.timeColumn,
        regionColumn: schemaResult.regionColumn,
        metricColumns: schemaResult.metricColumns,
        dataType: schemaResult.dataType,
        canPredict: schemaResult.canPredict,
        predictReason: schemaResult.canPredict ? undefined : schemaResult.predictionReason,
        rowCount: schemaResult.rowCount,
        columns: schemaResult.metricColumns,
      });

      // Get data preview
      const previewResult = await apiService.getDataPreview(uploadResult.fileId, 100);
      setParsedData({
        headers: previewResult.columns,
        data: previewResult.data,
      });

      setUploadProgress(100);
      setUploadStatus('success');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process file');
      setUploadStatus('error');
    }
  }, [backendUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleProceed = () => {
    if (!parsedData || !detectedSchema) return;

    // If we have an uploaded file ID from the backend, save it to global context
    if (uploadedFileId) {
      setCurrentFileId(uploadedFileId);
      setIsBackendConnected(true);
    }

    const dataset: Dataset = {
      id: uploadedFileId || `uploaded_${Date.now()}`,
      name: fileName.replace('.csv', ''),
      description: 'User uploaded dataset',
      type: detectedSchema.dataType,
      columns: detectedSchema.columns,
      timeColumn: detectedSchema.timeColumn || undefined,
      regionColumn: detectedSchema.regionColumn || 'Unknown',
      metricColumns: detectedSchema.metricColumns,
      data: parsedData.data,
    };

    setUploadedData(dataset);
    setCurrentDataset(dataset);
    navigate('/data-understanding');
  };

  const handleReset = () => {
    setUploadStatus('idle');
    setUploadProgress(0);
    setDetectedSchema(null);
    setParsedData(null);
    setFileName('');
    setErrorMessage('');
    setUploadedFileId(null);

    // Clear global context to prevent stale IDs
    setCurrentFileId(null);
    setIsBackendConnected(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Upload Dataset</h1>
          <p className="text-muted-foreground">
            Upload a CSV file with UIDAI-style data for analysis
          </p>
        </div>

        {/* Upload Area */}
        {uploadStatus === 'idle' && (
          <Card>
            <CardContent className="p-8">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
                  }`}
              >
                <UploadIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Drag and drop your CSV file here
                </h3>
                <p className="text-muted-foreground mb-4">or click to browse</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-input"
                />
                <Button asChild>
                  <label htmlFor="file-input" className="cursor-pointer">
                    <FileText className="mr-2 h-4 w-4" />
                    Select File
                  </label>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress */}
        {(uploadStatus === 'uploading' || uploadStatus === 'processing') && (
          <Card>
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      {uploadStatus === 'uploading' ? 'Uploading...' : 'Processing & detecting schema...'}
                    </p>
                  </div>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {uploadStatus === 'error' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Upload Failed</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{errorMessage}</span>
              <Button variant="outline" size="sm" onClick={handleReset}>
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Success - Schema Detection Results */}
        {uploadStatus === 'success' && detectedSchema && (
          <div className="space-y-4">
            <Alert className="border-success bg-success/10">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertTitle className="text-success">File Processed Successfully</AlertTitle>
              <AlertDescription>
                {fileName} - {detectedSchema.rowCount} rows detected
              </AlertDescription>
            </Alert>

            {/* Detected Schema */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Detected Schema
                </CardTitle>
                <CardDescription>
                  The system automatically detected the following structure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Clock className="h-4 w-4" />
                      Time Column
                    </div>
                    <p className="font-medium">
                      {detectedSchema.timeColumn || <span className="text-muted-foreground">Not detected</span>}
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Columns className="h-4 w-4" />
                      Region Column
                    </div>
                    <p className="font-medium">
                      {detectedSchema.regionColumn || <span className="text-muted-foreground">Not detected</span>}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Database className="h-4 w-4" />
                    Metric Columns (Numeric)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {detectedSchema.metricColumns.map((col) => (
                      <Badge key={col} variant="secondary">{col}</Badge>
                    ))}
                  </div>
                </div>

                {/* Dataset Classification */}
                <div className="flex items-center gap-4">
                  <Badge
                    variant={detectedSchema.dataType === 'TIME_SERIES' ? 'default' : 'secondary'}
                    className="text-sm py-1 px-3"
                  >
                    {detectedSchema.dataType === 'TIME_SERIES' ? 'Time Series Data' : 'Snapshot Data'}
                  </Badge>

                  {detectedSchema.canPredict ? (
                    <Badge variant="outline" className="text-success border-success/30 bg-success/10">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Prediction Enabled
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-warning border-warning/30 bg-warning/10">
                      <AlertCircle className="h-3.5 w-3.5 mr-1" />
                      Prediction Disabled
                    </Badge>
                  )}
                </div>

                {detectedSchema.predictReason && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>{detectedSchema.predictReason}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Data Preview */}
            {parsedData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Data Preview</CardTitle>
                  <CardDescription>First 5 rows of your dataset</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          {parsedData.headers.map((header) => (
                            <th key={header} className="text-left p-2 font-medium">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.data.slice(0, 5).map((row, i) => (
                          <tr key={i} className="border-b last:border-0">
                            {parsedData.headers.map((header) => (
                              <td key={header} className="p-2 text-muted-foreground">
                                {typeof row[header] === 'number'
                                  ? row[header].toLocaleString()
                                  : row[header]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleReset}>
                Upload Different File
              </Button>
              <Button onClick={handleProceed}>
                Proceed to Analysis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expected CSV Format</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Your CSV should include:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Time column</strong> (optional): Year, Month, Date, or Period</li>
              <li><strong>Region column</strong> (recommended): State, District, or Region</li>
              <li><strong>Metric columns</strong> (required): Numeric values to analyze</li>
            </ul>
            <p className="text-xs mt-4">
              <strong>Note:</strong> Prediction is enabled only when at least 6 time points are available in time-series data.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Upload;
