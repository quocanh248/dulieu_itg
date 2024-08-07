import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

async function exportToExcel(data, filename) {
  // Tạo workbook mới
  const workbook = new ExcelJS.Workbook();
  
  // Thêm worksheet vào workbook
  const worksheet = workbook.addWorksheet('Nang_suat');

  // Thêm tiêu đề
  worksheet.mergeCells('A1:L1');
  worksheet.mergeCells('A2:L2');
  worksheet.mergeCells('A3:L3');

  worksheet.getCell('A1').value = 'Công Ty TNHH MTV VIỆT TRẦN';
  worksheet.getCell('A2').value = 'Lô A, đường số 1, kcn Long Đức, xã Long Đức, tp Trà Vinh';
  worksheet.getCell('A3').value = `Dữ liệu năng suất ngày ${new Date().toISOString().split('T')[0]}`;

  // Định dạng tiêu đề
  worksheet.getCell('A1').font = { bold: true, size: 14 };
  worksheet.getCell('A2').font = { size: 12 };
  worksheet.getCell('A3').font = { bold: true, size: 12 };
  worksheet.getCell('A1').alignment = { horizontal: 'left' };
  worksheet.getCell('A2').alignment = { horizontal: 'left' };
  worksheet.getCell('A3').alignment = { horizontal: 'center' };

  // Thêm một hàng trống
  worksheet.addRow([]);

  // Thiết lập tiêu đề cột
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
    'Thời gian làm việc'
  ]);

  // Định dạng tiêu đề cột
  worksheet.getRow(5).font = { bold: true };
  worksheet.getRow(5).alignment = { horizontal: 'center' };
  worksheet.getRow(5).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFF00' }
  };
  worksheet.columns = [
    { width: 12 }, // A
    { width: 26 }, // B
    { width: 10 }, // C
    { width: 18 }, // D
    { width: 14 }, // E
    { width: 12 }, // F
    { width: 48 }, // G
    { width: 16 }, // H
    { width: 10 }, // I
    { width: 18 }, // J
    { width: 18 }, // K
    { width: 18 }, // L
  ];
  // Thêm dữ liệu vào worksheet
  data.forEach(item => {
    worksheet.addRow([
      item.manhansu,
      item.tennhansu,
      item.tennhom,
      item.model,
      item.lot,
      item.date,
      item.congdoan,
      item.vitri,
      item.soluong,
      item.thoigianthuchien,
      item.thoigianquydoi,
      item.thoigianlamviec
    ]);
  });    
  // Tạo file Excel và tải xuống
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer], { type: 'application/octet-stream' }), filename);
}

export default exportToExcel;
