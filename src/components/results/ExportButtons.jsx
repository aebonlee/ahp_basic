import Button from '../common/Button';
import { exportToExcel } from '../../lib/exportUtils';

export default function ExportButtons({ criteria, alternatives, results }) {
  const handleExcel = () => {
    exportToExcel(criteria, alternatives, results);
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button size="sm" variant="secondary" onClick={handleExcel}>
        Excel 저장
      </Button>
    </div>
  );
}
