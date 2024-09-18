import { useState, ChangeEvent, MouseEvent } from 'react';
import MenuComponent from '../../Menu';
import ExcelJS from 'exceljs';
import { sendAPIRequest } from '../../utils/util';
import * as XLSX from 'xlsx';
import React from 'react';
// Định nghĩa kiểu cho dữ liệu hàng trong file Excel
interface RowData {
    [key: number]: any;
}

const Admin_them_nang_suat_zm: React.FC = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formattedDate = yesterday.toISOString().split('T')[0];
    const [date, setDate] = useState<string>(formattedDate);
    const [file, setFile] = useState<File | null>(null);
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleImport = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault(); // Ngăn chặn hành vi mặc định của nút bấm
        try {
            if (file) {
                const fileReader = new FileReader();
                fileReader.readAsArrayBuffer(file);
                fileReader.onload = async () => {
                    const buffer = fileReader.result as ArrayBuffer;
                    const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const rows = XLSX.utils.sheet_to_json(worksheet, {
                        header: 1,
                        defval: '',
                    });
                    const startRow = 1; // Thay đổi thành 1 vì sheet_to_json bắt đầu từ 0
                    const filteredRows = rows.slice(startRow);
                    // Gửi dữ liệu đến API để lưu vào cơ sở dữ liệu
                    if (filteredRows.length > 0) {
                        await sendAPIRequest('/nang_suat/upload_zm', 'POST', filteredRows);
                        alert('Dữ liệu đã được lưu thành công');
                        setFile(null);
                    }
                };

                fileReader.onerror = (error) => {
                    console.error('Lỗi khi đọc file:', error);
                    alert('Có lỗi xảy ra khi đọc file');
                };
            }
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu hoặc xử lý tệp:', error);
        }
    };
    const handleupdatetime = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            let rows: RowData[][] = [];
            if (file) {
                const fileReader = new FileReader();
                fileReader.readAsArrayBuffer(file);
                fileReader.onload = async () => {
                    const buffer = fileReader.result as ArrayBuffer;
                    const workbook = new ExcelJS.Workbook();
                    await workbook.xlsx.load(buffer); // Sử dụng buffer thay vì file
                    const worksheet = workbook.worksheets[0];
                    let startRow = 2;
                    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
                        if (rowNumber >= startRow) {
                            rows.push(row.values as RowData[]); // Chuyển đổi thành mảng hai chiều
                        }
                    });
                    // Gửi dữ liệu đến API để lưu vào cơ sở dữ liệu
                    if (rows.length > 0) {
                        const payload = {
                            data: rows,
                            date: date,
                        };
                        await sendAPIRequest('/nang_suat/upload_time', 'POST', payload);
                        alert('Dữ liệu đã được lưu thành công');
                    }
                };

                fileReader.onerror = (error) => {
                    console.error('Lỗi khi đọc tệp:', error);
                };
            }
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu hoặc xử lý tệp:', error);
        }
    };
    return (
        <MenuComponent>
            <div className="d-flex align-items-center bg-white px-4 py-1">
                <h5 className="fw-normal text-primary m-0">
                    Thêm Dữ liệu năng suất Zenmom <i className="far fa-question-circle"></i>
                </h5>
                <div className="d-flex ms-auto">
                    <div className="input-custom ms-2">
                        <div>
                            <label className="form-label text-secondary">Chọn file năng suất</label>
                            <input
                                type="file"
                                className="form-control"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                    <div className="input-custom ms-2">
                        <div>
                            <label className="form-label text-secondary">Chọn ngày</label>
                            <input
                                type="date"
                                value={date}
                                className="form-control"
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-center p-2">
                        <button className="btn btn-primary" onClick={handleImport}>
                            <i className="fas fa-plus"></i> Data
                        </button>
                    </div>
                    <div className="d-flex align-items-center justify-content-center">
                        <button className="btn btn-success" onClick={handleupdatetime}>
                            <i className="fas fa-plus"></i> Thời gian
                        </button>
                    </div>
                </div>
            </div>
            <div className="p-3">
                <div className="bg-white body-table"></div>
            </div>
        </MenuComponent>
    );
};

export default Admin_them_nang_suat_zm;
