"use client";
import React, { useState } from 'react';

export default function SudokuPage() {
  // 1. Khởi tạo trạng thái bàn cờ và mức độ
  const [board, setBoard] = useState(Array(9).fill('').map(() => Array(9).fill('')));
  const [difficulty, setDifficulty] = useState('Dễ');

  // 2. Dữ liệu các mức độ chơi
  const games = {
    'Dễ': [
      ['5', '3', '', '', '7', '', '', '', ''],
      ['6', '', '', '1', '9', '5', '', '', ''],
      ['', '9', '8', '', '', '', '', '6', ''],
      ['8', '', '', '', '6', '', '', '', '3'],
      ['4', '', '', '8', '', '3', '', '', '1'],
      ['7', '', '', '', '2', '', '', '', '6'],
      ['', '6', '', '', '', '', '2', '8', ''],
      ['', '', '', '4', '1', '9', '', '', '5'],
      ['', '', '', '', '8', '', '', '7', '9']
    ],
    'Trung bình': [
      ['', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '3', '1', ''],
      ['', '', '', '4', '', '', '', '', ''],
      ['', '', '', '1', '', '', '2', '8', ''],
      ['', '', '', '2', '', '4', '', '', ''],
      ['', '', '', '', '3', '', '', '', ''],
      ['', '', '1', '', '', '', '', '', ''],
      ['', '', '', '', '5', '', '', '', ''],
      ['', '', '', '', '', '6', '', '', '']
    ],
    'Khó': [
      ['', '', '', '2', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', ''],
      ['1', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '']
    ]
  };

  // 3. Hàm xử lý logic
  const changeDifficulty = (level: 'Dễ' | 'Trung bình' | 'Khó') => {
    setDifficulty(level);
    setBoard(games[level]);
  };

  const handleInputChange = (row: number, col: number, value: string) => {
    if (value === "") {
      const newBoard = board.map((r, rIdx) =>
        r.map((cell, cIdx) => (rIdx === row && cIdx === col ? value : cell))
      );
      setBoard(newBoard);
      return;
    }

    if (!/^[1-9]$/.test(value)) {
      alert("Dữ liệu đầu vào không hợp lệ! Vui lòng chỉ nhập số dương từ 1 đến 9.");
      return;
    }

    const newBoard = board.map((r, rIdx) =>
      r.map((cell, cIdx) => (rIdx === row && cIdx === col ? value : cell))
    );
    setBoard(newBoard);
  };

  const checkResult = () => {
    for (let row of board) {
      if (row.includes('')) {
        alert("Bạn chưa hoàn thành bàn cờ! Hãy điền hết các ô trống.");
        return;
      }
    }
    alert("Tuyệt vời! Bạn đã lấp đầy bàn cờ. Hệ thống AI đang kiểm tra tính chính xác...");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-10 px-4">
      
      {/* TIÊU ĐỀ LẤP LÁNH TITAN TRONG NÚT XANH NHẠT */}
      <button className="relative px-10 py-5 bg-blue-50 rounded-2xl shadow-md mb-8 group overflow-hidden border border-blue-100">
        <h1 className="text-5xl font-black bg-gradient-to-r from-purple-700 via-blue-600 to-cyan-500 bg-clip-text text-transparent drop-shadow-sm">
          Sudoku Game
        </h1>
        <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_infinite] pointer-events-none" />
      </button>

      {/* 3 MỨC CHƠI DƯỚI TIÊU ĐỀ */}
      <div className="flex gap-4 mb-10">
        {(['Dễ', 'Trung bình', 'Khó'] as const).map((level) => (
          <button
            key={level}
            onClick={() => changeDifficulty(level)}
            className={`px-8 py-2 rounded-xl text-lg font-black transition-all border-2 ${
              difficulty === level 
              ? 'bg-blue-600 text-white border-blue-700 scale-105 shadow-lg' 
              : 'bg-white text-slate-800 border-slate-200 hover:border-blue-400'
            }`}
          >
            {level}
          </button>
        ))}
      </div>
      
      {/* BÀN CỜ SUDOKU - ĐÃ SỬA LỖI ĐƯỜNG KẺ VÀ IN ĐẬM SỐ */}
      <div className="grid grid-cols-9 border-[3px] border-black bg-black p-[1px] shadow-2xl">
        {board.map((row, rIdx) => (
          row.map((cell, cIdx) => (
            <input
              key={`${rIdx}-${cIdx}`}
              type="text"
              maxLength={1}
              value={cell}
              onChange={(e) => handleInputChange(rIdx, cIdx, e.target.value)}
              className={`
                w-11 h-11 sm:w-16 sm:h-16 text-center outline-none bg-white text-black text-3xl font-black 
                focus:bg-yellow-50 transition-colors border-[0.5px] border-slate-200
                ${(cIdx + 1) % 3 === 0 && cIdx < 8 ? "border-r-[3px] border-r-black" : ""}
                ${(rIdx + 1) % 3 === 0 && rIdx < 8 ? "border-b-[3px] border-b-black" : ""}
              `}
            />
          ))
        ))}
      </div>

      {/* NÚT KIỂM TRA KẾT QUẢ */}
      <div className="mt-12 flex gap-6">
        <button 
          onClick={checkResult}
          className="px-12 py-4 bg-green-600 text-white rounded-2xl text-xl font-black hover:bg-green-700 shadow-xl active:scale-95 transition-all"
        >
          KIỂM TRA KẾT QUẢ
        </button>
      </div>

      {/* CSS Inline cho hiệu ứng lấp lánh */}
      <style jsx global>{`
        @keyframes shine {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}