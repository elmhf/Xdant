"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { reverseGeocode } from "../../../(dashboard)/welcome/welcomsteps/utils/reverseGeocode";

const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });

export default function ClinicDetails({ onBack, onNext, isFirstStep, isLastStep }) {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState({
    road: "",
    suburb: "",
    city: "",
    state: "",
    postcode: "",
    country: "",
  });
  const [addressLocked, setAddressLocked] = useState(false);

  const handleLocationSelect = async (pos) => {
    setLocation(pos);
    try {
      const fullAddress = await reverseGeocode(pos.lat, pos.lng);
      setAddress(fullAddress);
      setAddressLocked(true);
    } catch (err) {
      setAddressLocked(false);
      setAddress({
        road: "",
        suburb: "",
        city: "",
        state: "",
        postcode: "",
        country: "",
      });
      console.error("Failed to fetch address", err);
    }
  };

  const handleAddressChange = (e) => {
    const { id, value } = e.target;
    setAddress((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex w-full h-full min-h-[100%] bg-white  overflow-hidden"
    >
      {/* Colonne infos (gauche) */}
      <div className="w-full max-w-md bg-white p-6 flex flex-col justify-between">
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-6"
          >
            <h2 className="text-2xl font-bold">Clinic Information</h2>
            <p className="text-sm text-gray-500">Provide your clinic details and location</p>
          </motion.div>

          <form className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <Label htmlFor="clinicName" className="font-semibold">Clinic Name</Label>
              <Input id="clinicName" type="text" placeholder="Clinic name" className="w-full border border-gray-300 rounded-lg bg-white px-4 py-2 text-gray-900 placeholder-gray-400" />
            </motion.div>

            {/* Auto-filled address fields */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <Label htmlFor="address" className="font-semibold">Street Address</Label>
              <Input id="road" value={address.road} onChange={handleAddressChange} placeholder="Street" className="w-full border border-gray-300 rounded-lg bg-white px-4 py-2 text-gray-900 placeholder-gray-400" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex space-x-4"
            >
              <div className="flex-1 space-y-2">
                <Label htmlFor="suburb" className="font-semibold">Neighbourhood</Label>
                <Input id="suburb" value={address.suburb} onChange={handleAddressChange} placeholder="Suburb" className="w-full border border-gray-300 rounded-lg bg-white px-4 py-2 text-gray-900 placeholder-gray-400" />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="city" className="font-semibold">City</Label>
                <Input id="city" value={address.city} onChange={handleAddressChange} placeholder="City" className="w-full border border-gray-300 rounded-lg bg-white px-4 py-2 text-gray-900 placeholder-gray-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex space-x-4"
            >
              <div className="flex-1 space-y-2">
                <Label htmlFor="postcode" className="font-semibold">Postal Code</Label>
                <Input id="postcode" value={address.postcode} onChange={handleAddressChange} placeholder="Postal Code" className="w-full border border-gray-300 rounded-lg bg-white px-4 py-2 text-gray-900 placeholder-gray-400" />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="country" className="font-semibold">Country</Label>
                <Input id="country" value={address.country} onChange={handleAddressChange} placeholder="Country" className="w-full border border-gray-300 rounded-lg bg-white px-4 py-2 text-gray-900 placeholder-gray-400" />
              </div>
            </motion.div>

            {/* Other clinic info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-2"
            >
              <Label htmlFor="phone" className="font-semibold">Phone</Label>
              <Input id="phone" type="tel" placeholder="Phone number" className="w-full border border-gray-300 rounded-lg bg-white px-4 py-2 text-gray-900 placeholder-gray-400" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-2"
            >
              <Label htmlFor="email" className="font-semibold">Email</Label>
              <Input id="email" type="email" placeholder="you@clinic.com" className="w-full border border-gray-300 rounded-lg bg-white px-4 py-2 text-gray-900 placeholder-gray-400" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex justify-between mt-8"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={onBack}
                className="flex items-center px-6 py-2 rounded-full border bg-white text-[#0d0c22] border-gray-300 hover:bg-gray-50"
              >
                <span className="mr-2">&#8592;</span> Go back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNext}
                type="button"
                className="px-6 py-2 rounded-full bg-[#0d0c22] text-white font-semibold hover:bg-gray-900 transition"
              >
                Next step
              </motion.button>
            </motion.div>
          </form>
        </div>
      </div>
      {/* Colonne carte (droite) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="flex-1 relative"
      >
        <MapPicker onLocationSelect={handleLocationSelect} style={{ height: "100%", width: "100%", borderRadius: 0 }} />
        {location && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#0d0c22] bg-opacity-80 text-white px-4 py-2 rounded-lg flex items-center space-x-4 shadow-lg"
          >
            <span className="text-lg font-semibold">Lat: {location.lat.toFixed(5)}</span>
            <span className="text-lg font-semibold">Lng: {location.lng.toFixed(5)}</span>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
