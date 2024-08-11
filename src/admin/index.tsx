import { useEffect, useState, ChangeEvent } from "react";
import MenuComponent from "../Menu";
import { sendAPIRequest } from "../utils/util";
import DataTable from 'react-data-table-component';
// Định nghĩa kiểu dữ liệu cho tài khoản
interface Account {
  manhansu: string;
  tennhansu: string;
  tennhom: string;
  role: string;
  id: string;
}

// Định nghĩa kiểu dữ liệu cho người dùng không có tài khoản
interface NoAccount {
  manhansu: string;
  tennhansu: string;
}

// Định nghĩa kiểu dữ liệu cho component
function AdminPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [noAccounts, setNoAccounts] = useState<NoAccount[]>([]);
  const [manhansu, setManhansu] = useState<string>("");
  const [tennhansu, setTennhansu] = useState<string>("");
  const [tennhom, setTennhom] = useState<string>("");
  const [matkhau, setMatkhau] = useState<string>("");
  const [xacnhanmatkhau, setXacnhanMatkhau] = useState<string>("");
  const [vaitro, setVaitro] = useState<string>("admin");
  const [manhansuAcc, setManhansuAcc] = useState<string>("");
  const [tennhansuAcc, setTennhansuAcc] = useState<string>("");
  const [isFormAdd, setIsFormAdd] = useState<boolean>(false);
  const [isFormEdit, setIsFormEdit] = useState<boolean>(false);
  const [matkhau_edit, setMatkhau_edit] = useState<string>("");
  const [xacnhanmatkhau_edit, setXacnhanMatkhau_edit] = useState<string>("");
  const [vaitro_edit, setVaitro_edit] = useState<string>("");
  const [manhansu_edit, setManhansu_edit] = useState<string>("");
  const [tennhansu_edit, setTennhansu_edit] = useState<string>("");

  const handleManhansuChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedManhansu = e.target.value;
    setManhansuAcc(selectedManhansu);
    const selectedTennhansu =
      noAccounts.find((item) => item.manhansu === selectedManhansu)
        ?.tennhansu || "";
    setTennhansuAcc(selectedTennhansu);
  };

  // Fetch accounts with optional filters
  const fetchAccounts = async (filters: Record<string, string> = {}) => {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await sendAPIRequest(
        "/users/list?" + queryString,
        "GET",
        undefined
      );
      setAccounts(response);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tài khoản:", error);
    }
  };

  const fetchNoAccounts = async (filters: Record<string, string> = {}) => {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await sendAPIRequest(
        "/users/list_nouser?" + queryString,
        "GET",
        undefined
      );
      setNoAccounts(response);
    } catch (error) {
      console.error(
        "Lỗi khi lấy danh sách tài khoản không có người dùng:",
        error
      );
    }
  };

  // Fetch accounts when component mounts
  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSearch = () => {
    fetchAccounts({ manhansu, tennhansu, tennhom });
  };

  const openAddForm = () => {
    fetchNoAccounts();
    setMatkhau("");
    setXacnhanMatkhau("");
    setVaitro("admin");
    setManhansuAcc("");
    setTennhansuAcc("");
    setIsFormAdd(true);
  };

  const handleSubmit = async () => {
    if (
      !manhansuAcc ||
      !tennhansuAcc ||
      !matkhau ||
      !xacnhanmatkhau ||
      !vaitro
    ) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (matkhau !== xacnhanmatkhau) {
      alert("Mật khẩu và xác nhận mật khẩu không khớp.");
      return;
    }
    try {
      const data = {
        manhansu_acc: manhansuAcc,
        matkhau: matkhau,
        vaitro: vaitro,
      };

      await sendAPIRequest("/users/add", "POST", data);
      alert("Thêm tài khoản thành công!");
      fetchAccounts();
      setIsFormAdd(false);
    } catch (error) {
      console.error("Lỗi khi thêm tài khoản:", error);
      alert("Có lỗi xảy ra khi thêm tài khoản.");
    }
  };

  const htmlAddForm = (): JSX.Element => {
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
                        value={manhansuAcc}
                        onChange={handleManhansuChange}
                      />
                      <datalist id="list_nhan_su">
                        {noAccounts.map((item) => (
                          <option key={item.manhansu} value={item.manhansu}>
                            {item.tennhansu}
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
                        value={tennhansuAcc}
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
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsFormAdd(false)}
              >
                Đóng
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
              >
                Thêm tài khoản
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const showEditForm = async (id: string) => {
    try {
      const response = await sendAPIRequest(
        "/users/user_info?id=" + id,
        "GET",
        undefined
      );
      const userData = response[0];
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
      const data = {
        manhansu_edit: manhansu_edit,
        matkhau_edit: matkhau_edit,
        vaitro_edit: vaitro_edit,
      };
      await sendAPIRequest("/users/edit", "POST", data);
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
      await sendAPIRequest("/users/delete", "DELETE", { id });
      fetchAccounts();
      alert("Xóa user thành công");
    }
  };
  const columns = [
    {
      name: 'Mã nhân sự',
      selector: (row: Account) => row.manhansu,
      sortable: true,
    },
    {
      name: 'Tên nhân sự',
      selector: (row: Account) => row.tennhansu,
      sortable: true,
    },
    {
      name: 'Tên nhóm',
      selector: (row: Account) => row.tennhom,
      sortable: true,
    },
    {
      name: '',
      cell: (row: Account) => (
        <div>
          <button
            className="btn btn-info"
            onClick={() => showEditForm(row.id)}
          >
            Chi tiết
          </button>
          <button
            className="btn btn-danger"
            style={{ marginLeft: '5px' }}
            onClick={() => handleTrash(row.id)}
          >
            Xóa
          </button>
        </div>
      ),
    },
  ];
  return (
    <MenuComponent>
      <div className="d-flex align-items-center bg-white px-4 py-1">
        <h4 className="fw-normal text-primary m-0">
          Danh sách tài khoản <i className="far fa-question-circle"></i>
        </h4>
        <div className="d-flex ms-auto">
          <div className="input-custom ms-2">
            <div>
              <label className="form-label text-secondary">Mã nhân sự</label>
              <input
                type="search"
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
                type="search"
                className="form-control"
                value={tennhansu}
                onChange={(e) => setTennhansu(e.target.value)}
              />
            </div>
          </div>
          <div className="input-custom ms-2">
            <div>
              <label className="form-label text-secondary">Tên nhóm</label>
              <input
                type="search"
                className="form-control"
                value={tennhom}
                onChange={(e) => setTennhom(e.target.value)}
              />
            </div>
          </div>
          <div className="d-flex align-items-center justify-content-center p-2">
            <button className="btn btn-primary" onClick={handleSearch}>
              Tìm kiếm
            </button>
          </div>
          <div className="d-flex align-items-center justify-content-center">
            <button className="btn btn-success" onClick={openAddForm}>
              Thêm
            </button>
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="bg-white">
          <div className="App">
            <DataTable
              columns={columns}
              data={accounts}   
             
            />
          </div>
          {htmlAddForm()}
          {htmlEditForm()}
        </div>
      </div>
    </MenuComponent>
  );
}

export default AdminPage;
