// src/main.ts

import * as THREE from 'three';
import './style.css';
import fragment from './shaders/fragment.frag';
import vertex from './shaders/vertex.glsl';
import simvertex from './shaders/simvert.glsl';
import simfragment from './shaders/simfragment.glsl';
import composables from './composables';

function resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer) {
	const canvas = renderer.domElement;
	const pixelRatio = window.devicePixelRatio;
	const width = (canvas.clientWidth * pixelRatio) | 0;
	const height = (canvas.clientHeight * pixelRatio) | 0;
	const needResize = canvas.width !== width || canvas.height !== height;
	if (needResize) {
		renderer.setSize(width, height, false);
	}
	return needResize;
}

const audioContext = new AudioContext();
const audioElement = document.querySelector('audio');

// Check if audioContext or audio element is properly initialized
if (!audioContext || !audioElement) {
	throw new Error('AudioContext is not supported');
}

function main() {
	if (!audioContext || !audioElement) {
		throw new Error('AudioContext is not supported');
	}

	// window.addEventListener('keydown', (e) => {
	// 	const key: string = e.key;

	// 	if (key == 's') {
	// 		if (audioContext.state === 'suspended') {
	// 			audioContext.resume();
	// 		}

	// 		if (isPlayed === false) {
	// 			audioElement.play();
	// 			isPlayed = true;
	// 		} else {
	// 			audioElement.pause();
	// 			isPlayed = false;
	// 		}
	// 	}
	// });

	const canvas: HTMLCanvasElement | null =
		document.querySelector<HTMLCanvasElement>('canvas');

	// checks whether the canvas exists
	if (canvas === null) {
		throw new Error('CANVAS ELEMENT DOES NOT EXIST');
	}

	// rederer
	const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

	// camera
	const fov = 75;
	const aspect = 2; // the canvas default
	const near = 0.1;
	const far = 100;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

	//camera position
	camera.position.z = 3;

	// audio shit
	const audioListener = new THREE.AudioListener();
	camera.add(audioListener);
	const sound = new THREE.Audio(audioListener);
	const audioLoader = new THREE.AudioLoader();
	let isPlayed = false;
	audioLoader.load('./src/assets/SlickBack.mp3', (buffer) => {
		sound.setBuffer(buffer);
		window.addEventListener('click', () => {
			if (isPlayed == false) {
				console.log('test');

				sound.play();
				isPlayed = true;
			} else {
				sound.pause();
				isPlayed = false;
			}
		});
	});

	const analyser = new THREE.AudioAnalyser(sound, 32);

	//scene
	const scene = new THREE.Scene();

	// light
	const color = 0xffffff;
	const intensity = 3;
	const light = new THREE.DirectionalLight(color, intensity);
	light.position.set(-1, 2, 4);
	scene.add(light);

	//shape
	const geo = new THREE.PlaneGeometry(35, 35, 30, 30);
	const shapeMaterial = new THREE.ShaderMaterial({
		wireframe: false,
		side: THREE.DoubleSide,
		uniforms: {
			uFreq: { value: 0.0 },
			u_resolution: {
				value: new THREE.Vector2(),
			}, // This will be automatically set by Three.js
			time: { value: 0.0 }, // Initialize time to 0
			uPositions: { value: null },
		},
		transparent: true,
		vertexShader: vertex,
		fragmentShader: fragment,
	});

	// uniform variables
	const canvasSize = new THREE.Vector2(canvas.width, canvas.height);
	shapeMaterial.uniforms.u_resolution.value.copy(canvasSize);

	// scene.add(Mesh);

	// renderer
	renderer.render(scene, camera);

	// fbo shit starts here
	let fbo = getRenderTarget();
	let fbo1 = getRenderTarget();
	const size = 256;
	const fboScene = new THREE.Scene();
	const fboCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
	fboCamera.position.set(0, 0, 0.5);
	fboCamera.lookAt(0, 0, 0);
	const fboGeometry = new THREE.PlaneGeometry(2, 2);

	const data = new Float32Array(size * size * 4);

	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {
			let index = (i + j * size) * 4;
			let theta = Math.random() * Math.PI * 2;
			let r = 0.5 + 0.5 * Math.random();
			data[index + 0] = r * Math.cos(theta);
			data[index + 1] = r * Math.sin(theta);
			data[index + 2] = 1;
			data[index + 3] = 1;
		}
	}

	const fboTexture = new THREE.DataTexture(
		data,
		size,
		size,
		THREE.RGBAFormat,
		THREE.FloatType
	);

	fboTexture.magFilter = THREE.NearestFilter;
	fboTexture.minFilter = THREE.NearestFilter;
	fboTexture.needsUpdate = true;

	const fboMaterial = new THREE.ShaderMaterial({
		uniforms: {
			uPositions: { value: fboTexture },
			uInfo: { value: null },
			time: { value: 0 },
			uFreq: { value: 0.0 },
			uMouse: { value: new THREE.Vector2(0, 0) },
			resolution: { value: new THREE.Vector4() },
		},
		vertexShader: simvertex,
		fragmentShader: simfragment,
	});

	// ray caster
	const raycaster = new THREE.Raycaster();
	const pointer = new THREE.Vector2();

	function rayCasting() {
		const dummy = new THREE.Mesh(
			new THREE.PlaneGeometry(100, 100),
			new THREE.MeshBasicMaterial()
		);

		document.addEventListener('pointermove', (e) => {
			pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
			pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

			raycaster.setFromCamera(pointer, camera);
			let intersects = raycaster.intersectObject(dummy);
			if (intersects.length > 0 && intersects[0].point !== undefined) {
				let { x, y }: THREE.Vec2 = intersects[0].point;
				fboMaterial.uniforms.uMouse.value = new THREE.Vector2(x, y);
			}
		});
	}

	// fbo texture for uInfo
	const infoArray = new Float32Array(size * size * 4);

	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {
			let index = (i + j * size) * 4;

			infoArray[index + 0] = 0.5 + Math.random();
			infoArray[index + 1] = 0.5 + Math.random();
			infoArray[index + 2] = 1;
			infoArray[index + 3] = 1;
		}
	}

	const info = new THREE.DataTexture(
		infoArray,
		size,
		size,
		THREE.RGBAFormat,
		THREE.FloatType
	);

	info.magFilter = THREE.NearestFilter;
	info.minFilter = THREE.NearestFilter;
	info.needsUpdate = true;
	fboMaterial.uniforms.uInfo.value = info;

	// fbo info ends

	const fboMesh = new THREE.Mesh(fboGeometry, fboMaterial);
	fboScene.add(fboMesh);

	renderer.setRenderTarget(fbo);
	renderer.render(fboScene, fboCamera);
	renderer.setRenderTarget(fbo1);
	renderer.render(fboScene, fboCamera);

	// fbo ends

	// time
	const clock = new THREE.Clock();

	function getRenderTarget() {
		if (canvas === null) {
			throw new Error('CANVAS ELEMENT DOES NOT EXIST');
		}

		const renderTarget = new THREE.WebGLRenderTarget(
			canvas.width,
			canvas.height,
			{
				minFilter: THREE.NearestFilter,
				magFilter: THREE.NearestFilter,
				format: THREE.RGBAFormat,
				type: THREE.FloatType,
			}
		);
		return renderTarget;
	}

	// about fbo shit
	const count = size ** 2;
	let geometry = new THREE.BufferGeometry();
	let postions = new Float32Array(count * 3);
	// dapat 2 to dati testing ko lang
	let uv = new Float32Array(count * 3);
	for (let i = 0; i < size; i++) {
		for (let k = 0; k < size; k++) {
			let index = i + k * size;
			postions[index * 3 + 0] = Math.random();
			postions[index * 3 + 1] = Math.random();
			postions[index * 3 + 2] = 0;
			uv[index * 2 + 0] = i / size;
			uv[index * 2 + 1] = k / size;
		}
	}

	geometry.setAttribute('position', new THREE.BufferAttribute(postions, 3));
	geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));

	shapeMaterial.uniforms.uPositions.value = fboTexture;
	const points = new THREE.Points(geometry, shapeMaterial);
	scene.add(points);

	// animation
	async function render() {
		const deltaTime = clock.getDelta();

		if (isPlayed == true) {
			const average = analyser.getAverageFrequency();
			console.log(average);

			shapeMaterial.uniforms.uFreq.value = 1.0;
			fboMaterial.uniforms.uFreq.value = 1.0;
		} else {
			shapeMaterial.uniforms.uFreq.value = 1.0;
			fboMaterial.uniforms.uFreq.value = 1.0;
		}

		// resizes the display
		rayCasting();
		if (resizeRendererToDisplaySize(renderer)) {
			const canvas = renderer.domElement;
			camera.aspect = canvas.width / canvas.height;
			camera.updateProjectionMatrix();
		}
		requestAnimationFrame(render);
		shapeMaterial.uniforms.time.value += 0.05;
		fboMaterial.uniforms.time.value += 0.05;

		fboMaterial.uniforms.uPositions.value = fbo1.texture;
		shapeMaterial.uniforms.uPositions.value = fbo.texture;

		renderer.setRenderTarget(fbo);
		renderer.render(fboScene, fboCamera);
		renderer.setRenderTarget(null);
		renderer.render(scene, camera);

		let temp = fbo;
		fbo = fbo1;
		fbo1 = temp;

		if (canvas == null) {
			throw new Error('CANVAS DOES NOT EXIST');
		}
		const resolution = new THREE.Vector2(canvas.width, canvas.height);
		shapeMaterial.uniforms.u_resolution.value.copy(resolution);
	}

	requestAnimationFrame(render);
}

main();
