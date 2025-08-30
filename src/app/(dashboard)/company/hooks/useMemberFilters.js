import { useState, useMemo } from 'react';

export const useMemberFilters = (members) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [sorting, setSorting] = useState({});

  // Filter and search functionality
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = filterRole === "all" || member.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [members, searchQuery, filterRole]);

  // Sort functionality
  const sortedMembers = useMemo(() => {
    if (!sorting.column) return filteredMembers;

    return [...filteredMembers].sort((a, b) => {
      const aValue = a[sorting.column];
      const bValue = b[sorting.column];

      if (sorting.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredMembers, sorting]);

  const handleSort = (column) => {
    setSorting(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterRole("all");
    setSorting({});
  };

  return {
    searchQuery,
    setSearchQuery,
    filterRole,
    setFilterRole,
    sorting,
    handleSort,
    filteredMembers: sortedMembers,
    clearFilters,
    hasActiveFilters: searchQuery || filterRole !== "all" || sorting.column
  };
}; 