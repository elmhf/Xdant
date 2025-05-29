import { Textarea, Button, IconButton } from "@material-tailwind/react";

export default function CommentBoxTextarea({ comment, setComment, onSubmit, onCancel }) {
  return (
    <div className="p-4 relative w-[32rem]" style={{ color: "white", fontFamily: "Poppins, sans-serif" }}>
      <Textarea
        variant="static"
        placeholder="Your Comment"
        rows={8}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        style={{
          backgroundColor: "transparent",
          padding: "20px",
          border: "0.5px solid rgba(169, 169, 169, 0.5)",
          borderRadius: "7px",
          fontFamily: "Poppins, sans-serif",
          fontSize: "15px",
        }}
      />
      
      <div className="flex w-full justify-between py-2 mt-3">
        <IconButton variant="text" color="blue-gray" size="sm">
          {/* Icon for attachment or something else */}
        </IconButton>
        <button>dfdfff</button>
        <div className="flex gap-3">
          <Button
            size="sm"
            color="red"
            variant="text"
            className="rounded-md"
            onClick={onCancel}
            type="button" 
          >
            Cancel
          </Button>
          <Button
            size="sm"
            style={{ backgroundColor: "transparent" }}
            className="rounded-md"
            onClick={onSubmit}
            type="button"  
          >
            Post Comment
          </Button>
        </div>
      </div>
    </div>
  );
}
