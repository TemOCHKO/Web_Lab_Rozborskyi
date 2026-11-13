import { sortUsers, getStatisticsForChart } from '../models/TeacherService.js';
import { getAllTeachersSpecialties } from '../models/teacherRepository.js';

const ARROW_ICONS = {
  'none': ' ↕',
  'asc': ' ↑',
  'desc': ' ↓'
};

export function setupTableSorting(onSortChange) {
    const thead = document.querySelector('.statistics thead');

    if (thead) {
        thead.addEventListener('click', (event) => {
           
            const th = event.target.closest('th[data-sort-key]');

            const currentOrder = th.dataset.sortOrder || 'none';
            let nextOrder;
            if (currentOrder === 'none')
                nextOrder = 'asc';
            else if (currentOrder === 'asc') 
                nextOrder = 'desc';
            else 
                nextOrder = 'none';
            
            document.querySelectorAll('.statistics th[data-sort-key]').forEach(header => {
            if (header !== th) {
                header.dataset.sortOrder = 'none';
                const arrowSpan = header.querySelector('.sort-arrow');
                if (arrowSpan) arrowSpan.textContent = ' ↕';
            }
            });

            th.dataset.sortOrder = nextOrder;
            const arrowSpan = th.querySelector('.sort-arrow');
                if (arrowSpan) {
                arrowSpan.textContent = ARROW_ICONS[nextOrder];
            }

            const sortConfig = nextOrder === 'none' 
                ? null 
                : { key: th.dataset.sortKey, order: nextOrder };
            onSortChange(sortConfig);
            
        });
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A'; 
    return date.toLocaleDateString('en-US', { year: 'numeric',month: 'short', day: 'numeric'});
}

const statsMethodDefault = true;
const paginate = (teachers) => {

    if (statsMethodDefault) {
        const defStats = document.querySelector('.default-stats');
        defStats?.classList.remove('hidden');

        const customStats = document.querySelector('.chart-stats');
        customStats?.classList.add('hidden');

        let teacherCount = 10;
        let currentPage = 1;

        let activeTeachers = [...teachers];

        const container = document.querySelector('.statistics tbody');
        const pagination = document.querySelector('.pagination');

        const renderTeachers = (arr, teacherContainer, teachersOnPageLength, currentPage) => {
            teacherContainer.innerHTML = '';

            const firstTeacherIndex = teachersOnPageLength * currentPage - teachersOnPageLength;
            const lastTeacherIndex = firstTeacherIndex + teachersOnPageLength;
            const teachersOnPage = arr.slice(firstTeacherIndex, lastTeacherIndex);

            teachersOnPage.forEach(({full_name, course, age, b_date, country}) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${full_name ? full_name : 'N/A'}</td>
                    <td>${course ?? 'N/A'}</td>
                    <td>${age ?? 'N/A'}</td>
                    <td>${formatDate(b_date)}</td>
                    <td>${country ?? 'N/A'}</td>
                `;

                teacherContainer.append(tr);
            });
        };
    
        const renderPagination = (teachersLength, teachersOnPageLength, pageNum) => {
            const pagesCount = Math.ceil(teachersLength / teachersOnPageLength);
            pagination.innerHTML = '';

            const current = Number(pageNum);
            switch (current) {
                case 1:
                    for (let i = 1; i <= Math.min(3, pagesCount); i++) {
                        pagination.append(renderPageNum(i));
                    }
                    if (pagesCount > 3) {
                        pagination.append(renderDots());
                        pagination.append(renderPageNum('Last'));
                    }
                    break;
                case pagesCount:
                    pagination.append(renderPageNum('First'));
                    pagination.append(renderDots());
                    for (let i = current - 1; i <= current; i++) {
                        const a = renderPageNum(i);
                        pagination.append(a);
                    }
                    break;
                default:
                    if (current != 2) {
                        pagination.append(renderPageNum('First'));
                        pagination.append(renderDots());
                    }
                    for (let i = current - 1; i <= current + 1; i++) {
                        pagination.append(renderPageNum(i));
                    }

                    if (current + 1 < pagesCount) {
                        pagination.append(renderDots());
                        pagination.append(renderPageNum('Last'));
                    }
                    break;
            }
        };

        const renderPageNum = (pageNum) => {
            const a = document.createElement('a');
            a.textContent = pageNum;


            if (Number(currentPage) === Number(pageNum)) a.classList.add('active');
            return a;
        };

        const renderDots = () => {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.classList.add('dots');
            return dots;
        };

        const updatePagination = () => {
            pagination.addEventListener('click', (event) => {
                const targetA = event.target.closest('a');
                if (!targetA) return;

                const pageValue = targetA.textContent;
                const pagesCount = Math.ceil(activeTeachers.length / teacherCount);

                if (pageValue === 'First') {
                    currentPage = 1;
                } else if (pageValue === 'Last') {
                    currentPage = pagesCount;
                } else {
                    currentPage = Number(pageValue);
                }

                renderTeachers(activeTeachers, container, teacherCount, currentPage);
                renderPagination(activeTeachers.length, teacherCount, currentPage);
            });
        };

        setupTableSorting((sortConfig) => {
            if (!sortConfig) {
                activeTeachers = [...teachers];
            } else {
                let { key, order } = sortConfig;
                key === 'nationality' ? key = 'country' : key;
                key === 'specialty' ? key = 'course' : key;
                key === 'birth date' ? key = 'b_day' : key;
                activeTeachers = sortUsers(teachers, key, order);
            }

            currentPage = 1;
            renderTeachers(activeTeachers, container, teacherCount, currentPage);
            renderPagination(activeTeachers.length, teacherCount, currentPage);
        });

        renderTeachers(activeTeachers, container, teacherCount, currentPage);
        renderPagination(activeTeachers.length, teacherCount, currentPage);
        updatePagination();
    } else {
        const defStats = document.querySelector('.default-stats');
        defStats?.classList.add('hidden');

        renderTeachersChart(teachers);

        const customStats = document.querySelector('.chart-stats');
        customStats?.classList.remove('hidden');
    }
}

let currentChart = null;
function renderTeachersChart(teachers) {
    const canvas = document.getElementById('teachersPieChart');
    if (!canvas) return;

    const selectedValue = document.querySelector('input[name="chart-method"]:checked')?.value;
    console.log(selectedValue); 


    var text;
    var labelsData = {}; 
    switch (selectedValue) {
        case 'By Course':
            labelsData = getStatisticsForChart(teachers, 'course');
            break;
        case 'By Age':
            labelsData = getStatisticsForChart(teachers, 'age');
            break;
        case 'By Country':
            labelsData = getStatisticsForChart(teachers, 'country');
            break;
        default: 
            console.log('ejojed');
            break;
    }

    //const { labels, data } = getSpecialtyStatistics(teachers);

    if (currentChart) {
        console.log('dstr');
        currentChart.destroy();
        currentChart = null;
    }

    console.log(labelsData.labels);
    console.log(labelsData.data);

    currentChart = new Chart(canvas, {
        type: 'pie',
        data: {
            labels: labelsData.labels,
            datasets: [{
                label: 'Teacher Count',
                data: labelsData.data,
                backgroundColor: [
                    '#fe7996',
                    '#5fb8f4',
                    '#f3bd37',
                    '#598484',
                    '#4d2c8f',
                    '#b75f07'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Grouping teachers ' + selectedValue
                }
            }
        }
    });
}



export {
    paginate
};