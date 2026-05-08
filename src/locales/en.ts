const en = {
  // Navigation
  nav: {
    dashboard: "Dashboard",
    transactions: "Transactions",
    addRecord: "Add Record",
    goals: "Goals",
    aiAgent: "AI Agent",
    settings: "Settings",
    menu: "Menu",
    notifications: "Notifications",
    signIn: "Sign in",
    appName: "Your Finance Assistant",
    setUpClerk: "Set up Clerk",
    toggleNav: "Toggle navigation",
    closeMenu: "Close menu",
  },

  // Common
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    close: "Close",
    back: "Back",
    loading: "Loading...",
    search: "Search",
    filter: "Filter",
    export: "Export",
    confirm: "Confirm",
    yes: "Yes",
    no: "No",
    error: "Error",
    success: "Success",
    noData: "No data available",
    required: "This field is required",
    optional: "Optional",
    all: "All",
    none: "None",
    amount: "Amount",
    category: "Category",
    date: "Date",
    note: "Note",
    name: "Name",
    type: "Type",
    status: "Status",
    actions: "Actions",
    submit: "Submit",
    reset: "Reset",
    currency: "Currency",
    welcome: "Welcome",
  },

  // Transaction types
  transactionType: {
    income: "Income",
    expense: "Expense",
  },

  // Dashboard page
  dashboard: {
    title: "Dashboard",
    overview: "Overview",
    totalIncome: "Total Income",
    totalExpenses: "Total Expenses",
    netBalance: "Net Balance",
    recentTransactions: "Recent Transactions",
    spendingByCategory: "Spending by Category",
    goalProgress: "Goal Progress",
    budgetProgress: "Budget Progress",
    incomeVsExpense: "Income vs Expense",
    financialInsights: "Financial Insights",
    noInsights:
      "No insights available yet. Add some transactions to get started.",
    insightsTip: "Smart tips based on your spending",
    viewAll: "View All",
    addRecord: "Add Record",
    noTransactions: "No transactions yet.",
    noGoals: "No goals yet.",
    noBudgets: "No budgets set.",
    loadError: "Failed to load dashboard data.",
    dateRange: "Date Range",
  },

  // Transactions page
  transactions: {
    title: "Transactions",
    searchPlaceholder: "Search by note or category…",
    exportCSV: "Export CSV",
    noResults: "No transactions found.",
    deleteConfirm: "Delete this transaction?",
    deleteSuccess: "Transaction deleted.",
    deleteFailed: "Failed to delete transaction.",
    filterByType: "Filter by type",
    filterByCategory: "Filter by category",
    sortBy: "Sort by",
    totalRecords: "total records",
  },

  // Add transaction page
  addTransaction: {
    title: "Add Record",
    manualEntry: "Manual Entry",
    scanSlip: "Scan Slip (OCR)",
    uploadImage: "Upload Image",
    extractedData: "Extracted Data",
    reviewExtracted: "Review and save extracted transactions",
    addManually: "Add Manually",
    processing: "Processing…",
    scanAnother: "Scan Another",
    saveAll: "Save All",
    saveSelected: "Save Selected",
    noExtracted: "No transactions extracted yet.",
    ocrLimit: "OCR limit reached",
    usageNote: "OCR scans used this month",
    amountPlaceholder: "0.00",
    notePlaceholder: "Short description (optional)",
    categoryPlaceholder: "e.g. Food, Transport",
    selectDate: "Select date",
    saving: "Saving…",
    saved: "Saved!",
    saveFailed: "Failed to save transaction.",
  },

  // Goals page
  goals: {
    title: "Goals",
    addGoal: "Add Goal",
    noGoals: "No goals yet. Create your first goal!",
    targetAmount: "Target Amount",
    currentAmount: "Current Amount",
    deadline: "Deadline",
    noDeadline: "No deadline",
    completed: "Completed",
    inProgress: "In Progress",
    deleteConfirm: "Delete this goal?",
    deleteSuccess: "Goal deleted.",
    deleteFailed: "Failed to delete goal.",
    progress: "Progress",
    remaining: "Remaining",
    daysLeft: "days left",
    overdue: "Overdue",
  },

  // Add / Edit Goal
  goalForm: {
    addTitle: "Add Goal",
    editTitle: "Edit Goal",
    goalName: "Goal Name",
    goalNamePlaceholder: "e.g. Emergency Fund",
    targetAmount: "Target Amount",
    currentAmount: "Current Amount (optional)",
    deadline: "Deadline (optional)",
    saving: "Saving…",
    saveGoal: "Save Goal",
    updateGoal: "Update Goal",
    saveFailed: "Failed to save goal.",
  },

  // Edit transaction
  editTransaction: {
    title: "Edit Transaction",
    saving: "Saving…",
    saveChanges: "Save Changes",
    saveFailed: "Failed to update transaction.",
  },

  // Settings page
  settings: {
    title: "Settings",
    subtitle: "Manage your preferences",
    currency: "Currency",
    currencyDescription:
      "Select your preferred currency for displaying amounts",
    displayCurrency: "Display Currency",
    preview: "Preview",
    budgetLimits: "Budget Limits",
    budgetDescription: "Set monthly spending limits per category",
    addBudget: "Add Budget",
    categoryLabel: "Category",
    categoryRequired: "Category is required.",
    amountRequired: "Enter a valid amount.",
    duplicateBudget:
      "A budget for this category already exists. Edit it below.",
    saveFailed: "Failed to save.",
    noCategories: "No categories found. Add transactions first.",
    monthlyLimit: "Monthly Limit",
    language: "Language",
    languageDescription: "Select your preferred language",
  },

  // AI Agent page
  aiAgent: {
    title: "AI Financial Agent",
    subtitle: "Your smart finance assistant",
    placeholder: "Ask about your finances…",
    send: "Send",
    suggestedPrompts: "Suggested Prompts",
    thinking: "Thinking…",
    errorMessage: "Failed to get response. Please try again.",
  },

  // Auth pages
  auth: {
    signInTitle: "Sign In",
    signUpTitle: "Sign Up",
    clerkNotConfigured:
      "Authentication is not configured. Please set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.",
  },

  // Home / Landing page
  home: {
    brandName: "Your Finance Assistant",
    heroTitle: "Your smart personal finance companion",
    heroSubtitle:
      "Track expenses, scan Thai payment slips, and stay on top of your financial goals in one place.",
    primaryCta: "Get Started Free",
    secondaryCta: "Sign In",
    featuresTitle: "Everything you need to manage your money",
    featuresSubtitle:
      "Track spending, scan slips, and review your financial progress with practical tools built for everyday use.",
    featureOcrTitle: "Payment Slip OCR",
    featureOcrDescription:
      "Scan Thai payment slips instantly and extract transaction details with less manual entry.",
    featureTrackingTitle: "Smart Tracking",
    featureTrackingDescription:
      "Monitor income and expenses with dashboard summaries and visual analytics.",
    featureGoalsTitle: "Goal Setting",
    featureGoalsDescription:
      "Set savings targets and follow your progress with clear milestones.",
    featureSearchTitle: "Search and Filter",
    featureSearchDescription:
      "Find transactions quickly across notes, categories, and amounts.",
    featureExportTitle: "Export Data",
    featureExportDescription:
      "Download your transaction history as CSV for analysis or reporting.",
    featureMobileTitle: "Mobile Friendly",
    featureMobileDescription:
      "Use the dashboard comfortably on desktop, tablet, or phone.",
    statsScans: "Free OCR scans per month",
    statsBatch: "Slips per batch",
    statsFree: "Free to use",
    ctaTitle: "Ready to take control of your finances?",
    ctaSubtitle:
      "Create an account and start tracking your money with a workflow built for daily use.",
    ctaButton: "Start for Free",
    testimonialsTitle: "What users say",
    testimonialOne:
      '"The payment slip OCR feature saves a lot of time. I no longer have to enter every transfer manually."',
    testimonialTwo:
      '"The interface is clear and practical. I can review my spending without digging through bank apps."',
    testimonialThree:
      '"Goal tracking makes it easier to stay consistent with saving every month."',
    product: "Product",
    resources: "Resources",
    community: "Community",
    feedback: "Feedback",
    productFeatures: "Features",
    productPricing: "Pricing",
    productRoadmap: "Roadmap",
    resourcesDocumentation: "Documentation",
    resourcesApiGuide: "API Guide",
    resourcesSupport: "Support",
    communityGithub: "GitHub",
    communityTwitter: "Twitter",
    communityDiscord: "Discord",
    feedbackPrompt: "Help us improve the product with direct feedback.",
    feedbackAction: "Share Feedback",
    builtWith: "Built with Next.js, Supabase, and Tesseract.js",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    contact: "Contact",
  },

  // Date range selector
  dateRange: {
    thisMonth: "This Month",
    lastMonth: "Last Month",
    last3Months: "Last 3 Months",
    thisYear: "This Year",
    custom: "Custom",
    start: "Start",
    end: "End",
    apply: "Apply",
  },

  // Errors / Empty states
  errors: {
    loadFailed: "Failed to load data.",
    notFound: "Not found.",
    unexpected: "An unexpected error occurred.",
  },
} as const;

type TranslationShape<T> = {
  [Key in keyof T]: T[Key] extends string ? string : TranslationShape<T[Key]>;
};

export type TranslationKeys = TranslationShape<typeof en>;
export default en;
