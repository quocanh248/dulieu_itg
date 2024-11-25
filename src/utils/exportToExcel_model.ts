// Cập nhật tên file thành exportToExcel.ts nếu bạn sử dụng TypeScript
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface ItemData {
    congdoan: string;
    ketqua: string;
    label: string;
    model: string;
    version: string;
    lot: string;
    sttlabel: string;
    ngay: string;
    giobatdau: string;
    manhanvien: string;   
    mathung: string;
    sttthung: string;
    mathietbi: string;
}

async function exportToExcel(data: ItemData[], filename: string, model: string, lot: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Nang_suat');

    worksheet.mergeCells('A1:L1');
    worksheet.mergeCells('A2:L2');
    worksheet.mergeCells('A3:L3');

    worksheet.getCell('A1').value = 'Công Ty TNHH MTV VIỆT TRẦN';
    worksheet.getCell('A2').value = 'Lô A, đường số 1, kcn Long Đức, xã Long Đức, tp Trà Vinh';
    worksheet.getCell('A3').value = `Dữ liệu ${model} - ${lot}`;

    worksheet.getCell('A1').font = { bold: true, size: 14 };
    worksheet.getCell('A2').font = { size: 12 };
    worksheet.getCell('A3').font = { bold: true, size: 12 };
    worksheet.getCell('A1').alignment = { horizontal: 'left' };
    worksheet.getCell('A2').alignment = { horizontal: 'left' };
    worksheet.getCell('A3').alignment = { horizontal: 'center' };

    worksheet.addRow([]);

    worksheet.addRow([
        'Công đoạn',
        'Kết quả',
        'Label',
        'Model',
        'Version',       
        'STT Label',
        'Ngày',
        'Giờ',
        'Mã nhân viên',      
        'Mã thùng',
        'STT thùng',
        'Thiết bị',
    ]);

    worksheet.getRow(5).font = { bold: true };
    worksheet.getRow(5).alignment = { horizontal: 'center' };
    worksheet.getRow(5).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF00' },
    };

    worksheet.columns = [
        { width: 26 },
        { width: 10 },
        { width: 30 },
        { width: 16 },
        { width: 14 },        
        { width: 12 },
        { width: 16 },
        { width: 10 },
        { width: 18 },       
        { width: 36 },
        { width: 18 },
        { width: 48 },
    ];
   
    data.forEach((item) => {      
        const row = worksheet.addRow([
            item.congdoan,
            item.ketqua,
            item.label,
            item.model,
            item.lot,
            item.label.slice(-4),
            item.ngay,
            item.giobatdau,
            item.manhanvien,            
            item.mathung,
            item.sttthung,
            item.mathietbi,
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
