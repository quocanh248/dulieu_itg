import { useCallback, useEffect, useRef, useState } from 'react';
import MenuComponent from '../../Menu';
import { sendAPIRequest } from '../../utils/util';
import { DataNC2, DataNC2_NC1, DataNC2ofNC1 } from '../../utils/modelAPI';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ColDef, GridApi } from 'ag-grid-community';
import React from 'react';

const NC1_NC2Page = () => {
    const [result_NC1_NC2, setResultNc2_Nc1] = useState<DataNC2_NC1[]>([]);
    const [result_NC1ofNC2, setResultNc2ofNc1] = useState<DataNC2ofNC1[]>([]);
    const [result_NC2, setResultNc2] = useState<DataNC2[]>([]);
    const [mnc2, setmnc2] = useState<string>('');
    const [isFormEdit, setIsFormEdit] = useState<boolean>(false);
    const gridApiRef = useRef<GridApi<DataNC2_NC1> | null>(null);
    const gridApiNC1ofNC2 = useRef<GridApi<DataNC2ofNC1> | null>(null);
    const gridRef = useRef<AgGridReact<DataNC2_NC1> | null>(null);

    const clearFilters = useCallback(() => {
        if (gridRef.current) {
            const api = gridRef.current.api;
            if (api) {
                api.setFilterModel(null);
            }
        }
    }, []);
    const getNhomCap2 = async () => {
        try {
            const response = await sendAPIRequest('/thietbi/get_nhom_cap_2', 'GET');
            setResultNc2(response);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };
    const handleRowClicked = async (row: any) => {
        try {
            const data = row.data;
            setmnc2(data.manhomcap2);
            handleNhomCap2Change(data.manhomcap2);
            nc1_of_nc2(data.manhomcap2);
            toggleScrollAndModal(true);
        } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng:', error);
        }
    };
    const handleNhomCap2Change = async (id: string) => {
        try {
            const responseNC1_NC2 = await sendAPIRequest(
                `/thietbi/get_nhom_cap_1_not_of_cap_2?manhomcap2=${id}`,
                'GET'
            );
            setResultNc2_Nc1(responseNC1_NC2);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };
    const nc1_of_nc2 = async (id: string) => {
        try {
            const responseNC1_NC2 = await sendAPIRequest(
                `/thietbi/get_nhom_cap_1_of_cap_2?manhomcap2=${id}`,
                'GET'
            );
            setResultNc2ofNc1(responseNC1_NC2);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };
    useEffect(() => {
        getNhomCap2();
    }, []);
    const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
        // Lấy giá trị từ button
        const manhomcap2 = event.currentTarget.value;
        console.log('Giá trị của button:', manhomcap2);
        if (gridApiRef.current) {
            const selectedRows = gridApiRef.current.getSelectedRows();
            const dataToSend = {
                manhomcap2, // Giá trị từ form
                selectedRows, // Các hàng đã chọn
            };
            const res = await sendAPIRequest('/thietbi/cap_nhat_nc2', 'POST', dataToSend);
            console.log(res.status);
            if (res && res.status === 201) {
                handleNhomCap2Change(manhomcap2);
                nc1_of_nc2(manhomcap2);
            } else {
                alert('Lỗi');
            }
        }
    };
    const handleTrash = async (event: React.MouseEvent<HTMLButtonElement>) => {
        const manhomcap2 = event.currentTarget.value;
        console.log('Giá trị của manhomcap2:', manhomcap2);
        if (gridApiNC1ofNC2.current) {
            const selectedRows = gridApiNC1ofNC2.current.getSelectedRows();
            const dataToSend = {
                manhomcap2, // Giá trị từ form
                selectedRows, // Các hàng đã chọn
            };
            const res = await sendAPIRequest('/thietbi/clear_nc1_nc2', 'POST', dataToSend);
            console.log(res.status);
            if (res && res.status === 201) {
                handleNhomCap2Change(manhomcap2);
                nc1_of_nc2(manhomcap2);
            } else {
                alert('Lỗi');
            }
        }
    };
    // Define column definitions for AG Grid
    const columnDefs1: ColDef<DataNC2>[] = [
        {
            headerName: 'Mã nhóm cấp 2',
            field: 'manhomcap2',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Tên nhóm cấp 2',
            field: 'tennhomcap2',
            sortable: true,
            filter: true,
        }        
    ];
    const columnDefsNC1ofnc2: ColDef<DataNC2ofNC1>[] = [
        {
            headerCheckboxSelection: true,
            checkboxSelection: true,
            headerName: '',
            width: 50,
            flex: 1,
        },
        {
            headerName: 'Mã nhóm cấp 1',
            field: 'manhomcap1',
            sortable: true,
            filter: true,
            flex: 2,
        },
        {
            headerName: 'Tên nhóm cấp 1',
            field: 'tennhomcap1',
            sortable: true,
            filter: true,
            flex: 2,
        },
    ];
    const columnDefsNC1_nc2: ColDef<DataNC2_NC1>[] = [
        {
            headerCheckboxSelection: true,
            checkboxSelection: true,
            headerName: '',
            width: 50,
            flex: 1,
        },
        {
            headerName: 'Mã nhóm cấp 1',
            field: 'manhomcap1',
            sortable: true,
            filter: true,
            flex: 2,
        },
        {
            headerName: 'Tên nhóm cấp 1',
            field: 'tennhomcap1',
            sortable: true,
            filter: true,
            flex: 2,
        },
    ];
    const toggleScrollAndModal = (isOpen: boolean) => {
        document.body.classList.toggle('no-scroll', isOpen);
        setIsFormEdit(isOpen);
    };
    const htmlDetailForm = (): React.ReactNode => (
        <div className={`modal-overlay ${isFormEdit ? 'd-block' : 'd-none'}`}>
            <div className={`modal ${isFormEdit ? 'd-block' : 'd-none'}`}>
                <div className="modal-dialog" style={{ width: '80%', maxWidth: 'none' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Chi tiết năng suất nhân sự</h5>
                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Close"
                                onClick={() => toggleScrollAndModal(false)}
                            ></button>
                        </div>
                        <div className="modal-body">
                            <div id="basic" className="tab-pane fade show active">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div
                                            className="ag-theme-quartz"
                                            style={{ height: 'calc(100vh - 310px)', width: '100%' }}
                                        >
                                            <AgGridReact
                                                ref={gridRef}
                                                rowData={result_NC1ofNC2}
                                                columnDefs={columnDefsNC1ofnc2}
                                                defaultColDef={{
                                                    sortable: true,
                                                    filter: true,
                                                    resizable: true,
                                                    flex: 1,
                                                    minWidth: 100,
                                                }}
                                                onGridReady={(params) =>
                                                    (gridApiNC1ofNC2.current = params.api)
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div
                                            className="ag-theme-quartz"
                                            style={{ height: 'calc(100vh - 310px)', width: '100%' }}
                                        >
                                            <AgGridReact
                                                ref={gridRef}
                                                rowData={result_NC1_NC2}
                                                columnDefs={columnDefsNC1_nc2}
                                                defaultColDef={{
                                                    sortable: true,
                                                    filter: true,
                                                    resizable: true,
                                                    flex: 1,
                                                    minWidth: 100,
                                                }}
                                                rowSelection="multiple"
                                                onGridReady={(params) =>
                                                    (gridApiRef.current = params.api)
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-danger"
                                value={mnc2}
                                onClick={handleTrash}
                            >
                                Xóa
                            </button>
                            <div className="ms-auto">
                                <button
                                    type="button"
                                    className="btn btn-light"
                                    data-bs-dismiss="modal"
                                    onClick={() => clearFilters()}
                                >
                                    Đóng
                                </button>
                                <button
                                    type="button"
                                    value={mnc2}
                                    className="btn btn-primary"
                                    onClick={handleSubmit}
                                >
                                    Cập nhật
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <MenuComponent>
            <div className="d-flex align-items-center bg-white px-4 py-1">
                <h5 className="fw-normal text-primary m-0">
                    Danh sách nhóm cấp 2 <i className="far fa-question-circle"></i>
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
                    <AgGridReact
                        columnDefs={columnDefs1}
                        defaultColDef={{
                            resizable: true,
                            flex: 1,
                            minWidth: 100,
                        }}
                        rowData={result_NC2}
                        rowSelection="multiple"
                        pagination={true}
                        paginationPageSize={20}
                        onRowClicked={handleRowClicked}
                    />
                </div>
            </div>
            {htmlDetailForm()}
        </MenuComponent>
    );
};

export default NC1_NC2Page;
