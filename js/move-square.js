let squares = document.querySelectorAll('.game__square');
let gameArea = document.querySelector('.game__area');
let ungroupButton = document.querySelector('.game__settings-button');
let selectedSquare = null;
let SNAP_DISTANCE = 0; // Расстояние для прилипания
let isSnapped = false; // Флаг, прилип ли кубик

// Функция выбора кубика
squares.forEach(square => {
    square.addEventListener('click', function (event) {
        event.stopPropagation();

        if (selectedSquare) {
            selectedSquare.style.borderStyle = 'solid';
        }
        selectedSquare = square;
        selectedSquare.style.borderStyle = 'dashed';
    });
});

// Функция для перемещения кубиков
squares.forEach(square => {
    let isDragging = false;
    let offsetX, offsetY;

    square.addEventListener('mousedown', function (event) {

        isDragging = true;

        offsetX = event.clientX - square.getBoundingClientRect().left;
        offsetY = event.clientY - square.getBoundingClientRect().top;

        square.style.transition = 'none';

        document.addEventListener('mousemove', function (event) {
            if (!isDragging || isSnapped) return;
    
            let gameAreaRect = gameArea.getBoundingClientRect();
            let newLeft = event.clientX - offsetX - gameAreaRect.left;
            let newTop = event.clientY - offsetY - gameAreaRect.top;

            newLeft = Math.max(0, Math.min(newLeft, gameAreaRect.width - square.offsetWidth - 4));
            newTop = Math.max(0, Math.min(newTop, gameAreaRect.height - square.offsetHeight - 4));
    
            square.style.left = `${newLeft}px`;
            square.style.top = `${newTop}px`;
    
            checkSnap(square);
        });
    });


    document.addEventListener('mouseup', function () {
        if (isDragging) {
            isDragging = false;
            square.style.transition = 'all 0.2s ease-in-out';
        }
    });
});


// function checkSnap(movingSquare) {
//     let snappedSquares = [];
//     squares.forEach(targetSquare => {
//         if (targetSquare === movingSquare) return;

//         let movingRect = movingSquare.getBoundingClientRect();
//         let targetRect = targetSquare.getBoundingClientRect();

//         if (
//             Math.abs(movingRect.right - targetRect.left) <= SNAP_DISTANCE &&
//             movingRect.bottom > targetRect.top &&
//             movingRect.top < targetRect.bottom
//         ) {
//             snappedSquares.push({ square: movingSquare, direction: 'horizontal-right' });
//             snappedSquares.push({ square: targetSquare, direction: 'horizontal-left' });
//         } else if (
//             Math.abs(movingRect.left - targetRect.right) <= SNAP_DISTANCE &&
//             movingRect.bottom > targetRect.top &&
//             movingRect.top < targetRect.bottom
//         ) {
//             snappedSquares.push({ square: movingSquare, direction: 'horizontal-left' });
//             snappedSquares.push({ square: targetSquare, direction: 'horizontal-right' });
//         } else if (
//             Math.abs(movingRect.bottom - targetRect.top) <= SNAP_DISTANCE &&
//             movingRect.right > targetRect.left &&
//             movingRect.left < targetRect.right
//         ) {
//             snappedSquares.push({ square: movingSquare, direction: 'vertical-down' });
//             snappedSquares.push({ square: targetSquare, direction: 'vertical-up' });
//         } else if (
//             Math.abs(movingRect.top - targetRect.bottom) <= SNAP_DISTANCE &&
//             movingRect.right > targetRect.left &&
//             movingRect.left < targetRect.right
//         ) {
//             snappedSquares.push({ square: movingSquare, direction: 'vertical-up' });
//             snappedSquares.push({ square: targetSquare, direction: 'vertical-down'  });
//         }
//     });

//     if (snappedSquares.length > 1) {
//         let minLeft = Math.min(...snappedSquares.map(item => item.square.getBoundingClientRect().left));
//         let maxRight = Math.max(...snappedSquares.map(item => item.square.getBoundingClientRect().right));
//         let minTop = Math.min(...snappedSquares.map(item => item.square.getBoundingClientRect().top));
//         let maxBottom = Math.max(...snappedSquares.map(item => item.square.getBoundingClientRect().bottom));

