import { addTeacher, getTeacherById, getAllTeachersCountries, getAllTeachersSpecialties } from '../models/teacherRepository.js';
import { getFavoriteFilter } from './filterView.js'
import { calculateAge, generateUUID, validateUserObject } from '../models/TeacherService.js'

let currentMap = null;
export function renderPopup(popUpId, user) {
    const popup = document.getElementById(popUpId);
    if (!popup || !user) {
        return;
    }

    destroyMap();

    const infoPopupImg = popup.querySelector('.info-popup-img');
    infoPopupImg.src = user.picture_large == null ? './default.jpg' : user.picture_large;;

    const nameHeader = popup.querySelector('.popup-name');
    nameHeader.textContent = user.full_name;

    const popupStar = popup.querySelector('.popup-star');
    const isFav = user.favorite ?? false;
    popupStar.dataset.initialFavorite = isFav;
    popupStar.dataset.isFavorite = isFav;
    popupStar.dataset.teacherId = user.id;
    popupStar.textContent = isFav ? '★' : '☆';

    const specializationHeader = popup.querySelector('.popup-specialization');
    specializationHeader.textContent = user.course;

    const locationHeader = popup.querySelector('#popup-location');
    locationHeader.textContent = `${user.city}, ${user.country}`;
    
    const dataHeader = popup.querySelector('#popup-data');
    dataHeader.textContent = `${user.age ? user.age : 'N/A'}, ${user.gender}`;

    const emailLink = popup.querySelector('#popup-email');
    emailLink.textContent = user.email || 'No Email';
    emailLink.href = user.email ? `mailto:${user.email}` : '#';

    const phoneHeader = popup.querySelector('#popup-phone');
    phoneHeader.textContent = user.phone || 'No Phone';

    const description = popup.querySelector('.popup-description');
    description.innerHTML = user.note + "<br><a href=\"#\" class=\"popup-link toggle-map\">toggle map</a>";

    const mapContainer = popup.querySelector('#teacher-coords');
    if (mapContainer) {
        mapContainer.classList.add('hidden');
    }

    popup.classList.remove('hidden');
}

export function toggleTeacherMap(coordinates) {
    const mapContainer = document.getElementById('teacher-coords');
    if (!mapContainer || !coordinates?.latitude || !coordinates?.longitude) {
        console.warn('Map container or coordinates missing');
        return;
    }

    mapContainer.classList.toggle('hidden');

    if (!mapContainer.classList.contains('hidden')) {
        const lat = Number(coordinates.latitude);
        const lng = Number(coordinates.longitude);

        if (currentMap) {
            currentMap.remove();
            currentMap = null;
        }

        currentMap = L.map(mapContainer).setView([lat, lng], 10);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(currentMap);

        L.marker([lat, lng]).addTo(currentMap);

        requestAnimationFrame(() => {
            if (currentMap) {
                currentMap.invalidateSize();
            }
        });
    }
}

export function destroyMap() {
    if (currentMap) {
        currentMap.remove();
        currentMap = null;
    }
}

export function closePopup(popupId) {
    const popup = document.getElementById(popupId);
    if (!popup) return false;

    popup.classList.add('hidden');

    const popupStar = popup.querySelector('.popup-star');
    const teacher = getTeacherById(popupStar.dataset.teacherId);

    if (!teacher) return false;

    const initialFavorite = popupStar.dataset.initialFavorite === 'true';
    const newFavorite = popupStar.dataset.isFavorite === 'true';

    teacher.favorite = newFavorite;
    addTeacher(teacher);

    const isFavoritesMode = getFavoriteFilter();
    const statusChanged = initialFavorite !== newFavorite;

    const toggleMapContainer = document.querySelector('.toggle-map');
    toggleMapContainer.classList.remove('hidden');

    return isFavoritesMode || statusChanged;
}

export function renderAddTeacherPopup() {
    const popup = document.querySelector('#addPopup');
    clearErrors();

    infiltrateTeacherSpecialtySelector();
    infiltrateTeacherCountrySelector();

    popup.classList.remove('hidden');
}

