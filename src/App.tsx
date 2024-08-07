import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AdminPage from "./admin";
import Admincv from "./admin/congviec";
import Admin_nang_suat from "./admin/nangsuat";
import Admin_them_nang_suat from "./admin/nangsuat/themnangsuat";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminPage />} />
        <Route path="/congviec" element={<Admincv />} />
        <Route path="/du_lieu_nang_suat" element={<Admin_nang_suat />} />
        <Route path="/them_du_lieu_nang_suat" element={<Admin_them_nang_suat />} />
      </Routes>
    </Router>
  );
}

export default App;
