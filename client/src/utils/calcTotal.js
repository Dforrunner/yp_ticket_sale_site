export const calcTotal = (qty, price, tip) => (qty * price + Number(tip ? tip : 0)).toFixed(2);
