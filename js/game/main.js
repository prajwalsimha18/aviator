//COLORS
var Colors = {
    red: 0xf25346,
    white: 0xd8d0d1,
    brown: 0x59332e,
    brownDark: 0x23190f,
    pink: 0xF5986E,
    yellow: 0xf4ce93,
    blue: 0x68c3c0,

};

///////////////

// GAME VARIABLES
var game;
var deltaTime = 0;
var newTime = new Date().getTime();
var oldTime = new Date().getTime();
var ennemiesPool = [];
var particlesPool = [];
var particlesInUse = [];
var backgroundMusic;
var planeSound;
var fuelPopSound;
var brickHitSound;

function resetGame() {
    console.log("this is working ")
    game = {
        speed: 0,
        initSpeed: .00035,
        baseSpeed: .00035,
        targetBaseSpeed: .00035,
        incrementSpeedByTime: .0000025,
        incrementSpeedByLevel: .000005,
        distanceForSpeedUpdate: 100,
        speedLastUpdate: 0,

        distance: 0,
        ratioSpeedDistance: 50,
        energy: 100,
        ratioSpeedEnergy: 3,

        level: 1,
        levelLastUpdate: 0,
        distanceForLevelUpdate: 1000,

        planeDefaultHeight: 100,
        planeAmpHeight: 80,
        planeAmpWidth: 75,
        planeMoveSensivity: 0.005,
        planeRotXSensivity: 0.0008,
        planeRotZSensivity: 0.0004,
        planeFallSpeed: .001,
        planeMinSpeed: 1.2,
        planeMaxSpeed: 1.6,
        planeSpeed: 0,
        planeCollisionDisplacementX: 0,
        planeCollisionSpeedX: 0,

        planeCollisionDisplacementY: 0,
        planeCollisionSpeedY: 0,

        seaRadius: 600,
        seaLength: 800,
        //seaRotationSpeed:0.006,
        wavesMinAmp: 5,
        wavesMaxAmp: 20,
        wavesMinSpeed: 0.001,
        wavesMaxSpeed: 0.003,

        cameraFarPos: 500,
        cameraNearPos: 150,
        cameraSensivity: 0.002,

        coinDistanceTolerance: 15,
        coinValue: 3,
        coinsSpeed: .5,
        coinLastSpawn: 0,
        distanceForCoinsSpawn: 100,

        ennemyDistanceTolerance: 10,
        ennemyValue: 10,
        ennemiesSpeed: .6,
        ennemyLastSpawn: 0,
        distanceForEnnemiesSpawn: 50,
        status: "waitingForPlayer",
    };
    fieldLevel.innerHTML = Math.floor(game.level);
}

function startGame() {
    game.status = "playing";
    fadeElement(bannerElement);
    backgroundMusic.play();
    planeSound.play();
}

//THREEJS RELATED VARIABLES

var scene,
    camera, fieldOfView, aspectRatio, nearPlane, farPlane,
    renderer,
    container,
    controls;

//SCREEN & MOUSE VARIABLES

var HEIGHT, WIDTH,
    mousePos = { x: 0, y: 0 };

//INIT THREE JS, SCREEN AND MOUSE EVENTS

