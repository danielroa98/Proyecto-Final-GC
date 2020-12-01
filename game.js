//import {MTLLoader} from 'three-mtl-loader';
//const MTTLoader = require('three-mtl-loader');

let renderer = null;
let scene = null;
let camera = null;
let orbitControls = null;
let cube = null;

let score = 0;

let materials = null;

let floorUniforms = null;

let objLoader = null, mtlLoader = null;

let objModelUrl = {obj:'../models/pingu.obj', map:'../models/pingu_tex.bmp'};
let shipHolder = null;

let enemy = null;
pigUrl = {obj: '../models/pigeon.obj', map : '../models/pigeon_tex.jpg'};

let wKey = false, sKey = false, aKey = false, dKey = false;

let moveSpeed = 33;

let projectilesCounter = [];

let currentTime = Date.now();

let batallions = [];

//Load chicken with gun .obj and .mtl
let objChickenGun = "../models/Chickens/chicken_w_gun.obj";
let mtlChickenGun = "../models/Chickens/chicken_w_gun.mtl";

//Load chicken with knife .obj and .mtl
let objChickenKnife = "../models/Chickens/chicken_w_knife.obj";
let mtlChickenKnife = "../models/Chickens/chicken_w_knife.mtl";

//Enemy models
enemyModels = [
	{modelo: objChickenGun, textura: mtlChickenGun}, 
	{modelo: objChickenKnife, textura: mtlChickenKnife}
];

function initControls() {
	document.addEventListener("keydown", (e) => {
		if(e.key == "d") {
			dKey = true;
		} else if(e.key == "a") {
			aKey = true;
		} else if(e.key == "w") {
			wKey = true;
		} else if(e.key == "s") {
			sKey = true;
		}
	});

	document.addEventListener("keyup", (e) => {
		if(e.key == "d") {
			dKey = false;
		} else if(e.key == "a") {
			aKey = false;
		} else if(e.key == "w") {
			wKey = false;
		} else if(e.key == "s") {
			sKey = false;
		}
	});

	document.addEventListener("keypress", (e) => {
		if(e.key == " ") {
			shoot();
		}
	});
}

function promisifyLoader (loader, onProgress) {
	function promiseLoader(url) {
	  return new Promise((resolve, reject) => {
		loader.load(url, resolve, onProgress, reject);
	  });
	}
  
	return {
	  originalLoader: loader,
	  load: promiseLoader,
	};
}

function loadMaterials() {
	let spaceTexture =  new THREE.TextureLoader().load("./img/spaaaace.jpeg");

	floorUniforms = {
        time: {type: "f", value: 0.2},
        glowTexture: {type: "t", value: spaceTexture}
    };
	floorUniforms.glowTexture.value.wrapS = floorUniforms.glowTexture.value.wrapT = THREE.RepeatWrapping;

	materials = {
		walls: new THREE.ShaderMaterial({
			uniforms: floorUniforms,
			vertexShader: document.getElementById('vertexShader').textContent,
			fragmentShader: document.getElementById('fragmentShader').textContent,
			side: THREE.DoubleSide
		}),
		floor: new THREE.ShaderMaterial({
			uniforms: floorUniforms,
			vertexShader: document.getElementById('vertexShader').textContent,
			fragmentShader: document.getElementById('fragmentShader').textContent,
			side: THREE.DoubleSide
		})
	}
}

//	loadObj(pigUrl, enemy, 0.25, 6, Math.PI/2, 0)
async function loadObj(objModelUrl, holder, scale, zPos, yPos, xPos, xRot, yRot) {
	const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

	try {
		const object = await objPromiseLoader.load(objModelUrl.obj);
		
		let texture = objModelUrl.hasOwnProperty('map') ? new THREE.TextureLoader().load(objModelUrl.map) : null;
		
		object.traverse(function (child) {
			if (child instanceof THREE.Mesh) {
				child.material.map = texture;
				child.scale.set(scale, scale, scale);
				child.rotation.x = xRot;
				child.rotation.y = yRot;
			}
		});


		holder.position.z = zPos;
		holder.position.y = yPos;
		holder.position.x = xPos;
		holder.add(object);

	}
	catch (err) {
		return onError(err);
	}
}

