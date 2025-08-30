import { useEffect } from 'react';
import { fetchJsonFromUrl } from '@/src/stores/dataStore';

// هوك عام لجلب بيانات التقرير حسب النوع
export function useReportData(type, reportId) {
  useEffect(() => {
    let url = '';
    switch (type) {
      case 'pano':
        url = `https://example.com/pano/${reportId}.json`;
        break;
      case 'cbct':
        url = `https://example.com/cbct/${reportId}.json`;
        break;
      case 'ioxray':
        url = `https://example.com/ioxray/${reportId}.json`;
        break;
      default:
        url = '';
    }
    if (url) {
      fetchJsonFromUrl(url);
    }
  }, [type, reportId]);
}
