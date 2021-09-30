
export const dates = {
    months: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ],
    weekdays: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
    ],

    format(dateObj, pattern='{MN} {D}, {YYYY}') {
        if (!(dateObj instanceof Date)) dateObj = new Date(dateObj);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        const monthDigit = month < 10 ? '0'+month : `${month}`;
        const monthName = this.months[month-1];
        const day = dateObj.getDate();
        const dayDigit = day < 10 ? '0'+day : `${day}`;
        const weekday = this.weekdays[dateObj.getDay()];
        const hour = dateObj.getHours();
        const hourDigit = hour < 10 ? '0'+hour : `${hour}`;
        const minute = dateObj.getMinutes();
        const minuteDigit = minute < 10 ? '0'+minute : `${minute}`;
        return pattern
            .replace('{WEEKDAY}', weekday)
            .replace('{D}', day)
            .replace('{0D}', dayDigit)
            .replace('{MONTH}', monthName)
            .replace('{MON}', month)
            .replace('{0MON}', monthDigit)
            .replace('{YYYY}', year)
            .replace('{MIN}', minute)
            .replace('{0MIN}', minuteDigit)
            .replace('{H}', hour)
            .replace('{0H}', hourDigit);
    }
}
