"use client";

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import useEditData from '../../JsFiles/useEditData';
import DentalProblemForm from './AddProblemModel';

const AddProblem = ({ teeth }) => {
  const { t } = useTranslation();
  const { EditData } = useEditData();
  const [open, setOpen] = useState(false);
  const [ProblemVlaue, setProblemVlaue] = useState(null);
  const [description, setdescription] = useState('');
  const [maskProblem, setmaskProblem] = useState({ type: "unknown", mask: [] });
  const [Severity, setSeverity] = useState("");
  const [Progression, setProgression] = useState("");

  const handleSubmit = () => {

    console.log( maskProblem?.length === 0);
    if (!ProblemVlaue) {
      toast.error(t("addProblem.selectProblemError"), {
        duration: 1000,
        action: {
          label: t("addProblem.close"),
          onClick: () => console.log("Close")
        }
      });
      return;
    }

    if (!maskProblem || maskProblem?.length === 0) {
      
      toast.error(t("addProblem.selectMaskError"), {
        duration: 1000,
        action: {
          label: t("addProblem.close"),
          onClick: () => console.log("Close")
        }
      });
      return;
    }

    setOpen(false);
    EditData(
      {
        type: ProblemVlaue,
        subtype: "Occlusal",
        coordinates: {
          x: 460,
          y: 330
        },
        mask: [maskProblem],
        depth: "2.1mm",
        severity: Severity,
        confidence: 0.94,
        detectedAt: "2023-09-12T14:22:30",
        progression: Progression,
        images: ["/images/caries_11_1.png"]
      },
      teeth['toothNumber']
    );
    toast.success(t("addProblem.successMessage"), { duration: 1000 });
  };

  const clearAll = () => {
    setProblemVlaue(null);
    setdescription('');
    setmaskProblem({ type: "unknown", mask: [] });
    setSeverity('');
    setProgression('');
  }; 
   React.useEffect(()=>{
    console.log(maskProblem)
    },[maskProblem])
  

  return (
    <DialogContent className="sm:max-w-[80vw] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{t("addProblem.title")}</DialogTitle>
        <DialogDescription>
          {t("addProblem.description")}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <DentalProblemForm
          teeth={teeth}
          ProblemVlaueState={{ ProblemVlaue, setProblemVlaue }}
          descriptionState={{ description, setdescription }}
          maskProblemState={{ maskProblem, setmaskProblem }}
          SeverityState={{ Severity, setSeverity }}
          ProgressionState={{ Progression, setProgression }}
        />
      </div>

      <DialogFooter>
        <Button
          type="submit"
          onClick={handleSubmit}
          className="bg-primary hover:bg-primary/90"
        >
          {t("addProblem.confirm")}
        </Button>
        <Button
          variant="outline"
          onClick={() => setOpen(false)}
        >
          {t("addProblem.cancel")}
        </Button>
        <Button
          variant="outline"
          onClick={clearAll}
        >
          {t("addProblem.clearAll")}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AddProblem;
