from services.llm_service import llm_service
from memory.parcle_client import parcle_client

class PageIngestor:
    async def process_and_store(self, title: str, url: str, content: str) -> bool:
        """
        Cleans, summarizes the content using the LLM, and stores it in Parcle memory.
        """
        prompt = f"Summarize the following documentation page for an engineering memory store. Extract key points.\n\nTitle: {title}\nURL: {url}\nContent: {content[:4000]}"
        system_prompt = "You are an expert technical writer. Summarize the documentation concisely."
        
        summary = await llm_service.generate_response(prompt, system_prompt)
        
        memory_data = {
            "type": "documentation",
            "title": title,
            "url": url,
            "content": content,
            "summary": summary
        }
        
        success = await parcle_client.store_memory(memory_data)
        return success

page_ingestor = PageIngestor()
