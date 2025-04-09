import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, MapPin, Briefcase, GraduationCap, ChevronDown, X, User, MessageSquare, RefreshCcw, ChevronLeft, ChevronRight } from 'lucide-react';

const AlumniDirectory = () => {
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    graduationYears: [],
    industries: [],
    locations: [],
  });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Data state
  const [alumni, setAlumni] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    graduationYears: [],
    industries: [],
    locations: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const recordsPerPage = 9;
  
  // Function to fetch filter options from backend
  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/alumni/filter-options');
      if (!response.ok) throw new Error('Failed to fetch filter options');
      const data = await response.json();
      setFilterOptions(data);
    } catch (err) {
      console.error('Error fetching filter options:', err);
      // Use fallback options if API fails
      setFilterOptions({
        graduationYears: ['2017', '2018', '2019', '2020', '2021', '2022'],
        industries: ['Technology', 'Finance', 'Marketing', 'Healthcare', 'Manufacturing', 'Legal', 'Biotechnology', 'Consulting', 'Architecture'],
        locations: ['Seattle, WA', 'New York, NY', 'Chicago, IL', 'Rochester, MN', 'Fremont, CA', 'Boston, MA', 'San Francisco, CA', 'Dallas, TX', 'London, UK']
      });
    }
  };
  
  // Function to fetch alumni data from backend
  const fetchAlumni = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query params from filters and search
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedFilters.graduationYears.length > 0) {
        selectedFilters.graduationYears.forEach(year => params.append('gradYear', year));
      }
      if (selectedFilters.industries.length > 0) {
        selectedFilters.industries.forEach(industry => params.append('industry', industry));
      }
      if (selectedFilters.locations.length > 0) {
        selectedFilters.locations.forEach(location => params.append('location', location));
      }
      params.append('page', currentPage.toString());
      params.append('limit', recordsPerPage.toString());
      
      const response = await fetch(`/api/alumni?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch alumni data');
      
      const data = await response.json();
      setAlumni(data.alumni);
      setTotalPages(data.totalPages);
      setTotalRecords(data.totalRecords);
    } catch (err) {
      console.error('Error fetching alumni:', err);
      setError(err.message);
      setAlumni([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedFilters, currentPage, recordsPerPage]);
  
  // Load data on component mount and when dependencies change
  useEffect(() => {
    fetchFilterOptions();
  }, []);
  
  useEffect(() => {
    fetchAlumni();
  }, [fetchAlumni]);
  
  // Connect with alumni function
  const connectWithAlumni = async (alumniId) => {
    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alumniId }),
      });
      
      if (!response.ok) throw new Error('Failed to send connection request');
      
      // Update the alumni in state to show pending status
      setAlumni(prevAlumni => 
        prevAlumni.map(alum => 
          alum.id === alumniId ? { ...alum, connectionStatus: 'pending' } : alum
        )
      );
      
    } catch (err) {
      console.error('Error connecting with alumni:', err);
      alert('Failed to send connection request. Please try again later.');
    }
  };
  
  // Handle filter selection
  const toggleFilter = (category, value) => {
    setSelectedFilters(prev => {
      const current = [...prev[category]];
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [category]: [...current, value] };
      }
    });
    // Reset to first page when filters change
    setCurrentPage(1);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedFilters({
      graduationYears: [],
      industries: [],
      locations: [],
    });
    setCurrentPage(1);
  };
  
  // Remove a specific filter
  const removeFilter = (category, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item !== value)
    }));
    setCurrentPage(1);
  };
  
  // Page navigation
  const goToPage = (page) => {
    setCurrentPage(page);
  };
  
  // Connection button based on status
  const ConnectionButton = ({ status, alumniId }) => {
    if (status === 'connected') {
      return (
        <button className="flex items-center text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded text-sm">
          <MessageSquare size={16} className="mr-1" />
          Message
        </button>
      );
    } else if (status === 'pending') {
      return (
        <button className="text-gray-600 bg-gray-100 px-3 py-1 rounded text-sm cursor-default">
          Request Pending
        </button>
      );
    } else {
      return (
        <button className="flex items-center text-blue-700 border border-blue-700 hover:bg-blue-50 px-3 py-1 rounded text-sm">
          <User size={16} className="mr-1" />
          Connect
        </button>
      );
    }
  };
  
="flex flex-col h-screen bg-gray-100">
      {/* Main header - would typically include navigation */}
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-gray-800">Alumni Directory</h1>
      </header>
      
      {/* Search and filter bar */}
      <div className="bg-white border-b p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
            {/* Search box */}
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, company, role..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Filter button */}
            <div>
              <button 
                className="flex items-center justify-center px-4 py-2 border rounded-lg hover:bg-gray-50"
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                <Filter size={18} className="mr-2 text-gray-600" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown size={18} className="ml-2 text-gray-600" />
              </button>
            </div>
            
            {/* View toggle */}
            <div className="flex border rounded-lg overflow-hidden">
              <button 
                className={`px-4 py-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-600'}`}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </button>
              <button 
                className={`px-4 py-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-600'}`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
            </div>
          </div>
          
          {/* Filter dropdown */}
          {filtersOpen && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Filters</h3>
                <button 
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={clearFilters}
                >
                  Clear all filters
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Graduation Year Filter */}
                <div>
                  <h4 className="font-medium mb-2 text-gray-700">Graduation Year</h4>
                  <div className="space-y-2">
                    {filterOptions.graduationYears.map(year => (
                      <label key={year} className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="mr-2 h-4 w-4 text-blue-600"
                          checked={selectedFilters.graduationYears.includes(year)}
                          onChange={() => toggleFilter('graduationYears', year)}
                        />
                        <span>{year}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Industry Filter */}
                <div>
                  <h4 className="font-medium mb-2 text-gray-700">Industry</h4>
                  <div className="space-y-2">
                    {filterOptions.industries.map(industry => (
                      <label key={industry} className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="mr-2 h-4 w-4 text-blue-600"
                          checked={selectedFilters.industries.includes(industry)}
                          onChange={() => toggleFilter('industries', industry)}
                        />
                        <span>{industry}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Location Filter */}
                <div>
                  <h4 className="font-medium mb-2 text-gray-700">Location</h4>
                  <div className="space-y-2">
                    {filterOptions.locations.map(location => (
                      <label key={location} className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="mr-2 h-4 w-4 text-blue-600"
                          checked={selectedFilters.locations.includes(location)}
                          onChange={() => toggleFilter('locations', location)}
                        />
                        <span>{location}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Active filters */}
          {activeFilterCount > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedFilters.graduationYears.map(year => (
                <div key={year} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center">
                  <GraduationCap size={14} className="mr-1" />
                  {year}
                  <button 
                    onClick={() => removeFilter('graduationYears', year)}
                    className="ml-1 p-0.5 hover:bg-blue-100 rounded-full"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              {selectedFilters.industries.map(industry => (
                <div key={industry} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center">
                  <Briefcase size={14} className="mr-1" />
                  {industry}
                  <button 
                    onClick={() => removeFilter('industries', industry)}
                    className="ml-1 p-0.5 hover:bg-blue-100 rounded-full"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              {selectedFilters.locations.map(location => (
                <div key={location} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center">
                  <MapPin size={14} className="mr-1" />
                  {location}
                  <button 
                    onClick={() => removeFilter('locations', location)}
                    className="ml-1 p-0.5 hover:bg-blue-100 rounded-full"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Directory content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Results count */}
          <div className="mb-4">
            <p className="text-gray-600">
              Showing {filteredAlumni.length} of {alumniData.length} alumni
            </p>
          </div>
          
          {/* Grid view */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAlumni.map(alumni => (
                <div key={alumni.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start">
                      <img 
                        src={alumni.avatar} 
                        alt={alumni.name} 
                        className="w-16 h-16 rounded-full mr-4"
                      />
                      <div className="flex-grow">
                        <h3 className="font-bold text-lg">{alumni.name}</h3>
                        <p className="text-gray-600">{alumni.role} at {alumni.company}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <GraduationCap size={16} className="mr-2" />
                        {alumni.degree}, Class of {alumni.graduationYear}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Briefcase size={16} className="mr-2" />
                        {alumni.industry}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin size={16} className="mr-2" />
                        {alumni.location}
                      </div>
                    </div>
                    
                    <div className="mt-5 flex justify-end">
                      <ConnectionButton status={alumni.connectionStatus} alumniId={alumni.id} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* List view */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Graduation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Connect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAlumni.map(alumni => (
                    <tr key={alumni.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img src={alumni.avatar} alt={alumni.name} className="h-10 w-10 rounded-full" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{alumni.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Class of {alumni.graduationYear}</div>
                        <div className="text-xs text-gray-500">{alumni.degree}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{alumni.industry}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{alumni.role}</div>
                        <div className="text-xs text-gray-500">{alumni.company}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {alumni.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <ConnectionButton status={alumni.connectionStatus} alumniId={alumni.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Empty state */}
          {filteredAlumni.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <User size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No alumni found</h3>
              <p className="mt-1 text-gray-500">
                Try adjusting your search or filters to find more alumni.
              </p>
              <button 
                className="mt-4 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={clearFilters}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AlumniDirectory;
