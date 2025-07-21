export const getDateParamsFromUrl = (url: URL) => {
  const year = url.searchParams.get('year');
  const month = url.searchParams.get('month');
  const day = url.searchParams.get('day');

  if (!year || !month || !day) {
    return null;
  }

  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
  };
};
