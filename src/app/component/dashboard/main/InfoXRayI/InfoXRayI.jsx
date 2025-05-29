import { DataContext } from "../../dashboard";
import { useEffect, useState, useContext } from "react";
import { Typography } from "@material-tailwind/react";
import { UserIcon, CalendarIcon, ChartBarIcon } from "@heroicons/react/24/solid";

const InfoXRayI = () => {
    const { data } = useContext(DataContext);
    const [item, setItem] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (data?.info) {
            setItem(data.info);
            setIsLoading(false);
        }
    }, [data]);

    if (isLoading) {
        return (
            <div className="animate-pulse p-6 w-full max-w-4xl mx-auto">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
        );
    }

    return (
        <div className=" cardsBorder w-full max-w-4xl mx-auto  shadow-lg p-6 
            transition-all duration-300 hover:shadow-xl" style={{backgroundColor:'var(--card-background-color)',borderRadius:'7px'}}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Patient Info */}
                <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-full">
                        <UserIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <Typography variant="h5" color="blue-gray" className="font-semibold">
                            {item.patientName || "Sara Lamalo"}
                        </Typography>
                        <Typography color="gray" className="text-sm mt-1">
                            Age {item.Age || "0000"}
                        </Typography>
                    </div>
                </div>

                {/* Divider removed - use border instead */}
                <div className="md:hidden w-full border-t my-4"></div>

                {/* Date Section */}
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-amber-50 rounded-full">
                        <CalendarIcon className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                    <Typography variant="h5" color="blue-gray" className="font-semibold">
                            Scan Date
                        </Typography>
                        <Typography color="gray" className="text-sm mt-1">
                            {item.ScanD || "20 July 2022"}
                        </Typography>
                    </div>
                </div>

                {/* Divider removed - use border instead */}
                <div className="md:hidden w-full border-t my-4"></div>

                {/* Growth Section */}
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-50 rounded-full">
                        <ChartBarIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                    <Typography variant="h5" color="blue-gray" className="font-semibold">
                            Growth Status
                        </Typography>
                        <Typography color="gray" className="text-sm mt-1">
                            {item.growthStatus || "Normal Progression"}
                        </Typography>
                    </div>
                </div>
            </div>

            {/* Additional Information */}
            {item.additionalInfo && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <Typography variant="small" className="font-medium text-gray-700">
                        Clinical Notes:
                    </Typography>
                    <Typography variant="small" className="text-gray-600 mt-1">
                        {item.additionalInfo}
                    </Typography>
                </div>
            )}
        </div>
    );
};

export default InfoXRayI;