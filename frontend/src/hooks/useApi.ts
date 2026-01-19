import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, UploadResponse, SchemaResponse, TrendResponse, PredictionResponse, PolicyRecommendation, StatsItem, DataPreview } from '@/services/api';
import { useApp } from '@/contexts/AppContext';

/**
 * Hook for checking backend health
 */
export function useBackendHealth() {
  const { backendUrl, setIsBackendConnected } = useApp();

  return useQuery({
    queryKey: ['health', backendUrl],
    queryFn: async () => {
      apiService.setBaseUrl(backendUrl);
      const isHealthy = await apiService.healthCheck();
      setIsBackendConnected(isHealthy);
      return isHealthy;
    },
    refetchInterval: 30000, // Check every 30 seconds
    retry: false,
  });
}

/**
 * Hook for uploading files
 */
export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => apiService.uploadFile(file),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['schema', data.fileId] });
      queryClient.invalidateQueries({ queryKey: ['stats', data.fileId] });
    },
  });
}

/**
 * Hook for getting schema
 */
export function useSchema(fileId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['schema', fileId],
    queryFn: () => apiService.getSchema(fileId!),
    enabled: !!fileId && enabled,
  });
}

/**
 * Hook for getting statistics
 */
export function useStats(fileId: string | null, column?: string, enabled = true) {
  return useQuery({
    queryKey: ['stats', fileId, column],
    queryFn: () => apiService.getStats(fileId!, column),
    enabled: !!fileId && enabled,
  });
}

/**
 * Hook for getting trends
 */
export function useTrends(fileId: string | null, metric?: string, region?: string, enabled = true) {
  return useQuery({
    queryKey: ['trends', fileId, metric, region],
    queryFn: () => apiService.getTrends(fileId!, metric, region),
    enabled: !!fileId && enabled,
  });
}

/**
 * Hook for getting predictions
 */
export function usePredictions(fileId: string | null, metric?: string, periods = 6, enabled = true) {
  return useQuery({
    queryKey: ['predictions', fileId, metric, periods],
    queryFn: () => apiService.getPredictions(fileId!, metric, periods),
    enabled: !!fileId && enabled,
  });
}

/**
 * Hook for getting policy recommendations
 */
export function usePolicies(fileId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['policies', fileId],
    queryFn: () => apiService.getPolicies(fileId!),
    enabled: !!fileId && enabled,
  });
}

/**
 * Hook for getting data preview
 */
export function useDataPreview(fileId: string | null, limit = 100, enabled = true) {
  return useQuery({
    queryKey: ['data', fileId, limit],
    queryFn: () => apiService.getDataPreview(fileId!, limit),
    enabled: !!fileId && enabled,
  });
}

/**
 * Hook for getting regions
 */
export function useRegions(fileId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['regions', fileId],
    queryFn: () => apiService.getRegions(fileId!),
    enabled: !!fileId && enabled,
  });
}
