/**
 * SmartClass 智慧課堂點名與出缺席即時管理系統 v2.0
 * app.js - 含請假類別、請假紀錄查詢、分組管理、增強通知中心
 */

// ==========================================
// 1. 常數與靜態設定
// ==========================================
const DEFAULT_STUDENTS = [
  { id: "41108201", name: "王小明", group: "第 1 組", email: "wang.xm@univ.edu.tw", status: "present", score: 2 },
  { id: "41108202", name: "林家豪", group: "第 1 組", email: "lin.jh@univ.edu.tw", status: "present", score: 1 },
  { id: "41108203", name: "陳冠宇", group: "第 1 組", email: "chen.gy@univ.edu.tw", status: "absent", score: 0 },
  { id: "41108204", name: "張雅婷", group: "第 2 組", email: "chang.yt@univ.edu.tw", status: "present", score: 3 },
  { id: "41108205", name: "許庭瑋", group: "第 2 組", email: "hsu.tw@univ.edu.tw", status: "leave", score: 0 },
  { id: "41108206", name: "王俊傑", group: "第 2 組", email: "wang.jj@univ.edu.tw", status: "present", score: 1 },
  { id: "41108207", name: "蔡佳蓉", group: "第 3 組", email: "tsai.jr@univ.edu.tw", status: "absent", score: 0 },
  { id: "41108208", name: "李承恩", group: "第 3 組", email: "lee.ce@univ.edu.tw", status: "present", score: 2 },
  { id: "41108209", name: "趙詩涵", group: "第 3 組", email: "chao.sh@univ.edu.tw", status: "present", score: 0 },
  { id: "41108210", name: "劉昱廷", group: "第 4 組", email: "liu.yt@univ.edu.tw", status: "unmarked", score: 0 },
  { id: "41108211", name: "黃品睿", group: "第 4 組", email: "huang.pr@univ.edu.tw", status: "present", score: 1 },
  { id: "41108212", name: "鄭郁萱", group: "第 4 組", email: "cheng.yh@univ.edu.tw", status: "leave", score: 0 },
  { id: "41108213", name: "吳承翰", group: "第 5 組", email: "wu.ch@univ.edu.tw", status: "absent", score: 0 },
  { id: "41108214", name: "楊心語", group: "第 5 組", email: "yang.sy@univ.edu.tw", status: "present", score: 2 },
  { id: "41108215", name: "謝承佑", group: "第 5 組", email: "hsieh.cy@univ.edu.tw", status: "present", score: 0 },
  { id: "41108216", name: "潘冠廷", group: "第 6 組", email: "pan.kt@univ.edu.tw", status: "present", score: 1 },
  { id: "41108217", name: "柯智祥", group: "第 6 組", email: "ko.cx@univ.edu.tw", status: "unmarked", score: 0 },
  { id: "41108218", name: "郭品妤", group: "第 6 組", email: "kuo.py@univ.edu.tw", status: "present", score: 3 },
  { id: "41108219", name: "曾俊豪", group: "第 7 組", email: "tseng.jh@univ.edu.tw", status: "absent", score: 0 },
  { id: "41108220", name: "邱若晴", group: "第 7 組", email: "chiu.jc@univ.edu.tw", status: "present", score: 1 }
];

/** 請假類別設定 */
const LEAVE_TYPES = {
  official:    { label: "公假",  icon: "🏢", badgeClass: "badge-official",   color: "#4338ca" },
  personal:    { label: "事假",  icon: "🏠", badgeClass: "badge-personal",   color: "#b45309" },
  mental:      { label: "心理假", icon: "🧠", badgeClass: "badge-mental",     color: "#7e22ce" },
  bereavement: { label: "喪假",  icon: "🕊️", badgeClass: "badge-bereavement", color: "#334155" },
  sick:        { label: "病假",  icon: "💊", badgeClass: "badge-sick",       color: "#0f766e" }
};

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #6366f1, #8b5cf6)",
  "linear-gradient(135deg, #3b82f6, #06b6d4)",
  "linear-gradient(135deg, #10b981, #059669)",
  "linear-gradient(135deg, #f59e0b, #ea580c)",
  "linear-gradient(135deg, #ec4899, #f43f5e)",
  "linear-gradient(135deg, #8b5cf6, #d946ef)",
  "linear-gradient(135deg, #0ea5e9, #6366f1)",
  "linear-gradient(135deg, #14b8a6, #3b82f6)"
];

const GROUP_COLORS = [
  "#6366f1","#f59e0b","#10b981","#f43f5e","#8b5cf6","#3b82f6","#06b6d4","#ec4899",
  "#84cc16","#f97316","#0d9488","#a855f7"
];

// ==========================================
// 2. Web Audio API 音效合成引擎
// ==========================================
class SoundFX {
  constructor() { this.enabled = true; this.ctx = null; }

  init() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) this.ctx = new Ctx();
    }
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
  }

  playPop() {
    if (!this.enabled) return; this.init(); if (!this.ctx) return;
    try {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(520, this.ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);
      g.gain.setValueAtTime(0.12, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
      o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime + 0.08);
    } catch(e) {}
  }

  playTick() {
    if (!this.enabled) return; this.init(); if (!this.ctx) return;
    try {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = "triangle"; o.frequency.setValueAtTime(600 + Math.random()*200, this.ctx.currentTime);
      g.gain.setValueAtTime(0.08, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime + 0.04);
    } catch(e) {}
  }

  playFanfare() {
    if (!this.enabled) return; this.init(); if (!this.ctx) return;
    try {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.09);
        g.gain.setValueAtTime(0, this.ctx.currentTime + idx * 0.09);
        g.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + idx * 0.09 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.09 + 0.35);
        o.connect(g); g.connect(this.ctx.destination);
        o.start(this.ctx.currentTime + idx * 0.09); o.stop(this.ctx.currentTime + idx * 0.09 + 0.4);
      });
    } catch(e) {}
  }
}

const sfx = new SoundFX();

// ==========================================
// 3. 主系統類別
// ==========================================
class AttendanceSystem {
  constructor() {
    this.students      = this.loadData("smartclass_students_data", DEFAULT_STUDENTS);
    this.leaveRecords  = this.loadData("smartclass_leave_records", this._buildSampleLeaveRecords());
    this.attendanceLog = this.loadData("smartclass_attendance_log", {});
    this._dedupeLeaveRecordsByDay();
    this._hydrateAttendanceLogFromLeave();
    this._reconcileTodayLeaveWithAttendance();
    this._syncTodayAttendanceLog();
    this.notifyHistory = this.loadData("smartclass_notify_history", []);
    this.groups        = this.loadData("smartclass_groups", []);
    this.indNotes      = this.loadData("smartclass_ind_notes", {});

    this.currentFilter     = "all";
    this.searchQuery       = "";
    this.currentMode       = "list-mode";
    this.currentLeaveFilter = "all";
    this.leaveSearchQuery  = "";
    this.leaveDateFilter   = "";
    this.backfillDate      = this.getDateStr();

    // 抽籤
    this.isRolling    = false;
    this.luckyWinner  = null;
    this.drawnHistory = [];

    // 極速點名
    this.speedIndex = 0;

    // 請假 Picker 暫存
    this._pendingLeaveStudentId = null;

    // 通知中心渠道
    this.notifyChannel = "email";

    this.cacheDom();
    this.initDateTime();
    this.bindEvents();
    this.render();
  }

  // ── 資料存取 ───────────────────────────────
  loadData(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch(e) {}
    return JSON.parse(JSON.stringify(fallback));
  }

  saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  saveStudents() {
    this.saveData("smartclass_students_data", this.students);
    this._syncTodayAttendanceLog();
  }
  saveLeaveRecords() { this.saveData("smartclass_leave_records",  this.leaveRecords); }
  saveAttendanceLog(){ this.saveData("smartclass_attendance_log", this.attendanceLog); }
  saveNotifyHistory(){ this.saveData("smartclass_notify_history", this.notifyHistory); }
  saveGroups()       { this.saveData("smartclass_groups",         this.groups); }
  saveIndNotes()     { this.saveData("smartclass_ind_notes",      this.indNotes); }

  /** 建立示範請假紀錄 (對應預設名單中已有 leave 狀態的學生) */
  _buildSampleLeaveRecords() {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    return [
      {
        id: "lr_001", studentId: "41108205", studentName: "許庭瑋", studentGroup: "第 2 組",
        leaveType: "sick", reason: "腸胃不適就醫", date: today,
        loggedAt: new Date(now.getTime()-3600000*2).toISOString(), status: "approved"
      },
      {
        id: "lr_002", studentId: "41108212", studentName: "鄭郁萱", studentGroup: "第 4 組",
        leaveType: "official", reason: "參加全國大專體育盃代表出賽", date: today,
        loggedAt: new Date(now.getTime()-3600000*1).toISOString(), status: "approved"
      },
      {
        id: "lr_003", studentId: "41108205", studentName: "許庭瑋", studentGroup: "第 2 組",
        leaveType: "personal", reason: "家庭事務", date: this._dateBefore(7),
        loggedAt: new Date(now.getTime()-86400000*7).toISOString(), status: "approved"
      },
      {
        id: "lr_004", studentId: "41108207", studentName: "蔡佳蓉", studentGroup: "第 3 組",
        leaveType: "mental", reason: "情緒狀態需要調整，已至學輔中心諮商", date: this._dateBefore(14),
        loggedAt: new Date(now.getTime()-86400000*14).toISOString(), status: "approved"
      },
      {
        id: "lr_005", studentId: "41108203", studentName: "陳冠宇", studentGroup: "第 1 組",
        leaveType: "sick", reason: "流感發燒", date: this._dateBefore(3),
        loggedAt: new Date(now.getTime()-86400000*3).toISOString(), status: "pending"
      }
    ];
  }

  _dateBefore(days) {
    const d = new Date(); d.setDate(d.getDate()-days);
    return this.getDateStr(d);
  }

