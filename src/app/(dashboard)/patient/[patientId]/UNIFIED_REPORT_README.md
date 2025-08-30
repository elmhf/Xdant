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
├── UnifiedReportView.js          # Main unified component
├── panoReport/[panoReportid]/
│   └── page.js                   # Now imports UnifiedReportView
├── threeDModelReport/[threeDModelReportid]/
│   └── page.js                   # Now imports UnifiedReportView
├── cbctReport/[cbctReportid]/
│   └── page.js                   # Now imports UnifiedReportView
├── ToothSlice/[toothId]/
│   ├── page.js                   # Tooth slice component (standalone)
│   └── useSliceImage.js          # Tooth slice hooks
└── hook/
    └── useReportData.js          # Shared data fetching logic
```

## Benefits

1. **Code Reusability**: Single component handles all report types
2. **Maintainability**: Changes only need to be made in one place
3. **Consistency**: All report types have the same behavior and UI patterns
4. **Reduced Bundle Size**: Less duplicate code
5. **Easier Testing**: Single component to test instead of multiple
6. **Specialized Handling**: ToothSlice maintains its unique functionality while being part of the unified system

## Usage

Each report page now simply imports and renders the unified component:

```javascript
"use client";
import UnifiedReportView from "../../UnifiedReportView";

export default function PanoReportPage() {
  return <UnifiedReportView />;
}
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
