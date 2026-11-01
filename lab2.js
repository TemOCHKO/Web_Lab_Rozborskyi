import { randomUserMock, additionalUsers } from './FE4U-Lab2-mock.js';

const courses = [
    "Mathematics", "Physics", "English", "Computer Science", "Dancing", "Chess", "Biology", "Chemistry",
"Law", "Art", "Medicine", "Statistics" 
]

export function pickRandomCourse() {
    return courses[Math.floor(Math.random() * courses.length)];
}

function calculateAge(bDayString) {
    if (!bDayString) {
        return 0;
    }
    const birthDate = new Date(bDayString);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export function mapUsers(randomUserArr, additionalUsersArr) {
    const formattedRandomUsers = randomUserArr.map(user => {
        return {
            gender: user.gender.charAt(0).toUpperCase() + user.gender.slice(1), 
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
            note: 'Hi! My name is ' + user.name?.first
        }
    });

    const formattedAdditionalUsers = additionalUsersArr.map(user => {
        return {
            gender: user.gender.charAt(0).toUpperCase() + user.gender.slice(1), 
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
            //age: user.age ?? calculateAge(user.b_day), 
            age: user.age, 
            phone: user.phone, 
            picture_large: user.picture_large ?? null,
            picture_thumbnail: user.picture_thumbnail ?? null, 

            id: user.id,
            favorite: user.favorite, 
            course: user.course,
            bg_color: user.bg_color, 
            note: user.note === null ? 'Hi! My name is ' + user.full_name : user.note 
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

    return Array.from(userMap.values())
}


// VALIDATION

function isStringAndCapitalized(word) {
    return typeof word === 'string' 
    && word.length > 0 
    && word.charAt(0).toUpperCase() === word.charAt(0);
}

export function validateUserObject(user) {
    if (!isStringAndCapitalized(user.full_name) || !isStringAndCapitalized(user.gender) ||
            !isStringAndCapitalized(user.note) || !isStringAndCapitalized(user.state) || !isStringAndCapitalized(user.city) || !isStringAndCapitalized(user.country)) {
        return {status: false, problem: 'Error validating text fields'};
    }

    if (typeof user.age !== 'number' || Number.isNaN(user.age)) {
        return {status: false, problem: 'Age is Invalid'};
    }

    if (!validatePhone(user.phone, user.country)) {
        return {status: false, problem: 'Phone not matching country ' + user.country};
    }

    if (typeof user.email !== 'string' || !user.email.includes('@')) {
        return {status: false, problem: 'Email is invalid'};
    }

    return {status: true, problem: ''};
}

// https://github.com/mnestorov/regex-patterns
const phoneToCountry = {
  Germany: /^\d{3,4}-\d{7,8}$/,                 
  Ireland: /^\d{3}-\d{3}-\d{4}$/,               
  Australia: /^\d{2}-\d{4}-\d{4}$/,              
  'United States': /^\(\d{3}\)-\d{3}-\d{4}$/,    
  Finland: /^\d{2}-\d{3}-\d{3}$/,                
  Turkey: /^\(\d{3}\)-\d{3}-\d{4}$/,            
  Switzerland: /^\d{3}\s\d{3}\s\d{2}\s\d{2}$/,   
  France: /^\d{2}-\d{2}-\d{2}-\d{2}-\d{2}$/,
  Spain: /^[6-9][0-9]{8}$/,
  Norway: /^[2-9][0-9]{7,8}$/,
  Denmark: /^\d{8}$/,
  Netherlands: /^[0-9]{9}$/,

  default: /^[\d\s\-+()]{7,20}$/,
};

function validatePhone(phone, country) {
    if (typeof phone !== 'string') {
        return false;
    }

    let format = phoneToCountry[country];
    if (format === undefined || format === null || format === '') {
        format = phoneToCountry.default;
    }

    return format.test(phone);
}


// FILTER

const allowedFilters = ['age', 'gender', 'favorite', 'country'];
class FieldFilterCriteria {
    constructor(topic, value) {
        this.topic = topic;
        this.value = value;
    }

    isValidFilter(user) {
        if (this.value === undefined || this.value === null || this.value === '' || !allowedFilters.includes(this.topic)) {
            return true;
        }

        if (this.topic === 'age') {
            const [min, max] = this.value.split('-').map(Number);
            const itemValue = Number(user[this.topic]);

            return itemValue >= min && itemValue <= max;
        }

        return user[this.topic] === this.value;
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
        new FieldFilterCriteria('country', filterCriteria.country),
        new FieldFilterCriteria('gender', filterCriteria.gender), 
        new FieldFilterCriteria('favorite', filterCriteria.favorite)  
    );

    return users.slice().filter((user) => filterSpecs.filter(user));
}  


// SORT

function sortComparator(field) {
    return function(a, b) {

        let aValue = a[field];
        let bValue = b[field];

        if (field === 'b_date') {
            aValue = new Date(aValue).getTime();
            bValue = new Date(bValue).getTime();
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return aValue.localeCompare(bValue);
        }

        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
        return 0;
    }
}

const allowedSortingFilters = ['full_name', 'b_date', 'age', 'country'];
export function sortUsers(users, sortMethod, order='asc') {
    if (users === undefined || users === null || users.length === 0) {
        return users.slice();
    }

    if (!allowedSortingFilters.includes(sortMethod)) {
        return users.slice();
    }

    if (order === 'asc') {
        return users.slice().sort(sortComparator(sortMethod));
    }
    if (order === 'desc') {
        return users.sort(sortComparator(sortMethod)).toReversed();
    }

    return users.slice();
}


// SEARCH

const otherAllowedSearchFields = ['full_name', 'note'];
function doesMatch(user, query) {
    if (query === undefined || query === null || query === '') {
        return false;
    }

    // if query is number
    if (!isNaN(Number(query)) && user.age === query) {
        return true;
    }

    query = String(query).trim().toLowerCase();

    // if query is of type '<50' / '>18'
    if (query.charAt(0) === '<' && query.length > 1) {
        let num = Number(query.slice(1));
        if (!isNaN(num) && user.age < num) {
            return true;
        }
    }
    if (query.charAt(0) === '>' && query.length > 1) {
         let num = Number(query.slice(1));
        if (!isNaN(num) && user.age > num) {
            return true;
        }
    }

    // for note and full_name
    for (const field of otherAllowedSearchFields) {
        let userValueField = user[field];

        if (userValueField !== undefined || userValueField !== null) {
            if (userValueField.toLowerCase().includes(query)) {
                return true;
            }
        }
    }

}

export function searchUsers(users, query) {
    if (query === undefined || query === null || query === '' || query.trim() === '') {
        return [...users];
    }

    return users.slice().filter(user => doesMatch(user, query));
}


// PERCENTAGE

export function getUsersSearchPercentage(users, query) {
    if (users === undefined || users === null || users.length === 0) {
        return 0;
    }

    const userFittingSearch = searchUsers(users, query);
    return Math.round((userFittingSearch.length / users.length) * 100);
} 



const arr = mapUsers(randomUserMock, additionalUsers); 

console.log("\n\n\nVALIDATE USER\n");
for (let i = 0; i < arr.length; i++) {
    const validationResult = validateUserObject(arr[i]);
    validationResult.status === true ? console.log('Validated user - ' + arr[i].full_name + " successfully")
                    : console.log('Error validating user - ' + arr[i].full_name + ". Problem - " + validationResult.problem);
}


let filteredUsers = filterUsers(arr, {country: 'Spain', gender: 'Male'});

console.log("\n\n\nFILTER USERS\n");
console.log(filteredUsers);

const sortMethod = 'b_date';
console.log("\n\n\nSORT USERS BY " + sortMethod + '\n')
console.log(sortUsers(arr, sortMethod, 'desc').slice(0, 5));

const sFilter = '<35';
console.log("\n\n\nSEARCH USERS WITH AGE " + sFilter + "\n")
const searchedUsers = searchUsers(arr, sFilter); 

const searchFilter = '<50';
console.log(searchedUsers);
console.log("\n\n\nPERCENTAGE OF USERS " + searchFilter + "%\n")
console.log(getUsersSearchPercentage(arr, searchFilter));

