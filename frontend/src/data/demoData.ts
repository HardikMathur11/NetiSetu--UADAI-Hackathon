// Demo datasets simulating UIDAI-style public statistics
// These are completely synthetic and for demonstration purposes only

export interface DataPoint {
  year?: number;
  month?: string;
  state: string;
  enrollments?: number;
  authentications?: number;
  coverage?: number;
  updates?: number;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  type: 'TIME_SERIES' | 'SNAPSHOT';
  columns: string[];
  data: DataPoint[];
  timeColumn?: string;
  regionColumn: string;
  metricColumns: string[];
}

// State-wise Aadhaar Enrollment Trends (2018-2024) - TIME_SERIES
export const enrollmentTrendsData: Dataset = {
  id: 'enrollment_trends',
  name: 'State-wise Aadhaar Enrollment Trends',
  description: 'Annual enrollment statistics across major states from 2018-2024',
  type: 'TIME_SERIES',
  columns: ['year', 'state', 'enrollments'],
  timeColumn: 'year',
  regionColumn: 'state',
  metricColumns: ['enrollments'],
  data: [
    // Uttar Pradesh
    { year: 2018, state: 'Uttar Pradesh', enrollments: 185000000 },
    { year: 2019, state: 'Uttar Pradesh', enrollments: 192000000 },
    { year: 2020, state: 'Uttar Pradesh', enrollments: 195000000 },
    { year: 2021, state: 'Uttar Pradesh', enrollments: 201000000 },
    { year: 2022, state: 'Uttar Pradesh', enrollments: 210000000 },
    { year: 2023, state: 'Uttar Pradesh', enrollments: 218000000 },
    { year: 2024, state: 'Uttar Pradesh', enrollments: 225000000 },
    // Maharashtra
    { year: 2018, state: 'Maharashtra', enrollments: 102000000 },
    { year: 2019, state: 'Maharashtra', enrollments: 108000000 },
    { year: 2020, state: 'Maharashtra', enrollments: 110000000 },
    { year: 2021, state: 'Maharashtra', enrollments: 115000000 },
    { year: 2022, state: 'Maharashtra', enrollments: 120000000 },
    { year: 2023, state: 'Maharashtra', enrollments: 125000000 },
    { year: 2024, state: 'Maharashtra', enrollments: 130000000 },
    // Bihar
    { year: 2018, state: 'Bihar', enrollments: 78000000 },
    { year: 2019, state: 'Bihar', enrollments: 85000000 },
    { year: 2020, state: 'Bihar', enrollments: 90000000 },
    { year: 2021, state: 'Bihar', enrollments: 98000000 },
    { year: 2022, state: 'Bihar', enrollments: 108000000 },
    { year: 2023, state: 'Bihar', enrollments: 118000000 },
    { year: 2024, state: 'Bihar', enrollments: 125000000 },
    // West Bengal
    { year: 2018, state: 'West Bengal', enrollments: 75000000 },
    { year: 2019, state: 'West Bengal', enrollments: 79000000 },
    { year: 2020, state: 'West Bengal', enrollments: 82000000 },
    { year: 2021, state: 'West Bengal', enrollments: 86000000 },
    { year: 2022, state: 'West Bengal', enrollments: 90000000 },
    { year: 2023, state: 'West Bengal', enrollments: 93000000 },
    { year: 2024, state: 'West Bengal', enrollments: 96000000 },
    // Tamil Nadu
    { year: 2018, state: 'Tamil Nadu', enrollments: 68000000 },
    { year: 2019, state: 'Tamil Nadu', enrollments: 70000000 },
    { year: 2020, state: 'Tamil Nadu', enrollments: 72000000 },
    { year: 2021, state: 'Tamil Nadu', enrollments: 74000000 },
    { year: 2022, state: 'Tamil Nadu', enrollments: 76000000 },
    { year: 2023, state: 'Tamil Nadu', enrollments: 78000000 },
    { year: 2024, state: 'Tamil Nadu', enrollments: 80000000 },
    // Rajasthan
    { year: 2018, state: 'Rajasthan', enrollments: 62000000 },
    { year: 2019, state: 'Rajasthan', enrollments: 65000000 },
    { year: 2020, state: 'Rajasthan', enrollments: 67000000 },
    { year: 2021, state: 'Rajasthan', enrollments: 70000000 },
    { year: 2022, state: 'Rajasthan', enrollments: 73000000 },
    { year: 2023, state: 'Rajasthan', enrollments: 76000000 },
    { year: 2024, state: 'Rajasthan', enrollments: 79000000 },
  ],
};

