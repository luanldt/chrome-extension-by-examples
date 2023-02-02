const article = document.querySelector('#bodyContent')

if (article) {
    // get text content in article
    const text = article.textContent

    // get words
    const wordMatchRegExp = /[^\s]+/g
    const words = text.matchAll(wordMatchRegExp) // words is instance of iterator

    // count words & calculate reading time
    const countWords = [...words].length 

    // readingTimeInMinutes = countWords / (200 or 250) => 200 or 250 is the speed of human read in a minutes
    const readTimeInMinutes = Math.round(countWords / 250)

    // build a badge to show reading time in page
    const badge = document.createElement('small')
    badge.textContent = `⏱ ${readTimeInMinutes} min read`

    const langButton = document.querySelector('#p-lang-btn')
    langButton.insertAdjacentElement('beforebegin', badge)
}