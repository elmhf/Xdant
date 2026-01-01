"use client"

import * as React from "react"
import { CartesianGrid, Area, AreaChart, XAxis, YAxis } from "recharts"
import { adminService } from "@/services/adminService"
import Lottie from "lottie-react";
import circleLoader from "@/components/shared/lottie/Insider-loading.json";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const chartConfig = {
    patients: {
        label: "Patients",
        color: "#2563eb", // Blue
    },
    reports: {
        label: "Reports",
        color: "#f97316", // Orange
    },
}

export default function DashboardChart() {
    const [timeRange, setTimeRange] = React.useState("6m")
    const [chartData, setChartData] = React.useState([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await adminService.getDashboardStats(timeRange);
                setChartData(data || []);
            } catch (error) {
                console.error("Failed to fetch chart data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [timeRange]);

    return (
        <Card className="border-1 border-gray-300">
            <CardHeader className="flex items-center  gap-2 space-y-0 py-5 sm:flex-row">
                <div className="grid flex-1 gap-1 text-center sm:text-left">
                    <CardTitle className="text-4xl font-bold">Performance</CardTitle>
                    <CardDescription className="text-lg text-gray-500">
                        Trends for new patients and generated reports over time.
                    </CardDescription>
                </div>
                <div className="flex items-center gap-4 sm:ml-auto">
                    {/* Custom Legend */}
                    <div className="flex items-center gap-4 mr-2">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm bg-blue-600"></div>
                            <span className="text-sm text-gray-600 font-medium">Patients</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm bg-orange-500"></div>
                            <span className="text-sm text-gray-600 font-medium">Reports</span>
                        </div>
                    </div>

                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger
                            className="w-[160px] border-1 border-gray-300 rounded-lg"
                            aria-label="Select a value"
                        >
                            <SelectValue placeholder="Last 6 months" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="24h" className="rounded-lg">
                                Last 24 Hours
                            </SelectItem>
                            <SelectItem value="7d" className="rounded-lg">
                                Last 7 Days
                            </SelectItem>
                            <SelectItem value="30d" className="rounded-lg">
                                Last 30 Days
                            </SelectItem>
                            <SelectItem value="90d" className="rounded-lg">
                                Last 3 Months
                            </SelectItem>
                            <SelectItem value="6m" className="rounded-lg">
                                Last 6 Months
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 justify-center items-center flex sm:pt-6">
                {loading ? (
                    <div className="flex h-[350px] w-full items-center justify-center">
                        <Lottie animationData={circleLoader} loop={true} className="w-[350px] h-[350px]" />
                    </div>
                ) : (
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[350px] w-full"
                    >
                        <AreaChart
                            data={chartData}
                            margin={{
                                left: 12,
                                right: 12,
                                top: 12,
                                bottom: 12
                            }}
                        >
                            <defs>
                                <linearGradient id="fillPatients" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-patients)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--color-patients)" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="fillReports" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-reports)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--color-reports)" stopOpacity={0.1} />
                                </linearGradient>
                                <pattern id="dotPattern" patternUnits="userSpaceOnUse" width="20" height="20">
                                    <circle cx="2" cy="2" r="1" fill="#e5e7eb" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#dotPattern)" opacity="0.4" />
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={12}
                                minTickGap={30}
                                tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                                tickFormatter={(value) => {
                                    const date = new Date(value)
                                    if (timeRange === '24h') {
                                        return date.toLocaleTimeString("en-US", { hour: 'numeric', hour12: true });
                                    } else if (timeRange === '7d' || timeRange === '30d') {
                                        return date.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
                                    }
                                    return date.toLocaleDateString("en-US", { month: "short" })
                                }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={12}
                                tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                                width={40}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        labelFormatter={(value) => {
                                            const date = new Date(value);
                                            if (timeRange === '24h') {
                                                return date.toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit' });
                                            }
                                            return date.toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric"
                                            })
                                        }}
                                        indicator="dot"
                                        className="w-[150px] bg-white/95 backdrop-blur-sm border-gray-200 shadow-xl"
                                    />
                                }
                            />
                            <Area
                                dataKey="reports"
                                type="monotone"
                                fill="url(#fillReports)"
                                stroke="var(--color-reports)"
                                strokeWidth={2}
                                stackId="1"
                            />
                            <Area
                                dataKey="patients"
                                type="monotone"
                                fill="url(#fillPatients)"
                                stroke="var(--color-patients)"
                                strokeWidth={2}
                                stackId="2"
                            />
                        </AreaChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}
