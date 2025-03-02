import * as THREE from 'three';

let scene, camera, renderer, car, roadSegments = [], grassSegments = [];
let trees = [];
let carEyes = [];
let rocks = [];
let barriers = [];
let speed = 0.2;
let carSpeed = 0;
let carAcceleration = 0.02;
let maxSpeed = 2;
const roadWidth = 4;
let isPaused = false;
let selectedCar = "default"; // По умолчанию используется первая машина

export function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 6);  // Камера ближе к машине
    camera.lookAt(0, 1, 0);  // Смотрит чуть вниз
    camera.updateProjectionMatrix();
    const hemiLight = new THREE.HemisphereLight(0xaaaaaa, 0x444444, 0.6);
    scene.add(hemiLight);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const textureLoader = new THREE.TextureLoader();
    const roadTexture = textureLoader.load('road.jpg');
    roadTexture.wrapS = roadTexture.wrapT = THREE.RepeatWrapping;
    roadTexture.repeat.set(1, 10);

    const grassTexture = textureLoader.load('grass.jpg');
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(10, 10);
    
    const skyTexture = textureLoader.load('sky.jpg');
    scene.background = skyTexture;

    for (let i = 0; i < 10; i++) { // Увеличено с 5 до 10
        // Создание дороги
        const roadGeometry = new THREE.PlaneGeometry(10, 20);
        const roadMaterial = new THREE.MeshStandardMaterial({ map: roadTexture });
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        road.rotation.x = -Math.PI / 2;
        road.position.y = 0.01;
        road.position.z = -i * 20;
        road.receiveShadow = true;
        scene.add(road);
        roadSegments.push(road);
    }

    createCar();
    console.log("addTrees exists:", typeof addTrees);
    addTrees();
    addBarriers();
    
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('keydown', onPause);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    addRocks();
    createGround();
    animate();
    showControls();
    showGameMenu();
}

function addBarriers() {
    const barrierMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
    for (let i = 0; i < 10; i++) {
        const barrierGeometry = new THREE.BoxGeometry(0.5, 0.5, 20);
        const leftBarrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
        leftBarrier.position.set(-roadWidth - 0.5, 0.25, -i * 20);
        scene.add(leftBarrier);
        barriers.push(leftBarrier);

        const rightBarrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
        rightBarrier.position.set(roadWidth + 0.5, 0.25, -i * 20);
        scene.add(rightBarrier);
        barriers.push(rightBarrier);
    }
}

function setEyesColor(color, emissiveColor) {
    if (carEyes.length > 0) {
        carEyes.forEach(eye => {
            eye.material.color.setHex(color);
            eye.material.emissive.setHex(emissiveColor);
        });
    }
}

// Создание травы
function createGround() {
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });

    for (let i = 0; i < 10; i++) {
        let width = 30 - ((30 - 10) * (i / 10));
        let heightVariation = Math.random() * 0.2; // Немного рандомизируем высоту
        const groundGeometry = new THREE.PlaneGeometry(width, 20);
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = heightVariation;
        ground.position.z = -i * 20;
        scene.add(ground);
        grassSegments.push(ground);
    }
}

export function createCar() {
    if (car) {
        scene.remove(car); // Удаляем старую машину
    }

    if (selectedCar === "legoF1") {
        car = createCarLegoF1();
    } else {
        car = createDefaultCar();
    }

    carSpeed = 0; // Сбрасываем скорость при смене машины
    console.log("Car speed reset to 0 after switching cars.");

    scene.add(car);
}

