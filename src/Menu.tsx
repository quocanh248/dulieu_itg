import { Link } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}
const MenuComponent: React.FC<Props> = ({ children }) => {
  return (
    <>
      <header className="d-flex bg-dark">
        <div className="p-3">
          <img className="header__img" src="/assets/img/logo.png" alt="Logo" />
        </div>
        <div className="nav flex-grow-1 scroll-x-view">
          <div className="nav__item">
            <a href="#" className="nav__link">
              <i className="far fa-user"></i>
              <span>Quản trị</span>
            </a>
            <div className="nav__submenu">
              <div className="nav__item">
                <Link to={"/"} className="nav__link">
                  <span>Danh sách tài khoản</span>
                </Link>
              </div>
            </div>
          </div>         
          <div className="nav__item">
            <Link to={"/congviec"} className="nav__link">
              <i className="fas fa-sticky-note"></i>
              <span>công việc nè</span>
            </Link>
          </div>
          <div className="nav__item">
            <a href="#" className="nav__link">
              <i className="far fa-user"></i>
              <span>Năng suất</span>
            </a>
            <div className="nav__submenu">
              <div className="nav__item">
                <Link to={"/du_lieu_nang_suat"} className="nav__link">
                  <span>Dữ liệu năng suất</span>
                </Link>
              </div>
              <div className="nav__item">
                <Link to={"/them_du_lieu_nang_suat"} className="nav__link">
                  <span>Thêm dữ liệu năng suất</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="flex text-nowrap p-3">
          <img
            className="header__img rounded-pill"
            src="./assets/img/logo.png"
            alt="Logo"
          />
          <span className="mx-1">QH</span>
          <i className="fas fa-chevron-down"></i>
        </div>
      </header>

      {children}
    </>
  );
};

export default MenuComponent;
