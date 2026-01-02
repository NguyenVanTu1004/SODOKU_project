"use client";
import React, { useState, useEffect } from 'react';

export default function SudokuPage() {
  const [board, setBoard] = useState(Array(9).fill('').map(() => Array(9).fill('')));
  const [difficulty, setDifficulty] = useState('Dễ');
  const [history, setHistory] = useState<string[][][]>([]);
  const [hintedCells, setHintedCells] = useState<string[]>([]);
  
  // --- STATE CHO ĐỒNG HỒ ---
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // --- STATE CHO LỊCH SỬ KỶ LỤC ---
  const [gameLogs, setGameLogs] = useState<{time: string, diff: string, date: string}[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  // --- THUẬT TOÁN HỖ TRỢ SINH SỐ NGẪU NHIÊN ---
  const isSafe = (grid: string[][], row: number, col: number, num: string) => {
    for (let x = 0; x < 9; x++) if (grid[row][x] === num || grid[x][col] === num) return false;
    const startRow = row - (row % 3), startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (grid[i + startRow][j + startCol] === num) return false;
    return true;
  };

  const solveSudokuInternal = (grid: string[][]): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === '') {
          const nums = ['1','2','3','4','5','6','7','8','9'].sort(() => Math.random() - 0.5);
          for (let num of nums) {
            if (isSafe(grid, row, col, num)) {
              grid[row][col] = num;
              if (solveSudokuInternal(grid)) return true;
              grid[row][col] = '';
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  const generateRandomBoard = (level: string) => {
    const newGrid = Array(9).fill('').map(() => Array(9).fill(''));
    solveSudokuInternal(newGrid); // Giải đầy bàn cờ ngẫu nhiên
    
    let cellsToRemove = level === 'Dễ' ? 35 : level === 'Trung bình' ? 45 : 55;
    while (cellsToRemove > 0) {
      let r = Math.floor(Math.random() * 9);
      let c = Math.floor(Math.random() * 9);
      if (newGrid[r][c] !== '') {
        newGrid[r][c] = '';
        cellsToRemove--;
      }
    }
    return newGrid;
  };

  // --- 1. TỰ ĐỘNG SINH SỐ NGẪU NHIÊN VÀ TẢI LỊCH SỬ KHI MỞ GAME ---
  useEffect(() => {
    const initialBoard = generateRandomBoard('Dễ');
    setBoard(initialBoard);

    const savedLogs = localStorage.getItem('sudoku_master_logs');
    if (savedLogs) {
      setGameLogs(JSON.parse(savedLogs));
    }
  }, []);

  // --- 2. TỰ ĐỘNG LƯU LỊCH SỬ VÀO MÁY MỖI KHI CẬP NHẬT ---
  useEffect(() => {
    localStorage.setItem('sudoku_master_logs', JSON.stringify(gameLogs));
  }, [gameLogs]);

  // --- LOGIC thời gian  ĐỒNG HỒ ---
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Thuật toán cho gợi ý từ AI ---
  const solveSudoku = (grid: string[][]): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === '') {
          for (let num = 1; num <= 9; num++) {
            const sNum = num.toString();
            if (isSafe(grid, row, col, sNum)) {
              grid[row][col] = sNum;
              if (solveSudoku(grid)) return true;
              grid[row][col] = '';
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  // --- Xử lý các sự kiện ---
  const startNewGame = (level: 'Dễ' | 'Trung bình' | 'Khó') => {
    setDifficulty(level);
    const newBoard = generateRandomBoard(level);
    setBoard(newBoard);
    setHistory([]);
    setHintedCells([]);
    setSeconds(0);
    setIsActive(true);
  };

  const handleInputChange = (row: number, col: number, value: string) => {
    if (!isActive) setIsActive(true);
    if (value === "" || /^[1-9]$/.test(value)) {
      setHistory(prev => [...prev, JSON.parse(JSON.stringify(board))]);
      const newBoard = board.map((r, rIdx) => 
        r.map((cell, cIdx) => (rIdx === row && cIdx === col ? value : cell))
      );
      setBoard(newBoard);
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setBoard(lastState);
    setHistory(prev => prev.slice(0, -1));
  };

  const handleAIHint = () => {
    const boardCopy = JSON.parse(JSON.stringify(board));
    if (solveSudoku(boardCopy)) {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (board[r][c] === '') {
            setHistory(prev => [...prev, JSON.parse(JSON.stringify(board))]);
            const newBoard = board.map((rowArr, rIdx) => 
              rowArr.map((cell, cIdx) => (rIdx === r && cIdx === c ? boardCopy[r][c] : cell))
            );
            setBoard(newBoard);
            setHintedCells(prev => [...prev, `${r}-${c}`]);
            return;
          }
        }
      }
    }
  };

 const checkResult = () => {
    // Tạo bản sao để kiểm tra logic giải (tránh lỗi tham chiếu)
    const boardCopy = JSON.parse(JSON.stringify(board));
    
    // 1. Kiểm tra xem đã điền kín bàn cờ chưa
    if (boardCopy.some((row: string[]) => row.includes(''))) {
      alert("Bạn chưa hoàn thành bàn cờ! Hãy điền hết các ô trống.");
      return;
    }

    // 2. Nếu đã điền kín, dừng đồng hồ và tính toán kỷ lục
    setIsActive(false); 
    const now = new Date();
    const finalTime = formatTime(seconds);
    const record = { 
      time: finalTime, 
      diff: difficulty, 
      date: `${now.toLocaleDateString()} ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` 
    };

    // 3. Lưu kỷ lục vào danh sách
    setGameLogs(prev => [record, ...prev]);

    // 4. Thông báo chiến thắng
    alert(`CHÚC MỪNG! Bạn đã thắng với thời gian: ${finalTime}. \nNhấn OK để bắt đầu ván mới!`);

    // 5. QUAN TRỌNG: Tự động sinh bàn cờ mới ngay lập tức để tránh lặp lại kỷ lục
    const nextBoard = generateRandomBoard(difficulty);
    setBoard(nextBoard);
    setHistory([]);
    setHintedCells([]);
    setSeconds(0);
    setIsActive(true); // Bắt đầu ván mới luôn
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 text-slate-900 font-sans relative">
      <div className="relative px-12 py-6 bg-white rounded-3xl shadow-xl mb-6 group overflow-hidden border border-blue-100">
        <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-700 via-blue-600 to-teal-500 bg-clip-text text-transparent">Sudoku Master</h1>
        <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_infinite] pointer-events-none" />
      </div>

      <div className="mb-6 flex items-center gap-3 bg-slate-800 text-white px-6 py-2 rounded-full shadow-lg border-2 border-slate-700">
        <span className="text-2xl">⏱️</span>
        <span className="text-3xl font-mono font-black tracking-widest">{formatTime(seconds)}</span>
      </div>

      <div className="flex items-center gap-4 mb-10 w-full max-w-2xl justify-center relative">
        <div className="flex gap-4">
          {(['Dễ', 'Trung bình', 'Khó'] as const).map((level) => (
            <button key={level} onClick={() => startNewGame(level)} className={`px-8 py-3 rounded-2xl text-lg font-black transition-all border-2 shadow-sm ${difficulty === level ? 'bg-blue-600 text-white border-blue-700 scale-105' : 'bg-white border-slate-200 hover:border-blue-400'}`}>{level}</button>
          ))}
        </div>
        <div className="relative">
          <button onClick={() => setShowLogs(!showLogs)} className="p-3 bg-white border-2 border-slate-300 rounded-2xl hover:bg-slate-100 shadow-sm transition-all text-2xl" title="Lịch sử chơi">📜</button>
          {showLogs && (
            <div className="absolute top-16 right-0 w-72 bg-white border-2 border-slate-200 shadow-2xl rounded-2xl p-4 z-50 max-h-80 overflow-y-auto animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-2 border-b pb-1">
                <h3 className="font-bold text-lg text-slate-800">Kỷ lục thắng</h3>
                <button onClick={() => { if(confirm("Xóa toàn bộ lịch sử?")) setGameLogs([]); }} className="text-[10px] bg-red-50 text-red-500 px-2 py-1 rounded-md hover:bg-red-500 hover:text-white transition-all">Xóa sạch</button>
              </div>
              {gameLogs.length === 0 ? <p className="text-sm text-slate-500 italic py-2">Chưa có kỷ lục nào.</p> : gameLogs.map((log, i) => (
                <div key={i} className="text-sm mb-3 pb-2 border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between font-bold">
                    <span className={`${log.diff === 'Khó' ? 'text-red-500' : log.diff === 'Trung bình' ? 'text-orange-500' : 'text-green-600'}`}>{log.diff}</span>
                    <span className="font-mono text-slate-700">{log.time}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-medium italic">{log.date}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-9 border-[4px] border-slate-900 bg-slate-900 p-[1.5px] shadow-2xl rounded-sm">
        {board.map((row, rIdx) => row.map((cell, cIdx) => (
          <input
            key={`${rIdx}-${cIdx}`}
            type="text"
            maxLength={1}
            value={cell}
            onChange={(e) => handleInputChange(rIdx, cIdx, e.target.value)}
            className={`w-10 h-10 sm:w-16 sm:h-16 text-center outline-none bg-white text-3xl font-black transition-all
              ${hintedCells.includes(`${rIdx}-${cIdx}`) ? "text-indigo-600" : "text-slate-900"}
              ${(cIdx + 1) % 3 === 0 && cIdx < 8 ? "border-r-[3.5px] border-r-slate-900" : "border-r-[0.5px] border-r-slate-200"}
              ${(rIdx + 1) % 3 === 0 && rIdx < 8 ? "border-b-[3.5px] border-b-slate-900" : "border-b-[0.5px] border-b-slate-200"}
              focus:bg-blue-50 focus:z-10`}
          />
        )))}
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-5">
        <button onClick={checkResult} className="px-8 py-4 bg-emerald-600 text-white rounded-2xl text-xl font-black hover:bg-emerald-700 shadow-lg active:scale-95 transition-all">KIỂM TRA</button>
        <button onClick={handleAIHint} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-xl font-black hover:bg-indigo-700 shadow-lg active:scale-95 transition-all">💡 GỢI Ý AI</button>
        <button onClick={handleUndo} disabled={history.length === 0} className={`px-8 py-4 rounded-2xl text-xl font-black shadow-lg active:scale-95 transition-all ${history.length === 0 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600'}`}>↩️ QUAY LẠI</button>
        <button onClick={() => startNewGame(difficulty as any)} className="px-8 py-4 bg-slate-800 text-white rounded-2xl text-xl font-black hover:bg-black active:scale-95 transition-all">LÀM MỚI</button>
      </div>

      <style jsx global>{` @keyframes shine { 100% { transform: translateX(100%); } } `}</style>
    </div>
  );
}