import { jsPDF } from 'jspdf';

// Helper to remove Vietnamese tones for safe PDF generation (avoiding square boxes in standard jsPDF fonts)
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  let result = str;
  result = result.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  result = result.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  result = result.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  result = result.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  result = result.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  result = result.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  result = result.replace(/đ/g, "d");
  result = result.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  result = result.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  result = result.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  result = result.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  result = result.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  result = result.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  result = result.replace(/Đ/g, "D");
  
  // Normalize decomposition
  result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Custom characters often used
  result = result.replace(/đ/g, 'd').replace(/Đ/g, 'D');
  return result;
}

// Function to export weekly roster / work schedule to PDF
export function exportRosterToPDF(
  roster: any[],
  scheduleRequests: any[],
  currentUserName: string
) {
  // Use landscape for wide timetable
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const clean = (text: string) => removeVietnameseTones(text);

  // Title & Header Background Banner
  doc.setFillColor(30, 41, 59); // Dark slate
  doc.rect(0, 0, 297, 35, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(clean('BANG PHAN CA LAM VIEC & TRUC NHAT TUAN'), 15, 15);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(clean('He thong Quan ly Noi bo - GrandStay Premier Hotel & Suites'), 15, 22);
  doc.text(clean(`Nguoi xuat: ${currentUserName} | Ngay xuat: ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}`), 15, 28);

  // Stats / Legend Area
  doc.setFillColor(248, 250, 252); // Soft light background
  doc.rect(15, 42, 267, 18, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, 42, 267, 18, 'S');

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('Helvetica', 'bold');
  doc.text(clean('CHU THICH CA LAM VIEC:'), 20, 48);

  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(clean('S: Ca Sang (06h - 14h)  |  C: Ca Chieu (14h - 22h)  |  D: Ca Dem (22h - 06h)  |  HC: Hanh Chinh (08h - 17h)  |  OFF: Nghi'), 20, 54);

  // Draw table header
  const startY = 68;
  const colWidths = {
    staff: 50,
    role: 45,
    days: 23 // 23 * 7 = 161. Total: 50 + 45 + 161 = 256. Margin: 15 on left, 26 margin on right
  };

  const daysHeader = [
    { key: '2026-06-25', label: 'T5 25/06' },
    { key: '2026-06-26', label: 'T6 26/06' },
    { key: '2026-06-27', label: 'T7 27/06' },
    { key: '2026-06-28', label: 'CN 28/06' },
    { key: '2026-06-29', label: 'T2 29/06' },
    { key: '2026-06-30', label: 'T3 30/06' },
    { key: '2026-07-01', label: 'T4 01/07' }
  ];

  // Draw header boxes
  doc.setFillColor(241, 245, 249);
  doc.rect(15, startY, 267, 10, 'F');
  doc.rect(15, startY, 267, 10, 'S');

  doc.setTextColor(71, 85, 105);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(clean('Nhan Vien'), 18, startY + 6.5);
  doc.text(clean('Vai Tro / Bo Phan'), 15 + colWidths.staff + 3, startY + 6.5);

  let currentX = 15 + colWidths.staff + colWidths.role;
  daysHeader.forEach(day => {
    doc.text(clean(day.label), currentX + (colWidths.days / 2), startY + 6.5, { align: 'center' });
    currentX += colWidths.days;
  });

  // Table rows
  let rowY = startY + 10;
  const rowHeight = 11;

  roster.forEach((item, index) => {
    // Zebra striping
    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(15, rowY, 267, rowHeight, 'F');
    }
    doc.setDrawColor(241, 245, 249);
    doc.line(15, rowY + rowHeight, 282, rowY + rowHeight);

    // Border line left/right/cols
    doc.setDrawColor(226, 232, 240);
    doc.line(15, rowY, 15, rowY + rowHeight);
    doc.line(282, rowY, 282, rowY + rowHeight);

    // Text cells
    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(clean(item.staffName), 18, rowY + 7);

    doc.setTextColor(100, 116, 139);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(clean(item.roleName), 15 + colWidths.staff + 3, rowY + 7);

    // Shift columns
    let shiftX = 15 + colWidths.staff + colWidths.role;
    daysHeader.forEach(day => {
      const rawShift = item.shifts[day.key] || 'OFF';
      let displayShift = 'OFF';
      
      if (rawShift.includes('Ca Sáng')) displayShift = 'SANG (S)';
      else if (rawShift.includes('Ca Chiều')) displayShift = 'CHIEU (C)';
      else if (rawShift.includes('Ca Đêm')) displayShift = 'DEM (D)';
      else if (rawShift.includes('Hành chính')) displayShift = 'H.CHINH';
      else if (rawShift.includes('phép')) displayShift = 'PHEP';
      else if (rawShift.includes('ốm')) displayShift = 'OM';

      doc.setFont('Helvetica', displayShift !== 'OFF' ? 'bold' : 'normal');
      doc.setTextColor(
        displayShift.includes('SANG') ? 29 :
        displayShift.includes('CHIEU') ? 180 :
        displayShift.includes('DEM') ? 79 :
        displayShift.includes('H.CHINH') ? 16 : 220,
        displayShift.includes('SANG') ? 78 :
        displayShift.includes('CHIEU') ? 83 :
        displayShift.includes('DEM') ? 70 :
        displayShift.includes('H.CHINH') ? 124 : 38,
        displayShift.includes('SANG') ? 216 :
        displayShift.includes('CHIEU') ? 9 :
        displayShift.includes('DEM') ? 229 :
        displayShift.includes('H.CHINH') ? 16 : 38
      );
      doc.setFontSize(7.5);
      doc.text(clean(displayShift), shiftX + (colWidths.days / 2), rowY + 7, { align: 'center' });
      shiftX += colWidths.days;
    });

    rowY += rowHeight;
  });

  // End of table border
  doc.setDrawColor(203, 213, 225);
  doc.line(15, rowY, 282, rowY);

  // Footer note
  doc.setTextColor(148, 163, 184);
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(8);
  doc.text(clean('* Du lieu phan ca truc nay duoc ket xuat tu Dong Bo Thoi Gian Thuc. Moi thay doi phai thong qua phe duyet cua Ban Quan Ly.'), 15, rowY + 12);

  // Save the PDF
  doc.save(`Lich_Lam_Viec_Tuan_${new Date().toISOString().slice(0,10)}.pdf`);
}

