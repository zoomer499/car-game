import * as THREE from 'three';

let scene, camera, renderer, car, roadSegments = [];
let trees = [];
let speed = 0.2;
let carSpeed = { forward: 0, sideways: 0 };
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
    roadTexture.repeat.set(1, 5);

    for (let i = 0; i < 5; i++) {
        const groundGeometry = new THREE.PlaneGeometry(10, 20);
        const groundMaterial = new THREE.MeshStandardMaterial({ map: roadTexture });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.z = -i * 20;
        ground.receiveShadow = true;
        scene.add(ground);
        roadSegments.push(ground);
    }

    createCar();
    addTrees();
    addBarriers();
    
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    animate();
}

function createCar() {
    const carBodyGeometry = new THREE.BoxGeometry(1, 0.5, 2);
    const carBodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    car = new THREE.Mesh(carBodyGeometry, carBodyMaterial);
    car.castShadow = true;
    car.position.y = 0.25;
    scene.add(car);
}

function addTrees() {
    const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    for (let i = 0; i < 20; i++) {
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2, 10);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set((Math.random() < 0.5 ? -5.5 : 5.5), 1, -Math.random() * 100);
        trunk.castShadow = true;
        scene.add(trunk);
        trees.push(trunk);

        const leavesGeometry = new THREE.SphereGeometry(1, 8, 8);
        const leaves = new THREE.Mesh(leavesGeometry, treeMaterial);
        leaves.position.set(trunk.position.x, trunk.position.y + 1.5, trunk.position.z);
        leaves.castShadow = true;
        scene.add(leaves);
        trees.push(leaves);
    }
}

function addBarriers() {
    const barrierMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const barrierGeometry = new THREE.BoxGeometry(0.5, 0.5, 100);
    
    const leftBarrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
    leftBarrier.position.set(-roadWidth - 0.5, 0.25, -50);
    scene.add(leftBarrier);

    const rightBarrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
    rightBarrier.position.set(roadWidth + 0.5, 0.25, -50);
    scene.add(rightBarrier);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
    if (event.key === 'ArrowLeft' || event.key === 'a') carSpeed.sideways = -0.3;
    if (event.key === 'ArrowRight' || event.key === 'd') carSpeed.sideways = 0.3;
    if (event.key === 'ArrowUp' || event.key === 'w') carSpeed.forward = -0.3;
    if (event.key === 'ArrowDown' || event.key === 's') carSpeed.forward = 0.3;
}

function onKeyUp(event) {
    if (['ArrowLeft', 'a', 'ArrowRight', 'd'].includes(event.key)) carSpeed.sideways = 0;
    if (['ArrowUp', 'w', 'ArrowDown', 's'].includes(event.key)) carSpeed.forward = 0;
}

function updateRoad() {
    roadSegments.forEach(segment => {
        segment.position.z += speed;
        if (segment.position.z > 10) {
            segment.position.z = roadSegments[roadSegments.length - 1].position.z - 20;
            roadSegments.push(roadSegments.shift());
        }
    });

    trees.forEach(tree => {
        tree.position.z += speed;
        if (tree.position.z > 10) {
            tree.position.z = -100;
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    car.position.z += carSpeed.forward;
    car.position.x += carSpeed.sideways;
    
    if (car.position.x > roadWidth) car.position.x = roadWidth;
    if (car.position.x < -roadWidth) car.position.x = -roadWidth;
    
    updateRoad();
    renderer.render(scene, camera);
}

init();
