import React from "react";

const PaginationButtons = ({
    currentPage = 1,
    totalPages = 10,
    onPageChange,
}) => {
    const getPages = () => {
        const pages = [];

        if (totalPages <= 12) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
            return pages;
        }

        // Always show the first 10 pages
        if (currentPage <= 8) {
            for (let i = 1; i <= 10; i++) pages.push(i);
            pages.push("...");
            pages.push(totalPages - 1);
            pages.push(totalPages);
            return pages;
        }

        // If near the end
        if (currentPage > totalPages - 8) {
            pages.push(1);
            pages.push(2);
            pages.push("...");
            for (let i = totalPages - 9; i <= totalPages; i++) pages.push(i);
            return pages;
        }

        // In the middle
        pages.push(1);
        pages.push(2);
        pages.push("...");
        for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages - 1);
        pages.push(totalPages);

        return pages;
    };

    const pages = getPages();

    return (
        <div className="flex items-center gap-2 text-sm">
            {/* Prev */}
            <button
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-40"
                disabled={currentPage === 1}
            >
                &lt;
            </button>

            {/* Pages */}
            {pages.map((page, index) =>
                page === "..." ? (
                    <span key={index} className="px-2">
                        ...
                    </span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`px-3 py-1 border rounded-md transition
              ${currentPage === page
                                ? "bg-blue-600 text-white border-blue-600"
                                : "hover:bg-gray-100"
                            }`}
                    >
                        {page}
                    </button>
                )
            )}

            {/* Next */}
            <button
                onClick={() =>
                    currentPage < totalPages && onPageChange(currentPage + 1)
                }
                className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-40"
                disabled={currentPage === totalPages}
            >
                &gt;
            </button>
        </div>
    );
};

export default PaginationButtons;