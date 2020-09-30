const offset = 127397;
const A = 65;
const Z = 90;

export const emoji = (country) => {
  if ( !country ||
    country.length !== 2
    || f > Z || f < A
    || s > Z || s < A
  )
    return '';

  const f = country.codePointAt(0);
  const s = country.codePointAt(1);
  return String.fromCodePoint(f + offset)
    + String.fromCodePoint(s + offset);
}