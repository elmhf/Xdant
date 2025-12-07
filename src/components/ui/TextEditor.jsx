import React, { useState, useEffect, useRef } from 'react';
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { Button } from './button';

const ToolbarButton = ({ icon: Icon, onClick, isActive, title }) => (
    <button
        onClick={onClick}
        className={`p-1.5 rounded transition-colors ${isActive ? 'bg-gray-200 text-black' : 'text-gray-600 hover:bg-gray-100'
            }`}
        title={title}
        type="button"
    >
        <Icon size={16} />
    </button>
);

export default function TextEditor({ value, onChange, placeholder = "Formuler une conclusion..." }) {
    const contentRef = useRef(null);

    useEffect(() => {
        if (contentRef.current && contentRef.current.innerHTML !== value) {
            // Update content if it doesn't match the prop (e.g. on mount or external change)
            contentRef.current.innerHTML = value || '';
        }
    }, [value]);

    const execCommand = (command, value = null) => {
        document.execCommand(command, false, value);
        if (contentRef.current) {
            onChange(contentRef.current.innerHTML);
        }
        // Keep focus
        // contentRef.current.focus(); 
    };

    const handleInput = () => {
        if (contentRef.current) {
            onChange(contentRef.current.innerHTML);
        }
    };

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-100 bg-gray-50/50">
                <ToolbarButton icon={Bold} onClick={() => execCommand('bold')} title="Bold" />
                <ToolbarButton icon={Italic} onClick={() => execCommand('italic')} title="Italic" />
                <ToolbarButton icon={Underline} onClick={() => execCommand('underline')} title="Underline" />
                <ToolbarButton icon={Strikethrough} onClick={() => execCommand('strikeThrough')} title="Strikethrough" />

                <div className="w-px h-4 bg-gray-300 mx-1" />

                <ToolbarButton icon={List} onClick={() => execCommand('insertUnorderedList')} title="Bullet List" />
                <ToolbarButton icon={ListOrdered} onClick={() => execCommand('insertOrderedList')} title="Numbered List" />

                <div className="w-px h-4 bg-gray-300 mx-1" />

                <ToolbarButton icon={AlignLeft} onClick={() => execCommand('justifyLeft')} title="Align Left" />
                <ToolbarButton icon={AlignCenter} onClick={() => execCommand('justifyCenter')} title="Align Center" />
                <ToolbarButton icon={AlignRight} onClick={() => execCommand('justifyRight')} title="Align Right" />
                <ToolbarButton icon={AlignJustify} onClick={() => execCommand('justifyFull')} title="Justify" />

                {/* <div className="w-px h-4 bg-gray-300 mx-1" />
        
        <ToolbarButton icon={LinkIcon} onClick={() => {
            const url = prompt('Enter URL');
            if(url) execCommand('createLink', url);
        }} title="Link" /> */}
            </div>

            {/* Content Area */}
            <div
                ref={contentRef}
                className="p-3 min-h-[120px] max-h-[200px] overflow-y-auto focus:outline-none prose prose-sm max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
                contentEditable
                onInput={handleInput}
                data-placeholder={placeholder}
                suppressContentEditableWarning
                style={{ fontSize: '14px', lineHeight: '1.5' }}
            />
        </div>
    );
}
