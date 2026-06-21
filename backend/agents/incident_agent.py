from services.llm_service import llm_service
from memory.parcle_client import parcle_client
from typing import Dict, Any

class IncidentAgent:
    async def process_incident(self, error_message: str, context: str = "") -> Dict[str, Any]:
        """
        Analyzes an incident, generates a root cause and probable fix,
        and stores it in Parcle.
        """
        prompt = f"Analyze the following engineering incident/error.\n\nError: {error_message}\nContext: {context}\n\nProvide a short root cause and a probable resolution. Format as JSON with keys: root_cause, resolution."
        system_prompt = "You are an expert DevOps engineer. Always respond in strictly valid JSON format with keys 'root_cause' and 'resolution'."
        
        response_text = await llm_service.generate_response(prompt, system_prompt)
        
        # Simple extraction logic (in production we'd use robust JSON parsing)
        import json
        import re
        
        root_cause = "Unknown"
        resolution = "Unknown"
        
        try:
            # Extract JSON block if it's wrapped in markdown
            match = re.search(r'\{.*\}', response_text.replace('\n', ' '))
            if match:
                parsed = json.loads(match.group(0))
                root_cause = parsed.get("root_cause", "Unknown")
                resolution = parsed.get("resolution", "Unknown")
            else:
                parsed = json.loads(response_text)
                root_cause = parsed.get("root_cause", "Unknown")
                resolution = parsed.get("resolution", "Unknown")
        except Exception:
            # Fallback if LLM doesn't return pure JSON
            root_cause = "Could not parse root cause from LLM."
            resolution = response_text
            
        memory_data = {
            "type": "incident",
            "title": error_message[:50] + "..." if len(error_message) > 50 else error_message,
            "error_message": error_message,
            "context": context,
            "root_cause": root_cause,
            "resolution": resolution
        }
        
        await parcle_client.store_memory(memory_data)
        return memory_data

    async def search_incidents(self, error_message: str) -> list:
        """
        Searches memory for similar incidents to suggest fixes.
        """
        return await parcle_client.search_memory(error_message, memory_type="incident")

incident_agent = IncidentAgent()
