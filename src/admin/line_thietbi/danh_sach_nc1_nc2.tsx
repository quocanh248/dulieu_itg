import { useEffect, useState } from 'react';
import MenuComponent from '../../Menu';
import { sendAPIRequest } from '../../utils/util';
import { DataNC1, DataNC2, DataNC2_NC1 } from '../../utils/modelAPI';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ColDef } from 'ag-grid-community';
import React from 'react';

const NC1_NC2Page = () => {
    const [result_NC1_NC2, setResultNc2_Nc1] = useState<DataNC2_NC1[]>([]);
    const [result_NC1_Remaining, setResultNc1Remaining] = useState<DataNC1[]>([]);
    const [result_NC2, setResultNc2] = useState<DataNC2[]>([]);

    const getNhomCap2 = async () => {
        try {
            const response = await sendAPIRequest('/thietbi/get_nhom_cap_2', 'GET');
            setResultNc2(response);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };

    const handleNhomCap2Change = async (id: string) => {
        try {
            const responseNC1_NC2 = await sendAPIRequest(
                `/thietbi/get_nhom_cap_1_of_cap_2?manhomcap2=${id}`,
                'GET'
            );
            setResultNc2_Nc1(responseNC1_NC2);

            const responseNC1Remaining = await sendAPIRequest('/thietbi/get_nhom_cap_1', 'GET');
            setResultNc1Remaining(responseNC1Remaining);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };

    useEffect(() => {
        getNhomCap2();
    }, []);

    // Define column definitions for AG Grid
    const columnDefs1: ColDef<DataNC1>[] = [
        {
            headerCheckboxSelection: true,
            checkboxSelection: true,
            headerName: '',
            width: 50,
        },
        {
            headerName: 'Tên nhóm cấp 1',
            field: 'tennhomcap1',
            sortable: true,
            filter: true,
        },
    ];

    // Combine data from NC1_NC2 and NC1_Remaining into one array
    const rowData: DataNC1[] = [
        ...result_NC1_NC2.map((nhom) => ({
            manhomcap1: nhom.manhomcap1,
            tennhomcap1: nhom.tennhomcap1,           
            checked: true, // Checked by default
        })),
        ...result_NC1_Remaining.map((nhom) => ({
            manhomcap1: nhom.manhomcap1,
            tennhomcap1: nhom.tennhomcap1,
            checked: false, // Not checked by default
        })),
    ];

    return (
        <MenuComponent>
            <div className="d-flex align-items-center bg-white px-4 py-1">
                <h5 className="fw-normal text-primary m-0">
                    Danh sách nhóm cấp 1 <i className="far fa-question-circle"></i>
                </h5>
                <div className="d-flex ms-auto">
                    <div className="input-custom ms-2">
                        <div>
                            <label className="form-label text-secondary">Mã nhóm cấp 2</label>
                            <select
                                className="form-select"
                                onChange={(e) => handleNhomCap2Change(e.target.value)}
                            >
                                <option value="">Chọn nhóm cấp 2</option>
                                {result_NC2.map((nhom) => (
                                    <option key={nhom.manhomcap2} value={nhom.manhomcap2}>
                                        {nhom.tennhomcap2}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hiển thị danh sách nhóm cấp 1 */}
            <div className="p-3">
                <div
                    className="ag-theme-alpine"
                    style={{ height: 'calc(100vh - 150px)', width: '100%' }}
                >
                    <AgGridReact<DataNC1>
                        columnDefs={columnDefs1}
                        defaultColDef={{                            
                            resizable: true,
                            flex: 1,
                            minWidth: 100,
                        }}
                        rowData={rowData}
                        rowSelection="multiple"
                        pagination={true}
                        paginationPageSize={11}
                    />
                </div>
            </div>
        </MenuComponent>
    );
};

export default NC1_NC2Page;
