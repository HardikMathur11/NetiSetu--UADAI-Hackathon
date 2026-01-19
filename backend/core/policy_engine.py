from typing import List, Dict
import pandas as pd
from google import genai
import os
import json
import logging

logger = logging.getLogger(__name__)

# --- Rule-Based Engine (Legacy) ---

def generate_policy_recommendations(df: pd.DataFrame, schema: Dict, stats: List[Dict]) -> List[Dict]:
    """Generate rule-based policy recommendations"""
    recommendations = []
    
    # Analyze growth trends
    if schema.get('timeColumn') and len(schema.get('metricColumns', [])) > 0:
        metric_col = schema['metricColumns'][0]
        values = df[metric_col].tolist()
        
        if len(values) >= 2:
            recent_growth = ((values[-1] - values[-2]) / values[-2]) * 100 if values[-2] != 0 else 0
            
            # Rule 1: Declining growth
            if recent_growth < -10:
                recommendations.append({
                    "id": "awareness-campaign",
                    "title": "Launch Awareness Campaign",
                    "description": "Recent decline in metrics suggests need for public outreach and awareness programs.",
                    "trigger": f"Recent growth rate: {recent_growth:.1f}% (below -10% threshold)",
                    "expectedImpact": "10-15% improvement in adoption rates within 6 months",
                    "confidence": "high",
                    "confidenceReason": "Strong correlation between awareness campaigns and adoption in historical data",
                    "category": "outreach"
                })
            
            # Rule 2: Rapid growth
            if recent_growth > 25:
                recommendations.append({
                    "id": "infrastructure-scaling",
                    "title": "Scale Infrastructure Capacity",
                    "description": "Rapid growth in demand requires proactive infrastructure expansion.",
                    "trigger": f"Growth rate: {recent_growth:.1f}% (above 25% threshold)",
                    "expectedImpact": "Prevent service disruptions, maintain 99.9% uptime",
                    "confidence": "high",
                    "confidenceReason": "Clear trend with high data completeness",
                    "category": "infrastructure"
                })
            
            # Rule 3: Moderate steady growth
            if 5 <= recent_growth <= 25:
                recommendations.append({
                    "id": "optimization",
                    "title": "Optimize Current Operations",
                    "description": "Steady growth allows focus on process optimization and efficiency improvements.",
                    "trigger": f"Stable growth: {recent_growth:.1f}% within normal range",
                    "expectedImpact": "15-20% cost reduction through efficiency gains",
                    "confidence": "medium",
                    "confidenceReason": "Trend is stable but external factors may influence",
                    "category": "operations"
                })
    
    # Regional disparity analysis
    if schema.get('regionColumn') and len(schema.get('metricColumns', [])) > 0:
        metric_col = schema['metricColumns'][0]
        region_col = schema['regionColumn']
        
        region_stats = df.groupby(region_col)[metric_col].mean()
        if len(region_stats) > 1:
            max_val = region_stats.max()
            min_val = region_stats.min()
            
            if min_val > 0 and max_val / min_val > 2:
                recommendations.append({
                    "id": "regional-intervention",
                    "title": "Targeted Regional Intervention",
                    "description": "Significant disparity between regions requires targeted support for underperforming areas.",
                    "trigger": f"Regional variance ratio: {max_val/min_val:.1f}x (above 2x threshold)",
                    "expectedImpact": "Reduce regional disparity by 30% within 12 months",
                    "confidence": "high",
                    "confidenceReason": "Clear regional patterns with sufficient data points",
                    "category": "equity"
                })
    
    # Default recommendation if none triggered
    if len(recommendations) == 0:
        recommendations.append({
            "id": "continue-monitoring",
            "title": "Continue Current Strategy",
            "description": "Current metrics are within expected ranges. Maintain monitoring and existing programs.",
            "trigger": "All metrics within normal parameters",
            "expectedImpact": "Sustained performance with minimal intervention",
            "confidence": "medium",
            "confidenceReason": "Stable patterns but recommend continued observation",
            "category": "monitoring"
        })
    
    return recommendations

# --- AI-Powered Engine (Gemini) ---

def generate_ai_recommendations(df: pd.DataFrame, schema: Dict, stats: List[Dict], filename: str = "") -> List[Dict]:
    """
    Generate policy recommendations using Google's GenAI SDK.
    Fallback to rule-based engine if API key is missing or call fails.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.warning("GEMINI_API_KEY not found. Fallback to rule-based.")
        return generate_policy_recommendations(df, schema, stats)

    try:
        # Initialize the new Client
        client = genai.Client(api_key=api_key)

        # Prepare context for AI
        summary_stats = json.dumps(stats, indent=2)
        columns = ", ".join(df.columns.tolist())
        row_count = len(df)
        
        prompt = f"""
        You are a highly experienced Senior Policy Analyst for the Government.
        Analyze the following dataset statistics and generate significantly relevant policy recommendations (between 1 to 5 items depending on the data's criticality).

        CRITICAL INSTRUCTION: Write in simple, clear language that a non-technical decision maker can understand immediately. Avoid complex jargon.

        DATA CONTEXT:
        - Filename/Topic: "{filename}" (Use this to infer the domain context, e.g., 'authotp' -> 'Aadhaar Authentication One-Time Password System')
        - Columns: {columns}
        - Total Records: {row_count}
        - Data Schema: {json.dumps(schema)}
        - Key Statistics: {summary_stats}

        INSTRUCTIONS:
        1. FIRST, INFER THE CONTEXT: Based on the filename "{filename}" and columns, understand what real-world government system this data represents.
        2. STRUCTURE YOUR "description" FIELD AS FOLLOWS:
           - First, explain the REASON (Define the context + observed pattern). **Example: "In the context of OTP-based authentication (authotp), the data reveals a 15% drop..."**
           - Second, provide the SUGGESTION (the specific action to take).
           - Do not label them "Reason:" or "Suggestion:", just flow the text naturally.
        3. Identify critical trends or insights (e.g., rapid decline, regional disparity, high volatility).
        4. Estimate the expected impact clearly.
        5. Assign a confidence level (high/medium/low) based on data quality.

        OUTPUT FORMAT (Strict JSON Array):
        [
            {{
                "id": "unique-id-1",
                "title": "Short, Punchy Policy Title",
                "description": "Start with the observation/reason, then follow with the concrete recommendation.",
                "trigger": "The specific data point that triggered this (e.g., 'Growth dropped by 15%')",
                "expectedImpact": "Quantifiable outcome (e.g., 'Recover 5% growth')",
                "confidence": "high",
                "confidenceReason": "Why you are confident",
                "category": "infrastructure/outreach/operations/financial",
                "isAiGenerated": true
            }}
        ]
        """

        # Using the new SDK methodology
        response = client.models.generate_content(
            model='gemini-3-flash-preview',
            contents=prompt
        )
        text_response = response.text.strip()

        # Debug output for user
        print("\n=== GEMINI AI RESPONSE ===")
        print(text_response)
        print("==========================\n")
        
        # Clean up JSON if wrapped in markdown
        if text_response.startswith("```json"):
            text_response = text_response.replace("```json", "").replace("```", "")
        
        recommendations = json.loads(text_response)
        
        # Ensure isAiGenerated flag is present for frontend badge
        for rec in recommendations:
            rec['isAiGenerated'] = True
            
        return recommendations

    except Exception as e:
        logger.error(f"Gemini API Error: {str(e)}")
        # Graceful fallback
        return generate_policy_recommendations(df, schema, stats)
