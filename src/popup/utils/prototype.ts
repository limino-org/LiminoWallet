// @ts-ignore
String.prototype.getBytesLength = function() {
    return this.replace(/[\u4e00-\u9fa5]/g,"aa").length
}