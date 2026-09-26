/**
 * Список стран для выбора в профиле.
 *
 * В базе лежит код ISO 3166-1 alpha-2 — по нему же строится ссылка на флаг
 * (flagcdn.com/w40/<код>.png). Названия здесь намеренно не хранятся: их даёт
 * Intl.DisplayNames браузера, поэтому список сразу переведён на язык
 * интерфейса и не добавляет к бандлу двести пятьдесят строк на каждый язык.
 */

// Необитаемые территории (Антарктида, о. Буве, Херд и Макдональд, Французские
// Южные территории, Внешние малые острова США, Южная Георгия) пропущены
const CODES =
  "AD AE AF AG AI AL AM AO AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ " +
  "CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET " +
  "FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU " +
  "ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ " +
  "LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ " +
  "NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW " +
  "SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TG TH TJ TK TL TM TN TO TR TT TV TW TZ " +
  "UA UG US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW";

export const COUNTRY_CODES: readonly string[] = CODES.split(" ");

const CODE_SET = new Set(COUNTRY_CODES);

/** Код из формы всегда проверяем по списку: в базу не должно попасть произвольное значение. */
export function isCountryCode(value: unknown): value is string {
  return typeof value === "string" && CODE_SET.has(value.toUpperCase());
}

/**
 * Название страны на языке интерфейса.
 * Если Intl.DisplayNames недоступен, показываем сам код — выбор всё равно возможен.
 */
export function countryName(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** Список, отсортированный по названию на нужном языке. */
export function sortedCountries(
  locale: string
): Array<{ code: string; name: string }> {
  const list = COUNTRY_CODES.map((code) => ({
    code,
    name: countryName(code, locale),
  }));

  try {
    const collator = new Intl.Collator(locale);
    list.sort((a, b) => collator.compare(a.name, b.name));
  } catch {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  return list;
}
