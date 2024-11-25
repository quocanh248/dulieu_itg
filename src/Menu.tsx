import { Link } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import React from 'react';

interface Props {
    children?: React.ReactNode; // `children` có thể không được truyền vào, vì vậy đánh dấu là tùy chọn.
}

const MenuComponent: React.FC<Props> = ({ children }) => {
    const { userInfo, signOut } = useAuthStore();
    const handllogout = async () => {
        if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            signOut();
        }
    };
    return (
        <>
            <header className="d-flex bg-dark">
                <div className="p-3">
                    <img className="header__img" src="/assets/img/logo.png" alt="Logo" />
                </div>
                <div className="nav flex-grow-1 scroll-x-view">
                    {userInfo && userInfo.role == 'admin' && (
                        <>
                            <div className="nav__item">
                                <a href="#" className="nav__link">
                                    <i className="fa-solid fa-key"></i>
                                    <span>Quản trị</span>
                                </a>
                                <div className="nav__submenu">
                                    <div className="nav__item">
                                        <Link to="/danh_sach_tai_khoan" className="nav__link">
                                            <span>Danh sách tài khoản</span>
                                        </Link>
                                    </div>
                                    <div className="nav__item">
                                        <Link to="/danh_sach_cong_doan" className="nav__link">
                                            <span>Danh sách công đoạn</span>
                                        </Link>
                                    </div>
                                    <div className="nav__item">
                                        <Link to="/them_don_hang" className="nav__link">
                                            <span>Thêm đơn hàng</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="nav__item">
                                <a href="#" className="nav__link">
                                    <i className="far fa-user"></i>
                                    <span>Nhân sự</span>
                                </a>
                                <div className="nav__submenu">
                                    <div className="nav__item">
                                        <Link to="/danh_sach_nhan_su" className="nav__link">
                                            <span>Danh sách nhân sự</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="nav__item">
                                <a href="#" className="nav__link">                                    
                                    <i className="fa-solid fa-tablet"></i>
                                    <span>OI</span>
                                </a>
                                <div className="nav__submenu">
                                    <div className="nav__item">
                                        <Link to="/danh_sach_oi" className="nav__link">
                                            <span>Danh sách OI</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    {userInfo && (userInfo.role == 'admin' || userInfo.role == 'kehoach') && (
                        <>
                            <div className="nav__item">
                                <a href="#" className="nav__link">
                                    <i className="fa-solid fa-bars-progress"></i>
                                    <span>Kế hoạch</span>
                                </a>
                                <div className="nav__submenu">
                                    <div className="nav__item">
                                        <Link to="/kehoach" className="nav__link">
                                            <span>Xem kế hoạch</span>
                                        </Link>
                                    </div>
                                    <div className="nav__item">
                                        <Link to="/them_kehoach" className="nav__link">
                                            <span>Thêm kế hoạch</span>
                                        </Link>
                                    </div>
                                    <div className="nav__item">
                                        <Link to="/gio_to_may" className="nav__link">
                                            <span>Cập nhật giờ tổ máy</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    {userInfo && (userInfo.role == 'admin' || userInfo.role == 'nangxuat') && (
                        <>
                            <div className="nav__item">
                                <a href="#" className="nav__link">
                                    <i className="fa-brands fa-product-hunt"></i>
                                    <span>Năng suất</span>
                                </a>
                                <div className="nav__submenu">
                                    <div className="nav__item">
                                        <Link to="/du_lieu_nang_suat" className="nav__link">
                                            <span>Dữ liệu năng suất</span>
                                        </Link>
                                    </div>
                                    <div className="nav__item">
                                        <Link to="/them_du_lieu_nang_suat" className="nav__link">
                                            <span>
                                                Thêm dữ liệu năng suất <b>ITG</b>
                                            </span>
                                        </Link>
                                    </div>
                                    <div className="nav__item">
                                        <Link to="/them_du_lieu_nang_suat_zm" className="nav__link">
                                            <span>
                                                Thêm dữ liệu năng suất <b>ZM</b>
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="nav__item">
                                <a href="#" className="nav__link">
                                    <i className="fa-solid fa-stairs"></i>
                                    <span>Log IOT ZM</span>
                                </a>
                                <div className="nav__submenu">
                                    <div className="nav__item">
                                        <Link to="/get_logzm_model_lot" className="nav__link">
                                            <span>Dữ liệu chạy hàng Model - lot</span>
                                        </Link>
                                    </div>
                                    <div className="nav__item">
                                        <Link to="/get_data_line" className="nav__link">
                                            <span>Dữ liệu chạy hàng theo line</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="nav__item">
                                <a href="#" className="nav__link">
                                    <i className="fas fa-sticky-note"></i>
                                    <span>Báo cáo</span>
                                </a>
                                <div className="nav__submenu">
                                    <div className="nav__item">
                                        <Link to="/danh_sach_don_hang" className="nav__link">
                                            <span>Danh sách đơn hàng</span>
                                        </Link>
                                    </div>
                                    <div className="nav__item">
                                        <Link to="/get_model_lot_api//" className="nav__link">
                                            <span>Dữ liệu chạy hàng Model - lot</span>
                                        </Link>
                                    </div>
                                    <div className="nav__item">
                                        <Link to="/truy_xuat_nhan_vien" className="nav__link">
                                            <span>Truy xuất nhân viên</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            {/* <div className="nav__item">
                                <a href="#" className="nav__link">
                                    <i className="fas fa-sticky-note"></i>
                                    <span>Data</span>
                                </a>
                                <div className="nav__submenu">
                                    <div className="nav__item">
                                        <Link to="/them_data_vn" className="nav__link">
                                            <span>Thêm dữ liệu VN</span>
                                        </Link>
                                    </div>                                  
                                </div>
                            </div> */}
                        </>
                    )}
                    {userInfo && (userInfo.role == 'admin' || userInfo.role == 'thietbi') && (
                        <>
                            <div className="nav__item">
                                <a href="#" className="nav__link">
                                    <i className="fa-solid fa-lines-leaning"></i>
                                    <span>Thiết bị</span>
                                </a>
                                <div className="nav__submenu">
                                    <div className="nav__item">
                                        <Link to="/danh_sach_thiet_bi" className="nav__link">
                                            <span>Danh sách thiết bị</span>
                                        </Link>
                                    </div>
                                    <div className="nav__item">
                                        <Link to="/danh_sach_nhom_cap_1" className="nav__link">
                                            <span>Danh sách nhóm cấp 1</span>
                                        </Link>
                                    </div>
                                    <div className="nav__item">
                                        <Link to="/danh_sach_nhom_cap_2" className="nav__link">
                                            <span>Danh sách nhóm cấp 2</span>
                                        </Link>
                                    </div>
                                    <div className="nav__item">
                                        <Link to="/danh_sach_line" className="nav__link">
                                            <span>Danh sách line</span>
                                        </Link>
                                    </div>
                                    <div className="nav__item">
                                        <Link to="/model_nc1" className="nav__link">
                                            <span>Model - nhóm cấp 1</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <div className="nav flex text-nowrap">
                    <div className="nav__item">
                        <a href="#" className="nav__link">
                            <span className="mx-1">{userInfo?.username}</span>
                            <i className="fas fa-chevron-down"></i>
                        </a>
                        <div className="nav__submenu" style={{ right: '0' }}>
                            <div className="nav__item">
                                <a className="nav__link" onClick={handllogout}>
                                    <span>Đăng xuất</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            {children}
        </>
    );
};
export default MenuComponent;
