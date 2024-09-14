'use strict';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { ColDef } from 'ag-grid-community';
import { sendAPIRequest } from '../../utils/util';
import MenuComponent from '../../Menu';

interface DataLine {
    model: string;
    lot: string;
    vitri: string;
    mathietbi: string;
    ngay: string;
    congdoan: string;
    soluong: number;
    so_luong_du_lieu: number;
}

const PageDataLine: React.FC = () => {
    const date_now = new Date();   
    const formattedDate = date_now.toISOString().split('T')[0];
    const [date, setDate] = useState<string>(formattedDate);
    const [vitri, setVitri] = useState<string>();
    const gridRef = useRef<AgGridReact<DataLine>>(null);
    const [rowData, setRowData] = useState<DataLine[]>([]);
    const [result_vitri, setDataVitris] = useState<DataLine[]>([]);       
    const clearFilters = useCallback(() => {
        if (gridRef.current) {
            const api = gridRef.current.api;
            if (api) {
                api.setFilterModel(null);
            }
        }
    }, []);
    const fetchDataLine = async (filters: Record<string, any> = {}): Promise<void> => {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await sendAPIRequest('/logzm/get_data_line?' + queryString, 'GET');
            setRowData(response);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu năng suất:', error);
        }
    };
    const fetchDatavitri = async (filters: Record<string, any> = {}): Promise<void> => {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await sendAPIRequest('/logzm/get_line?' + queryString, 'GET');
            setDataVitris(response);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu năng suất:', error);
        }
    };
    useEffect(() => {
        fetchDatavitri();       
    }, []);
    const handleSearch = () => {
        fetchDataLine({ vitri, date });
    };
    const columnDefs1: ColDef<DataLine>[] = [
        {
            headerName: 'Model',
            field: 'model',
            sortable: true,
            filter: true,
            flex: 1,
        },
        {
            headerName: 'Lot',
            field: 'lot',
            sortable: true,
            filter: true,
            flex: 1,
        },
        {
            headerName: 'Vị trí',
            field: 'vitri',
            sortable: true,
            filter: true,
            flex: 1,
        },
        {
            headerName: 'Thiết bị',
            field: 'mathietbi',
            sortable: true,
            filter: true,
            flex: 4,
        },
        {
            headerName: 'Ngày',
            field: 'ngay',
            sortable: true,
            filter: true,
        
            flex: 1,
        },
        {
            headerName: 'Số lượng',
            field: 'soluong',
            editable: true,
            sortable: true,
            filter: true,
            flex: 1,
        },
        {
            headerName: 'Tổng',
            field: 'so_luong_du_lieu',
            sortable: true,
            filter: true,
            flex: 1,
        },      
    ];
    
    return (
        <MenuComponent>
            <div className="d-flex align-items-center bg-white px-4 py-1">
                <h5 className="fw-normal text-primary m-0">
                    Danh sách dữ liệu theo line <i className="far fa-question-circle"></i>
                </h5>
                <div className="d-flex ms-auto">
                    <div className="input-custom ms-2">
                        <div>
                            <label className="form-label text-secondary">Vị trí</label>
                            <input
                                type="search"
                                className="form-control"
                                list="list_vitri"
                                value={vitri}
                                onChange={(e) => setVitri(e.target.value)}
                            />
                            <datalist id="list_vitri">
                                {result_vitri.map((item) => (
                                    <option
                                        key={(item as { vitri: string }).vitri}
                                        value={(item as { vitri: string }).vitri}
                                    ></option>
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
                                onChange={(e) => setDate(e.target.value)}
                            />
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
                        rowData={rowData}
                        columnDefs={columnDefs1}
                        defaultColDef={{
                            sortable: true,
                            filter: true,
                            resizable: true,
                            flex: 1,
                            minWidth: 100,
                        }}
                        pagination={true}
                        paginationPageSize={10}
                        rowDragManaged={true}
                        rowDragEntireRow={true}
                    />
                </div>
            </div>
        </MenuComponent>
    );
};

export default PageDataLine;
