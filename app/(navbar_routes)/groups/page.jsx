
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetGroupsQuery, useGetProfileQuery, useGetStatsQuery, usePostStatsMutation } from '../../../redux/slices/apiSlice';
import { useTheme } from '../../../contexts/ThemeContext';

export default function Groups() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const { theme } = useTheme();
  const router = useRouter();
  const { data: statsData, isLoading: statsLoading, error: statsError, refetch } = useGetStatsQuery();
  const [postStats] = usePostStatsMutation();
  const { data: profileData } = useGetProfileQuery();
  const { data: groupsData, isLoading: groupsLoading, error: groupsError } = useGetGroupsQuery();

  const isAuthenticated = !!profileData?.email;

  // Use statsData for authenticated users, groupsData for guests
  const displayData = isAuthenticated ? statsData : groupsData;
  const isLoading = isAuthenticated ? statsLoading : groupsLoading;
  const error = isAuthenticated ? statsError : groupsError;

  // Helper: get the unique id from a subcategory (statsData uses subcategory_id, groupsData uses id)
  const getSubId = (item) => item.subcategory_id ?? item.id;
  // Helper: get the unique id from a category (statsData uses category_id, groupsData uses id)
  const getCatId = (cat) => cat.category_id ?? cat.id;




  const isDark = theme === 'dark';

  const handlePostStats = async (id) => {
    const res = await postStats({ subcategory_id: id });
    if (res.data) {
      refetch();
    }
  };

  /* ── derive display data ── */
  const activeCategory =
    selectedCategory === 'all'
      ? { name: 'All', subcategories: displayData ? displayData.flatMap((c) => c.subcategories) : [] }
      : displayData?.find((c) => c.slug === selectedCategory) || { name: '', subcategories: [] };

  const visibleSubs = activeCategory.subcategories.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ── theme tokens ── */
  const bg = isDark ? 'bg-gray-950' : 'bg-[#f0f2f5]';
  const textMain = isDark ? 'text-gray-100' : 'text-gray-800';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const sidebarBg = isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const activePill = 'bg-blue-600 text-white';
  const inactivePill = isDark
    ? 'text-gray-300 hover:bg-gray-700'
    : 'text-gray-600 hover:bg-gray-100';
  const cardBg = isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const divider = isDark ? 'divide-gray-700' : 'divide-gray-100';
  const rowHover = isDark ? 'hover:bg-gray-800' : 'hover:bg-blue-50';

  /* ── column header colors (cycle through categories) ── */
  const HEADER_COLORS = ['text-red-500', 'text-blue-600', 'text-red-500'];

  /* ── loading / error guards ── */
  if (isLoading) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className={`mt-4 ${textMuted}`}>Loading vocabulary groups…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <p className="text-red-500">Error loading vocabulary groups. Please try again later.</p>
      </div>
    );
  }

  if (!displayData || displayData.length === 0) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <p className={textMuted}>No vocabulary groups found.</p>
      </div>
    );
  }

  /* ── When "all" is selected, split subcategories across the real categories ── */
  const isAll = selectedCategory === 'all';

  /* Build columns: if a specific category is selected, split its subs into 3 cols.
     If "all" is selected, each column = one category (up to 3 categories shown). */
  let columns = [];

  if (isAll) {
    // Show each top-level category as its own column (max 3)
    columns = displayData.slice(0, 3).map((cat, i) => ({
      title: cat.name,
      total: cat.subcategories.reduce((sum, s) => sum + (s.total_words ?? 0), 0),
      color: HEADER_COLORS[i] || 'text-blue-600',
      items: cat.subcategories.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      ),
    }));
  } else {
    // Single category → split its subs into 3 equal columns
    const cat = displayData.find((c) => c.slug === selectedCategory);
    const subs = visibleSubs;
    const colSize = Math.ceil(subs.length / 3);
    columns = Array.from({ length: 3 }, (_, i) => ({
      title: i === 0 ? cat?.name ?? '' : '',
      total: i === 0 ? subs.reduce((sum, s) => sum + (s.total_words ?? 0), 0) : null,
      color: HEADER_COLORS[0],
      items: subs.slice(i * colSize, (i + 1) * colSize),
    }));
  }

  return (
    <div className={`min-h-screen ${bg} ${textMain} transition-colors`}>
      <div className="md:max-w-5xl w-full mx-auto px-4 md:pt-24  py-6">

        {/* ── Layout: sidebar + main ── */}
        <div className="flex w-full flex-col md:flex-row gap-4 items-start">

          {/* Sidebar */}
          <div className={`rounded-xl border ${sidebarBg} py-3 px-2 flex flex-row md:flex-col gap-1 w-full md:min-w-[120px] md:w-auto flex-shrink-0 overflow-x-auto whitespace-nowrap scrollbar-hide`}>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${selectedCategory === 'all' ? activePill : inactivePill
                }`}
            >
              All
            </button>
            {displayData.map((cat) => (
              <button
                key={getCatId(cat)}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors text-left ${selectedCategory === cat.slug ? activePill : inactivePill
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Main card — image-style 3-column layout */}
          <div className={`md:flex-1 w-full rounded-xl border ${cardBg} overflow-hidden`}>



            {/* 3-column grid */}
            {columns.every((c) => c.items.length === 0) ? (
              <div className="p-10 text-center">
                <p className={textMuted}>No subcategories found{search ? ` for "${search}"` : ''}.</p>
              </div>
            ) : (
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full border border-gray-200`}>
                {columns.map((col, colIdx) => (
                  <div key={colIdx} className={`flex py-3 flex-col ${colIdx !== 0 ? 'border-t sm:border-t-0 sm:border-l' : ''} ${colIdx === 1 ? 'lg:border-l' : ''} ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>

                    {/* Column header — matches image style */}
                    <div className={`px-5 py-3 border ${isDark ? 'border-gray-700' : 'border-gray-100'} text-center`}>
                      {col.title ? (
                        <span className={`text-base font-bold ${col.color}`}>
                          {col.title}
                          {col.total !== null && (
                            <span className="font-normal text-md ml-1">- {col.total}</span>
                          )}
                        </span>
                      ) : (
                        /* sub-headers for views/score on non-title columns */
                        <span className={`text-xs font-semibold uppercase tracking-wide ${textMuted}`}>&nbsp;</span>
                      )}
                      {/* Views / Score sub-headers */}
                      {
                        profileData?.email && (
                          <div className={`flex justify-end border-t border-gray-200 pt-4  gap-4 mt-1`}>
                            <span className={`text-[11.5px] font-semibold uppercase tracking-wide ${textMuted}`}>Views</span>
                            <span className={`text-[11.5px] font-semibold uppercase tracking-wide ${textMuted}`}>Score</span>
                          </div>
                        )
                      }
                    </div>

                    {/* Rows */}
                    {col.items.map((item) => {
                      const subId = getSubId(item);
                      const scoreDisplay =
                        item.quiz_score !== null && item.quiz_score !== undefined
                          ? `${Math.round(item.quiz_score)}%`
                          : '—';
                      const viewsDisplay = item.views ?? 0;

                      /* find parent category slug for routing */
                      const parentCat =
                        selectedCategory !== 'all'
                          ? displayData.find((c) => c.slug === selectedCategory)
                          : displayData.find((c) =>
                            c.subcategories.some((s) => getSubId(s) === subId)
                          );

                      return (
                        <div
                          key={subId}
                          onClick={() => {
                            if (isAuthenticated) handlePostStats(subId);
                            router.push(
                              `/groups/subcategory?category=${parentCat?.slug ?? ''}&subcategory=${item.slug}`
                            );
                          }}
                          className={`flex items-center justify-between px-5 py-2.5 border cursor-pointer transition-colors ${isDark ? 'border-gray-800' : 'border-gray-200'
                            } ${rowHover}`}
                        >
                          {/* Name - bold blue like image */}
                          <span className="text-md font-extrabold text-blue-600 hover:underline truncate mr-3">
                            {item.name}
                          </span>

                          {/* Views / Score — only for authenticated users */}
                          {isAuthenticated && (
                            <div className="flex items-center gap-4 flex-shrink-0">
                              <span className={`text-sm font-semibold text-right min-w-[28px] ${viewsDisplay > 0 ? 'text-red-500' : textMuted}`}>
                                {viewsDisplay > 0 ? viewsDisplay : '—'}
                              </span>
                              <span className={`text-sm font-semibold text-right min-w-[42px] ${item.quiz_score !== null && item.quiz_score !== undefined
                                ? isDark ? 'text-gray-200' : 'text-gray-700'
                                : textMuted
                                }`}>
                                {scoreDisplay}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer count */}
        <p className={`mt-4 text-xs text-center ${textMuted}`}>
          Showing {visibleSubs.length} subcategor{visibleSubs.length === 1 ? 'y' : 'ies'}
          {selectedCategory !== 'all' ? ` in "${activeCategory.name}"` : ''}
        </p>
      </div>
    </div>
  );
}