function createScene() {

    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;

    scene = new THREE.Scene();
    aspectRatio = WIDTH / HEIGHT;
    fieldOfView = 50;
    nearPlane = .1;
    farPlane = 10000;
    camera = new THREE.PerspectiveCamera(
        fieldOfView,
        aspectRatio,
        nearPlane,
        farPlane
    );
    scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);
    camera.position.x = 0;
    camera.position.z = 200;
    camera.position.y = game.planeDefaultHeight;
    //camera.lookAt(new THREE.Vector3(0, 400, 0));

    // Setup sound here
    var listener = new THREE.AudioListener();
    camera.add(listener);

    backgroundMusic = new THREE.Audio(listener);
    backgroundMusic.load('sounds/bg-music.ogg');
    backgroundMusic.setLoop(true);
    backgroundMusic.setVolume(0.3);

    planeSound = new THREE.Audio(listener);
    planeSound.load('sounds/plane.ogg');
    planeSound.setLoop(true);
    planeSound.setVolume(0.7);

    fuelPopSound = new THREE.Audio(listener);
    fuelPopSound.load('sounds/fuel-pop.ogg');
    fuelPopSound.setVolume(0.4);
    fuelPopSound.setLoop(false);

    brickHitSound = new THREE.Audio(listener);
    brickHitSound.load('sounds/brick-hit.ogg');
    brickHitSound.setVolume(0.4);
    brickHitSound.setLoop(false);


    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(WIDTH, HEIGHT);

    renderer.shadowMap.enabled = true;

    container = document.getElementById('world');
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', handleWindowResize, false);

    /*
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minPolarAngle = -Math.PI / 2;
    controls.maxPolarAngle = Math.PI ;
  
    //controls.noZoom = true;
    //controls.noPan = true;
    //*/
}

// MOUSE AND SCREEN EVENTS

function handleWindowResize() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
}

function handleMouseMove(event) {
    var tx = -1 + (event.clientX / WIDTH) * 2;
    var ty = 1 - (event.clientY / HEIGHT) * 2;
    mousePos = { x: tx, y: ty };
}

function handleTouchMove(event) {
    event.preventDefault();
    var tx = -1 + (event.touches[0].pageX / WIDTH) * 2;
    var ty = 1 - (event.touches[0].pageY / HEIGHT) * 2;
    mousePos = { x: tx, y: ty };
}

function handleMouseUp(event) {
    if (game.status == "waitingForPlayer") {
        resetGame();
        startGame();
        hideReplay();
    } else if (game.status == "waitingReplay") {
        window.location.reload();
    }
}
console.log("mayb this is working")

function handleTouchEnd(event) {
    if (game.status == "waitingReplay") {
        resetGame();
        startGame();
        hideReplay();
    }
}

function handleKeyDown(event) {
    // If M is pressed mute sound
    if (event.keyCode == 77) { // M is pressed
        if (backgroundMusic.isPlaying) {
            backgroundMusic.pause();
        } else {
            backgroundMusic.play();
        }
    }
}


// 3D Models
var sea;
var airplane;

function createPlane() {
    airplane = new AirPlane();
    airplane.mesh.scale.set(.25, .25, .25);
    airplane.mesh.position.y = game.planeDefaultHeight;
    scene.add(airplane.mesh);
}

function createSea() {
    sea = new Sea();
    sea.mesh.position.y = -game.seaRadius;
    scene.add(sea.mesh);
}

function createSky() {
    sky = new Sky();
    sky.mesh.position.y = -game.seaRadius;
    scene.add(sky.mesh);
}

function createCoins() {
    coinsHolder = new CoinsHolder(20);
    scene.add(coinsHolder.mesh)
}

function createEnnemies() {
    for (var i = 0; i < 10; i++) {
        var ennemy = new Ennemy();
        ennemiesPool.push(ennemy);
    }
    ennemiesHolder = new EnnemiesHolder();
    //ennemiesHolder.mesh.position.y = -game.seaRadius;
    scene.add(ennemiesHolder.mesh)
}

function createParticles() {
    for (var i = 0; i < 10; i++) {
        var particle = new Particle();
        particlesPool.push(particle);
    }
    particlesHolder = new ParticlesHolder();
    //ennemiesHolder.mesh.position.y = -game.seaRadius;
    scene.add(particlesHolder.mesh)
}

