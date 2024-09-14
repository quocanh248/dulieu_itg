import { useEffect, useState } from 'react';
import MenuComponent from '../../Menu';
import { sendAPIRequest } from '../../utils/util';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { ColDef } from 'ag-grid-community';
import React from 'react';

// Định nghĩa kiểu dữ liệu cho tài khoản
interface Person {
    manhansu: string;
    tennhansu: string;
    tennhom: string;
    role: string;
}

// Định nghĩa kiểu dữ liệu cho component
const personnelPage: React.FC = () => {
    const [Persons, setPerson] = useState<Person[]>([]);

    const fetchPerson = async (filters: Record<string, string> = {}) => {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await sendAPIRequest(
                '/nhansu/danh_sach_nhan_su?' + queryString,
                'GET',
                undefined
            );
            setPerson(response);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách tài khoản:', error);
        }
    };
    const update_nhansu = async () => {
        try {
            const response = await sendAPIRequest('/nhansu/cap_nhat_nhan_su', 'GET', undefined);
            if (response.status === 200) {
                alert('Cập nhật nhân sự thành công!');
                fetchPerson();
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách tài khoản:', error);
        }
    };
    useEffect(() => {
        fetchPerson();
    }, []);

    const columnDefs1: ColDef<Person>[] = [
        {
            headerName: 'Mã nhân sự',
            field: 'manhansu',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Tên nhân sự',
            field: 'tennhansu',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Bộ phận',
            field: 'tennhom',
            sortable: true,
            filter: true,
        },
    ];
    return (
        <MenuComponent>
            <div className="d-flex align-items-center bg-white px-4 py-1">
                <h5 className="fw-normal text-primary m-0">
                    Danh sách nhân sự <i className="far fa-question-circle"></i>
                </h5>
                <div className="d-flex ms-auto">
                    <div className="input-custom ms-2" style={{ visibility: 'hidden' }}>
                        <div>
                            <label className="form-label text-secondary">Model</label>
                            <input type="search" />
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-center">
                        <button className="btn btn-primary" onClick={() => update_nhansu()}>
                            <i className="fa-solid fa-pen-nib"></i> Cập nhật
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
                        rowData={Persons}
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

export default personnelPage;
