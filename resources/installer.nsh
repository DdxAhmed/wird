!include "nsDialogs.nsh"

!macro customWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "مرحبًا بك في وِرد"
  !define MUI_WELCOMEPAGE_TEXT "مساحة هادئة للذكر والصلاة والتفرّغ. تستغرق خطوات التثبيت لحظات."
  !insertmacro skipPageIfUpdated
  !insertmacro MUI_PAGE_WELCOME
  Page custom WirdPrayerPage
  Page custom WirdDhikrPage
  Page custom WirdFocusPage
  Page custom WirdPrivacyPage

  Function WirdPrayerPage
    !insertmacro wirdFeaturePage "الصلاة والأذان" "مواقيت محسوبة محليًا لموقعك. اختر ملف أذانك بعد التثبيت من داخل التطبيق."
  FunctionEnd

  Function WirdDhikrPage
    !insertmacro wirdFeaturePage "الأذكار والورد" "نظّم أذكار الصباح والمساء ووردك اليومي، وتابع ما أنجزته بهدوء."
  FunctionEnd

  Function WirdFocusPage
    !insertmacro wirdFeaturePage "جلسات التفرّغ" "خصص وقتًا للذكر والقراءة مع عداد هادئ لا يقطع تركيزك."
  FunctionEnd

  Function WirdPrivacyPage
    !insertmacro wirdFeaturePage "خصوصيتك أولًا" "يحفظ وِرد موقعك وإعداداتك محليًا. تصل التحديثات عبر إصدارات GitHub."
  FunctionEnd
!macroend

!macro wirdFeaturePage TITLE BODY
  ${If} ${isUpdated}
    Abort
  ${EndIf}
  nsDialogs::Create 1018
  Pop $0
  ${If} $0 == error
    Abort
  ${EndIf}
  ${NSD_CreateLabel} 0 0 100% 28u "${TITLE}"
  Pop $0
  ${NSD_CreateLabel} 0 38u 100% 70u "${BODY}"
  Pop $0
  nsDialogs::Show
!macroend
