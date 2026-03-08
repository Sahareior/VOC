"use client";

import React, { useMemo } from "react";
import { useGetStatsQuery } from "../../redux/slices/apiSlice";
import {
  BarChart3,
  Layers,
  LayoutGrid,
  Eye,
  Clock,
  CheckCircle2,
  TrendingUp,
  ChevronRight,
  X,
} from "lucide-react";

const Dashboard = () => {
  const { data, isLoading, error } = useGetStatsQuery();

  // Data processing
  const flattenedData = useMemo(() => {
    return (
      data?.flatMap((category) =>
        category.subcategories.map((subcategory) => ({
          ...subcategory,
          parentCategory: category.name,
          parentCategoryId: category.category_id,
          parentSlug: category.slug,
        })),
      ) || []
    );
  }, [data]);

  const sortedByViews = useMemo(() => {
    return [...flattenedData].sort((a, b) => b.views - a.views);
  }, [flattenedData]);

  const totalViews = useMemo(() => {
    return flattenedData.reduce((sum, item) => sum + item.views, 0);
  }, [flattenedData]);

  if (isLoading) {
    return (
      <div className="flex h-screen justify-center items-center bg-gradient-to-br from-rose-50 via-red-50 to-orange-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-500 rounded-full animate-spin"></div>
          <p className="text-xl font-medium text-slate-600 animate-pulse">
            Loading dashboard stats...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen justify-center items-center bg-rose-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center gap-4 max-w-md text-center">
          <div className="p-4 bg-red-100 rounded-full text-red-600">
            <X size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Oops! Something went wrong
          </h2>
          <p className="text-slate-600">
            We couldn't load your dashboard stats. Please try refreshing the
            page or contact support.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition shadow-lg shadow-red-200"
          >
            Retry Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-red-50 to-orange-50 pb-20">
      {/* Header Section */}
      <div className="bg-white/40 backdrop-blur-md border-b border-white/40 mb-8 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Learning Dashboard
            </h1>
            <p className="text-slate-600 mt-1">
              Track your progress and popular learning categories
            </p>
          </div>
          <div className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl text-white shadow-lg shadow-red-200 flex items-center gap-3 w-fit">
            <TrendingUp size={20} />
            <span className="font-bold">Last update: today</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Categories"
            value={data?.length || 0}
            icon={<LayoutGrid className="text-blue-500" />}
            description="Main knowledge areas"
            color="indigo"
          />
          <StatCard
            title="Subcategories"
            value={flattenedData.length}
            icon={<Layers className="text-orange-500" />}
            description="Specific topics covered"
            color="orange"
          />
          <StatCard
            title="Total Views"
            value={totalViews}
            icon={<Eye className="text-green-500" />}
            description="Overall engagement"
            color="emerald"
          />
        </div>

        {/* Global Stats Table */}
        <section>
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
              <BarChart3 size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Most Viewed Topics
            </h2>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Subcategory
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Last Interaction
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Content
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedByViews.slice(0, 10).map((item) => (
                  <tr
                    key={`${item.parentCategoryId}-${item.subcategory_id}`}
                    className="hover:bg-slate-50/50 transition duration-200"
                  >
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                        {item.parentCategory}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                          <div
                            className="h-full bg-red-500 rounded-full"
                            style={{
                              width: `${Math.min(100, (item.views / (totalViews || 1)) * 500)}%`,
                            }}
                          ></div>
                        </div>
                        <span className="font-bold text-slate-700">
                          {item.views}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock size={14} />
                        {item.last_viewed
                          ? new Date(item.last_viewed).toLocaleDateString()
                          : "Never"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      {item.total_words} words
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Grouped by Category */}
        <section>
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
              <LayoutGrid size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Category Breakdown
            </h2>
          </div>

          <div className="space-y-10">
            {data?.map((category) => (
              <div
                key={category.category_id}
                className="bg-white/60 backdrop-blur-sm rounded-[2rem] p-6 lg:p-8 border border-white/60 shadow-lg shadow-slate-100"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                      {category.name}
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">
                      {category.subcategories.length} Topics total
                    </p>
                  </div>
                  <div className="flex items-center gap-4 py-2 px-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <div className="text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-400">
                        Total Views
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {category.subcategories.reduce(
                          (sum, sub) => sum + sub.views,
                          0,
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.subcategories.map((sub) => (
                    <div
                      key={sub.subcategory_id}
                      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-red-200 transition group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-slate-800 text-lg group-hover:text-red-500 transition">
                          {sub.name}
                        </h4>
                       
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">
                            Words
                          </span>
                          <span className="font-bold text-slate-700">
                            {sub.total_words}
                          </span>
                        </div>
                        <div className="flex flex-col text-center">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">
                            Quiz
                          </span>
                          <span
                            className={`font-bold ${sub.quiz_score ? "text-green-600" : "text-slate-300"}`}
                          >
                            {sub.quiz_score !== null
                              ? `${sub.quiz_score}%`
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">
                            Viewed
                          </span>
                          <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                            <Eye size={14} className="text-red-400" />
                            {sub.views}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ title, value, icon, description, color }) => {
  const colorMap = {
    indigo: "border-blue-100 bg-blue-50/50",
    orange: "border-orange-100 bg-orange-50/50",
    emerald: "border-emerald-100 bg-emerald-50/50",
  };

  return (
    <div
      className={`p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition duration-300 group`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            {title}
          </p>
          <h3 className="text-4xl font-extrabold text-slate-900 mt-2 tracking-tight">
            {value}
          </h3>
          <p className="text-sm text-slate-500 mt-2 flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-green-500" />
            {description}
          </p>
        </div>
        <div
          className={`p-4 bg-slate-50 rounded-2xl group-hover:scale-110 group-hover:rotate-6 transition duration-300`}
        >
          {React.cloneElement(icon, { size: 28 })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
