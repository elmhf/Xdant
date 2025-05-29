"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import MessageIcon from "@rsuite/icons/Message";
import useUpditeData from "../../JsFiles/UpditeData";

const AddComment = ({ idteeth }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const { EditData } = useUpditeData();

  const handleSubmit = () => {
    EditData({ comment }, idteeth);
    setComment("");
    setOpen(false);
  };

  const handleClose = () => {
    setComment("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <MessageIcon />
          {t("addComment.comment")}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("addComment.title")}</DialogTitle>
        </DialogHeader>

        <Textarea
          className="min-h-[250px]"
          placeholder={t("addComment.placeholder")}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <DialogFooter className="mt-4 gap-2 sm:justify-end">
          <Button
            onClick={handleSubmit}
            className="font-bold"
            style={{ backgroundColor: "var(--buttonApproveBg)" }}
          >
            {t("addComment.confirm")}
          </Button>
          <Button
            variant="ghost"
            onClick={handleClose}
            className="font-bold"
            style={{ color: "var(--foreground)" }}
          >
            {t("addComment.cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddComment;
