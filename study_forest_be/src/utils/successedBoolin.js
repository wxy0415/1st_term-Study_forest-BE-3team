const successedBoolin = (array) => {
  return array.map((result) => {
    const successed = [false, false, false, false, false, false, false];

    result.forEach((object) => {
      const weekInt = object.createdAt.getDay();
      if (weekInt >= 0 && weekInt <= 6) {
        successed[weekInt] = true;
      }
    });

    if (successed[0]) {
      successed.shift();
      successed.push(true);
    } else {
      successed.shift();
      successed.push(false);
    }

    return successed;
  });
};

export default successedBoolin