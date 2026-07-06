import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (count: number) => void;
  allowedSizes?: number[];
  variant?: 'table' | 'card';
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  allowedSizes = [5, 10, 20, 50],
  variant = 'card'
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const handleFirst = () => {
    onPageChange(1);
  };

  const handleLast = () => {
    onPageChange(totalPages);
  };

  // Generate numbered buttons
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  const containerClasses = variant === 'table'
    ? "flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-5 py-4 border-t border-slate-100/80 rounded-b-xl text-xs font-semibold text-slate-500"
    : "flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-5 py-4 border border-slate-200/80 rounded-xl shadow-sm text-xs font-semibold text-slate-500 mt-6";

  return (
    <div className={containerClasses}>
      {/* Items status */}
      <div className="flex items-center gap-2">
        <span>Hiển thị</span>
        <span className="text-slate-900 font-bold font-mono">
          {totalItems === 0 ? 0 : startIndex} - {endIndex}
        </span>
        <span>trong số</span>
        <span className="text-slate-900 font-bold font-mono">{totalItems}</span>
        <span>mục</span>

        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5 ml-4 border-l border-slate-200 pl-4">
            <span className="text-[11px] font-medium text-slate-400">Số hàng:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                onItemsPerPageChange(Number(e.target.value));
                onPageChange(1); // Reset to first page
              }}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-[11px] font-bold rounded-md px-2 py-1 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors"
            >
              {allowedSizes.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleFirst}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
          title="Trang đầu"
        >
          <ChevronsLeft className="w-3.5 h-3.5 text-slate-600" />
        </button>
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
          title="Trang trước"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-all border cursor-pointer ${
                currentPage === page
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
          title="Trang sau"
        >
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        </button>
        <button
          onClick={handleLast}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
          title="Trang cuối"
        >
          <ChevronsRight className="w-3.5 h-3.5 text-slate-600" />
        </button>
      </div>
    </div>
  );
}
