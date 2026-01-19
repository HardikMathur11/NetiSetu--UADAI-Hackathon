import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Dataset, allDemoDatasets } from '@/data/demoData';

interface AppState {

  guidedStep: number;
  setGuidedStep: (step: number) => void;

  // Current dataset
  currentDataset: Dataset | null;
  setCurrentDataset: (dataset: Dataset | null) => void;

  // Uploaded data
  uploadedData: Dataset | null;
  setUploadedData: (data: Dataset | null) => void;

  // Backend file ID (for API mode)
  currentFileId: string | null;
  setCurrentFileId: (id: string | null) => void;

  // Selected filters
  selectedState: string;
  setSelectedState: (state: string) => void;
  selectedMetric: string;
  setSelectedMetric: (metric: string) => void;

  // API configuration
  backendUrl: string;
  setBackendUrl: (url: string) => void;
  isBackendConnected: boolean;
  setIsBackendConnected: (connected: boolean) => void;

  // Demo Mode
  isDemoMode: boolean;
  setIsDemoMode: (isDemo: boolean) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {


  const [guidedStep, setGuidedStep] = useState(0);

  // Dataset state
  const [currentDataset, setCurrentDataset] = useState<Dataset | null>(null);
  const [uploadedData, setUploadedData] = useState<Dataset | null>(null);

  // Backend file ID
  const [currentFileId, setCurrentFileId] = useState<string | null>(() => {
    return localStorage.getItem('currentFileId');
  });

  // Filter state
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<string>('');

  // Demo mode state
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Backend state
  // Initialize from Environment if available, else localhost
  const [backendUrl, setBackendUrl] = useState<string>(
    import.meta.env.VITE_API_URL || 'http://localhost:8000'
  );
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(() => {
    const saved = localStorage.getItem('isBackendConnected');
    // If we have a file ID, assume we were connected
    return saved !== null ? JSON.parse(saved) : !!localStorage.getItem('currentFileId');
  });


  // Error state for UI feedback
  const [error, setError] = useState<string | null>(null);

  // Hydrate dataset from backend on load if fileId exists
  React.useEffect(() => {
    const hydrateData = async () => {
      // STRICT MODE ENFORCEMENT
      // If we have a file ID, we MUST NOT be in demo mode
      if (currentFileId) {
        if (isDemoMode) setIsDemoMode(false);
      }

      if (currentFileId && !currentDataset && isBackendConnected) {
        try {
          setError(null); // Clear previous errors
          console.log("Hydrating session for:", currentFileId);
          const { apiService } = await import('@/services/api');
          apiService.setBaseUrl(backendUrl);

          // 1. Fetch Schema (Fast)
          const schema = await apiService.getSchema(currentFileId);

          // 2. Fetch Data Preview (Slower)
          const preview = await apiService.getDataPreview(currentFileId, 1000);

          // Map raw data to match Dataset interface (DataPoint)
          // We must ensure 'state' property exists, mapping it from regionColumn
          const mappedData = preview.data.map((row: any) => ({
            ...row,
            state: row[schema.regionColumn || ''] || row['state'] || row['State'] || 'Unknown'
          }));

          const restoredDataset: Dataset = {
            id: currentFileId,
            name: currentFileId,
            description: 'Restored session data',
            type: schema.dataType,
            columns: preview.columns,
            timeColumn: schema.timeColumn || undefined,
            regionColumn: schema.regionColumn || 'Unknown',
            metricColumns: schema.metricColumns,
            data: mappedData
          };

          setCurrentDataset(restoredDataset);
          setUploadedData(restoredDataset);
          console.log("Session hydrated successfully.");

        } catch (err: any) {
          console.error("Failed to restore session:", err);
          const errorMessage = err.message || "Failed to restore session";
          setError(errorMessage);

          // Clear session data but keep ID briefly so UI can show error, 
          // OR clear ID but show global toast? 
          // Let's clear ID to prevent infinite loops, but save error.
          setCurrentFileId(null);
          setCurrentDataset(null);
          setUploadedData(null);

          // Use alert for immediate feedback since we don't have a toast component ready-wired
          alert(`Session Error: ${errorMessage}. Please re-upload the file.`);
        }
      }
    };

    hydrateData();
  }, [currentFileId, isBackendConnected, backendUrl]); // Removed currentDataset form dep array to avoid loops

  React.useEffect(() => {
    localStorage.setItem('currentFileId', currentFileId || '');
  }, [currentFileId]);

  React.useEffect(() => {
    localStorage.setItem('isBackendConnected', JSON.stringify(isBackendConnected));
  }, [isBackendConnected]);

  const value: AppState = {
    guidedStep,
    setGuidedStep,
    currentDataset,
    setCurrentDataset,
    uploadedData,
    setUploadedData,
    currentFileId,
    setCurrentFileId,
    selectedState,
    setSelectedState,
    selectedMetric,
    setSelectedMetric,
    backendUrl,
    setBackendUrl,
    isBackendConnected,
    setIsBackendConnected,
    isDemoMode,
    setIsDemoMode,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppState => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
