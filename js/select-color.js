let firstSquare = document.getElementById('squaer1');
let secondSquare = document.getElementById('squaer2');
let colorsBlock = document.querySelector('.game__colors');
let text = document.querySelector('.game__settings-text');

let defaultText = 'Кликни на квадрат';
text.textContent = defaultText;
let currentSelectedSquare = null;

function resetSelection() {
    if (currentSelectedSquare != null) {
        currentSelectedSquare = null;
    }

    text.textContent = defaultText;

    document.querySelectorAll('.game__colors-item--active')
        .forEach(item => item.classList.remove('game__colors-item--active'));
}

function selectSquare(square) {
    square.addEventListener('click', function (event) {
        event.stopPropagation();
        resetSelection();

        document.querySelectorAll('.game__colors-item')
            .forEach(item => item.classList.add('game__colors-item--active'));

        text.textContent = `Выбери цвет:`;
        currentSelectedSquare = square;
    });
}

selectSquare(firstSquare);
selectSquare(secondSquare);

colorsBlock.addEventListener('click', function (event) {
    if (event.target.classList.contains('game__colors-item') && currentSelectedSquare) {
        currentSelectedSquare.setAttribute("data-color-item", event.target.dataset.colorItem);
    }
});

document.addEventListener('click', function () {
    resetSelection();
});
