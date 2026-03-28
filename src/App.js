import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, BookHeart, Quote, Sparkles, BookOpen, Users, User, Trophy, Edit2, AlertCircle } from 'lucide-react';

// --- Firebase 라이브러리 임포트 ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, onSnapshot } from 'firebase/firestore';

// ==========================================================
// 파이어베이스 설정 (사용자 제공 정보)
// ==========================================================
const firebaseConfig = {
  apiKey: "AIzaSyCxBEwyVeA0Ps_v0zb5JNTCE6BvHaqAn8M",
  authDomain: "jaegunbible2026.firebaseapp.com",
  projectId: "jaegunbible2026",
  storageBucket: "jaegunbible2026.firebasestorage.app",
  messagingSenderId: "302495179534",
  appId: "1:302495179534:web:fab6ea22043cf0c0b72d5f",
  measurementId: "G-0BVLL0XJT7"
};

const internalAppId = "bible-reading-2026"; 
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 성경 통독 데이터
const scheduleData = [
  { w: "1주차", d: ["3/9 창1-5", "3/10 창6-10", "3/11 창11-15", "3/12 창16-20", "3/13 창21-25", "3/14 창26-29"] },
  { w: "2주차", d: ["3/16 창30-34", "3/17 창35-39", "3/18 창40-44", "3/19 창45-49", "3/20 창50-출4", "3/21 출5-8"] },
  { w: "3주차", d: ["3/23 출9-13", "3/24 출14-18", "3/25 출19-23", "3/26 출24-28", "3/27 출29-33", "3/28 출34-37"] },
  { w: "4주차", d: ["3/30 출38-레2", "3/31 레3-7", "4/1 레8-12", "4/2 레13-17", "4/3 레18-22", "4/4 레23-26"] },
  { w: "5주차", d: ["4/6 레27-민4", "4/7 민5-9", "4/8 민10-14", "4/9 민15-19", "4/10 민20-24", "4/11 민25-28"] },
  { w: "6주차", d: ["4/13 민29-33", "4/14 민34-신2", "4/15 신3-7", "4/16 신8-12", "4/17 신13-17", "4/18 신18-21"] },
  { w: "7주차", d: ["4/20 신22-26", "4/21 신27-31", "4/22 신32-수2", "4/23 수3-7", "4/24 수8-12", "4/25 수13-16"] },
  { w: "8주차", d: ["4/27 수17-21", "4/28 수22-삿2", "4/29 삿3-7", "4/30 삿8-12", "5/1 삿13-17", "5/2 삿18-21"] },
  { w: "9주차", d: ["5/4 룻1-삼상1", "5/5 삼상2-6", "5/6 삼상7-11", "5/7 삼상12-16", "5/8 삼상17-21", "5/9 삼상22-25"] },
  { w: "10주차", d: ["5/11 삼상26-30", "5/12 삼상31-삼하4", "5/13 삼하5-9", "5/14 삼하10-14", "5/15 삼하15-19", "5/16 삼하20-23"] },
  { w: "11주차", d: ["5/18 삼하24-왕상4", "5/19 왕상5-9", "5/20 왕상10-14", "5/21 왕상15-19", "5/22 왕상20-왕하2", "5/23 왕하3-6"] },
  { w: "12주차", d: ["5/25 왕하7-11", "5/26 왕하12-16", "5/27 왕하17-21", "5/28 왕하22-대상1", "5/29 대상2-6", "5/30 대상7-10"] },
  { w: "13주차", d: ["6/1 대상11-15", "6/2 대상16-20", "6/3 대상21-25", "6/4 대상26-대하1", "6/5 대하2-6", "6/6 대하7-10"] },
  { w: "14주차", d: ["6/8 대하11-15", "6/9 대하16-20", "6/10 대하21-25", "6/11 대하26-30", "6/12 대하31-35", "6/13 대하36-스3"] },
  { w: "15주차", d: ["6/15 스4-8", "6/16 스9-느3", "6/17 느4-8", "6/18 느9-13", "6/19 에1-5", "6/20 에6-9"] },
  { w: "16주차", d: ["6/22 에10-욥4", "6/23 욥5-9", "6/24 욥10-14", "6/25 욥15-19", "6/26 욥20-24", "6/27 욥25-28"] },
  { w: "17주차", d: ["6/29 욥29-33", "6/30 욥34-38", "7/1 욥39-시1", "7/2 시2-6", "7/3 시7-11", "7/4 시12-15"] },
  { w: "18주차", d: ["7/6 시16-20", "7/7 시21-25", "7/8 시26-30", "7/9 시31-35", "7/10 시36-40", "7/11 시41-44"] },
  { w: "19주차", d: ["7/13 시45-49", "7/14 시50-54", "7/15 시55-59", "7/16 시60-64", "7/17 시65-69", "7/18 시70-73"] },
  { w: "20주차", d: ["7/20 시74-78", "7/21 시79-83", "7/22 시84-88", "7/23 시89-93", "7/24 시94-98", "7/25 시99-102"] },
  { w: "21주차", d: ["7/27 시103-107", "7/28 시108-112", "7/29 시113-117", "7/30 시118-122", "7/31 시123-127", "8/1 시128-131"] },
  { w: "22주차", d: ["8/3 시132-136", "8/4 시137-141", "8/5 시142-146", "8/6 시147-잠1", "8/7 잠2-6", "8/8 잠7-10"] },
  { w: "23주차", d: ["8/10 잠11-15", "8/11 잠16-20", "8/12 잠21-25", "8/13 잠26-30", "8/14 잠31-전4", "8/15 전5-8"] },
  { w: "24주차", d: ["8/17 전9-아1", "8/18 아2-6", "8/19 아7-사3", "8/20 사4-8", "8/21 사9-13", "8/22 사14-17"] },
  { w: "25주차", d: ["8/24 사18-22", "8/25 사23-27", "8/26 사28-32", "8/27 사33-37", "8/28 사38-42", "8/29 사43-46"] },
  { w: "26주차", d: ["8/31 사47-51", "9/1 사52-56", "9/2 사57-61", "9/3 사62-66", "9/4 렘1-5", "9/5 렘6-9"] },
  { w: "27주차", d: ["9/7 렘10-14", "9/8 렘15-19", "9/9 렘20-24", "9/10 렘25-29", "9/11 렘30-34", "9/12 렘35-38"] },
  { w: "28주차", d: ["9/14 렘39-43", "9/15 렘44-48", "9/16 렘49-애1", "9/17 애2-겔1", "9/18 겔2-6", "9/19 겔7-10"] },
  { w: "29주차", d: ["9/21 겔11-15", "9/22 겔16-20", "9/23 겔21-25", "9/24 겔26-30", "9/25 겔31-35", "9/26 겔36-39"] },
  { w: "30주차", d: ["9/28 겔40-44", "9/29 겔45-단1", "9/30 단2-6", "10/1 단7-11", "10/2 단12-호4", "10/3 호5-8"] },
  { w: "31주차", d: ["10/5 호9-13", "10/6 호14-암1", "10/7 암2-6", "10/8 암7-욘1", "10/9 욘2-미2", "10/10 미3-6"] },
  { w: "32주차", d: ["10/12 미7-합1", "10/13 합2-습3", "10/14 학1-슥3", "10/15 슥4-8", "10/16 슥9-13", "10/17 슥14-말3"] },
  { w: "33주차", d: ["10/19 말4-마4", "10/20 마5-9", "10/21 마10-14", "10/22 마15-19", "10/23 마20-24", "10/24 마25-28"] },
  { w: "34주차", d: ["10/26 막1-5", "10/27 막6-10", "10/28 막11-15", "10/29 막16-눅4", "10/30 눅5-9", "10/31 눅10-13"] },
  { w: "35주차", d: ["11/2 눅14-18", "11/3 눅19-23", "11/4 눅24-요4", "11/5 요5-9", "11/6 요10-14", "11/7 요15-18"] },
  { w: "36주차", d: ["11/9 요19-행2", "11/10 행3-7", "11/11 행8-12", "11/12 행13-17", "11/13 행18-22", "11/14 행23-26"] },
  { w: "37주차", d: ["11/16 행27-롬3", "11/17 롬4-8", "11/18 롬9-13", "11/19 롬14-고전2", "11/20 고전3-7", "11/21 고전8-11"] },
  { w: "38주차", d: ["11/23 고전12-16", "11/24 고후1-5", "11/25 고후6-10", "11/26 고후11-갈2", "11/27 갈3-엡1", "11/28 엡2-5"] },
  { w: "39주차", d: ["11/30 엡6-빌4", "12/1 골1-살전1", "12/2 살전2-살후1", "12/3 살후2-딤전3", "12/4 딤전4-딤후2", "12/5 딤후3-딛2"] },
  { w: "40주차", d: ["12/7 딛3-히3", "12/8 히4-8", "12/9 히9-13", "12/10 약1-5", "12/11 벧전1-5", "12/12 벧후1-요일1"] },
  { w: "41주차", d: ["12/14 요일2-요한이서", "12/15 요한3서-계3", "12/16 계4-8", "12/17 계9-13", "12/18 계14-18", "12/19 계19-22"] }
];

