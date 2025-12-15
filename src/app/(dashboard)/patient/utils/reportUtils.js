// Report utility functions

// Get report name based on report type
export const getReportName = (reportType) => {
  const names = {
    'cbct': 'CBCT',
    'pano': 'Pano',
    'ioxray': 'IOXRay',
    '3dmodel': '3D Model',
    'implant': 'Implant',
    'ortho': 'Ortho',
    'dental_analysis': 'Dental Analysis',
    'xray_analysis': 'X-Ray Analysis',
    'default': reportType
  };
  return names[reportType] || reportType;
};

// Get report description based on report type
export const getReportDescription = (reportType) => {
  const descriptions = {
    'cbct': 'Cone Beam Computed Tomography',
    'pano': 'Panoramic X-ray',
    'ioxray': 'Intraoral X-ray',
    '3dmodel': 'Three-dimensional model',
    'implant': 'Dental implant analysis',
    'ortho': 'Orthodontic treatment',
    'dental_analysis': 'Comprehensive dental analysis',
    'xray_analysis': 'X-ray image analysis',
    'default': 'AI-powered analysis'
  };
  return descriptions[reportType] || 'AI-powered analysis';
};

// Get report icon based on report type
export const getReportIcon = (reportType) => {
  const icons = {
    'cbct': (
      <svg className="w-8 h-8 text-[#7564ed]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="4 4" strokeWidth={2} fill="none" />
      </svg>
    ),
    'pano': (
      <svg className="w-8 h-8 text-[#7564ed]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <ellipse cx="12" cy="12" rx="8" ry="4" strokeWidth={2} />
        <ellipse cx="12" cy="12" rx="6" ry="3" strokeWidth={2} />
      </svg>
    ),
    'ioxray': (
      <svg className="w-8 h-8 text-[#7564ed]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="4 4" strokeWidth={2} fill="none" />
      </svg>
    ),
    '3dmodel': (
      <svg className="w-8 h-8 text-[#7564ed]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m-4-4h8" />
      </svg>
    ),
    'implant': (
      <svg className="w-8 h-8 text-[#7564ed]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8l4 4-4 4m-4-4h8" />
      </svg>
    ),
    'ortho': (
      <svg className="w-8 h-8 text-[#7564ed]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8m-4-4v8" />
      </svg>
    ),
    'dental_analysis': (
      <svg className="w-8 h-8 text-[#7564ed]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m-4-4h8" />
      </svg>
    ),
    'xray_analysis': (
      <svg className="w-8 h-8 text-[#7564ed]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <ellipse cx="12" cy="12" rx="8" ry="4" strokeWidth={2} />
        <ellipse cx="12" cy="12" rx="6" ry="3" strokeWidth={2} />
      </svg>
    ),
    'default': (
      <svg className="w-8 h-8 text-[#7564ed]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    )
  };
  return icons[reportType] || icons['default'];
};

// Get AI report name for display
export const getAIReportName = (reportType) => {
  const names = {
    'cbct': 'CBCT AI',
    'pano': 'Pano AI',
    'ioxray': 'IOXRay AI',
    '3dmodel': '3D Model AI',
    'implant': 'Implant AI',
    'ortho': 'Ortho AI',
    'dental_analysis': 'Dental Analysis AI',
    'xray_analysis': 'X-Ray Analysis AI',
    'default': `${reportType} AI`
  };
  return names[reportType] || `${reportType} AI`;
};

// Get AI report description
export const getAIReportDescription = (reportType) => {
  const descriptions = {
    'cbct': 'Cone Beam Computed Tomography Analysis',
    'pano': 'Panoramic X-ray Analysis',
    'ioxray': 'Intraoral X-ray Analysis',
    '3dmodel': 'Three-dimensional Model Generation',
    'implant': 'Dental Implant Analysis',
    'ortho': 'Orthodontic Treatment Analysis',
    'dental_analysis': 'Comprehensive Dental Analysis',
    'xray_analysis': 'X-ray Image Analysis',
    'default': 'AI-powered Analysis'
  };
  return descriptions[reportType] || 'AI-powered Analysis';
};

// Format date for display
export const formatReportDate = (dateString) => {
  const date = new Date(dateString);
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('pt-BR', options);
};

// Get status badge configuration
export const getStatusBadgeConfig = (status) => {
  const statusConfig = {
    completed: { color: 'bg-green-100 text-green-800', text: 'Completed' },
    processing: { color: 'bg-yellow-100 text-yellow-800', text: 'Processing' },
    pending: { color: 'bg-gray-100 text-gray-800', text: 'Pending' },
    failed: { color: 'bg-red-100 text-red-800', text: 'Failed' }
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