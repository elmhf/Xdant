import useLayout from "@/hooks/useLayout";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Minimize, Maximize } from "lucide-react";

export const LayoutControls = () => {
  const { layoutKey, setLayout, allLayouts } = useLayout();

  // توليد الخيارات ديناميكياً من allLayouts
  const layoutOptions = Object.entries(allLayouts).map(([key, val]) => ({
    value: key,
    label: val.name,
    icon: LayoutGrid, // يمكنك تخصيص أيقونة لكل layout إذا رغبت
    iconClass: "h-4 w-4"
  }));

  return (
    <div className="flex items-center justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            className="hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <LayoutGrid className="h-4 w-4 text-gray-600" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-medium text-gray-700">
            Disposition de la fenêtre
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-100" />
          
          {layoutOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setLayout(option.value)}
              className={`flex items-center px-2 py-1.5 text-sm cursor-pointer ${
                layoutKey === option.value 
                  ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <option.icon className={`mr-2 ${option.iconClass} ${
                layoutKey === option.value ? 'text-blue-600' : 'text-gray-500'
              }`} />
              <span>{option.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};