// Monthly Authentication Volumes (24 months) - TIME_SERIES
export const authenticationData: Dataset = {
  id: 'authentication_volumes',
  name: 'Monthly Authentication Volumes',
  description: 'National authentication transaction volumes over 24 months',
  type: 'TIME_SERIES',
  columns: ['month', 'state', 'authentications'],
  timeColumn: 'month',
  regionColumn: 'state',
  metricColumns: ['authentications'],
  data: [
    { month: 'Jan 2023', state: 'National', authentications: 2100000000 },
    { month: 'Feb 2023', state: 'National', authentications: 2050000000 },
    { month: 'Mar 2023', state: 'National', authentications: 2300000000 },
    { month: 'Apr 2023', state: 'National', authentications: 2250000000 },
    { month: 'May 2023', state: 'National', authentications: 2400000000 },
    { month: 'Jun 2023', state: 'National', authentications: 2350000000 },
    { month: 'Jul 2023', state: 'National', authentications: 2500000000 },
    { month: 'Aug 2023', state: 'National', authentications: 2450000000 },
    { month: 'Sep 2023', state: 'National', authentications: 2600000000 },
    { month: 'Oct 2023', state: 'National', authentications: 2700000000 },
    { month: 'Nov 2023', state: 'National', authentications: 2650000000 },
    { month: 'Dec 2023', state: 'National', authentications: 2800000000 },
    { month: 'Jan 2024', state: 'National', authentications: 2750000000 },
    { month: 'Feb 2024', state: 'National', authentications: 2700000000 },
    { month: 'Mar 2024', state: 'National', authentications: 2950000000 },
    { month: 'Apr 2024', state: 'National', authentications: 2900000000 },
    { month: 'May 2024', state: 'National', authentications: 3100000000 },
    { month: 'Jun 2024', state: 'National', authentications: 3050000000 },
    { month: 'Jul 2024', state: 'National', authentications: 3200000000 },
    { month: 'Aug 2024', state: 'National', authentications: 3150000000 },
    { month: 'Sep 2024', state: 'National', authentications: 3350000000 },
    { month: 'Oct 2024', state: 'National', authentications: 3500000000 },
    { month: 'Nov 2024', state: 'National', authentications: 3450000000 },
    { month: 'Dec 2024', state: 'National', authentications: 3600000000 },
  ],
};

