import { useCallback, useEffect, useRef, useState } from 'react';
import MenuComponent from '../../Menu';
import { sendAPIRequest } from '../../utils/util';
import { Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { ColDef } from 'ag-grid-community';
import { Datadonhang, CustomCSSProperties } from '../../utils/modelAPI';
import React from 'react';


const DSdonhangPage: React.FC = () => {
    const [lot, setLot] = useState('');
    const [result_lot, setrResLot] = useState([]);
    const [result_donhang, setrResdonhang] = useState<Datadonhang[]>([]);
    const gridRef = useRef<AgGridReact<Datadonhang> | null>(null);

    const clearFilters = useCallback(() => {
        if (gridRef.current) {
            const api = gridRef.current.api;
            if (api) {
                api.setFilterModel(null);
            }
        }
    }, []);
    const handleLotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const lot_change = e.target.value;
        setLot(lot_change);
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
    const get_don_hang = async (filters = {}) => {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await sendAPIRequest(
                '/truynguyen/get_don_hang?' + queryString,
                'GET',
                undefined
            );
            setrResdonhang(response);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };
    const handleSearch = () => {
        if (lot == '') {
            alert('Vui lòng chọn lot để tìm');
        } else {
            get_don_hang({ lot });
        }
    };

    useEffect(() => {
        fetchlot();
    }, []);
    const columnDefs1: ColDef<Datadonhang>[] = [
        {
            headerName: 'Model',
            field: 'model',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Lot',
            field: 'lot',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Po',
            field: 'po',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Số lượng ĐT',
            field: 'soluong_dt',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Số lượng PO',
            field: 'soluong',
            editable: true,
            sortable: true,
            filter: true,
            valueFormatter: (params) => {
                const value = Number(params.value);
                return isNaN(value) ? '' : value.toFixed(0);
            },
        },
        {
            headerName: '% Hoàn thành',
            sortable: true,
            filter: true,
            valueGetter: (params: any) => {
                const soluong = params.data.soluong;
                const soluong_dt = params.data.soluong_dt;
                return (soluong !== 0 && soluong !== null)
                    ? ((soluong_dt / soluong) * 100).toFixed(1) + '%'
                    : '';
            },
        },
        {
            headerName: '',              
            cellRenderer: (params: any) => {
                var td = (params.data.soluong !== 0 && params.data.soluong !== null)
                ? Math.floor((params.data.soluong_dt / params.data.soluong) * 100)  : 0;             
                return (
                <div className="range" style={{ "--p": td }  as CustomCSSProperties}>
                    <div className="range__label">Progress</div>
                </div>
                );
            },
            flex: 2
        },
        {
            headerName: '',
            field: 'model',
            sortable: true,
            filter: true,
            cellRenderer: (params: any) => {
                return (
                    <Link
                        to={`/get_model_lot_api/${encodeURIComponent(
                            params.data.model
                        )}/${encodeURIComponent(params.data.lot)}`}
                    >
                        Chi tiết
                    </Link>
                );
            },
        },
    ];
    return (
        <MenuComponent>
            <div className="d-flex align-items-center bg-white px-4 py-1">
                <h5 className="fw-normal text-primary m-0">
                    Danh sách đơn hàng <i className="far fa-question-circle"></i>
                </h5>
                <div className="d-flex ms-auto">
                    <div className="input-custom ms-2">
                        <div>
                            <label className="form-label text-secondary">Lot</label>
                            <input
                                type="search"
                                className="form-control"
                                value={lot}
                                list="list_lot"
                                onChange={handleLotChange}
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
                <div
                    className="ag-theme-quartz"
                    style={{ height: 'calc(100vh - 150px)', width: '100%' }}
                >
                    <AgGridReact
                        ref={gridRef}
                        rowData={result_donhang}
                        columnDefs={columnDefs1}
                        defaultColDef={{                          
                            resizable: true,
                            flex: 1,
                            minWidth: 100,
                        }}
                        pagination={true}
                        paginationPageSize={20}
                        rowDragManaged={true}
                        rowDragEntireRow={true}
                    />
                </div>
            </div>
        </MenuComponent>
    );
};

export default DSdonhangPage;