function loadObjWithMtl(enemyModels, enemyType) {
	mtlLoader = new THREE.MTLLoader();

	let enemyModelUrl = enemyModels[enemyType].modelo;
	let mtlModelEnemy = enemyModels[enemyType].textura;

	console.log(loadedEnemy);
	console.log(enemyModelUrl);
	console.log(mtlModelEnemy);

	mtlLoader.load(mtlModelEnemy, materials => {

		materials.preload();
		console.log(materials);

		objLoader = new THREE.OBJLoader();

		objLoader.setMaterials(materials);

		objLoader.load(enemyModelUrl, object => {
			object.traverse(function (child) {
				if (child.isMesh) {
					child.geometry.computeVertexNormals();
					// child.geometry.computeBoundingBox();
				}
			});

			objectList.push(object);
			object.position.y = 6;
			object.scale.set(2.5, 2.5, 2.5);
			scene.add(object);
		});
	});
}

function run() {
	requestAnimationFrame(() => {run();});
	
	// Render the scene
	renderer.render(scene, camera);

	KF.update();

	animate();

	// Update the camera controller
	orbitControls.update();
}

function createScene(canvas) {
	// Create the Three.js renderer and attach it to our canvas
	renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});

	// Set the viewport size
	renderer.setSize(canvas.width, canvas.height);

	// Turn on shadows
	renderer.shadowMap.enabled = true;
	// Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
	renderer.shadowMap.type = THREE.BasicShadowMap;

	loadMaterials();
	
	// Create a new Three.js scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color('black');

	// Add  a camera so we can view the scene
	camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 1, 4000);
	camera.position.set(0, -15, 15);
	camera.rotation.x = Math.PI/2;
	scene.add(camera);

	orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

	let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
	directionalLight.position.set(0, 50, 50);
	directionalLight.target.position.set(0, 0, 0);
	scene.add(directionalLight);

	let ambientLight = new THREE.AmbientLight (0xffffff, 0.6);
	scene.add(ambientLight);

	shipHolder = new THREE.Object3D();
	loadObj(objModelUrl, shipHolder, 0.1, 1, -8, 0, 0,Math.PI/2);

	enemy = new THREE.Object3D();
	
	for (let i = 0; i < 10; i++) {
		let temp = new THREE.Object3D();

		let enemyPos = (Math.random() * (-5)) + 5;

		loadObj(pigUrl, temp, 0.25, 0.55, 8, i, Math.PI / 2, 0);

		console.log(enemyPos);

		scene.add(temp);
		temp.posBool = false;
		temp.posBoolY = false;
		batallions.push(temp);

	}

	for (let i = 0; i < 10; i++) {
		let temp = new THREE.Object3D();
		
		let enemyPos = (Math.random()*(-5)) + 5;

		loadObj(pigUrl, temp, 0.25, 0.55, 7, i, Math.PI/2, 0);
	
		console.log(enemyPos);

		scene.add(temp);
		temp.posBool = false;
		temp.posBoolY = false;
		batallions.push(temp);

	}

	for (let i = 0; i < 10; i++) {
		let temp = new THREE.Object3D();

		let enemyPos = (Math.random() * (-5)) + 5;

		loadObj(pigUrl, temp, 0.25, 0.55, 6, i, Math.PI / 2, 0);

		console.log(enemyPos);

		scene.add(temp);
		temp.posBool = false;
		temp.posBoolY = false;
		batallions.push(temp);

	}
	console.log(batallions);

	/* let enemyType = Math.floor((Math.random() * 2) + 0);
	loadObjWithMtl(enemyModels, enemyType); */

	scene.add(shipHolder);

	let spaceGeometry = new THREE.CylinderGeometry(20, 20, 100, 30, 1, true, 0, 4);
	let space = new THREE.Mesh(spaceGeometry, materials.walls);
	space.rotation.y = Math.PI/3
	space.position.y = 20;
	scene.add(space);

	let loadedEnemy = Math.floor((Math.random() * 2) + 0);

	let enemyModelUrl = enemyModels[loadedEnemy].modelo;
	let mtlModelEnemy = enemyModels[loadedEnemy].textura;

	/* console.log(loadedEnemy);
	console.log(enemyModelUrl);
	console.log(mtlModelEnemy); */

	//Icon
	var heart = document.createElement('div');
	heart.style.position = 'absolute';
	heart.style.width = 100;
	heart.style.height = 100;
	heart.innerHTML = "♡";
	heart.style.top = 7.5 + 'px';
	heart.style.left = 50 + 'px';
	heart.style.fontSize = 100 + 'px';
	heart.style.color = '#fc3003';
	document.body.insertBefore(heart, text2);

	//Vida
	var text2 = document.createElement('div');
	text2.style.position = 'absolute';
	//text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
	text2.style.width = 100;
	text2.style.height = 100;
	text2.innerHTML = 100;
	text2.style.top = 20 + 'px';
	text2.style.left = 110 + 'px';
	text2.style.fontSize = 100+'px';
	text2.style.color= '#fc3003';
	text2.id = "vida";
	document.body.appendChild(text2);

	var points = document.createElement('div');
	points.style.position = 'absolute';
	points.style.width = 100;
	points.style.height = 100;
	points.innerHTML = score;
	points.style.top = 20 + 'px';
	points.style.right = 300 + 'px';
	points.style.fontSize = 60 + 'px';
	points.style.color = '#e8e8e8';
	points.id = "points";
	document.body.appendChild(points);

}

