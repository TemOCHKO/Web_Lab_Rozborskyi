import { mapUsers, filterUsers } from './TeacherService.js';
import { randomUserMock, additionalUsers } from './FE4U-Lab2-mock.js';
import { fetchTeachers } from '../network/TeacherNetworkService.js'

//let teachers = mapUsers(randomUserMock, additionalUsers);

// /*

let teachers = [];

export async function initTeachers() {
    try {
        const data = await fetchTeachers(10);
        const rawUsers = data?.results || data || [];
        teachers = mapUsers(rawUsers, []);
    } catch (error) {
        console.error('Could not fetch teachers:', error.message);
        teachers = [];
    }
    return teachers;
}

// */

export async function setMoreTeachersBy(count) {
    let newTeachers = [];
    try {
        const data = await fetchTeachers(count);
        const rawUsers = data?.results || data || [];
        newTeachers = mapUsers(rawUsers, []);
    } catch (error) {
        console.error('Could not fetch more teachers:', error.message);
    }
    
    teachers = [...teachers, ...newTeachers];
}

export function getTeachers() {
    
    return teachers;
}

export function setTeachers(newTeachers) {
    teachers = newTeachers;
}

export function addTeacher(teacher) {
    const index = teachers.findIndex(x => x.id === teacher.id);    
    if (index >= 0) {
        teachers[index] = teacher;
        return;
    }
    teachers.unshift(teacher); 
}

export function getTeacherById(id) {
    return teachers.find(u => String(u.id) === String(id) || u.email === id);
}

export function getTeachersWithFilters(filters) {
    return filterUsers(teachers, filters);
}

export function getAllTeachersCountries() {
    return [...new Set(teachers.map(teach => teach.country))];
}

export function getAllTeachersSpecialties() {
    return [...new Set(teachers.map(teach => teach.course))];
}

export function getFavoriteTeachers() {
    return _.filter(teachers, { favorite: true });
}