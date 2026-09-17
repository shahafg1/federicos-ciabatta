export const CUSTOMERS=[
  {
    "id": "hagai",
    "name": "חגי חטב",
    "entry": "אורי, תעשה לי צ׳אבטה עם דירוג בצדדים.",
    "waiting": "אחי, בזמן הזה כבר עשיתי שני פיידים.",
    "served": "בול. אפילו הפסטו יושב מסודר.",
    "image": "assets/hagai.png"
  },
  {
    "id": "hanan",
    "name": "חנן בן ארי",
    "entry": "תן לי משהו שיפתח את הקול. ואת התיאבון.",
    "waiting": "אני כבר בפזמון השני של הבטן.",
    "served": "יש פה הרמוניה בין הפסטו לגבינה.",
    "image": "assets/hanan.png"
  },
  {
    "id": "adi",
    "name": "עדי בן סעדון",
    "entry": "אח שלי, תן צ׳אבטה שתסובב ראשים.",
    "waiting": "נשמה, יש לי לקוח עם חצי תספורת.",
    "served": "איזה ביצוע, אחי. חד כמו הפייד שלי.",
    "image": "assets/adi.png"
  },
  {
    "id": "rachela",
    "name": "רחלה חורש",
    "entry": "אורי, שמת משהו חם בבטן היום?",
    "waiting": "אני רק אומרת שהלחם מתקרר.",
    "served": "טעים מאוד. עכשיו תכין גם לעצמך.",
    "image": "assets/rachela.png"
  },
  {
    "id": "party_customer",
    "name": "נופר כהן",
    "entry": "רגע, אל תגיש. קודם סטורי.",
    "waiting": "סליחה? הסטורי שלי לא מחכה לנצח.",
    "served": "טוב, יצא מושלם. אני מתייגת.",
    "image": "assets/party_customer.png"
  },
  {
    "id": "smoking_customer",
    "name": "לוטם שנטי",
    "entry": "וואי, הריח... רגע, מה באתי להזמין?",
    "waiting": "קח את הזמן... אבל הבטן שלי פחות זורמת.",
    "served": "זה בדיוק מה שחלמתי. נראה לי.",
    "image": "assets/smoking_customer.png"
  }
, {id:"niv",name:"ניב עזרתי",entry:"שווווווווווו....מה עם האח?",waiting:"אח שלי, השרתים באוויר. מה עם הצ׳אבטה?",served:"איזה דיפלוי, אח! עכשיו סיבוב על האופניים.",image:"assets/niv.png"}
];
const rotation=[0,6,1,2,3,4,5];
export const customerForOrder=order=>CUSTOMERS[rotation[(order-1)%rotation.length]];
