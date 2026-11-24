/**
 * Utilitas konversi angka ke teks Bahasa Indonesia (Terbilang)
 * sesuai format Lampiran I, III, dan IV Perbup Mimika No. 25 Tahun 2024.
 */

const BILANGAN = [
  "",
  "Satu",
  "Dua",
  "Tiga",
  "Empat",
  "Lima",
  "Enam",
  "Tujuh",
  "Delapan",
  "Sembilan",
  "Sepuluh",
  "Sebelas",
];

export function angkaTerbilang(nilai: number): string {
  const n = Math.floor(Math.abs(nilai));
  if (n === 0) return "Nol";
  if (n < 12) return BILANGAN[n];
  if (n < 20) return `${BILANGAN[n - 10]} Belas`;
  if (n < 100) {
    return `${BILANGAN[Math.floor(n / 10)]} Puluh${
      n % 10 !== 0 ? ` ${BILANGAN[n % 10]}` : ""
    }`;
  }
  if (n < 200) {
    return `Seratus${n - 100 !== 0 ? ` ${angkaTerbilang(n - 100)}` : ""}`;
  }
  if (n < 1000) {
    return `${BILANGAN[Math.floor(n / 100)]} Ratus${
      n % 100 !== 0 ? ` ${angkaTerbilang(n % 100)}` : ""
    }`;
  }
  if (n < 2000) {
    return `Seribu${n - 1000 !== 0 ? ` ${angkaTerbilang(n - 1000)}` : ""}`;
  }
  if (n < 1000000) {
    return `${angkaTerbilang(Math.floor(n / 1000))} Ribu${
      n % 1000 !== 0 ? ` ${angkaTerbilang(n % 1000)}` : ""
    }`;
  }
  if (n < 1000000000) {
    return `${angkaTerbilang(Math.floor(n / 1000000))} Juta${
      n % 1000000 !== 0 ? ` ${angkaTerbilang(n % 1000000)}` : ""
    }`;
  }
  if (n < 1000000000000) {
    return `${angkaTerbilang(Math.floor(n / 1000000000))} Miliar${
      n % 1000000000 !== 0 ? ` ${angkaTerbilang(n % 1000000000)}` : ""
    }`;
  }
  return n.toString();
}

export function formatTerbilangRupiah(
  amount: number | string | null | undefined
): string {
  const num = Number(amount) || 0;
  return `${angkaTerbilang(num)} Rupiah`;
}