const dayLabels = ["월요일 (5장)", "화요일 (5장)", "수요일 (5장)", "목요일 (5장)", "금요일 (5장)", "토요일 (4장)"];
const totalDays = scheduleData.length * 6;

export default function App() {
  const [checkedItems, setCheckedItems] = useState({});
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState('personal');
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [tempName, setTempName] = useState('');
  const [groupProgress, setGroupProgress] = useState([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [authError, setAuthError] = useState(null);

  // 1. 인증 및 초기화
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
        setAuthError(null);
      } catch (error) {
        console.error("Auth failed:", error);
        if (error.code === 'auth/configuration-not-found') {
          setAuthError("익명 로그인 기능이 비활성화되어 있습니다.");
        } else {
          setAuthError(error.message);
        }
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);

    const saved = localStorage.getItem('bible-reading-2026');
    if (saved) setCheckedItems(JSON.parse(saved));
    const savedName = localStorage.getItem('bible-reading-name');
    if (savedName) {
      setDisplayName(savedName);
      setTempName(savedName);
    }
    setMounted(true);
    return () => unsubscribe();
  }, []);

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercentage = ((checkedCount / totalDays) * 100).toFixed(1);

  // 2. 진도 동기화
  useEffect(() => {
    if (mounted && user && displayName) {
      localStorage.setItem('bible-reading-2026', JSON.stringify(checkedItems));
      
      const myDocRef = doc(db, 'artifacts', internalAppId, 'public', 'data', 'bible_progress_2026', user.uid);
      setDoc(myDocRef, {
        displayName,
        checkedCount,
        totalDays,
        updatedAt: Date.now()
      }, { merge: true }).catch(err => console.error("Update failed:", err));
    }
  }, [checkedItems, mounted, user, displayName, checkedCount]);

  // 3. 그룹 진도 실시간 구독
  useEffect(() => {
    if (!user) return;
    
    const progressCollectionRef = collection(db, 'artifacts', internalAppId, 'public', 'data', 'bible_progress_2026');
    const unsubscribe = onSnapshot(progressCollectionRef, (snapshot) => {
      const usersData = [];
      snapshot.forEach(doc => usersData.push({ id: doc.id, ...doc.data() }));
      usersData.sort((a, b) => (b.checkedCount || 0) - (a.checkedCount || 0));
      setGroupProgress(usersData);
    }, (err) => {
      console.error("Subscribe failed:", err);
    });
    return () => unsubscribe();
  }, [user]);

  const toggleCheck = (weekIndex, dayIndex) => {
    const key = `${weekIndex}-${dayIndex}`;
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleJoinGroup = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      setDisplayName(tempName.trim());
      localStorage.setItem('bible-reading-name', tempName.trim());
      setIsEditingName(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A3F35] font-serif py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* 에러 가이드 섹션 */}
        {authError && (
          <div className="mb-8 p-6 bg-red-50 border-2 border-red-100 rounded-3xl shadow-sm">
            <div className="flex items-start gap-4 text-red-700">
              <AlertCircle className="shrink-0 w-6 h-6 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2">중요한 설정이 필요합니다</h3>
                <p className="mb-4 text-sm leading-relaxed">
                  현재 파이어베이스 콘솔에서 <strong>'익명 로그인'</strong> 기능이 켜져 있지 않아 다른 사람과 진도를 공유할 수 없습니다. 
                  아래 순서대로 설정을 완료해 주세요.
                </p>
                <div className="bg-white/50 p-4 rounded-xl space-y-2 text-sm">
                  <p>1. <strong>Firebase 콘솔</strong> 접속</p>
                  <p>2. 왼쪽 메뉴: <strong>Build {'->'} Authentication</strong></p>
                  <p>3. 상단 탭: <strong>Sign-in method</strong> 클릭</p>
                  <p>4. <strong>익명(Anonymous)</strong> 항목 클릭 후 '사용 설정' 켜기</p>
                  <p>5. 완료 후 이 페이지를 <strong>새로고침</strong>해 주세요.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-[#F0E6D2] p-4 rounded-full shadow-sm text-[#8C6B4A]">
              <BookOpen size={40} />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#6D4C3D] mb-4 tracking-tight">2026년 성경 1독 스케줄표</h1>
          <div className="inline-block bg-white px-6 py-4 rounded-2xl shadow-sm border border-[#F0E6D2] mb-6 max-w-2xl relative">
            <Quote className="absolute top-2 left-2 text-[#E8DCC4] w-6 h-6 opacity-50" />
            <p className="text-lg text-[#8C6B4A] italic font-medium px-4">"주의 말씀은 내 발에 등이요 내 길에 빛이니이다"</p>
            <p className="text-sm text-[#A88C71] mt-2 text-right">- 시편 119:105 -</p>
          </div>
        </div>

        <div className="flex justify-center mb-10">
          <div className="bg-white p-1 rounded-full shadow-sm border border-[#EAE0D5] inline-flex">
            <button onClick={() => setViewMode('personal')} className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${viewMode === 'personal' ? 'bg-[#8CB396] text-white shadow-md' : 'text-[#8C6B4A]'}`}><User size={18} />나의 일정</button>
            <button onClick={() => setViewMode('group')} className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${viewMode === 'group' ? 'bg-[#8CB396] text-white shadow-md' : 'text-[#8C6B4A]'}`}><Users size={18} />함께 읽기</button>
          </div>
        </div>

        {viewMode === 'personal' ? (
          <div className="animate-in fade-in duration-500">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#F0E6D2] mb-12 flex flex-col sm:flex-row items-center gap-10 max-w-3xl mx-auto">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#F0E6D2" strokeWidth="8" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#A4C3B2" strokeWidth="8" strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * progressPercentage) / 100} strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl text-[#5F7A61]">{progressPercentage}%</div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-semibold text-[#6D4C3D] mb-2">{displayName ? `${displayName}님의 여정` : '나의 여정'}</h2>
                <p className="text-[#8C6B4A] text-lg">총 {totalDays}일 중 <span className="font-bold text-[#5F7A61]">{checkedCount}일</span> 읽었습니다.</p>
                <div className="w-full bg-[#F0E6D2] h-3 rounded-full mt-4 overflow-hidden"><div className="bg-[#6B9080] h-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }} /></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {scheduleData.map((week, wIdx) => {
                const wChecks = week.d.filter((_, dIdx) => checkedItems[`${wIdx}-${dIdx}`]).length;
                return (
                  <div key={wIdx} className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 ${wChecks === 6 ? 'border-[#A4C3B2] ring-1 ring-[#A4C3B2]' : 'border-[#EAE0D5]'}`}>
                    <div className={`px-5 py-4 border-b flex justify-between items-center rounded-t-2xl ${wChecks === 6 ? 'bg-[#F2F7F4]' : 'bg-[#FAF6F0]'}`}>
                      <h3 className="font-bold text-[#8C6B4A]">{week.w}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${wChecks === 6 ? 'bg-[#A4C3B2] text-white' : 'bg-[#EAE0D5]'}`}>{wChecks}/6</span>
                    </div>
                    <div className="p-2">
                      {week.d.map((day, dIdx) => {
                        const isChecked = checkedItems[`${wIdx}-${dIdx}`];
                        return (
                          <button key={dIdx} onClick={() => toggleCheck(wIdx, dIdx)} className={`w-full flex items-center gap-3 p-3 rounded-xl mb-1 transition-all ${isChecked ? 'bg-[#F2F7F4] text-[#8CB396]' : 'hover:bg-[#FAF6F0]'}`}>
                            {isChecked ? <CheckCircle2 size={18} /> : <Circle size={18} className="text-[#D4C4B7]" />}
                            <div className="text-left">
                              <p className="text-[10px] uppercase opacity-60 font-bold">{dayLabels[dIdx]}</p>
                              <p className={`font-medium ${isChecked ? 'line-through opacity-70' : ''}`}>{day}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
            {!displayName || isEditingName ? (
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-[#F0E6D2] text-center">
                <div className="bg-[#F2F7F4] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-[#8CB396]" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-[#6D4C3D]">{isEditingName ? '이름 수정하기' : '함께 통독하며 응원해요'}</h2>
                <p className="text-[#8C6B4A] mb-8 text-sm">닉네임을 등록하면 소그룹 멤버들과 실시간 진도를 공유할 수 있습니다.</p>
                <form onSubmit={handleJoinGroup} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                  <input type="text" value={tempName} onChange={e => setTempName(e.target.value)} placeholder="닉네임(직분) 입력" className="flex-1 px-5 py-4 rounded-2xl border border-[#DCE8E2] focus:ring-2 focus:ring-[#A4C3B2] outline-none shadow-inner" required />
                  <button type="submit" className="bg-[#6B9080] text-white px-8 py-4 rounded-2xl font-bold transition-all hover:bg-[#5F7A61] shadow-md active:scale-95">{isEditingName ? '변경하기' : '참여하기'}</button>
                  {isEditingName && <button type="button" onClick={() => setIsEditingName(false)} className="bg-[#EAE0D5] px-8 py-4 rounded-2xl font-bold text-[#6D4C3D]">취소</button>}
                </form>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#F0E6D2]">
                <div className="flex justify-between items-center mb-8 border-b pb-6 border-[#F0E6D2]">
                  <h2 className="text-2xl font-bold flex items-center gap-2 text-[#6D4C3D]"><Trophy className="text-[#E6B869]" />은혜의 발걸음</h2>
                  <div className="flex items-center gap-3 bg-[#FAF6F0] p-3 rounded-2xl border border-[#EAE0D5]">
                    <div className="text-right">
                      <span className="block text-[10px] text-[#A88C71] font-bold">MY STATUS</span>
                      <span className="font-bold text-[#6B9080]">{displayName}</span>
                    </div>
                    <button onClick={() => {setIsEditingName(true); setTempName(displayName);}} className="p-2 hover:bg-[#F0E6D2] rounded-full text-[#A88C71] transition-colors"><Edit2 size={16} /></button>
                  </div>
                </div>
                <div className="space-y-4">
                  {groupProgress.length === 0 ? (
                    <div className="text-center py-16">
                      <Sparkles className="mx-auto w-10 h-10 text-[#E8DCC4] mb-3" />
                      <p className="text-[#A88C71]">첫 번째 발자국을 남겨주세요!</p>
                    </div>
                  ) : (
                    groupProgress.map((m, i) => (
                      <div key={m.id} className={`p-5 rounded-2xl transition-all ${m.id === user?.uid ? 'bg-[#F2F7F4] border-2 border-[#DCE8E2] scale-[1.02] shadow-sm' : 'bg-[#FAF6F0] border border-transparent'}`}>
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${m.id === user?.uid ? 'bg-[#8CB396] text-white' : 'bg-[#EAE0D5] text-[#8C6B4A]'}`}>{i + 1}</span>
                            <span className="font-bold text-[#6D4C3D] text-lg">{m.displayName} {m.id === user?.uid && <span className="text-xs font-normal text-[#8CB396] ml-1">(나)</span>}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-xl text-[#6B9080]">{((m.checkedCount / totalDays) * 100).toFixed(1)}%</span>
                            <p className="text-[10px] text-[#A88C71] font-bold uppercase">{m.checkedCount} DAYS</p>
                          </div>
                        </div>
                        <div className="w-full bg-white h-3 rounded-full overflow-hidden shadow-inner border border-[#EAE0D5]"><div className="bg-gradient-to-r from-[#A4C3B2] to-[#6B9080] h-full transition-all duration-1000" style={{ width: `${(m.checkedCount / totalDays) * 100}%` }} /></div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        <div className="text-center mt-16 pb-8 text-[#A88C71] text-xs">
          <p>© 2026 성경 1독 스케줄표 (JeagunBible)</p>
          <div className="mt-4 flex justify-center gap-4">
             <span className="flex items-center gap-1"><Circle size={8} className="fill-[#A4C3B2] text-[#A4C3B2]" /> 실시간 클라우드 동기화 중</span>
          </div>
        </div>
      </div>
    </div>
  );
}