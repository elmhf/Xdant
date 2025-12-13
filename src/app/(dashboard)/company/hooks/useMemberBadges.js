import { Badge } from "@/components/ui/badge";

export const useMemberBadges = () => {
  const getStatusBadge = (status) => {
    return status === "Active" ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  const getRoleBadge = (role) => {
    const labels = {
      "full_access": "Full access",
      "clinic_access": "Clinic access",
      "limited_access": "Limited access",
      "assistant_access": "Assistant",
      "dentist": "Dentist",
      "admin": "Admin",
      "owner": "Owner",
      "staff": "Staff",
      "receptionist": "Receptionist",
      "technician": "Technician",
      "Assistant": "Assistant",
      "Hygienist": "Hygienist"
    };

    return (
      <>
        {labels[role] || role}
      </>
    );
  };

  const getRoleColor = (role) => {
    const colors = {
      "dentist": "bg-blue-100 text-blue-800",
      "admin": "bg-purple-100 text-purple-800",
      "Assistant": "bg-orange-100 text-orange-800",
      "Hygienist": "bg-green-100 text-green-800",
      "owner": "bg-indigo-100 text-indigo-800",
      "staff": "bg-gray-100 text-gray-800",
      "receptionist": "bg-pink-100 text-pink-800",
      "technician": "bg-yellow-100 text-yellow-800"
    };

    return colors[role] || "bg-gray-100 text-gray-800";
  };

  return {
    getStatusBadge,
    getRoleBadge,
    getRoleColor
  };
}; 