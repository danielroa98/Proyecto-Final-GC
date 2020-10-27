let renderer = null;
let scene = null;
let camera = null;
let orbitControls = null;
let cube = null;

function initControls() {
	document.addEventListener("keydown", (e) => {
		if(e.key == "d") {
			cube.position.x += 0.5;
		} else if(e.key == "a") {
			cube.position.x -= 0.5;
		}
	});

	document.addEventListener("keydown", (e) => {
		if(e.key == "w") {
			cube.position.y += 0.5;
		} else if(e.key == "s") {
			cube.position.y -= 0.5;
		}
	});
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

	let cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
	let cubeTexture = new THREE.MeshPhongMaterial({color: "blue"});
	cube = new THREE.Mesh(cubeGeometry, cubeTexture);;

	scene.add(cube)
}