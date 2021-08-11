function withinOpenHours(time) {
  if (time < "10:30" || time > "21:30") {
    return true;
  }
  return false;
}
module.exports = withinOpenHours