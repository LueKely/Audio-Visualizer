// src/main.ts

import * as THREE from 'three';
import './style.css';
import fragment from './shaders/fragment.frag';
import vertex from './shaders/vertex.glsl';
import simvertex from './shaders/simvert.glsl';
import simfragment from './shaders/simfragment.glsl';

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
// audio ctx
const trackWrapper = document.querySelectorAll('.trackItem');

const audioContext = new AudioContext();
const audioElement: NodeListOf<HTMLAudioElement> =
	document.querySelectorAll('audio');

const trackList = Array.from(audioElement).map((elem) => {
	return audioContext.createMediaElementSource(elem);
});

// analyser stuff
const analyser = audioContext.createAnalyser();
analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

// connecting stuff

trackWrapper.forEach((wrapper, index) => {
	wrapper.addEventListener('click', () => {
		trackList[index].connect(audioContext.destination);
		trackList[index].connect(analyser);
		audioElement[index].play();

		// disconnects all other tracks that isnt this one
		trackList.forEach((track, kindex) => {
			if (track.context != null && kindex != index) {
				track.disconnect(audioContext.destination);
				track.disconnect(analyser);
				audioElement[kindex].pause();
				audioElement[kindex].currentTime = 0;
			}
			return;
		});
	});
});

function main() {
	const canvas: HTMLCanvasElement | null =
		document.querySelector<HTMLCanvasElement>('canvas');

	// checks whether the canvas exists
	if (canvas === null) {
		throw new Error('CANVAS ELEMENT DOES NOT EXIST');
	}

	// rederer
	const renderer = new THREE.WebGLRenderer({
		antialias: true,
		canvas,
		alpha: true,
	});

	// camera
	const fov = 75;
	const aspect = 2; // the canvas default
	const near = 0.1;
	const far = 100;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

	//camera position
	camera.position.z = 3;

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
	// 256 dati
	const size = 128;
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

		// scene.add(dummy);

		let rect = renderer.domElement.getBoundingClientRect();

		if (canvas == null) throw new Error('Canvas not found');

		canvas.addEventListener('pointermove', (e) => {
			pointer.x = ((e.clientX - rect.left) / (rect.width - rect.left)) * 2 - 1;
			pointer.y = -((e.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1;

			raycaster.setFromCamera(pointer, camera);
			let intersects = raycaster.intersectObject(dummy, false);
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
	let uv = new Float32Array(count * 2);
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
		analyser.getByteTimeDomainData(dataArray);

		console.log(dataArray);

		// render stuff
		if (resizeRendererToDisplaySize(renderer)) {
			const canvas = renderer.domElement;
			camera.aspect = canvas.width / canvas.height;
			camera.updateProjectionMatrix();
		}

		// shapeMaterial.uniforms.uFreq.value = frequency;
		// fboMaterial.uniforms.uFreq.value = frequency;

		// init raycasting
		rayCasting();

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

		requestAnimationFrame(render);
	}

	requestAnimationFrame(render);
}

main();
