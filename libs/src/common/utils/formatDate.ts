const formatDate = (isoDateString: string): string => {
  const date = new Date(isoDateString);
  const day = date.getUTCDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'numeric' });
  const year = date.getUTCFullYear();

  return `${day}/${month}/${year}`;
};

export default formatDate;
