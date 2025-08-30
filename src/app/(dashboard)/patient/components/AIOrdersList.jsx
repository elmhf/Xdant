import React, { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Download, Eye, MoreVertical, Info, Download as DownloadIcon, Filter, X, Trash2, AlertTriangle, Wifi, WifiOff, Plus } from "lucide-react";
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
import axios from 'axios';
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Lottie from 'lottie-react';
import liquidLoader from "@/app/Lottie/liquid loader.json";

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
  
  // استخدام store للـ actions
  const store = usePatientStore();

  // Convert reports to orders format
  const orders = convertReportsToOrders(reports);
  console.log('Converted orders:', orders,reports);
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
      router.push(`/patient/${patientId}/cbctReport/${reportId}`);
    } else if (reportType === 'ioxray') {
      router.push(`/patient/${patientId}/ioxRayReport/${reportId}`);
    } else if (reportType === 'pano ai') {
      router.push(`/patient/${patientId}/panoReport/${reportId}`);
    } else if (reportType === '3d model ai') {
      router.push(`/patient/${patientId}/threeDModelReport/${reportId}`);
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

  const hasActiveFilters = dateFilter || (typeFilter && typeFilter !== 'all');

  if (loading) {
    return (
      <div className="bg-transparent">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">AI Orders</h1>
          
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 ">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-4xl font-bold text-gray-900">AI Reports </h2>
            <div className="flex items-center gap-3 ml-4">
              <div className={`border-3 rounded-2xl flex ${dateFilter ? '' : 'border'} rounded p-0.5 items-center gap-2`} style={dateFilter ? { borderColor: '#7564ed' } : {}}>
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="relative h-8 w-35 min-w-fit ">
                      <button
                        className={`h-8 w-full text-xs px-2 py-1 border rounded bg-white text-left ${dateFilter ? 'border-purple-600' : 'border'} ${dateFilter ? 'text-black' : 'text-gray-400'}`}
                        type="button"
                      >
                        {dateFilter ? format(new Date(dateFilter), "yyyy-MM-dd") : "Pick a date"}
                      </button>
                      {dateFilter && (
                        <Button
                          variant="ghost"
                          size="sm"
                           onPointerDown={(e) => {
                                e.preventDefault();
                                store.setDateFilter("");
                              }}
                          className="absolute right-0 top-1/2 -translate-y-1/2 h-6 px-1 text-xs"
                          style={{ color: '#7564ed' }}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFilter ? new Date(dateFilter) : undefined}
                      onSelect={date => date ? store.setDateFilter(format(date, "yyyy-MM-dd")) : store.setDateFilter("")}
                      initialFocus
                      captionLayout="dropdown"
                      fromYear={2000}
                      toYear={new Date().getFullYear() + 1}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <div className={` relative h-10 w-32 border-3 rounded-2xl flex ${typeFilter!='all' ? '' : 'border'} rounded p-0.5 items-center gap-2`} style={typeFilter!='all' ? { borderColor: '#7564ed' } : {}}>
                  <Select value={typeFilter} className='bg-white' onValueChange={store.setTypeFilter}>
                    <SelectTrigger
                      className={`h-8 w-full bg-white  text-xs ${typeFilter && typeFilter !== 'all' ? 'text-black' : 'text-gray-400'}`}
                      style={typeFilter && typeFilter !== 'all' ? { borderColor: '#7564ed', borderWidth: '1px', borderStyle: 'solid' } : {}}
                    >
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {reportTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={store.clearFilters}
                  className="h-8 px-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>


        
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              {hasActiveFilters ? 'No orders match your filters' : 'No AI orders yet'}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {hasActiveFilters ? 'Try adjusting your filters' : 'Orders will appear here once created'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[70%] overflow-y-auto">
            {filteredOrders.map((order) => (
              <div
                onClick={() =>{    {order.status === 'completed' &&  handleViewReport(order) }  }}
                key={order.id}
                className={`relative ${order.status === 'completed' &&  'cursor-pointer'} bg-white aspect-[2/1] rounded-2xl overflow-hidden shadow-sm border border-gray-200 transition-all duration-200
                  hover:border-3 hover:border-purple-600
                  ${new Date(order.date).getTime() > Date.now() - 60000 ? 'ring-2 ring-green-500 animate-pulse' : ''}
                `}
              >
                {order.status === 'error' ? (
                  <div className="flex flex-col items-center justify-center h-full bg-white relative">
                    <div className="absolute top-4 left-4 text-left">
                      <h3 className="text-xl font-bold text-red-600">{order.type}</h3>
                      <p className="text-sm text-gray-500">{formatReportDate(order.date)}</p>
                    </div>
                    <XCircle className="w-20 h-20 text-red-500 mb-2" />
                    <div className="mt-0 text-lg font-[500] text-red-600">فما خطأ في التقرير</div>
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
                  <div className="relative h-full bg-gradient-to-br from-blue-900  to-blue-700">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-blue-600/20"></div>
                    <div className="absolute  top-4 left-4 text-white">
                      <h3 className="text-xl font-bold mb-1">{order.type}</h3>
                      <p className="text-sm opacity-90">{formatReportDate(order.date)}</p>
                      {new Date(order.date).getTime() > Date.now() - 60000 && (
                        <div className="mt-2">
                          <Badge className="bg-green-500 text-white text-xs">
                            New Report
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="absolute top-4 right-4">
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
                          <DropdownMenuItem >
                            <Info className="w-4 h-4 mr-2 text-purple-600" />
                            Informações
                          </DropdownMenuItem>
                          {order.status === 'completed' && (
                            <DropdownMenuItem onPointerDown={() => handleDownloadReport(order)}>
                              <DownloadIcon className="w-4 h-4 mr-2 text-purple-600" />
                              Descarregar
                            </DropdownMenuItem>
                          )}
                          {order.status !== 'pending' && (
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
                    {/* Status Badge */}
                    <div className="absolute bottom-4 left-4">
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
    </>
  );
 };

export default AIOrdersList;