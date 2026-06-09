export type GuimaraesHoliday = {
  date: string;
  note: string;
};

type NagerHoliday = {
  date: string;
  localName: string;
  global: boolean;
  types: string[];
};

const NAGER_API = "https://date.nager.at/api/v3/PublicHolidays";
const MUNICIPAL_MONTH = 6;
const MUNICIPAL_DAY = 24;
const MUNICIPAL_NOTE = "Feriado Municipal de Guimarães";

/** Feriados nacionais em todo o país (exclui regionais como Açores/Madeira). */
function isNationalPublicHoliday(h: NagerHoliday): boolean {
  return h.global && h.types.includes("Public");
}

async function fetchNationalHolidays(year: number): Promise<GuimaraesHoliday[]> {
  const res = await fetch(`${NAGER_API}/${year}/PT`, {
    next: { revalidate: 86_400 },
  });
  if (!res.ok) {
    throw new Error(`Não foi possível obter feriados de ${year}.`);
  }
  const data = (await res.json()) as NagerHoliday[];
  return data
    .filter(isNationalPublicHoliday)
    .map((h) => ({ date: h.date, note: h.localName }));
}

function municipalHoliday(year: number): GuimaraesHoliday {
  const m = String(MUNICIPAL_MONTH).padStart(2, "0");
  const d = String(MUNICIPAL_DAY).padStart(2, "0");
  return { date: `${year}-${m}-${d}`, note: MUNICIPAL_NOTE };
}

/** Feriados nacionais + municipal de Guimarães para um ano. */
export async function fetchGuimaraesHolidays(
  year: number,
): Promise<GuimaraesHoliday[]> {
  const national = await fetchNationalHolidays(year);
  const municipal = municipalHoliday(year);
  const byDate = new Map<string, GuimaraesHoliday>();
  for (const h of national) byDate.set(h.date, h);
  byDate.set(municipal.date, municipal);
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/** Feriados para vários anos (sem duplicar datas). */
export async function fetchGuimaraesHolidaysForYears(
  years: number[],
): Promise<GuimaraesHoliday[]> {
  const uniqueYears = [...new Set(years)].sort((a, b) => a - b);
  const results = await Promise.all(
    uniqueYears.map((year) => fetchGuimaraesHolidays(year)),
  );
  const byDate = new Map<string, GuimaraesHoliday>();
  for (const yearHolidays of results) {
    for (const h of yearHolidays) byDate.set(h.date, h);
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}