function infiltrateTeacherSpecialtySelector() {
    const specialties = getAllTeachersSpecialties();

    const specDatalist = document.querySelector('#specialty-list'); 
    if (specDatalist) populateDatalistDOM(specDatalist, specialties);
}

function populateSelectDOM(selectSelector, optionsArray, placeholder = 'Select option...') {
    const validOptions = optionsArray.filter(item => item !== null && item !== undefined && String(item).trim() !== '');

    const optionsHTML = validOptions.map(item => {
        const value = String(item).trim();
        return `<option value="${value}">${value}</option>`;
    }).join('');

    selectSelector.innerHTML = `<option value="" disabled selected>${placeholder}</option>` + optionsHTML;
}

function populateDatalistDOM(datalistElement, optionsArray) {
    const validOptions = optionsArray.filter(item => item !== null && item !== undefined && String(item).trim() !== '');

    const optionsHTML = validOptions.map(item => {
        const value = String(item).trim();
        return `<option value="${value}">`; 
    }).join('');

    datalistElement.innerHTML = optionsHTML;
}

function infiltrateTeacherCountrySelector() {
    const countries = getAllTeachersCountries();

    const countryDatalist = document.querySelector('#country-list');
    if (countryDatalist) populateDatalistDOM(countryDatalist, countries);
}

export function closeAddTeacherPopup() {
    const popup = document.querySelector('#addPopup');

    clearAddTeacherForm();
    popup.classList.add('hidden');
}

export function clearAddTeacherForm() {
    const form = document.querySelector('.add-teacher-container');
    if (form) {
        form.reset();
    }
}

export function handleAddTeacher() {
    const full_name = document.querySelector('.full-name-selector input')?.value;
    const course = document.querySelector('.specialty-selector input')?.value; 
    const country = document.querySelector('.country-selector input')?.value;
    const city = document.querySelector('.city-selector input')?.value;
    const email = document.querySelector('.email-selector input')?.value;
    const phone = document.querySelector('.phone-selector input')?.value;
    const dateOfBirth = document.querySelector('.date-of-birth-selector input')?.value;
    const gender = document.querySelector('.gender-selector input[name="sex"]:checked')?.value;
    const color = document.querySelector('.background-selector input')?.value;
    const notes = document.querySelector('.notes-selector textarea')?.value;

    const user = {
        gender: gender, 
        title: gender === 'male' ? 'Mr' : 'Mrs',  
        full_name: full_name, 
        city: city, 
        state: null, 
        country: country, 
        postcode: null, 
        coordinates: null, 
        timezone: null, 
        email: email, 
        b_date: dateOfBirth,  
        age: calculateAge(dateOfBirth), 
        phone: phone, 
        picture_large: null,
        picture_thumbnail: null, 

        id: generateUUID(),
        favorite: false, 
        course: course,
        bg_color: color, 
        note: notes === null ? 'Hi! My name is ' + full_name : notes
    }

    clearErrors();
    const errors = validateUserObject(user);
    
    if (errors.length > 0) {
        displayErrors(errors);
        return; 
    }

    return user;
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelectorAll('.error-input').forEach(el => el.classList.remove('error-input'));
}

function displayErrors(errors) {
    const fieldMap = {
        'full_name': '.full-name-selector',
        'city': '.city-selector',
        'country': '.country-selector',
        'course': '.specialty-selector', 
        'gender': '.gender-selector',
        'note': '.notes-selector',
        'age': '.date-of-birth-selector', 
        'phone': '.phone-selector',
        'email': '.email-selector'
    };

    errors.forEach(error => {
        const containerSelector = fieldMap[error.field];
        if (!containerSelector) return;

        const container = document.querySelector(containerSelector);
        if (!container) return;

        const input = container.querySelector('input, select, textarea');
        if (input) {
            input.classList.add('error-input');
        }

        const errorText = document.createElement('span');
        errorText.className = 'error-message';
        errorText.innerText = error.problem;
        
        container.appendChild(errorText);
    });
}
