import { randomUserMock, additionalUsers } from './FE4U-Lab2-mock.js';

const courses = [
    "Mathematics", "Physics", "English", "Computer Science", "Dancing", "Chess", "Biology", "Chemistry",
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

    if (!typeof user.age === 'number') {
        return false;
    }

    if (!validatePhone(user.phone, user.country)) {
        return false;
    }

    if (!user.email.contains('@')) {
        return false;
    }
}

// https://github.com/mnestorov/regex-patterns#spain
const phoneToCountry = {
  Germany: /^\d{3,4}-\d{7,8}$/,              
  Ukraine: /^(\+?38)?0\d{9}$/,                
  USA: /^\(\d{3}\)-\d{3}-\d{4}$/,             
  France: /^\d{2}-\d{2}-\d{2}-\d{2}-\d{2}$/, 
  Finland: /^\[1-9][0-9]{8}$/, 
  Switzerland: /^\[1-9][0-9]{8}$/, 
  Spain: /^\[6-9][0-9]{8}$/, 
  Norway: /^\[2-9][0-9]{7,8}$/, 
  Denmark: /^\+372[5-9][0-9]{6,7}$/, 
  Netherlands: /^\[0-9]{9}$/,
  
  default: /^[\d\s\-+()]{7,20}$/
};

function validatePhone(phone, country) {
    let format = phoneToCoutry[country];
    if (format === underfined || format === null || format === '') {
        format = phoneToCountry.default;
    }

    return format.test(phone);
}

const allowedFilters = ['age', 'gender', 'favorite', 'country'];
class FieldFilterCriteria {
    constructor(topic, value) {
        this.topic = topic;
        this.value = value;
    }

    isValidFilter(subj) {
        if (this.value === undefined || this.value === null || this.value === '' || !allowedFilters.includes(this.topic)) {
            return true;
        }

        if (this.topic === 'age') {
            const [min, max] = this.value.split('-').map(Number);
            const itemValue = Number(subj[this.topic]);

            return itemValue >= min && itemValue <= max;
        }

        return subj[this.topic] === value;
    }
}

class FilterCriteria {
    constructor(...criterias) {
        this.criterias = criterias;
    }

    filter(subj) {
        return this.criterias.every((criteria) => criteria.isValidFilter(subj));
    } 
}

export function filterUsers(users, filterCriteria) {
    const filterSpecs = new FilterCriteria(
        new FieldFilterCriteria('age', filterCriteria.age), 
        new FieldFilterCriteria('country', filterCriteria.region),
        new FieldFilterCriteria('gender', filterCriteria.sex), 
        new FieldFilterCriteria('favorite', filterCriteria.favorite)  
    );

    return users.filter((user) => filterSpecs.filter(user));
}  