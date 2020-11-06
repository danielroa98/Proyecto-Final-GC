let renderer = null;
let scene = null;
let camera = null;
let orbitControls = null;
let cube = null;

let objLoader = null;
let objModelUrl = {obj:'../models/pingu.obj', map:'../models/pingu_tex.bmp'};
let shipHolder = null;

let wKey = false, sKey = false, aKey = false, dKey = false;

let moveSpeed = 33;

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

async function loadObj(objModelUrl) {
	const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

	try {
		const object = await objPromiseLoader.load(objModelUrl.obj);
		
		let texture = objModelUrl.hasOwnProperty('map') ? new THREE.TextureLoader().load(objModelUrl.map) : null;
		
		object.traverse(function (child) {
			if (child instanceof THREE.Mesh) {
				child.material.map = texture;
				child.scale.set(0.1, 0.1, 0.1);
				child.rotation.y = Math.PI/2
				child.position.y = -8
			}
		});
		shipHolder.add(object);

	}
	catch (err) {
		return onError(err);
	}
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
	
	// Create a new Three.js scene
	scene = new THREE.Scene();
	let sceneBackgound = new THREE.TextureLoader().load("./img/field.jpg")
	scene.background = sceneBackgound;

	// Add  a camera so we can view the scene
	camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 1, 4000);
	camera.position.set(0, 0, 25);
	scene.add(camera);

	orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

	let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
	directionalLight.position.set(0, 50, 50)
	directionalLight.target.position.set(0, 0, 0);
	scene.add(directionalLight)

	let ambientLight = new THREE.AmbientLight (0xffffff, 0.2);
	scene.add(ambientLight);

	shipHolder = new THREE.Object3D();
	loadObj(objModelUrl);

	scene.add(shipHolder);
}

function animate() {
	if(dKey && wKey) {
		if(shipHolder.position.x < 19 && shipHolder.position.y < 15) {
			moveRightUp();
		}
	} else if (dKey && sKey) {
		if(shipHolder.position.x < 19 && shipHolder.position.y > -1) {
			moveRightDown();
		}
	} else if (aKey && wKey) {
		if(shipHolder.position.x > -19 && shipHolder.position.y < 15) {
			moveLeftUp();
		}
	} else if (aKey && sKey) {
		if(shipHolder.position.x > -19 && shipHolder.position.y > -1) {
			moveLeftDown();
		}
	} else if(dKey) {
		if(shipHolder.position.x < 19) {
			moveRight()
		}
	} else if(aKey) {
		if(shipHolder.position.x > -19) {
			moveLeft()
		}
	} else if(wKey) {
		if(shipHolder.position.y < 15) {
			moveUp()
		}
	} else if(sKey) {
		if(shipHolder.position.y > -1) {
			moveDown()
		}
	}
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