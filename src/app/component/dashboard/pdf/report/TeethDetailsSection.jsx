'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tooth, CalendarCheck, HeartPulse } from "lucide-react"; // أيقونات
import ToothDetailsForPDF from "./ToothDitels";

export default function TeethDetailsSection({ teeth }) {
  if (!teeth || teeth.length === 0) {
    return <p className="text-muted-foreground text-center">لا توجد بيانات للأسنان</p>;
  }

  return (
    <div className="grid gap-6 w-[100%]">
      {teeth.map((tooth) => (
        <div key={`tooth-${tooth.toothNumber}`} className="overflow-hidden  rounded-2xl w-[100%]  ">

            <ToothDetailsForPDF tooth={tooth} />

        </div>
      ))}
    </div>
  );
}