export function createDefaultCar() {
    const car = new THREE.Group();

    // Кузов машины
    const bodyGeometry = new THREE.BoxGeometry(1.8, 0.6, 4);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    car.add(body);

    // Кабина
    const cabinGeometry = new THREE.BoxGeometry(1.2, 0.6, 1.8);
    const cabinMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(0, 0.6, 0.4);
    car.add(cabin);

    // Колёса
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

    const wheelPositions = [
        [-0.9, -0.2, 1.5],
        [0.9, -0.2, 1.5],
        [-0.9, -0.2, -1.5],
        [0.9, -0.2, -1.5],
    ];

    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(...pos);
        wheel.castShadow = true;
        car.add(wheel);
    });

    // Фары
    // Фары (добавил задние фары)
    const lightGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.1);
    
    // Передние фары (желтые)
    const frontLightMaterial = new THREE.MeshStandardMaterial({ emissive: 0xffffaa });
    const headlightLeft = new THREE.Mesh(lightGeometry, frontLightMaterial);
    const headlightRight = new THREE.Mesh(lightGeometry, frontLightMaterial);
    headlightLeft.position.set(-0.6, 0.3, -2.05); // Передние фары
    headlightRight.position.set(0.6, 0.3, -2.05);
    car.add(headlightLeft, headlightRight);
    
    // Задние фары (по умолчанию выключены)
    const rearLightMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x000000, emissiveIntensity: 1 });
    const taillightLeft = new THREE.Mesh(lightGeometry, rearLightMaterial);
    const taillightRight = new THREE.Mesh(lightGeometry, rearLightMaterial);
    taillightLeft.position.set(-0.6, 0.3, 2.05); // Задние фары
    taillightRight.position.set(0.6, 0.3, 2.05);
    car.add(taillightLeft, taillightRight);
    
    // Сохраняем ссылки на задние фары для управления
    car.rearLights = [taillightLeft, taillightRight];

    car.position.y = 0.4;
    scene.add(car);
    console.log("Car Position:", car.position);
    console.log("Front Lights Position:", headlightLeft.position, headlightRight.position);
    console.log("Rear Lights Position:", taillightLeft.position, taillightRight.position);
    return car;
}

function createCarLegoF1() {
    const car = new THREE.Group();

    // Основной корпус
    const bodyGeometry = new THREE.BoxGeometry(2, 0.5, 5);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    car.add(body);

    // Кабина пилота
    const cockpitGeometry = new THREE.BoxGeometry(1, 0.6, 1.2);
    const cockpitMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.set(0, 0.5, -1);
    car.add(cockpit);

    // Переднее и заднее антикрыло
    const wingGeometry = new THREE.BoxGeometry(2.5, 0.1, 0.5);
    const wingMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    const frontWing = new THREE.Mesh(wingGeometry, wingMaterial);
    frontWing.position.set(0, 0.2, -2.5);
    car.add(frontWing);

    const rearWing = new THREE.Mesh(wingGeometry, wingMaterial);
    rearWing.position.set(0, 0.3, 2.5);
    car.add(rearWing);

    // Колеса
    const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 12);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });

    const wheelPositions = [
        [-1.2, -0.2, 2],
        [1.2, -0.2, 2],
        [-1.2, -0.2, -2],
        [1.2, -0.2, -2],
    ];

    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(...pos);
        wheel.castShadow = true;
        car.add(wheel);
    });

    car.position.y = 0.4;
    return car;
}



export function updateRoad() {
    roadSegments.forEach(segment => {
        segment.position.z += speed + carSpeed;
    });

    if (carSpeed >= 0) { // Двигаемся вперед
        while (roadSegments[0].position.z > camera.position.z + 10) {
            const firstSegment = roadSegments.shift();
            const lastZ = roadSegments[roadSegments.length - 1].position.z;
            firstSegment.position.z = lastZ - 20; // Поддерживаем равномерное расстояние
            roadSegments.push(firstSegment);
        }
    } else { // Двигаемся назад
        while (roadSegments[roadSegments.length - 1].position.z < camera.position.z - 100) {
            const lastSegment = roadSegments.pop();
            const firstZ = roadSegments[0].position.z;
            lastSegment.position.z = firstZ + 20; // Поддерживаем равномерность
            roadSegments.unshift(lastSegment);
        }
    }
}

export function updateGround() {
    if (grassSegments.length === 0) return; // Проверяем, что есть сегменты

    grassSegments.forEach(segment => {
        segment.position.z += speed + carSpeed;
        segment.position.y = -Math.abs(segment.position.z) * 0.02; // Наклон вниз
    });

    while (grassSegments.length > 0 && grassSegments[0].position.z > camera.position.z + 10) {
        const firstSegment = grassSegments.shift();
        const lastZ = grassSegments[grassSegments.length - 1].position.z;
        firstSegment.position.z = lastZ - 20;
        firstSegment.position.y = -Math.abs(firstSegment.position.z) * 0.02;
        grassSegments.push(firstSegment);
    }
}

