import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Default from "./default";
import AdminPage from "./admin";
import Admincv from "./admin/line_thietbi";
import Admin_nang_suat from "./admin/nangsuat";
import Admin_them_nang_suat from "./admin/nangsuat/themnangsuat";
import Admin_them_nang_suat_zm from "./admin/nangsuat/themnangsuatzm";
import Admin_danh_sach_cong_doan from "./admin/get_api_itg/danh_sach_cong_doan";
import Get_API_model_lot from "./admin/get_api_itg/get_model_lot";
import DSdonhangPage from "./admin/get_api_itg/danh_sach_don_hang";
import AddDonhangPage from "./admin/get_api_itg/them_don_hang";
import ChitietLabel from "./admin/get_api_itg/chi_tiet_label";
import Login from "./admin/quantri/login";
import NC2Page from "./admin/line_thietbi";
import NC1_NC2Page from "./admin/line_thietbi/danh_sach_nc1_nc2";
import Modelot_zm_Page from "./admin/log_zm/get_model_lot";
import Get_label_none from "./admin/get_api_itg/danh_sach_label_none";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={< Login />} />
        <Route path="/default" element={< Default/>} />
        <Route path="/danh_sach_tai_khoan" element={<AdminPage />} />
        <Route path="/danh_sach_don_hang" element={<DSdonhangPage />} />
        <Route path="/them_don_hang" element={<AddDonhangPage />} />
        <Route path="/congviec" element={<Admincv />} />
        <Route path="/du_lieu_nang_suat" element={<Admin_nang_suat />} />
        <Route path="/them_du_lieu_nang_suat" element={<Admin_them_nang_suat />} />
        <Route path="/them_du_lieu_nang_suat_zm" element={<Admin_them_nang_suat_zm />} />
        <Route path="/get_api_itg_model_lot" element={<Get_API_model_lot />} />
        <Route path="/danh_sach_cong_doan" element={<Admin_danh_sach_cong_doan />} />
        <Route path="/chi_tiet_label/:label" element={<ChitietLabel />} />       
        <Route path="/get_model_lot_api/:model/:lot" element={<Get_API_model_lot />} />  
        <Route path="/list_tiet_label_none/:model/:lot/:soluong" element={<Get_label_none />} />  
        <Route path="/danh_sach_nhom_cap_2" element={<NC2Page />} />    
        <Route path="/danh_sach_nc1_nc2/:manhomcap2" element={<NC1_NC2Page />} />   
        
        {/* Log zenmom */}
        <Route path="/get_logzm_model_lot" element={<Modelot_zm_Page />} />
      </Routes>
    </Router>
  );
}

export default App;
