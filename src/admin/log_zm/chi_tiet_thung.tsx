import { useEffect, useState } from 'react';
import { sendAPIRequest } from '../../utils/util';
import MenuComponent from '../../Menu';
import { Link, useParams } from 'react-router-dom';
import { DataNone } from '../../utils/modelAPI';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { ColDef } from 'ag-grid-community';
import React from 'react';

const ChitietThung_zm: React.FC = () => {
    const [resultthung, setResulthung] = useState<DataNone[]>([]);
    const { mathung } = useParams<{ mathung: string }>();
    const decodedmathung = decodeURIComponent(mathung || '');
    const fetchData = async () => {
        try {
            const response = await sendAPIRequest(
                '/logzm/chi_tiet_thung?mathung=' + decodedmathung,
                'GET'
            );
            setResulthung(response);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };
    useEffect(() => {
        if (decodedmathung) {
            fetchData();
        }
    }, [decodedmathung]);
    const columnDefs1: ColDef<DataNone>[] = [
        {
            headerName: 'Label',
            field: 'label',
            sortable: true,
            filter: true,
            cellRenderer: (params: any) => (
                <Link to={`/chi_tiet_label_zm/${encodeURIComponent(params.value)}`}>
                    {params.value}
                </Link>
            ),
        },
        {
            headerName: 'Trạng thái',
            field: 'trangthai',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Ngày',
            field: 'ngay',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Giờ bắt đầu',
            field: 'giobatdau',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Giờ kết thúc',
            field: 'gioketthuc',
            sortable: true,
            filter: true,
        },
    ];
    return (
        <MenuComponent>
            <div className="d-flex align-items-center bg-white px-4 py-1">
                <h5 className="fw-normal text-primary m-0">
                    Chi tiết thùng <b style={{ color: 'red' }}>{decodedmathung}</b>
                </h5>
                <div className="d-flex ms-auto">
                    <div className="input-custom ms-2" style={{ visibility: 'hidden' }}>
                        <div>
                            <label className="form-label text-secondary">Model</label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-3">
                <div
                    className="ag-theme-quartz"
                    style={{ height: 'calc(100vh - 150px)', width: '100%' }}
                >
                    <AgGridReact
                        rowData={resultthung}
                        columnDefs={columnDefs1}
                        defaultColDef={{
                            sortable: true,
                            filter: true,
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
export default ChitietThung_zm;
