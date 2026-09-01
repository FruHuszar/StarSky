/**
 * A csillagokhoz tartozó, generált mondatok. Egy helyen, mert ugyanaz a
 * szöveg jelenik meg a beállításoknál és az emlékkönyv lapjain is.
 */

const VOWELS = "aáeéiíoóöőuúüű";

export const daylightNote = (name) =>
  `${VOWELS.includes(name[0].toLowerCase()) ? "Az" : "A"} ${name} ezen a napon nem éjjel tündöklött, hanem a nappal együtt ragyogott az égen.`;
