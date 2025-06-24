import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Check,
  RotateCcw,
  MoreVertical,
  Plus,
  Grid,
  List,
  Loader2,
} from 'lucide-react';

import { DataContext } from '../../../dashboard';
import useToothEdit from '../../../JsFiles/editwithData';
import useRestTooth from '../../../JsFiles/useRestTooth';

import AddComment from '../AddComment';
import AddProblem from "../AddProblem";
import style from "../ToothCaard.module.css";

const CardButton = React.memo(({ teeth, idcard, viewModeState }) => {
  const { t } = useTranslation();

  const { ToothEditData, setToothEditData } = useContext(DataContext);
  const { editwithData } = useToothEdit();
  const { RestTooth } = useRestTooth();
  const { viewMode, setViewMode } = viewModeState;

  const [localState, setLocalState] = useState({
    Hedding: null,
    openProblemDialog: false,
    isApproved: false,
    isApproving: false,
    showUnapproveDialog: false,
  });

  const toothNumber = useMemo(() => {
    if (typeof idcard === 'number') return idcard.toString();
    if (typeof idcard === 'string') {
      const match = idcard.match(/\d+/);
      return match ? match[0] : null;
    }
    return null;
  }, [idcard]);

  useEffect(() => {
    if (toothNumber && ToothEditData?.toothEditData) {
      const toothData = ToothEditData.toothEditData.find(item => item.tooth == toothNumber);
      setLocalState(prev => ({
        ...prev,
        isApproved: toothData?.Approve || false
      }));
    }
  }, [toothNumber, ToothEditData]);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'carousel' ? 'grid' : 'carousel');
  }, [setViewMode]);

  const onRest = useCallback(() => {
    if (toothNumber) RestTooth(toothNumber);
  }, [toothNumber, RestTooth]);

  const onHedding = useCallback(async (value) => {
    if (!toothNumber) return;

    setLocalState(prev => ({ ...prev, Hedding: value }));

    setToothEditData(prevData => {
      if (!prevData?.toothEditData) return prevData;
      return {
        ...prevData,
        toothEditData: prevData.toothEditData.map(item =>
          item.tooth == toothNumber
            ? { ...item, Hedding: value }
            : item
        )
      };
    });

    // await editwithData({ idcard });
  }, [toothNumber, setToothEditData, editwithData, idcard]);

  const approveTooth = useCallback(async () => {
    if (!toothNumber || localState.isApproving) return;

    setLocalState(prev => ({ ...prev, isApproving: true }));

    try {
      const newApprovedState = !localState.isApproved;

      await new Promise(resolve => setTimeout(resolve, 500));

      setLocalState(prev => ({ ...prev, isApproved: newApprovedState }));

      setToothEditData(prevData => {
        if (!prevData?.toothEditData) return prevData;
        return {
          ...prevData,
          toothEditData: prevData.toothEditData.map(item =>
            item.tooth == toothNumber
              ? { ...item, Approve: newApprovedState }
              : item
          )
        };
      });

      toast.success(
        t(
          newApprovedState
            ? "cardButton.toothApproved"
            : "cardButton.toothUnapproved",
          { toothNumber }
        )
      );
    } catch (error) {
      toast.error(t("cardButton.approveError"));
    } finally {
      setLocalState(prev => ({
        ...prev,
        isApproving: false,
        showUnapproveDialog: false
      }));
    }
  }, [toothNumber, localState.isApproved, localState.isApproving, setToothEditData, t]);

  const onApprove = useCallback(async () => {
    if (!toothNumber || localState.isApproving) return;

    if (localState.isApproved) {
      setLocalState(prev => ({ ...prev, showUnapproveDialog: true }));
      return;
    }

    await approveTooth();
  }, [toothNumber, localState.isApproved, localState.isApproving, approveTooth]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'a' && e.ctrlKey) {
        e.preventDefault();
        onApprove();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onApprove]);

  return (
    <div className="flex items-center gap-3">
      {/* Menu Button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100/80 rounded-full"
            aria-label="More actions"
          >
            <MoreVertical className="h-4 w-4 text-gray-600" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 p-1.5">
          <DropdownMenuItem onClick={toggleViewMode} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100">
            {viewMode === 'carousel' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
            <span>{t("cardButton.toggleView")}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuItem onClick={onRest} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100">
            <RotateCcw className="h-4 w-4" />
            <span>{t("cardButton.resetTooth")}</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={() => setLocalState(prev => ({ ...prev, openProblemDialog: true }))}
            className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100"
          >
            <Plus className="h-4 w-4" />
            <span>{t("cardButton.addProblem")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Comment Button */}
      <div className="relative">
        <AddComment idteeth={toothNumber} />
      </div>

      {/* Approve Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={localState.isApproved ? "default" : "outline"}
            size="sm"
            onClick={onApprove}
            disabled={localState.isApproving}
            className={`h-8 min-w-[100px] gap-1.5 shadow-sm transition-all duration-200 ${
              localState.isApproved
                ? "bg-green-600 hover:bg-green-700 text-white border-transparent"
                : "bg-white hover:bg-green-50 text-green-700 border-green-200 hover:border-green-300"
            }`}
          >
            {localState.isApproving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span className="text-sm">
                  {localState.isApproved ? t("cardButton.approved") : t("cardButton.approve")}
                </span>
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-gray-900 text-white">
          <p className="text-sm">
            {localState.isApproved
              ? t("cardButton.tooltipUnapprove")
              : t("cardButton.tooltipApprove")}
          </p>
        </TooltipContent>
      </Tooltip>

      {/* Dialogs */}
      <Dialog
        open={localState.openProblemDialog}
        onOpenChange={open => setLocalState(prev => ({ ...prev, openProblemDialog: open }))}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{t("cardButton.addProblemTitle")}</DialogTitle>
          </DialogHeader>
          <AddProblem
            teeth={teeth}
            onClose={() => setLocalState(prev => ({ ...prev, openProblemDialog: false }))}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={localState.showUnapproveDialog}
        onOpenChange={open => setLocalState(prev => ({ ...prev, showUnapproveDialog: open }))}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-red-600">{t("cardButton.confirmUnapprove")}</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">{t("cardButton.unapprovePrompt", { toothNumber })}</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setLocalState(prev => ({ ...prev, showUnapproveDialog: false }))}
              className="bg-white hover:bg-gray-50"
            >
              {t("cardButton.cancel")}
            </Button>
            <Button 
              variant="destructive" 
              onClick={approveTooth}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {t("cardButton.unapprove")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default CardButton;