function loop() {

    newTime = new Date().getTime();
    deltaTime = newTime - oldTime;
    oldTime = newTime;

    if (game.status == "playing") {

        // Add energy coins every 100m;
        if (Math.floor(game.distance) % game.distanceForCoinsSpawn == 0 && Math.floor(game.distance) > game.coinLastSpawn) {
            game.coinLastSpawn = Math.floor(game.distance);
            coinsHolder.spawnCoins();
        }

        if (Math.floor(game.distance) % game.distanceForSpeedUpdate == 0 && Math.floor(game.distance) > game.speedLastUpdate) {
            game.speedLastUpdate = Math.floor(game.distance);
            game.targetBaseSpeed += game.incrementSpeedByTime * deltaTime;
        }


        if (Math.floor(game.distance) % game.distanceForEnnemiesSpawn == 0 && Math.floor(game.distance) > game.ennemyLastSpawn) {
            game.ennemyLastSpawn = Math.floor(game.distance);
            ennemiesHolder.spawnEnnemies();
        }

        if (Math.floor(game.distance) % game.distanceForLevelUpdate == 0 && Math.floor(game.distance) > game.levelLastUpdate) {
            game.levelLastUpdate = Math.floor(game.distance);
            game.level++;
            fieldLevel.innerHTML = Math.floor(game.level);

            game.targetBaseSpeed = game.initSpeed + game.incrementSpeedByLevel * game.level
        }


        updatePlane();
        updateDistance();
        updateEnergy();
        game.baseSpeed += (game.targetBaseSpeed - game.baseSpeed) * deltaTime * 0.02;
        game.speed = game.baseSpeed * game.planeSpeed;

    } else if (game.status == "gameover") {
        game.speed *= .99;
        airplane.mesh.rotation.z += (-Math.PI / 2 - airplane.mesh.rotation.z) * .0002 * deltaTime;
        airplane.mesh.rotation.x += 0.0003 * deltaTime;
        game.planeFallSpeed *= 1.05;
        airplane.mesh.position.y -= game.planeFallSpeed * deltaTime;

        if (airplane.mesh.position.y < -200) {
            showReplay();
            game.status = "waitingReplay";
        }
    } else if (game.status == "waitingReplay") {

    } else if (game.status == "waitingForPlayer") {
        if (Math.floor(game.distance) % game.distanceForSpeedUpdate == 0 && Math.floor(game.distance) > game.speedLastUpdate) {
            game.speedLastUpdate = Math.floor(game.distance);
            game.targetBaseSpeed += game.incrementSpeedByTime * deltaTime;
        }

        if (Math.floor(game.distance) % game.distanceForLevelUpdate == 0 && Math.floor(game.distance) > game.levelLastUpdate) {
            game.levelLastUpdate = Math.floor(game.distance);
            game.level++;
            fieldLevel.innerHTML = Math.floor(game.level);

            game.targetBaseSpeed = game.initSpeed + game.incrementSpeedByLevel * game.level
        }
        updatePlane();
        game.baseSpeed += (game.targetBaseSpeed - game.baseSpeed) * deltaTime * 0.02;
        game.speed = game.baseSpeed * game.planeSpeed;
    }

    airplane.propeller.rotation.x += .2 + game.planeSpeed * deltaTime * .005;
    sea.mesh.rotation.z += game.speed * deltaTime;//*game.seaRotationSpeed;

    if (sea.mesh.rotation.z > 2 * Math.PI) sea.mesh.rotation.z -= 2 * Math.PI;

    ambientLight.intensity += (.5 - ambientLight.intensity) * deltaTime * 0.005;

    coinsHolder.rotateCoins();
    ennemiesHolder.rotateEnnemies();

    sky.moveClouds();
    sea.moveWaves();

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
}

function updateDistance() {
    game.distance += game.speed * deltaTime * game.ratioSpeedDistance;
    fieldDistance.innerHTML = Math.floor(game.distance);
    var d = 502 * (1 - (game.distance % game.distanceForLevelUpdate) / game.distanceForLevelUpdate);
    levelCircle.setAttribute("stroke-dashoffset", d);

}

var blinkEnergy = false;

function updateEnergy() {
    game.energy -= game.speed * deltaTime * game.ratioSpeedEnergy;
    game.energy = Math.max(0, game.energy);
    energyBar.style.right = (100 - game.energy) + "%";
    energyBar.style.backgroundColor = (game.energy < 50) ? "#f25346" : "#68c3c0";

    if (game.energy < 30) {
        energyBar.style.animationName = "blinking";
    } else {
        energyBar.style.animationName = "none";
    }

    if (game.energy < 1) {
        game.status = "gameover";
    }
}

