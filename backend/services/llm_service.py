import httpx
from typing import List, Dict

class LLMService:
    def __init__(self):
        # Default Ollama local endpoint
        self.ollama_url = "http://localhost:11434/api/generate"
        self.model = "llama3" # You can switch this to phi3 or mistral if needed

    async def generate_response(self, prompt: str, system_prompt: str = "") -> str:
        """
        Calls the local Ollama model to generate a response.
        """
        full_prompt = f"System: {system_prompt}\n\nUser: {prompt}" if system_prompt else prompt
        
        payload = {
            "model": self.model,
            "prompt": full_prompt,
            "stream": False
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(self.ollama_url, json=payload, timeout=60.0)
                response.raise_for_status()
                data = response.json()
                return data.get("response", "")
        except httpx.ConnectError:
            print("Error: Could not connect to Ollama. Make sure Ollama is running locally.")
            return "Error: Local LLM is unreachable. Please ensure Ollama is running."
        except Exception as e:
            print(f"Error calling LLM: {e}")
            return f"Error calling local LLM: {str(e)}"

llm_service = LLMService()