function updateRocks() {
    rocks.forEach(rock => {
        rock.position.z += speed + carSpeed;
    });

    if (carSpeed >= 0) { // Двигаемся вперед
        while (rocks[0].position.z > camera.position.z + 10) {
            const firstRock = rocks.shift();
            const lastZ = rocks[rocks.length - 1].position.z;
            firstRock.position.z = lastZ - 50;
            rocks.push(firstRock);
        }
    } else { // Двигаемся назад
        while (rocks[rocks.length - 1].position.z < camera.position.z - 100) {
            const lastRock = rocks.pop();
            const firstZ = rocks[0].position.z;
            lastRock.position.z = firstZ + 50;
            rocks.unshift(lastRock);
        }
    }
}

function updateTrees() {
    trees.forEach(tree => {
        tree.position.z += speed + carSpeed; // Двигаем деревья вместе с дорогой
    });

    // Проверяем, ушло ли дерево за пределы видимости
    while (trees.length > 0 && trees[0].position.z > camera.position.z + 10) {
        let firstTree = trees.shift();  // Удаляем переднее дерево
        let lastTreeZ = trees[trees.length - 1].position.z; // Получаем Z последнего дерева
        firstTree.position.z = lastTreeZ - 30;  // Телепортируем дальше
        trees.push(firstTree);
    }
}
function addRocks() {
    let rockSpacing = 50; // Камни появляются реже деревьев
    let rockCount = 7; // Количество камней

    for (let i = 0; i < rockCount; i++) {
        let xPos = (Math.random() < 0.5 ? -10 : 10); // Размещаем дальше от дороги
        let zPos = -i * rockSpacing; // Расстояние между камнями

        let rockGeometry = new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.5); // Разные размеры
        let rockMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
        let rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.set(xPos, 0.3, zPos); // Немного приподнимаем камень
        rock.castShadow = true;
        scene.add(rock);
        rocks.push(rock);
    }
}

function addTrees() {
    let treeSpacing = 30; // Расстояние между деревьями
    let treeCount = 15; // Уменьшаем количество деревьев

    for (let i = 0; i < treeCount; i++) {
        let xPos = (Math.random() < 0.5 ? -8 : 8); // Левый или правый край
        let zPos = -i * treeSpacing; // Расстояние между деревьями

        let treeType = Math.random();
        let trunkGeometry, trunkMaterial, leavesGeometry, leavesMaterial;

        if (treeType < 0.4) {
            trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, 3, 8);
            leavesGeometry = new THREE.ConeGeometry(1, 2, 8);
            leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x006400 });
        } else if (treeType < 0.7) {
            trunkGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2, 10);
            leavesGeometry = new THREE.SphereGeometry(1.5, 8, 8);
            leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        } else {
            trunkGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 8);
            leavesGeometry = new THREE.SphereGeometry(1, 8, 8);
            leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x2E8B57 });
        }

        const trunk = new THREE.Mesh(trunkGeometry, new THREE.MeshStandardMaterial({ color: 0x8B4513 }));
        trunk.position.set(xPos, trunkGeometry.parameters.height / 2, zPos);
        trunk.castShadow = true;
        scene.add(trunk);

        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.set(xPos, trunk.position.y + trunkGeometry.parameters.height / 2, zPos);
        leaves.castShadow = true;
        scene.add(leaves);

        trees.push(trunk, leaves);
    }
}

