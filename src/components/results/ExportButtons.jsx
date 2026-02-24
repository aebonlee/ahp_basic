import Button from '../common/Button';
import { exportToExcel } from '../../lib/exportUtils';

export default function ExportButtons({ criteria, alternatives, results }) {
  const handleExcel = () => {
    exportToExcel(criteria, alternatives, results);
  };

  const handlePdf = () => {
    // 인쇄용 스타일을 동적으로 추가하여 현재 결과 영역만 PDF로 출력
    const style = document.createElement('style');
    style.id = 'pdf-print-style';
    style.textContent = `
      @media print {
        body * { visibility: hidden; }
        .sectionGap, .sectionGap * { visibility: visible !important; }
        nav, footer, [class*="sidebar"], [class*="Sidebar"],
        [class*="toolbar"], [class*="Toolbar"], [class*="header"],
        [class*="actionBar"], button { display: none !important; }
        .sectionGap { position: relative; page-break-inside: avoid; }
        @page { margin: 15mm; size: A4 landscape; }
      }
    `;
    document.head.appendChild(style);
    window.print();
    // 인쇄 후 스타일 제거
    setTimeout(() => {
      const el = document.getElementById('pdf-print-style');
      if (el) el.remove();
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button size="sm" variant="secondary" onClick={handleExcel}>
        Excel 저장
      </Button>
      <Button size="sm" variant="secondary" onClick={handlePdf}>
        PDF 저장
      </Button>
    </div>
  );
}
