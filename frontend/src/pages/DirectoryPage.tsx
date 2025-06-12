import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, MapPin, Briefcase, GraduationCap, ChevronDown, X,
  User, MessageSquare, ChevronLeft, ChevronRight
} from 'lucide-react';

const AlumniDirectory = () => {
  // ... [state and logic unchanged]

  // Calculate active filter count for display
  const activeFilterCount =
    selectedFilters.graduationYears.length +
    selectedFilters.industries.length +
    selectedFilters.locations.length;

  // Filtered alumni for display (simulate filtering if not present)
  const filteredAlumni = alumni; // Adjust if you want to filter on frontend
  const alumniData = alumni;

  // ... [ConnectionButton and other logic unchanged]

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-100 to-blue-50">
      {/* Hero/Banner Section */}
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-blue-700 opacity-70 rounded-b-3xl"></div>
        <div className="relative z-10 py-10 px-6 md:px-16 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">Alumni Directory</h1>
          <p className="mt-3 text-lg text-blue-100 max-w-2xl">
            Connect, network, and grow with our talented alumni community.
          </p>
        </div>
      </div>

      {/* Search and filter bar */}
      <div className="bg-white/90 border-b p-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
            {/* Search box */}
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, company, role..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Filter button */}
            <div>
              <button
                className="flex items-center justify-center px-4 py-2 border rounded-lg hover:bg-blue-100 transition"
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                <Filter size={18} className="mr-2 text-blue-700" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown size={18} className="ml-2 text-blue-700" />
              </button>
            </div>
            {/* View toggle */}
            <div className="flex border rounded-lg overflow-hidden shadow-sm">
              <button
                className={`px-4 py-2 font-semibold transition ${viewMode === 'grid' ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-600'}`}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </button>
              <button
                className={`px-4 py-2 font-semibold transition ${viewMode === 'list' ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-600'}`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
            </div>
          </div>
          {/* Filter dropdown with animation */}
          <div
            className={`transition-all duration-300 overflow-hidden ${filtersOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
          >
            {filtersOpen && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50 shadow">
                {/* ... [filter controls unchanged, as in your current code] */}
              </div>
            )}
          </div>
          {/* Active filter pills */}
          {/* ... [active filter pills unchanged, as in your current code] */}
        </div>
      </div>

      {/* Directory content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Results count */}
          <div className="mb-4">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{filteredAlumni.length}</span> of{' '}
              <span className="font-semibold">{alumniData.length}</span> alumni
            </p>
          </div>
          {/* Grid view */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAlumni.map(alumni => (
                <div
                  key={alumni.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition group overflow-hidden border border-blue-50"
                >
                  <div className="p-5">
                    <div className="flex items-start">
                      {alumni.avatar ? (
                        <img
                          src={alumni.avatar}
                          alt={alumni.name}
                          className="w-16 h-16 rounded-full mr-4 border-4 border-blue-100 group-hover:border-blue-400 transition"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full mr-4 bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-2xl">
                          {alumni.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                      )}
                      <div className="flex-grow">
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition">
                          {alumni.name}
                        </h3>
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
          {/* ... [list view table unchanged, but you can add hover:bg-blue-50 to <tr>] */}
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
                className="mt-4 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50 transition"
                onClick={clearFilters}
              >
                Clear all filters
              </button>
            </div>
          )}
          {/* Pagination */}
          <div className="flex justify-center items-center mt-8 gap-2">
            <button
              className="p-2 rounded hover:bg-blue-100 transition"
              onClick={() => goToPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={20} />
            </button>
            <span className="font-medium text-blue-700">{currentPage}</span>
            <button
              className="p-2 rounded hover:bg-blue-100 transition"
              onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={20} />
            </button>
            <span className="text-gray-500 ml-2">Page {currentPage} of {totalPages}</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AlumniDirectory;
