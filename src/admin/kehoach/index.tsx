import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { ColDef } from 'ag-grid-community';
import exportToExcel from '../../utils/exporttoExcel_kh';
import MenuComponent from '../../Menu';
import { sendAPIRequest } from '../../utils/util';

interface ParsedData {
    ngay: string;
    soluong: string;
    giobatdau: string | null;
    ngaytd: string | null;
    giotd: string | null;
}

interface Data_tonghop {
    line: string;
    model: string;
    lotcatday1: string;
    nhomban: string;
    po: string;
    nangluclaprap: string;
    NgayLR: string;
    gioLR: string;
    gioTD: string;
    ngay: string;
    soluong: number;
    parsed_data: ParsedData[]; // Mảng chứa các đối tượng ParsedData
}

interface data_ngay {
    ngay: string;
}
interface data_TKH {
    tenkehoach: string;
}
const KehoachPage: React.FC = () => {
    const now = new Date();
    now.setDate(now.getDate());
    const formattedDate = now.toISOString().split('T')[0];
    const [ngay_check, setDate] = useState<string>(formattedDate);
    const [resultth, setResultth] = useState<Data_tonghop[]>([]);
    const [resultkh, setResultkh] = useState<data_TKH[]>([]);
    const [resulmap, setResulmap] = useState([]); // Map ngày nhận từ API
    const [tenkehoach, setTKH] = useState('');
    const gridRef = useRef<AgGridReact | null>(null);

    const clearFilters = useCallback(() => {
        if (gridRef.current) {
            const api = gridRef.current.api;
            if (api) {
                api.setFilterModel(null);
            }
        }
    }, []);
    // Hàm fetch dữ liệu từ API
    const fetchkehoach = async (filters: Record<string, string> = {}) => {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await sendAPIRequest(
                '/kehoach/xem_ke_hoach?' + queryString,
                'GET',
                undefined
            );
            setResultth(response.data); // Set resultth từ API trả về
            setResulmap(response.map_ngay); // Set map ngày từ API
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };
    const fetchtenkehoach = async (filters: Record<string, string> = {}) => {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await sendAPIRequest(
                '/kehoach/get_ten_ke_hoach?' + queryString,
                'GET',
                undefined
            );          
            setResultkh(response);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };
    const handleSearch = () => {
        fetchkehoach({ tenkehoach, ngay_check });
    };
    const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const ngay_check = e.target.value;
        setDate(ngay_check);
        if (ngay_check !== '') {
            fetchkehoach({ tenkehoach, ngay_check });
        }
    };
    useEffect(() => {
        fetchtenkehoach();
        // fetchkehoach();
    }, []);

    const formatDM = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1; // getMonth() trả về từ 0 đến 11 nên cần +1
        return `${day}-${month}`;
    };
    // Cấu hình cột cho AG Grid
    const columnDefs: ColDef<Data_tonghop>[] = [
        {
            headerName: 'MODEL',
            field: 'model',
            sortable: true,
            filter: 'agTextColumnFilter',
            flex: 2,
        },
        {
            headerName: 'LINE',
            field: 'line',
            sortable: true,
            filter: 'agTextColumnFilter',
            flex: 1,
        },
        {
            headerName: 'NLLR', // Năng Lực Lắp Ráp
            field: 'nangluclaprap',
            flex: 1,
        },
        {
            headerName: 'MÃ BÀN',
            field: 'nhomban',
            sortable: true,
            filter: 'agTextColumnFilter',
            flex: 1.5,
        },
        {
            headerName: 'LOT CD',
            field: 'lotcatday1',
            sortable: true,
            filter: 'agTextColumnFilter',
            flex: 1.5,
        },
        {
            headerName: 'PO',
            field: 'po',
            sortable: true,
            filter: 'agTextColumnFilter',
            flex: 1,
        },
        // Xử lý dữ liệu ngày từ resulmap
        ...resulmap.flatMap((ngayItem: data_ngay) => {
            const formatted = formatDM(ngayItem.ngay);
            const foundMatch = resultth.some((it) =>
                it.parsed_data.some((parsedItem) => parsedItem.ngay === ngayItem.ngay)
            );
            if (!foundMatch) return [];
            const columns: any[] = [
                {
                    headerName: formatted,
                    field: formatted,
                    sortable: false,
                    valueGetter: (params: any) => {
                        // Tìm dữ liệu khớp với ngày từ parsed_data
                        const matchedData = params.data.parsed_data.find(
                            (d: ParsedData) => d.ngay === ngayItem.ngay
                        );
                        return matchedData ? matchedData.soluong : '';
                    },
                    cellRenderer: (params: any) => {
                        return params.value;
                    },
                    cellStyle: (params: any) => {
                        const matchedData = params.data.parsed_data.find(
                            (d: ParsedData) => d.ngay === ngayItem.ngay
                        );
                        return matchedData
                            ? { backgroundColor: '#40dec7' } // Màu vàng
                            : null; // Nếu không có giá trị, không áp dụng style
                    },
                    flex: 1,
                },
            ];
            if (ngayItem.ngay === ngay_check) {
                // Thêm các cột bổ sung nếu điều kiện đúng
                columns.push(
                    {
                        headerName: 'GLR',
                        field: 'Giờ láp ráp',
                        sortable: false,
                        valueGetter: (params: any) => {
                            const matchedData = params.data.parsed_data.find(
                                (d: ParsedData) => d.ngay === ngayItem.ngay
                            );
                            return matchedData ? matchedData.giobatdau : '';
                        },
                        cellRenderer: (params: any) => {
                            return params.value;
                        },
                        headerClass: 'custom-header',
                        cellStyle: { backgroundColor: '#FFC000' }, // Tô màu nền
                        flex: 1,
                    },
                    {
                        headerName: 'NTD',
                        field: 'Ngày test dây',
                        sortable: false,
                        valueGetter: (params: any) => {
                            const matchedData = params.data.parsed_data.find(
                                (d: ParsedData) => d.ngay === ngayItem.ngay
                            );
                            return matchedData ? matchedData.ngaytd : '';
                        },
                        cellRenderer: (params: any) => {
                            return params.value ? formatDM(params.value) : '';
                        },
                        headerClass: 'custom-header',
                        cellStyle: { backgroundColor: '#FFC000' },
                        flex: 1,
                    },
                    {
                        headerName: 'GTD',
                        field: 'Giờ test dây',
                        sortable: false,
                        valueGetter: (params: any) => {
                            const matchedData = params.data.parsed_data.find(
                                (d: ParsedData) => d.ngay === ngayItem.ngay
                            );
                            return matchedData ? matchedData.giotd : '';
                        },
                        cellRenderer: (params: any) => {
                            return params.value;
                        },
                        headerClass: 'custom-header',
                        cellStyle: { backgroundColor: '#FFC000' },
                        flex: 1,
                    }
                );
            }
            return columns;
        }),
    ];
    const exportExcel = async ()  => {
        const api = gridRef.current?.api;

        if (!api) return;

        const rowCount = api.getDisplayedRowCount();
        const columnDefs = api.getColumnDefs();
        const rowData: any[] = [];

        if (columnDefs) {
            for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
                const rowNode = api.getDisplayedRowAtIndex(rowIndex);
                const row: any = {};

                // Duyệt qua từng cột
                columnDefs.forEach((colDef: any) => {
                    const colKey = colDef.field || colDef.colId;

                    if (colKey && rowNode) {
                        // Sử dụng api.getValue() để lấy giá trị cell
                        const cellValue = api.getValue(colKey, rowNode);
                        row[colKey] = cellValue;
                    }
                });
                rowData.push(row);
            }
        }
        const filename = `Dữ liệu kế hoạch PO ${tenkehoach}.xlsx`;
        await exportToExcel(rowData, filename);
    };
    return (
        <MenuComponent>
            <div className="d-flex align-items-center bg-white px-4 py-1">
                <h5 className="fw-normal text-primary m-0">{tenkehoach}</h5>
                <div className="d-flex ms-auto">
                    <div className="input-custom ms-2">
                        <input
                            type="search"
                            className="form-control"
                            value={tenkehoach}
                            list="list_lot"
                            onChange={(e) => setTKH(e.target.value)}
                        />
                        <datalist id="list_lot">
                            {resultkh.map((item) => (
                                <option
                                    key={(item as { tenkehoach: string }).tenkehoach}
                                    value={(item as { tenkehoach: string }).tenkehoach}
                                ></option>
                            ))}
                        </datalist>
                    </div>
                    <div className="input-custom ms-2">
                        <input
                            type="date"
                            value={ngay_check}
                            onChange={handleModelChange}
                            className="form-control"
                        />
                    </div>
                    <div className="d-flex align-items-center justify-content-center p-2">
                        <button className="btn btn-primary" onClick={handleSearch}>
                            <i className="fas fa-search"></i> Tìm
                        </button>
                    </div>
                    <div className="d-flex align-items-center justify-content-center pr-2">
                        <button className="btn btn-success" onClick={exportExcel}>
                            <i className="fas fa-file-excel"></i> Excel
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
                        rowData={resultth}
                        columnDefs={columnDefs}
                        defaultColDef={{
                            resizable: true,
                        }}
                        rowDragManaged={true}
                        rowDragEntireRow={true}
                    />
                </div>
            </div>
        </MenuComponent>
    );
};

export default KehoachPage;
