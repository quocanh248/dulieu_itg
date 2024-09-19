import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface ItemData {
    [key: string]: any;
}
function getKeyByValue(object: { [key: string]: any }, value: any): string | undefined {
    return Object.keys(object).find((key) => object[key] === value);
}
async function exportToExcel(data: ItemData[], filename: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Nang_suat');

    const columns = Object.keys(data[0] || {});
    const columnLength = columns.length;
    worksheet.mergeCells(1, 1, 1, columnLength); // Gộp ô dòng 1 từ cột 1 đến cột cuối cùng
    worksheet.mergeCells(2, 1, 2, columnLength);
    worksheet.mergeCells(3, 1, 3, columnLength);

    worksheet.addRow([]);
    worksheet.addRow(columns); //tiêu đề
    // Cấu hình cột
    worksheet.columns = columns.map((column) => ({
        header: column.toUpperCase(),
        key: column,
        width: 15,
    }));

    worksheet.getRow(5).font = { bold: true };
    worksheet.getRow(5).alignment = { horizontal: 'center' };
    for (let colIndex = 1; colIndex <= columnLength; colIndex++) {
        worksheet.getRow(5).getCell(colIndex).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFF00' }, // Màu vàng
        };
    }
    data.forEach((item) => {
        const row = worksheet.addRow(item);
        columns.forEach((column, colIndex) => {
            const cell = row.getCell(colIndex + 1); 
            if (column === 'Giờ láp ráp' && item[column]) {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFF00' }, // Màu vàng
                };
            }
            const isDateColumn = /^\d{1,2}-\d{1,2}$/.test(column);
            if (isDateColumn && cell.value) {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: '40dec7' }, // Tô màu vàng cho các ô có định dạng dd-mm
                };
            }
            // Định dạng viền cho ô
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
            cell.alignment = {
               horizontal: 'center'
            };
        });
    });

    const columnIndex_GLR = getKeyByValue(columns, 'Giờ láp ráp');
    const columnIndex_NTD = getKeyByValue(columns, 'Ngày test dây');
    const columnIndex_GTD = getKeyByValue(columns, 'Giờ test dây');
    if (columnIndex_GLR) {
        const colIndex = parseInt(columnIndex_GLR) + 1;
        for (let rowIndex = 5; rowIndex <= worksheet.rowCount; rowIndex++) {
            const cell = worksheet.getCell(rowIndex, colIndex);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFC000' },
            };
        }
    }
    if (columnIndex_NTD) {
        const colIndex = parseInt(columnIndex_NTD) + 1;
        for (let rowIndex = 5; rowIndex <= worksheet.rowCount; rowIndex++) {
            const cell = worksheet.getCell(rowIndex, colIndex);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFC000' },
            };
        }
    }
    if (columnIndex_GTD) {
        const colIndex = parseInt(columnIndex_GTD) + 1;
        for (let rowIndex = 5; rowIndex <= worksheet.rowCount; rowIndex++) {
            const cell = worksheet.getCell(rowIndex, colIndex);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFC000' },
            };
        }
    }
    worksheet.getCell('A1').value = 'Công Ty TNHH MTV VIỆT TRẦN';
    worksheet.getCell('A2').value = 'Lô A, đường số 1, KCN Long Đức, xã Long Đức, TP Trà Vinh';
    worksheet.getCell('A3').value = `Dữ liệu kế hoạch`;
    worksheet.getCell('A1').font = { bold: true, size: 14 };
    worksheet.getCell('A2').font = { size: 12 };
    worksheet.getCell('A3').font = { bold: true, size: 12 };
    worksheet.getCell('A1').alignment = { horizontal: 'left' };
    worksheet.getCell('A2').alignment = { horizontal: 'left' };
    worksheet.getCell('A3').alignment = { horizontal: 'center' };

    const columnIndex_lcd = getKeyByValue(columns, 'lotcatday1');
    if (columnIndex_lcd) {
        const colIndex = parseInt(columnIndex_lcd) + 1;
        const cell = worksheet.getCell(5, colIndex);      
        cell.value = `Lot cắt dây`;
    }
    const columnIndex_nb = getKeyByValue(columns, 'nhomban');
    if (columnIndex_nb) {
        const colIndex = parseInt(columnIndex_nb) + 1;
        const cell = worksheet.getCell(5, colIndex);      
        cell.value = `Nhóm bàn`;
    }
    const columnIndex_nllr = getKeyByValue(columns, 'nangluclaprap');
    if (columnIndex_nllr) {
        const colIndex = parseInt(columnIndex_nllr) + 1;
        const cell = worksheet.getCell(5, colIndex);      
        cell.value = `Năng lực láp ráp`;
    }
    // Lưu file Excel
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), filename);
}

export default exportToExcel;
