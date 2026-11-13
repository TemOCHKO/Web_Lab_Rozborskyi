export function renderTeachers(users) {
    clearSearchBar();
    if (users === null || users === undefined) return;
    const teacherShowcaseElement = document.querySelector('.teacher-showcase')
    teacherShowcaseElement.innerHTML = "";

    var fragment = document.createDocumentFragment();
    for (let user of users) {
        const cardElem = document.createElement('div');
        cardElem.className = 'teacher-card';

        cardElem.dataset.userId = user.id;

        const pfpContainerElem = document.createElement('div');
        pfpContainerElem.className = 'pfp-container';
        if (user.bg_color !== null && user.bg_color !== undefined) {
            pfpContainerElem.style.border = '3px solid ' + user.bg_color;
        }
        const imgElem = document.createElement('img');
        imgElem.className = 'avatar';

        pfpContainerElem.appendChild(imgElem);

        let picture = user.picture_large == null ? './default.jpg' : user.picture_large;
        imgElem.setAttribute('src', picture);
        imgElem.setAttribute('alt', user.full_name.split(' ')[0]);

        const nameDiv = document.createElement('div');
        nameDiv.classList.add('teacher-name');
        const [first_name, last_name] = user.full_name.split(' ');
        nameDiv.innerHTML = first_name + '<br>' + last_name;

        const subjectDiv = document.createElement('div');
        subjectDiv.classList.add('teacher-subject');
        subjectDiv.textContent = user.course ? user.course : 'N/A';
        
        const countryDiv = document.createElement('div');
        countryDiv.classList.add('teacher-country');
        countryDiv.textContent = user.country;

        cardElem.appendChild(pfpContainerElem);
        if (user.favorite) {
            const starContainer = document.createElement('span');
            starContainer.textContent = '★';
            starContainer.classList.add('star');
            cardElem.appendChild(starContainer);
        }
        cardElem.appendChild(nameDiv);
        cardElem.appendChild(subjectDiv);
        cardElem.appendChild(countryDiv);

        fragment.appendChild(cardElem);
    }

    teacherShowcaseElement.appendChild(fragment);
}

function clearSearchBar() {
    document.querySelector('.site-search').value = '';
}