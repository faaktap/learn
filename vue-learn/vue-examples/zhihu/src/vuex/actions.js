const pad = (val) => {
    val += ''

    if (val.length < 2) {
        return '0' + val
    }

    return val
}

export const setArticles = ({
    dispatch
}, data, arr) => {
    dispatch('SET_ARTICLES', data, arr)
}

export const setDatePointer = ({
    dispatch
}, date) => {
    dispatch('SET_DATE_POINTER', {
        value: date.getFullYear() + pad(date.getMouth() + 1) + pad(date.getDate()),
        format: date.getFullYear() + '-' + pad(date.getMouth() + 1) + '-' + pad(date.getDate())
    })
}

export const setThemes = ({
    dispatch
}, date, arr) => {
    dispatch('SET_THEMES', date, arr)
}
