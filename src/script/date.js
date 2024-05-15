export default function getCurrentDateTime() {
  const currentDateTime = new Date(); // Create a Date object with the current date and time

  // Extract date and time components
  const day = currentDateTime.getDate(); // Day of the month (1-31)
  const month = currentDateTime.getMonth() + 1; // month (0-11, so we add 1)
  const year = currentDateTime.getFullYear(); // Year (YYYY)

  const hour = currentDateTime.getHours(); // hour (0-23)
  const minutes = currentDateTime.getMinutes(); // minutes (0-59)
  const seconds = currentDateTime.getSeconds(); // seconds (0-59)

  // Format components into a text string
  const currentDate = `${year}-${month < 10 ? "0" : ""}${month}-${day < 10 ? "0" : ""}${day}`; // YYYY-MM-DD format
  const currentTime = `${hour < 10 ? "0" : ""}${hour}${minutes < 10 ? "0" : ""}${minutes}${seconds < 10 ? "0" : ""}${seconds}`; // HH:MM:SS format

  // Return the current formatted date and time
  return { date: currentDate, time: currentTime };
}
