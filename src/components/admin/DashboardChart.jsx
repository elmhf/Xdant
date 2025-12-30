"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
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
        <Card>
            <CardHeader className="flex items-center gap-2 space-y-0 py-5 sm:flex-row">
                <div className="grid flex-1 gap-1 text-center sm:text-left">
                    <CardTitle className="text-4xl font-bold">Performance</CardTitle>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger
                        className="w-[160px] rounded-lg sm:ml-auto"
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
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 justify-center items-center flex sm:pt-6">
                {loading ? (
                    <div className="flex h-[350px] w-full items-center justify-center">
                        <Lottie animationData={circleLoader} loop={true} className="w-[350px] h-[350px]" />
                    </div>
                ) : (<ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[350px] flex align-center justify-center  w-full"
                >

                    <LineChart
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                            top: 12,
                            bottom: 12
                        }}
                    >
                        <CartesianGrid vertical={false} stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
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
                            tickMargin={8}
                            width={40}
                        />
                        <ChartTooltip
                            cursor={{ strokeDasharray: '4 4' }}
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
                                />
                            }
                        />
                        <Line
                            dataKey="reports"
                            type="monotone"
                            stroke="var(--color-reports)"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            dataKey="patients"
                            type="monotone"
                            stroke="var(--color-patients)"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6 }}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                    </LineChart>

                </ChartContainer>)}
            </CardContent>
        </Card>
    )
}
