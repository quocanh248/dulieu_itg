import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AdminPage from "./admin";
import Admincv from "./admin/congviec";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminPage />} />
        <Route path="/congviec" element={<Admincv />} />
      </Routes>
    </Router>
  );
}

export default App;
