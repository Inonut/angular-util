export class ApplicationMessages {

    public static formatMessage(message, ...paramsArray) {
        let re;
        if (paramsArray != null) {
            if (paramsArray.constructor == Array) { //
                for (let i = 0; i < paramsArray.length; i++) {
                    re = eval('/\\{' + i + '\\}/');
                    message = message.replace(re, paramsArray[i]);
                }
            } else {
                re = /\{0\}/;
                message = message.replace(re, paramsArray);
            }
        }
        return message;
    }
}
