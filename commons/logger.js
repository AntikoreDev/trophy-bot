
const LogType = {
	TRACE: 'TRACE',
	INFO: 'INFO',
	DEBUG: 'DEBUG',
	WARN: 'WARN',
	ERROR: 'ERROR',
	FATAL: 'FATAL',
}

function log(message, type = LogType.INFO){
	const datetime = getDatetime();
	const text = `[${datetime}] [${type}] ${message}`;
	switch(type){
		case LogType.TRACE:
			console.trace(text);
			break;

		case LogType.DEBUG:
			console.debug(text);
			break;

		case LogType.WARN:
			console.warn(text);
			break;

		case LogType.ERROR:
			console.error(text);
			break;

		case LogType.FATAL:
			console.error(text);
			break;
	
		default:
			console.log(text);
			break;
	}
}

function getDatetime(){
	const date = new Date();
	const stringDate = {
		seconds: date.getSeconds().toString().padStart(2, '0'),
		minutes: date.getMinutes().toString().padStart(2, '0'),
		hours: date.getHours().toString().padStart(2, '0'),
		day: date.getDate().toString().padStart(2, '0'),
		month: (date.getMonth() + 1).toString().padStart(2, '0'),
		year: date.getFullYear().toString()
	};

	return `${stringDate.year}-${stringDate.month}-${stringDate.day} ${stringDate.hours}:${stringDate.minutes}:${stringDate.seconds}`;
}

function info(message){
	log(message, LogType.INFO);
}

function debug(message){
	log(message, LogType.DEBUG);
}

function warn(message){
	log(message, LogType.WARN);
}

function error(message){
	log(message, LogType.ERROR);
}

function fatal(message){
	log(message, LogType.FATAL);
}

function trace(message){
	log(message, LogType.TRACE);
}

module.exports = {
	LogType,
	info, debug, warn, error, fatal, trace,
	i: info, d: debug, w: warn, e: error, f: fatal, t: trace
}