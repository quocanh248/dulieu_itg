import React, { useEffect, useMemo, useState } from "react";
import { sendAPIRequest } from "../../utils/util";
import MenuComponent from "../../Menu";
import { useParams } from "react-router-dom";

// Định nghĩa kiểu dữ liệu cho các item
interface ChitietItem {
  thuoctinh: string;
  ketqua: string;
  congdoan: string;
  vitri: string;
  ngay: string;
  giobatdau: string;
  gioketthuc: string;
  manhanvien: string;
  quanly: string;
  mathietbi: string;
}

interface ThongtinItem {
  model: string;
  vitri: string;
  label: string;
  mathung: string;
}

interface NhanVien {
  mnv: string;
  ten_nv: string;
  img_nv: string;
}

// Định nghĩa kiểu dữ liệu cho các props
interface TableProps {
  item: ChitietItem;
  get_ten_nhan_su: (chuoi: string) => Promise<NhanVien[]>;
}

function AdminPage() {
  const [resultThongtin, setResultThongtin] = useState<ThongtinItem[]>([]);
  const [resultChitiet, setResultChitiet] = useState<ChitietItem[]>([]);
  // const [resultRows, setResultRows] = useState<React.ReactNode[]>([]);
  const { label } = useParams<{ label: string }>();
  const decodedLabel = decodeURIComponent(label || "");

  const processData = (chitiet: ChitietItem[]) => {
    let keyData: { [key: string]: string } = {};
    chitiet.forEach((item) => {
      const thuoctinhs = JSON.parse(item.thuoctinh);      
      for (const [key, value] of Object.entries(thuoctinhs)) {
        if (value !== null) {
          if (!(key in keyData) || keyData[key] !== item.ketqua) {
            keyData[key] = item.ketqua;
          }
        }
      }
    });
    return keyData;
  };

  const keyData = useMemo(() => processData(resultChitiet), [resultChitiet]);

  const fetchData = async () => {
    try {
      const response = await sendAPIRequest(
        "/truynguyen/chi_tiet_label?label=" + decodedLabel,
        "GET"
      );
      setResultThongtin(response.thongtin);
      setResultChitiet(response.chitiet);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  };

  const get_ten_nhan_su = async (chuoi: string): Promise<NhanVien[]> => {
    const manhanviens = chuoi.split(",");
    const results = await Promise.all(
      manhanviens.map(async (mnv) => {
        try {
          const response = await sendAPIRequest(
            "/users/ten_nhan_su?manhansu=" + mnv,
            "GET"
          );
          const parts = response.split("+");
          return {
            mnv,
            ten_nv: parts[0] !== "Chưa cập nhật" ? parts[0] : "Chưa cập nhật",
            img_nv: parts[1] || "",
          };
        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu:", error);
          return { mnv, ten_nv: "Chưa cập nhật", img_nv: "" };
        }
      })
    );
    return results;
  };

  useEffect(() => {
    if (decodedLabel) {
      fetchData();
    }
  }, [decodedLabel]);

  useEffect(() => {
    if (resultChitiet.length > 0) {
      const resultData = resultChitiet
        .map((item) => {
          const thuoctinhs = JSON.parse(item.thuoctinh);
          const color = item.ketqua === "NG" ? "red" : "#78f056";
          const img = item.ketqua === "NG" ? "uncheck.png" : "check.png";
          return Object.entries(thuoctinhs).map(([key, value]) => {
            if (value !== null) {
              return (
                <tr key={key}>
                  <td>
                    <img className="img_info" src={`${img}`} alt="" />
                  </td>
                  <td>
                    <label style={{ marginLeft: "120px" }}>
                      <b>{key}</b>
                    </label>
                  </td>
                  <td>
                    <label style={{ marginLeft: "120px", color }}>
                      {item.ketqua}
                    </label>
                  </td>
                </tr>
              );
            }
            return null;
          });
        })
        .flat();
      if (resultData.length === 0) {
        resultData.push(
          <tr key="default">
            <td>
              <img className="img_info" src="/assets/img/check.png" alt="" />
            </td>
            <td>
              <label style={{ marginLeft: "120px" }}>
                <b>CXĐ</b>
              </label>
            </td>
            <td>
              <label style={{ marginLeft: "120px", color: "#78f056" }}>
                {resultChitiet[0].ketqua}
              </label>
            </td>
          </tr>
        );
      }
      // setResultRows(resultData);
    }
  }, [resultChitiet]);

  return (
    <MenuComponent>
      <div className="d-flex align-items-center bg-white px-4 py-1">
        <h4 className="fw-normal text-primary m-0">
          Chi tiết label <b style={{ color: "red" }}>{decodedLabel}</b>
        </h4>
        <div className="d-flex ms-auto">
          <div className="input-custom ms-2" style={{ visibility: "hidden" }}>
            <div>
              <label className="form-label text-secondary">Model</label>
            </div>
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="bg-white p-3">
          <div className="row">
            <div className="col-md-6 text-center">
              <h5 className="fw-normal text-primary m-0">
                {resultThongtin.length > 0 && resultThongtin[0].model}
              </h5>{" "}
              <br />
              <label>
                {resultThongtin.length > 0 && resultThongtin[0].vitri}
              </label>
            </div>
            <div className="col-md-6 border-start">
              <div className="row">
                <div className="col-md-12 text-center">
                  <h5 className="fw-normal text-primary m-0">
                    {resultThongtin.length > 0 && resultThongtin[0].label}
                  </h5>{" "}
                  <br />
                </div>
              </div>
              <div className="row">
                <div className="col-md-12 d-flex align-items-center justify-content-center">
                  <table className="table_label text-start">
                    <tbody>
                      {Object.entries(keyData).length > 0 &&
                        Object.entries(keyData).map(([key, ketqua]) => (
                          <tr key={key}>
                            <td>
                              <b>{key}</b>
                            </td>
                            <td>
                              <label
                                style={{
                                  marginLeft: "120px",
                                  color: ketqua === "NG" ? "red" : "green",
                                }}
                              >
                                {ketqua}
                              </label>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-md-2 d-flex align-items-center">
              <img className="img_packed" src="/assets/img/packed.png" alt="" />
            </div>
            <div className="col-md-10">
              <label>Sản phẩm đang ở trong thùng: </label> <br /> <br />
              <label className="text-primary" style={{ fontSize: "18px" }}>
                {resultThongtin.length > 0 && resultThongtin[0].mathung}
              </label>
            </div>
          </div>
          <hr />
          {resultChitiet &&
            resultChitiet.map((item, index) => (
              <div key={index} className="row p-3">
                <div className="col-3 text-end">
                  <label className="text-primary">{item.ngay}</label> <br />{" "}
                  <br />
                  <label className="text-primary">
                    <b>{item.congdoan}</b>
                  </label>
                  <br /> <br />
                  <label>
                    <b>{item.vitri}</b>
                  </label>
                </div>
                <div className="col-md-9 border-start p-3">
                  <label className="text-primary">Thông tin chung:</label>
                  <br />
                  <br />
                  <table className="table_label">
                    <tbody>
                      <tr>
                        <td>
                          <img
                            className="img_info"
                            src="/assets/img/clock.png"
                            alt=""
                          />
                        </td>
                        <td>
                          <label style={{ marginLeft: "120px" }}>
                            {item.giobatdau} &rarr; {item.gioketthuc}
                          </label>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <label className="text-primary">Quản lý:</label>
                  <br />
                  <br />
                  <TableQuanLy item={item} get_ten_nhan_su={get_ten_nhan_su} />
                  <label className="text-primary">Nhân viên:</label>
                  <br />
                  <br />
                  <TableNhanVien
                    item={item}
                    get_ten_nhan_su={get_ten_nhan_su}
                  />
                  <label className="text-primary">Thiết bị:</label>
                  <br />
                  <br />
                  <Tablethietbi item={item} />
                  <label className="text-primary">Kết quả kiểm tra:</label>
                  <br />
                  <br />
                  <Tableketqua item={item} />
                </div>
              </div>
            ))}
        </div>
      </div>
    </MenuComponent>
  );
}
const Tablethietbi: React.FC<{ item: ChitietItem }> = ({ item }) => {
  const chuoi = item.mathietbi;
  const mathietbis = chuoi.split(",");
  return (
    <table className="table_label">
      <tbody>
        {mathietbis.length > 1 ? (
          mathietbis.map((mtb, index) => (
            <tr key={index}>
              <td>
                <img className="img_info" src="/assets/img/thietbi.png" />
              </td>
              <td>
                <label style={{ marginLeft: "120px" }}>{mtb}</label>
              </td>
              <td>
                <label style={{ marginLeft: "120px" }}>1 PSC</label>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td>
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
const Tableketqua: React.FC<{ item: ChitietItem }> = ({ item }) => {
  const ketqua = item.ketqua;
  const thuoctinhs = JSON.parse(item.thuoctinh);
  const color = ketqua === "NG" ? "red" : "#78f056";
  const img =
    ketqua === "NG" ? "/assets/img/uncheck.png" : "/assets/img/check.png";
  return (
    <table className="table_label">
      <tbody>
        {Object.entries(thuoctinhs).length > 0 ? (
          Object.entries(thuoctinhs).map(([key, value]) => {
            if (value !== null) {
              return (
                <tr key={key}>
                  <td>
                    <img className="img_info" src={`${img}`} alt="" />
                  </td>
                  <td>
                    <label style={{ marginLeft: "120px" }}>
                      <b>{key}</b>
                    </label>
                  </td>
                  <td>
                    <label style={{ marginLeft: "120px", color }}>
                      {ketqua}
                    </label>
                  </td>
                </tr>
              );
            }
            return null;
          })
        ) : (
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
const TableNhanVien: React.FC<TableProps> = ({ item, get_ten_nhan_su }) => {
  const [tenNhanVien, setTenNhanVien] = useState<NhanVien[]>([]);

  useEffect(() => {
    if (item.manhanvien) {
      get_ten_nhan_su(item.manhanvien).then((data) => setTenNhanVien(data));
    }
  }, [item.manhanvien, get_ten_nhan_su]);

  return (
    <table className="table_label">
      <tbody>
        {tenNhanVien.length > 0 ? (
          tenNhanVien.map((nv, index) => (
            <tr key={index}>
              <td>
                <img className="img_info" src={nv.img_nv} />
              </td>
              <td>
                <label style={{ marginLeft: "120px" }}>{nv.ten_nv}</label>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td>Không có mã nhân viên</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

const TableQuanLy: React.FC<TableProps> = ({ item, get_ten_nhan_su }) => {
  const [tenNhanVien, setTenNhanVien] = useState<NhanVien[]>([]);
  useEffect(() => {
    if (item.quanly) {
      get_ten_nhan_su(item.quanly).then((data) => setTenNhanVien(data));
    }
  }, [item.quanly, get_ten_nhan_su]);

  return (
    <table className="table_label">
      <tbody>
        {tenNhanVien.length > 0 ? (
          tenNhanVien.map((nv, index) => (
            <tr key={index}>
              <td>
                <img className="img_info" src={nv.img_nv} />
              </td>
              <td>
                <label style={{ marginLeft: "120px" }}>{nv.ten_nv}</label>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td>Không có mã nhân viên</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};
export default AdminPage;