// Regional Coverage Statistics (SNAPSHOT - no time series)
export const coverageSnapshotData: Dataset = {
  id: 'coverage_snapshot',
  name: 'Regional Coverage Statistics',
  description: 'Current Aadhaar coverage percentage by state (latest snapshot)',
  type: 'SNAPSHOT',
  columns: ['state', 'coverage', 'enrollments', 'updates'],
  regionColumn: 'state',
  metricColumns: ['coverage', 'enrollments', 'updates'],
  data: [
    { state: 'Uttar Pradesh', coverage: 98.5, enrollments: 225000000, updates: 45000000 },
    { state: 'Maharashtra', coverage: 99.2, enrollments: 130000000, updates: 28000000 },
    { state: 'Bihar', coverage: 95.8, enrollments: 125000000, updates: 22000000 },
    { state: 'West Bengal', coverage: 97.1, enrollments: 96000000, updates: 18000000 },
    { state: 'Tamil Nadu', coverage: 99.5, enrollments: 80000000, updates: 16000000 },
    { state: 'Rajasthan', coverage: 98.8, enrollments: 79000000, updates: 15000000 },
    { state: 'Karnataka', coverage: 99.3, enrollments: 68000000, updates: 14000000 },
    { state: 'Gujarat', coverage: 99.1, enrollments: 65000000, updates: 13000000 },
    { state: 'Andhra Pradesh', coverage: 99.4, enrollments: 52000000, updates: 11000000 },
    { state: 'Madhya Pradesh', coverage: 97.6, enrollments: 78000000, updates: 14000000 },
    { state: 'Kerala', coverage: 99.8, enrollments: 35000000, updates: 8000000 },
    { state: 'Telangana', coverage: 99.6, enrollments: 38000000, updates: 8500000 },
    { state: 'Odisha', coverage: 96.2, enrollments: 42000000, updates: 7500000 },
    { state: 'Jharkhand', coverage: 94.5, enrollments: 32000000, updates: 5500000 },
    { state: 'Assam', coverage: 92.3, enrollments: 30000000, updates: 4800000 },
    { state: 'Punjab', coverage: 99.0, enrollments: 29000000, updates: 6000000 },
  ],
};

// All demo datasets
export const allDemoDatasets: Dataset[] = [
  enrollmentTrendsData,
  authenticationData,
  coverageSnapshotData,
];

// Helper to get a dataset by ID
export const getDatasetById = (id: string): Dataset | undefined => {
  return allDemoDatasets.find((d) => d.id === id);
};

// Calculate summary statistics for a dataset
export interface SummaryStats {
  count: number;
  min: number;
  max: number;
  mean: number;
  sum: number;
  growthRate?: number;
}

export const calculateStats = (data: number[]): SummaryStats => {
  const count = data.length;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const sum = data.reduce((a, b) => a + b, 0);
  const mean = sum / count;

  // Calculate growth rate if we have at least 2 points
  let growthRate: number | undefined;
  if (count >= 2) {
    const first = data[0];
    const last = data[count - 1];
    growthRate = ((last - first) / first) * 100;
  }

  return { count, min, max, mean, sum, growthRate };
};

// Simple linear regression for prediction
export interface PredictionResult {
  predictions: { period: string; value: number }[];
  slope: number;
  intercept: number;
  r2: number;
  canPredict: boolean;
  reason?: string;
}

export const linearRegression = (
  timeValues: number[],
  metricValues: number[],
  periodsToPredict: number = 6
): PredictionResult => {
  const n = timeValues.length;

  // Check minimum data points
  if (n < 6) {
    return {
      predictions: [],
      slope: 0,
      intercept: 0,
      r2: 0,
      canPredict: false,
      reason: `Prediction requires at least 6 data points. Current dataset has only ${n} points.`,
    };
  }

  // Calculate means
  const meanX = timeValues.reduce((a, b) => a + b, 0) / n;
  const meanY = metricValues.reduce((a, b) => a + b, 0) / n;

  // Calculate slope and intercept
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (timeValues[i] - meanX) * (metricValues[i] - meanY);
    denominator += (timeValues[i] - meanX) ** 2;
  }

  const slope = numerator / denominator;
  const intercept = meanY - slope * meanX;

  // Calculate R²
  let ssRes = 0;
  let ssTot = 0;

  for (let i = 0; i < n; i++) {
    const predicted = slope * timeValues[i] + intercept;
    ssRes += (metricValues[i] - predicted) ** 2;
    ssTot += (metricValues[i] - meanY) ** 2;
  }

  const r2 = 1 - ssRes / ssTot;

  // Generate predictions
  const lastTime = timeValues[n - 1];
  const predictions = [];

  for (let i = 1; i <= periodsToPredict; i++) {
    const nextTime = lastTime + i;
    const predictedValue = slope * nextTime + intercept;
    predictions.push({
      period: `Period ${nextTime}`,
      value: Math.max(0, predictedValue), // Ensure non-negative
    });
  }

  return {
    predictions,
    slope,
    intercept,
    r2,
    canPredict: true,
  };
};

