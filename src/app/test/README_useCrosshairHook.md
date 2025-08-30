# useCrosshairHook - دليل الاستخدام

## نظرة عامة

`useCrosshairHook` هو hook مخصص يحتوي على جميع المتغيرات والمعاملات المطلوبة لإدارة الصليب (crosshair) في تطبيقات التصوير الطبي، مع دمج جميع الحسابات المطلوبة.

## الاستيراد

```javascript
import { useCrosshairHook } from './useCrosshairHook';
```

## الاستخدام الأساسي

```javascript
const MyComponent = ({ sliceCounts, voxelSizes }) => {
  const crosshairHook = useCrosshairHook(sliceCounts, voxelSizes);
  
  // استخراج القيم المطلوبة
  const {
    crosshair,
    worldPosition,
    currentSlices,
    handleSliceChange,
    updateWorldAndSlices
  } = crosshairHook;

  return (
    <div>
      {/* استخدام القيم */}
    </div>
  );
};
```

## المعاملات (Parameters)

### `sliceCounts`
```javascript
{
  axial: 604,    // عدد شرائح المحور الأفقي
  coronal: 604,  // عدد شرائح المحور التاجي
  sagittal: 604  // عدد شرائح المحور السهمي
}
```

### `voxelSizes` (اختياري)
```javascript
{
  x_spacing_mm: 0.5,  // المسافة بين البكسل في المحور X (مم)
  y_spacing_mm: 0.5,  // المسافة بين البكسل في المحور Y (مم)
  z_spacing_mm: 0.7   // المسافة بين البكسل في المحور Z (مم)
}
```

## القيم المُرجعة (Return Values)

### 1. State Management

#### `canvasSizes` / `setCanvasSizes`
```javascript
{
  axial: { width: 500, height: 200 },
  coronal: { width: 500, height: 200 },
  sagittal: { width: 500, height: 200 }
}
```

#### `zooms` / `setZooms`
```javascript
{
  axial: 1,
  coronal: 1,
  sagittal: 1
}
```

#### `pans` / `setPans`
```javascript
{
  axial: { x: 0, y: 0 },
  coronal: { x: 0, y: 0 },
  sagittal: { x: 0, y: 0 }
}
```

#### `crosshair` / `setCrosshair`
```javascript
{
  axial: { x: 250, y: 250 },
  coronal: { x: 250, y: 250 },
  sagittal: { x: 250, y: 250 }
}
```

#### `currentSlices` / `setCurrentSlices`
```javascript
{
  axial: 0,
  coronal: 0,
  sagittal: 0
}
```

#### `worldPosition` / `setWorldPosition`
```javascript
{
  x: 0,  // مم
  y: 0,  // مم
  z: 0   // مم
}
```

### 2. Refs

#### `stageRefs`
```javascript
{
  axial: useRef(null),
  coronal: useRef(null),
  sagittal: useRef(null)
}
```

### 3. Calculations

#### `global`
```javascript
{
  origin: { x: 0, y: 0, z: 0 },
  spacing: { x: 0.5, y: 0.5, z: 0.7 },
  volumeSize: { x: 604, y: 604, z: 604 }
}
```

#### `drawnSizes`
```javascript
{
  axial: { width: 400, height: 300 },
  coronal: { width: 400, height: 300 },
  sagittal: { width: 400, height: 300 }
}
```

### 4. Core Functions

#### `updateCrosshairAndSlices(worldPoint)`
تحديث موضع الصليب والشرائح بناءً على نقطة في الإحداثيات العالمية.

#### `updateWorldAndSlices(validatedWorldPoint)`
تحديث الموضع العالمي والشرائح مع التحقق من صحة الإحداثيات.

#### `handleSliceChange(view, direction)`
تغيير الشريحة الحالية (next/prev).

#### `handleViewClick(viewType)`
معالج النقر على العرض.

#### `handleCrosshairMove(viewType, delta)`
تحريك الصليب بمقدار معين.

### 5. Crosshair Activity

#### `getCrosshairState(viewType)`
الحصول على حالة الصليب للتفاعل مع CrosshairActivity.

### 6. Calculation Helpers

#### `calculateImageDimensions(viewType, stageWidth, stageHeight)`
حساب أبعاد الصورة لعرض معين.

#### `getViewParams(viewType)`
الحصول على معاملات العرض لتحويل الإحداثيات.

