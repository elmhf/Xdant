"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/utils/apiClient";
import { Bell, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import useNotificationStore from "@/stores/notificationStore";
import {
  validateInvitation,
  acceptInvitation,
  rejectInvitation,
} from "@/utils/invitations.js";
import useUserStore from "@/components/features/profile/store/userStore";
import { renderNotificationContent, renderNotificationIcon } from "./NotificationTemplates";
import { useTranslation } from "react-i18next";

function timeAgo(date, t) {
  const now = new Date();
  const past = new Date(date);
  const diff = Math.floor((now - past) / 1000);

  if (diff < 60) return `${diff} ${t('common.sec')} ${t('common.ago')}`;
  const minutes = Math.floor(diff / 60);
  if (minutes < 60) return `${minutes} ${t('common.min')} ${t('common.ago')}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}${t('common.hour')} ${t('common.ago')}`;
  const days = Math.floor(hours / 24);
  return `${days}${t('common.day')} ${t('common.ago')}`;
}

function formatAbsoluteDate(date, lng) {
  const d = new Date(date);
  const weekday = d.toLocaleDateString(lng || 'en-US', { weekday: 'long' });
  const time = d.toLocaleTimeString(lng || 'en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).toLowerCase();
  return `${weekday} ${time}`;
}

export default function NotificationDropdown({ userId }) {
  const { t, i18n } = useTranslation();
  const { notifications, loadingNotification, fetchNotifications, clearNotifications } =
    useNotificationStore();
  const getUserInfo = useUserStore(state => state.getUserInfo);
  const fetchMyClinics = useUserStore(state => state.fetchMyClinics);
  const [processingMap, setProcessingMap] = useState({});
  const [statusMap, setStatusMap] = useState({});

  const setProcessingFor = (id, value) => {
    setProcessingMap((prev) => ({ ...prev, [id]: value }));
  };

  const setStatusFor = (id, msg) => {
    setStatusMap((prev) => ({ ...prev, [id]: msg }));
  };

  useEffect(() => {
    if (userId) fetchNotifications(userId);
  }, [userId, fetchNotifications]);

  const handleAccept = async (notif) => {
    if (processingMap[notif.id]) return;
    setProcessingFor(notif.id, true);

    const validation = await validateInvitation(notif.token);
    if (!validation.ok) {
      setStatusFor(notif.id, validation.data?.error || t('common.invalidToken'));
      setProcessingFor(notif.id, false);
      return;
    }

    const result = await acceptInvitation(notif.token, notif.id);
    if (!result.ok) {
      setStatusFor(notif.id, result.data?.error || t('common.errorAccepting'));
    } else {
      await getUserInfo()
      await fetchMyClinics()
      setStatusFor(notif.id, t('common.acceptedRedirecting'));
    }

    setProcessingFor(notif.id, false);
  };

  const handleReject = async (notif) => {
    if (processingMap[notif.id]) return;
    setProcessingFor(notif.id, true);

    const validation = await validateInvitation(notif.token);
    if (!validation.ok) {
      setStatusFor(notif.id, validation.data?.error || t('common.invalidToken'));
      setProcessingFor(notif.id, false);
      return;
    }

    const result = await rejectInvitation(notif.token, notif.id);
    if (!result.ok) {
      setStatusFor(notif.id, result.data?.error || t('common.errorRejecting'));
    } else {
      setStatusFor(notif.id, t('common.rejectedRedirecting'));

      await getUserInfo()
      await fetchMyClinics()
    }

    setProcessingFor(notif.id, false);
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    console.log("********* Marking all notifications as read");
    try {
      await apiClient('/api/notifications/markAllAsRead', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
      });

      // Refresh notifications after marking as read
      await fetchNotifications(userId);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) {
          setProcessingMap({});
          setStatusMap({});
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-12 w-12"
          onClick={markAllAsRead}
        >
          <Bell className="h-11 w-11" />
          {notifications?.notifications?.some(n => !n.read_at) && (
            <span className="absolute top-2 right-2 h-3 w-3 rounded-full bg-[#7564ED] border-2 border-white" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[400px] rounded-2xl shadow-xl border border-gray-100 bg-white p-0 overflow-hidden"
      >
        <div className="p-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DropdownMenuLabel className="text-gray-900 font-bold text-xl p-0">
                {t('common.notificationsLabel')}
              </DropdownMenuLabel>
              {notifications?.notifications?.length > 0 && (
                <span className="text-xs font-medium text-[#7564ED] bg-[#7564ED]/10 px-2 py-1 rounded-full">
                  {notifications.notifications.length} New
                </span>
              )}
            </div>
            {notifications?.notifications?.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearNotifications}
                className="h-8 px-2 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {t('common.clearAll')}
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
          {notifications?.notifications?.length === 0 ? (
            <div className="py-12 text-sm text-gray-500 text-center flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center">
                <Bell className="h-6 w-6 text-gray-300" />
              </div>
              <p>{t('common.noNotifications')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications?.notifications?.map((notif) => {
                const isInvite = notif.type === "invitation";
                const clinicName = notif.meta_data?.clinic_name;
                const clinicLogo = notif.meta_data?.logo_url;
                const clinicRole = notif.meta_data?.role;
                return (
                  <div
                    key={notif.id}
                    className="flex items-start gap-4 p-4 hover:bg-gray-50/80 transition-colors duration-200 group relative"
                  >
                    {/* Avatar - using template system */}
                    {renderNotificationIcon(notif)}

                    <div className="flex flex-col w-full min-w-0 gap-1.5">
                      {/* Header Row: Message - using template system */}
                      {renderNotificationContent(notif)}

                      {/* Time Row */}
                      <div className="flex items-center gap-2 text-xs text-gray-400 ">
                        <span>{formatAbsoluteDate(notif.created_at || notif.createdAt, i18n.language)}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span>{timeAgo(notif.created_at || notif.createdAt, t)}</span>
                      </div>

                      {/* Status message */}
                      {statusMap[notif.id] && (
                        <div className="text-xs text-[#7564ED] mt-1 font-medium bg-[#7564ED]/5 p-2 rounded-2xl">
                          {statusMap[notif.id]}
                        </div>
                      )}

                      {/* Buttons (Only for Invites that haven't been answered) */}
                      {isInvite && !statusMap[notif.id] && notif.meta_data?.status !== 'accepted' && notif.meta_data?.status !== 'rejected' && (
                        <div className="flex gap-3 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-4 rounded-2xl text-xs font-medium border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all"
                            disabled={processingMap[notif.id]}
                            onClick={(e) => {
                              e.preventDefault();
                              handleReject(notif);
                            }}
                          >
                            {t('common.decline')}
                          </Button>

                          <Button
                            size="sm"
                            className="h-8 px-4 rounded-2xl text-xs font-medium bg-[#7564ED] hover:bg-[#6654d9] text-white shadow-sm border-0 transition-all"
                            disabled={processingMap[notif.id]}
                            onClick={(e) => {
                              e.preventDefault();
                              handleAccept(notif);
                            }}
                          >
                            {t('common.accept')}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
