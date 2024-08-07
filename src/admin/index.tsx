import { useEffect, useState } from "react";
import MenuComponent from "../Menu";
import axios from "axios";
function AdminPage() {
  const [accounts, setAccounts] = useState([]);
  const [Noaccounts, setNoAccounts] = useState([]);
  const [manhansu, setManhansu] = useState("");
  const [tennhansu, setTennhansu] = useState("");
  const [tennhom, setTennhom] = useState("");
  const [matkhau, setMatkhau] = useState("");
  const [xacnhanmatkhau, setXacnhanMatkhau] = useState("");
  const [vaitro, setVaitro] = useState("admin");
  const [manhansu_acc, setManhansu_acc] = useState("");
  const [tennhansu_acc, setTennhansu_acc] = useState("");
  const [isFormAdd, setIsFormAdd] = useState(false);
  const [isFormEdit, setIsFormEdit] = useState(false);
  const [manhansu_edit, setManhansu_edit] = useState("");
  const [tennhansu_edit, setTennhansu_edit] = useState("");
  const [xacnhanmatkhau_edit, setXacnhanMatkhau_edit] = useState("");
  const [matkhau_edit, setMatkhau_edit] = useState("");
  const [vaitro_edit, setVaitro_edit] = useState("admin");
  const handleManhansuChange = (e) => {
    const selectedManhansu = e.target.value;
    setManhansu_acc(selectedManhansu);
    const selectedTennhansu =
      Noaccounts.find(
        (item) => (item as { manhansu: string }).manhansu === selectedManhansu
      )?.tennhansu || "";
    setTennhansu_acc(selectedTennhansu);
  };
  // Fetch accounts with optional filters
  const fetchAccounts = async (filters = {}) => {
    try {
      const response = await axios.get("http://localhost:3000/users/list", {
        params: filters,
      });
      setAccounts(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tài khoản:", error);
    }
  };
  const fetch_No_Accounts = async (filters = {}) => {
    try {
      const res_noacc = await axios.get(
        "http://localhost:3000/users/list_nouser",
        {
          params: filters,
        }
      );
      setNoAccounts(res_noacc.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tài khoản:", error);
    }
  };
  // Fetch accounts when component mounts or filters change
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Handle search button click
  const handleSearch = () => {
    fetchAccounts({ manhansu, tennhansu, tennhom });
  };
  const openAddForm = () => {
    fetch_No_Accounts();
    setMatkhau("");
    setXacnhanMatkhau("");
    setVaitro("admin");
    setManhansu_acc("");
    setTennhansu_acc("");
    setIsFormAdd(true);
  };
  const handleSubmit = async () => {
    // Kiểm tra xem tất cả các trường thông tin đã được điền chưa
    if (
      !manhansu_acc ||
      !tennhansu_acc ||
      !matkhau ||
      !xacnhanmatkhau ||
      !vaitro
    ) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    // Kiểm tra mật khẩu có khớp không
    if (matkhau !== xacnhanmatkhau) {
      alert("Mật khẩu và xác nhận mật khẩu không khớp.");
      return;
    }

    // Gửi yêu cầu đến API
    try {
      await axios.post("http://localhost:3000/users/add", {
        manhansu_acc,
        matkhau,
        vaitro,
      });
      alert("Thêm tài khoản thành công!");
      fetchAccounts();
      setIsFormAdd(false);
    } catch (error) {
      console.error("Lỗi khi thêm tài khoản:", error);
      alert("Có lỗi xảy ra khi thêm tài khoản.");
    }
  };
  // Modal content
  const htmlAddForm = (): React.ReactNode => {
    return (
      <div className={`modal ${isFormAdd ? "d-block" : "d-none"}`}>
        <div
          className="modal-dialog"
          style={{ width: "80%", maxWidth: "none" }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Thêm tài khoản</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => setIsFormAdd(false)}
              ></button>
            </div>
            <div className="modal-body">
              <ul className="nav nav-tabs">
                <li className="nav-item">
                  <a
                    className="nav-link active"
                    data-bs-toggle="tab"
                    href="#basic"
                  >
                    Cơ bản
                  </a>
                </li>
              </ul>
              <div id="basic" className="tab-pane fade show active">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Mã nhân sự (*)</label>
                      <input
                        type="text"
                        className="form-control"
                        autoComplete="off"
                        list="list_nhan_su"
                        id="manhansu"
                        value={manhansu_acc}
                        onChange={handleManhansuChange}
                      />
                      <datalist id="list_nhan_su">
                        {Noaccounts.map((item) => (
                          <option
                            key={(item as { manhansu: string }).manhansu}
                            value={(item as { manhansu: string }).manhansu}
                          >
                            {(item as { tennhansu: string }).tennhansu}
                          </option>
                        ))}
                      </datalist>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Tên nhân sự</label>
                      <input
                        type="text"
                        className="form-control"
                        readOnly
                        id="tennhansu"
                        value={tennhansu_acc}
                      />
                    </div>
                  </div>
                </div>
                <hr />
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Mật khẩu (*)</label>
                      <input
                        type="password"
                        className="form-control"
                        autoComplete="off"
                        id="matkhau"
                        value={matkhau}
                        onChange={(e) => setMatkhau(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Xác nhận mật khẩu (*)
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        autoComplete="off"
                        id="xacnhanmatkhau"
                        value={xacnhanmatkhau}
                        onChange={(e) => setXacnhanMatkhau(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <hr />
                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Vai trò (*)</label>
                      <select
                        className="form-select"
                        id="vaitro"
                        value={vaitro}
                        onChange={(e) => setVaitro(e.target.value)}
                      >
                        <option value="admin">Admin</option>
                        <option value="thietbi">Quản lý thiết bị</option>
                        <option value="oi">Quản lý màn hình</option>
                        <option value="nangxuat">Xem năng xuất</option>
                        <option value="kehoach">Kế hoạch</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-danger">
                Xóa
              </button>
              <div className="ms-auto">
                <button
                  type="button"
                  className="btn btn-light"
                  data-bs-dismiss="modal"
                  onClick={() => setIsFormAdd(false)}
                >
                  Đóng
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmit}
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const showEditForm = async (id: string) => {
    try {
      // Gửi yêu cầu GET để lấy thông tin người dùng
      const response = await axios.get(
        "http://localhost:3000/users/user_info",
        {
          params: { id }, // Đặt id vào đối tượng params
        }
      );
      const userData = response.data[0];
      // console.log(userData);
      setXacnhanMatkhau_edit("");
      setMatkhau_edit("");
      setVaitro_edit(userData.role || "admin");
      setManhansu_edit(userData.manhansu || "");
      setTennhansu_edit(userData.tennhansu || "");
      setIsFormEdit(true);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      // Xử lý lỗi nếu cần thiết
    }
  };
  const handle_Edit_Submit = async () => {
    if (matkhau != "") {
      if (matkhau !== xacnhanmatkhau) {
        alert("Mật khẩu và xác nhận mật khẩu không khớp.");
        return;
      }
    }
    try {
      await axios.post("http://localhost:3000/users/edit", {
        manhansu_edit,
        matkhau_edit,
        vaitro_edit,
      });
      alert("Cập nhật tài khoản thành công!");
      setIsFormEdit(false);
    } catch (error) {
      console.error("Lỗi khi thêm tài khoản:", error);
      alert("Có lỗi xảy ra khi thêm tài khoản.");
    }
  };
  const htmlEditForm = (): React.ReactNode => {
    return (
      <div className={`modal ${isFormEdit ? "d-block" : "d-none"}`}>
        <div
          className="modal-dialog"
          style={{ width: "80%", maxWidth: "none" }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Cập nhật tài khoản</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => setIsFormEdit(false)}
              ></button>
            </div>
            <div className="modal-body">
              <ul className="nav nav-tabs">
                <li className="nav-item">
                  <a
                    className="nav-link active"
                    data-bs-toggle="tab"
                    href="#basic"
                  >
                    Cơ bản
                  </a>
                </li>
              </ul>
              <div id="basic" className="tab-pane fade show active">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Mã nhân sự (*)</label>
                      <input
                        type="text"
                        className="form-control"
                        readOnly
                        value={manhansu_edit}
                        onChange={(e) => setMatkhau_edit(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Tên nhân sự</label>
                      <input
                        type="text"
                        className="form-control"
                        readOnly
                        id="tennhansu"
                        value={tennhansu_edit}
                        onChange={(e) => setTennhansu_edit(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <hr />
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Mật khẩu (*)</label>
                      <input
                        type="password"
                        className="form-control"
                        autoComplete="off"
                        id="matkhau"
                        value={matkhau_edit}
                        onChange={(e) => setMatkhau_edit(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Xác nhận mật khẩu (*)
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        autoComplete="off"
                        id="xacnhanmatkhau"
                        value={xacnhanmatkhau_edit}
                        onChange={(e) => setXacnhanMatkhau_edit(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <hr />
                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Vai trò (*)</label>
                      <select
                        className="form-select"
                        id="vaitro"
                        value={vaitro_edit}
                        onChange={(e) => setVaitro_edit(e.target.value)}
                      >
                        <option value="admin">Admin</option>
                        <option value="thietbi">Quản lý thiết bị</option>
                        <option value="oi">Quản lý màn hình</option>
                        <option value="nangxuat">Xem năng xuất</option>
                        <option value="kehoach">Kế hoạch</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-danger">
                Xóa
              </button>
              <div className="ms-auto">
                <button
                  type="button"
                  className="btn btn-light"
                  data-bs-dismiss="modal"
                  onClick={() => setIsFormEdit(false)}
                >
                  Đóng
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handle_Edit_Submit}
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const handleTrash = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa user này không?")) {
      console.log(id);
      const response = await axios.get("http://localhost:3000/users/delete", {
        params: { id }, // Đặt id vào đối tượng params
      });
      fetchAccounts();
      alert("Xóa user thành công");
    }
  };

  return (
    <MenuComponent>
      <div className="d-flex align-items-center bg-white px-4 py-1">
        <h4 className="fw-normal text-primary m-0">
          Danh sách user <i className="far fa-question-circle"></i>
        </h4>
        <div className="d-flex ms-auto">
          <div className="input-custom ms-2">
            <div>
              <label className="form-label text-secondary">Mã nhân sự</label>
              <input
                type="text"
                className="form-control"
                value={manhansu}
                onChange={(e) => setManhansu(e.target.value)}
              />
            </div>
          </div>
          <div className="input-custom ms-2">
            <div>
              <label className="form-label text-secondary">Tên nhân sự</label>
              <input
                type="text"
                className="form-control"
                value={tennhansu}
                onChange={(e) => setTennhansu(e.target.value)}
              />
            </div>
          </div>
          <div className="input-custom ms-2">
            <div>
              <label className="form-label text-secondary">Tên bộ phận</label>
              <input
                type="text"
                className="form-control"
                value={tennhom}
                onChange={(e) => setTennhom(e.target.value)}
              />
            </div>
          </div>
          <div className="d-flex align-items-center justify-content-center p-2">
            <button className="btn btn-primary" onClick={handleSearch}>
              <i className="fas fa-search"></i> Tìm
            </button>
          </div>
          <div className="d-flex align-items-center justify-content-center p-2 border-start">
            <button className="btn btn-success" onClick={openAddForm}>
              <i className="fas fa-plus"></i> Thêm
            </button>
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="bg-white p-3">
          <table
            className="table table-bordered text-center"
            style={{ width: "100%", fontSize: "14px" }}
          >
            <thead>
              <tr>
                <th>Mã nhân sự</th>
                <th>Tên nhân sự</th>
                <th>Bộ phận</th>
                <th></th>               
              </tr>
            </thead>
            <tbody>
              {accounts.map((item) => (
                <tr key={(item as { manhansu: string }).manhansu}>
                  <td>{(item as { manhansu: string }).manhansu}</td>
                  <td>{(item as { tennhansu: string }).tennhansu}</td>
                  <td>{(item as { tennhom: string }).tennhom}</td>
                  <td>
                    <button
                      className="btn btn-info"
                      role={"button"}
                      onClick={() => showEditForm((item as { id: string }).id)}
                    >
                      Chi tiết
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ marginLeft: "5px"}}
                      role={"button"}
                      onClick={() => handleTrash((item as { id: string }).id)}
                    >
                      Xóa
                    </button>
                  </td>                 
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isFormAdd && htmlAddForm()}
      {isFormEdit && htmlEditForm()}
    </MenuComponent>
  );
}

export default AdminPage;
