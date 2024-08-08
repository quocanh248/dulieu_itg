import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AdminPage from "./admin";
import Admincv from "./admin/congviec";
import Admin_nang_suat from "./admin/nangsuat";
import Admin_them_nang_suat from "./admin/nangsuat/themnangsuat";
import Get_API_model_lot from "./admin/get_api_itg/get_model_lot";
import ChitietLabel from "./admin/get_api_itg/chi_tiet_label";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminPage />} />
        <Route path="/congviec" element={<Admincv />} />
        <Route path="/du_lieu_nang_suat" element={<Admin_nang_suat />} />
        <Route path="/them_du_lieu_nang_suat" element={<Admin_them_nang_suat />} />
        <Route path="/get_api_itg_model_lot" element={<Get_API_model_lot />} />
        <Route path="/chi_tiet_label/:label" element={<ChitietLabel />} />
      </Routes>
    </Router>
  );
}

export default App;
