import * as THREE from 'three';

let scene, camera, renderer, car, roadSegments = [];
let speed = 0.2;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 5);
    scene.add(light);

    const textureLoader = new THREE.TextureLoader();
    const roadTexture = textureLoader.load('/road.jpg');
    roadTexture.wrapS = roadTexture.wrapT = THREE.RepeatWrapping;
    roadTexture.repeat.set(1, 5);

    for (let i = 0; i < 5; i++) {
        const groundGeometry = new THREE.PlaneGeometry(10, 20);
        const groundMaterial = new THREE.MeshStandardMaterial({ map: roadTexture });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.z = -i * 20;
        scene.add(ground);
        roadSegments.push(ground);
    }

    const carGeometry = new THREE.BoxGeometry(1, 0.5, 2);
    const carMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    car = new THREE.Mesh(carGeometry, carMaterial);
    scene.add(car);

    window.addEventListener('resize', onWindowResize);
    document.addEventListener('keydown', onKeyDown);
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
    if (event.key === 'ArrowLeft') car.position.x -= 0.5;
    if (event.key === 'ArrowRight') car.position.x += 0.5;
}

function updateRoad() {
    roadSegments.forEach(segment => {
        segment.position.z += speed;
        if (segment.position.z > 10) {
            segment.position.z = roadSegments[roadSegments.length - 1].position.z - 20;
            roadSegments.push(roadSegments.shift());
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    car.position.z -= speed;
    updateRoad();
    renderer.render(scene, camera);
}

init();