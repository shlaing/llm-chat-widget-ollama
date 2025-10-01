import { createRoot } from "react-dom/client";
import ChatWidgetTw from "./App/ChatWidgetTw";

function initChatWidget(config = {}) {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<ChatWidgetTw {...config} />);
}

// Expose global function
window.initChatWidget = initChatWidget;
