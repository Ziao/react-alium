import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AliumProvider } from "./lib/alium/provider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <AliumProvider>
            <App />
        </AliumProvider>
    </React.StrictMode>
);
