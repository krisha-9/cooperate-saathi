// Background Service Worker for CoOperate Saathi

console.log("[CoOperate Saathi] Background Service Worker initialized.");

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("[CoOperate Saathi] Extension installed for the first time.");
  } else if (details.reason === "update") {
    console.log("[CoOperate Saathi] Extension updated to version:", chrome.runtime.getManifest().version);
  }
});
