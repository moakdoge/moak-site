/* This is for purely variables. it loads AFTER backend.js and is exclusively used to keep the main one clean. */


registerStringVariable("username", async function() {
    return username;
});

registerStringVariable("hostname", async function() {
    return hostname;
});

registerStringVariable("useragent", async function() {
    return navigator.userAgent;
});

registerStringVariable("width", async function() {
    return String(window.screen.width);
});

registerStringVariable("height", async function() {
    return String(window.screen.height);
});


registerStringVariable("age", async function() {
    return Math.floor((Date.now() - birthday.getTime()) / 3.15576e10);
});


/* time */
registerStringVariable("milisecond", async function() {
    return Math.floor(Date.now()) % 1000;
});
registerStringVariable("second", async function() {
    return String(Math.floor(Date.now() / 1000) % 60).padStart(2, "0");
});
registerStringVariable("minute", async function() {
    return String(Math.floor(Date.now() / 60000) % 60).padStart(2, "0");
});
registerStringVariable("hour", async function() {
    return String(new Date().getHours()).padStart(2, "0");
});
registerStringVariable("day", async function() {
    return new Date().getDate();
});
registerStringVariable("month", async function() {
    return new Date().getMonth() + 1;
});
registerStringVariable("longmonth", async function() {
    return new Date().toLocaleString('en-US', { month: 'long' });
});
registerStringVariable("year", async function() {
    return new Date().getFullYear();
});
registerStringVariable("longyear", async function() {
    return new Date().toLocaleString('en-US', { year: 'numeric' });
});
registerStringVariable("weekday", async function() {
    return new Date().toLocaleString('en-US', { weekday: 'long' });
});

/* uptime stats */
async function getUptimeMilliseconds() {
    return Math.max(Date.now() - (await getStartupTime()).getTime(), 0);
}

registerStringVariable("uptime-milisecond", async function() {
    return (await getUptimeMilliseconds()) % 1000;
});
registerStringVariable("uptime-second", async function() {
    return Math.floor(await getUptimeMilliseconds() / 1000) % 60;
});
registerStringVariable("uptime-minute", async function() {
    return Math.floor(await getUptimeMilliseconds() / 60000) % 60;
});
registerStringVariable("uptime-hour", async function() {
    return Math.floor(await getUptimeMilliseconds() / 3600000) % 24;
});
registerStringVariable("uptime-day", async function() {
    return Math.floor(await getUptimeMilliseconds() / 86400000);
});
