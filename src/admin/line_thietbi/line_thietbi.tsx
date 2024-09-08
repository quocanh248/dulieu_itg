import { useCallback, useEffect, useRef, useState } from 'react';
import MenuComponent from '../../Menu';
import { sendAPIRequest } from '../../utils/util';
import { DataLine, Datatb_not_line, Datatb_of_line } from '../../utils/modelAPI';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ColDef, GridApi } from 'ag-grid-community';
import React from 'react';
import { Link } from 'react-router-dom';

const LinePage = () => {
    const [result_tb_not_line, setResulttb_not_line] = useState<Datatb_of_line[]>([]);
    const [result_tb_of_line, setResulttb_of_line] = useState<Datatb_of_line[]>([]);
    const [result_Line, setResultLine] = useState<DataLine[]>([]);
    const [maline_modal, setmaline_modal] = useState<string>('');
    const [maline, setMaline] = useState<string>('');
    const [tenline, setTenline] = useState<string>('');
    const [isFormEdit, setIsFormEdit] = useState<boolean>(false);
    const gridApiRef = useRef<GridApi<Datatb_of_line> | null>(null);
    const gridApiNC1ofNC2 = useRef<GridApi<Datatb_of_line> | null>(null);
    const gridRef = useRef<AgGridReact<Datatb_of_line> | null>(null);

    const clearFilters = useCallback(() => {
        if (gridRef.current) {
            const api = gridRef.current.api;
            if (api) {
                api.setFilterModel(null);
            }
        }
    }, []);
    const get_line = async () => {
        try {
            const response = await sendAPIRequest('/thietbi/get_line', 'GET');
            setResultLine(response);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };
    const handleRowClicked = async (row: any) => {
        try {
            const data = row.data;
            setmaline_modal(data.maline);
            handleNhomCap2Change(data.maline);
            tb_of_line(data.maline);
            toggleScrollAndModal(true);
        } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng:', error);
        }
    };
    const handleNhomCap2Change = async (id: string) => {
        try {
            const responseNC1_NC2 = await sendAPIRequest(
                `/thietbi/get_thietbi_not_of_line?maline=${id}`,
                'GET'
            );
            setResulttb_not_line(responseNC1_NC2);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };
    const tb_of_line = async (id: string) => {
        try {
            const responseNC1_NC2 = await sendAPIRequest(
                `/thietbi/get_thietbi_of_line?maline=${id}`,
                'GET'
            );
            setResulttb_of_line(responseNC1_NC2);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };
    useEffect(() => {
        get_line();
    }, []);
    const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
        // Lấy giá trị từ button
        const maline = event.currentTarget.value;
        console.log('Giá trị của button:', maline);
        if (gridApiRef.current) {
            const selectedRows = gridApiRef.current.getSelectedRows();
            const dataToSend = {
                maline, // Giá trị từ form
                selectedRows, // Các hàng đã chọn
            };
            const res = await sendAPIRequest('/thietbi/cap_nhat_line', 'POST', dataToSend);
            console.log(res.status);
            if (res && res.status === 201) {
                handleNhomCap2Change(maline);
                tb_of_line(maline);
            } else {
                alert('Lỗi');
            }
        }
    };
    const handleTrash = async (event: React.MouseEvent<HTMLButtonElement>) => {
        const maline = event.currentTarget.value;        
        if (gridApiNC1ofNC2.current) {
            const selectedRows = gridApiNC1ofNC2.current.getSelectedRows();
            const dataToSend = {
                maline, // Giá trị từ form
                selectedRows, // Các hàng đã chọn
            };
            const res = await sendAPIRequest('/thietbi/clear_tb_line', 'POST', dataToSend);
            console.log(res.status);
            if (res && res.status === 201) {
                handleNhomCap2Change(maline);
                tb_of_line(maline);
            } else {
                alert('Lỗi');
            }
        }
    };
    const handleAddline = async () => {
        if (!maline || !tenline) {
            alert('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        try {
            const data = {
                maline: maline,
                tenline: tenline,               
            };
            await sendAPIRequest('/thietbi/them_line', 'POST', data);
            alert('Thêm line thành công');
            get_line();
            setMaline('');
            setTenline('');           
        } catch (error) {
            console.error('Lỗi khi thêm tài khoản:', error);
            alert('Có lỗi xảy ra khi thêm tài khoản.');
        }
    };
    // Define column definitions for AG Grid
    const columnDefs1: ColDef<DataLine>[] = [
        {
            headerName: 'Mã line',
            field: 'maline',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Tên line',
            field: 'tenline',
            sortable: true,
            filter: true,
        },
        {
            headerName: '',
            field: 'maline',
            sortable: true,
            cellRenderer: (params: any) => (
                <Link to={`/bar_code_thietbi_line/${encodeURIComponent(params.value)}`} target="_blank">
                    In bar code
                </Link>
            ),
        },
    ];

    const columnDefsNC1ofnc2: ColDef<Datatb_of_line>[] = [
        {
            headerCheckboxSelection: true,
            checkboxSelection: true,
            headerName: '',
            width: 50,
        },
        {
            headerName: 'Mã thiết bị',
            field: 'mathietbi',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Tên thiết bị',
            field: 'tenthietbi',
            sortable: true,
            filter: true,
        },
    ];
    const columnDefsNC1_nc2: ColDef<Datatb_not_line>[] = [
        {
            headerCheckboxSelection: true,
            checkboxSelection: true,
            headerName: '',
            width: 50,
        },
        {
            headerName: 'Mã thiết bị',
            field: 'mathietbi',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Tên thiết bị',
            field: 'tenthietbi',
            sortable: true,
            filter: true,
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
                                                rowData={result_tb_of_line}
                                                columnDefs={columnDefsNC1ofnc2}
                                                defaultColDef={{
                                                    sortable: true,
                                                    filter: true,
                                                    resizable: true,
                                                    flex: 1,
                                                    minWidth: 100,
                                                }}
                                                rowSelection="multiple"
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
                                                rowData={result_tb_not_line}
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
                                value={maline_modal}
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
                                    value={maline_modal}
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
                    Line - thiết bị <i className="far fa-question-circle"></i>
                </h5>
                <div className="d-flex ms-auto">
                    <div className="input-custom ms-2">
                        <div>
                            <label className="form-label text-secondary">Mã line</label>
                            <input
                                type="search"
                                className="form-control"
                                value={maline}
                                onChange={(e) => setMaline(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="input-custom ms-2">
                        <div>
                            <label className="form-label text-secondary">Tên line</label>
                            <input
                                type="search"
                                className="form-control"
                                value={tenline}
                                onChange={(e) => setTenline(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-center p-2">
                        <button className="btn btn-primary" onClick={handleAddline}>
                            <i className="fas fa-plus"></i> Thêm
                        </button>
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
                        rowData={result_Line}
                        rowSelection="multiple"
                        pagination={true}
                        paginationPageSize={11}
                        onRowClicked={handleRowClicked}
                    />
                </div>
            </div>
            {htmlDetailForm()}
        </MenuComponent>
    );
};

export default LinePage;
