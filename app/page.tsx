"use client";
import React, { useState } from 'react';

export default function SudokuPage() {
  // Tạo mảng 9x9 trống
  const [board, setBoard] = useState(Array(9).fill('').map(() => Array(9).fill('')));

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-10">
      <h1 className="text-4xl font-bold text-slate-800 mb-8">Sudoku Game</h1>
      
      <div className="grid grid-cols-9 border-2 border-slate-900 bg-white shadow-xl">
        {board.map((row, rIdx) => (
          row.map((cell, cIdx) => (
            <input
              key={`${rIdx}-${cIdx}`}
              type="text"
              maxLength={1}
              className={`w-10 h-10 md:w-12 md:h-12 text-center border border-slate-200 outline-none focus:bg-blue-100 text-lg font-semibold
                ${(cIdx + 1) % 3 === 0 && cIdx < 8 ? "border-r-2 border-r-slate-900" : ""}
                ${(rIdx + 1) % 3 === 0 && rIdx < 8 ? "border-b-2 border-b-slate-900" : ""}
              `}
            />
          ))
        ))}
      </div>

      <button className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all">
        Kiểm tra kết quả
      </button>
    </div>
  );
}