import { Collapse, Button } from "@material-tailwind/react";
import { useState } from "react";

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* الزر الذي يتحكم في فتح/إغلاق ال Collapse */}
      <Button onClick={() => setOpen(!open)}>
        {open ? "إغلاق" : "فتح"}
      </Button>

      {/* مكون Collapse يحتوي على زر داخلي */}
      <Collapse open={open}>
      
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <Button 
            color="green" 
            onClick={() => alert('تم النقر على الزر الداخلي!')}
          >
            زر داخل ال Collapse
          </Button>
        </div>
      </Collapse>
    </div>
  );
}