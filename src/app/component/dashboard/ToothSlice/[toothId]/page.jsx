"use client";
import { useParams } from "next/navigation";
import ImageCard from "@/app/component/dashboard/main/ImageXRay/ImageXRay";
import ToothDiagnosis from "@/app/component/dashboard/side/card/ToothCard";
import { useDentalStore } from "@/stores/dataStore";

export default function ToothSlicePage() {
  const { toothId } = useParams();
  const toothNumber = parseInt(toothId, 10);

  // جلب بيانات السن من الستور
  const tooth = useDentalStore(state =>
    (state.data?.teeth || []).find(t => t.toothNumber === toothNumber)
  );

  return (
    <div className="p-8 flex flex-col md:flex-row gap-8">
      {/* XRAY IMAGE */}
      {/* <div className="flex-1 min-w-[350px]">
        <ImageCard />
      </div> */}
      {/* TOOTH CARD */}
      <div className="flex-1 min-w-[350px]">
        sssssssssssssssssssssssssssss
        {tooth ? (
          <ToothDiagnosis idCard={toothNumber} showDiagnosisDetails={true} />
        ) : (
          <div className="text-red-500">Tooth not found</div>
        )}
      </div>
    </div>
  );
} 