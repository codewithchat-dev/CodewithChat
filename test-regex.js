const content = `
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
`;

const fromRegex = /\b(?:import|export)\s+(?:type\s+)?[\s\S]*?\s+from\s+['"]([^'"]+)['"]/g;
let match;
while ((match = fromRegex.exec(content)) !== null) {
  console.log("MATCH:", match[1]);
}
