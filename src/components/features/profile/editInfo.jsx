"use client"
import React, { useState } from "react";
import { Settings, User, Shield, Bell, CreditCard, Edit2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function EditInfo({
  open,
  onOpenChange,
  onClose = () => { },
  userInfo,
  setUserInfo,
}) {
  const [activeTab, setActiveTab] = useState("general");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [username, setUsername] = useState(userInfo?.firstName || "sophie");
  const [settings, setSettings] = useState({
    autoPrompt: true,
    autoPlay: true,
    publishToExplore: false,
    darkMode: false,
    autoSaveReports: true,
    language: "auto"
  });

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "subscription", label: "Subscription", icon: CreditCard },
  ];

  const handleUsernameEdit = () => {
    if (isEditingUsername) {
      // Save username
      setUserInfo({ ...userInfo, firstName: username });
    }
    setIsEditingUsername(!isEditingUsername);
  };

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-8">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Username</label>
              <div className="flex items-center gap-3">
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!isEditingUsername}
                  className={`h-12 text-base ${!isEditingUsername ? 'bg-gray-50 border-gray-200' : ''}`}
                />
                <button
                  onClick={handleUsernameEdit}
                  className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input
                value={userInfo?.email || "sophie@ul.live"}
                disabled
                className="h-12 text-base bg-gray-50 border-gray-200 text-gray-400"
              />
            </div>

            {/* Toggle Settings */}
            <div className="space-y-6">
              <div className="flex items-center justify-between py-3">
                <span className="text-base text-gray-700">Enable auto-prompt idea suggestion</span>
                <Switch
                  checked={settings.autoPrompt}
                  onCheckedChange={() => handleToggle('autoPrompt')}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-base text-gray-700">Auto-play video on Explore</span>
                <Switch
                  checked={settings.autoPlay}
                  onCheckedChange={() => handleToggle('autoPlay')}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-base text-gray-700">Publish to Explore</span>
                <Switch
                  checked={settings.publishToExplore}
                  onCheckedChange={() => handleToggle('publishToExplore')}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-base text-gray-700">Dark mode</span>
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={() => handleToggle('darkMode')}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-base text-gray-700">Enable auto-save for reports</span>
                <Switch
                  checked={settings.autoSaveReports}
                  onCheckedChange={() => handleToggle('autoSaveReports')}
                />
              </div>
            </div>

            {/* Language Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Language</label>
              <Select value={settings.language} onValueChange={(val) => setSettings(prev => ({ ...prev, language: val }))}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto detect</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "profile":
        return (
          <div className="space-y-8">
            {/* My Profile Section */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">My Profile</h3>
              
              {/* Profile Picture */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7564ed] to-[#6a4fd8] flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                  {userInfo?.profilePhotoUrl ? (
                    <img src={userInfo.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span>{userInfo?.firstName?.[0]}{userInfo?.lastName?.[0]}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex gap-3 mb-2">
                    <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium flex items-center gap-2">
                      <span>+</span> Change Image
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                      Remove Image
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">We support PNGs, JPEGs and GIFs under 2MB</p>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">First Name</label>
                  <Input
                    value={userInfo?.firstName || ""}
                    onChange={(e) => setUserInfo({ ...userInfo, firstName: e.target.value })}
                    className="h-11 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">Last Name</label>
                  <Input
                    value={userInfo?.lastName || ""}
                    onChange={(e) => setUserInfo({ ...userInfo, lastName: e.target.value })}
                    className="h-11 text-base"
                  />
                </div>
              </div>
            </div>

            {/* Account Security Section */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Account Security</h3>
              
              {/* Email */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-gray-900">Email</label>
                <div className="flex gap-3">
                  <Input
                    value={userInfo?.email || ""}
                    disabled
                    className="h-11 text-base bg-gray-50 flex-1"
                  />
                  <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium whitespace-nowrap">
                    Change email
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-gray-900">Password</label>
                <div className="flex gap-3">
                  <Input
                    type="password"
                    value="••••••••••"
                    disabled
                    className="h-11 text-base bg-gray-50 flex-1"
                  />
                  <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium whitespace-nowrap">
                    Change password
                  </button>
                </div>
              </div>

              {/* 2-Step Verification */}
              <div className="flex items-start justify-between py-4 border-t border-gray-200">
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-gray-900 mb-1">2-Step Verifications</h4>
                  <p className="text-sm text-gray-600">Add an additional layer of security to your account during login.</p>
                </div>
                <Switch checked={false} />
              </div>
            </div>

            {/* Support Access Section */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Support Access</h3>
              
              {/* Support Access Toggle */}
              <div className="flex items-start justify-between py-4 mb-6">
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-gray-900 mb-1">Support access</h4>
                  <p className="text-sm text-gray-600">You have granted us to access to your account for support purposes until Aug 31, 2023, 9:40 PM.</p>
                </div>
                <Switch checked={true} />
              </div>

              {/* Log out of all devices */}
              <div className="flex items-start justify-between py-4 border-t border-gray-200 mb-4">
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-gray-900 mb-1">Log out of all devices</h4>
                  <p className="text-sm text-gray-600">Log out of all other active sessions on other devices besides this one.</p>
                </div>
                <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium whitespace-nowrap">
                  Log out
                </button>
              </div>

              {/* Delete Account */}
              <div className="flex items-start justify-between py-4 border-t border-gray-200">
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-red-600 mb-1">Delete my account</h4>
                  <p className="text-sm text-gray-600">Permanently delete the account and remove access from all workspaces.</p>
                </div>
                <button className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium whitespace-nowrap">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6 py-8">
            <p className="text-gray-600">Security settings coming soon</p>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6 py-8">
            <p className="text-gray-600">Notification preferences coming soon</p>
          </div>
        );

      case "subscription":
        return (
          <div className="space-y-6 py-8">
            <p className="text-gray-600">Subscription details coming soon</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[600px] rounded-2xl bg-white p-0 border-0 shadow-2xl overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${isActive
                      ? 'bg-white text-gray-900 font-medium shadow-sm'
                      : 'text-gray-600 hover:bg-white/60'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-base">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-scroll ">
            <div className="p-8 pb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              {renderTabContent()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}