"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { reverseGeocode } from "./utils/reverseGeocode";

const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ClinicDetails({ onNext, isFirstStep, isLastStep }) {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState({
    street_address: "",
    neighbourhood: "",
    city: "",
    postal_code: "",
    country: "",
  });
  const [clinicName, setClinicName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleLocationSelect = async (pos) => {
    setLocation(pos);
    try {
      const fullAddress = await reverseGeocode(pos.lat, pos.lng);
      setAddress({
        street_address: fullAddress.road || "",
        neighbourhood: fullAddress.suburb || "",
        city: fullAddress.city || "",
        postal_code: fullAddress.postcode || fullAddress.postal_code || "",
        country: fullAddress.country || "",
      });
    } catch (err) {
      setAddress({
        street_address: "",
        neighbourhood: "",
        city: "",
        postal_code: "",
        country: "",
      });
      console.error("Failed to fetch address", err);
    }
  };

  const handleAddressChange = (e) => {
    const { id, value } = e.target;
    setAddress((prev) => ({ ...prev, [id]: value }));
  };

  const handleNext = async () => {
    setError("");
    setEmailError("");
    if (!email) {
      setEmailError("L'e-mail est requis.");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("Adresse e-mail invalide.");
      return;
    }
    setSaving(true);
    // Gather all data
    const clinicData = {
      clinic_name: clinicName,
      street_address: address.street_address,
      neighbourhood: address.neighbourhood,
      city: address.city,
      postal_code: address.postal_code,
      country: address.country,
      phone,
      email,
    };
    onNext(clinicData);
    setSaving(false);
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

          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <Label htmlFor="clinic_name" className="font-semibold">Clinic Name</Label>
              <Input id="clinic_name" type="text" placeholder="Clinic name" className="w-full border border-gray-300 rounded-lg bg-white px-4 py-2 text-gray-900 placeholder-gray-400" value={clinicName} onChange={e => setClinicName(e.target.value)} />
            </motion.div>

            {/* Auto-filled address fields */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <Label htmlFor="street_address" className="font-semibold">Street Address</Label>
              <Input id="street_address" value={address.street_address} onChange={handleAddressChange} placeholder="Street" className="w-full border border-gray-300 rounded-lg bg-white px-4 py-2 text-gray-900 placeholder-gray-400" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex space-x-4"
            >
              <div className="flex-1 space-y-2">
                <Label htmlFor="neighbourhood" className="font-semibold">Neighbourhood</Label>
                <Input id="neighbourhood" value={address.neighbourhood} onChange={handleAddressChange} placeholder="Neighbourhood" className="w-full border border-gray-300 rounded-lg bg-white px-4 py-2 text-gray-900 placeholder-gray-400" />
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
                <Label htmlFor="postal_code" className="font-semibold">Postal Code</Label>
                <Input id="postal_code" value={address.postal_code} onChange={handleAddressChange} placeholder="Postal Code" className="w-full border border-gray-300 rounded-lg bg-white px-4 py-2 text-gray-900 placeholder-gray-400" />
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
              <Input id="phone" type="tel" placeholder="Phone number" className="w-full border border-gray-300 rounded-lg bg-white px-4 py-2 text-gray-900 placeholder-gray-400" value={phone} onChange={e => setPhone(e.target.value)} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-2"
            >
              <Label htmlFor="email" className="font-semibold">Email</Label>
              <Input id="email" type="email" placeholder="you@clinic.com" className="w-full border border-gray-300 rounded-lg bg-white px-4 py-2 text-gray-900 placeholder-gray-400" value={email} onChange={e => setEmail(e.target.value)} />
              {emailError && <div className="text-red-600 text-xs mt-1">{emailError}</div>}
            </motion.div>

            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex justify-end mt-8"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                type="button"
                className="px-6 py-2 rounded-full bg-black text-white font-semibold hover:bg-gray-900 transition"
                disabled={saving}
              >
                {saving ? "Envoi..." : "Next step"}
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
            className="absolute top-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-80 text-white px-4 py-2 rounded-lg flex items-center space-x-4 shadow-lg"
          >
            <span className="text-lg font-semibold">Lat: {location?.lat?.toFixed(5)}</span>
            <span className="text-lg font-semibold">Lng: {location?.lng?.toFixed(5)}</span>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
