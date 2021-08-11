function dayIsTues(date) {
  actualDate = new Date(date);
  if (actualDate.getDay() === 1) {
    return true;
  }
  return false;
}

module.exports = dayIsTues;
