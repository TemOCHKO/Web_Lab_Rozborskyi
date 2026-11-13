import { RANDOM_USER_API } from './networkConfig.js';
import { get } from './httpClient.js';
 
export async function fetchTeachers(count) {
    return await get(`${RANDOM_USER_API}/?results=${count}`);
}