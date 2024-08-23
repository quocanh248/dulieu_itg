import  { useEffect, useState } from "react";
import { sendAPIRequest } from "../../utils/util";
import MenuComponent from "../../Menu";
import { Link, useParams } from "react-router-dom";
import {  DataNone } from "../../utils/modelAPI";
import DataTable from "react-data-table-component";

function DetailpackedPage() {
  const [resultthung, setResulthung] = useState<DataNone[]>([]);
  const { mathung } = useParams<{ mathung: string }>();
  const decodedmathung = decodeURIComponent(mathung || "");
  const fetchData = async () => {
    try {
      const response = await sendAPIRequest(
        "/truynguyen/chi_tiet_thung?mathung=" + decodedmathung,
        "GET"
      );
      setResulthung(response);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  };
  useEffect(() => {
    if (decodedmathung) {
      fetchData();
    }
  }, [decodedmathung]);
  const columns = [
    {
      name: "Label",
      selector: (row: DataNone) => row.label,
      cell: (row: DataNone) => (
        <Link to={`/chi_tiet_label/${encodeURIComponent(row.label)}`}>
          {row.label}
        </Link>
      ),
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
          Chi tiết thùng <b style={{ color: "red" }}>{decodedmathung}</b>
        </h5>
        <div className="d-flex ms-auto">
          <div className="input-custom ms-2" style={{ visibility: "hidden" }}>
            <div>
              <label className="form-label text-secondary">Model</label>
            </div>
          </div>
        </div>
      </div> 
      <div className="p-3">
        <div className="bg-white body-table">
          <DataTable
            columns={columns}
            data={resultthung} // Dữ liệu từ mảng missingLabels
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
export default DetailpackedPage;
