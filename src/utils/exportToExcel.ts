// Cập nhật tên file thành exportToExcel.ts nếu bạn sử dụng TypeScript
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface ItemData {
    manhansu: string;
    tennhansu: string;
    tennhom: string;
    model: string;
    lot: string;
    ngay: string;
    congdoan: string;
    vitri: string;
    soluong: number;
    thoigianthuchien: number;
    thoigianquydoi: number;
    sum_time: number;
    thoigianlamviec: number;
}

async function exportToExcel(data: ItemData[], filename: string, date: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Nang_suat');

    worksheet.mergeCells('A1:L1');
    worksheet.mergeCells('A2:L2');
    worksheet.mergeCells('A3:L3');

    worksheet.getCell('A1').value = 'Công Ty TNHH MTV VIỆT TRẦN';
    worksheet.getCell('A2').value = 'Lô A, đường số 1, kcn Long Đức, xã Long Đức, tp Trà Vinh';
    worksheet.getCell('A3').value = `Dữ liệu năng suất ngày ${date}`;

    worksheet.getCell('A1').font = { bold: true, size: 14 };
    worksheet.getCell('A2').font = { size: 12 };
    worksheet.getCell('A3').font = { bold: true, size: 12 };
    worksheet.getCell('A1').alignment = { horizontal: 'left' };
    worksheet.getCell('A2').alignment = { horizontal: 'left' };
    worksheet.getCell('A3').alignment = { horizontal: 'center' };

    worksheet.addRow([]);

    worksheet.addRow([
        'Mã Nhân Sự',
        'Tên Nhân Sự',
        'Tên Nhóm',
        'Model',
        'Lot',
        'Ngày',
        'Công đoạn',
        'Vị trí',
        'Số lượng',
        'Thời gian thực hiện',
        'Thời gian quy đổi',
        'Thời gian làm việc',
    ]);

    worksheet.getRow(5).font = { bold: true };
    worksheet.getRow(5).alignment = { horizontal: 'center' };
    worksheet.getRow(5).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF00' },
    };

    worksheet.columns = [
        { width: 12 },
        { width: 26 },
        { width: 14 },
        { width: 18 },
        { width: 14 },
        { width: 12 },
        { width: 48 },
        { width: 16 },
        { width: 10 },
        { width: 18 },
        { width: 18 },
        { width: 18 },
    ];

    data.forEach((item) => {
        let tgqd = ((item.thoigianthuchien / item.sum_time) * item.thoigianlamviec).toFixed(2);
        const formattedDate = new Date(item.ngay).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
        const row = worksheet.addRow([
            item.manhansu,
            item.tennhansu,
            item.tennhom,
            item.model,
            item.lot,
            formattedDate,
            item.congdoan,
            item.vitri,
            item.soluong,
            item.thoigianthuchien,
            tgqd,
            item.thoigianlamviec,
        ]);
        row.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
            cell.alignment = {
                horizontal: 'center',
            };
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), filename);
}

export default exportToExcel;
