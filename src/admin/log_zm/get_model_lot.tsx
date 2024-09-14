import { useCallback, useEffect, useRef, useState } from 'react';
import MenuComponent from '../../Menu';
import { sendAPIRequest } from '../../utils/util';
import { Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import React from 'react';
interface RowData {
    label: string;
    [key: string]: any; // Để có thể chứa các giá trị khác không biết trước
}
interface Datatt {
    congdoan: string;
    soluong: number;
    so_luong_ok: number;
}
const Modelot_zm_Page: React.FC = () => {
    const [model, setModel] = useState('');
    const [lot, setLot] = useState('');
    const [loading, setLoading] = useState(false);
    const [result_model, setrResModel] = useState([]);
    const [result_lot, setrResLot] = useState([]);
    const [result_congdoan, setrRescongdoan] = useState([]);
    const [result_label, setrReslabel] = useState<RowData[]>([]);
    const [thongtin, setrResthongtin] = useState<Datatt[]>([]);
    const gridRef = useRef<AgGridReact<RowData> | null>(null);

    const clearFilters = useCallback(() => {
        if (gridRef.current) {
            const api = gridRef.current.api;
            if (api) {
                api.setFilterModel(null);
            }
        }
    }, []);
    // Xử lý sự kiện thay đổi giá trị của input
    const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const model_change = e.target.value;
        setModel(model_change);
        if (model_change !== '') {
            fetchlot({ model_change });
        }
    };
    const fetchmodel = async (filters = {}) => {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await sendAPIRequest(
                '/truynguyen/list_model?' + queryString,
                'GET',
                undefined
            );
            setrResModel(response);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu năng suất:', error);
        }
    };
    const fetchlot = async (filters = {}) => {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await sendAPIRequest(
                '/truynguyen/list_lot?' + queryString,
                'GET',
                undefined
            );
            setrResLot(response);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu năng suất:', error);
        }
    };
    const get_api_itg = async (filters = {}) => {
        setLoading(true); // Bắt đầu loading
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await sendAPIRequest(
                '/logzm/get_log_zm_model_lot?' + queryString,
                'GET',
                undefined
            );
            const thongtin_1 = Object.keys(response.info).map((key) => ({
                congdoan: key,
                so_luong_ok: response.info[key].so_luong_ok, // Đổi `count_ok` thành `so_luong_ok`
                soluong: response.info[key].soluong,
            }));
            console.log(thongtin_1);

            // Cập nhật state với dữ liệu `thongtin`
            setrResthongtin(thongtin_1);
            setrRescongdoan(response.congdoan);
            setrReslabel(response.results);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        } finally {
            setLoading(false); // Kết thúc loading
        }
    };
    const handleSearch = () => {
        get_api_itg({ model, lot });
    };
    useEffect(() => {
        fetchmodel();
    }, []);
    const columnDefs = [
        {
            headerName: 'Label',
            field: 'label',
            sortable: true,
            cellRenderer: (params: any) => (
                <Link to={`/chi_tiet_label_zm/${encodeURIComponent(params.value)}`}>
                    {params.value}
                </Link>
            ),
        },
        ...result_congdoan.map((congdoanItem) => ({
            headerName: congdoanItem,
            field: congdoanItem,
            sortable: true,
            valueGetter: (params: any) => {             
                return params.data[congdoanItem] || 'None';
            },
            cellRenderer: (params: any) => params.value, 
            filter: 'agTextColumnFilter',
        })),
    ];
    const row_md_1 = result_congdoan.length;
    let col = row_md_1 < 3 ? 12 : row_md_1 < 5 ? 6 : row_md_1 < 7 ? 4 : row_md_1 < 9 ? 3 : 2;

    return (
        <MenuComponent>
            <div className="d-flex align-items-center bg-white px-4 py-1">
                <h5 className="fw-normal text-primary m-0">
                    Dữ liệu log Zenmom <i className="far fa-question-circle"></i>
                </h5>
                <div className="d-flex ms-auto">
                    <div className="input-custom ms-2">
                        <div>
                            <label className="form-label text-secondary">Model</label>
                            <input
                                type="search"
                                className="form-control"
                                list="list_model"
                                value={model}
                                onChange={handleModelChange}
                            />
                            <datalist id="list_model">
                                {result_model.map((item) => (
                                    <option
                                        key={(item as { model: string }).model}
                                        value={(item as { model: string }).model}
                                    ></option>
                                ))}
                            </datalist>
                        </div>
                    </div>
                    <div className="input-custom ms-2">
                        <div>
                            <label className="form-label text-secondary">Lot</label>
                            <input
                                type="search"
                                className="form-control"
                                value={lot}
                                list="list_lot"
                                onChange={(e) => setLot(e.target.value)}
                            />
                            <datalist id="list_lot">
                                {result_lot.map((item) => (
                                    <option
                                        key={(item as { lot: string }).lot}
                                        value={(item as { lot: string }).lot}
                                    ></option>
                                ))}
                            </datalist>
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-center p-2">
                        <button className="btn btn-primary" onClick={handleSearch}>
                            <i className="fas fa-search"></i> Tìm
                        </button>
                    </div>
                    <div className="d-flex align-items-center justify-content-center p-2 border-start">
                        <button className="btn" onClick={() => clearFilters()}>
                            <i className="fas fa-redo"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div className="p-3">
                {loading ? (
                    <div
                        className="d-flex align-items-center justify-content-center"
                        style={{ minHeight: '400px' }}
                    >
                        <div className="loader"></div>
                    </div>
                ) : (
                    <>
                        <div className="bg-white body-table-top">
                            <div className="row px-2">
                                {thongtin.map((it, index) => (
                                    <div key={index} className={`col-md-${col} p-3`}>
                                        <div className="bg-xanh btn-mh d-flex flex-column align-items-center justify-content-center text-center">
                                            <div style={{ fontWeight: 'bold' }}>
                                                {it.so_luong_ok}/{it.soluong}
                                            </div>
                                            <div style={{ fontSize: '16px', marginTop: '4px' }}>
                                                <Link
                                                    style={{ color: 'white' }}
                                                    target="_blank"
                                                    to={`/list_label_cd_zm/${encodeURIComponent(
                                                        model || ''
                                                    )}/${encodeURIComponent(
                                                        lot || ''
                                                    )}/${encodeURIComponent(
                                                        it.congdoan || ''
                                                    )}/${encodeURIComponent(
                                                        it.so_luong_ok || ''
                                                    )}/${encodeURIComponent(it.soluong || '')}`}
                                                >
                                                    {it.congdoan}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div
                            className="ag-theme-alpine"
                            style={{ height: 'calc(100vh - 338px)', width: '100%' }}
                        >
                            <AgGridReact
                                ref={gridRef}
                                rowData={result_label}
                                columnDefs={columnDefs}
                                defaultColDef={{
                                    sortable: true,
                                    filter: true,
                                    resizable: true,
                                    flex: 1,
                                    minWidth: 100,
                                }}
                                pagination={true}
                                paginationPageSize={10}
                            />
                        </div>
                    </>
                )}
            </div>
        </MenuComponent>
    );
};

export default Modelot_zm_Page;
