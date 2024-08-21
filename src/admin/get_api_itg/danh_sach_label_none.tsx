import { useEffect, useState } from "react";
import MenuComponent from "../../Menu";
import { sendAPIRequest } from "../../utils/util";
import DataTable from "react-data-table-component";
import { useParams } from "react-router-dom";

function AdminPage() {
  const [result_none, setrResnone] = useState<string[]>([]);
  const { model, lot, soluong } = useParams<{
    model: string;
    lot: string;
    soluong: string;
  }>();

  const decodemodel = decodeURIComponent(model || "");
  const decodelot = decodeURIComponent(lot || "");
  const decodesoluong = decodeURIComponent(soluong || "");

  const get_nhom_cap_2_cap_1 = async () => {
    try {
      const response = await sendAPIRequest(
        `/truynguyen/get_label_none?model=${decodemodel}&lot=${decodelot}&soluong=${decodesoluong}`,
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
    if (decodemodel && decodelot && decodesoluong) {
      get_nhom_cap_2_cap_1();
    }
  }, [decodemodel, decodelot, decodesoluong]);

  const columns = [
    {
      name: "Label",
      selector: (row: string) => row, // Trả về giá trị chuỗi cho mỗi label
      sortable: true,
    },
    {
        name: "Trạng thái",
        selector: () => "None", // Trả về giá trị chuỗi cho mỗi label
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
          <div className="input-custom ms-2" >
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
