// Interface strings of the sequence tool (Hebrew), and the two built-in examples.
export const STR = {
  he: {
    dir: "rtl", tabTool: "כלי הרצפים", tabGame: "המשחק",
    title: "בניית עץ מושלם מרצפי DNA", sub: "מדביקים רצפים באורך שווה, אחד בכל שורה או בפורמט FASTA. הכלי בודק אם קיים עץ מושלם, בונה אותו, ואם לא, מציג הפרה של כלל 4 הגמטות.",
    input: "רצפים", placeholder: ">A\nGCTA\n>B\nACTA\nאו: שם רווח רצף, או רצף בלבד בכל שורה",
    exLecture: "דוגמה מההרצאה", exConflict: "דוגמה בלי עץ", exRandom: "אקראי מהמשחק", run: "בנה עץ", clear: "נקה",
    ref: "טקסון ייחוס (צעד 0)", dropNB: "התעלם מעמודות עם יותר משתי אותיות",
    errEmpty: "לא נמצאו רצפים.", errLen: "הרצפים לא באותו אורך: ", errChars: "תווים לא חוקיים בשורה ", errNB: "עמודות עם יותר משתי אותיות: ", errNBhint: "הבעיה עם שלושה מצבים ומעלה היא NP-שלמה. סמנו את האפשרות למעלה כדי להתעלם מהעמודות האלה, או הסירו אותן.",
    okTitle: "קיים עץ מושלם", okText: (k, t) => `כל ${k} העמודות המשתנות עומדות בכלל 4 הגמטות. ${t ? `${t} עמודות קבועות לא משתתפות בבנייה.` : ""}`,
    badTitle: "אין עץ מושלם", badText: (j, l) => `העמודות ${j} ו-${l} מציגות את כל ארבעת הצירופים, ולכן לפי המשפט לא קיים עץ שבו כל עמדה משתנה פעם אחת.`,
    witness: "ארבעת הטקסונים המעידים", both: "שניהם נגזרים", onlyJ: "רק", onlyL: "רק", none: "שניהם כמו הייחוס",
    matrix: "המטריצה", colTrivial: "עמודה קבועה", colNB: "לא בינארית", colWit: "עמודות ההפרה", rowWit: "טקסונים מעידים", rowRef: "ייחוס",
    tree: "העץ", rooted: "מושרש בייחוס", unrooted: "לא מושרש", ancestral: "הצג רצפים משוחזרים", labels: "סימון עמדות על הקשתות",
    dlSvg: "הורד SVG", copyNewick: "העתק Newick", copied: "הועתק",
    log: "צעדי האלגוריתם", logShow: "הצג", logHide: "הסתר",
    legend: "כל תג על קשת הוא עמדה שמשתנה שם, עם האות בצד הייחוס ← האות הנגזרת. נקודות כהות הן אבות משוחזרים.",
    posWord: "עמדה", taxaWord: "טקסונים", colsWord: "עמודות", theoremNote: "המשפט: למטריצה בינארית יש עץ מושלם אם ורק אם היא עומדת במבחן 4 הגמטות. ההוכחה בדו\"ח.",
  },
};
export const EX_LECTURE = ">A\nGCTA\n>B\nACTA\n>C\nACTG\n>D\nATCG\n>E\nACCG";
export const EX_CONFLICT = ">A\nGCTA\n>B\nACTA\n>C\nACTG\n>D\nATCA\n>E\nACCG";
