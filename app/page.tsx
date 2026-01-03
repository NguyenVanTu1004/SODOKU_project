"use client";
import React, { useState, useEffect } from 'react';

export default function SudokuPage() {
  const [board, setBoard] = useState(Array(9).fill('').map(() => Array(9).fill('')));
  const [difficulty, setDifficulty] = useState('Dễ');
  const [history, setHistory] = useState<string[][][]>([]);
  const [hintedCells, setHintedCells] = useState<string[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [gameLogs, setGameLogs] = useState<{time: string, diff: string, date: string}[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const [mistakes, setMistakes] = useState(0);
  const maxMistakes = 3;

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
    solveSudokuInternal(newGrid);
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

  useEffect(() => {
    setBoard(generateRandomBoard('Dễ'));
    const savedLogs = localStorage.getItem('sudoku_master_logs');
    if (savedLogs) setGameLogs(JSON.parse(savedLogs));
  }, []);

  useEffect(() => {
    localStorage.setItem('sudoku_master_logs', JSON.stringify(gameLogs));
  }, [gameLogs]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => { if (interval) clearInterval(interval); };
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startNewGame = (level: 'Dễ' | 'Trung bình' | 'Khó') => {
    setDifficulty(level);
    setBoard(generateRandomBoard(level));
    setHistory([]);
    setHintedCells([]);
    setSeconds(0);
    setMistakes(0);
    setIsActive(true);
  };

  const handleInputChange = (row: number, col: number, value: string) => {
    if (!isActive) setIsActive(true);
    if (value !== "" && /^[1-9]$/.test(value)) {
      const tempBoard = JSON.parse(JSON.stringify(board));
      if (isSafe(tempBoard, row, col, value)) {
        setHistory(prev => [...prev, JSON.parse(JSON.stringify(board))]);
        const newBoard = board.map((r, ri) => r.map((c, ci) => (ri === row && ci === col ? value : c)));
        setBoard(newBoard);
      } else {
        const newMistakes = mistakes + 1;
        setMistakes(newMistakes);
        if (newMistakes >= maxMistakes) {
          setIsActive(false);
          alert("GAME OVER! Bạn đã sai quá 3 lần. \nHãy nhấn 'LÀM MỚI' để thử lại hoặc 'XEM QUẢNG CÁO' để hồi sinh!");
        } else {
          alert(`Bạn đã nhập sai! Số lỗi: ${newMistakes}/${maxMistakes}`);
        }
      }
    } else if (value === "") {
        setHistory(prev => [...prev, JSON.parse(JSON.stringify(board))]);
        const newBoard = board.map((r, ri) => r.map((c, ci) => (ri === row && ci === col ? value : c)));
        setBoard(newBoard);
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    setBoard(history[history.length - 1]);
    setHistory(prev => prev.slice(0, -1));
  };

  const watchAdForHint = () => {
    alert("🎬 Đang tải quảng cáo... Vui lòng chờ 5 giây để nhận gợi ý miễn phí!");
    setTimeout(() => {
        handleAIHint();
        alert("✅ Cảm ơn bạn đã xem! 1 ô đã được AI gợi ý thành công.");
    }, 5000);
  };

  const handleAIHint = () => {
    const boardCopy = JSON.parse(JSON.stringify(board));
    const solveForHint = (grid: string[][]): boolean => {
        for (let row = 0; row < 9; row++) {
          for (let col = 0; col < 9; col++) {
            if (grid[row][col] === '') {
              for (let num = 1; num <= 9; num++) {
                if (isSafe(grid, row, col, num.toString())) {
                  grid[row][col] = num.toString();
                  if (solveForHint(grid)) return true;
                  grid[row][col] = '';
                }
              }
              return false;
            }
          }
        }
        return true;
      };

    if (solveForHint(boardCopy)) {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (board[r][c] === '') {
            setHistory(prev => [...prev, JSON.parse(JSON.stringify(board))]);
            const newBoard = board.map((rowArr, ri) => rowArr.map((cell, ci) => (ri === r && ci === c ? boardCopy[r][c] : cell)));
            setBoard(newBoard);
            setHintedCells([...hintedCells, `${r}-${c}`]);
            return;
          }
        }
      }
    }
  };

  // --- TÍNH NĂNG CHIA SẺ ĐỂ TĂNG LƯỢT CHƠI (KIẾM TIỀN) ---
  const handleShare = (finalTime: string) => {
    const text = `Tôi vừa hoàn thành Sudoku mức ${difficulty} trong ${finalTime}! Thách bạn vượt qua tôi tại:`;
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
  };

  const checkResult = () => {
    if (board.some(row => row.includes(''))) {
      alert("Bạn chưa hoàn thành bàn cờ!");
    } else {
      setIsActive(false);
      const finalTime = formatTime(seconds);
      const record = { time: finalTime, diff: difficulty, date: new Date().toLocaleString() };
      setGameLogs(prev => [record, ...prev]);
      
      if (confirm(`Chúc mừng! Bạn thắng trong: ${finalTime}. Bạn có muốn chia sẻ kết quả lên Facebook để thách đố bạn bè không?`)) {
        handleShare(finalTime);
      }
      startNewGame(difficulty as any);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 text-slate-900 font-sans relative">
      
      {/* VỊ TRÍ QUẢNG CÁO 1 (TOP BANNER) */}
      <div className="mb-6 w-full max-w-[728px] h-20 bg-gray-200 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center text-gray-500 italic text-sm">
        Quảng cáo Google AdSense sẽ hiển thị ở đây
      </div>

      {showRules && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border-2 border-indigo-100">
            <button onClick={() => setShowRules(false)} className="absolute top-4 right-4 text-2xl font-black text-slate-400 hover:text-red-500">✕</button>
            <h2 className="text-3xl font-black mb-6 text-indigo-700 underline decoration-teal-400">Luật chơi Sudoku</h2>
            <div className="space-y-4 text-slate-700 font-medium text-lg">
              <p>1. Điền số từ <span className="text-indigo-600 font-bold">1-9</span> vào ô trống.</p>
              <p>2. Không trùng số trên cùng hàng ngang, cột dọc hoặc khối 3x3.</p>
              <p>3. <span className="text-red-600 font-bold underline">CẢNH BÁO:</span> Nếu nhập sai quá <span className="font-bold underline">3 lần</span>, bạn sẽ bị thua!</p>
            </div>
            <button onClick={() => setShowRules(false)} className="mt-8 w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all">ĐÃ HIỂU!</button>
          </div>
        </div>
      )}

      <div className="relative px-12 py-6 bg-white rounded-3xl shadow-xl mb-6 group overflow-hidden border border-blue-100">
        <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-700 via-blue-600 to-teal-500 bg-clip-text text-transparent text-center">Sudoku Master</h1>
        <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_infinite] pointer-events-none" />
      </div>

      <div className="flex gap-4 mb-6">
        <div className="bg-slate-800 text-white px-6 py-2 rounded-full shadow-lg border-2 border-slate-700">
            <span className="text-3xl font-mono font-black tracking-widest">{formatTime(seconds)}</span>
        </div>
        <div className={`px-6 py-2 rounded-full shadow-lg border-2 font-black text-2xl ${mistakes >= 2 ? 'bg-red-100 text-red-600 border-red-500 animate-pulse' : 'bg-white text-slate-900 border-slate-300'}`}>
            💔 {mistakes}/{maxMistakes}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-10 w-full max-w-2xl justify-center relative">
        <div className="flex gap-4">
          {(['Dễ', 'Trung bình', 'Khó'] as const).map((level) => (
            <button key={level} onClick={() => startNewGame(level)} className={`px-8 py-3 rounded-2xl text-lg font-black transition-all border-2 shadow-sm ${difficulty === level ? 'bg-blue-600 text-white border-blue-700 scale-105' : 'bg-white border-slate-200'}`}>{level}</button>
          ))}
        </div>
        <div className="flex gap-2 relative">
          <button onClick={() => setShowRules(true)} className="p-3 bg-white border-2 border-indigo-200 rounded-2xl text-2xl hover:bg-indigo-50 shadow-md">❓</button>
          <button onClick={() => setShowLogs(!showLogs)} className="p-3 bg-white border-2 border-slate-300 rounded-2xl text-2xl hover:bg-slate-50 shadow-md">📜</button>
          {showLogs && (
            <div className="absolute top-16 right-0 w-72 bg-white border-2 border-slate-200 shadow-2xl rounded-2xl p-4 z-50 max-h-80 overflow-y-auto">
              <div className="flex justify-between items-center mb-2 border-b pb-1">
                <h3 className="font-bold text-lg text-slate-800">Kỷ lục thắng</h3>
                <button onClick={() => { if(confirm("Xóa lịch sử?")) setGameLogs([]); }} className="text-[10px] bg-red-50 text-red-500 px-2 py-1 rounded-md">Xóa sạch</button>
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
      
      <div className="grid grid-cols-9 border-[4px] border-slate-900 bg-slate-900 p-[1.5px] shadow-2xl rounded-sm mb-8">
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

      <div className="flex flex-wrap justify-center gap-5">
        <button onClick={checkResult} className="px-8 py-4 bg-emerald-600 text-white rounded-2xl text-xl font-black shadow-lg hover:bg-emerald-700">KIỂM TRA</button>
        <button onClick={watchAdForHint} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-xl font-black shadow-lg flex items-center gap-2 animate-bounce">
          📺 XEM QUẢNG CÁO (HINT)
        </button>
        <button onClick={handleUndo} disabled={history.length === 0} className={`px-8 py-4 rounded-2xl text-xl font-black shadow-lg ${history.length === 0 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600'}`}>↩️ QUAY LẠI</button>
        <button onClick={() => startNewGame(difficulty as any)} className="px-8 py-4 bg-slate-800 text-white rounded-2xl text-xl font-black hover:bg-black">LÀM MỚI</button>
      </div>

      {/* VỊ TRÍ QUẢNG CÁO 2 (BOTTOM BANNER) */}
      <div className="mt-10 w-full max-w-[728px] h-24 bg-gray-200 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center text-gray-500 italic text-sm">
        Quảng cáo Banner sẽ hiển thị tại đây
      </div>

      <style jsx global>{` @keyframes shine { 100% { transform: translateX(100%); } } `}</style>
    </div>
  );
}