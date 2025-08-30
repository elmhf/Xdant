# Unified Report View Component

## Overview
This component (`UnifiedReportView.js`) consolidates the functionality for all four report types (Pano, ThreeDModel, CBCT, ToothSlice) into a single, reusable component instead of having separate files for each view.

## How It Works

### 1. Report Type Detection
The component automatically detects the report type based on the URL parameters:
- `panoReportid` → `pano` type
- `threeDModelReportid` → `threeDModel` type  
- `cbctReportid` → `cbct` type
- `toothId` → `toothSlice` type

### 2. Dynamic Content
Based on the detected report type, the component provides:
- **Loading messages**: Specific messages for each report type
- **Error messages**: Tailored error handling for each type
- **Icons**: Different icons for visual distinction
- **Descriptions**: Type-specific descriptions

### 3. Unified Data Handling
All report types now use unified data handling:

- **Standard Reports** (Pano, ThreeDModel, CBCT): Use `useReportData` hook
- **ToothSlice**: Uses `useToothSliceData` hook (specialized for slice data)

Both hooks provide:
- Automatic data fetching and caching
- Error management and retry functionality
- Store integration (dental store and image store)
- Consistent API for loading states and error handling

## File Structure

```
[patientId]/
├── [report_id]/
│   ├── page.js                   # Main unified component (handles all report types)
│   └── UnifiedReportView.js      # Legacy component (for backward compatibility)
├── ToothSlice/[toothId]/
│   ├── page.js                   # Tooth slice component (standalone)
│   └── useSliceImage.js          # Tooth slice hooks
└── hook/
    ├── useReportData.js          # Shared data fetching logic
    └── useToothSliceData.js      # Tooth slice data hook
```

## Benefits

1. **Simplified Routing**: Single route handles all report types instead of separate folders
2. **Code Reusability**: Single component handles all report types
3. **Maintainability**: Changes only need to be made in one place
4. **Consistency**: All report types have the same behavior and UI patterns
5. **Reduced Bundle Size**: Less duplicate code and fewer routes
6. **Easier Testing**: Single component to test instead of multiple
7. **Cleaner URLs**: More intuitive URL structure with query parameters
8. **Specialized Handling**: ToothSlice maintains its unique functionality while being part of the unified system

## Usage

### New Direct Routing (Recommended)

All reports now use direct routing to the `[report_id]` folder:

```
/patient/[patientId]/[report_id]?type=pano&id=abc123
/patient/[patientId]/[report_id]?type=cbct&id=def456
/patient/[patientId]/[report_id]?type=threeDModel&id=ghi789
/patient/[patientId]/[report_id]?type=toothSlice&id=tooth123
```

### URL Structure

- **Patient ID**: From URL path `/patient/[patientId]/`
- **Report ID**: From URL path `/[report_id]`
- **Report Type**: From query parameter `?type=pano|cbct|threeDModel|toothSlice`

### Example URLs

```
/patient/123/report-456?type=pano
/patient/123/report-789?type=cbct
/patient/123/report-101?type=threeDModel
/patient/123/tooth-5?type=toothSlice
```

## Configuration Functions

The component includes helper functions that return appropriate content based on report type:

- `getLoadingConfig()`: Returns loading message and icon
- `getErrorConfig()`: Returns error title and icon  
- `getNoDataConfig()`: Returns no-data title, description, and icon

## Report Type Icons

- 🦷 Pano (Panoramic)
- 🎯 ThreeDModel (3D Model)
- 📄 CBCT
- 🦷 ToothSlice (Tooth Slice)
- 📊 Default/Unknown

## Error Handling

The component provides comprehensive error handling with:
- Retry functionality
- Cache clearing (development only)
- Detailed error messages
- Report ID and type display for debugging

## Future Enhancements

- Add support for additional report types
- Implement report type switching within the component
- Add analytics tracking for different report types
- Enhance caching strategies for different report types
