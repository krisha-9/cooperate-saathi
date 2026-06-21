import os
import httpx
from typing import Dict, Any, List

class ParcleClient:
    def __init__(self):
        self.api_key = os.getenv("PARCLE_API_KEY", "pmem_cLByx08ts19e49mZ-wJIcMuvEAbLPjNLXqITd0zKAHM")
        # NOTE: Using a placeholder API URL since Parcle documentation is not standard.
        # This can be adjusted if there's a specific endpoint URL for Parcle.
        self.base_url = os.getenv("PARCLE_API_URL", "https://api.parcle.io/v1")
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # Fallback to an in-memory dictionary if the API is unreachable (useful for hackathon offline testing)
        self.local_memory_store = []

    async def store_memory(self, memory_data: Dict[str, Any]) -> bool:
        """
        Stores documentation or incident into Parcle memory.
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/memory",
                    headers=self.headers,
                    json=memory_data,
                    timeout=5.0
                )
                response.raise_for_status()
                return True
        except Exception as e:
            print(f"Warning: Failed to call Parcle API ({e}). Saving to local fallback memory.")
            self.local_memory_store.append(memory_data)
            return True

    async def search_memory(self, query: str, memory_type: str = None) -> List[Dict[str, Any]]:
        """
        Searches memory using semantic similarity via Parcle.
        """
        try:
            payload = {"query": query}
            if memory_type:
                payload["type"] = memory_type
                
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/search",
                    headers=self.headers,
                    json=payload,
                    timeout=5.0
                )
                response.raise_for_status()
                return response.json().get("results", [])
        except Exception as e:
            print(f"Warning: Failed to call Parcle API ({e}). Searching local fallback memory.")
            results = []
            query_lower = query.lower()
            for mem in self.local_memory_store:
                if memory_type and mem.get("type") != memory_type:
                    continue
                # Simple keyword match for the local fallback
                content_str = str(mem).lower()
                if any(word in content_str for word in query_lower.split()):
                    results.append(mem)
            return results

parcle_client = ParcleClient()
