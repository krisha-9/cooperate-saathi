import React, { useState } from "react";
import { Layout } from "../components/layout/Layout";
import { Home } from "./Home";
import { CapturePage } from "./CapturePage";
import { AskSaathi } from "./AskSaathi";
import { IncidentSearch } from "./IncidentSearch";
import { MemoryVault } from "./MemoryVault";
import { Settings } from "./Settings";

export const Popup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("home");

  const renderView = () => {
    switch (activeTab) {
      case "home":
        return <Home setActiveTab={setActiveTab} />;
      case "capture":
        return <CapturePage />;
      case "ask":
        return <AskSaathi />;
      case "search":
        return <IncidentSearch />;
      case "vault":
        return <MemoryVault />;
      case "settings":
        return <Settings />;
      default:
        return <Home setActiveTab={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderView()}
    </Layout>
  );
};
