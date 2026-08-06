import { getJSON } from './http';
import type { AdminPrimeResponse } from '../types/adminPrime.types';

export async function fetchAdminPrime(): Promise<AdminPrimeResponse> {
  return await getJSON<AdminPrimeResponse>('/panel/api/prime/');
}
