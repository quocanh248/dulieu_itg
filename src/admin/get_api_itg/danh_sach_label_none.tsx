import { useEffect, useState } from "react";
import MenuComponent from "../../Menu";
import { sendAPIRequest } from "../../utils/util";
import DataTable from "react-data-table-component";
import { useParams } from "react-router-dom";

interface DataNone {
  label: string;
  ngay: string;
  giobatdau: string;
  gioketthuc: string;
  trangthai: string;
}
function AdminPage() {
  const [result_none, setrResnone] = useState<DataNone[]>([]);
  const { model, lot, congdoan, soluong_ok, soluong } = useParams<{
    model: string;
    lot: string;
    congdoan: string;
    soluong_ok: string;
    soluong: string;
  }>();

  const decodemodel = decodeURIComponent(model || "");
  const decodelot = decodeURIComponent(lot || "");
  const decodecongdoan = decodeURIComponent(congdoan || "");
  const decodesoluong_ok = decodeURIComponent(soluong_ok || ""); 
  const decodesoluong = decodeURIComponent(soluong || "");

  const get_nhom_cap_2_cap_1 = async () => {
    try {
      const response = await sendAPIRequest(
        `/truynguyen/get_label_none?model=${decodemodel}&lot=${decodelot}&congdoan=${decodecongdoan}&soluong_ok=${decodesoluong_ok}&soluong=${decodesoluong}`,
        "GET",
        undefined
      );
      console.log(response.missingLabels);
      setrResnone(response.missingLabels); // Thiết lập dữ liệu
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  };

  useEffect(() => {
    if (decodemodel && decodelot && decodecongdoan && decodesoluong_ok && decodesoluong) {
      get_nhom_cap_2_cap_1();
    }
  }, [decodemodel, decodelot, decodecongdoan, decodesoluong_ok, decodesoluong]);

  const columns = [
    {
      name: "Label",
      selector: (row: DataNone) => row.label,
      sortable: true,
    },
    {
      name: "Trạng thái",
      selector: (row: DataNone) => row.trangthai,
      sortable: true,
    },
    {
      name: "Ngày",
      selector: (row: DataNone) => row.ngay,
      sortable: true,
    },
    {
      name: "Giờ bắt đầu",
      selector: (row: DataNone) => row.giobatdau,
      sortable: true,
    },
    {
      name: "Giờ kết thúc",
      selector: (row: DataNone) => row.gioketthuc,
      sortable: true,
    },
  ];

  return (
    <MenuComponent>
      <div className="d-flex align-items-center bg-white px-4 py-1">
        <h5 className="fw-normal text-primary m-0">
          Danh sách Label chưa chạy <i className="far fa-question-circle"></i>
        </h5>
        <div className="d-flex ms-auto" style={{ visibility: "hidden" }}>
          <div className="input-custom ms-2">
            <div>
              <label className="form-label text-secondary">Mã nhóm cấp 2</label>
              <input type="search" className="form-control" />
            </div>
          </div>
          <div className="input-custom ms-2">
            <div>
              <label className="form-label text-secondary">
                Tên nhóm cấp 2
              </label>
              <input type="search" className="form-control" />
            </div>
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="bg-white body-table">
          <DataTable
            columns={columns}
            data={result_none} // Dữ liệu từ mảng missingLabels
            pagination
            paginationPerPage={15}
            fixedHeader
            fixedHeaderScrollHeight="calc(100vh - 202px)"
            responsive
            style={{ fontSize: "16px" }}
          />
        </div>
      </div>
    </MenuComponent>
  );
}

export default AdminPage;
