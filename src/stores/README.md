# Patient Store Documentation

## Overview

The Patient Store is a centralized state management solution using Zustand for managing patient data, reports, WebSocket connections, and related UI state. It provides a comprehensive API for all patient-related operations.

## Features

- **Centralized State Management**: All patient and reports data in one place
- **WebSocket Integration**: Real-time updates and notifications
- **Dialog Management**: Centralized dialog state management
- **Filtering & Pagination**: Built-in filtering and pagination support
- **Loading States**: Comprehensive loading state management
- **Error Handling**: Centralized error handling
- **Persistence**: Automatic data persistence with selective serialization

## Store Structure

### State

```javascript
{
  // Patient data
  currentPatient: null,
  patients: [],
  
  // Reports data
  reports: [],
  reportsLoading: false,
  reportsError: null,
  
  // WebSocket state
  wsConnected: false,
  wsConnectionStatus: 'disconnected',
  wsLastUpdate: null,
  wsNotifications: [],
  
  // UI state
  loading: false,
  error: null,
  
  // Dialog states
  isAddDoctorOpen: false,
  isDeleteDoctorOpen: false,
  isEditPatientOpen: false,
  isDeleteReportOpen: false,
  
  // Selected items
  doctorToDelete: null,
  reportToDelete: null,
  
  // Loading states
  favoriteLoading: false,
  deleteDoctorLoading: false,
  deleteReportLoading: false,
  
  // Messages
  deleteDoctorMessage: "",
  deleteReportMessage: "",
  
  // Filters
  dateFilter: '',
  typeFilter: 'all',
  
  // Pagination
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0
}
```

## Usage

### Basic Usage

```javascript
import { usePatientStore } from '@/stores/patientStore';

function MyComponent() {
  const {
    currentPatient,
    reports,
    loading,
    fetchPatient,
    addReport,
    removeReport
  } = usePatientStore();

  // Use the store methods
  const handleLoadPatient = async (patientId) => {
    await fetchPatient(patientId);
  };

  return (
    <div>
      {loading ? 'Loading...' : currentPatient?.name}
    </div>
  );
}
```

### Using Custom Hooks

```javascript
import { usePatient, useReports, useWebSocket, useDialogs } from '@/app/(dashboard)/patient/hooks/usePatientStore';

function PatientPage({ patientId }) {
  // Patient operations
  const { patient, loading, loadPatient, toggleFavorite } = usePatient(patientId);
  
  // Reports operations
  const { reports, loadReports, addReport, removeReport } = useReports(patientId);
  
  // WebSocket operations
  const { isConnected, lastUpdate, notifications } = useWebSocket();
  
  // Dialog operations
  const { 
    isAddDoctorOpen, 
    openAddDoctorDialog, 
    closeAddDoctorDialog 
  } = useDialogs();

  return (
    <div>
      {/* Your component JSX */}
    </div>
  );
}
```

## API Reference

### Patient Operations

#### `fetchPatient(patientId)`
Fetches patient data from the server.

```javascript
const result = await fetchPatient('patient-123');
if (result.success) {
  console.log('Patient loaded:', result.patient);
}
```

#### `updatePatient(updates)`
Updates patient data in the store.

```javascript
updatePatient({ 
  first_name: 'John', 
  last_name: 'Doe' 
});
```

#### `toggleFavorite(patientId, newStatus)`
Toggles the favorite status of a patient.

```javascript
const result = await toggleFavorite('patient-123', true);
```

### Reports Operations

#### `fetchReports(patientId)`
Fetches reports for a specific patient.

```javascript
await fetchReports('patient-123');
```

#### `addReport(report)`
Adds a new report to the store.

```javascript
addReport({
  id: 'report-123',
  type: 'AI Analysis',
  status: 'pending',
  patient_id: 'patient-123'
});
```

#### `updateReport(reportId, updates)`
Updates a specific report.

```javascript
updateReport('report-123', { 
  status: 'completed',
  reportUrl: 'https://example.com/report.pdf'
});
```

#### `removeReport(reportId)`
Removes a report from the store.

```javascript
removeReport('report-123');
```

#### `deleteReport(reportId)`
Deletes a report from the server and store.

```javascript
const result = await deleteReport('report-123');
```

### WebSocket Operations

#### `setWsConnection(connected, status)`
Updates WebSocket connection status.

```javascript
setWsConnection(true, 'connected');
```

#### `setWsLastUpdate(update)`
Sets the last WebSocket update.

```javascript
setWsLastUpdate({
  type: 'report_status_changed',
  timestamp: new Date(),
  data: { reportId: '123', status: 'completed' }
});
```

#### `addWsNotification(notification)`
Adds a WebSocket notification.

```javascript
addWsNotification({
  id: 'notif-123',
  type: 'info',
  message: 'Report completed',
  timestamp: new Date()
});
```

### Dialog Operations

#### `openAddDoctorDialog()`
Opens the add doctor dialog.

#### `closeAddDoctorDialog()`
Closes the add doctor dialog.

#### `openDeleteDoctorDialog(doctor)`
Opens the delete doctor dialog with the specified doctor.

