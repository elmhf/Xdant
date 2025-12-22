import React, { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Download, Eye, MoreVertical, Info, Download as DownloadIcon, Filter, X, Trash2, AlertTriangle, Wifi, WifiOff, Plus, MessageSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { convertReportsToOrders, getReportIcon, getAIReportName, getAIReportDescription, formatReportDate, getStatusBadgeConfig } from '../utils/reportUtils';
import {
  usePatientStore,
  useFilteredReports,
  useReportsStats
} from '@/stores/patientStore';

import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Lottie from 'lottie-react';
import liquidLoader from '@/components/shared/lottie/liquid_loader.json'
import { toast } from "sonner";

const AIOrdersList = ({
  patient,
  reports = [],
  loading = false,
  onReportDeleted,
  wsConnected = false,
  wsConnectionStatus = 'disconnected',
  wsLastUpdate = null
}) => {
  const router = useRouter();
  const params = useParams();
  const patientId = params.patientId;

  // استخدام selectors محسنة للأداء
  const dateFilter = usePatientStore(state => state.dateFilter);
  const typeFilter = usePatientStore(state => state.typeFilter);
  const isDeleteReportOpen = usePatientStore(state => state.isDeleteReportOpen);
  const reportToDelete = usePatientStore(state => state.reportToDelete);
  const deleteReportLoading = usePatientStore(state => state.deleteReportLoading);
  const deleteReportMessage = usePatientStore(state => state.deleteReportMessage);

  // Report Issue State
  const [isReportIssueOpen, setIsReportIssueOpen] = useState(false);
  const [reportToIssue, setReportToIssue] = useState(null);
  const [issueMessage, setIssueMessage] = useState("");
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);

  // استخدام store للـ actions
  const store = usePatientStore();

  // Convert reports to orders format
  const orders = convertReportsToOrders(reports);
  console.log('Converted orders:', orders);
  // ترتيب الطلبات حسب الوقت (الأحدث أولاً)
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt || a.created_at);
      const dateB = new Date(b.date || b.createdAt || b.created_at);
      return dateB - dateA;
    });
  }, [orders]);

  // Filter orders based on date and type filters
  const filteredOrders = useMemo(() => {
    return sortedOrders.filter(order => {
      console.log(order, "orderorderorder")
      let orderDateStr = order.createdAt || order.created_at;
      let matchesDate = true;
      if (dateFilter) {
        let orderDate;
        try {
          orderDate = new Date(orderDateStr);
        } catch {
          orderDate = null;
        }
        matchesDate = orderDate && !isNaN(orderDate) && orderDate.toISOString().split('T')[0] === dateFilter;
      }
      const matchesType = !typeFilter ||
        typeFilter === 'all' ||
        (order.type || order.raport_type || '').toLowerCase().includes(typeFilter.toLowerCase());
      return matchesDate && matchesType;
    });
  }, [sortedOrders, dateFilter, typeFilter]);

  // Get unique report types for filter dropdown
  const reportTypes = useMemo(() => {
    const types = [...new Set(orders.map(order => order.type))];
    return types.sort();
  }, [orders]);

  const getStatusBadge = (status) => {
    const config = getStatusBadgeConfig(status);
    // Use custom purple for badge
    const isPurple = config.color && config.color.includes('purple');
    return (
      <Badge style={isPurple ? { backgroundColor: '#7564ed', color: '#fff' } : {}} className={`text-xs font-medium`}>
        {config.text}
      </Badge>
    );
  };

  const handleViewReport = (order) => {
    const reportType = (order.type || order.raport_type || '').toLowerCase();
    const reportId = order.id;
    if (reportType === 'cbct ai') {
      router.push(`/patient/${patientId}/${reportId}`);
    } else if (reportType === 'ioxray') {
      router.push(`/patient/${patientId}/${reportId}`);
    } else if (reportType === 'pano ai') {
      router.push(`/patient/${patientId}/${reportId}`);
    } else if (reportType === '3d model ai') {
      router.push(`/patient/${patientId}/${reportId}`);
    } else {
      // fallback: cbct
      alert(`Unsupported report type ${order.type}`);
      // router.push(`/patient/${patientId}/cbctReport/${reportId}`);
    }
  };

  const handleDownloadReport = (order) => {
    // Implement download functionality
  };

  const handleDeleteReport = (order) => {
    store.openDeleteReportDialog(order);
  };

  const confirmDelete = async () => {
    if (!reportToDelete) return;

    const result = await store.deleteReport(reportToDelete.id);
    if (result.success) {
      store.closeDeleteReportDialog();
    } else {
      console.error('❌ Failed to delete report:', result.message);
    }
  };

  const cancelDelete = () => {
    store.closeDeleteReportDialog();
  };

  const handleReportIssue = (order) => {
    setReportToIssue(order);
    setIssueMessage("");
    setIsReportIssueOpen(true);
  };

  const submitReportIssue = async () => {
    if (!issueMessage.trim()) {
      toast.error("Please enter a message describing the issue");
      return;
    }

    setIsSubmittingIssue(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Report Issue Submitted:", {
        reportId: reportToIssue.id,
        message: issueMessage
      });
      toast.success("Issue reported successfully");
      setIsReportIssueOpen(false);
      setReportToIssue(null);
      setIssueMessage("");
    } catch (error) {
      console.error("Failed to report issue:", error);
      toast.error("Failed to report issue");
    } finally {
      setIsSubmittingIssue(false);
    }
  };

  const hasActiveFilters = dateFilter || (typeFilter && typeFilter !== 'all');

  if (loading) {
    return (
      <div className="bg-transparent">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">AI Orders</h1>

        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7564ed]"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 ">





        {filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            {/* <p className="text-gray-500 text-sm">
              {hasActiveFilters ? 'No orders match your filters' : 'No AI orders yet'}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {hasActiveFilters ? 'Try adjusting your filters' : 'Orders will appear here once created'}
            </p> */}
          </div>
        ) : (
          <div className="space-y-4 max-h-[100%] ">
            {filteredOrders.map((order) => (

              <div
                onClick={() => { { order.status === 'completed' && handleViewReport(order) } }}
                key={order.id}
                className={`relative ${order.status === 'completed' && 'cursor-pointer'} bg-white aspect-[2/1] rounded-2xl overflow-hidden hover:outline-6 hover:outline-[#7564ed] hover:outline-offset-0 group shadow-sm border border-gray-200 transition-all duration-200
                  ${new Date(order.date).getTime() > Date.now() - 60000 ? 'ring-2 ring-green-500 animate-pulse' : ''}
                `}
              >
                {order.status === 'error' || order.status === 'failed' ? (
                  <div className="flex flex-row items-center justify-between p-2 h-full bg-white relative overflow-hidden group">

                    {/* Left Side - Large 3D Visual */}
                    <div className="relative w-1/3 h-full flex items-center justify-center">
                      {/* Background Glow */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-red-500/20 blur-[40px] rounded-full" />
                      {/* Large Image */}
                      <img
                        src="/error-cone.png"
                        alt="Error"
                        className="w-60 h-auto object-contain relative z-10 drop-shadow-xl transform group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Right Side - Content */}
                    <div className="flex-1 flex flex-col items-start justify-center pl-2 pr-4 space-y-3">

                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">Ooops!</h3>
                        <p className="text-slate-500 text-sm font-medium">Report failed to generate</p>
                      </div>

                      {/* Report Details */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-slate-700 font-semibold text-xs bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                          {order.type}
                        </span>
                        <span className="text-slate-400 text-xs flex items-center">
                          {formatReportDate(order.date)}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 pt-1">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReportIssue(order);
                          }}
                          variant="ghost"
                          className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 h-9 px-3 rounded-lg text-xs font-medium transition-colors"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Report
                        </Button>
                        <div className="h-4 w-px bg-slate-200 mx-1"></div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteReport(order);
                          }}
                          variant="ghost"
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 h-9 px-3 rounded-lg text-xs font-medium transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : order.status !== 'completed' ? (
                  <div className="flex flex-col items-center justify-center h-full bg-white relative">
                    {/* نوع التقرير وتاريخ الإنشاء في أعلى يسار البطاقة */}
                    <div className="absolute top-4 left-4 text-left">
                      <h3 className="text-xl font-bold text-gray-900">{order.type}</h3>
                      <p className="text-sm text-gray-500">{formatReportDate(order.date)}</p>
                    </div>
                    <div className="w-50 h-50 flex items-center justify-center">
                      <Lottie animationData={liquidLoader} loop={true} style={{ width: '100%', height: '100%' }} />
                    </div>
                    <div className="mt-0 text-lg font-[700] text-gray-700">Generating CBCT report...</div>
                  </div>
                ) : (
                  <div className="relative h-full rounded-xl 
 transition-all duration-300 ease-in-out   ">
                    {/* الصورة */}
                    <img
                      src={order.image_url}
                      alt={order.type}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                    />

                    {/* overlay خفيف باش النص يبان أكثر */}
                    <div className="absolute inset-0 bg-[#0d0c22]/20"></div>

                    {/* المحتوى */}
                    <div className="absolute top-4 left-4 text-white z-10">
                      <h3 className="text-xl font-bold mb-1">{order.type}</h3>
                      <p className="text-sm opacity-90">{formatReportDate(order.date)}</p>
                      {new Date(order.date).getTime() > Date.now() - 60000 && (
                        <div className="mt-2">
                          <Badge className="bg-green-500 text-white text-xs">New Report</Badge>
                        </div>
                      )}
                    </div>

                    {/* الزر متاع القائمة */}
                    <div className="absolute top-4 right-4 z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-white hover:bg-white/20"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem>
                            <Info className="w-4 h-4 mr-2 text-[#7564ed]" />
                            Informações
                          </DropdownMenuItem>
                          {order.status === "completed" && (
                            <DropdownMenuItem onPointerDown={() => handleDownloadReport(order)}>
                              <DownloadIcon className="w-4 h-4 mr-2 text-[#7564ed]" />
                              Descarregar
                            </DropdownMenuItem>
                          )}
                          {order.status !== "pending" && (
                            <DropdownMenuItem
                              onPointerDown={() => handleDeleteReport(order)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* الـ Status Badge */}
                    <div className="absolute bottom-4 left-4 z-10">
                      {getStatusBadge(order.status)}
                    </div>
                  </div>


                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteReportOpen} onOpenChange={store.closeDeleteReportDialog}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Delete Report
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {reportToDelete?.type} report?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={cancelDelete}
              disabled={deleteReportLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteReportLoading}
            >
              {deleteReportLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Issue Dialog */}
      <Dialog open={isReportIssueOpen} onOpenChange={setIsReportIssueOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#6366f1]" />
              Report Issue
            </DialogTitle>
            <DialogDescription>
              Describe the problem you encountered with this report. Our team will investigate.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              className="w-full min-h-[120px] p-3 rounded-2xl border border-gray-400 focus:border-[#6366f1] focus:ring-0 outline-none resize-none text-sm"
              placeholder="Describe the issue here..."
              value={issueMessage}
              onChange={(e) => setIssueMessage(e.target.value)}
            />
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsReportIssueOpen(false)}
              disabled={isSubmittingIssue}
            >
              Cancel
            </Button>
            <Button
              onClick={submitReportIssue}
              disabled={isSubmittingIssue || !issueMessage.trim()}
              className="bg-[#6366f1] hover:bg-[#5558e3] text-white"
            >
              {isSubmittingIssue ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  Send Report
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIOrdersList;