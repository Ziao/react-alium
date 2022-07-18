// Holds the actual stores
import { createContext } from "react";

export const AliumContext = createContext<Record<string, any>>({});
AliumContext.displayName = "AliumContext";
