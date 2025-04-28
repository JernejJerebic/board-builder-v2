import React from "react";
import "./DevChangeBar.css";

const DevChangeBar: React.FC = () => (
  <div
    style={{
      background: "#f59e42",
      color: "#222",
      padding: "8px 0",
      textAlign: "center",
      fontWeight: "bold",
      zIndex: 1000,
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      overflow: "hidden",
      borderBottom: "2px solid #d97706",
    }}
    className="dev-change-bar"
    role="alert"
    aria-live="polite"
  >
    <div
      style={{
        display: "inline-block",
        whiteSpace: "nowrap",
        animation: "scroll 20s linear infinite",
      }}
    >
      Last dev change: Forced all borders in dark mode to use border-gray-700 (rgb(55 65 81))
    </div>
  </div>
);

export default DevChangeBar; 