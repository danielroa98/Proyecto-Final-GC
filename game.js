let renderer = null;
let scene = null;
let camera = null;
let orbitControls = null;
let cube = null;

let materials = null;

let floorUniforms = null;

let objLoader = null;

let objModelUrl = {obj:'../models/pingu.obj', map:'../models/pingu_tex.bmp'};
let shipHolder = null;

let enemy = null;
pigUrl = {obj: '../models/pigeon.obj', map : '../models/pigeon_tex.jpg'};

let wKey = false, sKey = false, aKey = false, dKey = false;

let moveSpeed = 33;

let projectilesCounter = [];

let currentTime = Date.now()

//Load chicken with gun .obj and .mtl
let objChickenGun = "../models/Chickens/chicken_w_gun.obj";
let mtlChickenGun = "../models/Chickens/chicken_w_gun.mtl";

//Load chicken with knife .obj and .mtl
let objChickenKnife = "../models/Chickens/chicken_w_knife.obj";
let mtlChickenKnife = "../models/Chickens/chicken_w_knife.mtl";

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

async function loadObj(objModelUrl, holder, scale, yPos, xRot, yRot) {
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

		holder.position.y = yPos
		holder.add(object);

	}
	catch (err) {
		return onError(err);
	}
}

function loadObjWithMtl(objChickenGun, mtlChickenGun) {
	mtlLoader = new THREE.MTLLoader();

	mtlLoader.load(mtlModelUrl, materials => {

		materials.preload();
		console.log(materials);

		objLoader = new THREE.OBJLoader();

		objLoader.setMaterials(materials);

		objLoader.load(objModelUrl, object => {
			object.traverse(function (child) {
				if (child.isMesh) {
					child.geometry.computeVertexNormals();
					// child.geometry.computeBoundingBox();
				}
			});

			objectList.push(object);
			object.position.y -= 3;
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
	loadObj(objModelUrl, shipHolder, 0.1, -8, 0,Math.PI/2);

	enemy = new THREE.Object3D();
	loadObj(pigUrl, enemy, 0.25, 6, Math.PI/2, 0)

	scene.add(shipHolder);
	scene.add(enemy);

	let spaceGeometry = new THREE.CylinderGeometry(20, 20, 100, 30, 1, true, 0, 4);
	let space = new THREE.Mesh(spaceGeometry, materials.walls);
	space.rotation.y = Math.PI/3
	space.position.y = 20;
	scene.add(space);
}

function animate() {
	let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / 50;

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

	projectilesCounter.forEach((proj) => {
		if(Date.now() - proj.life > 1000) {
			scene.remove(proj.obj);
		}

		proj.obj.position.y += fract*3 
	});

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
	let geometry = new THREE.SphereGeometry(0.1, 32, 32);
	let material = new THREE.MeshBasicMaterial({color: "red"});

	let projectile = new THREE.Mesh(geometry, material);

	projectile.position.set(shipHolder.position.x, shipHolder.position.y, 0);
	projectilesCounter.push({obj: projectile, life: Date.now()});
	scene.add(projectile);
}