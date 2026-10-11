import { randomUserMock, additionalUsers } from './FE4U-Lab2-mock.js';

const courses = [
    "Mathematics", "Physics", "English", "Computer Science", "Dancing","Chess", "Biology", "Chemistry",
"Law", "Art", "Medicine", "Statistics" 
]

export function pickRandomCourse() {
    return courses[Math.floor(Math.random() * courses.length)];
}

export function mapUsers(randomUserArr, additionalUsersArr) {
    const formattedRandomUsers = randomUserArr.map(user => {
        return {
            gender: user.gender, 
            title: user.name.title, 
            full_name: `${user.name?.first} ${user.name?.last}`, 
            city: user.location?.city, 
            state: user.location?.state, 
            country: user.location?.country, 
            postcode: user.location?.postcode, 
            coordinates: user.location?.coordinates, 
            timezone: user.location?.timezone, 
            email: user.email, 
            b_date: user.dob?.date, 
            age: user.dob?.age, 
            phone: user.phone, 
            picture_large: user.picture.large,
            picture_thumbnail: user.picture.thumbnail, 

            id: user.login?.id,
            favorite: false, 
            course: pickRandomCourse(),
            bg_color: null, 
            note: null 
        }
    });

    const formattedAdditionalUsers = additionalUsersArr.map(user => {
        return {
            gender: user.gender, 
            title: user.title, 
            full_name: user.full_name, 
            city: user.city, 
            state: user.state, 
            country: user.country, 
            postcode: user.postcode, 
            coordinates: user.coordinates, 
            timezone: user.timezone, 
            email: user.email, 
            b_date: user.b_day, 
            age: null, 
            phone: user.phone, 
            picture_large: user.picture_large ?? null,
            picture_thumbnail: user.picture_thumbnail ?? null, 

            id: user.id,
            favorite: user.favorite, 
            course: user.course,
            bg_color: user.bg_color, 
            note: user.note 
        }
    });
    const mergedUsers = [...formattedRandomUsers, ...formattedAdditionalUsers];
    
    let userMap = new Map();
  
    for (let i = 0; i < mergedUsers.length; i++) {
        const user = mergedUsers[i];
        const keyForUser = user.email;
        
        if (!userMap.has(keyForUser) && keyForUser !== undefined) {
            userMap.set(keyForUser, user);
        }
    }
}

function isString(myVariable) {
    return typeof myVar === 'string' || myVar instanceof String;
}

export function validateUserObject(user) {
    if (!isString(user.full_name) || !isString(user.gender) ||
            !isString(user.note) || !isString(user.state) || !isString(user.city) || !isString(user.country)) {
        return false;
    }

    if (typeof user.age === 'number') {
        return false;
    }

    if (!user.email.contains('@')) {
        return false;
    }
}