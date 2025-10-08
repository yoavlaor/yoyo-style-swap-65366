import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export const TermsOfService = ({ children }: { children: React.ReactNode }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">תקנון השימוש של יויו 📜</DialogTitle>
          <DialogDescription>
            אנא קרא/י בעיון את תנאי השימוש שלנו
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] px-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-bold text-lg mb-2">1. כללי 🌟</h3>
              <p className="text-muted-foreground">
                ברוכים הבאים ליויו! פלטפורמה לקנייה ומכירה של בגדים משומשים. השימוש באתר מהווה הסכמה מלאה לתקנון זה. אם אינך מסכים/ה לתנאים אלו, אנא הימנע/י משימוש באתר.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">2. הגדרות 📖</h3>
              <ul className="list-disc pr-6 space-y-1 text-muted-foreground">
                <li>"האתר" - פלטפורמת יויו לקנייה ומכירה של בגדים משומשים</li>
                <li>"משתמש" - כל אדם הרשום או משתמש באתר</li>
                <li>"מוכר" - משתמש המעלה פריטים למכירה</li>
                <li>"קונה" - משתמש הרוכש פריטים מהאתר</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">3. הרשמה וחשבון משתמש 👤</h3>
              <ul className="list-disc pr-6 space-y-2 text-muted-foreground">
                <li>על המשתמש למסור פרטים נכונים ומדויקים בעת ההרשמה</li>
                <li>המשתמש אחראי לשמירה על סודיות פרטי ההתחברות שלו</li>
                <li>אסור להעביר את החשבון לאדם אחר</li>
                <li>גיל מינימום לשימוש באתר הוא 13 שנים</li>
                <li>יויו שומרת לעצמה את הזכות לסגור חשבונות של משתמשים המפרים את התקנון</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">4. העלאת פריטים למכירה 📸</h3>
              <ul className="list-disc pr-6 space-y-2 text-muted-foreground">
                <li>המוכר אחראי לספק תיאור מדויק ותמונות נאמנות של הפריט</li>
                <li>אסור להעלות פריטים מזויפים, גנובים או אסורים בחוק</li>
                <li>יש לציין את מצב הבגד בכנות (חדש, משומש טוב, עם פגמים וכו')</li>
                <li>המוכר מתחייב לא למכור את אותו פריט במקום אחר במהלך תקופת המכירה באתר</li>
                <li>יויו רשאית להסיר פריטים שאינם עומדים בסטנדרטים של האתר</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">5. רכישת פריטים 🛍️</h3>
              <ul className="list-disc pr-6 space-y-2 text-muted-foreground">
                <li>הרכישה מתבצעת באמצעות המערכת באתר ומהווה התחייבות לתשלום</li>
                <li>הקונה מסכים לתנאי המשלוח והמחיר המפורטים בדף הפריט</li>
                <li>לאחר ביצוע הרכישה, יש ליצור קשר עם המוכר לתיאום איסוף או משלוח</li>
                <li>אין אפשרות לביטול עסקה לאחר אישור הרכישה, אלא בהסכמה הדדית</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">6. תשלומים 💳</h3>
              <ul className="list-disc pr-6 space-y-2 text-muted-foreground">
                <li>התשלום מתבצע ישירות בין הקונה למוכר</li>
                <li>יויו אינה אחראית לעסקאות הכספיות בין המשתמשים</li>
                <li>מומלץ להשתמש באמצעי תשלום מאובטחים ומוגנים</li>
                <li>השימוש באתר הוא בחינם, ללא עמלות</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">7. משלוחים 📦</h3>
              <ul className="list-disc pr-6 space-y-2 text-muted-foreground">
                <li>המוכר והקונה אחראים לתיאום דרך המשלוח או האיסוף</li>
                <li>יויו אינה אחראית לעיכובים או נזקים במשלוחים</li>
                <li>מומלץ לתעד את מצב הפריט לפני המשלוח</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">8. אחריות ואחריות מוגבלת ⚠️</h3>
              <ul className="list-disc pr-6 space-y-2 text-muted-foreground">
                <li>יויו משמשת כפלטפורמה בלבד ואינה צד לעסקאות</li>
                <li>האתר לא אחראי לאיכות, מקוריות או מצב הפריטים</li>
                <li>המשתמשים אחראים לבדוק את הפריטים לפני הרכישה</li>
                <li>יויו אינה אחראית לנזקים, אובדן או מחלוקות בין משתמשים</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">9. קניין רוחני 🎨</h3>
              <ul className="list-disc pr-6 space-y-2 text-muted-foreground">
                <li>כל התוכן באתר, כולל עיצוב, לוגו וקוד, שייך ליויו</li>
                <li>משתמשים שומרים על זכויות היוצרים של התמונות שהם מעלים</li>
                <li>העלאת תמונה מעניקה ליויו רישיון להציג אותה באתר</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">10. פרטיות 🔒</h3>
              <ul className="list-disc pr-6 space-y-2 text-muted-foreground">
                <li>יויו מתחייבת לשמור על פרטיות המשתמשים</li>
                <li>המידע נשמר באופן מאובטח ולא יועבר לצדדים שלישיים</li>
                <li>המידע משמש לצורך תפעול האתר בלבד</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">11. התנהגות והתנהלות 🤝</h3>
              <ul className="list-disc pr-6 space-y-2 text-muted-foreground">
                <li>אסור לפרסם תוכן פוגעני, גזעני או לא חוקי</li>
                <li>יש לנהוג בכבוד ובתרבות מול משתמשים אחרים</li>
                <li>אסור להטריד, לאיים או להציק למשתמשים אחרים</li>
                <li>חל איסור על שימוש באתר למטרות מסחריות ללא אישור</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">12. שינויים בתקנון 📝</h3>
              <p className="text-muted-foreground">
                יויו שומרת לעצמה את הזכות לעדכן ולשנות את התקנון מעת לעת. שינויים יכנסו לתוקף מיד עם פרסומם באתר. המשך שימוש באתר מהווה הסכמה לתנאים המעודכנים.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">13. סיום השימוש 🚪</h3>
              <ul className="list-disc pr-6 space-y-2 text-muted-foreground">
                <li>משתמש יכול לסגור את חשבונו בכל עת</li>
                <li>יויו רשאית להשעות או לסגור חשבונות המפרים את התקנון</li>
                <li>סגירת חשבון אינה משחררת ממחויבויות קיימות</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">14. יצירת קשר 📧</h3>
              <p className="text-muted-foreground">
                לשאלות, הערות או תלונות, ניתן ליצור קשר עם צוות יויו דרך מערכת התמיכה באתר.
              </p>
            </section>

            <section className="pt-4 border-t">
              <p className="text-center font-semibold text-primary">
                תודה שבחרתם ביויו! יחד אנחנו יוצרים עתיד אופנתי וברמקולות! 🌿✨
              </p>
              <p className="text-center text-xs text-muted-foreground mt-2">
                תקנון זה עודכן לאחרונה ביום {new Date().toLocaleDateString('he-IL')}
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
