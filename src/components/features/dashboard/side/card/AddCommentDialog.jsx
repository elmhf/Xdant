import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { X, Loader2, Paperclip, Smile, Pencil, Trash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import EmojiPicker from 'emoji-picker-react';
import { useDentalStore } from '@/stores/dataStore';
import { formatDate } from '@/stores/dataStore';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';

const MAX_LENGTH = 300;

const AddCommentDialog = ({
  trigger,
  placeholder,
  buttonText,
  title,
  onSend = () => {},
  toothInfo = { toothNumber: 0 },
}) => {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef(null);
  const { t } = useTranslation();

  // Jيب النوتات متاع السنّ
  const tooth = useDentalStore(state => state.getToothByNumber(toothInfo.toothNumber));
  const notes = tooth?.notes || [];
  const updateToothNote = useDentalStore(state => state.updateToothNote);
  const deleteToothNote = useDentalStore(state => state.deleteToothNote);

  // State pour l'édition
  const [editIdx, setEditIdx] = useState(null);
  const [editText, setEditText] = useState('');
  const [editFile, setEditFile] = useState(null);

  // State for delete dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteIdx, setDeleteIdx] = useState(null);

  // Auto-focus
  useEffect(() => {
    if (open && textareaRef.current) {
      const timer = setTimeout(() => {
        textareaRef.current && textareaRef.current.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Reset textarea on close
  useEffect(() => {
    if (!open) {
      setNote('');
      setFile(null);
      setShowEmoji(false);
    }
  }, [open]);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [note]);

  const handleSend = async () => {
    if (!note.trim() && !file) {
      toast.error(t('validation.required') || 'Note is required');
      return;
    }
    setLoading(true);
    try {
      await onSend({ note, file });
      toast.success(t('notifications.success') || 'Note added successfully');
      setOpen(false);
    } catch (err) {
      toast.error(t('notifications.error') || 'Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setNote('');
    setFile(null);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Emoji picker handler (requires emoji-picker-react)
  const handleEmojiClick = (emojiData, event) => {
    setNote(prev => prev + (emojiData.emoji || ''));
    setShowEmoji(false);
    setTimeout(() => textareaRef.current && textareaRef.current.focus(), 100);
  };

  const handleEdit = (idx) => {
    setEditIdx(idx);
    setEditText(notes[idx].text);
    setEditFile(notes[idx].file || null);
  };
  const handleEditCancel = () => {
    setEditIdx(null);
    setEditText('');
    setEditFile(null);
  };
  const handleEditSave = () => {
    updateToothNote(toothInfo.toothNumber, editIdx, { text: editText, file: editFile });
    setEditIdx(null);
    setEditText('');
    setEditFile(null);
  };
  const handleDelete = (idx) => {
    setDeleteIdx(idx);
    setOpenDeleteDialog(true);
  };
  const confirmDelete = () => {
    if (deleteIdx !== null) {
      deleteToothNote(toothInfo.toothNumber, deleteIdx);
      setDeleteIdx(null);
      setOpenDeleteDialog(false);
    }
  };
  const cancelDelete = () => {
    setDeleteIdx(null);
    setOpenDeleteDialog(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent forceMount className="w-full max-w-xl bg-white rounded-2xl border border-gray-100 p-0 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3 flex-wrap">
            {toothInfo.status && (
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold shadow-sm transition-all ${toothInfo.status === 'Healthy' ? 'bg-green-100 text-green-700 border border-green-400' : 'bg-gray-100 text-gray-700 border border-gray-300'}`}>
                {toothInfo.status}
              </span>
            )}
            <span className="font-bold text-xl text-[#0d0c22] select-none ml-2">Tooth {toothInfo.toothNumber}</span>
          </div>
        </div>

        {/* Notes List */}
        {notes.length > 0 && (
          <div className="px-8 pt-4 pb-2 mb-6">
            {/* AlertDialog for delete confirmation */}
            <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('side.card.ConfirmDelete') || 'Are you sure you want to delete this note?'}</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={cancelDelete}>{t('side.card.Cancel') || 'Cancel'}</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDelete}>{t('side.card.Delete') || 'Delete'}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <div className="font-semibold mb-2 text-gray-700 flex items-center gap-2">
              <span>{t('side.card.Notes') || 'Notes'}:</span>
            </div>
            <ul className="flex flex-col space-y-3 max-h-60 overflow-y-auto w-full notes-scrollbar px-0">
              {notes.map((n, idx) => (
                <li key={idx} className="bg-gray-50 rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col relative">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="w-7 h-7 text-xs bg-gray-200">
                      <AvatarFallback>N</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-gray-500">{n.date ? formatDate(n.date) : ''}</span>
                  </div>
                  {editIdx === idx ? (
                    <>
                      <textarea
                        className="w-full border border-gray-200 rounded-lg p-2 text-sm mb-2 bg-white focus:border-[#0d0c22] focus:ring-2 focus:ring-[#0d0c22]/10"
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        rows={2}
                        style={{ minWidth: 0 }}
                      />
                      {/* File edit (optional) */}
                      <div className="flex items-center gap-2 mb-2">
                        {editFile && (
                          <>
                            <Paperclip size={16} />
                            <span>{editFile.name}</span>
                            <button onClick={() => setEditFile(null)} className="text-red-500 hover:underline text-xs">{t('side.card.Cancel')}</button>
                          </>
                        )}
                        <label className="text-gray-400 hover:text-[#0d0c22] cursor-pointer text-xs">
                          <Paperclip size={16} />
                          <input type="file" className="hidden" onChange={e => setEditFile(e.target.files[0])} />
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleEditSave} className="px-3 py-1 rounded-xl bg-green-600 text-white text-xs font-semibold hover:bg-green-700">{t('side.card.Save') || 'Save'}</button>
                        <button onClick={handleEditCancel} className="px-3 py-1 rounded-xl bg-gray-200 text-gray-800 text-xs font-semibold hover:bg-gray-300">{t('side.card.Cancel')}</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="mb-1 text-gray-800 break-all w-full block">{n.text}</span>
                      {n.file && (
                        <a
                          href={typeof n.file === 'string' ? n.file : URL.createObjectURL(n.file)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline mt-1 text-xs"
                        >
                          {n.file.name || 'Attachment'}
                        </a>
                      )}
                      <div className="flex flex-row gap-2 justify-end mt-2 w-full">
                        <button onClick={() => handleEdit(idx)} className="p-1 text-gray-400 hover:text-[#0d0c22] transition">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => handleDelete(idx)} className="p-1 text-gray-400 hover:text-[#0d0c22] transition">
                          <Trash size={18} />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Textarea + Attachments
 */}
        <div className="px-8 pt-2 pb-2">
          <div className="relative">
            <textarea
              ref={textareaRef}
              autoFocus
              maxLength={MAX_LENGTH}
              className="w-full min-h-[120px] max-h-60 border-none rounded-2xl p-5 text-base font-medium text-[#0d0c22] bg-white focus:outline-none focus:ring-2 focus:ring-[#0d0c22]/10 resize-y transition-all duration-200 placeholder:text-gray-400 pr-16 shadow-sm"
              placeholder={placeholder || t('side.card.NotePlaceholder')}
              value={note}
              onChange={e => setNote(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ minWidth: 0, boxShadow: '0 1px 2px 0 rgb(16 24 40 / 5%)' }}
            />
          </div>
          {/* File name preview */}
          {file && (
            <div className="flex items-center gap-2 mt-4 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
              <Paperclip size={16} />
              <span>{file.name}</span>
              <button onClick={() => setFile(null)} className="ml-2 text-red-500 hover:underline">{t('side.card.Cancel')}</button>
            </div>
          )}
          {/* Character Counter */}
          <div className="flex justify-end mt-1 text-xs text-gray-400">
            {note.length}/{MAX_LENGTH}
          </div>
        </div>
        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-8 pb-7 pt-4 mt-6">
          {/* Attachment Button */}
          <label className="p-2 rounded-lg bg-gray-50 border border-gray-100 text-gray-500 hover:bg-gray-100 hover:text-[#0d0c22] transition cursor-pointer" tabIndex={-1}>
            <Paperclip size={22} />
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              tabIndex={-1}
            />
          </label>
          <button
            className="rounded-xl border border-gray-200 bg-white text-[#0d0c22] font-semibold text-base px-7 py-2 transition-all hover:bg-gray-100 shadow-sm"
            onClick={handleCancel}
            type="button"
            disabled={loading}
          >
            {t('side.card.Cancel')}
          </button>
          <button
            className="rounded-xl bg-[#0d0c22] text-white font-semibold text-base px-7 py-2 transition-all hover:bg-gray-900 hover:text-white border border-[#0d0c22] flex items-center justify-center min-w-[90px] shadow-sm"
            onClick={handleSend}
            disabled={loading || (!note.trim() && !file)}
            type="button"
            style={{ opacity: (loading || (!note.trim() && !file)) ? 0.5 : 1, cursor: (loading || (!note.trim() && !file)) ? 'not-allowed' : 'pointer' }}
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (buttonText || t('side.card.SendNote') || 'Send Note')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCommentDialog;
