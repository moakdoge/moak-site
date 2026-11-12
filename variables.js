/* This is for purely variables. it loads AFTER backend.js and is exclusively used to keep the main one clean. */


registerStringVariable("username", function() {
    return username;
});

registerStringVariable("hostname", function() {
    return hostname;
});

registerStringVariable("useragent", function() {
    return navigator.userAgent;
});

registerStringVariable("width", function() {
    return String(window.screen.width);
});

registerStringVariable("height", function() {
    return String(window.screen.height);
});


registerStringVariable("age", function() {
    return Math.floor((Date.now() - birthday.getTime()) / 3.15576e10);
});


/* time */
registerStringVariable("milisecond", function() {
    return Math.floor(Date.now()) % 1000;
});
registerStringVariable("second", function() {
    return String(Math.floor(Date.now() / 1000) % 60).padStart(2, "0");
});
registerStringVariable("minute", function() {
    return String(Math.floor(Date.now() / 60000) % 60).padStart(2, "0");
});
registerStringVariable("hour", function() {
    return String(new Date().getHours()).padStart(2, "0");
});
registerStringVariable("day", function() {
    return new Date().getDate();
});
registerStringVariable("month", function() {
    return new Date().getMonth() + 1;
});
registerStringVariable("longmonth", function() {
    return new Date().toLocaleString('en-US', { month: 'long' });
});
registerStringVariable("year", function() {
    return new Date().getFullYear();
});
registerStringVariable("longyear", function() {
    return new Date().toLocaleString('en-US', { year: 'numeric' });
});
registerStringVariable("weekday", function() {
    return new Date().toLocaleString('en-US', { weekday: 'long' });
});

/* uptime stats */
function getUptimeMilliseconds() {
    return Math.max(Date.now() - getStartupTime().getTime(), 0);
}

registerStringVariable("uptime-milisecond", function() {
    return getUptimeMilliseconds() % 1000;
});
registerStringVariable("uptime-second", function() {
    return Math.floor(getUptimeMilliseconds() / 1000) % 60;
});
registerStringVariable("uptime-minute", function() {
    return Math.floor(getUptimeMilliseconds() / 60000) % 60;
});
registerStringVariable("uptime-hour", function() {
    return Math.floor(getUptimeMilliseconds() / 3600000) % 24;
});
registerStringVariable("uptime-day", function() {
    return Math.floor(getUptimeMilliseconds() / 86400000);
});
