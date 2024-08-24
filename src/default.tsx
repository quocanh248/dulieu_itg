import { useNavigate } from "react-router-dom";
import MenuComponent from "./Menu";
import { useEffect } from "react";
function AdminPage() {
  const role = localStorage.getItem("role");
  console.log(role);
  const navigate = useNavigate();
  useEffect(() => {
    if (!role) {
      navigate("/login");
    }
  }, [role, navigate]);
  return (
    <MenuComponent>
      <div className="d-flex align-items-center bg-white px-4 py-1">
        <h4 className="fw-normal text-primary m-0">
          Trang chủ <i className="far fa-question-circle"></i>
        </h4>
        <div className="d-flex ms-auto">
          <div className="input-custom ms-2" style={{ visibility: "hidden" }}>
            <div>
              <label className="form-label text-secondary">Mã nhân sự</label>
              <input type="search" />
            </div>
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="bg-white"></div>
      </div>
    </MenuComponent>
  );
}

export default AdminPage;