//         let gameAreaRect = gameArea.getBoundingClientRect();
//         let groupLeft = minLeft - gameAreaRect.left;
//         let groupTop = minTop - gameAreaRect.top;
//         let groupWidth = maxRight - minLeft;
//         let groupHeight = maxBottom - minTop;

//         let group = document.createElement('div');
//         group.classList.add('game__group');
//         group.style.position = 'absolute';
//         group.style.left = `${groupLeft}px`;
//         group.style.top = `${groupTop}px`;
//         group.style.width = `${groupWidth}px`;
//         group.style.height = `${groupHeight}px`;

//         let groupWrapper = document.createElement('div');
//         groupWrapper.classList.add('game__group-wrapper');
//         group.appendChild(groupWrapper);
//         gameArea.appendChild(group);

//         snappedSquares.forEach(({ square, direction }) => {
//             let squareRect = square.getBoundingClientRect();
//             let relativeLeft = squareRect.left - minLeft;
//             let relativeTop = squareRect.top - minTop;

//             square.style.position = 'absolute';
//             square.style.left = `${relativeLeft}px`;
//             square.style.top = `${relativeTop}px`;

//             // Сохраняем направление прилипания как data-атрибут
//             square.dataset.snapDirection = direction;

//             groupWrapper.appendChild(square);
//         });

//         isSnapped = true;
//         makeGroupDraggable(group);
//         ungroupButton.classList.add('game__settings-button--active');
//     }
// }

function checkSnap(movingSquare) {
    let snappedSquares = [];
    let movingRect = movingSquare.getBoundingClientRect();

    squares.forEach(targetSquare => {
        if (targetSquare === movingSquare) return;

        let targetRect = targetSquare.getBoundingClientRect();

        // Проверка направления прилипания
        const directions = [
            { direction: 'horizontal-right', condition: () => Math.abs(movingRect.right - targetRect.left) <= SNAP_DISTANCE && isOverlapping(movingRect, targetRect, 'vertical') },
            { direction: 'horizontal-left', condition: () => Math.abs(movingRect.left - targetRect.right) <= SNAP_DISTANCE && isOverlapping(movingRect, targetRect, 'vertical') },
            { direction: 'vertical-down', condition: () => Math.abs(movingRect.bottom - targetRect.top) <= SNAP_DISTANCE && isOverlapping(movingRect, targetRect, 'horizontal') },
            { direction: 'vertical-up', condition: () => Math.abs(movingRect.top - targetRect.bottom) <= SNAP_DISTANCE && isOverlapping(movingRect, targetRect, 'horizontal') }
        ];

        directions.forEach(({ direction, condition }) => {
            if (condition()) {
                snappedSquares.push({ square: movingSquare, direction });
                snappedSquares.push({ square: targetSquare, direction: getOppositeDirection(direction) });
            }
        });
    });

    if (snappedSquares.length > 1) {
        createGroup(snappedSquares);
    }
}

// Функция для проверки пересечения по горизонтали или вертикали
function isOverlapping(rect1, rect2, axis) {
    if (axis === 'horizontal') {
        return rect1.right > rect2.left && rect1.left < rect2.right;
    } else if (axis === 'vertical') {
        return rect1.bottom > rect2.top && rect1.top < rect2.bottom;
    }
    return false;
}

// Получить противоположное направление
function getOppositeDirection(direction) {
    const opposites = {
        'horizontal-right': 'horizontal-left',
        'horizontal-left': 'horizontal-right',
        'vertical-down': 'vertical-up',
        'vertical-up': 'vertical-down'
    };
    return opposites[direction];
}

