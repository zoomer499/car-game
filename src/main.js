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

function createCar() {
    const carBodyGeometry = new THREE.BoxGeometry(1, 0.5, 2);
    const carBodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    car = new THREE.Mesh(carBodyGeometry, carBodyMaterial);
    car.castShadow = true;
    car.position.y = 0.25;
    scene.add(car);
}

function updateRoad() {
    roadSegments.forEach(segment => {
        segment.position.z += speed + carSpeed;
    });

    while (roadSegments[0].position.z > 10) {
        const lastZ = roadSegments[roadSegments.length - 1].position.z;
        const firstSegment = roadSegments.shift();
        firstSegment.position.z = lastZ - 20;
        roadSegments.push(firstSegment);
    }
}

function updateGround() {
    grassSegments.forEach(segment => {
        segment.position.z += speed + carSpeed;
    });

    while (grassSegments[0].position.z > 10) {
        const lastZ = grassSegments[grassSegments.length - 1].position.z;
        const firstSegment = grassSegments.shift();
        firstSegment.position.z = lastZ - 20;
        grassSegments.push(firstSegment);
    }
}

function updateTrees() {
    trees.forEach(tree => {
        tree.position.z += speed + carSpeed;
    });

    while (trees[0].position.z > 10) {
        const lastZ = trees[trees.length - 1].position.z;
        const firstTree = trees.shift();
        firstTree.position.z = lastZ - 20;  // Перемещаем назад
        trees.push(firstTree);
    }
}

function addTrees() {
    const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });

    for (let i = 0; i < 40; i++) {
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2, 10);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set((Math.random() < 0.5 ? -7 : 7), 1, -Math.random() * 200);
        trunk.castShadow = true;
        scene.add(trunk);

        const leavesGeometry = new THREE.SphereGeometry(1, 8, 8);
        const leaves = new THREE.Mesh(leavesGeometry, treeMaterial);
        leaves.position.set(trunk.position.x, trunk.position.y + 1.5, trunk.position.z);
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
function onKeyDown(event) {
    if (event.key === 'ArrowUp' || event.key === 'w') {
        carSpeed = Math.min(carSpeed + carAcceleration, maxSpeed);
    } else if (event.key === 'ArrowDown' || event.key === 's') {
        carSpeed = Math.max(carSpeed - carAcceleration, -maxSpeed / 2); // Можно сдавать назад
    } else if (event.key === 'ArrowLeft' || event.key === 'a') {
        car.position.x = Math.max(car.position.x - 0.2, -roadWidth + 0.5);
    } else if (event.key === 'ArrowRight' || event.key === 'd') {
        car.position.x = Math.min(car.position.x + 0.2, roadWidth - 0.5);
    }
}

function onKeyUp(event) {
    if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'ArrowDown' || event.key === 's') {
        carSpeed *= 0.9; // Постепенное торможение
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
            <button onclick="resumeGame()">Resume</button>
            <button onclick="restartGame()">Restart</button>
        `;
        document.body.appendChild(div);
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
}

function restartGame() {
    location.reload(); // Перезапуск игры
}

init();
