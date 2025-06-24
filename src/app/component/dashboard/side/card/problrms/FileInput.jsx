import { IoMdAddCircleOutline } from "react-icons/io";

export default function Fileinput(on) {
  return (
    <div className="flex h-full items-center justify-center">
      <label
        htmlFor="dropzone-file"
        className="flex h-[150px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
      >
        <div className="flex flex-col items-center justify-center h-full w-full p-4">
          <IoMdAddCircleOutline className="w-1/3 h-1/3" />
          <div className="">Add Problem</div>
        </div>
      </label>
    </div>
  );
}