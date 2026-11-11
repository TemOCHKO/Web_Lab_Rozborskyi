import { renderTeachers } from '../views/TeachersView.js';
import { getTeacherById, getTeachers, getTeachersWithFilters, addTeacher, initTeachers, setMoreTeachersBy } from '../models/teacherRepository.js';
import { renderPopup, closePopup, renderAddTeacherPopup, closeAddTeacherPopup, handleAddTeacher, toggleTeacherMap, destroyMap } from '../views/PopupView.js';
import { getFilters, clearFilters } from '../views/filterView.js';
import { paginate } from '../views/StatisticsView.js';
import { searchUsers } from '../models/TeacherService.js'

let currentTeacher = null;
document.addEventListener('DOMContentLoaded', async () => {

    await initTeachers();

    renderTeachers(getTeachers());
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

    const searchButton = document.querySelector('.search-button');
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const searchInput = document.querySelector('.site-search');
            if (searchInput) {
                if (searchInput.value === '' || searchInput.value.trim() === '') renderTeachers(getTeachers());
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
                if (searchInput.value === '' || searchInput.value.trim() === '') renderTeachers(getTeachers());
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
    // event delegation 
    document.addEventListener('click', (event) => {
        const target = event.target;

        // open add teacher popup
        if (target.closest('.add-teacher-button')) {
            renderAddTeacherPopup();
            return;
        }

        // open info popup
        const teacherCard = target.closest('.teacher-card');
        if (teacherCard && target.closest('.teacher-showcase')) {
            const userId = teacherCard.dataset.userId;
            currentTeacher = getTeacherById(userId);
            renderPopup('infoPopup', currentTeacher);
            return;
        }

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
    });

    // form
    document.addEventListener('submit', (event) => {
        const addTeacherForm = event.target.closest('.add-teacher-container');
        
        if (addTeacherForm) {
            event.preventDefault(); 
            
            const validUser = handleAddTeacher(); 
            
            if (validUser) {
                addTeacher(validUser);
                renderTeachers(getTeachers());
                paginate(getTeachers());
                closeAddTeacherPopup();
            }
        }
    });

    function handleModalClose() {
        destroyMap();
        currentTeacher = null;
        const needsReRender = closePopup('infoPopup');
        if (needsReRender) {
            let teachs = getTeachersWithFilters(getFilters());
            renderTeachers(teachs);
            paginate(teachs);
        }
    }
});