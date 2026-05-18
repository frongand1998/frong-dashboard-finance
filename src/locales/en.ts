const en = {
  // Navigation
  nav: {
    dashboard: "Dashboard",
    investmentSnapshot: "Investment Snapshot",
    dcaPlanner: "DCA Planner",
    goalBasedInvesting: "Goal-based Investing",
    transactions: "Transactions",
    addRecord: "Add Record",
    limits: "Limits",
    goals: "Goals",
    recurring: "Recurring",
    admin: "Admin",
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
    exportPDF: "Export PDF (Statement)",
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
    openInvestmentPlanner: "Open Goal-based Investing",
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

  // Recurring page
  recurringPage: {
    title: "Recurring",
    subtitle: "Automate regular income and expense entries",
    createTitle: "Create recurring rule",
    ruleName: "Rule name",
    ruleNamePlaceholder: "e.g. Monthly Rent",
    frequency: "Frequency",
    startDate: "Start date",
    runNow: "Run now",
    runDueNow: "Run due rules",
    noRules: "No recurring rules yet.",
    nextRun: "Next run",
    lastRun: "Last run",
    active: "Active",
    paused: "Paused",
    createSuccess: "Recurring rule created.",
    createFailed: "Failed to create recurring rule.",
    updateSuccess: "Recurring rule updated.",
    updateFailed: "Failed to update recurring rule.",
    deleteConfirm: "Delete this recurring rule?",
    deleteSuccess: "Recurring rule deleted.",
    deleteFailed: "Failed to delete recurring rule.",
    runSuccess: "Recurring transaction created.",
    runFailed: "Failed to run recurring rule.",
    runDueSummary:
      "Processed {rules} rules and created {transactions} transactions.",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
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
    activeBudgetMonth: "Budget month",
    limitSingle: "limit",
    limitPlural: "limits",
    openLimitsPage: "Open limits page",
    openLimitsDescription:
      "Manage monthly spending limits in a dedicated page.",
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

  // Investment pages
  investment: {
    snapshotTitle: "Investment Snapshot",
    snapshotSubtitle:
      "Quick overview of your investment cash flow and allocation.",
    totalInvested: "Total Invested",
    realizedReturns: "Realized Returns",
    netCostBasis: "Net Cost Basis",
    investedThisMonth: "Invested This Month",
    allocationMix: "Allocation Mix",
    noInvestmentData:
      "No investment transactions yet. Tag categories like stock, fund, or crypto to populate this section.",
    dataNotes: "Data Notes",
    dataNoteDescription:
      "This page infers investment activity from transaction category names. For best accuracy, use consistent category naming for assets.",
    detectedEntries: "Detected entries",
    transactionsLabel: "transactions",
    dcaTitle: "DCA Planner",
    dcaSubtitle: "Simulate how monthly investing grows over time.",
    planInputs: "Plan Inputs",
    initialInvestment: "Initial Investment",
    monthlyDcaAmount: "Monthly DCA Amount",
    expectedAnnualReturn: "Expected Annual Return (%)",
    investmentHorizonYears: "Investment Horizon (Years)",
    futureValue: "Future Value",
    totalContributions: "Total Contributions",
    estimatedGain: "Estimated Gain",
    yearlyProjection: "Yearly Projection",
    yearLabel: "Year",
    goalBasedTitle: "Goal-based Investing",
    goalBasedSubtitle:
      "Turn your financial goals into actionable monthly investment plans.",
    monthlyRequired: "Monthly Required",
    avgMonthlySurplus: "Avg Monthly Surplus",
    suggestedInvestBudget: "Suggested Invest Budget",
    planStatus: "Plan Status",
    onTrack: "On Track",
    needsAdjustment: "Needs Adjustment",
    perGoalMonthlyPlan: "Per-goal Monthly Plan",
    noGoalsPlan:
      "No goals yet. Add at least one financial goal to generate a plan.",
    remainingOf: "Remaining",
    ofLabel: "of",
    requiredPerMonth: "Required / month",
    monthsLeft: "months left",
    completed: "Completed",
    urgentTimeline: "Urgent timeline",
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
    brandName: "Know your finance",
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
    supportTitle: "Buy me a coffee",
    supportSubtitle:
      "If this app helps you, you can support development by scanning this QR code.",
    supportHint: "Scan to support",
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

  // Feedback page
  feedbackPage: {
    backHome: "Back to home",
    title: "Share feedback",
    subtitle:
      "Tell us what to improve. Your message will be sent to our team and stored in Google Sheets.",
    nameLabel: "Name (optional)",
    namePlaceholder: "Your name",
    emailLabel: "Email (optional)",
    emailPlaceholder: "you@example.com",
    categoryLabel: "Category",
    categoryBug: "Bug report",
    categoryFeature: "Feature request",
    categoryUx: "UI/UX",
    categoryOther: "Other",
    messageLabel: "Message",
    messagePlaceholder:
      "What happened, what you expected, or what you'd like us to add",
    submit: "Send feedback",
    submitting: "Sending...",
    successMessage: "Thanks! Your feedback has been sent.",
    errorMessage: "Unable to send feedback right now. Please try again.",
    rateLimitedMessage:
      "You have sent feedback too many times in a short period. Please wait and try again.",
    sheetHint:
      "Admin note: set GOOGLE_APPS_SCRIPT_URL in environment variables to store submissions in Google Sheets.",
  },

  // Admin page
  adminPage: {
    title: "Admin Access Management",
    subtitle:
      "Grant or revoke admin access for users who signed in to your application.",
    summary: "Total users: {total} | Non-admin users: {nonAdmin}",
    searchPlaceholder: "Search by name or email",
    filterAll: "All users",
    filterAdmin: "Admins only",
    filterNonAdmin: "Non-admins only",
    refresh: "Refresh",
    user: "User",
    email: "Email",
    adminAccess: "Admin Access",
    admin: "Admin",
    defaultAdmin: "Default Admin",
    you: "You",
    forbidden: "You do not have permission to access this page.",
    updateFailed: "Failed to update admin access.",
    backDashboard: "Back to dashboard",
    noResults: "No users matched your filter.",
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
