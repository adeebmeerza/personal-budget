const isValidDate = (date) => {
  const dateObject = date instanceof Date ? date : new Date(date);
  return dateObject instanceof Date && !isNaN(dateObject.getTime());
};

function isValidDateRange(startDate, endDate) {
  // Check if both startDate and endDate are provided
  if (startDate === undefined || endDate === undefined) {
    throw new Error("Both startDate and endDate must be specified.");
  }

  // Convert to Date objects
  const start = startDate;
  const end = endDate;

  // Validate that both are valid dates
  if (!isValidDate(startDate) || !isValidDate(end)) {
    throw new Error("startDate and endDate must be valid dates.");
  }

  // Check if startDate is before endDate
  if (start > end) {
    throw new Error("startDate must be less than endDate.");
  }

  // If all checks pass, return true to indicate success
  return true;
}

const isValidNumericId = (id) => {
  if (id === undefined || id === null) {
    return false;
  }
  const numericId = Number(id);
  return !isNaN(numericId);
};

module.exports = {
  isValidDate,
  isValidDateRange,
  isValidNumericId,
};
