import { SearchBarProps } from '../types';

export function SearchBar({
  searchTerm,
  setSearchTerm,
  onSearch,
  onClear
}: SearchBarProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
      <form onSubmit={onSearch} className="flex gap-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search medicines by name, generic name, or brand..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Search
        </button>
        {searchTerm && (
          <button
            type="button"
            onClick={onClear}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Clear
          </button>
        )}
      </form>
    </div>
  );
}
