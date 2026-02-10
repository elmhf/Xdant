export interface SliceImageData {
    axial: string[];
    sagittal: string[];
    coronal: string[];
}

export interface UseSliceImageResult {
    data: SliceImageData;
    isLoading: boolean;
    error: any;
}

export function useSliceImage(reportId: string): UseSliceImageResult;
