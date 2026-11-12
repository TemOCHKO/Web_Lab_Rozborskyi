export function getDaysUntilNextBirthday(birthDate) {
    if (!birthDate) { 
        return null;
    }
    const dob = dayjs(birthDate);
    if (!dob.isValid()) {
        return null;
    }
    const today = dayjs().startOf('day');

    let nextBirthday = today.month(dob.month()).date(dob.date());

    if (nextBirthday.isSame(today, 'day')) {
        return 0;
    }

    if (nextBirthday.isBefore(today, 'day')) {
        nextBirthday = nextBirthday.add(1, 'year');
    }

    return nextBirthday.diff(today, 'day');
}