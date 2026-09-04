// Lightweight i18n: plain dictionaries + a LanguageContext provider.
// Chosen over next-intl because this app needs locale switching on two pages
// without URL-based routing; this adds zero dependencies and no middleware.

export type Lang = "en" | "ar";

export const LANG_COOKIE = "lang";

const en = {
  // Login
  "login.welcome": "Welcome to Delta University",
  "login.subtitle": "Sign in to your student portal",
  "login.studentId": "Student ID",
  "login.studentIdPlaceholder": "Your student ID or username",
  "register.studentId": "Student ID",
  "register.studentIdPlaceholder": "202400123",
  "login.password": "Password",
  "login.passwordPlaceholder": "Enter your password",
  "login.forgot": "Forgot password?",
  "login.submit": "Log in",
  "login.submitting": "Signing in…",
  "login.newHere": "New here?",
  "login.createAccount": "Create an account",
  "login.showPassword": "Show password",
  "login.hidePassword": "Hide password",

  // Register
  "register.title": "Delta University",
  "register.subtitle": "Create your student account",
  "register.fullName": "Full name",
  "register.fullNamePlaceholder": "Enter your full name",
  "register.username": "Username",
  "register.usernamePlaceholder": "jdoe_academic",
  "register.department": "Department",
  "register.departmentPlaceholder": "Select your department",
  "register.level": "Starting level (estimate)",
  "register.levelHint":
    "Your official level is calculated automatically from your completed credit hours.",
  "register.password": "Password",
  "register.submit": "Create account",
  "register.submitting": "Creating account…",
  "register.haveAccount": "Already have an account?",
  "register.logIn": "Log in",

  // Departments
  "dept.AI_GENERAL": "Artificial Intelligence (General)",
  "dept.CYBER_SECURITY": "Cybersecurity",
  "dept.BIO_INFORMATICS": "Bioinformatics",
  "dept.UNDECIDED": "Undecided",

  // Theme
  "theme.toggle": "Toggle dark mode",
};

const ar: typeof en = {
  "login.welcome": "مرحبًا بك في جامعة الدلتا",
  "login.subtitle": "سجّل الدخول إلى بوابة الطالب",
  "login.studentId": "الرقم الجامعي",
  "login.studentIdPlaceholder": "رقمك الجامعي أو اسم المستخدم",
  "register.studentId": "الرقم الجامعي",
  "register.studentIdPlaceholder": "202400123",
  "login.password": "كلمة المرور",
  "login.passwordPlaceholder": "أدخل كلمة المرور",
  "login.forgot": "نسيت كلمة المرور؟",
  "login.submit": "تسجيل الدخول",
  "login.submitting": "جارٍ تسجيل الدخول…",
  "login.newHere": "أنت جديد هنا؟",
  "login.createAccount": "إنشاء حساب",
  "login.showPassword": "إظهار كلمة المرور",
  "login.hidePassword": "إخفاء كلمة المرور",

  "register.title": "جامعة الدلتا",
  "register.subtitle": "أنشئ حسابك كطالب",
  "register.fullName": "الاسم الكامل",
  "register.fullNamePlaceholder": "أدخل اسمك الكامل",
  "register.username": "اسم المستخدم",
  "register.usernamePlaceholder": "jdoe_academic",
  "register.department": "القسم",
  "register.departmentPlaceholder": "اختر قسماك",
  "register.level": "المستوى الابتدائي (تقديري)",
  "register.levelHint": "يتم حساب مستواك الرسمي تلقائيًا من الساعات المعتمدة التي أكملتها.",
  "register.password": "كلمة المرور",
  "register.submit": "إنشاء الحساب",
  "register.submitting": "جارٍ إنشاء الحساب…",
  "register.haveAccount": "لديك حساب بالفعل؟",
  "register.logIn": "تسجيل الدخول",

  "dept.AI_GENERAL": "الذكاء الاصطناعي (عام)",
  "dept.CYBER_SECURITY": "الأمن السيبراني",
  "dept.BIO_INFORMATICS": "المعلوماتية الحيوية",
  "dept.UNDECIDED": "غير محدد",

  "theme.toggle": "تبديل الوضع الداكن",
};

export const dictionaries: Record<Lang, typeof en> = { en, ar };

export function translate(lang: Lang, key: keyof typeof en): string {
  return dictionaries[lang][key] ?? dictionaries.en[key] ?? key;
}