let timer = 100;

function animate() {
	let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
	let fract = deltat / 50;

	timer-= 0.1;
	console.log(timer);
	if(timer <= 0){
		timer = 100;
		for (let i = 0; i < 10; i++) {
			let temp = new THREE.Object3D();
	
			let enemyPos = (Math.random() * (-5)) + 5;
	
			loadObj(pigUrl, temp, 0.25, 0.55, 6, i, Math.PI / 2, 0);
	
			console.log(enemyPos);
	
			scene.add(temp);
			temp.posBool = false;
			temp.posBoolY = false;
			batallions.push(temp);
	
		}
	}

	let scoreText = document.getElementById("points");
	
	

	if(dKey && wKey) {
		if(shipHolder.position.x < 12 && shipHolder.position.y < 7) {
			moveRightUp();
		}
	} else if (dKey && sKey) {
		if(shipHolder.position.x < 12 && shipHolder.position.y > -9) {
			moveRightDown();
		}
	} else if (aKey && wKey) {
		if(shipHolder.position.x > -12 && shipHolder.position.y < 7) {
			moveLeftUp();
		}
	} else if (aKey && sKey) {
		if(shipHolder.position.x > -12 && shipHolder.position.y > -9) {
			moveLeftDown();
		}
	} else if(dKey) {
		if(shipHolder.position.x < 12) {
			moveRight();
		}
	} else if(aKey) {
		if(shipHolder.position.x > -12) {
			moveLeft();
		}
	} else if(wKey) {
		if(shipHolder.position.y < 7) {
			moveUp();
		}
	} else if(sKey) {
		if(shipHolder.position.y > -9) {
			moveDown();
		}
	}

	projectilesCounter.forEach((proj, index, array) => {
		if(Date.now() - proj.life > 1000) {
			scene.remove(proj.obj);
			array.splice(index, 1);
		}
		//Calculo de colision con las palomas
		batallions.forEach((paloma, index2, array2) =>{
			//Ver boundries
			if(proj.obj.position.x <= (paloma.position.x + 0.3)
			&& proj.obj.position.x >= (paloma.position.x - 0.3)
			&& proj.obj.position.y <= (paloma.position.y + 0.3)
			&& proj.obj.position.y >= (paloma.position.y - 0.3)){
				console.log("Le di a paloma "+index2);
				scene.remove(paloma);
				scene.remove(proj.obj);
				array.splice(index, 1);
				array2.splice(index2, 1);
				score += 1;
				scoreText.innerHTML = score; 
			}
		})
		proj.obj.position.y += fract*3 
	});

	for (let x = 0; x < batallions.length; x++) {
		const element = batallions[x];

		let upPosition = 0.05;
		if(element.posBool == false){
			element.position.x -= upPosition;
		}
		else if(element.posBool == true){
			element.position.x += upPosition;
		}

		if( element.position.x <= -13){
			element.posBool = true;
			element.position.y -= 1;
		}
		else if (element.position.x >= 13){
			element.posBool = false;
			element.position.y -= 1;
		}

	}
	//console.log(vida);

	floorUniforms.time.value += fract/10;
}

