import { useLayout } from "@/stores/setting";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LayoutGrid, PanelLeft, PanelTop, Minimize, Maximize } from "lucide-react";

const LAYOUT_OPTIONS = [
  {
    value: 'DEFAULT',
    label: 'Disposition par défaut',
    icon: LayoutGrid,
    iconClass: "h-4 w-4"
  },
  {
    value: 'VERTICAL',
    label: 'Division verticale',
    icon: PanelLeft,
    iconClass: "h-4 w-4"
  },
  {
    value: 'HORIZONTAL',
    label: 'Division horizontale',
    icon: PanelTop, 
    iconClass: "h-4 w-4"
  },
  {
    value: 'COMPACT',
    label: 'Mode compact',
    icon: Minimize,
    iconClass: "h-4 w-4"
  }
];

export const LayoutControls = () => {
  const { currentLayout, isFullscreen, applyLayout, toggleFullscreen } = useLayout();

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
          
          {LAYOUT_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => applyLayout(option.value)}
              className={`flex items-center px-2 py-1.5 text-sm cursor-pointer ${
                currentLayout === option.value 
                  ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <option.icon className={`mr-2 ${option.iconClass} ${
                currentLayout === option.value ? 'text-blue-600' : 'text-gray-500'
              }`} />
              <span>{option.label}</span>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator className="bg-gray-100" />
          <DropdownMenuItem 
            onClick={toggleFullscreen}
            className="flex items-center px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            {isFullscreen ? (
              <>
                <Minimize className="mr-2 h-4 w-4 text-gray-500" />
                <span>Quitter le mode plein écran</span>
              </>
            ) : (
              <>
                <Maximize className="mr-2 h-4 w-4 text-gray-500" />
                <span>Plein écran</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};