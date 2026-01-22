'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';

const groupData = [
  {
    category: 'Good',
    total: 902,
    items: [
      { name: 'Beautiful', count: 50 },
      { name: 'Big', count: 61 },
      { name: 'Brave', count: 19 },
      { name: 'Busy', count: 27 },
      { name: 'Calm', count: 57 },
      { name: 'Energy', count: 52 },
      { name: 'Exciting', count: 52 },
      { name: 'Flexible', count: 53 },
      { name: 'Friendly', count: 78 },
      { name: 'Good', count: 42 },
      { name: 'Happy', count: 43 },
      { name: 'Important', count: 28 },
      { name: 'Love', count: 40 },
      { name: 'New', count: 28 },
      { name: 'Pleasure', count: 48 },
      { name: 'Smart', count: 62 },
      { name: 'Smart-Adj', count: 45 },
      { name: 'Strong', count: 69 },
      { name: 'Successful', count: 45 },
    ]
  },
  {
    category: 'Bad',
    total: 1578,
    items: [
      { name: 'Afraid', count: 26 },
      { name: 'Aggressive', count: 72 },
      { name: 'Angry', count: 36 },
      { name: 'Attack', count: 71 },
      { name: 'Bad', count: 68 },
      { name: 'Boring', count: 16 },
      { name: 'Confused', count: 45 },
      { name: 'Crazy', count: 26 },
      { name: 'Dangerous', count: 72 },
      { name: 'Delay', count: 31 },
      { name: 'Dirty', count: 27 },
      { name: 'Disgusting', count: 60 },
      { name: 'Dishonest', count: 72 },
      { name: 'Dislike', count: 22 },
      { name: 'Disorganized', count: 65 },
      { name: 'Hostile', count: 74 },
      { name: 'Hurt', count: 46 },
      { name: 'Mistake', count: 45 },
      { name: 'Nervous', count: 26 },
      { name: 'Old', count: 27 },
      { name: 'Pain', count: 34 },
      { name: 'Powerless', count: 44 },
      { name: 'Small', count: 76 },
      { name: 'Steal', count: 27 },
      { name: 'Strange', count: 78 },
      { name: 'Stupid', count: 67 },
      { name: 'Uncomfortable', count: 42 },
      { name: 'Unfriendly', count: 76 },
      { name: 'Unhappy', count: 72 },
      { name: 'War', count: 58 },
      { name: 'Weak', count: 77 },
    ]
  },
  {
    category: 'Other',
    total: 733,
    items: [
      { name: 'Body', count: 71 },
      { name: 'Desire', count: 22 },
      { name: 'Entice', count: 22 },
      { name: 'Fast', count: 39 },
      { name: 'Inward', count: 71 },
      { name: 'Light', count: 42 },
      { name: 'Move', count: 78 },
      { name: 'Other', count: 62 },
      { name: 'Shape', count: 74 },
      { name: 'Slowly', count: 29 },
      { name: 'Sound', count: 68 },
      { name: 'Squeeze', count: 16 },
      { name: 'Stop', count: 22 },
      { name: 'Surprise', count: 19 },
      { name: 'Up+Down', count: 37 },
      { name: 'Wet', count: 59 },
    ]
  }
];

export default function Groups() {
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Good', 'Bad', 'Other']);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter()



  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const expandAll = () => {
    setExpandedCategories(groupData.map(g => g.category));
  };

  const collapseAll = () => {
    setExpandedCategories([]);
  };

  const filteredData = groupData.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(category => 
    category.items.length > 0 || 
    category.category.toLowerCase().includes(search.toLowerCase())
  );

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

  return (
    <div className={`min-h-screen transition-colors ${t.bg} ${t.text}`}>
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Vocabulary Groups</h1>

          </div>

          {/* Search */}
        

          {/* Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm">
              Total Words: <span className="font-semibold">
                {groupData.reduce((sum, cat) => sum + cat.total, 0)}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="px-3 py-1 text-sm rounded border"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-1 text-sm rounded border"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {filteredData.map((category) => {
            const isExpanded = expandedCategories.includes(category.category);
            
            return (
              <div
                key={category.category}
                className={`rounded-lg ${t.card} border ${t.border} overflow-hidden`}
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.category)}
                  className={`w-full px-4 py-3 flex items-center justify-between ${t.hover}`}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown size={20} className={t.textSecondary} />
                    ) : (
                      <ChevronRight size={20} className={t.textSecondary} />
                    )}
                    <span className="font-semibold">{category.category}</span>
                    <span className={`px-2 py-1 rounded text-xs ${t.count}`}>
                      {category.total} words
                    </span>
                  </div>
                  <div className="text-sm">
                    {category.items.length} items
                  </div>
                </button>

                {/* Items List */}
                {isExpanded && (
                  <div className="px-4 pb-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
                      {category.items.map((item) => (
                        <div
                          key={item.name}
                          className={`px-3 py-2 rounded ${t.item} transition-colors flex items-center justify-between`}
                        >
                          <button onClick={()=> router.push('/groups/3')} className="font-medium">{item.name}</button >
                          <span className={`px-2 py-1 rounded text-sm ${t.count}`}>
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <p className={t.textSecondary}>No vocabulary found matching "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}