function moveRight() {
	let move = new KF.KeyFrameAnimator;
	move.init({ 
		interps:
			[
				{ 
					keys:[0, 1], 
					values:[
						{x : shipHolder.position.x},
						{x : shipHolder.position.x + 1},
					],
					target:shipHolder.position
				},
			],
		loop: false,
		duration: moveSpeed
	});
	move.start();
}

function moveLeft() {
	let move = new KF.KeyFrameAnimator;
	move.init({ 
		interps:
			[
				{ 
					keys:[0, 1], 
					values:[
						{x : shipHolder.position.x},
						{x : shipHolder.position.x - 1},
					],
					target:shipHolder.position
				},
			],
		loop: false,
		duration: moveSpeed
	});
	move.start();
}

function moveUp() {
	let move = new KF.KeyFrameAnimator;
	move.init({ 
		interps:
			[
				{ 
					keys:[0, 1], 
					values:[
						{y : shipHolder.position.y},
						{y : shipHolder.position.y + 1},
					],
					target:shipHolder.position
				},
			],
		loop: false,
		duration: moveSpeed
	});
	move.start();
}

function moveDown() {
	let move = new KF.KeyFrameAnimator;
	move.init({ 
		interps:
			[
				{ 
					keys:[0, 1], 
					values:[
						{y : shipHolder.position.y},
						{y : shipHolder.position.y - 1},
					],
					target:shipHolder.position
				},
			],
		loop: false,
		duration: moveSpeed
	});
	move.start();
}

function moveRightUp() {
	let move = new KF.KeyFrameAnimator;
	move.init({ 
		interps:
			[
				{ 
					keys:[0, 1], 
					values:[
						{x : shipHolder.position.x, y : shipHolder.position.y},
						{x : shipHolder.position.x + 1, y : shipHolder.position.y + 1},
					],
					target:shipHolder.position
				},
			],
		loop: false,
		duration: moveSpeed
	});
	move.start();
}

function moveRightDown() {
	let move = new KF.KeyFrameAnimator;
	move.init({ 
		interps:
			[
				{ 
					keys:[0, 1], 
					values:[
						{x : shipHolder.position.x, y : shipHolder.position.y},
						{x : shipHolder.position.x + 1, y : shipHolder.position.y - 1},
					],
					target:shipHolder.position
				},
			],
		loop: false,
		duration: moveSpeed
	});
	move.start();
}

function moveLeftUp() {
	let move = new KF.KeyFrameAnimator;
	move.init({ 
		interps:
			[
				{ 
					keys:[0, 1], 
					values:[
						{x : shipHolder.position.x, y : shipHolder.position.y},
						{x : shipHolder.position.x - 1, y : shipHolder.position.y + 1},
					],
					target:shipHolder.position
				},
			],
		loop: false,
		duration: moveSpeed
	});
	move.start();
}

function moveLeftDown() {
	let move = new KF.KeyFrameAnimator;
	move.init({ 
		interps:
			[
				{ 
					keys:[0, 1], 
					values:[
						{x : shipHolder.position.x, y : shipHolder.position.y},
						{x : shipHolder.position.x - 1, y : shipHolder.position.y - 1},
					],
					target:shipHolder.position
				},
			],
		loop: false,
		duration: moveSpeed
	});
	move.start();
}

function shoot() {
	let geometry = new THREE.SphereGeometry(0.2, 32, 32);
	let material = new THREE.MeshBasicMaterial({color: "red"});

	let projectile = new THREE.Mesh(geometry, material);

	projectile.position.set(shipHolder.position.x, shipHolder.position.y, shipHolder.position.z);
	projectilesCounter.push({obj: projectile, life: Date.now()});
	scene.add(projectile);
	console.log(projectilesCounter);
}

function shootWaifu(){

}