import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import React from 'react';
import Default from './default';
import AdminPage from './admin';
import Login from './admin/quantri/login';
//Nhân sự
import personnelPage from './admin/nhansu';

//năng suất
import Admin_nang_suat from './admin/nangsuat';
import Admin_them_nang_suat from './admin/nangsuat/themnangsuat';
import Admin_them_nang_suat_zm from './admin/nangsuat/themnangsuatzm';
//API ITG
import DSdonhangPage from './admin/get_api_itg/danh_sach_don_hang';
import AddDonhangPage from './admin/get_api_itg/them_don_hang';
import Admin_danh_sach_cong_doan from './admin/get_api_itg/danh_sach_cong_doan';
import ChitietLabel from './admin/get_api_itg/chi_tiet_label';
import Get_label_none from './admin/get_api_itg/danh_sach_label_none';
import Get_data_nv from './admin/get_api_itg/truy_xuat_nhan_vien';
//log ZM
import Modelot_zm_Page from './admin/log_zm/get_model_lot';
import Get_API_model_lot from './admin/get_api_itg/get_model_lot';
import PageDataLine from './admin/log_zm/get_data_line';
import ChitietThung from './admin/get_api_itg/chi_tiet_thung';
import ChitietThung_zm from './admin/log_zm/chi_tiet_thung';
import ChitietLabelzm from './admin/log_zm/chi_tiet_label';
import Get_label_cd_zm from './admin/log_zm/danh_sach_label_none';

//thiết bị
import NC1_NC2Page from './admin/line_thietbi/danh_sach_nc1_nc2';
import NC1Page from './admin/line_thietbi/danh_sach_nc1';
import ThietbiPage from './admin/line_thietbi/index';
import LinePage from './admin/line_thietbi/line_thietbi';
import Model_nc1_Page from './admin/line_thietbi/model_nc1';
//OI
import DS_OI_page from './admin/quan_ly_oi';

//Kế hoạch
import kehoach_Page from './admin/kehoach';
import AddKehoachPage from './admin/kehoach/them_ke_hoach';
import Gio_TM_Page from './admin/kehoach/gio_to_may';
export const App: React.FC = () => {
    const { isAuth, userInfo } = useAuthStore();

    const authRoute = (Component: React.FC) => (isAuth ? <Component /> : <Navigate to="/" />);
    const Role_Admin = (Component: React.FC) =>
        userInfo?.role == 'admin' ? <Component /> : <Navigate to="/default" />;
    const Role_thietbi = (Component: React.FC) =>
        userInfo?.role == 'admin' || userInfo?.role == 'thietbi' ? (
            <Component />
        ) : (
            <Navigate to="/default" />
        );
    const Role_ns = (Component: React.FC) =>
        userInfo?.role == 'admin' || userInfo?.role == 'nangxuat' ? (
            <Component />
        ) : (
            <Navigate to="/default" />
        );
    const Role_kh = (Component: React.FC) =>
        userInfo?.role == 'admin' || userInfo?.role == 'kehoach' ? (
            <Component />
        ) : (
            <Navigate to="/default" />
        );
    console.log('userInfo?.role' + userInfo?.role);
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={authRoute(Default)} />
                {/* default */}
                <Route path="/default" element={authRoute(Default)} />

                {/* Nhân sự */}
                <Route path="/danh_sach_nhan_su" element={Role_Admin(personnelPage)} />
                {/* OI*/}
                <Route path="/danh_sach_oi" element={Role_Admin(DS_OI_page)} />
                {/* Admin */}
                <Route path="/danh_sach_tai_khoan" element={Role_Admin(AdminPage)} />
                <Route path="/them_don_hang" element={Role_Admin(AddDonhangPage)} />
                <Route path="/them_du_lieu_nang_suat" element={Role_Admin(Admin_them_nang_suat)} />
                <Route
                    path="/them_du_lieu_nang_suat_zm"
                    element={Role_Admin(Admin_them_nang_suat_zm)}
                />

                {/* Năng  suất */}
                <Route path="/du_lieu_nang_suat" element={Role_ns(Admin_nang_suat)} />
                <Route path="/danh_sach_don_hang" element={Role_ns(DSdonhangPage)} />
                <Route path="/get_api_itg_model_lot" element={Role_ns(Get_API_model_lot)} />
                <Route path="/get_data_line" element={Role_ns(PageDataLine)} />
                <Route path="/danh_sach_cong_doan" element={Role_ns(Admin_danh_sach_cong_doan)} />
                <Route path="/chi_tiet_label/:label" element={Role_ns(ChitietLabel)} />
                <Route path="/chi_tiet_thung/:mathung" element={Role_ns(ChitietThung)} />
                <Route path="/truy_xuat_nhan_vien" element={Role_ns(Get_data_nv)} />
                <Route path="/get_model_lot_api/:model?/:lot?" element={Role_ns(Get_API_model_lot)} />
                <Route
                    path="/list_tiet_label_none/:model/:lot/:congdoan/:soluong_ok/:soluong"
                    element={Role_ns(Get_label_none)}
                />
                {/* Log zenmom */}
                <Route path="/get_logzm_model_lot" element={Role_ns(Modelot_zm_Page)} />
                <Route path="/chi_tiet_label_zm/:label" element={Role_ns(ChitietLabelzm)} />
                <Route path="/chi_tiet_thung_zm/:mathung" element={Role_ns(ChitietThung_zm)} />
                <Route
                    path="/list_label_cd_zm/:model/:lot/:congdoan/:soluong_ok/:soluong"
                    element={Role_ns(Get_label_cd_zm)}
                />
                {/* Thiết bị */}
                <Route path="/danh_sach_nhom_cap_2" element={Role_thietbi(NC1_NC2Page)} />
                <Route path="/danh_sach_nhom_cap_1" element={Role_thietbi(NC1Page)} />
                <Route path="/danh_sach_thiet_bi" element={Role_thietbi(ThietbiPage)} />
                <Route path="/danh_sach_line" element={Role_thietbi(LinePage)} />
                <Route path="/model_nc1" element={Role_thietbi(Model_nc1_Page)} />

                {/* Kế hoạch */}
                <Route path="/kehoach" element={Role_kh(kehoach_Page)} />
                <Route path="/them_kehoach" element={Role_kh(AddKehoachPage)} />
                <Route path="/gio_to_may" element={Role_kh(Gio_TM_Page)} />
            </Routes>
        </Router>
    );
};

export default App;