#### `closeDeleteDoctorDialog()`
Closes the delete doctor dialog.

#### `openEditPatientDialog()`
Opens the edit patient dialog.

#### `closeEditPatientDialog()`
Closes the edit patient dialog.

#### `openDeleteReportDialog(report)`
Opens the delete report dialog with the specified report.

#### `closeDeleteReportDialog()`
Closes the delete report dialog.

### Filter Operations

#### `setDateFilter(filter)`
Sets the date filter.

```javascript
setDateFilter('2024-01-15');
```

#### `setTypeFilter(filter)`
Sets the type filter.

```javascript
setTypeFilter('AI Analysis');
```

#### `clearFilters()`
Clears all filters.

```javascript
clearFilters();
```

### Computed Values

#### `getFilteredReports()`
Returns filtered reports based on current filters.

#### `getPendingReports()`
Returns only pending reports.

#### `getCompletedReports()`
Returns only completed reports.

#### `getActiveReports()`
Returns active reports (pending or processing).

#### `getReportsStats()`
Returns statistics about reports.

```javascript
const stats = getReportsStats();
console.log(stats);
// { total: 10, pending: 3, processing: 2, completed: 4, failed: 1 }
```

## Selectors

For better performance, use selectors to subscribe to specific parts of the store:

```javascript
import { 
  useCurrentPatient, 
  useReports, 
  useReportsLoading,
  useWsConnection,
  useReportsStats,
  useFilteredReports
} from '@/stores/patientStore';

function MyComponent() {
  const patient = useCurrentPatient();
  const reports = useReports();
  const loading = useReportsLoading();
  const { isConnected, connectionStatus } = useWsConnection();
  const stats = useReportsStats();
  const filteredReports = useFilteredReports();

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

## Integration with WebSocket

The store integrates seamlessly with WebSocket updates:

```javascript
// In your WebSocket hook
useEffect(() => {
  if (wsLastUpdate) {
    // Update store with WebSocket data
    usePatientStore.getState().setWsLastUpdate(wsLastUpdate);
    
    // Handle specific update types
    if (wsLastUpdate.type === 'report_status_changed') {
      usePatientStore.getState().updateReport(
        wsLastUpdate.data.reportId, 
        { status: wsLastUpdate.data.newStatus }
      );
    }
  }
}, [wsLastUpdate]);
```

## Error Handling

The store provides comprehensive error handling:

```javascript
const { error, setError, clearError } = usePatientStore();

// Set an error
setError('Failed to load patient data');

// Clear error
clearError();

// Check for errors
if (error) {
  console.error('Store error:', error);
}
```

## Loading States

Multiple loading states are available:

```javascript
const {
  loading,           // General loading
  reportsLoading,    // Reports loading
  favoriteLoading,   // Favorite toggle loading
  deleteDoctorLoading,   // Doctor deletion loading
  deleteReportLoading    // Report deletion loading
} = usePatientStore();
```

## Persistence

The store automatically persists certain data to localStorage:

- `patients`: List of patients
- `dateFilter`: Current date filter
- `typeFilter`: Current type filter
- `currentPage`: Current page
- `itemsPerPage`: Items per page

Sensitive data like `currentPatient`, `reports`, and WebSocket state are not persisted.

## Best Practices

1. **Use Selectors**: Use selectors for better performance when you only need specific parts of the store.

2. **Custom Hooks**: Use the provided custom hooks for specific operations:
   - `usePatient()` for patient operations
   - `useReports()` for reports operations
   - `useWebSocket()` for WebSocket operations
   - `useDialogs()` for dialog operations
   - `useFilters()` for filter operations

3. **Error Handling**: Always handle errors from async operations.

4. **Loading States**: Show appropriate loading states during operations.

5. **WebSocket Integration**: Update the store when receiving WebSocket messages.

## Example: Complete Patient Page

```javascript
import { usePatient, useReports, useWebSocket, useDialogs } from '@/app/(dashboard)/patient/hooks/usePatientStore';

export default function PatientPage({ patientId }) {
  const { patient, loading, loadPatient } = usePatient(patientId);
  const { reports, loadReports } = useReports(patientId);
  const { isConnected, lastUpdate } = useWebSocket();
  const { openEditPatientDialog, openAddDoctorDialog } = useDialogs();

  useEffect(() => {
    if (patientId) {
      loadPatient();
      loadReports();
    }
  }, [patientId, loadPatient, loadReports]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{patient?.name}</h1>
      <div>Reports: {reports.length}</div>
      <div>WebSocket: {isConnected ? 'Connected' : 'Disconnected'}</div>
      <button onClick={openEditPatientDialog}>Edit Patient</button>
      <button onClick={openAddDoctorDialog}>Add Doctor</button>
    </div>
  );
}
```

## Migration from Local State

If you're migrating from local state management:

1. Replace `useState` with store selectors
2. Replace local state setters with store actions
3. Use the provided custom hooks for specific operations
4. Update WebSocket integration to use store methods
5. Remove local loading and error states in favor of store states

This centralized approach provides better performance, easier debugging, and more maintainable code. 