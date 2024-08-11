import { ChangeEvent, useState } from "react";
import exportToExcel from "../../utils/exportToExcel";
import MenuComponent from "../../Menu";
import { sendAPIRequest } from "../../utils/util";
import DataTable from "react-data-table-component";
import { format } from 'date-fns';

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

function AdminPage() {
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [result, setResult] = useState<ItemData[]>([]); // Khởi tạo với kiểu ItemData

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
        "/nang_suat/search?" + queryString,
        "GET",
        undefined
      );
      setResult(response);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu năng suất:", error);
    }
  };

  const handleSearch = () => {
    fetchnangsuat({ date });
  };
  const columns = [
    {
      name: "Mã nhân viên",
      selector: (row: ItemData) => row.manhansu,
      sortable: true,
    },
    {
      name: "Tên nhân viên",
      selector: (row: ItemData) => row.tennhansu,
      sortable: true,
    },
    {
      name: "Bộ phận",
      selector: (row: ItemData) => row.tennhom,
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
      name: 'Ngày', 
      selector: (row: ItemData) => format(new Date(row.ngay), 'dd/MM/yyyy'), // Định dạng ngày
      sortable: true 
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
      selector: (row: ItemData) => row.thoigianthuchien,
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
  return (
    <MenuComponent>
      <div className="d-flex align-items-center bg-white px-4 py-1">
        <h4 className="fw-normal text-primary m-0">
          Dữ liệu năng suất <i className="far fa-question-circle"></i>
        </h4>
        <div className="d-flex ms-auto">
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
        <div className="bg-white">
          <div className="App">
            <DataTable
              columns={columns}
              data={result}
              responsive              
            />
          </div>
        </div>
      </div>
    </MenuComponent>
  );
}

export default AdminPage;
