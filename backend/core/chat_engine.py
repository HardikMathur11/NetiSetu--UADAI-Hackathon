import pandas as pd
from typing import List, Dict, Any
import os
import json
import logging
from google import genai

logger = logging.getLogger(__name__)

def generate_chat_response(query: str, df: pd.DataFrame, schema: Dict, stats: List[Dict], filename: str = "") -> str:
    """
    Generate a natural language response to a user question about the dataset.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "I'm sorry, but I cannot process your request because the AI service is not configured (Missing API Key)."

    try:
        client = genai.Client(api_key=api_key)

        # Prepare context
        summary_stats = json.dumps(stats, indent=2)
        columns = ", ".join(df.columns.tolist())
        
        # We'll take a sample of the data to help the AI understand values
        sample_data = df.head(5).to_string(index=False)
        
        prompt = f"""
        You are "Niti", an intelligent AI data assistant for the Government of India.
        Your goal is to answer questions about the provided dataset accurately and concisely.

        DATA CONTEXT:
        - Filename/Topic: "{filename}"
        - Columns: {columns}
        - Total Records: {len(df)}
        - Key Statistics: {summary_stats}
        - Sample Data (first 5 rows):
        {sample_data}

        USER QUESTION: "{query}"

        INSTRUCTIONS:
        1. Answer the question specifically using the provided statistics and data context.
        2. If the user asks for a specific number (e.g., "highest enrollment"), find it in the stats or explain if it's not explicitly there but inferable.
        3. Keep the tone professional, helpful, and "official" yet accessible.
        4. If you cannot answer based on the data provided, perform a polite fallback and explain what data is missing.
        5. Do not hallucinate values.
        
        RESPONSE:
        """

        response = client.models.generate_content(
            model='gemini-3-flash-preview',
            contents=prompt
        )
        
        return response.text.strip()

    except Exception as e:
        logger.error(f"Chat Engine Error: {str(e)}")
        return "I encountered an error while analyzing your question. Please try again."
