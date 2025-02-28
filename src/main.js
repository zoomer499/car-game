import * as THREE from 'three';

let scene, camera, renderer, car, roadSegments = [], grassSegments = [];
let trees = [];
let barriers = [];
let speed = 0.2;
let carSpeed = 0;
let carAcceleration = 0.02;
let maxSpeed = 2;
const roadWidth = 4;

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

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
        // Создание травы
        const groundGeometry = new THREE.PlaneGeometry(30, 20);
        const groundMaterial = new THREE.MeshStandardMaterial({ map: grassTexture });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.z = -i * 20;
        ground.receiveShadow = true;
        scene.add(ground);
        grassSegments.push(ground); 
    
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
    animate();
    showControls();
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

let carEyes = [];

function createCar() {
    car = new THREE.Group();

    // Тело кота
    const bodyGeometry = new THREE.BoxGeometry(1, 0.6, 2);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc99 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    car.add(body);

    // Голова кота
    const headGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.set(0, 0.6, 0.8);
    car.add(head);

    // Уши кота
    const earGeometry = new THREE.ConeGeometry(0.2, 0.4, 4);
    const earMaterial = new THREE.MeshStandardMaterial({ color: 0xffaa77 });
    const earLeft = new THREE.Mesh(earGeometry, earMaterial);
    const earRight = new THREE.Mesh(earGeometry, earMaterial);
    earLeft.position.set(-0.3, 1, 0.8);
    earRight.position.set(0.3, 1, 0.8);
    car.add(earLeft, earRight);

    // Глаза кота (добавляем в массив `carEyes`)
    const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x000000 }); // Добавляем эмиссию
    const eyeLeft = new THREE.Mesh(eyeGeometry, eyeMaterial);
    const eyeRight = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eyeLeft.position.set(-0.2, 0.7, 1.1);
    eyeRight.position.set(0.2, 0.7, 1.1);

    car.add(eyeLeft, eyeRight);
    carEyes = [eyeLeft, eyeRight]; // Сохраняем ссылки на глаза

    // Колёса
    const wheelGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.2, 8);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const wheels = [];
    for (let i = 0; i < 4; i++) {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheels.push(wheel);
    }
    wheels[0].position.set(-0.5, -0.2, 0.8);
    wheels[1].position.set(0.5, -0.2, 0.8);
    wheels[2].position.set(-0.5, -0.2, -0.8);
    wheels[3].position.set(0.5, -0.2, -0.8);
    wheels.forEach(wheel => car.add(wheel));

    car.position.y = 0.4;
    scene.add(car);
}

function updateRoad() {
    roadSegments.forEach(segment => {
        segment.position.z += speed + carSpeed;
    });

    if (carSpeed >= 0) { // Двигаемся вперед
        while (roadSegments[0].position.z > 10) {
            const lastZ = roadSegments[roadSegments.length - 1].position.z;
            const firstSegment = roadSegments.shift();
            firstSegment.position.z = lastZ - 20;
            roadSegments.push(firstSegment);
        }
    } else { // Двигаемся назад
        while (roadSegments[roadSegments.length - 1].position.z < -100) {
            const lastSegment = roadSegments.pop();
            const firstZ = roadSegments[0].position.z;
            lastSegment.position.z = firstZ + 20;
            roadSegments.unshift(lastSegment);
        }
    }
}

function updateGround() {
    grassSegments.forEach(segment => {
        segment.position.z += speed + carSpeed;
    });

    if (carSpeed >= 0) { // Двигаемся вперед
        while (grassSegments[0].position.z > 10) {
            const lastZ = grassSegments[grassSegments.length - 1].position.z;
            const firstSegment = grassSegments.shift();
            firstSegment.position.z = lastZ - 20;
            grassSegments.push(firstSegment);
        }
    } else { // Двигаемся назад
        while (grassSegments[grassSegments.length - 1].position.z < -100) {
            const lastSegment = grassSegments.pop();
            const firstZ = grassSegments[0].position.z;
            lastSegment.position.z = firstZ + 20;
            grassSegments.unshift(lastSegment);
        }
    }
}

function updateTrees() {
    for (let i = 0; i < trees.length; i += 2) {
        let trunk = trees[i];
        let leaves = trees[i + 1];

        trunk.position.z += speed + carSpeed;
        leaves.position.z += speed + carSpeed;

        if (trunk.position.z > 10) {
            const lastZ = trees[trees.length - 1].position.z;
            
            trunk.position.z = lastZ - 20;
            leaves.position.z = lastZ - 20;

            trees.push(trees.shift(), trees.shift());
        }
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
    if (!isPaused) { // Останавливаем игру при паузе
        requestAnimationFrame(animate);
        updateRoad();
        updateGround();
        updateTrees();
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
    if (event.key === 'ArrowUp' || event.key === 'w') {
        carSpeed = Math.min(carSpeed + carAcceleration, maxSpeed);
    } else if (event.key === 'ArrowDown' || event.key === 's') {
        carSpeed = Math.max(carSpeed - carAcceleration, -maxSpeed / 2); // Можно сдавать назад
        setEyesColor(0xff0000, 0xff0000); // Глаза становятся красными 🔴
    } else if (event.key === 'ArrowLeft' || event.key === 'a') {
        car.position.x = Math.max(car.position.x - 0.2, -roadWidth + 0.5);
    } else if (event.key === 'ArrowRight' || event.key === 'd') {
        car.position.x = Math.min(car.position.x + 0.2, roadWidth - 0.5);
    }
}

function onKeyUp(event) {
    if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'ArrowDown' || event.key === 's') {
        carSpeed *= 0.9; // Постепенное торможение
        setEyesColor(0x000000, 0x000000); // Глаза возвращаются в черный ⚫
    }
}

let isPaused = false;

function onPause(event) {
    if (event.key === 'Escape') {
        isPaused = !isPaused;
        if (isPaused) {
            showMenu();
        } else {
            hideMenu();
        }
    }
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
            <button id="restartButton">Restart</button>
        `;
        document.body.appendChild(div);

        document.getElementById("resumeButton").addEventListener("click", resumeGame);
        document.getElementById("restartButton").addEventListener("click", restartGame);
    }
}

function hideMenu() {
    const menu = document.getElementById("menu");
    if (menu) {
        document.body.removeChild(menu);
    }
}

function resumeGame() {
    isPaused = false;
    hideMenu();
    animate(); // Перезапускаем анимацию
}

function restartGame() {
    location.reload();
}

init();
