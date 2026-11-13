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
    const formattedRandomUsers = _.map(randomUserArr, user => {
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

    const formattedAdditionalUsers = _.map(additionalUsersArr, user => {
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
            note: _.isNil(user.note) ? `Hi! My name is ${user.full_name}` : user.note        
        }
    });

    return _.chain(formattedRandomUsers)
        .concat(formattedAdditionalUsers)
        .filter((user) => !_.isNil(user.email))
        .uniqBy('email')
        .value();
}


// VALIDATION

function isStringAndCapitalized(word) {
    if (!_.isString(word) || _.isEmpty(_.trim(word))) {
        return false;
    }

    const firstChar = _.head(word);
    return firstChar === _.toUpper(firstChar);
}

const VALIDATION_RULES = [
    {
        field: 'full_name',
        validate: isStringAndCapitalized,
        problem: 'Full Name is invalid. Should start with a capital letter'
    },
    {
        field: 'city',
        validate: isStringAndCapitalized,
        problem: 'City is invalid. Should start with a capital letter'
    },
    {
        field: 'country',
        validate: isStringAndCapitalized,
        problem: 'Country is invalid'
    },
    {
        field: 'gender',
        validate: isStringAndCapitalized,
        problem: 'Gender is invalid'
    },
    {
        field: 'note',
        validate: isStringAndCapitalized,
        problem: 'Notes field value is invalid. Should start with a capital letter'
    },
    {
        field: 'course',
        validate: isStringAndCapitalized,
        problem: 'Course is invalid'
    },
    {
        field: 'age',
        validate: (val) => _.isNumber(val) && !_.isNaN(val),
        problem: 'Age value is invalid'
    },
    {
        field: 'email',
        validate: (val) => _.isString(val) && _.includes(val, '@'),
        problem: 'Email value is invalid'
    }
    /*
    {
        field: 'phone',
        validate: (val, user) => validatePhone(val, _.get(user, 'country')),
        problem: 'Phone value is invalid'
    }
    */
];

export function validateUserObject(user) {
    return _.reduce(
        VALIDATION_RULES,
        (errors, rule) => {
            const value = _.get(user, rule.field);
            if (!rule.validate(value, user)) {
                errors.push({ field: rule.field, problem: rule.problem });
            }
            return errors;
        },
        []
    );
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
    if (_.isNil(format) || _.isEmpty(_.toString(format).trim())) {
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
        if (_.isNil(this.value) || this.value === '' || !_.includes(allowedFilters, this.topic)) {
            return true;
        }

        const userValue = _.get(user, this.topic);
        if (this.topic === 'age') {
            const [min, max] = _.map(_.split(this.value, '-'), Number);
            const age = Number(userValue);
                        
            return _.inRange(age, min, max + 1);
        }

        if (this.topic === 'country') {
            const continent = getContinent(user[this.topic]);
            return this.value === continent;
        }

        return _.isEqual(userValue, this.value);
    }
}

class FilterCriteria {
    constructor(...criterias) {
        this.criterias = criterias;
    }

    filter(subj) {
        return _.every(this.criterias, (criteria) => criteria.isValidFilter(subj));
    } 
}

export function filterUsers(users, filterCriteria) {
    const filterSpecs = new FilterCriteria(
        new FieldFilterCriteria('age', filterCriteria.age), 
        new FieldFilterCriteria('country', filterCriteria.country),
        new FieldFilterCriteria('gender', filterCriteria.gender), 
        new FieldFilterCriteria('favorite', filterCriteria.favorite)  
    );

    return _.filter(users, (user) => filterSpecs.filter(user));
}  


// SORT
/*
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
*/

const allowedSortingFilters = ['full_name', 'b_date', 'gender', 'course', 'age', 'country'];
export function sortUsers(users, sortMethod, order='asc') {
    if (users === undefined || users === null || users.length === 0) {
        return users.slice();
    }

    if (!allowedSortingFilters.includes(sortMethod)) {
        return users.slice();
    }

    if (order === 'asc') {
        return _.sortBy(users, [`${sortMethod}`]);
    }
    if (order === 'desc') {
        return _.orderBy(users, [`${sortMethod}`], ['desc']);
    }

    return users.slice();
}


// SEARCH

const otherAllowedSearchFields = ['full_name', 'note'];
function doesMatch(user, query) {
    if (_.isEmpty(_.toString(query).trim())) {
        return false;
    }

    const queryWithoutSpace = _.trim(_.toString(query)).toLowerCase();
    const age = _.get(user, 'age');
    const num = Number(queryWithoutSpace.slice(1));

    if (!isNaN(Number(queryWithoutSpace)) && Number(queryWithoutSpace) === age) {
        return true;
    }

    if (_.startsWith(queryWithoutSpace, '<') && !isNaN(num)) {
        return _.lt(age, num);
    }
    if (_.startsWith(queryWithoutSpace, '>') && !isNaN(num)) {
        return _.gt(age, num);
    }

    return _.some(otherAllowedSearchFields, (field) => {
        const value = _.get(user, field);
        return !_.isNil(value) && _.includes(_.toLower(value), queryWithoutSpace);
    });

}

export function searchUsers(users, query) {
    if (_.isEmpty(_.toString(query).trim())) {
        return null;
    }

    if (_.isNil(query)) {
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

export function getStatisticsForChart(teachers, method) {
    const stats = {};
    
    teachers.forEach(teacher => {
        var subject;
        if (method === 'course') subject = teacher.course || 'Other';
        else if (method === 'age') subject = teacher.age || 'N/A'; 
        else subject = teacher.country || 'N/A';
        stats[subject] = (stats[subject] || 0) + 1;
    });

    return {
        labels: Object.keys(stats),   
        data: Object.values(stats)   
    };
    
}