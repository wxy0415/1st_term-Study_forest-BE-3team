const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");

const formattedDate = `${year}-${month}-${day}`;

const todayUCT = new Date(
  new Date(formattedDate).getTime() - 12 * 60 * 60 * 1000
);

const nextDayUCT = new Date(
  new Date(formattedDate).getTime() + 15 * 60 * 60 * 1000
);

export { todayUCT, nextDayUCT };
