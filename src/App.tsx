import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Default from "./default";
import AdminPage from "./admin";
import Admincv from "./admin/congviec";
import Admin_nang_suat from "./admin/nangsuat";
import Admin_them_nang_suat from "./admin/nangsuat/themnangsuat";
import Admin_them_nang_suat_zm from "./admin/nangsuat/themnangsuatzm";
import Admin_danh_sach_cong_doan from "./admin/get_api_itg/danh_sach_cong_doan";
import Get_API_model_lot from "./admin/get_api_itg/get_model_lot";
import DSdonhangPage from "./admin/get_api_itg/danh_sach_don_hang";
import ChitietLabel from "./admin/get_api_itg/chi_tiet_label";
import Login from "./admin/quantri/login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Default />} />
        <Route path="/danh_sach_tai_khoan" element={<AdminPage />} />
        <Route path="/danh_sach_don_hang" element={<DSdonhangPage />} />
        <Route path="/congviec" element={<Admincv />} />
        <Route path="/du_lieu_nang_suat" element={<Admin_nang_suat />} />
        <Route path="/them_du_lieu_nang_suat" element={<Admin_them_nang_suat />} />
        <Route path="/them_du_lieu_nang_suat_zm" element={<Admin_them_nang_suat_zm />} />
        <Route path="/get_api_itg_model_lot" element={<Get_API_model_lot />} />
        <Route path="/danh_sach_cong_doan" element={<Admin_danh_sach_cong_doan />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chi_tiet_label/:label" element={<ChitietLabel />} />       
      </Routes>
    </Router>
  );
}

export default App;