  getDateStr(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  shiftDateStr(dateStr, days) {
    const d = dateStr ? new Date(`${dateStr}T00:00:00`) : new Date();
    d.setDate(d.getDate() + days);
    return this.getDateStr(d);
  }

  formatDateLabel(dateStr) {
    if (!dateStr) return "";
    const d = new Date(`${dateStr}T00:00:00`);
    const days = ["週日","週一","週二","週三","週四","週五","週六"];
    return `${dateStr}（${days[d.getDay()]}）`;
  }

  /** 同一學生同一請假日僅保留 loggedAt 最新的一筆，避免重複修改造成多筆舊狀態。 */
  _dedupeLeaveRecordsByDay() {
    const latestByKey = new Map();
    this.leaveRecords.forEach(r => {
      const key = `${r.studentId}|${r.date}`;
      const prev = latestByKey.get(key);
      if (!prev || new Date(r.loggedAt) > new Date(prev.loggedAt)) latestByKey.set(key, r);
    });
    const keep = new Set(latestByKey.values());
    const next = this.leaveRecords.filter(r => keep.has(r));
    if (next.length !== this.leaveRecords.length) {
      this.leaveRecords = next;
      this.saveLeaveRecords();
    }
  }

  findLeaveRecordOnDate(studentId, date) {
    return this.leaveRecords.find(r => r.studentId === studentId && r.date === date) || null;
  }

  /** 以學生 + 請假日期為鍵，覆寫同一日既有紀錄（最新為主）。 */
  upsertLeaveRecord({ studentId, studentName, studentGroup, leaveType, reason, date, status }) {
    const now = new Date();
    const existing = this.findLeaveRecordOnDate(studentId, date);
    if (existing) {
      existing.studentName  = studentName;
      existing.studentGroup = studentGroup;
      existing.leaveType    = leaveType;
      existing.reason       = reason;
      existing.loggedAt     = now.toISOString();
      existing.status       = status;
      this.leaveRecords = [existing, ...this.leaveRecords.filter(r => r !== existing)];
      return { record: existing, isUpdate: true };
    }
    const record = {
      id: `lr_${Date.now()}`,
      studentId, studentName, studentGroup, leaveType, reason, date,
      loggedAt: now.toISOString(),
      status
    };
    this.leaveRecords.unshift(record);
    return { record, isUpdate: false };
  }

  removeLeaveRecordOnDate(studentId, date) {
    const next = this.leaveRecords.filter(r => !(r.studentId === studentId && r.date === date));
    const changed = next.length !== this.leaveRecords.length;
    if (changed) this.leaveRecords = next;
    return changed;
  }

  /** 當日最新出缺席若已不是請假，立即撤銷當日請假紀錄。 */
  syncTodayLeaveWithAttendance(studentId, attendanceStatus) {
    if (attendanceStatus === "leave") return false;
    return this.removeLeaveRecordOnDate(studentId, this.getDateStr());
  }

  /** 啟動時以目前出缺席狀態為準，清掉已過時的當日請假紀錄。 */
  _reconcileTodayLeaveWithAttendance() {
    let changed = false;
    this.students.forEach(s => {
      if (this.syncTodayLeaveWithAttendance(s.id, s.status)) changed = true;
    });
    if (changed) this.saveLeaveRecords();
  }

  _syncTodayAttendanceLog() {
    const today = this.getDateStr();
    if (!this.attendanceLog[today]) this.attendanceLog[today] = {};
    this.students.forEach(s => {
      this.attendanceLog[today][s.id] = s.status || "unmarked";
    });
    this.saveAttendanceLog();
  }

  _hydrateAttendanceLogFromLeave() {
    let changed = false;
    this.leaveRecords.forEach(r => {
      if (!this.attendanceLog[r.date]) this.attendanceLog[r.date] = {};
      if (this.attendanceLog[r.date][r.studentId] === undefined) {
        this.attendanceLog[r.date][r.studentId] = "leave";
        changed = true;
      }
    });
    if (changed) this.saveAttendanceLog();
  }

  getKnownAttendanceDates() {
    const dates = new Set(Object.keys(this.attendanceLog || {}));
    this.leaveRecords.forEach(r => { if (r.date) dates.add(r.date); });
    dates.add(this.getDateStr());
    return [...dates].sort((a, b) => b.localeCompare(a));
  }

  getAttendanceForDate(studentId, date) {
    if (date === this.getDateStr()) {
      const s = this.students.find(st => st.id === studentId);
      return s?.status || "unmarked";
    }
    if (this.attendanceLog[date] && this.attendanceLog[date][studentId] !== undefined) {
      return this.attendanceLog[date][studentId];
    }
    if (this.findLeaveRecordOnDate(studentId, date)) return "leave";
    return "unmarked";
  }

  setAttendanceForDate(studentId, date, status, extras = {}) {
    const student = this.students.find(s => s.id === studentId);
    if (!student || !date) return { isUpdate: false };
    if (!this.attendanceLog[date]) this.attendanceLog[date] = {};
    const isUpdate = this.attendanceLog[date][studentId] !== undefined || !!this.findLeaveRecordOnDate(studentId, date);
    this.attendanceLog[date][studentId] = status;
    this.saveAttendanceLog();

    if (date === this.getDateStr()) {
      student.status = status;
      this.saveStudents();
    }

    if (status === "leave") {
      const existing = this.findLeaveRecordOnDate(studentId, date);
      const leaveType = extras.leaveType || existing?.leaveType || "personal";
      const reason = extras.reason !== undefined
        ? extras.reason
        : (existing?.reason || `${LEAVE_TYPES[leaveType]?.label || leaveType}`);
      this.upsertLeaveRecord({
        studentId: student.id,
        studentName: student.name,
        studentGroup: student.group || "未分組",
        leaveType,
        reason: reason || `${LEAVE_TYPES[leaveType]?.label || leaveType}`,
        date,
        status: extras.approvalStatus || existing?.status || (date === this.getDateStr() ? "pending" : "approved")
      });
      this.saveLeaveRecords();
    } else if (this.removeLeaveRecordOnDate(studentId, date)) {
      this.saveLeaveRecords();
    }
    return { isUpdate };
  }

  // ── DOM 快取 ───────────────────────────────
  cacheDom() {
    const $ = id => document.getElementById(id);

    // 頂部統計
    this.statTotalCount       = $("statTotalCount");
    this.statPresentCount     = $("statPresentCount");
    this.statLeaveCount       = $("statLeaveCount");
    this.statAbsentCount      = $("statAbsentCount");
    this.statPresentRatioBadge= $("statPresentRatioBadge");
    this.notifyBadgeNum       = $("notifyBadgeNum");
    this.attendanceRateText   = $("attendanceRateText");
    this.rateStatusChip       = $("rateStatusChip");
    this.gaugeFill            = $("gaugeFill");
    this.notifyBtn            = $("notifyBtn");

    // 課程資訊
    this.courseNameInput    = $("courseNameInput");
    this.currentDateDisplay = $("currentDateDisplay");

    // 清單模式
    this.searchInput       = $("searchInput");
    this.clearSearchBtn    = $("clearSearchBtn");
    this.filterPills       = document.querySelectorAll(".filter-pill");
    this.studentsGrid      = $("studentsGrid");
    this.noResultsState    = $("noResultsState");

    // Tab 切換
    this.tabBtns     = document.querySelectorAll(".tab-btn");
    this.tabContents = document.querySelectorAll(".tab-content");

    // 隨機抽點
    this.stageStandby         = $("stageStandby");
    this.stageRolling         = $("stageRolling");
    this.stageWinner          = $("stageWinner");
    this.rollingAvatar        = $("rollingAvatar");
    this.rollingName          = $("rollingName");
    this.rollingId            = $("rollingId");
    this.winnerAvatar         = $("winnerAvatar");
    this.winnerName           = $("winnerName");
    this.winnerId             = $("winnerId");
    this.winnerGroup          = $("winnerGroup");
    this.winnerScore          = $("winnerScore");
    this.startDrawBtn         = $("startDrawBtn");
    this.drawBtnText          = $("drawBtnText");
    this.drawCandidateCount   = $("drawCandidateCount");
    this.drawExcludeAbsentCheck = $("drawExcludeAbsentCheck");
    this.drawNoRepeatCheck    = $("drawNoRepeatCheck");
    this.drawHistoryList      = $("drawHistoryList");
    this.clearDrawHistoryBtn  = $("clearDrawHistoryBtn");
    this.winnerMarkPresentBtn = $("winnerMarkPresentBtn");
    this.winnerMarkLeaveBtn   = $("winnerMarkLeaveBtn");
    this.winnerMarkAbsentBtn  = $("winnerMarkAbsentBtn");
    this.winnerAddPointBtn    = $("winnerAddPointBtn");

    // 極速點名
    this.speedCurrentIndex = $("speedCurrentIndex");
    this.speedTotalCount   = $("speedTotalCount");
    this.speedProgressFill = $("speedProgressFill");
    this.speedAvatar       = $("speedAvatar");
    this.speedStatusBadge  = $("speedStatusBadge");
    this.speedName         = $("speedName");
    this.speedId           = $("speedId");
    this.speedEmail        = $("speedEmail");
    this.speedBtnPresent   = $("speedBtnPresent");
    this.speedBtnLeave     = $("speedBtnLeave");
    this.speedBtnAbsent    = $("speedBtnAbsent");
    this.speedPrevBtn      = $("speedPrevBtn");
    this.speedNextBtn      = $("speedNextBtn");

    // 通知中心
    this.notifyModal          = $("notifyModal");
    this.modalAbsentCount     = $("modalAbsentCount");
    this.modalAbsentChips     = $("modalAbsentChips");
    this.notifySubject        = $("notifySubject");
    this.notifyBody           = $("notifyBody");
    this.notifySentAlert      = $("notifySentAlert");
    this.notifySentAlertText  = $("notifySentAlertText");
    this.copyNotifyContentBtn = $("copyNotifyContentBtn");
    this.openMailtoBtn        = $("openMailtoBtn");
    this.simulateSendBtn      = $("simulateSendBtn");
    this.charCountBadge       = $("charCountBadge");
    this.notifyModalAbsentCount = $("notifyModalAbsentCount");
    this.notifyHistoryCount   = $("notifyHistoryCount");
    this.individualAbsenteeList = $("individualAbsenteeList");
    this.notifyHistoryTimeline  = $("notifyHistoryTimeline");

    // 請假 Picker Modal
    this.leavePickerModal         = $("leavePickerModal");
    this.leavePickerStudentName   = $("leavePickerStudentName");
    this.leavePickerStudentId     = $("leavePickerStudentId");
    this.leavePickerStudentIdInput= $("leavePickerStudentIdInput");
    this.leavePickerDate          = $("leavePickerDate");
    this.leaveReasonInput         = $("leaveReasonInput");
    this.confirmLeavePickerBtn    = $("confirmLeavePickerBtn");

    // 補登請假 Modal
    this.manualLeaveModal         = $("manualLeaveModal");
    this.manualLeaveForm          = $("manualLeaveForm");
    this.manualLeaveStudentSelect = $("manualLeaveStudentSelect");
    this.manualLeaveDate          = $("manualLeaveDate");
    this.manualLeaveType          = $("manualLeaveType");
    this.manualLeaveReason        = $("manualLeaveReason");
    this.manualLeaveFieldsWrap    = $("manualLeaveFieldsWrap");
    this.manualExistingHint       = $("manualExistingHint");

    this.backfillDateInput        = $("backfillDateInput");
    this.backfillTableBody        = $("backfillTableBody");
    this.historyDateSelect        = $("historyDateSelect");
    this.leaveDateFilterInput     = $("leaveDateFilter");

    // 請假紀錄頁面
    this.leaveSearchInput       = $("leaveSearchInput");
    this.leaveRecordsTableBody  = $("leaveRecordsTableBody");
    this.noLeaveRecordsState    = $("noLeaveRecordsState");
    this.totalLeaveRecordsCount = $("totalLeaveRecordsCount");
    this.totalWarningCount      = $("totalWarningCount");
    this.warningCardsGrid       = $("warningCardsGrid");
    this.noWarningState         = $("noWarningState");
    this.exportLeaveRecordsCsvBtn = $("exportLeaveRecordsCsvBtn");
    this.openManualLeaveModalBtn  = $("openManualLeaveModalBtn");

    // 分組管理
    this.groupsGrid               = $("groupsGrid");
    this.groupTotalStudentsCount  = $("groupTotalStudentsCount");
    this.groupTotalTeamsCount     = $("groupTotalTeamsCount");
    this.randomGroupBtn           = $("randomGroupBtn");
    this.addGroupBtn              = $("addGroupBtn");
    this.exportGroupsCsvBtn       = $("exportGroupsCsvBtn");
    this.copyGroupsTextBtn        = $("copyGroupsTextBtn");
    this.groupCountInput          = $("groupCountInput");
    this.groupCountLabel          = $("groupCountLabel");
    this.groupExcludeAbsentCheck  = $("groupExcludeAbsentCheck");
    this.unassignedDock           = $("unassignedDock");
    this.unassignedCount          = $("unassignedCount");
    this.unassignedChips          = $("unassignedChips");

    // 頂部工具
    this.batchAllPresentBtn     = $("batchAllPresentBtn");
    this.resetAllAttendanceBtn  = $("resetAllAttendanceBtn");
    this.openAddStudentModalBtn = $("openAddStudentModalBtn");
    this.exportImportBtn        = $("exportImportBtn");
    this.addStudentModal        = $("addStudentModal");
    this.addStudentForm         = $("addStudentForm");
    this.exportImportModal      = $("exportImportModal");
    this.soundToggleBtn         = $("soundToggleBtn");
    this.soundOnIcon            = $("soundOnIcon");
    this.soundOffIcon           = $("soundOffIcon");
    this.toastContainer         = $("toastContainer");
    this.exportCsvBtn           = $("exportCsvBtn");
    this.exportJsonBtn          = $("exportJsonBtn");
    this.restoreDefaultListBtn  = $("restoreDefaultListBtn");
  }

  // ── 初始化日期 ───────────────────────────────
  initDateTime() {
    const now  = new Date();
    const days = ["週日","週一","週二","週三","週四","週五","週六"];
    const y = now.getFullYear(), m = String(now.getMonth()+1).padStart(2,"0"), d = String(now.getDate()).padStart(2,"0");
    this.currentDateDisplay.textContent = `${y}/${m}/${d} (${days[now.getDay()]})`;
    // 預設補登日期為今天
    if (this.manualLeaveDate) this.manualLeaveDate.value = `${y}-${m}-${d}`;
  }

  // ==========================================
  // 4. 事件綁定
  // ==========================================
  bindEvents() {
    // ── Tab 切換 ──
    this.tabBtns.forEach(btn => {
      btn.addEventListener("click", () => this.switchTab(btn.getAttribute("data-tab")));
    });

    // ── 搜尋與篩選 (清單) ──
    this.searchInput.addEventListener("input", e => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this.clearSearchBtn.style.display = this.searchQuery ? "inline-block" : "none";
      this.renderList();
    });
    this.clearSearchBtn.addEventListener("click", () => {
      this.searchInput.value = ""; this.searchQuery = "";
      this.clearSearchBtn.style.display = "none";
      this.renderList(); this.searchInput.focus();
    });
    this.filterPills.forEach(pill => {
      pill.addEventListener("click", () => {
        this.filterPills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.currentFilter = pill.getAttribute("data-filter");
        this.renderList();
      });
    });

    // ── 批次功能 ──
    this.batchAllPresentBtn.addEventListener("click", () => this.batchMarkAll("present"));
    this.resetAllAttendanceBtn.addEventListener("click", () => {
      if (confirm("確定要重置本堂課所有學生的出席狀態為「未標記」嗎？當日請假紀錄也會一併撤銷。")) {
        this.batchMarkAll("unmarked");
        this.drawnHistory = [];
        this.renderDrawHistory();
        this.showToast("已重置所有學生狀態為未標記，並撤銷今日請假紀錄", "info");
      }
    });

    // ── 音效開關 ──
    this.soundToggleBtn.addEventListener("click", () => {
      sfx.enabled = !sfx.enabled;
      this.soundOnIcon.style.display = sfx.enabled ? "block" : "none";
      this.soundOffIcon.style.display = sfx.enabled ? "none" : "block";
      this.showToast(sfx.enabled ? "已開啟音效效果 🔊" : "已靜音 🔇", "info");
      if (sfx.enabled) sfx.playPop();
    });

    // ── 隨機抽點 ──
    this.startDrawBtn.addEventListener("click", () => this.triggerLuckyDraw());
    this.clearDrawHistoryBtn.addEventListener("click", () => {
      this.drawnHistory = []; this.renderDrawHistory(); this.updateCandidateCount();
      this.showToast("已清空本堂抽點紀錄", "info");
    });
    this.drawExcludeAbsentCheck.addEventListener("change", () => this.updateCandidateCount());
    this.drawNoRepeatCheck.addEventListener("change", () => this.updateCandidateCount());

    this.winnerMarkPresentBtn.addEventListener("click", () => {
      if (!this.luckyWinner) return;
      this.updateStudentStatus(this.luckyWinner.id, "present"); this.updateWinnerStatusButtons();
      sfx.playPop(); this.showToast(`已將 ${this.luckyWinner.name} 標記為 出席！`, "success");
    });
    this.winnerMarkLeaveBtn.addEventListener("click", () => {
      if (!this.luckyWinner) return;
      this.openLeavePicker(this.luckyWinner.id);
    });
    this.winnerMarkAbsentBtn.addEventListener("click", () => {
      if (!this.luckyWinner) return;
      this.updateStudentStatus(this.luckyWinner.id, "absent"); this.updateWinnerStatusButtons();
      sfx.playPop(); this.showToast(`已將 ${this.luckyWinner.name} 標記為 缺席`, "warning");
    });
    this.winnerAddPointBtn.addEventListener("click", () => {
      if (!this.luckyWinner) return;
      this.addStudentScore(this.luckyWinner.id, 1);
      sfx.playFanfare(); this.winnerScore.textContent = this.luckyWinner.score;
      this.showToast(`🌟 已為 ${this.luckyWinner.name} 增加 1 點課堂表現分！`, "success");
    });

    // ── 極速點名 ──
    this.speedBtnPresent.addEventListener("click", () => this.handleSpeedStatus("present"));
    this.speedBtnLeave.addEventListener("click", () => {
      if (this.students.length === 0) return;
      this.openLeavePicker(this.students[this.speedIndex].id);
    });
    this.speedBtnAbsent.addEventListener("click", () => this.handleSpeedStatus("absent"));
    this.speedPrevBtn.addEventListener("click", () => this.stepSpeedIndex(-1));
    this.speedNextBtn.addEventListener("click", () => this.stepSpeedIndex(1));
    window.addEventListener("keydown", e => {
      if (this.currentMode !== "speed-mode") return;
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if (e.key === "1" || e.key.toLowerCase() === "a") { e.preventDefault(); this.handleSpeedStatus("present"); }
      else if (e.key === "2" || e.key.toLowerCase() === "s") { e.preventDefault(); this.speedBtnLeave.click(); }
      else if (e.key === "3" || e.key.toLowerCase() === "d") { e.preventDefault(); this.handleSpeedStatus("absent"); }
      else if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); this.stepSpeedIndex(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); this.stepSpeedIndex(-1); }
    });

    // ── 彈窗開關（通用 data-close) ──
    document.querySelectorAll("[data-close]").forEach(btn => {
      btn.addEventListener("click", () => {
        const modal = document.getElementById(btn.getAttribute("data-close"));
        if (modal) this.closeModal(modal);
      });
    });
    [this.notifyModal, this.addStudentModal, this.exportImportModal,
     this.leavePickerModal, this.manualLeaveModal].forEach(modal => {
       if (!modal) return;
       modal.addEventListener("click", e => { if (e.target === modal) this.closeModal(modal); });
    });

    // ── 通知中心 ──
    this.notifyBtn.addEventListener("click", () => this.openNotifyModal());
    // 通知 subnav
    document.querySelectorAll(".modal-subnav-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".modal-subnav-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const tab = btn.getAttribute("data-notify-tab");
        document.querySelectorAll(".notify-subtab-pane").forEach(p => p.style.display = "none");
        const pane = document.getElementById(`notifyTabContent${tab.charAt(0).toUpperCase()+tab.slice(1)}`);
        if (pane) pane.style.display = "block";
        if (tab === "individual") this.renderIndividualAbsenteeList();
        if (tab === "history")    this.renderNotifyHistory();
      });
    });
    // 通訊渠道
    document.querySelectorAll(".channel-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".channel-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.notifyChannel = btn.getAttribute("data-channel");
        this.applyNotificationTemplate(document.querySelector('input[name="msgTemplate"]:checked')?.value || "gentle");
        const isEmail = this.notifyChannel === "email";
        if (this.notifySubject) this.notifySubject.parentElement.style.display = isEmail ? "flex" : "none";
      });
    });
    // 通知範本
    document.querySelectorAll('input[name="msgTemplate"]').forEach(radio => {
      radio.addEventListener("change", e => this.applyNotificationTemplate(e.target.value));
    });
    // 字數即時統計
    if (this.notifyBody) {
      this.notifyBody.addEventListener("input", () => {
        if (this.charCountBadge) this.charCountBadge.textContent = `字數: ${this.notifyBody.value.length} 字`;
      });
    }
    this.copyNotifyContentBtn.addEventListener("click", () => {
      const text = this.notifyChannel === "email"
        ? `主旨：${this.notifySubject?.value || ""}\n\n${this.notifyBody?.value || ""}`
        : (this.notifyBody?.value || "");
      navigator.clipboard.writeText(text).then(() => {
        this.showToast("已成功複製通知訊息至剪貼簿！", "success"); sfx.playPop();
      });
    });
    this.openMailtoBtn.addEventListener("click", () => {
      const absentees = this.getAbsentStudents();
      if (!absentees.length) { alert("目前沒有缺席學生需要通知！"); return; }
      const bcc = absentees.map(s => s.email).filter(Boolean).join(",");
      const subj = encodeURIComponent(this.notifySubject?.value || "");
      const body = encodeURIComponent(this.notifyBody?.value || "");
      window.open(`mailto:?bcc=${bcc}&subject=${subj}&body=${body}`, "_blank");
    });
    this.simulateSendBtn.addEventListener("click", () => {
      const absentees = this.getAbsentStudents();
      if (!absentees.length) { alert("目前沒有缺席學生需要通知！"); return; }
      const channelLabel = { email:"Email", line:"LINE 班群", sms:"SMS 簡訊" }[this.notifyChannel] || "通訊渠道";
      // 存入歷史
      this.notifyHistory.unshift({
        time: new Date().toISOString(),
        channel: channelLabel,
        subject: this.notifySubject?.value || "",
        recipients: absentees.map(s => `${s.name}(${s.id})`).join("、"),
        preview: (this.notifyBody?.value || "").slice(0, 60) + "…"
      });
      this.saveNotifyHistory();
      if (this.notifyHistoryCount) this.notifyHistoryCount.textContent = this.notifyHistory.length;
      this.notifySentAlert.style.display = "flex";
      this.notifySentAlertText.textContent = `已透過 ${channelLabel} 向 ${absentees.length} 位缺席同學發送通知！`;
      sfx.playFanfare();
      this.showToast(`缺勤通知已透過 ${channelLabel} 完成推播並留存紀錄！`, "success");
    });

    // ── 請假 Picker ──
    this.confirmLeavePickerBtn.addEventListener("click", () => this.confirmLeavePicker());
    this.leavePickerDate?.addEventListener("change", () => {
      const sid = this.leavePickerStudentIdInput?.value;
      if (sid) this._prefillLeavePickerForDate(sid, this.leavePickerDate.value);
    });

    // ── 補登請假 ──
    this.openManualLeaveModalBtn.addEventListener("click", () => this.openManualLeaveModal());
    this.manualLeaveForm.addEventListener("submit", e => { e.preventDefault(); this.submitManualLeave(); });
    this.manualLeaveStudentSelect?.addEventListener("change", () => this.refreshManualAttendancePreview());
    this.manualLeaveDate?.addEventListener("change", () => this.refreshManualAttendancePreview());
    document.querySelectorAll('input[name="manualAttendanceStatus"]').forEach(r => {
      r.addEventListener("change", () => this.syncManualLeaveFieldsVisibility());
    });
    document.querySelectorAll("[data-manual-offset]").forEach(btn => {
      btn.addEventListener("click", () => {
        const offset = Number(btn.getAttribute("data-manual-offset"));
        if (this.manualLeaveDate) {
          this.manualLeaveDate.value = this.shiftDateStr(this.getDateStr(), offset);
          this.refreshManualAttendancePreview();
        }
      });
    });

    this.backfillDateInput?.addEventListener("change", () => {
      if (this.backfillDateInput.value) {
        this.backfillDate = this.backfillDateInput.value;
        this.renderBackfillBoard();
      }
    });
    this.historyDateSelect?.addEventListener("change", () => {
      if (this.historyDateSelect.value) {
        this.backfillDate = this.historyDateSelect.value;
        this.renderBackfillBoard();
      }
    });
    document.getElementById("backfillPrevBtn")?.addEventListener("click", () => {
      this.backfillDate = this.shiftDateStr(this.backfillDate, -1);
      this.renderBackfillBoard();
    });
    document.getElementById("backfillNextBtn")?.addEventListener("click", () => {
      this.backfillDate = this.shiftDateStr(this.backfillDate, 1);
      this.renderBackfillBoard();
    });
    document.getElementById("backfillTodayBtn")?.addEventListener("click", () => {
      this.backfillDate = this.getDateStr();
      this.renderBackfillBoard();
    });
    document.getElementById("backfillYesterdayBtn")?.addEventListener("click", () => {
      this.backfillDate = this.shiftDateStr(this.getDateStr(), -1);
      this.renderBackfillBoard();
    });
    document.getElementById("backfillLastWeekBtn")?.addEventListener("click", () => {
      this.backfillDate = this.shiftDateStr(this.getDateStr(), -7);
      this.renderBackfillBoard();
    });

    this.leaveDateFilterInput?.addEventListener("change", () => {
      this.leaveDateFilter = this.leaveDateFilterInput.value || "";
      this.renderLeaveRecordsTable();
    });
    document.getElementById("clearLeaveDateFilterBtn")?.addEventListener("click", () => {
      this.leaveDateFilter = "";
      if (this.leaveDateFilterInput) this.leaveDateFilterInput.value = "";
      this.renderLeaveRecordsTable();
    });

    // ── 請假紀錄篩選 ──
    if (this.leaveSearchInput) {
      this.leaveSearchInput.addEventListener("input", e => {
        this.leaveSearchQuery = e.target.value.trim().toLowerCase();
        this.renderLeaveRecordsTable();
      });
    }
    document.querySelectorAll(".filter-pill-type").forEach(pill => {
      pill.addEventListener("click", () => {
        document.querySelectorAll(".filter-pill-type").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.currentLeaveFilter = pill.getAttribute("data-leave-filter");
        this.renderLeaveRecordsTable();
      });
    });

    // ── 請假/警戒 子頁切換 ──
    document.querySelectorAll(".records-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".records-tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const sub = btn.getAttribute("data-subtab");
        document.querySelectorAll(".subtab-content").forEach(p => {
          p.style.display = p.id === `subtab-${sub}` ? "block" : "none";
        });
        if (sub === "warning-monitor") this.renderWarningMonitor();
        if (sub === "attendance-backfill") this.renderBackfillBoard();
      });
    });

    // ── 請假清冊匯出 ──
    if (this.exportLeaveRecordsCsvBtn) {
      this.exportLeaveRecordsCsvBtn.addEventListener("click", () => this.exportLeaveRecordsCsv());
    }

    // ── 分組管理 ──
    if (this.randomGroupBtn) {
      this.randomGroupBtn.addEventListener("click", () => this.randomizeGroups());
    }
    if (this.addGroupBtn) {
      this.addGroupBtn.addEventListener("click", () => this.addEmptyGroup());
    }
    if (this.exportGroupsCsvBtn) {
      this.exportGroupsCsvBtn.addEventListener("click", () => this.exportGroupsCsv());
    }
    if (this.copyGroupsTextBtn) {
      this.copyGroupsTextBtn.addEventListener("click", () => this.copyGroupsText());
    }
    if (this.groupingRuleRadios) {
      document.querySelectorAll('input[name="groupingRule"]').forEach(r => {
        r.addEventListener("change", e => {
          if (this.groupCountLabel) {
            this.groupCountLabel.textContent = e.target.value === "byGroupCount" ? "目標組數：" : "每組人數：";
          }
        });
      });
    }

    // ── 新增學生 ──
    this.openAddStudentModalBtn.addEventListener("click", () => this.openModal(this.addStudentModal));
    this.addStudentForm.addEventListener("submit", e => {
      e.preventDefault();
      const name  = document.getElementById("newStudentName").value.trim();
      const id    = document.getElementById("newStudentId").value.trim();
      const group = document.getElementById("newStudentGroup").value.trim() || "未分組";
      const email = document.getElementById("newStudentEmail").value.trim() || `${id}@univ.edu.tw`;
      if (!name || !id) return;
      if (this.students.some(s => s.id === id)) { alert("此學號已存在於名單中！"); return; }
      this.students.unshift({ id, name, group, email, status: "unmarked", score: 0 });
      this.saveStudents(); this.render(); this.closeModal(this.addStudentModal);
      this.addStudentForm.reset();
      this.showToast(`已成功將 ${name} 加入課堂名單！`, "success"); sfx.playFanfare();
    });

    // ── 備份匯出 ──
    this.exportImportBtn.addEventListener("click", () => this.openModal(this.exportImportModal));
    document.getElementById("exportCsvBtn")?.addEventListener("click", () => this.exportCsv());
    document.getElementById("exportJsonBtn")?.addEventListener("click", () => this.exportJson());
    document.getElementById("restoreDefaultListBtn")?.addEventListener("click", () => {
      if (confirm("確定要恢復為 20 位預設名單嗎？現有客製資料將被替換。")) {
        this.students = JSON.parse(JSON.stringify(DEFAULT_STUDENTS));
        this.saveStudents(); this.render(); this.closeModal(this.exportImportModal);
        this.showToast("已成功恢復預設學生名冊！", "info");
      }
    });
  }

  // ==========================================
  // 5. 主渲染
  // ==========================================
  render() {
    this.renderStats();
    this.renderList();
    this.updateCandidateCount();
    this.renderSpeedMode();
    if (this.currentMode === "groups-mode")  this.renderGroupsMode();
    if (this.currentMode === "records-mode") {
      this.renderLeaveRecordsTable();
      this.renderLeaveMetrics();
      const backfillPane = document.getElementById("subtab-attendance-backfill");
      if (backfillPane && backfillPane.style.display !== "none") this.renderBackfillBoard();
    }
  }

  renderStats() {
    const total    = this.students.length;
    const present  = this.students.filter(s => s.status === "present").length;
    const leave    = this.students.filter(s => s.status === "leave").length;
    const absent   = this.students.filter(s => s.status === "absent").length;
    const unmarked = this.students.filter(s => !s.status || s.status === "unmarked").length;

    this.statTotalCount.textContent   = total;
    this.statPresentCount.textContent = present;
    this.statLeaveCount.textContent   = leave;
    this.statAbsentCount.textContent  = absent;
    this.notifyBadgeNum.textContent   = absent;

    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    this.attendanceRateText.textContent    = `${rate}%`;
    this.statPresentRatioBadge.textContent = `${rate}% 出席率`;

    const circ = 263.89;
    this.gaugeFill.style.strokeDashoffset = circ - (circ * rate / 100);
    if (rate >= 85) {
      this.rateStatusChip.textContent = "出席率極佳 🌟"; this.rateStatusChip.className = "status-chip good";
      this.gaugeFill.style.stroke = "var(--emerald)";
    } else if (rate >= 65) {
      this.rateStatusChip.textContent = "出席率良好 👍"; this.rateStatusChip.className = "status-chip good";
      this.gaugeFill.style.stroke = "var(--primary)";
    } else {
      this.rateStatusChip.textContent = "出席率偏低 ⚠️"; this.rateStatusChip.className = "status-chip warning";
      this.gaugeFill.style.stroke = "var(--rose)";
    }

    document.getElementById("countPillAll").textContent      = total;
    document.getElementById("countPillPresent").textContent  = present;
    document.getElementById("countPillLeave").textContent    = leave;
    document.getElementById("countPillAbsent").textContent   = absent;
    document.getElementById("countPillUnmarked").textContent = unmarked;
  }

  getFilteredStudents() {
    return this.students.filter(s => {
      if (this.currentFilter !== "all") {
        if (this.currentFilter === "unmarked") { if (s.status && s.status !== "unmarked") return false; }
        else if (s.status !== this.currentFilter) return false;
      }
      if (this.searchQuery) {
        const q = this.searchQuery;
        return s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || (s.email||"").toLowerCase().includes(q);
      }
      return true;
    });
  }

  renderList() {
    const list = this.getFilteredStudents();
    this.studentsGrid.innerHTML = "";
    this.noResultsState.style.display = list.length === 0 ? "block" : "none";
    if (!list.length) return;

    const frag = document.createDocumentFragment();
    list.forEach(student => {
      const card = document.createElement("div");
      card.className = `student-card status-${student.status || "unmarked"}`;
      const initial    = (student.name || "生").charAt(0);
      const bgGradient = AVATAR_GRADIENTS[Math.abs(this.hashString(student.id)) % AVATAR_GRADIENTS.length];
      const leaveRec   = student.status === "leave"
        ? (this.findLeaveRecordOnDate(student.id, this.getDateStr()) || this.getLatestLeaveRecord(student.id))
        : null;
      const leaveBadge = leaveRec
        ? `<span class="leave-pill-badge ${LEAVE_TYPES[leaveRec.leaveType]?.badgeClass || ''}">${LEAVE_TYPES[leaveRec.leaveType]?.icon || ''} ${LEAVE_TYPES[leaveRec.leaveType]?.label || leaveRec.leaveType}</span>`
        : "";

      card.innerHTML = `
        <div class="card-top">
          <div class="avatar" style="background:${bgGradient}">${initial}</div>
          <div class="student-info">
            <div class="info-header">
              <span class="student-name" title="${student.name}">${student.name}</span>
              <span class="student-group-tag">${student.group || "未分組"}</span>
            </div>
            <div class="student-id">${student.id} ${leaveBadge}</div>
            <div class="student-email" title="${student.email||""}">${student.email||"無信箱"}</div>
          </div>
        </div>
        <div class="status-toggle-group">
          <button class="status-btn btn-state-present ${student.status==="present"?"active":""}" data-status="present">✓ 出席</button>
          <button class="status-btn btn-state-leave   ${student.status==="leave"?"active":""}"   data-status="leave">⏱ 請假</button>
          <button class="status-btn btn-state-absent  ${student.status==="absent"?"active":""}"  data-status="absent">✕ 缺席</button>
        </div>
        <div class="card-bottom">
          <div class="score-control">
            <span>平時分:</span>
            <span class="score-badge">${student.score||0}</span>
            <button class="mini-score-btn" data-score-action="minus">-</button>
            <button class="mini-score-btn" data-score-action="plus">+</button>
          </div>
          <button class="delete-student-btn" title="從名冊移除">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      `;

      // 狀態切換（請假按鈕彈出 Picker）
      card.querySelectorAll(".status-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const status = btn.getAttribute("data-status");
          if (status === "leave") {
            this.openLeavePicker(student.id);
          } else {
            this.updateStudentStatus(student.id, status, true);
            sfx.playPop();
          }
        });
      });

      // 分數
      card.querySelector('[data-score-action="plus"]').addEventListener("click", () => { this.addStudentScore(student.id, 1);  sfx.playPop(); });
      card.querySelector('[data-score-action="minus"]').addEventListener("click", () => { this.addStudentScore(student.id, -1); sfx.playPop(); });

      // 刪除
      card.querySelector(".delete-student-btn").addEventListener("click", () => {
        if (confirm(`確定要從名單中刪除 ${student.name} (${student.id}) 嗎？`)) this.deleteStudent(student.id);
      });

      frag.appendChild(card);
    });
    this.studentsGrid.appendChild(frag);
  }

  // ==========================================
  // 6. 請假類別 Picker
  // ==========================================
  openLeavePicker(studentId, date) {
    const student = this.students.find(s => s.id === studentId);
    if (!student) return;
    this._pendingLeaveStudentId = studentId;
    this.leavePickerStudentName.textContent    = student.name;
    this.leavePickerStudentId.textContent      = student.id;
    this.leavePickerStudentIdInput.value       = studentId;
    const targetDate = date || this.getDateStr();
    if (this.leavePickerDate) this.leavePickerDate.value = targetDate;
    this._prefillLeavePickerForDate(studentId, targetDate);
    this.openModal(this.leavePickerModal);
  }

  _prefillLeavePickerForDate(studentId, date) {
    const rec = this.findLeaveRecordOnDate(studentId, date);
    const lastRec = rec || this.getLatestLeaveRecord(studentId);
    if (this.leaveReasonInput) this.leaveReasonInput.value = rec?.reason || "";
    const defaultType = rec?.leaveType || lastRec?.leaveType || "personal";
    const radio = document.querySelector(`input[name="selectedLeaveType"][value="${defaultType}"]`);
    if (radio) radio.checked = true;
  }

  confirmLeavePicker() {
    const studentId  = this.leavePickerStudentIdInput.value;
    const leaveType  = document.querySelector('input[name="selectedLeaveType"]:checked')?.value || "personal";
    const reason     = this.leaveReasonInput.value.trim();
    const student    = this.students.find(s => s.id === studentId);
    const date       = this.leavePickerDate?.value || this.getDateStr();
    if (!student || !date) return;

    const { isUpdate } = this.setAttendanceForDate(studentId, date, "leave", {
      leaveType,
      reason,
      approvalStatus: date === this.getDateStr() ? "pending" : "approved"
    });

    this.closeModal(this.leavePickerModal);
    this.render();
    sfx.playPop();

    const typeInfo = LEAVE_TYPES[leaveType];
    this.showToast(
      isUpdate
        ? `已更新 ${student.name} 於 ${this.formatDateLabel(date)} 的請假為 ${typeInfo?.icon||""} ${typeInfo?.label||leaveType}`
        : `已為 ${student.name} 補登 ${this.formatDateLabel(date)} 的 ${typeInfo?.icon||""} ${typeInfo?.label||leaveType}`,
      "success"
    );

    if (this.luckyWinner?.id === studentId) this.updateWinnerStatusButtons();
  }

  getLatestLeaveRecord(studentId) {
    const recs = this.leaveRecords.filter(r => r.studentId === studentId);
    recs.sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt));
    return recs[0] || null;
  }

  // ==========================================
  // 7. 補登請假 Modal
  // ==========================================
  openManualLeaveModal(preset = {}) {
    this.manualLeaveStudentSelect.innerHTML = "";
    this.students.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s.id; opt.textContent = `${s.name}（${s.id}）`;
      this.manualLeaveStudentSelect.appendChild(opt);
    });
    if (preset.studentId) this.manualLeaveStudentSelect.value = preset.studentId;
    this.manualLeaveDate.value = preset.date || this.backfillDate || this.getDateStr();
    this.refreshManualAttendancePreview();
    this.openModal(this.manualLeaveModal);
  }

  syncManualLeaveFieldsVisibility() {
    const status = document.querySelector('input[name="manualAttendanceStatus"]:checked')?.value || "leave";
    document.querySelectorAll('input[name="manualAttendanceStatus"]').forEach(r => {
      r.closest(".status-btn")?.classList.toggle("active", r.checked);
    });
    if (this.manualLeaveFieldsWrap) {
      this.manualLeaveFieldsWrap.style.display = status === "leave" ? "block" : "none";
    }
  }

  refreshManualAttendancePreview() {
    const studentId = this.manualLeaveStudentSelect?.value;
    const date = this.manualLeaveDate?.value;
    if (!studentId || !date) return;
    const status = this.getAttendanceForDate(studentId, date);
    const radio = document.querySelector(`input[name="manualAttendanceStatus"][value="${status}"]`);
    if (radio) radio.checked = true;
    const rec = this.findLeaveRecordOnDate(studentId, date);
    if (rec) {
      if (this.manualLeaveType) this.manualLeaveType.value = rec.leaveType;
      if (this.manualLeaveReason) this.manualLeaveReason.value = rec.reason || "";
    } else if (this.manualLeaveReason && status !== "leave") {
      this.manualLeaveReason.value = "";
    }
    const labels = { present: "出席", leave: "請假", absent: "缺席", unmarked: "未標記" };
    const hasRecord = (this.attendanceLog[date] && this.attendanceLog[date][studentId] !== undefined) || !!rec;
    if (this.manualExistingHint) {
      this.manualExistingHint.textContent = hasRecord
        ? `已載入 ${this.formatDateLabel(date)} 的現況：${labels[status] || status}。儲存後會覆寫為該日最新狀態。`
        : `${this.formatDateLabel(date)} 尚無紀錄，儲存即為補登該日狀態。`;
    }
    this.syncManualLeaveFieldsVisibility();
  }

  submitManualLeave() {
    const studentId  = this.manualLeaveStudentSelect.value;
    const leaveType  = this.manualLeaveType.value;
    const date       = this.manualLeaveDate.value;
    const reason     = this.manualLeaveReason.value.trim();
    const status     = document.querySelector('input[name="manualAttendanceStatus"]:checked')?.value || "leave";
    const student    = this.students.find(s => s.id === studentId);
    if (!student || !date) { alert("請填寫完整資訊"); return; }

    const { isUpdate } = this.setAttendanceForDate(studentId, date, status, {
      leaveType,
      reason,
      approvalStatus: date === this.getDateStr() ? "pending" : "approved"
    });
    this.closeModal(this.manualLeaveModal);
    this.manualLeaveForm.reset();
    this.render();
    const labels = { present: "出席", leave: "請假", absent: "缺席", unmarked: "未標記" };
    const typeInfo = LEAVE_TYPES[leaveType];
    const detail = status === "leave"
      ? `${typeInfo?.icon || ""} ${typeInfo?.label || ""}`
      : labels[status];
    this.showToast(
      isUpdate
        ? `已修改 ${student.name} 於 ${this.formatDateLabel(date)} 的出缺席為 ${detail}`
        : `已補登 ${student.name} 於 ${this.formatDateLabel(date)} 的出缺席為 ${detail}`,
      "success"
    );
    sfx.playFanfare();
  }

  renderBackfillBoard() {
    if (!this.backfillTableBody) return;
    const date = this.backfillDate || this.getDateStr();
    this.backfillDate = date;
    if (this.backfillDateInput) this.backfillDateInput.value = date;

    const knownDates = this.getKnownAttendanceDates();
    if (this.historyDateSelect) {
      this.historyDateSelect.innerHTML = `<option value="">已有紀錄的日期…</option>` +
        knownDates.map(d => {
          const selected = d === date ? "selected" : "";
          return `<option value="${d}" ${selected}>${this.formatDateLabel(d)}</option>`;
        }).join("");
    }

    const today = this.getDateStr();
    document.getElementById("backfillTodayBtn")?.classList.toggle("active", date === today);
    document.getElementById("backfillYesterdayBtn")?.classList.toggle("active", date === this.shiftDateStr(today, -1));
    document.getElementById("backfillLastWeekBtn")?.classList.toggle("active", date === this.shiftDateStr(today, -7));

    const counts = { present: 0, leave: 0, absent: 0, unmarked: 0 };
    const labels = { present: "出席", leave: "請假", absent: "缺席", unmarked: "未標記" };
    this.backfillTableBody.innerHTML = "";

    this.students.forEach(s => {
      const status = this.getAttendanceForDate(s.id, date);
      counts[status] = (counts[status] || 0) + 1;
      const rec = this.findLeaveRecordOnDate(s.id, date);
      const typeInfo = rec ? (LEAVE_TYPES[rec.leaveType] || {}) : {};
      const leaveInfo = rec
        ? `<span class="leave-pill-badge ${typeInfo.badgeClass || ""}">${typeInfo.icon || ""} ${typeInfo.label || rec.leaveType}</span>
           <div class="text-muted text-sm">${rec.reason || ""}</div>`
        : `<span class="text-muted text-sm">${status === "leave" ? "尚未填假別" : "—"}</span>`;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="font-weight:700">${s.id}</td>
        <td style="font-weight:700">${s.name}</td>
        <td style="color:var(--text-secondary)">${s.group || "未分組"}</td>
        <td><strong>${labels[status] || status}</strong></td>
        <td>${leaveInfo}</td>
        <td>
          <div class="status-toggle-group" style="grid-template-columns:repeat(4,minmax(0,1fr));min-width:280px;">
            <button type="button" class="status-btn btn-state-present ${status === "present" ? "active" : ""}" data-backfill-status="present">✓ 出席</button>
            <button type="button" class="status-btn btn-state-leave ${status === "leave" ? "active" : ""}" data-backfill-status="leave">⏱ 請假</button>
            <button type="button" class="status-btn btn-state-absent ${status === "absent" ? "active" : ""}" data-backfill-status="absent">✕ 缺席</button>
            <button type="button" class="status-btn btn-state-unmarked ${status === "unmarked" ? "active" : ""}" data-backfill-status="unmarked">○ 未標記</button>
          </div>
        </td>
      `;
      tr.querySelectorAll("[data-backfill-status]").forEach(btn => {
        btn.addEventListener("click", () => {
          const nextStatus = btn.getAttribute("data-backfill-status");
          if (nextStatus === "leave") {
            this.openLeavePicker(s.id, date);
            return;
          }
          const { isUpdate } = this.setAttendanceForDate(s.id, date, nextStatus);
          this.renderBackfillBoard();
          this.renderLeaveRecordsTable();
          this.renderStats();
          this.renderList();
          sfx.playPop();
          this.showToast(`已${isUpdate ? "修改" : "補登"} ${s.name} 於 ${this.formatDateLabel(date)} 為 ${labels[nextStatus]}`, "success");
        });
      });
      this.backfillTableBody.appendChild(tr);
    });

    const setStat = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setStat("backfillStatPresent", counts.present);
    setStat("backfillStatLeave", counts.leave);
    setStat("backfillStatAbsent", counts.absent);
    setStat("backfillStatUnmarked", counts.unmarked);
  }

  // ==========================================
  // 8. 請假紀錄查詢頁
  // ==========================================
  renderLeaveMetrics() {
    const counts = { official:0, personal:0, mental:0, bereavement:0, sick:0 };
    this.leaveRecords.forEach(r => { if (counts[r.leaveType] !== undefined) counts[r.leaveType]++; });
    document.getElementById("metricCountOfficial")?.let?.(el => el.textContent = counts.official);
    document.getElementById("metricCountPersonal")?.let?.(el => el.textContent = counts.personal);
    document.getElementById("metricCountMental")?.let?.(el => el.textContent = counts.mental);
    document.getElementById("metricCountBereavement")?.let?.(el => el.textContent = counts.bereavement);
    document.getElementById("metricCountSick")?.let?.(el => el.textContent = counts.sick);
    // 用 getElementById 再確保
    const ids = ["Official","Personal","Mental","Bereavement","Sick"];
    const keys = ["official","personal","mental","bereavement","sick"];
    ids.forEach((id,i) => {
      const el = document.getElementById(`metricCount${id}`);
      if (el) el.textContent = counts[keys[i]];
    });
  }

  getFilteredLeaveRecords() {
    return this.leaveRecords.filter(r => {
      if (this.currentLeaveFilter !== "all" && r.leaveType !== this.currentLeaveFilter) return false;
      if (this.leaveDateFilter && r.date !== this.leaveDateFilter) return false;
      if (this.leaveSearchQuery) {
        const q = this.leaveSearchQuery;
        if (!(r.studentName.toLowerCase().includes(q) || r.studentId.toLowerCase().includes(q) || (r.reason||"").toLowerCase().includes(q))) {
          return false;
        }
      }
      return true;
    });
  }

  renderLeaveRecordsTable() {
    if (!this.leaveRecordsTableBody) return;
    const records = this.getFilteredLeaveRecords();

    // 更新計數
    if (this.totalLeaveRecordsCount) this.totalLeaveRecordsCount.textContent = this.leaveRecords.length;

    const tbody = this.leaveRecordsTableBody;
    tbody.innerHTML = "";

    if (!records.length) {
      this.noLeaveRecordsState.style.display = "block"; return;
    }
    this.noLeaveRecordsState.style.display = "none";

    records.forEach(rec => {
      const typeInfo  = LEAVE_TYPES[rec.leaveType] || { icon:"❓", label:rec.leaveType, badgeClass:"" };
      const logDate   = new Date(rec.loggedAt);
      const logStr    = `${logDate.getFullYear()}/${String(logDate.getMonth()+1).padStart(2,'0')}/${String(logDate.getDate()).padStart(2,'0')} ${String(logDate.getHours()).padStart(2,'0')}:${String(logDate.getMinutes()).padStart(2,'0')}`;
      const statusBadge = rec.status === "approved"
        ? `<span style="color:#059669;font-weight:700;font-size:0.78rem;">✓ 已核准</span>`
        : `<span style="color:#d97706;font-weight:700;font-size:0.78rem;">⏳ 待審核</span>`;
      const liveMap = { present:"出席", leave:"請假", absent:"缺席", unmarked:"未標記" };
      const dayStatus = this.getAttendanceForDate(rec.studentId, rec.date);
      const liveBadge = rec.date === this.getDateStr()
        ? `<span style="color:#4f46e5;font-weight:800;font-size:0.78rem;">● ${liveMap[dayStatus] || "未標記"}（當日最新）</span>`
        : `<span style="color:var(--text-muted);font-size:0.78rem;">${this.formatDateLabel(rec.date)} · ${liveMap[dayStatus] || "歷史"}</span>`;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="font-weight:700;white-space:nowrap">${this.formatDateLabel(rec.date)}</td>
        <td style="color:var(--text-muted);font-size:0.82rem;white-space:nowrap">${logStr}</td>
        <td style="font-weight:700">${rec.studentId}</td>
        <td style="font-weight:700">${rec.studentName}</td>
        <td style="color:var(--text-secondary)">${rec.studentGroup}</td>
        <td><span class="leave-pill-badge ${typeInfo.badgeClass}">${typeInfo.icon} ${typeInfo.label}</span></td>
        <td style="max-width:220px;color:var(--text-secondary)">${rec.reason || "-"}</td>
        <td>${statusBadge}</td>
        <td>${liveBadge}</td>
        <td>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button class="btn btn-outline" style="padding:4px 10px;font-size:0.76rem;" data-action="edit" data-id="${rec.id}">修改</button>
            <button class="btn btn-secondary-emerald" style="padding:4px 10px;font-size:0.76rem;" data-action="approve" data-id="${rec.id}">核准</button>
            <button class="btn btn-outline" style="padding:4px 10px;font-size:0.76rem;color:var(--rose)" data-action="delete" data-id="${rec.id}">刪除</button>
          </div>
        </td>
      `;
      tr.querySelector('[data-action="edit"]').addEventListener("click", () => {
        this.backfillDate = rec.date;
        this.openManualLeaveModal({ studentId: rec.studentId, date: rec.date });
      });
      tr.querySelector('[data-action="approve"]').addEventListener("click", () => {
        this.updateLeaveStatus(rec.id, "approved");
      });
      tr.querySelector('[data-action="delete"]').addEventListener("click", () => {
        if (confirm(`確定要刪除 ${rec.studentName} 於 ${rec.date} 的 ${typeInfo.label} 紀錄嗎？`)) {
          this.deleteLeaveRecord(rec.id);
        }
      });
      tbody.appendChild(tr);
    });

    this.renderLeaveMetrics();
  }

  updateLeaveStatus(recordId, status) {
    const rec = this.leaveRecords.find(r => r.id === recordId);
    if (rec) { rec.status = status; this.saveLeaveRecords(); this.renderLeaveRecordsTable(); this.showToast("請假紀錄已更新！", "success"); }
  }

  deleteLeaveRecord(recordId) {
    const rec = this.leaveRecords.find(r => r.id === recordId);
    if (!rec) return;
    this.setAttendanceForDate(rec.studentId, rec.date, "unmarked");
    this.render();
    this.showToast(`已刪除 ${rec.studentName} 於 ${this.formatDateLabel(rec.date)} 的請假，並同步該日出缺席`, "info");
  }

  exportLeaveRecordsCsv() {
    let csv = "\uFEFF日期,學號,姓名,分組,請假類別,事由說明,審核狀態,登記時間\n";
    this.leaveRecords.forEach(r => {
      const typeInfo = LEAVE_TYPES[r.leaveType];
      csv += `"${r.date}","${r.studentId}","${r.studentName}","${r.studentGroup}","${typeInfo?.label||r.leaveType}","${r.reason||""}","${r.status==="approved"?"已核准":"待審核"}","${r.loggedAt}"\n`;
    });
    const blob = new Blob([csv], { type:"text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "請假紀錄清冊.csv"; a.click();
    URL.revokeObjectURL(url);
    this.showToast("已成功匯出請假紀錄 CSV！", "success");
  }

  // ==========================================
  // 9. 警戒監控 (Warning Monitor)
  // ==========================================
  renderWarningMonitor() {
    if (!this.warningCardsGrid) return;
    this.warningCardsGrid.innerHTML = "";

    // 計算每位學生累積缺席次數與請假次數（含歷史日期，同一日僅計最新一筆）
    const absentCounts = {};
    const leaveCounts  = {};
    const leaveDays    = {};
    Object.entries(this.attendanceLog || {}).forEach(([, dayMap]) => {
      Object.entries(dayMap || {}).forEach(([sid, status]) => {
        if (status === "absent") absentCounts[sid] = (absentCounts[sid] || 0) + 1;
      });
    });
    this.leaveRecords.forEach(r => {
      const key = `${r.studentId}|${r.date}`;
      if (leaveDays[key]) return;
      leaveDays[key] = true;
      leaveCounts[r.studentId] = (leaveCounts[r.studentId]||0) + 1;
    });
    const today = this.getDateStr();
    this.students.forEach(s => {
      if (s.status === "leave" && !leaveDays[`${s.id}|${today}`]) {
        leaveCounts[s.id] = (leaveCounts[s.id]||0) + 1;
      }
    });

    // 篩選達到門檻的學生
    const warnings = this.students.filter(s => {
      const absNum  = absentCounts[s.id] || 0;
      const leaveNum = leaveCounts[s.id] || 0;
      return absNum >= 2 || leaveNum >= 3;
    }).map(s => ({
      student: s,
      absent:  absentCounts[s.id] || 0,
      leave:   leaveCounts[s.id]  || 0,
      riskLevel: (absentCounts[s.id]||0) >= 3 ? "severe" : "caution"
    }));

    warnings.sort((a,b) => b.absent - a.absent);

    if (this.totalWarningCount) this.totalWarningCount.textContent = warnings.length;

    if (!warnings.length) {
      this.noWarningState.style.display = "block"; return;
    }
    this.noWarningState.style.display = "none";

    warnings.forEach(({ student, absent, leave, riskLevel }) => {
      const bgGrad = AVATAR_GRADIENTS[Math.abs(this.hashString(student.id)) % AVATAR_GRADIENTS.length];
      const card = document.createElement("div");
      card.className = `warning-card risk-${riskLevel}`;
      const tagClass = riskLevel === "severe" ? "risk-severe-tag" : "risk-caution-tag";
      const tagLabel = riskLevel === "severe" ? "🚨 嚴重扣考危機" : "⚠️ 警戒注意";

      card.innerHTML = `
        <div class="warning-card-header">
          <div style="display:flex;align-items:center;gap:10px">
            <div class="member-avatar-mini" style="width:38px;height:38px;font-size:1rem;background:${bgGrad}">${student.name.charAt(0)}</div>
            <div>
              <div style="font-weight:800;font-size:1rem;color:var(--text-primary)">${student.name}</div>
              <div style="font-size:0.78rem;color:var(--text-muted)">${student.id} · ${student.group||"未分組"}</div>
            </div>
          </div>
          <span class="risk-tag ${tagClass}">${tagLabel}</span>
        </div>
        <div class="warning-metrics-row">
          <span>缺席次數：<strong>${absent}</strong> 次</span>
          <span style="color:var(--text-muted)">|</span>
          <span>請假次數：<strong style="color:var(--amber)">${leave}</strong> 次</span>
          <span style="color:var(--text-muted)">|</span>
          <span>信箱：<span style="font-size:0.78rem;color:var(--primary)">${student.email||"無"}</span></span>
        </div>
        <div class="warning-action-row">
          <a href="mailto:${student.email||""}" class="btn btn-secondary-emerald" style="font-size:0.8rem;padding:5px 12px">✉️ 個別聯繫</a>
          <button class="btn btn-outline" style="font-size:0.8rem;padding:5px 12px;color:var(--primary)" data-view-leave="${student.id}">📋 查看請假紀錄</button>
        </div>
      `;
      card.querySelector(`[data-view-leave]`).addEventListener("click", () => {
        this.switchTab("records-mode");
        if (this.leaveSearchInput) {
          this.leaveSearchInput.value = student.name;
          this.leaveSearchQuery = student.name;
        }
        this.renderLeaveRecordsTable();
      });
      this.warningCardsGrid.appendChild(card);
    });
  }

  // ==========================================
  // 10. 分組管理
  // ==========================================
  renderGroupsMode() {
    if (!this.groupsGrid) return;

    const pool = this.getGroupPool();
    if (this.groupTotalStudentsCount) this.groupTotalStudentsCount.textContent = pool.length;
    if (this.groupTotalTeamsCount)    this.groupTotalTeamsCount.textContent    = this.groups.length;

    this.groupsGrid.innerHTML = "";
    if (!this.groups.length) {
      this.groupsGrid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted)">
          <div style="font-size:2.5rem;margin-bottom:10px">👥</div>
          <h4>尚未建立分組</h4>
          <p>點擊「🎲 執行隨機分組」自動分配，或「➕ 手動新增小組」建立空組</p>
        </div>`;
      this.unassignedDock.style.display = "none";
      return;
    }

    // 找出所有已分組的 studentId
    const assignedIds = new Set(this.groups.flatMap(g => g.members));
    const unassigned  = pool.filter(s => !assignedIds.has(s.id));

    this.groups.forEach((group, gIdx) => {
      const card = document.createElement("div");
      card.className = "group-card";
      const colorBg  = GROUP_COLORS[gIdx % GROUP_COLORS.length];
      const members   = group.members.map(id => this.students.find(s => s.id === id)).filter(Boolean);

      card.innerHTML = `
        <div class="group-card-header">
          <div style="display:flex;align-items:center;gap:8px">
            <div style="width:14px;height:14px;border-radius:50%;background:${colorBg}"></div>
            <input class="group-title-input" value="${group.name||`第 ${gIdx+1} 組`}" placeholder="小組名稱">
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="group-score-badge">⭐ 小組分：${group.score||0}</span>
            <button class="mini-score-btn" data-gaction="scoreup" title="小組加分">+</button>
            <button class="delete-student-btn" data-gaction="delete" style="color:#cbd5e1" title="刪除小組">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="group-members-list">
          ${members.length
            ? members.map(s => {
                const bg = AVATAR_GRADIENTS[Math.abs(this.hashString(s.id)) % AVATAR_GRADIENTS.length];
                return `
                  <div class="group-member-item">
                    <div class="member-info">
                      <div class="member-avatar-mini" style="background:${bg}">${s.name.charAt(0)}</div>
                      <div>
                        <div class="member-name">${s.name}</div>
                        <div class="member-id">${s.id}</div>
                      </div>
                    </div>
                    <button class="delete-student-btn" data-gmremove="${s.id}" style="color:#cbd5e1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>`;
              }).join("")
            : `<div style="text-align:center;color:var(--text-muted);padding:20px;font-size:0.82rem">空組，尚無成員</div>`
          }
        </div>
        <div class="group-card-footer">
          <span style="font-size:0.82rem;color:var(--text-muted)">${members.length} 位成員</span>
        </div>
      `;

      // 組名更新
      card.querySelector(".group-title-input").addEventListener("change", e => {
        this.groups[gIdx].name = e.target.value; this.saveGroups();
      });
      // 加分
      card.querySelector('[data-gaction="scoreup"]').addEventListener("click", () => {
        this.groups[gIdx].score = (this.groups[gIdx].score||0) + 1;
        this.saveGroups(); this.renderGroupsMode(); sfx.playPop();
      });
      // 刪除組
      card.querySelector('[data-gaction="delete"]').addEventListener("click", () => {
        if (confirm(`確定要刪除「${group.name}」？`)) {
          this.groups.splice(gIdx, 1); this.saveGroups(); this.renderGroupsMode();
        }
      });
      // 移除成員
      card.querySelectorAll("[data-gmremove]").forEach(btn => {
        btn.addEventListener("click", () => {
          const sid = btn.getAttribute("data-gmremove");
          this.groups[gIdx].members = this.groups[gIdx].members.filter(id => id !== sid);
          this.saveGroups(); this.renderGroupsMode();
        });
      });

      this.groupsGrid.appendChild(card);
    });

    // 未分組停泊區
    if (unassigned.length) {
      this.unassignedDock.style.display = "block";
      this.unassignedCount.textContent  = unassigned.length;
      this.unassignedChips.innerHTML    = "";
      unassigned.forEach(s => {
        const chip = document.createElement("div");
        chip.className = "unassigned-chip";
        chip.textContent = `${s.name} (${s.id})`;
        chip.title = "點選以分配至某組";
        chip.addEventListener("click", () => this.showGroupSelectPrompt(s.id));
        this.unassignedChips.appendChild(chip);
      });
    } else {
      this.unassignedDock.style.display = "none";
    }
  }

  getGroupPool() {
    const excludeAbsent = this.groupExcludeAbsentCheck?.checked;
    return excludeAbsent
      ? this.students.filter(s => s.status !== "absent" && s.status !== "leave")
      : this.students;
  }

  randomizeGroups() {
    const pool = [...this.getGroupPool()];
    const rule = document.querySelector('input[name="groupingRule"]:checked')?.value || "byGroupCount";
    const val  = parseInt(this.groupCountInput?.value || "4");
    if (pool.length < 2) { alert("可分組學生不足 2 人，無法進行分組！"); return; }

    let groupCount;
    if (rule === "byGroupCount") {
      groupCount = Math.min(val, pool.length);
    } else {
      groupCount = Math.max(1, Math.ceil(pool.length / val));
    }

    // Fisher-Yates 洗牌
    for (let i = pool.length-1; i > 0; i--) {
      const j = Math.floor(Math.random()*(i+1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    this.groups = Array.from({ length: groupCount }, (_, i) => ({
      name: `第 ${i+1} 組`,
      members: [],
      score: 0
    }));

    pool.forEach((s, idx) => {
      this.groups[idx % groupCount].members.push(s.id);
    });

    this.saveGroups(); this.renderGroupsMode();
    sfx.playFanfare();
    this.showToast(`🎲 已將 ${pool.length} 位學生隨機分成 ${groupCount} 組！`, "success");
  }

  addEmptyGroup() {
    this.groups.push({ name: `第 ${this.groups.length+1} 組`, members: [], score: 0 });
    this.saveGroups(); this.renderGroupsMode();
    this.showToast("已新增空組，可將未分組學生拖入指定組別", "info");
  }

  showGroupSelectPrompt(studentId) {
    const student = this.students.find(s => s.id === studentId);
    if (!student || !this.groups.length) { alert("請先建立小組後再分配成員！"); return; }
    const opts = this.groups.map((g,i) => `${i}. ${g.name} (${g.members.length}人)`).join("\n");
    const input = prompt(`將 ${student.name} 加入哪一組？\n（輸入組別序號，從 0 開始）\n\n${opts}`);
    const idx = parseInt(input);
    if (isNaN(idx) || idx < 0 || idx >= this.groups.length) { alert("無效的組別序號！"); return; }
    // 從其他組移除
    this.groups.forEach(g => { g.members = g.members.filter(id => id !== studentId); });
    this.groups[idx].members.push(studentId);
    this.saveGroups(); this.renderGroupsMode();
    this.showToast(`已將 ${student.name} 移至 ${this.groups[idx].name}`, "success");
  }

  exportGroupsCsv() {
    if (!this.groups.length) { alert("請先建立分組！"); return; }
    let csv = "\uFEFF小組名稱,學號,姓名,出席狀態,平時分\n";
    this.groups.forEach(g => {
      if (!g.members.length) {
        csv += `"${g.name}","","（空組）","",""\n`;
      } else {
        g.members.forEach(id => {
          const s = this.students.find(st => st.id === id);
          if (s) csv += `"${g.name}","${s.id}","${s.name}","${s.status||"未標記"}",${s.score||0}\n`;
        });
      }
    });
    const blob = new Blob([csv], { type:"text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "課堂分組名冊.csv"; a.click(); URL.revokeObjectURL(url);
    this.showToast("已成功匯出分組名冊 CSV！", "success");
  }

  copyGroupsText() {
    if (!this.groups.length) { alert("請先建立分組！"); return; }
    let text = `📋 課堂分組名單\n${"─".repeat(30)}\n`;
    this.groups.forEach(g => {
      const memberNames = g.members.map(id => this.students.find(s=>s.id===id)?.name||id).join("、");
      text += `\n${g.name}（${g.members.length}人）\n　成員：${memberNames || "（空組）"}\n`;
    });
    navigator.clipboard.writeText(text).then(() => {
      this.showToast("分組名單已複製至剪貼簿！", "success"); sfx.playPop();
    });
  }

  // ==========================================
  // 11. 隨機抽點 (Lucky Draw)
  // ==========================================
  getCandidatesForDraw() {
    return this.students.filter(s => {
      if (this.drawExcludeAbsentCheck.checked && (s.status==="absent"||s.status==="leave")) return false;
      if (this.drawNoRepeatCheck.checked && this.drawnHistory.some(h => h.studentId===s.id)) return false;
      return true;
    });
  }

  updateCandidateCount() {
    this.drawCandidateCount.textContent = this.getCandidatesForDraw().length;
  }

  triggerLuckyDraw() {
    if (this.isRolling) return;
    const candidates = this.getCandidatesForDraw();
    if (!candidates.length) { alert("候選池中無可抽點的學生！\n請調整排除設定或清空抽點歷史。"); return; }
    this.isRolling = true; this.startDrawBtn.disabled = true; this.drawBtnText.textContent = "幸運轉盤抽點中...";
    this.stageStandby.style.display = "none"; this.stageWinner.style.display = "none";
    this.stageRolling.style.display = "flex";

    let rollCount = 0, speed = 60;
    const stepRoll = () => {
      const tmp = candidates[Math.floor(Math.random()*candidates.length)];
      this.rollingAvatar.textContent = tmp.name.charAt(0);
      this.rollingName.textContent   = tmp.name;
      this.rollingId.textContent     = `${tmp.id} · ${tmp.group||"學生"}`;
      sfx.playTick(); rollCount++;
      if (rollCount < 22) { speed += 12; setTimeout(stepRoll, speed); }
      else { const winner = candidates[Math.floor(Math.random()*candidates.length)]; this.finishLuckyDraw(winner); }
    };
    stepRoll();
  }

  finishLuckyDraw(winner) {
    this.isRolling = false; this.startDrawBtn.disabled = false; this.drawBtnText.textContent = "再次隨機抽點";
    this.luckyWinner = winner;
    this.stageRolling.style.display = "none"; this.stageWinner.style.display = "flex";
    const bg = AVATAR_GRADIENTS[Math.abs(this.hashString(winner.id)) % AVATAR_GRADIENTS.length];
    this.winnerAvatar.style.background = bg;
    this.winnerAvatar.textContent = winner.name.charAt(0);
    this.winnerName.textContent   = winner.name;
    this.winnerId.textContent     = `學號：${winner.id}`;
    this.winnerGroup.textContent  = winner.group || "全班同學";
    this.winnerScore.textContent  = winner.score || 0;
    const now = new Date();
    this.drawnHistory.unshift({ studentId:winner.id, name:winner.name, time:`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}` });
    this.renderDrawHistory(); this.updateCandidateCount(); this.updateWinnerStatusButtons(); sfx.playFanfare();
  }

  updateWinnerStatusButtons() {
    if (!this.luckyWinner) return;
    const s = this.luckyWinner.status;
    this.winnerMarkPresentBtn.classList.toggle("active", s==="present");
    this.winnerMarkLeaveBtn.classList.toggle("active",   s==="leave");
    this.winnerMarkAbsentBtn.classList.toggle("active",  s==="absent");
  }

  renderDrawHistory() {
    this.drawHistoryList.innerHTML = "";
    if (!this.drawnHistory.length) {
      this.drawHistoryList.innerHTML = `<li class="empty-history-item">尚未抽出任何學生</li>`; return;
    }
    this.drawnHistory.forEach((item, idx) => {
      const li = document.createElement("li"); li.className = "draw-history-item";
      li.innerHTML = `<span><strong>#${this.drawnHistory.length-idx}</strong> ${item.name}</span><span class="text-muted text-sm">${item.time}</span>`;
      this.drawHistoryList.appendChild(li);
    });
  }

  // ==========================================
  // 12. 極速點名
  // ==========================================
  renderSpeedMode() {
    const total = this.students.length;
    this.speedTotalCount.textContent = total;
    if (!total) { this.speedName.textContent="目前名單無學生"; this.speedId.textContent=""; this.speedEmail.textContent=""; return; }
    if (this.speedIndex >= total) this.speedIndex = total-1;
    if (this.speedIndex < 0)     this.speedIndex = 0;
    const s = this.students[this.speedIndex];
    this.speedCurrentIndex.textContent = this.speedIndex + 1;
    this.speedProgressFill.style.width = `${Math.round(((this.speedIndex+1)/total)*100)}%`;
    this.speedAvatar.textContent = s.name.charAt(0);
    this.speedAvatar.style.background = AVATAR_GRADIENTS[Math.abs(this.hashString(s.id)) % AVATAR_GRADIENTS.length];
    this.speedName.textContent  = s.name;
    this.speedId.textContent    = `學號：${s.id}`;
    this.speedEmail.textContent = `小組：${s.group||"未分組"} | 信箱：${s.email||"無"}`;
    const statusMap = {
      present: { text:"✓ 出席", color:"#10b981", bg:"#ecfdf5" },
      leave:   { text:"⏱ 請假", color:"#f59e0b", bg:"#fffbeb" },
      absent:  { text:"✕ 缺席", color:"#f43f5e", bg:"#fff1f2" },
      unmarked:{ text:"未標記", color:"#64748b", bg:"#e2e8f0" }
    };
    const cur = statusMap[s.status] || statusMap.unmarked;
    this.speedStatusBadge.textContent         = cur.text;
    this.speedStatusBadge.style.color         = cur.color;
    this.speedStatusBadge.style.background    = cur.bg;
  }

  handleSpeedStatus(status) {
    if (!this.students.length) return;
    const s = this.students[this.speedIndex];
    this.updateStudentStatus(s.id, status); sfx.playPop();
    if (this.speedIndex < this.students.length-1) this.stepSpeedIndex(1);
    else { this.renderSpeedMode(); this.showToast("🎉 全班點名已完成！", "success"); }
  }

  stepSpeedIndex(delta) {
    const newIdx = this.speedIndex + delta;
    if (newIdx >= 0 && newIdx < this.students.length) { this.speedIndex = newIdx; this.renderSpeedMode(); }
  }

  // ==========================================
  // 13. 通知中心
  // ==========================================
  getAbsentStudents() { return this.students.filter(s => s.status === "absent"); }

  openNotifyModal() {
    const absentees = this.getAbsentStudents();
    this.modalAbsentCount.textContent = absentees.length;
    if (this.notifyModalAbsentCount) this.notifyModalAbsentCount.textContent = absentees.length;
    if (this.notifyHistoryCount) this.notifyHistoryCount.textContent = this.notifyHistory.length;
    this.modalAbsentChips.innerHTML = "";
    this.notifySentAlert.style.display = "none";

    if (!absentees.length) {
      this.modalAbsentChips.innerHTML = `<span class="text-emerald" style="font-weight:700">太棒了！今日課堂目前無任何學生缺席。</span>`;
    } else {
      absentees.forEach(s => {
        const chip = document.createElement("span"); chip.className = "absentee-chip";
        const absCnt = this.leaveRecords.filter(r => r.studentId === s.id).length;
        chip.innerHTML = `🚨 ${s.name} <span class="absentee-chip-email">(${s.id}${absCnt>0?` · 曾請假${absCnt}次`:""})</span>`;
        this.modalAbsentChips.appendChild(chip);
      });
    }

    const active = document.querySelector('input[name="msgTemplate"]:checked');
    this.applyNotificationTemplate(active?.value || "gentle");

    // 重設通知中心 sub-nav 為廣播頁
    document.querySelectorAll(".modal-subnav-btn").forEach((b,i) => b.classList.toggle("active", i===0));
    document.querySelectorAll(".notify-subtab-pane").forEach((p,i) => p.style.display = i===0 ? "block" : "none");

    this.openModal(this.notifyModal);
  }

  renderIndividualAbsenteeList() {
    if (!this.individualAbsenteeList) return;
    const absentees = this.getAbsentStudents();
    this.individualAbsenteeList.innerHTML = "";
    if (!absentees.length) {
      this.individualAbsenteeList.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-muted)">目前無缺席學生</div>`;
      return;
    }
    absentees.forEach(s => {
      const bg    = AVATAR_GRADIENTS[Math.abs(this.hashString(s.id)) % AVATAR_GRADIENTS.length];
      const note  = this.indNotes[s.id] || "";
      const recs  = this.leaveRecords.filter(r => r.studentId === s.id);
      const card  = document.createElement("div"); card.className = "individual-absentee-card";
      card.innerHTML = `
        <div class="ind-card-top">
          <div style="display:flex;align-items:center;gap:10px">
            <div class="member-avatar-mini" style="width:36px;height:36px;font-size:0.9rem;background:${bg}">${s.name.charAt(0)}</div>
            <div>
              <div style="font-weight:800">${s.name} <span style="font-size:0.78rem;color:var(--text-muted)">${s.id}</span></div>
              <div style="font-size:0.78rem;color:var(--primary)">${s.email||"無信箱"}</div>
            </div>
          </div>
          <div style="display:flex;gap:6px;align-items:center">
            ${recs.length ? `<span style="font-size:0.75rem;background:#e0e7ff;color:#4338ca;padding:2px 8px;border-radius:99px;font-weight:700">歷次假${recs.length}筆</span>` : ""}
            <a href="mailto:${s.email||""}" class="btn btn-secondary" style="padding:4px 10px;font-size:0.76rem">✉️ 單獨發信</a>
          </div>
        </div>
        <div class="ind-note-row">
          <input class="ind-note-input" placeholder="教師備註：例如「已電聯確認，明日補交」" value="${note}">
          <button class="btn btn-primary" style="padding:5px 12px;font-size:0.8rem" data-save-note="${s.id}">儲存備註</button>
        </div>
      `;
      card.querySelector(`[data-save-note]`).addEventListener("click", () => {
        const val = card.querySelector(".ind-note-input").value;
        this.indNotes[s.id] = val; this.saveIndNotes();
        this.showToast(`已儲存 ${s.name} 的備註！`, "success"); sfx.playPop();
      });
      this.individualAbsenteeList.appendChild(card);
    });
  }

  renderNotifyHistory() {
    if (!this.notifyHistoryTimeline) return;
    this.notifyHistoryTimeline.innerHTML = "";
    if (!this.notifyHistory.length) {
      this.notifyHistoryTimeline.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-muted)">尚無任何推播歷史紀錄</div>`;
      return;
    }
    this.notifyHistory.forEach(h => {
      const d = new Date(h.time);
      const timeStr = `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
      const item = document.createElement("div"); item.className = "history-timeline-item";
      item.innerHTML = `
        <div class="history-top">
          <span style="font-weight:700;font-size:0.88rem">📢 已透過 <strong>${h.channel}</strong> 推播</span>
          <span style="font-size:0.75rem;color:var(--text-muted)">${timeStr}</span>
        </div>
        <div style="font-size:0.82rem;color:var(--text-secondary)">收件人：${h.recipients}</div>
        <div style="font-size:0.78rem;color:var(--text-muted)">預覽：${h.preview}</div>
      `;
      this.notifyHistoryTimeline.appendChild(item);
    });
  }

  applyNotificationTemplate(type) {
    const courseName = this.courseNameInput?.value.trim() || "本門課程";
    const dateStr    = this.currentDateDisplay?.textContent || "";
    const absentees  = this.getAbsentStudents();
    const namesStr   = absentees.length ? absentees.map(s=>s.name).join("、") : "同學";
    const ch         = this.notifyChannel || "email";

    let subject = "", body = "";
    if (ch === "sms") {
      // SMS：精簡單行
      const smsMap = {
        gentle:  `[${courseName}] ${dateStr} 未見您到課，老師關心您的狀況，請盡速聯繫或補辦請假。`,
        formal:  `[缺勤警示] ${courseName} ${dateStr} 您登記缺席，請48hr內補辦手續，否則依校規處理。`,
        exam:    `[課堂公告] ${courseName} ${dateStr} 您缺席，今日有重要分組任務，請主動聯繫組員。`
      };
      body = smsMap[type] || smsMap.gentle;
    } else if (ch === "line") {
      // LINE：輕鬆行距
      const lineMap = {
        gentle:  `📚【${courseName}】關懷通知\n\n親愛的 ${namesStr} 同學，今天 (${dateStr}) 沒看到你上課，老師很掛心你喔！\n\n身體還好嗎？如果有任何狀況記得跟老師說，課堂投影片也已上傳到系統，補看沒問題的 🙌`,
        formal:  `📋【${courseName}】缺席通知 ${dateStr}\n\n${namesStr} 同學，本日點名登記為缺席。依課程規定請於 48 小時內至系統辦理補假，逾期將以曠課計算。有問題請聯繫授課老師或助教。`,
        exam:    `📝【${courseName}】今日課程公告 ${dateStr}\n\n${namesStr} 同學，你今天缺席了！今天有進行小組討論，請趕快跟組員確認分工，作業繳交截止日期不變 📌`
      };
      body = lineMap[type] || lineMap.gentle;
    } else {
      // Email
      switch(type) {
        case "formal":
          subject = `【重要出席警示】${courseName} - ${dateStr} 缺勤登記通知`;
          body = `各位缺席同學 (${namesStr}) 您好：\n\n您於本日 (${dateStr}) 之「${courseName}」課堂點名中登記為「缺席」。\n\n依據本課程評分標準與學校出缺席辦法，課堂出席佔平時成績重要比重。若您因公、病或其他重大原因未能到課，請於 48 小時內提交相關請假證明辦理補請假。\n\n如有任何疑慮，請儘速與教師或助教連繫。\n\n授課教師 敬上\n課程日期：${dateStr}`;
          break;
        case "exam":
          subject = `【課堂進度與小組公告】${courseName} - 缺席同學注意事項`;
          body = `各位缺席同學 (${namesStr}) 您好：\n\n今日 (${dateStr})「${courseName}」進行了重要章節講授與課堂分組任務討論。\n\n請務必主動聯繫您的組員確認本次討論分工進度，並請至課程平台下載本日課堂教材與隨堂練習題完成繳交，以維護個人平時考評權益。\n\n祝學習順心！\n${courseName} 教學團隊`;
          break;
        default:
          subject = `【課堂缺席關懷通知】${courseName} - 您今天還好嗎？`;
          body = `親愛的同學 (${namesStr}) 您好：\n\n今天 (${dateStr}) 在「${courseName}」課堂上未見到您的身影，老師與助教非常關心您的學習狀況與身體健康！\n\n若因身體不適或其他臨時突發狀況無法到課，請好好休息照顧自己，並記得於事後提出請假手續（公假/事假/心理假/喪假/病假 均可）。\n今日課堂投影片與作業要求已更新於課程系統，若有課業問題隨時歡迎於課後討論！\n\n祝一切安好，我們下週課堂見！\n授課教師 關心您`;
      }
    }

    if (this.notifySubject) this.notifySubject.value = subject;
    if (this.notifyBody) {
      this.notifyBody.value = body;
      if (this.charCountBadge) this.charCountBadge.textContent = `字數: ${body.length} 字`;
    }
  }

  // ==========================================
  // 14. 資料操作
  // ==========================================
  updateStudentStatus(studentId, newStatus, allowToggle = false) {
    const s = this.students.find(st => st.id === studentId);
    if (!s) return;
    const today = this.getDateStr();
    let status = newStatus;
    if (allowToggle && this.getAttendanceForDate(studentId, today) === newStatus) status = "unmarked";
    this.setAttendanceForDate(studentId, today, status);
    this.render();
  }

  addStudentScore(studentId, delta) {
    const s = this.students.find(st => st.id === studentId);
    if (s) { s.score = Math.max(0, (s.score||0)+delta); this.saveStudents(); this.render(); }
  }

  deleteStudent(studentId) {
    this.students = this.students.filter(s => s.id !== studentId);
    this.saveStudents(); this.render(); this.showToast("已從名冊中移除該學生", "info");
  }

  batchMarkAll(status) {
    const today = this.getDateStr();
    this.students.forEach(s => this.setAttendanceForDate(s.id, today, status));
    this.render(); sfx.playFanfare();
    if (status === "present") this.showToast("🎉 已將全班所有學生標記為 出席！今日請假紀錄已依最新狀態撤銷。", "success");
  }

  // ==========================================
  // 15. 匯出功能
  // ==========================================
  exportCsv() {
    const course  = this.courseNameInput?.value.trim() || "SmartClass";
    const now     = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
    const statusMap = { present:"出席", leave:"請假", absent:"缺席", unmarked:"未標記" };
    let csv = "\uFEFF學號,姓名,分組,出席狀態,平時表現分,聯絡電子信箱\n";
    this.students.forEach(s => {
      csv += `"${s.id}","${s.name}","${s.group||""}","${statusMap[s.status]||"未標記"}",${s.score||0},"${s.email||""}"\n`;
    });
    this._download(csv, `${course}_點名紀錄_${dateStr}.csv`, "text/csv;charset=utf-8;");
    this.showToast("已成功下載點名紀錄 CSV 檔案！", "success");
  }

  exportJson() {
    const data = JSON.stringify({ students:this.students, leaveRecords:this.leaveRecords, groups:this.groups }, null, 2);
    this._download(data, "SmartClass_完整備份.json", "application/json");
    this.showToast("已成功匯出 JSON 備份檔！", "success");
  }

  _download(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  // ==========================================
  // 16. 輔助函式
  // ==========================================
  switchTab(tabId) {
    this.currentMode = tabId;
    this.tabBtns.forEach(btn => btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId));
    this.tabContents.forEach(c => c.classList.toggle("active", c.id === tabId));
    if (tabId === "speed-mode")   this.renderSpeedMode();
    if (tabId === "lucky-draw-mode") this.updateCandidateCount();
    if (tabId === "groups-mode")  this.renderGroupsMode();
    if (tabId === "records-mode") { this.renderLeaveMetrics(); this.renderLeaveRecordsTable(); }
  }

  openModal(modal)  { if (modal) modal.style.display = "flex"; }
  closeModal(modal) { if (modal) modal.style.display = "none"; }

  showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    this.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = "all 0.3s ease";
      toast.style.opacity = "0";
      toast.style.transform = "translateY(15px)";
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  hashString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; }
    return h;
  }
}

// ── 啟動系統 ──
document.addEventListener("DOMContentLoaded", () => {
  window.smartClassApp = new AttendanceSystem();
});
