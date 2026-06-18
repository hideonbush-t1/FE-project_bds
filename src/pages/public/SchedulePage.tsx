import { PublicDataPanel } from '../../components/pages/PublicDataPanel';

export function SchedulePage() {
  return (
    <PublicDataPanel 
      title="Lịch làm việc" 
      endpoint="/public/lich-lam-viec" 
    />
  );
}