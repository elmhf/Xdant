// Report utility functions

import i18next from 'i18next';

// Get report name based on report type
export const getReportName = (reportType) => {
  const t = (key, fallback) => i18next.t(`reportTypes.${key}`, { defaultValue: fallback });

  const names = {
    'cbct': t('cbct', 'CBCT'),
    'pano': t('pano', 'Pano'),
    'ioxray': t('ioxray', 'IOXRay'),
    '3dmodel': t('3dmodel', '3D Model'),
    'implant': t('implant', 'Implant'),
    'ortho': t('ortho', 'Ortho'),
    'dental_analysis': t('dentalAnalysis', 'Dental Analysis'),
    'xray_analysis': t('xrayAnalysis', 'X-Ray Analysis'),
    'default': reportType
  };
  return names[reportType] || reportType;
};

// Get report description based on report type
export const getReportDescription = (reportType) => {
  const t = (key, fallback) => i18next.t(`reportDescriptions.${key}`, { defaultValue: fallback });

  const descriptions = {
    'cbct': t('cbct', 'Cone Beam Computed Tomography'),
    'pano': t('pano', 'Panoramic X-ray'),
    'ioxray': t('ioxray', 'Intraoral X-ray'),
    '3dmodel': t('3dmodel', 'Three-dimensional model'),
    'implant': t('implant', 'Dental implant analysis'),
    'ortho': t('ortho', 'Orthodontic treatment'),
    'dental_analysis': t('dentalAnalysis', 'Comprehensive dental analysis'),
    'xray_analysis': t('xrayAnalysis', 'X-ray image analysis'),
    'default': t('default', 'AI-powered analysis')
  };
  return descriptions[reportType] || t('default', 'AI-powered analysis');
};

// ... (getReportIcon stays as is) ...

// Get AI report name for display
export const getAIReportName = (reportType) => {
  const t = (key, fallback) => i18next.t(`reportTypes.${key}`, { defaultValue: fallback });

  const names = {
    'cbct': `CBCT ${t('aiSuffix', 'AI')}`,
    'pano': `Pano ${t('aiSuffix', 'AI')}`,
    'ioxray': `IOXRay ${t('aiSuffix', 'AI')}`,
    '3dmodel': `3D Model ${t('aiSuffix', 'AI')}`,
    'implant': `Implant ${t('aiSuffix', 'AI')}`,
    'ortho': `Ortho ${t('aiSuffix', 'AI')}`,
    'dental_analysis': `Dental Analysis ${t('aiSuffix', 'AI')}`,
    'xray_analysis': `X-Ray Analysis ${t('aiSuffix', 'AI')}`,
    'default': `${reportType} ${t('aiSuffix', 'AI')}`
  };
  return names[reportType] || `${reportType} ${t('aiSuffix', 'AI')}`;
};

// Get AI report description
export const getAIReportDescription = (reportType) => {
  const t = (key, fallback) => i18next.t(`reportDescriptions.${key}`, { defaultValue: fallback });

  const descriptions = {
    'cbct': t('cbctAi', 'Cone Beam Computed Tomography Analysis'),
    'pano': t('panoAi', 'Panoramic X-ray Analysis'),
    'ioxray': t('ioxrayAi', 'Intraoral X-ray Analysis'),
    '3dmodel': t('3dmodelAi', 'Three-dimensional Model Generation'),
    'implant': t('implantAi', 'Dental Implant Analysis'),
    'ortho': t('orthoAi', 'Orthodontic Treatment Analysis'),
    'dental_analysis': t('dentalAnalysisAi', 'Comprehensive Dental Analysis'),
    'xray_analysis': t('xrayAnalysisAi', 'X-ray Image Analysis'),
    'default': t('defaultAi', 'AI-powered Analysis')
  };
  return descriptions[reportType] || t('defaultAi', 'AI-powered Analysis');
};

// Format date for display
export const formatReportDate = (dateString) => {
  const date = new Date(dateString);
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  // Use current i18next language
  return date.toLocaleDateString(i18next.language || 'en-US', options);
};

// Get status badge configuration
export const getStatusBadgeConfig = (status) => {
  const t = (key) => i18next.t(`reportStatus.${key}`);

  const statusConfig = {
    completed: { color: 'bg-green-100 text-green-800', text: t('completed') },
    processing: { color: 'bg-yellow-100 text-yellow-800', text: t('processing') },
    pending: { color: 'bg-gray-100 text-gray-800', text: t('pending') },
    failed: { color: 'bg-red-100 text-red-800', text: t('failed') }
  };

  return statusConfig[status] || statusConfig.pending;
};

// Convert patient reports to orders format
export const convertReportsToOrders = (reports) => {
  const orders = reports.map((report) => {
    const order = {
      id: report.id,
      type: getAIReportName(report.raport_type || report.type),
      status: report.status,
      date: new Date(report.created_at || report.createdAt).toISOString().split('T')[0],
      time: new Date(report.created_at || report.createdAt).toTimeString().split(' ')[0].slice(0, 5),
      description: getAIReportDescription(report.raport_type || report.type),
      image: '/public/Axialview.png', // Placeholder image
      hasAnnotations: report.status === 'completed',
      report_url: report.report_url,
      data_url: report.data_url,
      image_url: report.image_url

    };

    return order;
  });

  return orders;
};