/**
 * UIDAI Analytics API Service
 * Handles all communication with the Python/FastAPI backend
 */

export interface UploadResponse {
  success: boolean;
  message: string;
  fileId: string;
  rowCount: number;
  columnCount: number;
  columns: string[];
}

export interface SchemaResponse {
  timeColumn: string | null;
  regionColumn: string | null;
  metricColumns: string[];
  dataType: 'TIME_SERIES' | 'SNAPSHOT';
  rowCount: number;
  canPredict: boolean;
  predictionReason: string;
}

export interface StatsItem {
  column: string;
  min: number;
  max: number;
  avg: number;
  median: number;
  stdDev: number;
  growthRate: number | null;
  dataPoints: number;
}

export interface TrendDataPoint {
  period: string;
  value: number;
  movingAvg: number | null;
  growthRate: number | null;
}

export interface TrendResponse {
  metric: string;
  region: string | null;
  data: TrendDataPoint[];
}

export interface PredictionPoint {
  period: string;
  value: number;
  lowerBound: number;
  upperBound: number;
}

export interface PredictionResponse {
  canPredict: boolean;
  reason: string;
  r2Score: number | null;
  slope: number | null;
  intercept: number | null;
  historical: { period: string; value: number }[];
  predictions: PredictionPoint[];
}

export interface PolicyRecommendation {
  id: string;
  title: string;
  description: string;
  trigger: string;
  expectedImpact: string;
  confidence: 'high' | 'medium' | 'low';
  confidenceReason: string;
  category: string;
}

export interface DataPreview {
  columns: string[];
  data: Record<string, any>[];
  totalRows: number;
  previewRows: number;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, ''); // Remove trailing slash
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Check if the backend is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Upload a CSV file
   */
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || 'Failed to upload file');
    }

    return response.json();
  }

  /**
   * Get detected schema for uploaded file
   */
  async getSchema(fileId: string): Promise<SchemaResponse> {
    const response = await fetch(`${this.baseUrl}/api/schema/${fileId}`);

    if (!response.ok) {
      throw new Error('Failed to get schema');
    }

    return response.json();
  }

  /**
   * Get summary statistics
   */
  async getStats(fileId: string, column?: string): Promise<{ stats: StatsItem[] }> {
    const url = column
      ? `${this.baseUrl}/api/stats/${fileId}?column=${encodeURIComponent(column)}`
      : `${this.baseUrl}/api/stats/${fileId}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to get statistics');
    }

    return response.json();
  }

  /**
   * Get trend analysis data
   */
  async getTrends(fileId: string, metric?: string, region?: string): Promise<TrendResponse> {
    const params = new URLSearchParams();
    if (metric) params.append('metric', metric);
    if (region && region !== 'all') params.append('region', region);

    const url = `${this.baseUrl}/api/trends/${fileId}${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to get trends');
    }

    return response.json();
  }

  /**
   * Get predictions
   */
  async getPredictions(fileId: string, metric?: string, periods: number = 6): Promise<PredictionResponse> {
    const params = new URLSearchParams();
    if (metric) params.append('metric', metric);
    params.append('periods', periods.toString());

    const url = `${this.baseUrl}/api/predict/${fileId}?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to get predictions');
    }

    return response.json();
  }

  /**
   * Get policy recommendations
   */
  async getPolicies(fileId: string): Promise<{ recommendations: PolicyRecommendation[] }> {
    const response = await fetch(`${this.baseUrl}/api/policies/${fileId}`);

    if (!response.ok) {
      throw new Error('Failed to get policies');
    }

    return response.json();
  }

  /**
   * Get data preview
   */
  async getDataPreview(fileId: string, limit: number = 100): Promise<DataPreview> {
    const response = await fetch(`${this.baseUrl}/api/data/${fileId}?limit=${limit}`);

    if (!response.ok) {
      throw new Error('Failed to get data preview');
    }

    return response.json();
  }

  /**
   * Get unique regions
   */
  async getRegions(fileId: string): Promise<{ regions: string[] }> {
    const response = await fetch(`${this.baseUrl}/api/regions/${fileId}`);

    if (!response.ok) {
      throw new Error('Failed to get regions');
    }

    return response.json();
  }

  /**
   * Chat with the data
   */
  async chatWithData(fileId: string, message: string): Promise<{ response: string }> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileId, message }),
    });

    if (!response.ok) {
      throw new Error('Failed to get chat response');
    }

    return response.json();
  }

  /**
   * Get previous uploads history
   */
  async getHistory(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/api/history`);
    if (!response.ok) throw new Error('Failed to fetch history');
    const data = await response.json();
    return data.history;
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export class for custom instances
export { ApiService };
