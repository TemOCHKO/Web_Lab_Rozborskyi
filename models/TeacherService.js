const courses = [
    "Mathematics", "Physics", "English", "Computer Science", "Dancing", "Chess", "Biology", "Chemistry",
"Law", "Art", "Medicine", "Statistics" 
]

export function pickRandomCourse() {
    return courses[Math.floor(Math.random() * courses.length)];
}

export function generateUUID() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
}

export function calculateAge(bDayString) {
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

            id: user.login?.uuid,
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
    return word !== undefined
    && word !== null 
    && typeof word === 'string' 
    && word.length > 0 
    && word.charAt(0).toUpperCase() === word.charAt(0);
}

export function validateUserObject(user) {
    const errors = []; 

    if (!isStringAndCapitalized(user.full_name)) errors.push({field: 'full_name', problem: 'Full Name is invalid. Should start with a capital letter'});
    if (!isStringAndCapitalized(user.city)) errors.push({field: 'city', problem: 'City is invalid. Should start with a capital letter'});
    if (!isStringAndCapitalized(user.country) ) errors.push({field: 'country', problem: 'Country is invalid'});
    if (!isStringAndCapitalized(user.gender)) errors.push({field: 'gender', problem: 'Gender is invalid'});
    if (!isStringAndCapitalized(user.note)) errors.push({field: 'note', problem: 'Notes field value is invalid. Should start with a capital letter'});
    if (!isStringAndCapitalized(user.course) ) errors.push({field: 'course', problem: 'Course is invalid'});

    if (typeof user.age !== 'number' || Number.isNaN(user.age)) {
        errors.push({field: 'age', problem: 'Age value is invalid'});
    }

    //if (!validatePhone(user.phone, user.country)) {
    //    errors.push({field: 'phone', problem: 'Phone value is invalid'});
    //}

    if (typeof user.email !== 'string' || !user.email.includes('@')) {
        errors.push({field: 'email', problem: 'Email value is invalid'});
    }

    return errors;
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

const countryToContinent = {
  'Germany': 'Europe',
  'Ireland': 'Europe',
  'Australia': 'Australia',
  'United States': 'North America',
  'Finland': 'Europe',
  'Turkey': 'Europe', 
  'Switzerland': 'Europe',
  'France': 'Europe',
  'Spain': 'Europe',
  'Norway': 'Europe',
  'Denmark': 'Europe',
  'Netherlands': 'Europe', 
  'New Zealand': 'Australia'
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

function getContinent(country) {
  return countryToContinent[country] || 'Unknown';
}

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

        if (this.topic === 'country') {
            const continent = getContinent(user[this.topic]);

            
            return this.value === continent;
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

const allowedSortingFilters = ['full_name', 'b_date', 'gender', 'course', 'age', 'country'];
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
        return users.slice().sort(sortComparator(sortMethod)).toReversed();
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
    if (!isNaN(Number(query)) && user.age == query) {
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
    if (query === '' || query.trim() === '') {
        return null;
    }

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