import React from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
  Button,
  Textarea
} from "@material-tailwind/react";

export default function CommentBox({ idCard }) {
  const [comment, setComment] = React.useState("");
  const [open, setOpen] = React.useState(false);
  
  const handleSubmit = () => {
    
    setOpen(false);
    setComment("");
  };

  const handleCancel = () => {
    setOpen(false);
    setComment("");
  };

  const toggleAccordion = () => setOpen(!open);

  return (
    <div className="container mx-auto">
      <Accordion open={open}>

        
        <AccordionBody>
          <div id={idCard+'buttons'} className="p-4 relative" style={{ color: "white", fontFamily: "Poppins, sans-serif" }}>
            <Textarea
              variant="static"
              placeholder="Your Comment"
              rows={8}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="bg-transparent border border-gray-300 rounded-lg p-5 text-sm font-poppins"
            />
            
            <div className="flex w-full justify-between py-2 mt-3 gap-3">
              <Button
                size="sm"
                color="red"
                variant="text"
                className="rounded-md normal-case" // أضفت normal-case هنا
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="rounded-md bg-blue-500 text-white normal-case" // أضفت normal-case هنا
                onClick={handleSubmit}
                disabled={!comment.trim()}
              >
                Post Comment
              </Button>
            </div>
          </div>
        </AccordionBody>
        <AccordionHeader onClick={toggleAccordion} className="p-0 border-0">
          <Button
            onClick={toggleAccordion}
            variant="gradient"
            className="mt-4 normal-case" // أضفت normal-case هنا
            style={{ 
              backgroundColor: "rgba(var(--color-Healthy), 0.2)",
              border: "solid 1px rgba(var(--color-Healthy), 0.5)",
              padding: "10px 30px"
            }}
          >
            {open ? "Close Comment" : "Add Comment"}
          </Button>
        </AccordionHeader>
      </Accordion>
    </div>
  );
}