function animate() {
    if (!isPaused) {
        requestAnimationFrame(animate);
        updateRoad();
        updateGround();
        updateTrees();
        updateRocks(); // Добавили обновление камней
        renderer.render(scene, camera);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function showControls() {
    const controlsDiv = document.createElement("div");
    controlsDiv.id = "controls";
    controlsDiv.style.position = "absolute";
    controlsDiv.style.bottom = "20px";
    controlsDiv.style.left = "50%";
    controlsDiv.style.transform = "translateX(-50%)";
    controlsDiv.style.display = "grid";
    controlsDiv.style.gridTemplateColumns = "60px 60px 60px";
    controlsDiv.style.gridTemplateRows = "60px 60px";
    controlsDiv.style.gap = "10px";
    controlsDiv.style.justifyContent = "center";
    controlsDiv.style.alignItems = "center";

    function createButton(symbol, direction) {
        const button = document.createElement("button");
        button.innerHTML = symbol;
        button.style.fontSize = "30px";
        button.style.padding = "10px";
        button.style.borderRadius = "10px";
        button.style.border = "none";
        button.style.background = "#555";
        button.style.color = "white";
        button.style.cursor = "pointer";
        button.style.width = "60px";
        button.style.height = "60px";
        button.ontouchstart = () => onMobileKeyDown(direction);
        button.ontouchend = () => onMobileKeyUp(direction);
        return button;
    }

    // Кнопки
    const upButton = createButton("▲", "up");
    const downButton = createButton("▼", "down");
    const leftButton = createButton("◄", "left");
    const rightButton = createButton("►", "right");

    // Расставляем кнопки в сетке
    controlsDiv.appendChild(document.createElement("div")); // Пустая ячейка
    controlsDiv.appendChild(upButton);
    controlsDiv.appendChild(document.createElement("div")); // Пустая ячейка
    controlsDiv.appendChild(leftButton);
    controlsDiv.appendChild(downButton);
    controlsDiv.appendChild(rightButton);

    document.body.appendChild(controlsDiv);
}
function onMobileKeyDown(direction) {
    if (direction === "up") {
        carSpeed = Math.min(carSpeed + carAcceleration, maxSpeed);
    } else if (direction === "down") {
        carSpeed = Math.max(carSpeed - carAcceleration, -maxSpeed / 2);
        setEyesColor(0xff0000, 0xff0000); // Глаза красные 🔴 при торможении
    } else if (direction === "left") {
        car.position.x = Math.max(car.position.x - 0.2, -roadWidth + 0.5);
    } else if (direction === "right") {
        car.position.x = Math.min(car.position.x + 0.2, roadWidth - 0.5);
    }
}

function onMobileKeyUp(direction) {
    if (direction === "up" || direction === "down") {
        carSpeed *= 0.9; // Плавное торможение
        setEyesColor(0x000000, 0x000000); // Глаза черные ⚫
    }
}


function onKeyDown(event) {
    if (!car) return; // Проверяем, есть ли машина

    if (event.key === 'ArrowUp' || event.key === 'w') {
        carSpeed = Math.min(carSpeed + carAcceleration, maxSpeed);
    } else if (event.key === 'ArrowDown' || event.key === 's') {
        carSpeed = Math.max(carSpeed - carAcceleration, -maxSpeed / 2);
        setRearLights(true); // Включаем задние фары
    } else if (event.key === 'ArrowLeft' || event.key === 'a') {
        car.position.x = Math.max(car.position.x - 0.2, -roadWidth + 0.5);
    } else if (event.key === 'ArrowRight' || event.key === 'd') {
        car.position.x = Math.min(car.position.x + 0.2, roadWidth - 0.5);
    }
}
function onKeyUp(event) {
    if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'ArrowDown' || event.key === 's') {
        carSpeed *= 0.9;
        console.log("Stopping braking - turning rear lights OFF");
        setRearLights(false); // Выключаем задние фары
    }
}
export function setRearLights(isOn) {
    if (!car.rearLights) {
        console.warn("Rear lights are not defined!");
        return;
    }

    const color = isOn ? 0xff0000 : 0x000000;
    car.rearLights.forEach(light => {
        light.material.emissive.setHex(color);
        light.material.emissiveIntensity = isOn ? 2 : 0; // Повышаем интенсивность при торможении
    });

    console.log("Rear lights set to:", isOn ? "ON (red)" : "OFF (black)");
}


function startGame() {
    hideGameMenu();
    carSpeed = 0;  // Начинаем с нулевой скорости
    animate();  // Запускаем анимацию
}

function showGameMenu(isPaused = false) {
    let menu = document.getElementById("game-menu");

    if (!menu) {
        menu = document.createElement("div");
        menu.id = "game-menu";
        menu.style.position = "absolute";
        menu.style.top = "50%";
        menu.style.left = "50%";
        menu.style.transform = "translate(-50%, -50%)";
        menu.style.padding = "20px";
        menu.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        menu.style.color = "white";
        menu.style.textAlign = "center";
        menu.style.borderRadius = "10px";
        menu.style.boxShadow = "0px 0px 10px rgba(255, 255, 255, 0.5)";
        menu.style.display = "flex";
        menu.style.flexDirection = "column";
        menu.style.gap = "10px";
        document.body.appendChild(menu);
    }

    menu.innerHTML = `<h1>Car Game</h1>
        <button id="newGameButton">New Game</button>
        <button id="resumeButton">Resume</button> `;

    document.getElementById("newGameButton").addEventListener("click", startGame);
    document.getElementById("resumeButton").addEventListener("click", resumeGame);
}

function hideGameMenu() {
    const menu = document.getElementById("game-menu");
    if (menu) {
        document.body.removeChild(menu);
    }
}


function resumeGame() {
    isPaused = false;
    hideGameMenu();
    animate();
}

function onPause(event) {
    if (event.key === 'Escape') {
        isPaused = !isPaused;
        if (isPaused) {
            showGameMenu(true);
        } else {
            hideGameMenu();
            animate();
        }
    }
}

function showStartMenu() {
    const menu = document.createElement("div");
    menu.id = "start-menu";
    menu.style.position = "absolute";
    menu.style.top = "50%";
    menu.style.left = "50%";
    menu.style.transform = "translate(-50%, -50%)";
    menu.style.padding = "20px";
    menu.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    menu.style.color = "white";
    menu.style.textAlign = "center";
    menu.innerHTML = `
        <h1>Car Game</h1>
        <button id="newGameButton">New Game</button>
    `;
    
    document.body.appendChild(menu);

    document.getElementById("newGameButton").addEventListener("click", startGame);
}

function showMenu() {
    const menu = document.getElementById("menu");
    if (!menu) {
        const div = document.createElement("div");
        div.id = "menu";
        div.style.position = "absolute";
        div.style.top = "50%";
        div.style.left = "50%";
        div.style.transform = "translate(-50%, -50%)";
        div.style.padding = "20px";
        div.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        div.style.color = "white";
        div.style.textAlign = "center";
        div.innerHTML = `
            <h1>Paused</h1>
            <button id="resumeButton">Resume</button>
        `;
        document.body.appendChild(div);

        document.getElementById("resumeButton").addEventListener("click", resumeGame);
    }
}
function showCarSelectionMenu() {
    const menu = document.createElement("div");
    menu.id = "car-selection";
    menu.style.position = "absolute";
    menu.style.top = "50%";
    menu.style.left = "50%";
    menu.style.transform = "translate(-50%, -50%)";
    menu.style.padding = "20px";
    menu.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    menu.style.color = "white";
    menu.style.textAlign = "center";

    menu.innerHTML = `
        <h1>Select Car</h1>
        <button id="defaultCar">Default Car</button>
        <button id="legoF1Car">LEGO F1 Car</button>
    `;

    document.body.appendChild(menu);

    document.getElementById("defaultCar").addEventListener("click", () => selectCar("default"));
    document.getElementById("legoF1Car").addEventListener("click", () => selectCar("legoF1"));
}

function selectCar(carType) {
    selectedCar = carType;

    // Удаляем текущее меню выбора машины
    const menu = document.getElementById("car-selection");
    if (menu) {
        document.body.removeChild(menu);
    }

    // Удаляем старую машину, если она есть
    if (car) {
        scene.remove(car);
    }

    // Сбрасываем скорость машины
    carSpeed = 0;

    // Создаем новую машину
    createCar();
}

function addMenuButton() {
    const button = document.createElement("button");
    button.innerHTML = "Change Car";
    button.style.position = "absolute";
    button.style.top = "10px";
    button.style.left = "10px";
    button.style.padding = "10px";
    button.style.border = "none";
    button.style.background = "#555";
    button.style.color = "white";
    button.style.cursor = "pointer";
    button.addEventListener("click", showCarSelectionMenu);
    document.body.appendChild(button);
}

addMenuButton();

function hideMenu() {
    const menu = document.getElementById("menu");
    if (menu) {
        document.body.removeChild(menu);
    }
}

init();