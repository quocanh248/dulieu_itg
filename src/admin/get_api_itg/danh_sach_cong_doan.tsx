import { useEffect, useState } from "react";
import MenuComponent from "../../Menu";
import axios from "axios";
import { sendAPIRequest } from "../../utils/util";

// Định nghĩa kiểu cho các đối tượng
interface CongDoan {
  macongdoan: string;
  stt: string;
  tencongdoan: string;
}

interface Thuoctinh {
  [key: string]: string; // Thay đổi kiểu giá trị nếu cần
}

interface TableKetquaProps {
  item: string; // Nếu item là JSON string
  macongdoan: string;
}

function AdminPage() {
  const [congdoans, setCongdoans] = useState<CongDoan[]>([]);
  const [macongdoanEdit, setMacongdoanEdit] = useState<string>("");
  const [tencongdoanEdit, setTencongdoanEdit] = useState<string>("");
  const [sttEdit, setSttEdit] = useState<string>("");
  const [macongdoan, setMacongdoan] = useState<string>("");
  const [tencongdoan, setTencongdoan] = useState<string>("");
  const [isFormEdit, setIsFormEdit] = useState<boolean>(false);
  const [thuoctinhEdit, setThuoctinhEdit] = useState<string>("");
  const [thuoctinhIp, setThuoctinhIp] = useState<string>("");

  const fetchCongdoan = async (filters: Record<string, any> = {}) => {
    try {
      const response = await axios.get(
        "http://localhost:3000/truynguyen/listcongdoan",
        {
          params: filters,
        }
      );
      setCongdoans(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách công đoạn:", error);
    }
  };

  useEffect(() => {
    fetchCongdoan();
  }, []);

  const handleSearch = () => {
    fetchCongdoan({ macongdoan, tencongdoan });
  };
  const TableKetqua: React.FC<TableKetquaProps> = ({ item, macongdoan }) => {
    // Phân tích chuỗi JSON item thành đối tượng
    const thuoctinhs: Thuoctinh = JSON.parse(item);

    // Kiểm tra nếu thuoctinhs là null hoặc không có thuộc tính
    if (!thuoctinhs || Object.keys(thuoctinhs).length === 0) {
      return <div className="row"></div>;
    }

    return (
      <table className="table table-bordered text-center">
        <thead>
          <tr>
            <th>Thuộc tính</th>
            <th>Giá trị</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(thuoctinhs).map(([key, value]) =>
            value !== null ? (
              <tr key={key}>
                <td>{key}</td>
                <td>{value}</td> {/* Hiển thị giá trị thực tế */}
                <td>
                  <button
                    className="btn btn-danger"
                    style={{ marginLeft: "5px" }}
                    role="button"
                    onClick={() =>
                      handleTrashThuoctinhCd(macongdoan, key, thuoctinhs)
                    }
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ) : null
          )}
          {Object.keys(thuoctinhs).length === 0 && (
            <tr>
              <td colSpan={3}>
                <label style={{ marginLeft: "120px" }}>
                  Công đoạn không có sử dụng thiết bị
                </label>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };
  const handleTrashThuoctinhCd = async (
    macongdoan: string,
    key: string,
    thuoctinhs: Thuoctinh
  ) => {
    try {
      if (window.confirm("Bạn có chắc chắn muốn xóa thuộc tính này không?")) {
        delete thuoctinhs[key];
        const data = {
          macongdoan: macongdoan,
          thuoctinh: JSON.stringify(thuoctinhs),
        };
        await sendAPIRequest("/truynguyen/capnhatcongdoan", "PUT", data);
        showEditForm(macongdoan);
      }
    } catch (error) {
      console.error("Lỗi khi xóa thuộc tính công đoạn:", error);
    }
  };
  const showEditForm = async (macongdoan: string) => {
    try {
      const response = await axios.get(
        "http://localhost:3000/truynguyen/chitietcongdoan",
        {
          params: { macongdoan },
        }
      );
      const congdoanData = response.data[0];
      setThuoctinhIp("");
      setMacongdoanEdit(congdoanData.macongdoan);
      setTencongdoanEdit(congdoanData.tencongdoan);
      setSttEdit(congdoanData.stt);
      setThuoctinhEdit(congdoanData.thuoctinh);
      setIsFormEdit(true);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin công đoạn:", error);
    }
  };

  const htmlEditForm = () => {
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
                            value={macongdoanEdit}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">
                            Tên công đoạn (*)
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            readOnly
                            value={tencongdoanEdit}
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
                            value={sttEdit}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-7 border-start">
                    <div className="row">
                      <div className="col-md-10">
                        <div className="mb-3">
                          <label className="form-label">Thuộc tính</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Thuộc tính"
                            value={thuoctinhIp}
                            onChange={(e) => setThuoctinhIp(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-md-2">
                        <div className="mb-3">
                          <label
                            className="form-label"
                            style={{ color: "white" }}
                          >
                            Thêm
                          </label>
                          <button
                            type="button"
                            className="btn btn-success"
                            role="button"
                            onClick={() =>
                              handleAddThuoctinhCd(
                                macongdoanEdit,
                                thuoctinhEdit
                              )
                            }
                          >
                            Thêm
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <TableKetqua
                        item={thuoctinhEdit}
                        macongdoan={macongdoanEdit}
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
                <button type="button" className="btn btn-primary">
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleAddThuoctinhCd = async (
    macongdoanEdit: string,
    thuoctinhEdit: string
  ) => {
    try {
      if (thuoctinhIp.trim() !== "") {
        let thuoctinhObj: Thuoctinh = {};

        if (thuoctinhEdit.trim() !== "") {
          thuoctinhObj = JSON.parse(thuoctinhEdit);
        }

        thuoctinhObj[thuoctinhIp] = "OK";
        console.log(thuoctinhObj);

        const data = {
          macongdoan: macongdoanEdit,
          thuoctinh: JSON.stringify(thuoctinhObj),
        };

        await axios.put(
          "http://localhost:3000/truynguyen/capnhatcongdoan",
          data
        );

        showEditForm(macongdoanEdit);
      }
    } catch (error) {
      console.error("Lỗi khi thêm thuộc tính công đoạn:", error);
    }
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
              <label className="form-label text-secondary">Mã công đoạn</label>
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
              <label className="form-label text-secondary">Tên công đoạn</label>
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
                <tr key={item.macongdoan}>
                  <td>{item.macongdoan}</td>
                  <td>{item.tencongdoan}</td>
                  <td>{item.stt}</td>
                  <td>
                    <button
                      className="btn btn-info"
                      role="button"
                      onClick={() => showEditForm(item.macongdoan)}
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
