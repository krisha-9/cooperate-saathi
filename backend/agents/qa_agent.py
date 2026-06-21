from services.llm_service import llm_service
from memory.parcle_client import parcle_client

class QAAgent:
    async def answer_question(self, question: str) -> str:
        """
        Searches Parcle for context and answers the user's question.
        """
        # Retrieve context from memory
        results = await parcle_client.search_memory(question, memory_type="documentation")
        
        context_texts = []
        for res in results:
            context_texts.append(f"Title: {res.get('title')}\nSummary: {res.get('summary', res.get('content'))}")
            
        context_block = "\n\n".join(context_texts)
        if not context_block:
            context_block = "No relevant documentation found in memory."
            
        prompt = f"Context from Memory:\n{context_block}\n\nUser Question: {question}\n\nAnswer the user's question based on the context above. If the context does not have the answer, use your general engineering knowledge but specify that it's not in the memory."
        system_prompt = "You are an expert engineering assistant called CoOperate Saathi. You answer technical questions accurately and concisely."
        
        answer = await llm_service.generate_response(prompt, system_prompt)
        return answer

qa_agent = QAAgent()
