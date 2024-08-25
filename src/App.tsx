import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import Default from './default';
import AdminPage from './admin';
import DSdonhangPage from './admin/nangsuat';
import AddDonhangPage from './admin/get_api_itg/them_don_hang';
import Admin_nang_suat from './admin/get_api_itg/get_data';
import Admin_them_nang_suat from './admin/nangsuat/themnangsuat';
import Admin_them_nang_suat_zm from './admin/nangsuat/themnangsuatzm';
import Admin_danh_sach_cong_doan from './admin/get_api_itg/danh_sach_cong_doan';
import ChitietLabel from './admin/get_api_itg/chi_tiet_label';
import Get_label_none from './admin/get_api_itg/danh_sach_label_none';
import NC2Page from './admin/line_thietbi';
import NC1_NC2Page from './admin/line_thietbi/danh_sach_nc1_nc2';
import Modelot_zm_Page from './admin/log_zm/get_data';
import Get_API_model_lot from './admin/get_api_itg/get_model_lot';
import ChitietThung from './admin/get_api_itg/chi_tiet_thung';
import ChitietThung_zm from './admin/log_zm/chi_tiet_thung';
import React from 'react';
import Login from './admin/quantri/login';

export const App: React.FC = () => {
    const { isAuth } = useAuthStore();

    const authRoute = (Component: React.FC) => (isAuth ? <Component /> : <Navigate to="/" />);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login/>} />
                <Route path="/login" element={authRoute(Default)} />
                <Route path="/default" element={authRoute(Default)} />
                <Route path="/danh_sach_tai_khoan" element={authRoute(AdminPage)} />
                <Route path="/danh_sach_don_hang" element={authRoute(DSdonhangPage)} />
                <Route path="/them_don_hang" element={authRoute(AddDonhangPage)} />
                <Route path="/du_lieu_nang_suat" element={authRoute(Admin_nang_suat)} />
                <Route path="/them_du_lieu_nang_suat" element={authRoute(Admin_them_nang_suat)} />
                <Route
                    path="/them_du_lieu_nang_suat_zm"
                    element={authRoute(Admin_them_nang_suat_zm)}
                />
                <Route path="/get_api_itg_model_lot" element={authRoute(Get_API_model_lot)} />
                <Route path="/danh_sach_cong_doan" element={authRoute(Admin_danh_sach_cong_doan)} />
                <Route path="/chi_tiet_label/:label" element={authRoute(ChitietLabel)} />
                <Route path="/chi_tiet_thung/:mathung" element={authRoute(ChitietThung)} />
                <Route
                    path="/get_model_lot_api/:model/:lot"
                    element={authRoute(Get_API_model_lot)}
                />
                <Route
                    path="/list_tiet_label_none/:model/:lot/:congdoan/:soluong_ok/:soluong"
                    element={authRoute(Get_label_none)}
                />
                <Route path="/danh_sach_nhom_cap_2" element={authRoute(NC2Page)} />
                <Route path="/danh_sach_nc1_nc2/:manhomcap2" element={authRoute(NC1_NC2Page)} />

                {/* Log zenmom */}
                <Route path="/get_logzm_model_lot" element={authRoute(Modelot_zm_Page)} />
                <Route path="/chi_tiet_label_zm/:label" element={authRoute(ChitietLabel)} />
                <Route path="/chi_tiet_thung_zm/:mathung" element={authRoute(ChitietThung_zm)} />
            </Routes>
        </Router>
    );
};

export default App;
