let currentStartIndex = 0;

function getItemsPerPage() {
    const width = window.innerWidth;
    if (width <= 540) return 1;  
    if (width <= 650) return 2;  
    if (width <= 768) return 3; 
    if (width <= 1024) return 4;
    return 5;                   
}

export function renderFavorites(allTeachers) {
    const showcase = document.querySelector('.favorites-showcase');
    const prevBtn = document.querySelector('.prev-fav');
    const nextBtn = document.querySelector('.next-fav');

    if (!showcase) return;

    const itemsPerPage = getItemsPerPage();
    const favoriteTeachers = _.filter(allTeachers, { favorite: true });

    const maxStartIndex = Math.max(0, favoriteTeachers.length - itemsPerPage);
    if (currentStartIndex > maxStartIndex) {
        currentStartIndex = maxStartIndex;
    }

    const visibleTeachers = _.slice(
        favoriteTeachers,
        currentStartIndex,
        currentStartIndex + itemsPerPage
    );

    if (_.isEmpty(favoriteTeachers)) {
        showcase.innerHTML = '<p class="empty-favorites">No favorite teachers yet</p>';
    } else {
        showcase.innerHTML = _.map(visibleTeachers, (teacher) => {
            const [firstName, ...lastNameParts] = _.split(teacher.full_name, ' ');
            const lastName = lastNameParts.join(' ');
            const imgSrc = teacher.picture_large || './default.jpg';

            return `
                <div class="teacher-card" data-user-id="${teacher.id}">
                    <div class="pfp-container" style="border: 3px solid ${teacher.bg_color ?? '#f25b50'}">
                        <img src="${imgSrc}" alt="${teacher.full_name}" class="avatar">
                    </div>
                    <div class="teacher-name">${firstName}<br>${lastName}</div>
                    <div class="teacher-country">${teacher.country || ''}</div>
                </div>
            `;
        }).join('');
    }

    if (prevBtn) {
        prevBtn.disabled = currentStartIndex === 0;
    }
    if (nextBtn) {
        nextBtn.disabled = currentStartIndex >= maxStartIndex;
    }
}

export function shiftFavoritesPage(direction, allTeachers) {
    const itemsPerPage = getItemsPerPage();
    const favoriteTeachers = _.filter(allTeachers, { favorite: true });
    const maxStartIndex = Math.max(0, favoriteTeachers.length - itemsPerPage);

    const step = 1;
    const nextIndex = _.clamp(currentStartIndex + direction * step, 0, maxStartIndex);

    if (nextIndex !== currentStartIndex) {
        currentStartIndex = nextIndex;
        renderFavorites(allTeachers);
    }
}