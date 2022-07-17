import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { PuyaProvider } from "./lib/puya/provider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <PuyaProvider>
            <App />
        </PuyaProvider>
    </React.StrictMode>
);
