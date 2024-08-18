import { Link } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";

interface Props {
  children?: React.ReactNode; // `children` có thể không được truyền vào, vì vậy đánh dấu là tùy chọn.
}

const MenuComponent: React.FC<Props> = ({ children }) => {
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");  
  const handllogout = async () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      const { signOut } = useAuthStore.getState(); // Lấy hàm signOut từ store
      await signOut();
    }
  };

  return (
    <>
      <header className="d-flex bg-dark">
        <div className="p-3">
          <img className="header__img" src="/assets/img/logo.png" alt="Logo" />
        </div>
        <div className="nav flex-grow-1 scroll-x-view">
          {role == "admin" && (
            <div className="nav__item">
              <a href="#" className="nav__link">
                <i className="far fa-user"></i>
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
                <div className="nav__item">
                  <Link to="/login" className="nav__link">
                    <span>Login</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
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
                <Link to="/get_api_itg_model_lot" className="nav__link">
                  <span>Dữ liệu chạy hàng Model - lot</span>
                </Link>
              </div>
              <div className="nav__item">
                <Link to="/them_du_lieu_nang_suat" className="nav__link">
                  <span>Thêm dữ liệu năng suất</span>
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
            </div>
          </div>
          <div className="nav__item">
            <a href="#" className="nav__link">
              <i className="fa-solid fa-lines-leaning"></i>
              <span>Thiết bị</span>
            </a>
            <div className="nav__submenu">
              <div className="nav__item">
                <Link to="/danh_sach_nhom_cap_2" className="nav__link">
                  <span>Danh sách nhóm cấp 2</span>
                </Link>
              </div>
            </div>
          </div>
        </div>       
        <div className="nav flex text-nowrap">
          <div className="nav__item">
            <a href="#" className="nav__link">
              <span className="mx-1">{username}</span>
              <i className="fas fa-chevron-down"></i>
            </a>
            <div className="nav__submenu" style={{ right: "0" }}>
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
