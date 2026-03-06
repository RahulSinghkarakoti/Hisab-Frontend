// app/scan.tsx
import { useRouter } from 'expo-router';
import BillScannerScreen from '@/components/pages/BillScannerScreen';

export default function ScanPage() {
  const router = useRouter();
  return (
    <BillScannerScreen
      onClose={() => router.back()}
      // authToken={token}   ← pass your JWT here
    />
  );
}