function addEnergy() {
    game.energy += game.coinValue;
    game.energy = Math.min(game.energy, 100);
}

function removeEnergy() {
    game.energy -= game.ennemyValue;
    game.energy = Math.max(0, game.energy);
}

function updatePlane() {

    game.planeSpeed = normalize(mousePos.x, -.5, .5, game.planeMinSpeed, game.planeMaxSpeed);
    var targetY = normalize(mousePos.y, -.75, .75, game.planeDefaultHeight - game.planeAmpHeight, game.planeDefaultHeight + game.planeAmpHeight);
    var targetX = normalize(mousePos.x, -1, 1, -game.planeAmpWidth * .7, -game.planeAmpWidth);

    game.planeCollisionDisplacementX += game.planeCollisionSpeedX;
    targetX += game.planeCollisionDisplacementX;


    game.planeCollisionDisplacementY += game.planeCollisionSpeedY;
    targetY += game.planeCollisionDisplacementY;

    airplane.mesh.position.y += (targetY - airplane.mesh.position.y) * deltaTime * game.planeMoveSensivity;
    airplane.mesh.position.x += (targetX - airplane.mesh.position.x) * deltaTime * game.planeMoveSensivity;

    airplane.mesh.rotation.z = (targetY - airplane.mesh.position.y) * deltaTime * game.planeRotXSensivity;
    airplane.mesh.rotation.x = (airplane.mesh.position.y - targetY) * deltaTime * game.planeRotZSensivity;
    var targetCameraZ = normalize(game.planeSpeed, game.planeMinSpeed, game.planeMaxSpeed, game.cameraNearPos, game.cameraFarPos);
    camera.fov = normalize(mousePos.x, -1, 1, 40, 80);
    camera.updateProjectionMatrix()
    camera.position.y += (airplane.mesh.position.y - camera.position.y) * deltaTime * game.cameraSensivity;

    game.planeCollisionSpeedX += (0 - game.planeCollisionSpeedX) * deltaTime * 0.03;
    game.planeCollisionDisplacementX += (0 - game.planeCollisionDisplacementX) * deltaTime * 0.01;
    game.planeCollisionSpeedY += (0 - game.planeCollisionSpeedY) * deltaTime * 0.03;
    game.planeCollisionDisplacementY += (0 - game.planeCollisionDisplacementY) * deltaTime * 0.01;

    airplane.pilot.updateHairs();
}

function showReplay() {
    replayMessage.style.display = "block";
    if (planeSound.isPlaying) {
        planeSound.pause();
    }
}

function hideReplay() {
    replayMessage.style.display = "none";
}

function normalize(v, vmin, vmax, tmin, tmax) {
    var nv = Math.max(Math.min(v, vmax), vmin);
    var dv = vmax - vmin;
    var pc = (nv - vmin) / dv;
    var dt = tmax - tmin;
    var tv = tmin + (pc * dt);
    return tv;
}

var fieldDistance, energyBar, replayMessage, fieldLevel, levelCircle, bannerElement, scoreElement;
function init(event) {
    // UI
    fieldDistance = document.getElementById("distValue");
    energyBar = document.getElementById("energyBar");
    replayMessage = document.getElementById("replayMessage");
    bannerElement = document.getElementById("banner");
    scoreElement = document.getElementById("score");
    fieldLevel = document.getElementById("levelValue");
    levelCircle = document.getElementById("levelCircleStroke");

    resetGame();
    createScene();

    showReplay();

    createLights();
    createPlane();
    createSea();
    createSky();
    createCoins();
    createEnnemies();
    createParticles();

    document.addEventListener('mousemove', handleMouseMove, false);
    document.addEventListener('touchmove', handleTouchMove, false);
    document.addEventListener('mouseup', handleMouseUp, false);
    document.addEventListener('touchend', handleTouchEnd, false);
    document.addEventListener('keydown', handleKeyDown, false);

    loop();
}

window.addEventListener('load', init, false);
