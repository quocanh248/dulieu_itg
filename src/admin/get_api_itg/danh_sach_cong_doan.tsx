import { useEffect, useState } from "react";
import MenuComponent from "../../Menu";
import axios from "axios";
function AdminPage() {
  const [congdoans, setcongdoans] = useState([]);
  const [macongdoan_edit, setMacongdoan_edit] = useState("");
  const [tencongdoan_edit, setTencongdoan_edit] = useState("");
  const [stt_edit, setStt_edit] = useState("");
  const [macongdoan, setMacongdoan] = useState("");
  const [tencongdoan, setTencongdoan] = useState("");
  const [isFormEdit, setIsFormEdit] = useState(false);  
  const [tennhansu_edit, setTennhansu_edit] = useState("");

  const fetchCongdoan = async (filters = {}) => {
    try {
      const response = await axios.get(
        "http://localhost:3000/truynguyen/listcongdoan",
        {
          params: filters,
        }
      );
      setcongdoans(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tài khoản:", error);
    }
  };
  // Fetch accounts when component mounts or filters change
  useEffect(() => {
    fetchCongdoan();
  }, []);
  // Handle search button click
  const handleSearch = () => {
    fetchCongdoan({ macongdoan, tencongdoan });
  };
  const showEditForm = async (macongdoan: string) => {
    try {
      // Gửi yêu cầu GET để lấy thông tin người dùng
      const response = await axios.get(
        "http://localhost:3000/truynguyen/chitietcongdoan",
        {
          params: { macongdoan }, // Đặt id vào đối tượng params
        }
      );
      const congdoanData = response.data[0];     
      setMacongdoan_edit(congdoanData.macongdoan);
      setTencongdoan_edit(congdoanData.tencongdoan);
      setStt_edit(congdoanData.stt);
      setIsFormEdit(true);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      // Xử lý lỗi nếu cần thiết
    }
  };
  const handle_Edit_Submit = async () => {
    
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
              <h5 className="modal-title">Cập nhật công đoạn</h5>
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
                  <div className="col-md-5">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Mã công đoạn (*)</label>
                          <input
                            type="text"
                            className="form-control"
                            readOnly
                            value={macongdoan_edit}                            
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Tên công đoạn (*)</label>
                          <input
                            type="text"
                            className="form-control"
                            readOnly
                            value={tencongdoan_edit}                            
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">STT (*)</label>
                          <input
                            type="text"
                            className="form-control"
                            readOnly
                            value={stt_edit}                            
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-7 border-start">
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
  return (
    <MenuComponent>
      <div className="d-flex align-items-center bg-white px-4 py-1">
        <h4 className="fw-normal text-primary m-0">
          Danh sách công đoạn <i className="far fa-question-circle"></i>
        </h4>
        <div className="d-flex ms-auto">
          <div className="input-custom ms-2">
            <div>
              <label className="form-label text-secondary">Mã nhân sự</label>
              <input
                type="text"
                className="form-control"
                value={macongdoan}
                onChange={(e) => setMacongdoan(e.target.value)}
              />
            </div>
          </div>
          <div className="input-custom ms-2">
            <div>
              <label className="form-label text-secondary">Tên nhân sự</label>
              <input
                type="text"
                className="form-control"
                value={tencongdoan}
                onChange={(e) => setTencongdoan(e.target.value)}
              />
            </div>
          </div>
          <div className="d-flex align-items-center justify-content-center p-2">
            <button className="btn btn-primary" onClick={handleSearch}>
              <i className="fas fa-search"></i> Tìm
            </button>
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="bg-white">
          <table
            className="table table-bordered text-center"
            style={{ width: "100%", fontSize: "14px" }}
          >
            <thead>
              <tr>
                <th>Mã công đoạn</th>
                <th>Tên công đoạn</th>
                <th>STT</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {congdoans.map((item) => (
                <tr key={(item as { macongdoan: string }).macongdoan}>
                  <td>{(item as { macongdoan: string }).macongdoan}</td>
                  <td>{(item as { tencongdoan: string }).tencongdoan}</td>
                  <td>{(item as { stt: string }).stt}</td>
                  <td>
                    <button
                      className="btn btn-info"
                      role={"button"}
                      onClick={() =>
                        showEditForm(
                          (item as { macongdoan: string }).macongdoan
                        )
                      }
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isFormEdit && htmlEditForm()}
    </MenuComponent>
  );
}

export default AdminPage;
