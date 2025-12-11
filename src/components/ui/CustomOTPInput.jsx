import React from 'react';

const CustomOTPInput = ({ value, onChange, length = 6, error }) => {
    const handleChange = (e, index) => {
        const val = e.target.value;
        if (!/^[0-9]?$/.test(val)) return;

        const newCode = value.split("");
        while (newCode.length < length) newCode.push("");

        newCode[index] = val;
        const nextCode = newCode.join("");
        onChange(nextCode);

        // Auto-focus next
        if (val && index < length - 1) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !value[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
        onChange(pasted);
        setTimeout(() => {
            const targetIndex = Math.min(pasted.length, length - 1);
            const targetInput = document.getElementById(`otp-${targetIndex}`);
            if (targetInput) targetInput.focus();
        }, 0);
    };

    return (
        <div className="flex items-center justify-center gap-2">
            {Array.from({ length }).map((_, index) => (
                <React.Fragment key={index}>
                    <input
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        className={`w-12 h-14 text-center text-2xl font-medium border-2 rounded-xl bg-transparent text-gray-900 border-gray-200 outline-none transition-all duration-200 
                            ${error
                                ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                                : 'border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 hover:border-blue-400'
                            }`}
                        value={value[index] || ""}
                        onChange={(e) => handleChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onPaste={handlePaste}
                        autoFocus={index === 0}
                    />
                    {/* Add separator after the 3rd input (index 2) */}
                    {index === 2 && (
                        <span className="text-gray-400 font-bold text-xl mx-1">-</span>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default CustomOTPInput;
