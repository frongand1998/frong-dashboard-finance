import type { TranslationKeys } from "./en";

const th: TranslationKeys = {
  // Navigation
  nav: {
    dashboard: "แดชบอร์ด",
    transactions: "รายการธุรกรรม",
    addRecord: "เพิ่มรายการ",
    goals: "เป้าหมาย",
    aiAgent: "AI ผู้ช่วย",
    settings: "การตั้งค่า",
    menu: "เมนู",
    notifications: "การแจ้งเตือน",
    signIn: "เข้าสู่ระบบ",
    toggleNav: "สลับเมนูนำทาง",
    closeMenu: "ปิดเมนู",
  },

  // Common
  common: {
    save: "บันทึก",
    cancel: "ยกเลิก",
    delete: "ลบ",
    edit: "แก้ไข",
    add: "เพิ่ม",
    close: "ปิด",
    back: "ย้อนกลับ",
    loading: "กำลังโหลด...",
    search: "ค้นหา",
    filter: "กรอง",
    export: "ส่งออก",
    confirm: "ยืนยัน",
    yes: "ใช่",
    no: "ไม่",
    error: "ข้อผิดพลาด",
    success: "สำเร็จ",
    noData: "ไม่มีข้อมูล",
    required: "จำเป็นต้องกรอกข้อมูล",
    optional: "ไม่บังคับ",
    all: "ทั้งหมด",
    none: "ไม่มี",
    amount: "จำนวนเงิน",
    category: "หมวดหมู่",
    date: "วันที่",
    note: "หมายเหตุ",
    name: "ชื่อ",
    type: "ประเภท",
    status: "สถานะ",
    actions: "การดำเนินการ",
    submit: "ส่ง",
    reset: "รีเซ็ต",
    currency: "สกุลเงิน",
  },

  // Transaction types
  transactionType: {
    income: "รายรับ",
    expense: "รายจ่าย",
  },

  // Dashboard
  dashboard: {
    title: "แดชบอร์ด",
    overview: "ภาพรวม",
    totalIncome: "รายรับทั้งหมด",
    totalExpenses: "รายจ่ายทั้งหมด",
    netBalance: "ยอดคงเหลือสุทธิ",
    recentTransactions: "ธุรกรรมล่าสุด",
    spendingByCategory: "การใช้จ่ายตามหมวดหมู่",
    goalProgress: "ความคืบหน้าเป้าหมาย",
    budgetProgress: "ความคืบหน้างบประมาณ",
    incomeVsExpense: "รายรับ vs รายจ่าย",
    financialInsights: "ข้อมูลเชิงลึกทางการเงิน",
    noInsights: "ยังไม่มีข้อมูลเชิงลึก เพิ่มธุรกรรมเพื่อเริ่มต้น",
    insightsTip: "เคล็ดลับอัจฉริยะจากการใช้จ่ายของคุณ",
    viewAll: "ดูทั้งหมด",
    addRecord: "เพิ่มรายการ",
    noTransactions: "ยังไม่มีธุรกรรม",
    noGoals: "ยังไม่มีเป้าหมาย",
    noBudgets: "ยังไม่ได้ตั้งงบประมาณ",
    loadError: "ไม่สามารถโหลดข้อมูลแดชบอร์ดได้",
    dateRange: "ช่วงวันที่",
  },

  // Transactions page
  transactions: {
    title: "รายการธุรกรรม",
    searchPlaceholder: "ค้นหาตามหมายเหตุหรือหมวดหมู่…",
    exportCSV: "ส่งออก CSV",
    noResults: "ไม่พบธุรกรรม",
    deleteConfirm: "ลบธุรกรรมนี้?",
    deleteSuccess: "ลบธุรกรรมสำเร็จ",
    deleteFailed: "ไม่สามารถลบธุรกรรมได้",
    filterByType: "กรองตามประเภท",
    filterByCategory: "กรองตามหมวดหมู่",
    sortBy: "เรียงตาม",
    totalRecords: "รายการทั้งหมด",
  },

  // Add transaction
  addTransaction: {
    title: "เพิ่มรายการ",
    manualEntry: "กรอกข้อมูลเอง",
    scanSlip: "สแกนสลิป (OCR)",
    uploadImage: "อัปโหลดรูปภาพ",
    extractedData: "ข้อมูลที่ดึงออกมา",
    reviewExtracted: "ตรวจสอบและบันทึกธุรกรรมที่ดึงออกมา",
    addManually: "เพิ่มด้วยตนเอง",
    processing: "กำลังประมวลผล…",
    scanAnother: "สแกนอีกครั้ง",
    saveAll: "บันทึกทั้งหมด",
    saveSelected: "บันทึกที่เลือก",
    noExtracted: "ยังไม่มีธุรกรรมที่ดึงออกมา",
    ocrLimit: "ถึงขีดจำกัด OCR แล้ว",
    usageNote: "การสแกน OCR ที่ใช้เดือนนี้",
    amountPlaceholder: "0.00",
    notePlaceholder: "คำอธิบายสั้น ๆ (ไม่บังคับ)",
    categoryPlaceholder: "เช่น อาหาร, การเดินทาง",
    selectDate: "เลือกวันที่",
    saving: "กำลังบันทึก…",
    saved: "บันทึกแล้ว!",
    saveFailed: "ไม่สามารถบันทึกธุรกรรมได้",
  },

  // Goals page
  goals: {
    title: "เป้าหมาย",
    addGoal: "เพิ่มเป้าหมาย",
    noGoals: "ยังไม่มีเป้าหมาย สร้างเป้าหมายแรกของคุณ!",
    targetAmount: "จำนวนเป้าหมาย",
    currentAmount: "จำนวนปัจจุบัน",
    deadline: "กำหนดเวลา",
    noDeadline: "ไม่มีกำหนดเวลา",
    completed: "สำเร็จแล้ว",
    inProgress: "กำลังดำเนินการ",
    deleteConfirm: "ลบเป้าหมายนี้?",
    deleteSuccess: "ลบเป้าหมายสำเร็จ",
    deleteFailed: "ไม่สามารถลบเป้าหมายได้",
    progress: "ความคืบหน้า",
    remaining: "คงเหลือ",
    daysLeft: "วันที่เหลือ",
    overdue: "เกินกำหนด",
  },

  // Add / Edit Goal
  goalForm: {
    addTitle: "เพิ่มเป้าหมาย",
    editTitle: "แก้ไขเป้าหมาย",
    goalName: "ชื่อเป้าหมาย",
    goalNamePlaceholder: "เช่น กองทุนฉุกเฉิน",
    targetAmount: "จำนวนเป้าหมาย",
    currentAmount: "จำนวนปัจจุบัน (ไม่บังคับ)",
    deadline: "กำหนดเวลา (ไม่บังคับ)",
    saving: "กำลังบันทึก…",
    saveGoal: "บันทึกเป้าหมาย",
    updateGoal: "อัปเดตเป้าหมาย",
    saveFailed: "ไม่สามารถบันทึกเป้าหมายได้",
  },

  // Edit transaction
  editTransaction: {
    title: "แก้ไขธุรกรรม",
    saving: "กำลังบันทึก…",
    saveChanges: "บันทึกการเปลี่ยนแปลง",
    saveFailed: "ไม่สามารถอัปเดตธุรกรรมได้",
  },

  // Settings page
  settings: {
    title: "การตั้งค่า",
    subtitle: "จัดการการตั้งค่าของคุณ",
    currency: "สกุลเงิน",
    currencyDescription: "เลือกสกุลเงินที่ต้องการสำหรับการแสดงจำนวนเงิน",
    displayCurrency: "สกุลเงินที่แสดง",
    preview: "ตัวอย่าง",
    budgetLimits: "วงเงินงบประมาณ",
    budgetDescription: "กำหนดวงเงินรายจ่ายรายเดือนต่อหมวดหมู่",
    addBudget: "เพิ่มงบประมาณ",
    categoryLabel: "หมวดหมู่",
    categoryRequired: "จำเป็นต้องระบุหมวดหมู่",
    amountRequired: "กรอกจำนวนเงินที่ถูกต้อง",
    duplicateBudget: "มีงบประมาณสำหรับหมวดหมู่นี้แล้ว ให้แก้ไขด้านล่าง",
    saveFailed: "ไม่สามารถบันทึกได้",
    noCategories: "ไม่พบหมวดหมู่ กรุณาเพิ่มธุรกรรมก่อน",
    monthlyLimit: "วงเงินรายเดือน",
    language: "ภาษา",
    languageDescription: "เลือกภาษาที่ต้องการ",
  },

  // AI Agent
  aiAgent: {
    title: "AI ผู้ช่วยทางการเงิน",
    subtitle: "ผู้ช่วยการเงินอัจฉริยะของคุณ",
    placeholder: "ถามเกี่ยวกับการเงินของคุณ…",
    send: "ส่ง",
    suggestedPrompts: "คำถามแนะนำ",
    thinking: "กำลังคิด…",
    errorMessage: "ไม่สามารถรับคำตอบได้ กรุณาลองใหม่",
  },

  // Auth pages
  auth: {
    signInTitle: "เข้าสู่ระบบ",
    signUpTitle: "สมัครสมาชิก",
    clerkNotConfigured:
      "ยังไม่ได้ตั้งค่าการยืนยันตัวตน กรุณาตั้งค่า NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  },

  // Home / Landing
  home: {
    hero: "ผู้ช่วยการเงินของคุณ",
    heroSubtitle:
      "ติดตามรายจ่าย สแกนสลิปการชำระเงิน และบรรลุเป้าหมายทางการเงิน",
    getStarted: "เริ่มต้นใช้งาน",
    goToDashboard: "ไปที่แดชบอร์ด",
    features: "ฟีเจอร์",
    learnMore: "เรียนรู้เพิ่มเติม",
  },

  // Date range selector
  dateRange: {
    thisMonth: "เดือนนี้",
    lastMonth: "เดือนที่แล้ว",
    last3Months: "3 เดือนที่ผ่านมา",
    thisYear: "ปีนี้",
    custom: "กำหนดเอง",
    start: "เริ่มต้น",
    end: "สิ้นสุด",
    apply: "นำไปใช้",
  },

  // Errors / Empty states
  errors: {
    loadFailed: "ไม่สามารถโหลดข้อมูลได้",
    notFound: "ไม่พบข้อมูล",
    unexpected: "เกิดข้อผิดพลาดที่ไม่คาดคิด",
  },
};

export default th;
