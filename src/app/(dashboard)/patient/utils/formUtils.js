// Form validation and utility functions
export const validatePatientForm = (formData) => {
  const errors = [];

  // Required fields validation
  if (!formData.first_name?.trim()) {
    errors.push("First name is required");
  }
  
  if (!formData.last_name?.trim()) {
    errors.push("Last name is required");
  }
  
  if (!formData.gender) {
    errors.push("Gender is required");
  }
  
  if (!formData.date_of_birth) {
    errors.push("Date of birth is required");
  }

  // Treating doctors validation (required)
  if (!formData.treating_doctors || formData.treating_doctors.length === 0) {
    errors.push("At least one treating doctor is required");
  }

  // Email validation (optional but if provided, must be valid)
  if (formData.email?.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.push("Invalid email format");
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getInitialFormData = () => ({
  first_name: "",
  last_name: "",
  gender: "",
  date_of_birth: "",
  email: "",
  phone: "",
  address: "",
  treating_doctors: []
});

export const resetFormData = (setFormData, setFormError, setFormSuccess) => {
  setFormData(getInitialFormData());
  setFormError("");
  setFormSuccess("");
};

export const preparePatientDataForAPI = (formData, currentClinic, currentUser) => {
  // Convert treating_doctors array to treating_doctor_id array
  const treating_doctor_ids = formData.treating_doctors.map(doctor => doctor.id);

  return {
    first_name: formData.first_name,
    last_name: formData.last_name,
    gender: formData.gender,
    date_of_birth: formData.date_of_birth,
    email: formData.email || "",
    phone: formData.phone || "",
    address: formData.address || "",
    clinicId: currentClinic?.id,
    treating_doctor_id: treating_doctor_ids
  };
}; 