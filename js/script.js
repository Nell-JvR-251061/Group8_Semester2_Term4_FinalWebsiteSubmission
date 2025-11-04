// <------------------------------------Wihan's code-------------------------------------->
document.addEventListener("DOMContentLoaded", () => {
    const baseRow = document.querySelector(".base-row");
    const allRows = document.querySelectorAll(".poster-row:not(.base-row)");

    if (!baseRow) return;

    const posters = Array.from(baseRow.querySelectorAll("img")).map(img => img.src);

    function shuffle(array) {
        return array
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
    }

    allRows.forEach(row => {
        const shuffled = shuffle(posters);
        row.innerHTML = shuffled.map(src => `<img src="${src}" alt="">`).join("");
    });
});