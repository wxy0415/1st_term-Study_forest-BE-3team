const weekdateHandler = () => {
  const today = new Date();

  //오늘 날짜 문자열화
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const dateString = `${year}-${month}-${day}`;

  //오늘 날짜 00시 정각 
  const date = new Date(dateString);

  const gte = new Date(date.getTime() - (6 * 24 * 60 * 60 * 1000)); // 6일 전 00시 정각
  let lt = new Date(date.getTime() + (24 * 60 * 60 * 100)); // 다음날 00시 정각


  return { gte, lt };
};

export default weekdateHandler;
