import { useCallback, useEffect, useRef, useState } from 'react';
import MenuComponent from '../../Menu';
import { sendAPIRequest } from '../../utils/util';
import { Link, useParams } from 'react-router-dom';
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
    count_ok: number;
}
interface DataNone {
    soluong: number;
    soluong_da_chay: number;   
}
const Get_API_model_lot: React.FC = () => {
    const { model, lot } = useParams<{
        model: string;
        lot: string;
    }>();
    const decodemodel = decodeURIComponent(model || '');
    const decodelot = decodeURIComponent(lot || '');
    const [modelState, setModel] = useState(decodemodel);
    const [lotState, setLot] = useState(decodelot);
    const [loading, setLoading] = useState(false);
    const [result_model, setrResModel] = useState([]);
    const [result_lot, setrResLot] = useState([]);
    const [result_congdoan, setrRescongdoan] = useState([]);
    const [result_label, setrReslabel] = useState<RowData[]>([]);
    const [thongtin, setrResthongtin] = useState<Datatt[]>([]);
    const [resnone, setrResNone] = useState<DataNone[]>([]);
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
                '/truynguyen/get_api_model_lot?' + queryString,
                'GET',
                undefined
            );
            console.log(response);            
            if(response.status == 500)
            {
                alert("Lấy dữ liệu không thành công!");
            }else{
                setrRescongdoan(response.congdoan);
                setrReslabel(response.results);
                setrResthongtin(response.info);
                setrResNone(response.none || []);
                console.log(response.none);
            }
           
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        } finally {
            setLoading(false); // Kết thúc loading
        }
    };
    const handleSearch = () => {
        get_api_itg({ modelState, lotState });
    };
    useEffect(() => {
        fetchmodel();
    }, [decodemodel, decodelot]);
    const columnDefs = [
        {
            headerName: 'Label',
            field: 'label',
            sortable: true,
            cellRenderer: (params: any) => (
                <Link to={`/chi_tiet_label/${encodeURIComponent(params.value)}`} target="_blank">
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
    const row_md_1 = result_congdoan.length + 1;
    let col2 = row_md_1 < 3 ? 12 : row_md_1 < 5 ? 6 : row_md_1 < 7 ? 4 : row_md_1 < 9 ? 3 : 2;
    return (
        <MenuComponent>
            <div className="d-flex align-items-center bg-white px-4 py-1">
                <h5 className="fw-normal text-primary m-0">
                    Dữ liệu báo cáo ITG <i className="far fa-question-circle"></i>
                </h5>
                <div className="d-flex ms-auto">
                    <div className="input-custom ms-2">
                        <div>
                            <label className="form-label text-secondary">Model</label>
                            <input
                                type="search"
                                className="form-control"
                                list="list_model"
                                value={modelState}
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
                                value={lotState}
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
                                {resnone?.length > 0 &&
                                resnone?.[0]?.soluong - resnone?.[0]?.soluong_da_chay !== 0 ? (
                                    <div className={`col-md-${col2} p-3`}>
                                        <div className="bg-xanh btn-mh d-flex flex-column align-items-center justify-content-center text-center">
                                            <div style={{ fontWeight: 'bold' }}>
                                                {resnone[0].soluong - resnone[0].soluong_da_chay}
                                            </div>
                                            <div style={{ fontSize: '16px', marginTop: '4px' }}>
                                                <Link
                                                    style={{ color: 'white' }}
                                                    target="_blank"
                                                    to={`/list_tiet_label_none/${encodeURIComponent(
                                                        modelState || ''
                                                    )}/${encodeURIComponent(
                                                        lotState || ''
                                                    )}/None/0/${encodeURIComponent(
                                                        resnone[0]?.soluong || ''
                                                    )}`}
                                                >
                                                    None
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                {thongtin &&
                                    Object.entries(thongtin).map(([key, it]) => (
                                        <div key={key} className={`col-md-${col2} p-3`}>
                                            <div className="bg-xanh btn-mh d-flex flex-column align-items-center justify-content-center text-center">
                                                <div style={{ fontWeight: 'bold' }}>
                                                    {key === 'Sửa chữa'
                                                        ? it.count_ok
                                                        : `${it.count_ok}/${it.soluong}`}
                                                </div>
                                                <div style={{ fontSize: '16px', marginTop: '4px' }}>
                                                    <Link
                                                        style={{ color: 'white' }}
                                                        target="_blank"
                                                        to={`/list_tiet_label_none/${encodeURIComponent(
                                                            modelState || ''
                                                        )}/${encodeURIComponent(
                                                            lotState || ''
                                                        )}/${encodeURIComponent(
                                                            key || ''
                                                        )}/${encodeURIComponent(
                                                            it.count_ok || ''
                                                        )}/${encodeURIComponent(it.soluong || '')}`}
                                                    >
                                                        {key}
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
                                    minWidth: 200,
                                }}
                                pagination={true}
                                paginationPageSize={20}
                            />
                        </div>
                    </>
                )}
            </div>
        </MenuComponent>
    );
};
export default Get_API_model_lot;