// Function to export room/apartment maintenance logs & status to PDF
export function exportMaintenanceToPDF(
  rooms: any[],
  apartments: any[],
  currentUserName: string
) {
  // Use portrait for standard lists
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const clean = (text: string) => removeVietnameseTones(text);

  // Title & Header Background Banner
  doc.setFillColor(15, 118, 110); // Teal shade for maintenance/operations
  doc.rect(0, 0, 210, 35, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(clean('BAO CAO TRANG THAI BAO TRI & VE SINH PHONG'), 15, 15);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(204, 251, 241);
  doc.text(clean('Phan he ky thuat & Buong phong - GrandStay Premier Hotel & Suites'), 15, 22);
  doc.text(clean(`Nguoi xuat: ${currentUserName} | Ngay xuat: ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}`), 15, 28);

  // Summary widgets row
  doc.setFillColor(248, 250, 252);
  doc.rect(15, 42, 180, 22, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, 42, 180, 22, 'S');

  const cleanRoomsCount = rooms.filter(r => r.status === 'Clean').length;
  const dirtyRoomsCount = rooms.filter(r => r.status === 'Dirty').length;
  const repairingRoomsCount = rooms.filter(r => r.status === 'Repairing' || r.status === 'Cleaning').length;

  const cleanApts = apartments.filter(a => !a.maintenanceStatus || a.maintenanceStatus === 'Clean').length;
  const repairApts = apartments.filter(a => a.maintenanceStatus === 'Needs Repair').length;
  const maintainingApts = apartments.filter(a => a.maintenanceStatus === 'Under Maintenance').length;
  const totalCost = apartments.reduce((sum, a) => sum + (a.estimatedRepairCost || 0), 0);

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.setFont('Helvetica', 'bold');
  doc.text(clean('TONG QUAN TIEN DO & TRANG THAI:'), 20, 48);

  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(clean(`Khach san: ${cleanRoomsCount} Sach, ${dirtyRoomsCount} Ban, ${repairingRoomsCount} Dang don dẹp/Sua chua`), 20, 53);
  doc.text(clean(`Can ho dai han: ${cleanApts} Sach, ${repairApts} Can sua gap, ${maintainingApts} Dang bao tri. Chi phi uoc tinh: ${totalCost.toLocaleString('vi-VN')} VND`), 20, 58);

  // SECTION 1: HOTEL ROOMS (NGAN HAN)
  let startY = 72;
  doc.setTextColor(15, 118, 110);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(clean('I. TRANG THAI VE SINH & KHACH SAN (NGAN HAN)'), 15, startY);

  startY += 5;
  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(15, startY, 180, 8, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, startY, 180, 8, 'S');

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8.5);
  doc.text(clean('Ma Phong'), 18, startY + 5.5);
  doc.text(clean('Loai Hinh / Chi Nhanh'), 45, startY + 5.5);
  doc.text(clean('Trang Thai'), 115, startY + 5.5);
  doc.text(clean('Luu Tru'), 160, startY + 5.5);

  let rowY = startY + 8;
  const rowHeight = 9;

  rooms.forEach((room, index) => {
    // Zebra row
    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(15, rowY, 180, rowHeight, 'F');
    }
    doc.setDrawColor(241, 245, 249);
    doc.line(15, rowY + rowHeight, 195, rowY + rowHeight);

    // Border line left/right
    doc.setDrawColor(226, 232, 240);
    doc.line(15, rowY, 15, rowY + rowHeight);
    doc.line(195, rowY, 195, rowY + rowHeight);

    // Content
    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.text(clean(room.name), 18, rowY + 6);

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(clean(room.branchName), 45, rowY + 6);

    // Status styling
    const st = room.status;
    let stText = 'Sach se';
    if (st === 'Dirty') stText = 'Chua don dep (Ban)';
    if (st === 'Cleaning') stText = 'Dang lam ve sinh';
    if (st === 'Repairing') stText = 'Dang sua chua';

    doc.setFont('Helvetica', st !== 'Clean' ? 'bold' : 'normal');
    doc.setTextColor(st === 'Clean' ? 16 : st === 'Dirty' ? 220 : 217, st === 'Clean' ? 124 : st === 'Dirty' ? 38 : 119, st === 'Clean' ? 16 : st === 'Dirty' ? 38 : 6);
    doc.text(clean(stText), 115, rowY + 6);

    // Occupancy
    doc.setTextColor(100, 116, 139);
    doc.setFont('Helvetica', 'normal');
    doc.text(clean(room.occupancy === 'Occupied' ? 'Co khach o' : room.occupancy === 'Reserved' ? 'Cho checkin' : 'Phong trong'), 160, rowY + 6);

    rowY += rowHeight;
  });

  // End of Section 1
  doc.setDrawColor(203, 213, 225);
  doc.line(15, rowY, 195, rowY);

  // Page Break or continue if room exists for Section 2
  // Let's add Section 2: Apartments
  let sec2Y = rowY + 12;
  if (sec2Y > 230) {
    doc.addPage();
    sec2Y = 20;
  }

  doc.setTextColor(15, 118, 110);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(clean('II. NHAT KY BAO TRI & HONG HOC CAN HO (DAI HAN)'), 15, sec2Y);

  sec2Y += 5;
  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(15, sec2Y, 180, 8, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, sec2Y, 180, 8, 'S');

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8.5);
  doc.text(clean('Can Ho'), 18, sec2Y + 5.5);
  doc.text(clean('Khu Vuc / Vi Tri'), 42, sec2Y + 5.5);
  doc.text(clean('Trang Thai Ky Thuat'), 90, sec2Y + 5.5);
  doc.text(clean('Uoc Tinh Phis'), 135, sec2Y + 5.5);
  doc.text(clean('Ghi Chu Hu Hong'), 162, sec2Y + 5.5);

  let sec2RowY = sec2Y + 8;
  const sec2RowHeight = 11;

  apartments.forEach((apt, index) => {
    // Page constraints check
    if (sec2RowY > 270) {
      doc.addPage();
      sec2RowY = 20;
      // Re-draw simple header in new page
      doc.setFillColor(241, 245, 249);
      doc.rect(15, sec2RowY, 180, 8, 'F');
      doc.rect(15, sec2RowY, 180, 8, 'S');
      doc.setTextColor(71, 85, 105);
      doc.text(clean('Can Ho'), 18, sec2RowY + 5.5);
      doc.text(clean('Khu Vuc'), 42, sec2RowY + 5.5);
      doc.text(clean('Trang Thai Ky Thuat'), 90, sec2RowY + 5.5);
      doc.text(clean('Phis'), 135, sec2RowY + 5.5);
      doc.text(clean('Ghi Chu Hu Hong'), 162, sec2RowY + 5.5);
      sec2RowY += 8;
    }

    // Zebra
    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(15, sec2RowY, 180, sec2RowHeight, 'F');
    }
    doc.setDrawColor(241, 245, 249);
    doc.line(15, sec2RowY + sec2RowHeight, 195, sec2RowY + sec2RowHeight);

    // Border line left/right
    doc.setDrawColor(226, 232, 240);
    doc.line(15, sec2RowY, 15, sec2RowY + sec2RowHeight);
    doc.line(195, sec2RowY, 195, sec2RowY + sec2RowHeight);

    // Content
    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(clean(apt.name), 18, sec2RowY + 7);

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(clean(apt.location), 42, sec2RowY + 7);

    // Maintenance Status
    const ms = apt.maintenanceStatus || 'Clean';
    let msText = 'Binh thuong (Sach)';
    if (ms === 'Needs Repair') msText = 'Can sua chua gap';
    if (ms === 'Under Maintenance') msText = 'Dang bao tri';

    doc.setFont('Helvetica', ms !== 'Clean' ? 'bold' : 'normal');
    doc.setTextColor(ms === 'Clean' ? 13 : ms === 'Needs Repair' ? 220 : 217, ms === 'Clean' ? 148 : ms === 'Needs Repair' ? 38 : 119, ms === 'Clean' ? 136 : ms === 'Needs Repair' ? 38 : 6);
    doc.text(clean(msText), 90, sec2RowY + 7);

    // Repair cost
    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    const costText = apt.estimatedRepairCost && apt.estimatedRepairCost > 0 
      ? `${apt.estimatedRepairCost.toLocaleString('vi-VN')} d` 
      : '0 d';
    doc.text(clean(costText), 135, sec2RowY + 7);

    // Notes
    doc.setTextColor(100, 116, 139);
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(7.5);
    const rawNote = apt.maintenanceNotes || 'Khong co ghi chu';
    const noteCut = rawNote.length > 22 ? rawNote.slice(0, 20) + '...' : rawNote;
    doc.text(clean(noteNoteSafe(noteCut)), 162, sec2RowY + 7);

    sec2RowY += sec2RowHeight;
  });

  function noteNoteSafe(n: string) {
    return n.replace(/[\n\r]+/g, ' ');
  }

  // End of Section 2
  doc.setDrawColor(203, 213, 225);
  doc.line(15, sec2RowY, 195, sec2RowY);

  // Footer note
  doc.setTextColor(148, 163, 184);
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(8);
  doc.text(clean('* Bao cao trang thai ky thuat va don dep can ho tu dong tich hop boi he thong GrandStay.'), 15, sec2RowY + 12);

  // Save the PDF
  doc.save(`Bao_Cao_Bao_Tri_Phong_${new Date().toISOString().slice(0,10)}.pdf`);
}
