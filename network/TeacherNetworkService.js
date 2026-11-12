import { RANDOM_USER_API, LOCAL_API_URL } from './networkConfig.js';
import { get } from './httpClient.js';
 
export async function fetchTeachers(count) {
    return await get(`${RANDOM_USER_API}/?results=${count}`);
}

export async function saveTeacherToApi(teacherData) {
    const response = await fetch(LOCAL_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(teacherData)
    });

    if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
    }

    return await response.json();
}