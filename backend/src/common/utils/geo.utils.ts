export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function isWithinDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  maxDistanceMeters: number,
): boolean {
  return haversineDistance(lat1, lon1, lat2, lon2) <= maxDistanceMeters;
}

export const MIN_DISTANCE_METERS = 25;

export interface GeoLocationInfo {
  city: string;
  state: string;
  stateCode: string;
}

const BRAZIL_STATE_CODES: Record<string, string> = {
  'Acre': 'AC',
  'Alagoas': 'AL',
  'Amapá': 'AP',
  'Amazonas': 'AM',
  'Bahia': 'BA',
  'Ceará': 'CE',
  'Distrito Federal': 'DF',
  'Espírito Santo': 'ES',
  'Goiás': 'GO',
  'Maranhão': 'MA',
  'Mato Grosso': 'MT',
  'Mato Grosso do Sul': 'MS',
  'Minas Gerais': 'MG',
  'Pará': 'PA',
  'Paraíba': 'PB',
  'Paraná': 'PR',
  'Pernambuco': 'PE',
  'Piauí': 'PI',
  'Rio de Janeiro': 'RJ',
  'Rio Grande do Norte': 'RN',
  'Rio Grande do Sul': 'RS',
  'Rondônia': 'RO',
  'Roraima': 'RR',
  'Santa Catarina': 'SC',
  'São Paulo': 'SP',
  'Sergipe': 'SE',
  'Tocantins': 'TO',
};

export async function reverseGeocode(latitude: number, longitude: number): Promise<GeoLocationInfo> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=pt-BR`,
      {
        headers: {
          'User-Agent': 'SupremaEnquetes/1.0',
        },
      },
    );

    if (!response.ok) {
      throw new Error('Falha na geocodificação reversa');
    }

    const data = await response.json();
    const address = data.address || {};

    let city = address.city || address.town || address.village || address.municipality || address.county || 'Desconhecida';
    let state = address.state || 'Desconhecido';
    const countryCode = address.country_code?.toUpperCase();

    if (countryCode !== 'BR') {
      return {
        city: 'Fora do Brasil',
        state: 'Fora do Brasil',
        stateCode: 'XX',
      };
    }

    const stateCode = BRAZIL_STATE_CODES[state] || 'XX';

    return { city, state, stateCode };
  } catch (error) {
    console.error('Erro na geocodificação reversa:', error);
    return {
      city: 'Não identificado',
      state: 'Não identificado',
      stateCode: 'XX',
    };
  }
}

export function isInState(latitude: number, longitude: number, targetStateCode: string): boolean {
  const stateBounds: Record<string, { minLat: number; maxLat: number; minLng: number; maxLng: number }> = {
    AC: { minLat: -11.5, maxLat: -7.0, minLng: -74.0, maxLng: -66.5 },
    AL: { minLat: -10.5, maxLat: -8.5, minLng: -38.0, maxLng: -35.0 },
    AP: { minLat: -4.5, maxLat: 4.5, minLng: -54.5, maxLng: -49.5 },
    AM: { minLat: -10.5, maxLat: 4.5, minLng: -74.0, maxLng: -56.0 },
    BA: { minLat: -18.5, maxLat: -8.5, minLng: -47.0, maxLng: -37.0 },
    CE: { minLat: -8.0, maxLat: -2.5, minLng: -41.5, maxLng: -37.0 },
    DF: { minLat: -16.5, maxLat: -15.0, minLng: -48.5, maxLng: -47.0 },
    ES: { minLat: -21.5, maxLat: -17.5, minLng: -42.0, maxLng: -39.5 },
    GO: { minLat: -19.5, maxLat: -12.5, minLng: -53.5, maxLng: -45.5 },
    MA: { minLat: -8.5, maxLat: -1.0, minLng: -48.5, maxLng: -41.5 },
    MT: { minLat: -18.0, maxLat: -7.0, minLng: -62.0, maxLng: -50.0 },
    MS: { minLat: -24.5, maxLat: -13.5, minLng: -58.0, maxLng: -51.5 },
    MG: { minLat: -23.5, maxLat: -14.0, minLng: -51.5, maxLng: -39.5 },
    PA: { minLat: -10.0, maxLat: 4.5, minLng: -59.0, maxLng: -46.0 },
    PB: { minLat: -8.5, maxLat: -6.0, minLng: -38.5, maxLng: -34.5 },
    PR: { minLat: -27.0, maxLat: -22.0, minLng: -55.0, maxLng: -48.0 },
    PE: { minLat: -9.5, maxLat: -7.0, minLng: -41.5, maxLng: -34.5 },
    PI: { minLat: -11.0, maxLat: -2.5, minLng: -46.0, maxLng: -39.5 },
    RJ: { minLat: -23.5, maxLat: -20.5, minLng: -45.0, maxLng: -40.5 },
    RN: { minLat: -6.5, maxLat: -4.5, minLng: -38.5, maxLng: -35.0 },
    RS: { minLat: -34.0, maxLat: -27.0, minLng: -58.0, maxLng: -49.5 },
    RO: { minLat: -14.0, maxLat: -7.5, minLng: -67.0, maxLng: -59.5 },
    RR: { minLat: -2.0, maxLat: 5.5, minLng: -65.0, maxLng: -58.5 },
    SC: { minLat: -29.5, maxLat: -25.5, minLng: -54.0, maxLng: -48.0 },
    SP: { minLat: -25.5, maxLat: -19.5, minLng: -53.5, maxLng: -43.5 },
    SE: { minLat: -11.5, maxLat: -9.5, minLng: -38.5, maxLng: -36.0 },
    TO: { minLat: -13.5, maxLat: -5.0, minLng: -51.0, maxLng: -45.5 },
  };

  const bounds = stateBounds[targetStateCode.toUpperCase()];
  if (!bounds) return true;

  return (
    latitude >= bounds.minLat &&
    latitude <= bounds.maxLat &&
    longitude >= bounds.minLng &&
    longitude <= bounds.maxLng
  );
}