import { ChangeEvent, useEffect, useState } from "react";
import exportToExcel from "../../utils/exportToExcel";
import MenuComponent from "../../Menu";
import { sendAPIRequest } from "../../utils/util";
import DataTable from "react-data-table-component";
import { format } from "date-fns";

// Định nghĩa kiểu cho dữ liệu hàng trong bảng
interface ItemData {
  manhansu: string;
  tennhansu: string;
  tennhom: string;
  model: string;
  lot: string;
  ngay: string;
  congdoan: string;
  vitri: string;
  soluong: number;
  thoigianthuchien: number;
  thoigianquydoi: number;
  sum_time: number;
  thoigianlamviec: number;
}

interface Data_tonghop {
  manhansu: string;
  tennhansu: string;
  tennhom: string;
  ngay: string;
  vitri: string;
  sum_soluong: number;
  sum_time: number;
}
function AdminPage() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const formattedDate = yesterday.toISOString().split("T")[0];
  const [date, setDate] = useState<string>(formattedDate);
  const [manhansu, setManhansu] = useState("");
  const [result, setResult] = useState<ItemData[]>([]);
  const [result_nhansu, setNhansus] = useState<ItemData[]>([]);
  const [resultth, setResultTH] = useState<Data_tonghop[]>([]);
  const [isFormEdit, setIsFormEdit] = useState<boolean>(false);
  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };
  const handleExport = async () => {
    try {
      const res = await fetchexcel({ date });
      if (res && res.length > 0) {
        const filename = `Dữ liệu năng suất ngày ${date}.xlsx`;
        await exportToExcel(res, filename);
      } else {
        console.log("Không có dữ liệu để xuất");
      }
    } catch (error) {
      console.error("Đã xảy ra lỗi:", error);
    }
  };

  const fetchexcel = async (
    filters: Record<string, any>
  ): Promise<ItemData[]> => {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await sendAPIRequest(
        "/nang_suat/search?" + queryString,
        "GET",
        undefined
      );
      return response; // Trả về dữ liệu nhận được từ API
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu năng suất:", error);
      return []; // Trả về mảng rỗng nếu có lỗi
    }
  };

  const fetchnangsuat = async (filters: Record<string, any>): Promise<void> => {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await sendAPIRequest(
        "/nang_suat/search_nhansu?" + queryString,
        "GET",
        undefined
      );
      setResultTH(response);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu năng suất:", error);
    }
  };

  const handleSearch = () => {
    fetchnangsuat({ date, manhansu });
  };
  const columns_detail = [
    {
      name: "Tên nhân viên",
      selector: (row: ItemData) => row.tennhansu,
      sortable: true,
    },
    {
      name: "Model",
      selector: (row: ItemData) => row.model,
      sortable: true,
    },
    {
      name: "Lot",
      selector: (row: ItemData) => row.lot,
      sortable: true,
    },
    {
      name: "Công đoạn",
      selector: (row: ItemData) => row.congdoan,
      sortable: true,
    },
    {
      name: "Số lượng",
      selector: (row: ItemData) => row.soluong,
      sortable: true,
    },
    {
      name: "Thời gian thực hiện",
      selector: (row: ItemData) => {
        const value = Number(row.thoigianthuchien);
        return isNaN(value) ? "N/A" : value.toFixed(2);
      },
      sortable: true,
    },
    {
      name: "Thời gian quy đổi",
      selector: (row: ItemData) =>
        row.sum_time !== 0
          ? (
              (row.thoigianthuchien / row.sum_time) *
              row.thoigianlamviec
            ).toFixed(2)
          : "0.00",
      sortable: true,
    },
    {
      name: "Thời gian làm việc",
      selector: (row: ItemData) => row.thoigianlamviec,
      sortable: true,
    },
  ];
  const toggleScrollAndModal = (isOpen: boolean) => {
    if (isOpen) {
      document.body.classList.add("no-scroll");
    } else {
      // document.body.classList.remove("no-scroll");
    }
    setIsFormEdit(isOpen);
  };
  const htmlDetailForm = (): React.ReactNode => {
    return (
      <div className={`modal-overlay ${isFormEdit ? "d-block" : "d-none"}`}>
        <div className={`modal ${isFormEdit ? "d-block" : "d-none"}`}>
          <div
            className="modal-dialog"
            style={{ width: "80%", maxWidth: "none" }}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết năng suất nhân sự</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() => toggleScrollAndModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div id="basic" className="tab-pane fade show active">
                  <div className="row">
                    <div className="App">
                      <DataTable
                        columns={columns_detail}
                        data={result}
                        fixedHeader
                        fixedHeaderScrollHeight="calc(80vh - 172px)"
                        responsive
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <div className="ms-auto">
                  <button
                    type="button"
                    className="btn btn-light"
                    data-bs-dismiss="modal"
                    onClick={() => toggleScrollAndModal(false)}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const columns = [
    {
      name: "Mã nhân viên",
      selector: (row: Data_tonghop) => row.manhansu,
      sortable: true,
    },
    {
      name: "Tên nhân viên",
      selector: (row: Data_tonghop) => row.tennhansu,
      sortable: true,
    },
    {
      name: "Bộ phận",
      selector: (row: Data_tonghop) => row.tennhom,
      sortable: true,
    },
    {
      name: "Ngày",
      selector: (row: Data_tonghop) => format(new Date(row.ngay), "dd/MM/yyyy"), // Định dạng ngày
      sortable: true,
    },
    {
      name: "Số lượng",
      selector: (row: Data_tonghop) => {
        const value = Number(row.sum_soluong);
        return isNaN(value) ? "N/A" : value.toFixed(2);
      },
      sortable: true,
    },
    {
      name: "Thời gian thực hiện",
      selector: (row: Data_tonghop) => {
        const value = Number(row.sum_time);
        return isNaN(value) ? "N/A" : value.toFixed(2);
      },
      sortable: true,
    },
  ];
  const handleRowClicked = async (row: Record<string, any>) => {
    try {
      var n = format(new Date(row.ngay), "yyyy-MM-dd");
      const response = await sendAPIRequest(
        `/nang_suat/search?manhansu=${encodeURIComponent(
          row.manhansu
        )}&date=${encodeURIComponent(n)}`,
        "GET",
        undefined
      );
      console.log(response);
      setResult(response);
      toggleScrollAndModal(true);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      // Xử lý lỗi nếu cần thiết
    }
  };
  const fetchAccounts = async (filters: Record<string, string> = {}) => {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await sendAPIRequest(
        "/users/list_nhansu?" + queryString,
        "GET",
        undefined       
      );
      setNhansus(response);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tài khoản:", error);
    }
  };
  useEffect(() => {
    fetchAccounts();
  }, []);
  return (
    <MenuComponent>
      <div className="d-flex align-items-center bg-white px-4 py-1">
        <h4 className="fw-normal text-primary m-0">
          Dữ liệu năng suất <i className="far fa-question-circle"></i>
        </h4>
        <div className="d-flex ms-auto">
          <div className="input-custom ms-2">
            <div>
              <label className="form-label text-secondary">Mã nhân sự</label>
              <input
                type="search"
                className="form-control"
                value={manhansu}
                list="list_nhan_su"
                onChange={(e) => setManhansu(e.target.value)}
              />
              <datalist id="list_nhan_su">
                {result_nhansu.map((item) => (
                  <option key={item.manhansu} value={item.manhansu}>
                    {item.tennhansu}
                  </option>
                ))}
              </datalist>
            </div>
          </div>
          <div className="input-custom ms-2">
            <div>
              <label className="form-label text-secondary">Ngày</label>
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={handleDateChange}
              />
            </div>
          </div>
          <div className="d-flex align-items-center justify-content-center p-2">
            <button className="btn btn-primary" onClick={handleSearch}>
              <i className="fas fa-search"></i> Tìm
            </button>
          </div>
          <div className="d-flex align-items-center justify-content-center">
            <button className="btn btn-success" onClick={handleExport}>
              <i className="fas fa-download"></i> Excel
            </button>
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="bg-white body-table">
          <DataTable
            columns={columns}
            data={resultth}
            pagination
            paginationPerPage={15}
            fixedHeader
            fixedHeaderScrollHeight="calc(100vh - 202px)"
            responsive
            onRowClicked={handleRowClicked}
          />
        </div>
      </div>
      {htmlDetailForm()}
    </MenuComponent>
  );
}

export default AdminPage;
