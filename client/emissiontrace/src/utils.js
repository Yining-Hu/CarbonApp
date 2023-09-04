function   parseTimestamp(ts) {
    let dateObj = new Date(ts*1000)
    let utcString = dateObj.toUTCString();
    return utcString
  }

module.exports = {parseTimestamp}