// Создание группы из прилипающих кубиков
function createGroup(snappedSquares) {
    let minLeft = Math.min(...snappedSquares.map(item => item.square.getBoundingClientRect().left));
    let maxRight = Math.max(...snappedSquares.map(item => item.square.getBoundingClientRect().right));
    let minTop = Math.min(...snappedSquares.map(item => item.square.getBoundingClientRect().top));
    let maxBottom = Math.max(...snappedSquares.map(item => item.square.getBoundingClientRect().bottom));

    let gameAreaRect = gameArea.getBoundingClientRect();
    let groupLeft = minLeft - gameAreaRect.left;
    let groupTop = minTop - gameAreaRect.top;
    let groupWidth = maxRight - minLeft;
    let groupHeight = maxBottom - minTop;

    let group = document.createElement('div');
    group.classList.add('game__group');
    group.style.position = 'absolute';
    group.style.left = `${groupLeft}px`;
    group.style.top = `${groupTop}px`;
    group.style.width = `${groupWidth}px`;
    group.style.height = `${groupHeight}px`;

    let groupWrapper = document.createElement('div');
    groupWrapper.classList.add('game__group-wrapper');
    group.appendChild(groupWrapper);
    gameArea.appendChild(group);

    snappedSquares.forEach(({ square, direction }) => {
        let squareRect = square.getBoundingClientRect();
        let relativeLeft = squareRect.left - minLeft;
        let relativeTop = squareRect.top - minTop;

        square.style.position = 'absolute';
        square.style.left = `${relativeLeft}px`;
        square.style.top = `${relativeTop}px`;

        // Сохраняем направление прилипания как data-атрибут
        square.dataset.snapDirection = direction;

        groupWrapper.appendChild(square);
    });

    isSnapped = true;
    makeGroupDraggable(group);
    ungroupButton.classList.add('game__settings-button--active');
}


function makeGroupDraggable(group) {
    let isDraggingGroup = false;
    let groupOffsetX, groupOffsetY;

    group.addEventListener('mousedown', function (event) {
        if (!event.target.classList.contains('game__square')) return;

        isDraggingGroup = true;

        let groupRect = group.getBoundingClientRect();
        groupOffsetX = event.clientX - groupRect.left;
        groupOffsetY = event.clientY - groupRect.top;

        group.style.transition = 'none';
    });

    document.addEventListener('mousemove', function (event) {
        if (!isDraggingGroup) return;

        let gameAreaRect = gameArea.getBoundingClientRect();
        let newLeft = event.clientX - groupOffsetX - gameAreaRect.left;
        let newTop = event.clientY - groupOffsetY - gameAreaRect.top;

        newLeft = Math.max(0, Math.min(newLeft, gameAreaRect.width - group.offsetWidth - 4));
        newTop = Math.max(0, Math.min(newTop, gameAreaRect.height - group.offsetHeight - 4));

        group.style.left = `${newLeft}px`;
        group.style.top = `${newTop}px`;
    });

    document.addEventListener('mouseup', function () {
        if (isDraggingGroup) {
            isDraggingGroup = false;
            group.style.transition = 'all 0.2s ease-in-out';
        }
    });
}




ungroupButton.addEventListener('click', function () {
    let group = document.querySelector('.game__group');
    const SEPARATION_DISTANCE = 20; // Расстояние для разъединения
    const ANIMATION_DURATION = 300; // Длительность анимации в миллисекундах

    let squares = Array.from(group.querySelectorAll('.game__square'));

    squares.forEach(square => {
        let squareRect = square.getBoundingClientRect();
        let gameAreaRect = gameArea.getBoundingClientRect();

        let currentLeft = squareRect.left - gameAreaRect.left;
        let currentTop = squareRect.top - gameAreaRect.top;

        square.style.left = `${currentLeft}px`;
        square.style.top = `${currentTop}px`;

        let snapDirection = square.dataset.snapDirection;
        requestAnimationFrame(() => {
            let newLeft = currentLeft;
            let newTop = currentTop;

            if (snapDirection === 'horizontal-right') newLeft -= SEPARATION_DISTANCE;
            if (snapDirection === 'horizontal-left') newLeft += SEPARATION_DISTANCE;
            if (snapDirection === 'vertical-down') newTop -= SEPARATION_DISTANCE;
            if (snapDirection === 'vertical-up') newTop += SEPARATION_DISTANCE;

            newLeft = Math.max(0, Math.min(newLeft, gameAreaRect.width - square.offsetWidth-4));
            newTop = Math.max(0, Math.min(newTop, gameAreaRect.height - square.offsetHeight-4));

            square.style.transition = `all ${ANIMATION_DURATION}ms ease`;
            square.style.left = `${newLeft}px`;
            square.style.top = `${newTop}px`;

            setTimeout(() => {
                square.style.transition = 'none';
            }, ANIMATION_DURATION);
        });

        gameArea.appendChild(square);
    });

    group.remove();
    isSnapped = false;
    ungroupButton.classList.remove('game__settings-button--active');
});

// Сбрасываем выбор кубика при клике вне кубика
document.addEventListener('click', function () {
    if (selectedSquare) {
        selectedSquare.style.borderStyle = 'solid';
        selectedSquare = null;
    }
});


