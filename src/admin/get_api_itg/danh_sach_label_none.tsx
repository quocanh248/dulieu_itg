import { useEffect, useState } from 'react';
import MenuComponent from '../../Menu';
import { sendAPIRequest } from '../../utils/util';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { ColDef } from 'ag-grid-community';
import { useParams } from 'react-router-dom';
import { DataNone } from '../../utils/modelAPI';
import React from 'react';

const Get_label_none: React.FC = () => {
    const [result_none, setrResnone] = useState<DataNone[]>([]);
    const { model, lot, congdoan, soluong_ok, soluong } = useParams<{
        model: string;
        lot: string;
        congdoan: string;
        soluong_ok: string;
        soluong: string;
    }>();

    const decodemodel = decodeURIComponent(model || '');
    const decodelot = decodeURIComponent(lot || '');
    const decodecongdoan = decodeURIComponent(congdoan || '');
    const decodesoluong_ok = decodeURIComponent(soluong_ok || '');
    const decodesoluong = decodeURIComponent(soluong || '');

    const get_nhom_cap_2_cap_1 = async () => {
        try {
            const response = await sendAPIRequest(
                `/truynguyen/get_label_none?model=${decodemodel}&lot=${decodelot}&congdoan=${decodecongdoan}&soluong_ok=${decodesoluong_ok}&soluong=${decodesoluong}`,
                'GET',
                undefined
            );
            console.log(response.missingLabels);
            setrResnone(response.missingLabels); // Thiết lập dữ liệu
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };

    useEffect(() => {
        if (decodemodel && decodelot && decodecongdoan && decodesoluong_ok && decodesoluong) {
            get_nhom_cap_2_cap_1();
        }
    }, [decodemodel, decodelot, decodecongdoan, decodesoluong_ok, decodesoluong]);
  
    const columnDefs1: ColDef<DataNone>[] = [
        {
            headerName: 'Label',
            field: 'label',
            sortable: true,
            filter: true,
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
                    Danh sách Label chưa chạy <i className="far fa-question-circle"></i>
                </h5>
                <div className="d-flex ms-auto" style={{ visibility: 'hidden' }}>
                    <div className="input-custom ms-2">
                        <div>
                            <label className="form-label text-secondary">Mã nhóm cấp 2</label>
                            <input type="search" className="form-control" />
                        </div>
                    </div>
                    <div className="input-custom ms-2">
                        <div>
                            <label className="form-label text-secondary">Tên nhóm cấp 2</label>
                            <input type="search" className="form-control" />
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
                        rowData={result_none}
                        columnDefs={columnDefs1}
                        defaultColDef={{
                            sortable: true,
                            filter: true,
                            resizable: true,
                            flex: 1,
                            minWidth: 100,
                        }}
                        pagination={true}
                        paginationPageSize={11}
                        rowDragManaged={true}
                        rowDragEntireRow={true}                        
                    />
                </div>              
            </div>  
        </MenuComponent>
    );
};

export default Get_label_none;
