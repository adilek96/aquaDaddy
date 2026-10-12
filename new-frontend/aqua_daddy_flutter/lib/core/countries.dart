// Страны для выбора в профиле.
//
// Храним только код ISO 3166-1 alpha-2 — ровно тот же список, что и на бэкенде
// (aquaDaddy/lib/countries.ts). По коду строится и ссылка на флаг
// (flagcdn.com/w40/<код>.png), поэтому отдельная таблица названий не нужна:
// пользователь выбирает страну «по коду и флагу».

const String _codes =
    'AD AE AF AG AI AL AM AO AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ '
    'CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET '
    'FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU '
    'ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ '
    'LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ '
    'NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW '
    'SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TG TH TJ TK TL TM TN TO TR TT TV TW TZ '
    'UA UG US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW';

/// Коды стран, отсортированы по алфавиту.
final List<String> countryCodes = _codes.split(' ')..sort();

final Set<String> _codeSet = countryCodes.toSet();

/// Проверяет, что код есть в списке (на всякий случай — вдруг из профиля
/// пришёл устаревший или пустой код).
bool isKnownCountryCode(String? code) =>
    code != null && _codeSet.contains(code.toUpperCase());

/// Ссылка на PNG-флаг. ширина 40px хватает для бейджа и для списка.
String countryFlagUrl(String code) =>
    'https://flagcdn.com/w40/${code.toLowerCase()}.png';
