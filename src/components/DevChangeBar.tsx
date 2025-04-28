import React from "react";
import "./DevChangeBar.css";

const DevChangeBar: React.FC = () => {
  const timestamp = new Date().toLocaleString();

  return (
    <div
      style={{
        background: "#ef4444",
        color: "#fff",
        padding: "8px 0",
        textAlign: "center",
        fontWeight: "bold",
        zIndex: 1000,
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        overflow: "hidden",
        borderBottom: "2px solid #dc2626",
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
        LAST COMMIT DONE ON {timestamp}
      </div>
    </div>
  );
};

export default DevChangeBar; 