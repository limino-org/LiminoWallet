// http/https
export const RegUrl: RegExp = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;


// A non-zero positive integer
export const RegNum1: RegExp = /^\+?[1-9][0-9]*$/

// digital
export const regNum2: RegExp = /^[1-9]*[1-9][0-9]*$/

// Check pure English 
export const regEnglish: RegExp = /^[a-zA-Z]+$/

// The minimum length of any three combinations of uppercase digits in pure English is 8 to 18 
export const regPassword: RegExp = /^(?![A-Za-z]+$)(?![A-Z\d]+$)(?![A-Z\W]+$)(?![a-z\d]+$)(?![a-z\W]+$)(?![\d\W]+$)\S{8,18}$/

export const regPassword1: RegExp = /^.{6,20}$/


// 1-10
export const regRoyalty :RegExp=/^\d{1,10}$/

// 4 to 120 characters, Chinese. English. numeral. underline  
 export const collectibleRules:RegExp= /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9_]){4,120}$/

 export const regAa = /^[a-z_A-Z0-9*\s-\.!@#\$%\\\^&\*\)\(\+=\{\}\[\]\/",'<>~\·`\?:;|]{3,70}$/

 // email
export const regEmail = /^\w{3,}(\.\w+)*@[A-z0-9]+(\.[A-z]{2,5}){1,2}$/;



// CN/EN/Number
export const regExchangeName: RegExp =  /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9_]){4,60}$/