// Content Script for CoOperate Saathi
// Extracts page title, URL, domain, headings, and body text, returning them to the popup or background worker.

console.log("[CoOperate Saathi] Content script injected and active.");

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "EXTRACT_PAGE") {
    try {
      const title = document.title || "Untitled Page";
      const url = window.location.href || "";
      const domain = window.location.hostname || "";
      
      // Extract headings
      const headingElements = Array.from(document.querySelectorAll("h1, h2, h3"));
      const headings = headingElements
        .map((el) => el.textContent?.trim() || "")
        .filter(Boolean)
        .slice(0, 50); // limit to top 50 headings for brevity

      // Extract meta description
      const metaDescEl = document.querySelector('meta[name="description"]');
      const metaDescription = metaDescEl ? metaDescEl.getAttribute("content")?.trim() || "" : "";

      const bodyText = document.body ? document.body.innerText.trim() : "";
      // Append meta description to content if it exists
      const content = metaDescription ? `Meta Description: ${metaDescription}\n\n${bodyText}` : bodyText;

      console.log("[CoOperate Saathi] Scraper triggered:", { title, url, domain, headingsCount: headings.length });

      sendResponse({
        success: true,
        data: {
          title,
          url,
          domain,
          headings,
          content
        }
      });
    } catch (error) {
      console.error("[CoOperate Saathi] Failed to scrape page details:", error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  return true; // Keep message channel open for sendResponse
});
