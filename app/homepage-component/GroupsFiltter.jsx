import React, { useState } from 'react';
import { useGetGroupsQuery, useLazyGetWordsByGroupsQuery } from '../../redux/slices/apiSlice';
import { useTheme } from '../../contexts/ThemeContext';

const GroupsFilter = ({setGroupsData}) => {
    const { data } = useGetGroupsQuery();
    const [trigger] = useLazyGetWordsByGroupsQuery();
    const [activeGroup, setActiveGroup] = useState(null);
    const [activeSubcategory, setActiveSubcategory] = useState(null);
    const { theme } = useTheme();

    const isDark = theme === 'dark';
    
    const toggleGroup = (groupId) => {
        const newActiveGroup = activeGroup === groupId ? null : groupId;
        setActiveGroup(newActiveGroup);
        
    
        if (newActiveGroup === null) {
            setActiveSubcategory(null);
            setGroupsData([]);
        }
    };

    const handleSubcategoryClick = async (groupSlug, subcategorySlug, subcategoryName) => {

        const isSameSubcategory = activeSubcategory?.groupSlug === groupSlug && 
                                   activeSubcategory?.subcategorySlug === subcategorySlug;
        
        if (isSameSubcategory) {
   
            setActiveSubcategory(null);
            setGroupsData([]);
       
            return;
        }

    
        setActiveSubcategory({
            groupSlug,
            subcategorySlug,
            subcategoryName
        });

  
        
        try {
            const result = await trigger({
                groups: groupSlug,
                subcategory: subcategorySlug
            });
            
            
            setGroupsData(result?.data || []);
        } catch (error) {
           
            setGroupsData([]);
        }
    };



    return (
        <div className="w-full">


            <div className="flex flex-wrap gap-3 mb-4">
                {data?.map((group) => (
                    <button
                        key={group.id}
                        onClick={() => toggleGroup(group.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            activeGroup === group.id
                                ? isDark
                                    ? 'bg-red-700 text-white shadow-md shadow-red-900/50'
                                    : 'bg-red-600 text-white shadow-md'
                                : isDark
                                    ? 'bg-gray-800 text-gray-200 hover:bg-gray-700 border border-gray-700'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {group.name}
                        <span className="ml-2 text-sm opacity-75">
                            ({group.subcategories?.length || 0})
                        </span>
                    </button>
                ))}
            </div>

            {/* Accordion Content */}
            {data?.map((group) => (
                <div
                    key={group.id}
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        activeGroup === group.id
                            ? 'max-h-96 opacity-80 mb-4'
                            : 'max-h-0 opacity-0'
                    }`}
                >
                    <div className={`rounded-lg shadow-sm p-4 border ${
                        isDark
                            ? 'bg-gray-800 border-gray-700'
                            : 'bg-white border-gray-200'
                    }`}>
                        <div className="flex items-center justify-between mb-3">

                            <span className={`text-sm text-right ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {group.subcategories?.length || 0} items
                            </span>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <div className="flex gap-2 pb-3 min-w-max">
                                {group.subcategories?.map((subcategory) => {
                                    const isActive = activeSubcategory?.groupSlug === group.slug && 
                                                    activeSubcategory?.subcategorySlug === subcategory.slug;
                                    
                                    return (
                                        <button
                                            key={subcategory.id}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150 border ${
                                                isActive
                                                    ? isDark
                                                        ? 'bg-red-700 text-white border-red-600 shadow-md shadow-red-900/50'
                                                        : 'bg-red-600 text-white border-red-600 shadow-md'
                                                    : isDark
                                                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600 hover:border-gray-500'
                                                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 hover:border-gray-300'
                                            }`}
                                            onClick={() => handleSubcategoryClick(group.slug, subcategory.slug, subcategory.name)}
                                        >
                                            {subcategory.name}
                                            {isActive && (
                                                <span className="ml-1.5">✓</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        

                    </div>
                </div>
            ))}
        </div>
    );
};

export default GroupsFilter;