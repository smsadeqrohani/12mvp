import { createRoot } from "react-dom/client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import "./index.css";
import App from "./App";
import AsyncStorage from "@react-native-async-storage/async-storage";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

// Use AsyncStorage for web (it works in web environments)
const storage = AsyncStorage;

createRoot(document.getElementById("root")!).render(
  <ConvexAuthProvider client={convex} storage={storage}>
    <App />
  </ConvexAuthProvider>
);
