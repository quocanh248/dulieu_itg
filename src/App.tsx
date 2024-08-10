import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AdminPage from "./admin";
import Admincv from "./admin/congviec";
import Admin_nang_suat from "./admin/nangsuat";
import Admin_them_nang_suat from "./admin/nangsuat/themnangsuat";
import Admin_danh_sach_cong_doan from "./admin/get_api_itg/danh_sach_cong_doan";
import Get_API_model_lot from "./admin/get_api_itg/get_model_lot";
import ChitietLabel from "./admin/get_api_itg/chi_tiet_label";
import Danh_sach_thiet_bi from "./admin/thietbi/barcode_thietbi";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminPage />} />
        <Route path="/congviec" element={<Admincv />} />
        <Route path="/du_lieu_nang_suat" element={<Admin_nang_suat />} />
        <Route path="/them_du_lieu_nang_suat" element={<Admin_them_nang_suat />} />
        <Route path="/get_api_itg_model_lot" element={<Get_API_model_lot />} />
        <Route path="/danh_sach_cong_doan" element={<Admin_danh_sach_cong_doan />} />
        <Route path="/chi_tiet_label/:label" element={<ChitietLabel />} />
        <Route path="/danh_sach_thiet_bi" element={<Danh_sach_thiet_bi />} />
      </Routes>
    </Router>
  );
}

export default App;
