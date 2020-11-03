let renderer = null;
let scene = null;
let camera = null;
let orbitControls = null;
let cube = null;

let objLoader = null;
let objModelUrl = {obj:'../models/pingu.obj', map:'../models/pingu_tex.bmp'};
let shipHolder = null;

function initControls() {
	document.addEventListener("keydown", (e) => {
		if(e.key == "d") {
			shipHolder.position.x += 0.5;
		} else if(e.key == "a") {
			shipHolder.position.x -= 0.5;
		}
	});

	document.addEventListener("keydown", (e) => {
		if(e.key == "w") {
			shipHolder.position.y += 0.5;
		} else if(e.key == "s") {
			shipHolder.position.y -= 0.5;
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
				child.scale.set(0.5, 0.5, 0.5);
				child.rotation.y = -Math.PI/2
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