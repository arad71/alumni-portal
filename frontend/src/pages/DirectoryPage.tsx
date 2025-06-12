import React, { useEffect, useState, useMemo } from 'react';
import {
  Search, Filter, MapPin, Briefcase, GraduationCap, ChevronDown, X,
  User, ChevronLeft, ChevronRight
} from 'lucide-react';

// Example API endpoint, customize as needed
const API_URL = '/api/alumni';

const DirectoryPage: React.FC = () => {
  const [alumni, setAlumni] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    graduationYear: '',
    industry: '',
    location: ''
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch alumni from backend
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      search,
      graduationYear: filters.graduationYear,
      industry: filters.industry,
      location: filters.location,
      page: page.toString()
    });

    fetch(`${API_URL}?${params}`)
      .then(res => res.json())
      .then(data => {
        setAlumni(data.results);
        setTotalPages(data.total_pages);
      })
      .finally(() => setLoading(false));
  }, [search, filters, page]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({ graduationYear: '', industry: '', location: '' });
    setPage(1);
  };

  // Render alumni cards
  const renderAlumniGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {alumni.map(a => (
        <div key={a.id} className="bg-white rounded-xl shadow-md p-6 flex flex-col group hover:shadow-xl transition">
          <div className="flex items-center mb-4">
            {a.avatar ? (
              <img src={a.avatar} alt={a.name} className="w-16 h-16 rounded-full mr-4 border-4 border-blue-100 group-hover:border-blue-400 transition" />
            ) : (
              <div className="w-16 h-16 rounded-full mr-4 bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-2xl">
                {a.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
            )}
            <div>
              <h3 className="font-bold text-lg text-gray-900">{a.name}</h3>
              <p className="text-gray-500">{a.role} at {a.company}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-sm text-gray-500">
            <span className="flex items-center"><GraduationCap size={16} className="mr-2" /> {a.degree}, {a.graduationYear}</span>
            <span className="flex items-center"><Briefcase size={16} className="mr-2" /> {a.industry}</span>
            <span className="flex items-center"><MapPin size={16} className="mr-2" /> {a.location}</span>
          </div>
        </div>
      ))}
    </div>
  );

  // Render alumni list view (table)
  const renderAlumniList = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-xl shadow-md">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Role</th>
            <th className="px-4 py-2 text-left">Industry</th>
            <th className="px-4 py-2 text-left">Location</th>
            <th className="px-4 py-2 text-left">Graduation</th>
          </tr>
        </thead>
        <tbody>
          {alumni.map(a => (
            <tr key={a.id} className="hover:bg-blue-50">
              <td className="px-4 py-2 flex items-center">
                {a.avatar
                  ? <img src={a.avatar} alt={a.name} className="w-8 h-8 rounded-full mr-2" />
                  : <div className="w-8 h-8 rounded-full mr-2 bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      {a.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                }
                <span>{a.name}</span>
              </td>
              <td className="px-4 py-2">{a.role} at {a.company}</td>
              <td className="px-4 py-2">{a.industry}</td>
              <td className="px-4 py-2">{a.location}</td>
              <td className="px-4 py-2">{a.degree}, {a.graduationYear}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Pagination controls
  const renderPagination = () => (
    <div className="flex justify-center items-center mt-8 gap-2">
      <button
        className="p-2 rounded hover:bg-blue-100 transition"
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeft size={20} />
      </button>
      <span className="font-medium text-blue-700">{page}</span>
      <button
        className="p-2 rounded hover:bg-blue-100 transition"
        onClick={() => setPage(page + 1)}
        disabled={page === totalPages}
      >
        <ChevronRight size={20} />
      </button>
      <span className="text-gray-500 ml-2">Page {page} of {totalPages}</span>
    </div>
  );

  // Active filter count
  const activeFilterCount = useMemo(() =>
    Object.values(filters).filter(Boolean).length, [filters]
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-100 to-blue-50">
      {/* Hero/Banner */}
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-blue-700 opacity-70 rounded-b-3xl"></div>
        <div className="relative z-10 py-10 px-6 md:px-16 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">Alumni Directory</h1>
          <p className="mt-3 text-lg text-blue-100 max-w-2xl">
            Connect, network, and grow with our talented alumni community.
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white/90 border-b p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, company, role..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          {/* Filters Button */}
          <button
            className="flex items-center px-4 py-2 border rounded-lg hover:bg-blue-100 transition"
            onClick={() => setFiltersOpen(v => !v)}
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
        {/* Filters dropdown */}
        {filtersOpen && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50 shadow flex flex-col md:flex-row gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Graduation Year</label>
              <input
                className="border rounded px-2 py-1 w-32"
                type="text"
                placeholder="e.g. 2020"
                value={filters.graduationYear}
                onChange={e => handleFilterChange('graduationYear', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Industry</label>
              <input
                className="border rounded px-2 py-1 w-32"
                type="text"
                placeholder="e.g. Finance"
                value={filters.industry}
                onChange={e => handleFilterChange('industry', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Location</label>
              <input
                className="border rounded px-2 py-1 w-32"
                type="text"
                placeholder="e.g. New York"
                value={filters.location}
                onChange={e => handleFilterChange('location', e.target.value)}
              />
            </div>
            <button
              className="self-end px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50 transition"
              onClick={clearFilters}
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Directory Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12 text-blue-600 font-semibold">Loading...</div>
          ) : alumni.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <User size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No alumni found</h3>
              <p className="mt-1 text-gray-500">Try adjusting your search or filters to find more alumni.</p>
              <button
                className="mt-4 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50 transition"
                onClick={clearFilters}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-gray-600">
                  Showing <span className="font-semibold">{alumni.length}</span> alumni
                </p>
              </div>
              {viewMode === 'grid' ? renderAlumniGrid() : renderAlumniList()}
              {renderPagination()}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default DirectoryPage;