#### `canvasToWorld(canvasPoint, viewType)`
تحويل نقطة من الكانفاس إلى الإحداثيات العالمية.

#### `worldToCanvas(worldPoint, viewType)`
تحويل نقطة من الإحداثيات العالمية إلى الكانفاس.

#### `validateWorldCoordinates(worldPoint)`
التحقق من صحة الإحداثيات العالمية.

### 7. Initialization

#### `initializeCrosshair()`
تهيئة موضع الصليب عند توفر البيانات.

### 8. Constants

#### `DEFAULT_CANVAS_SIZE`
```javascript
{ width: 500, height: 200 }
```

## أمثلة الاستخدام

### مثال 1: استخدام بسيط

```javascript
const SimpleComponent = ({ sliceCounts, voxelSizes }) => {
  const {
    crosshair,
    worldPosition,
    currentSlices,
    handleSliceChange,
    updateWorldAndSlices
  } = useCrosshairHook(sliceCounts, voxelSizes);

  return (
    <div>
      <p>World Position: ({worldPosition.x}, {worldPosition.y}, {worldPosition.z})</p>
      <p>Current Slice: {currentSlices.axial}</p>
      
      <button onClick={() => handleSliceChange('axial', 'next')}>
        Next Slice
      </button>
      
      <button onClick={() => updateWorldAndSlices({ x: 100, y: 100, z: 100 })}>
        Move to (100, 100, 100)
      </button>
    </div>
  );
};
```

### مثال 2: استخدام مع Stage و CrosshairActivity

```javascript
const StageComponent = ({ sliceCounts, voxelSizes }) => {
  const {
    crosshair,
    stageRefs,
    getCrosshairState,
    handleViewClick
  } = useCrosshairHook(sliceCounts, voxelSizes);

  return (
    <Stage
      onClick={handleViewClick('axial')}
      onMouseDown={e => CrosshairActivity.onMouseDown(e, getCrosshairState('axial'))}
      onMouseUp={e => CrosshairActivity.onMouseUp(e, getCrosshairState('axial'))}
      onMouseMove={e => CrosshairActivity.onMouseMove(e, getCrosshairState('axial'))}
      ref={stageRefs.axial}
      width={500}
      height={200}
    >
      <Layer>
        <CrosshairLayer
          x={crosshair.axial.x}
          y={crosshair.axial.y}
          width={500}
          height={200}
          viewType="axial"
        />
      </Layer>
    </Stage>
  );
};
```

### مثال 3: استخدام مع الحسابات

```javascript
const CalculationComponent = ({ sliceCounts, voxelSizes }) => {
  const {
    canvasToWorld,
    worldToCanvas,
    validateWorldCoordinates,
    calculateImageDimensions
  } = useCrosshairHook(sliceCounts, voxelSizes);

  const handleCanvasClick = (point) => {
    // تحويل من الكانفاس إلى العالم
    const worldPoint = canvasToWorld(point, 'axial');
    
    // التحقق من صحة الإحداثيات
    const validatedPoint = validateWorldCoordinates(worldPoint);
    
    console.log('World Point:', validatedPoint);
  };

  const getDimensions = () => {
    return calculateImageDimensions('axial', 500, 200);
  };

  return (
    <div>
      <button onClick={() => handleCanvasClick({ x: 250, y: 100 })}>
        Convert Point
      </button>
    </div>
  );
};
```

## المميزات

1. **إدارة مركزية للحالة**: جميع متغيرات الصليب في مكان واحد
2. **حسابات مدمجة**: جميع الحسابات المطلوبة متوفرة
3. **تفاعل سهل**: دوال جاهزة للتفاعل مع CrosshairActivity
4. **مرونة عالية**: يمكن استخدام جزء أو كل القيم حسب الحاجة
5. **أداء محسن**: استخدام useMemo و useCallback للحسابات
6. **سهولة الاستخدام**: واجهة بسيطة وواضحة

## ملاحظات مهمة

1. تأكد من تمرير `sliceCounts` صحيح عند استخدام الـ hook
2. استخدم `initializeCrosshair()` عند توفر البيانات
3. استخدم `validateWorldCoordinates()` قبل تحديث الموضع العالمي
4. استخدم `getCrosshairState()` مع CrosshairActivity
5. جميع الإحداثيات العالمية بالملليمتر (mm) 