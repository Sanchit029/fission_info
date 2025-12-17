import { FiSearch } from 'react-icons/fi';

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'conference', label: 'Conference' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'concert', label: 'Concert' },
  { value: 'sports', label: 'Sports' },
  { value: 'party', label: 'Party' },
  { value: 'other', label: 'Other' },
];

const sortOptions = [
  { value: 'date', label: 'Date (Upcoming)' },
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
];

const EventFilters = ({ filters, onChange }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 md:p-6 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="label">Search Events</label>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title..."
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="label">Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="input"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="label">From Date</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleChange('dateFrom', e.target.value)}
            className="input"
          />
        </div>

        {/* Sort */}
        <div>
          <label className="label">Sort By</label>
          <select
            value={filters.sort}
            onChange={(e) => handleChange('sort', e.target.value)}
            className="input"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear Filters */}
      {(filters.search || filters.category !== 'all' || filters.dateFrom || filters.sort !== 'date') && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onChange({ search: '', category: 'all', dateFrom: '', sort: 'date' })}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default EventFilters;