// Policy rules
export interface PolicyRecommendation {
  id: string;
  title: string;
  description: string;
  triggerCondition: string;
  expectedImpact: string;
  confidence: 'high' | 'medium' | 'low';
  category: 'growth' | 'infrastructure' | 'outreach' | 'disparity';
}

export const generatePolicyRecommendations = (
  stats: SummaryStats,
  dataType: 'TIME_SERIES' | 'SNAPSHOT',
  regionalData?: { state: string; value: number }[]
): PolicyRecommendation[] => {
  const recommendations: PolicyRecommendation[] = [];

  // Growth-based recommendations (for time series)
  if (dataType === 'TIME_SERIES' && stats.growthRate !== undefined) {
    if (stats.growthRate < -5) {
      recommendations.push({
        id: 'declining_growth',
        title: 'Launch Awareness Campaign',
        description: 'Declining trend detected. Recommend targeted awareness and outreach programs to reverse the decline.',
        triggerCondition: `Growth rate is ${stats.growthRate.toFixed(1)}% (declining by more than 5%)`,
        expectedImpact: 'Stabilize and increase adoption rates within 6-12 months',
        confidence: 'high',
        category: 'outreach',
      });
    } else if (stats.growthRate > 25) {
      recommendations.push({
        id: 'rapid_growth',
        title: 'Scale Infrastructure',
        description: 'Rapid growth detected. Recommend infrastructure scaling to handle increased demand.',
        triggerCondition: `Growth rate is ${stats.growthRate.toFixed(1)}% (exceeding 25% threshold)`,
        expectedImpact: 'Prevent service disruptions and maintain quality of service',
        confidence: 'high',
        category: 'infrastructure',
      });
    } else if (stats.growthRate >= 0 && stats.growthRate <= 5) {
      recommendations.push({
        id: 'stagnant_growth',
        title: 'Review Engagement Strategy',
        description: 'Growth has plateaued. Consider reviewing engagement strategies to identify barriers.',
        triggerCondition: `Growth rate is ${stats.growthRate.toFixed(1)}% (between 0-5%)`,
        expectedImpact: 'Identify and address bottlenecks to resume healthy growth',
        confidence: 'medium',
        category: 'outreach',
      });
    }
  }

  // Regional disparity recommendations
  if (regionalData && regionalData.length > 1) {
    const values = regionalData.map((r) => r.value);
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);
    const disparity = maxVal / minVal;

    if (disparity > 2) {
      const highestRegion = regionalData.find((r) => r.value === maxVal)?.state;
      const lowestRegion = regionalData.find((r) => r.value === minVal)?.state;

      recommendations.push({
        id: 'regional_disparity',
        title: 'Address Regional Disparity',
        description: `Significant disparity detected between regions. ${lowestRegion} shows considerably lower metrics compared to ${highestRegion}.`,
        triggerCondition: `Disparity ratio is ${disparity.toFixed(1)}x (exceeds 2x threshold)`,
        expectedImpact: 'Balanced regional development and equitable service access',
        confidence: 'high',
        category: 'disparity',
      });
    }
  }

  // Volume-based recommendations
  if (stats.mean > 1000000000) {
    recommendations.push({
      id: 'high_volume',
      title: 'Ensure System Resilience',
      description: 'High transaction volumes detected. Recommend regular stress testing and redundancy measures.',
      triggerCondition: `Average volume exceeds 1 billion transactions`,
      expectedImpact: 'Maintain 99.9% uptime and service reliability',
      confidence: 'medium',
      category: 'infrastructure',
    });
  }

  // Add a default recommendation if none triggered
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'maintain_status',
      title: 'Maintain Current Strategy',
      description: 'Metrics are within expected ranges. Continue monitoring and maintain current operational strategies.',
      triggerCondition: 'All metrics within normal parameters',
      expectedImpact: 'Sustained stable performance',
      confidence: 'medium',
      category: 'growth',
    });
  }

  return recommendations;
};
