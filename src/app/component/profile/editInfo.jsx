"use client"
import React, { useState, useRef } from "react";
import NameForm from "./NameForm";
import PasswordForm from "./PasswordForm";
import ProfilePictureForm from "./ProfilePictureForm";
import EmailForm from "./EmailForm";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import useUserStore from "./store/userStore";

function ModalHeader({ showBack, onBack, onClose, title }) {
  return (
    <div className="flex items-center justify-between px-8 pt-8 pb-6">
      {showBack ? (
        <button 
          onClick={onBack} 
          className="text-2xl text-gray-700 hover:text-[#7c5cff] transition-colors" 
          aria-label="Back"
        >
          &#8592;
        </button>
      ) : (
        <span className="w-8" />
      )}
      <DialogTitle className="sr-only">{title || "Edit Profile"}</DialogTitle>
      <h3 className="text-xl font-bold flex-1 text-center text-gray-900">{title}</h3>
      <button
        onClick={onClose}
        className="text-2xl text-gray-700 hover:text-[#7c5cff] transition-colors"
        aria-label="Close"
      >
        &times;
      </button>
    </div>
  );
}

export default function EditInfo({
  open,
  onOpenChange,
  onClose = () => {},
  userInfo,
  setUserInfo,
  changePassword,
  changeName,
}) {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleClose = () => {
    setSelectedOption(null);
    onClose();
  };

  const handleBackToMain = () => {
    setSelectedOption(null);
  };

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      handleClose();
    }
  };

  let content = null;
  let title = "";

  if (selectedOption === "name") {
    content = <NameForm onBack={handleBackToMain} userInfo={userInfo} setUserInfo={setUserInfo} changeName={changeName} />;
    title = "Modifier le nom";
  }
  if (selectedOption === "password") {
    content = <PasswordForm onBack={handleBackToMain} changePassword={changePassword} />;
    title = "Modifier le mot de passe";
  }
  if (selectedOption === "email") {
    content = <EmailForm onBack={handleBackToMain} userInfo={userInfo} setUserInfo={setUserInfo} />;
    title = "Modifier l'email";
  }
  if (selectedOption === "profilePicture") {
    content = <ProfilePictureForm onBack={handleBackToMain} userInfo={userInfo} setUserInfo={setUserInfo} />;
    title = "Modifier la photo de profil";
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md rounded-2xl bg-white p-0 border-2 border-gray-200 shadow-2xl">
        {!selectedOption ? (
          <div className="p-8">
            <DialogTitle className="mb-6 text-2xl font-bold text-gray-900">Modifier le profil</DialogTitle>
            
            {/* Profile Preview */}
            <div className="flex flex-col items-center pt-4 pb-6">
              <div className="relative">
                <img
                  src={userInfo.profilePhotoUrl || "https://randomuser.me/api/portraits/men/1.jpg"}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-4 border-[#7c5cff]/20 shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="mt-3 text-lg font-semibold text-gray-900">
                {userInfo.firstName || userInfo.lastName 
                  ? `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim()
                  : 'Nom non défini'
                }
              </div>
              <div className="text-gray-500 text-sm">Xdental</div>
            </div>
            
            {/* Menu Options */}
            <div className="space-y-2">
              <button
                className="w-full justify-between h-14 text-lg font-medium text-gray-700 hover:bg-gray-50 hover:text-[#7c5cff] transition-all duration-200 flex items-center px-4 rounded-lg"
                onClick={() => setSelectedOption("name")}
              >
                Nom
                <span className="text-gray-400">&gt;</span>
              </button>
              <button
                className="w-full justify-between h-14 text-lg font-medium text-gray-700 hover:bg-gray-50 hover:text-[#7c5cff] transition-all duration-200 flex items-center px-4 rounded-lg"
                onClick={() => setSelectedOption("email")}
              >
                Email
                <span className="text-gray-400">&gt;</span>
              </button>
              <button
                className="w-full justify-between h-14 text-lg font-medium text-gray-700 hover:bg-gray-50 hover:text-[#7c5cff] transition-all duration-200 flex items-center px-4 rounded-lg"
                onClick={() => setSelectedOption("profilePicture")}
              >
                Photo de profil
                <span className="text-gray-400">&gt;</span>
              </button>
              <button
                className="w-full justify-between h-14 text-lg font-medium text-gray-700 hover:bg-gray-50 hover:text-[#7c5cff] transition-all duration-200 flex items-center px-4 rounded-lg"
                onClick={() => setSelectedOption("password")}
              >
                Mot de passe
                <span className="text-gray-400">&gt;</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <ModalHeader
              showBack={!!selectedOption}
              onBack={handleBackToMain}
              onClose={handleClose}
              title={title}
            />
            {content}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}