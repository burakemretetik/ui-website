/**
 * Bir kaydın konu/bölge kodlarını sayıma hazırlar: boşlukları siler, büyük harfe
 * çevirir (k17 → K17) ve aynı kodu kayıt başına bir kez bırakır. Böylece bir
 * akademisyende aynı kod iki kez yazılmış olsa da o kod bir kez sayılır.
 */
export function uniqueCodes(codes?: (string | null | undefined)[] | null): string[] {
  const out = new Set<string>();
  for (const c of codes ?? []) {
    if (typeof c !== 'string') continue;
    const k = c.trim().toUpperCase();
    if (k) out.add(k);
  }
  return [...out];
}
