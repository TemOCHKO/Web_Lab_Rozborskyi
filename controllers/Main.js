import { renderTeachers } from '../views/TeachersView.js';
import { getTeacherById, getTeachers, getTeachersWithFilters, addTeacher, initTeachers, setMoreTeachersBy, getFavoriteTeachers } from '../models/teacherRepository.js';
import { renderPopup, closePopup, renderAddTeacherPopup, closeAddTeacherPopup, handleAddTeacher, toggleTeacherMap, destroyMap } from '../views/PopupView.js';
import { getFilters, clearFilters } from '../views/filterView.js';
import { paginate, toggleStatsMethod } from '../views/StatisticsView.js';
import { searchUsers } from '../models/TeacherService.js'
import { renderFavorites, shiftFavoritesPage } from '../views/FavoritesView.js';
import { saveTeacherToApi } from '../network/TeacherNetworkService.js';

let currentTeacher = null;
document.addEventListener('DOMContentLoaded', async () => {

    await initTeachers();

    renderTeachers(getTeachers());
    renderFavorites(getFavoriteTeachers());
    paginate(getTeachers());

    // Static Listeners 
    const filtersContainer = document.querySelector('.search-filters');
    if (filtersContainer) {
        filtersContainer.addEventListener('change', () => {
            let teachs = getTeachersWithFilters(getFilters());
            renderTeachers(teachs);
            paginate(teachs);
        });
    }

    const toggleStatsContainer = document.querySelector('.toggle-statistics');
    if (toggleStatsContainer) {
        toggleStatsContainer.addEventListener('click', () => {
            toggleStatsMethod();
            paginate(getTeachersWithFilters(getFilters()));
        });
    }

    const chartMethodContainer = document.querySelector('.choice-group');
    if (chartMethodContainer) {
        chartMethodContainer.addEventListener('change', () => {
            paginate(getTeachersWithFilters(getFilters()));
        });
    }

    const searchButton = document.querySelector('.search-button');
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const searchInput = document.querySelector('.site-search');
            if (searchInput) {
                if (searchInput.value === '' || searchInput.value.trim() === '') {
                    renderTeachers(getTeachers());
                    paginate(getTeachers());
                }
                else {
                    let teachs = searchUsers(getTeachersWithFilters(getFilters()), searchInput.value);
                    renderTeachers(teachs);
                    paginate(teachs);
                }
            }
        }); 
    }

    const searchInput = document.querySelector('.site-search');
    if (searchInput) {
        searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                if (searchInput.value === '' || searchInput.value.trim() === '') {
                    renderTeachers(getTeachers());
                    paginate(getTeachers());
                }
                else {
                    let teachs = searchUsers(getTeachersWithFilters(getFilters()), searchInput.value);
                    console.log(teachs);
                    renderTeachers(teachs);
                    paginate(teachs);
                }
            }
        });
    }

    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        let isLoading = false;

        loadMoreBtn.addEventListener('click', async () => {
            if (isLoading) return;
            isLoading = true;
            loadMoreBtn.disabled = true;

            try {
                await setMoreTeachersBy(10);

                clearFilters({ silent: true });

                const teachs = getTeachers();
                renderTeachers(teachs);
                paginate(teachs);
            } catch (error) {
                console.error('Failed to load additional teachers:', error.message);
            } finally {
                isLoading = false;
                loadMoreBtn.disabled = false;
            }
        });
    }

    let lastItemsPerPage = null;

    window.addEventListener('resize', _.debounce(() => {
        renderFavorites(getTeachers());
    }, 150));

    // event delegation 
    document.addEventListener('click', (event) => {
        const target = event.target;

        // open add teacher popup
        if (target.closest('.add-teacher-button')) {
            renderAddTeacherPopup();
            return;
        }

        // open info popup
        /*
        const teacherCard = target.closest('.teacher-card');
        if (teacherCard && target.closest('.teacher-showcase')) {
            const userId = teacherCard.dataset.userId;
            currentTeacher = getTeacherById(userId);
            renderPopup('infoPopup', currentTeacher);
            return;
        }
        */

        // close info popup 
        if (target.closest('.popup-close') && !target.closest('.add-pop')) {
            handleModalClose();
            return;
        }

        // close add teacher popup 
        if (target.closest('.add-pop')) {
            closeAddTeacherPopup();
            return;
        }

        // close popups on background click
        
        /*
        const infoPopupOverlay = document.getElementById('infoPopup');
        if (target === infoPopupOverlay) {
            handleModalClose();
            return;
        }
        */

        const addPopupOverlay = document.getElementById('addPopup');
        if (target === addPopupOverlay) {
            closeAddTeacherPopup();
            return;
        }

        // turn on favorite stas
        const popupStar = target.closest('.popup-star');
        if (popupStar) {
            const isTurnedOn = (popupStar.dataset.isFavorite === 'true');
            const shouldBe = !isTurnedOn;
            popupStar.dataset.isFavorite = shouldBe;
            popupStar.textContent = shouldBe ? '★' : '☆';
            return;
        }

        if (target.classList.contains('toggle-map')) {
            event.preventDefault();
            if (currentTeacher) {
                toggleTeacherMap(currentTeacher.coordinates);
            }
            return;
        }

        if (target.closest('.prev-fav')) {
            shiftFavoritesPage(-1, getTeachers());
            return;
        }
        if (target.closest('.next-fav')) {
            shiftFavoritesPage(1, getTeachers());
            return;
        }

        const teacherCard = target.closest('.teacher-card');
        if (teacherCard && (target.closest('.teacher-showcase') || target.closest('.favorites-showcase'))) {
            const userId = teacherCard.dataset.userId;
            currentTeacher = getTeacherById(userId);
            renderPopup('infoPopup', currentTeacher);
            return;
        }
    });

    // form
    document.addEventListener('submit', async (event) => {
        const addTeacherForm = event.target.closest('.add-teacher-container');
        
        if (addTeacherForm) {
            event.preventDefault(); 
        
        const validUser = handleAddTeacher(); 
        console.log(validUser);
        
        if (validUser) {
            try {
                //await saveTeacherToApi(validUser);
                
                addTeacher(validUser);
                renderTeachers(getTeachersWithFilters(getFilters()));
                paginate(getTeachersWithFilters(getFilters()));
                closeAddTeacherPopup();
            } catch (error) {
                console.error('Не вдалося зберегти викладача на сервері:', error.message);
            }
        }
        }
    });

    function handleModalClose() {
        destroyMap();
        currentTeacher = null;

        const needsReRender = closePopup('infoPopup');
        if (needsReRender) {
            const teachs = getTeachersWithFilters(getFilters());
            renderTeachers(teachs);
            renderFavorites(getTeachers());
            paginate(teachs);
        }
    }
});