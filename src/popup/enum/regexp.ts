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

// 4 to 60 characters, Chinese. English. numeral. underline  
 export const collectibleRules:RegExp= /[^\a-\z\A-\Z0-9\u4E00-\u9FA5\{4,60}$]/g

// CN/EN/Number
export const regExchangeName: RegExp = /[^\a-\z\A-\Z0-9\u4E00-\u9FA5\{4,20}]/g