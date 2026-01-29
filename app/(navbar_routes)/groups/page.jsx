'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
// import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import { useGetGroupsQuery } from '../../../redux/slices/apiSlice';
import { useTheme } from '../../../contexts/ThemeContext';
// import { useGetGroupsQuery } from '@/redux/slices/apiSlice';

export default function Groups() {
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState([]);
  const { theme } = useTheme();
  const router = useRouter();
  const { data: groupsData, isLoading, error } = useGetGroupsQuery();

  useEffect(() => {
    if (groupsData && groupsData.length > 0) {
      setExpandedCategories(groupsData.map((group) => group.name));
    }
  }, [groupsData]);

  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const expandAll = () => {
    if (groupsData) {
      setExpandedCategories(groupsData.map((group) => group.name));
    }
  };

  const collapseAll = () => {
    setExpandedCategories([]);
  };

  const filteredData = groupsData ? groupsData
    .map((category) => ({
      ...category,
      subcategories: category.subcategories.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
      )
    }))
    .filter((category) => 
      category.subcategories.length > 0 || 
      category.name.toLowerCase().includes(search.toLowerCase())
    ) : [];

  const themeClasses = {
    light: {
      bg: 'bg-gray-50',
      card: 'bg-white',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      border: 'border-gray-200',
      hover: 'hover:bg-gray-50',
      header: 'bg-white',
      search: 'bg-white border-gray-300',
      count: 'bg-gray-100 text-gray-700',
      item: 'hover:bg-gray-50'
    },
    dark: {
      bg: 'bg-gray-900',
      card: 'bg-gray-800',
      text: 'text-gray-100',
      textSecondary: 'text-gray-400',
      border: 'border-gray-700',
      hover: 'hover:bg-gray-750',
      header: 'bg-gray-800',
      search: 'bg-gray-700 border-gray-600',
      count: 'bg-gray-700 text-gray-300',
      item: 'hover:bg-gray-750'
    }
  };

  const t = themeClasses[theme];

  const totalItems = groupsData ? 
    groupsData.reduce((sum, cat) => sum + cat.subcategories.length, 0) : 0;

  if (isLoading) {
    return (
      <div className={`min-h-screen transition-colors ${t.bg} ${t.text}`}>
        <div className="max-w-6xl mx-auto p-4 md:p-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4">Loading vocabulary groups...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen transition-colors ${t.bg} ${t.text}`}>
        <div className="max-w-6xl mx-auto p-4 md:p-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center text-red-500">
              <p>Error loading vocabulary groups. Please try again later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!groupsData || groupsData.length === 0) {
    return (
      <div className={`min-h-screen transition-colors ${t.bg} ${t.text}`}>
        <div className="max-w-6xl mx-auto p-4 md:p-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <p>No vocabulary groups found.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${t.bg} ${t.text}`}>
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Vocabulary Groups</h1>
          </div>

          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search vocabulary..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full p-3 pl-10 rounded-lg border ${t.search} ${t.text}`}
              />
              <div className="absolute left-3 top-3.5">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="text-sm">
              Total Subcategories: <span className="font-semibold">{totalItems}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className={`px-3 py-1 text-sm rounded border ${t.border} ${t.hover}`}
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className={`px-3 py-1 text-sm rounded border ${t.border} ${t.hover}`}
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredData.map((category) => {
            const isExpanded = expandedCategories.includes(category.name);
            
            return (
              <div
                key={category.id}
                className={`rounded-lg ${t.card} border ${t.border} overflow-hidden`}
              >
                <button
                  onClick={() => toggleCategory(category.name)}
                  className={`w-full px-4 py-3 flex items-center justify-between ${t.hover}`}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown size={20} className={t.textSecondary} />
                    ) : (
                      <ChevronRight size={20} className={t.textSecondary} />
                    )}
                    <span className="font-semibold">{category.name}</span>
                    <span className={`px-2 py-1 rounded text-xs ${t.count}`}>
                      {category.subcategories.length} subcategories
                    </span>
                  </div>
                  <div className="text-sm">
                    {category.subcategories.length} items
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
                      {category.subcategories.map((item) => (
                        <div
                          key={item.id}
                          className={`px-3 py-2 rounded ${t.item} transition-colors flex items-center justify-between`}
                        >
   <button 
  onClick={() => router.push(`/groups/subcategory?category=${category.slug}&subcategory=${item.slug}`)} 
  className="font-medium hover:underline"
>
  {item.name}
</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {search && filteredData.length === 0 && (
          <div className="text-center py-12">
            <p className={t.textSecondary}>No vocabulary found matching "{search}"</p>
          </div>
        )}
        
        {!search && filteredData.length > 0 && (
          <div className="text-center py-6 text-sm">
            <p className={t.textSecondary}>Showing all {totalItems} vocabulary items</p>
          </div>
        )}
      </div>
    </div>
  );
}